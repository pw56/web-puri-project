// COCO-SSDモデルのインスタンスをグローバルスコープで保持し、初回ロード後に再利用します
let cocoSsdModel = null;

/**
 * 入力された画像からTensorFlow.jsのCOCO-SSDモデルを用いて単数または複数の人物を検出し、
 * 検出した人物の信頼度(score)が0.5以上のものだけを対象とします。
 * 対象者ごとにFaceクラスのインスタンスを生成し、それらのインスタンスを配列で返します。
 * * @param {ImageData} imageData - 検出対象となる画像(ImageDataオブジェクト)。
 * @returns {Promise<Face[]>} 検出された顔のFaceクラスインスタンスが格納された配列。
 */
async function detectFaces(imageData) {
  // ガード節: imageDataが無効な場合は、エラーをコンソールに出力し、空の配列を返します
  if (!imageData || typeof imageData.width !== 'number' || typeof imageData.height !== 'number') {
    console.error('Error: detectFacesに無効なImageDataオブジェクトが渡されました。');
    return [];
  }

  // モデルがまだロードされていない場合、初回のみロード処理を実行します
  if (cocoSsdModel === null) {
    try {
      // HTMLでインポート済みのcocoSsdオブジェクトを使用してモデルをロードします
      cocoSsdModel = await cocoSsd.load();
    } catch (error) {
      // モデルのロードに失敗した場合は、エラーをコンソールに出力し、処理を中断します
      console.error('COCO-SSDモデルのロードに失敗しました。', error);
      return [];
    }
  }

  try {
    // COCO-SSDモデルを使用して、画像からオブジェクトを検出します
    const predictions = await cocoSsdModel.detect(imageData);

    // 検出結果から「人物」であり、かつ信頼度スコアが0.5以上のものだけをフィルタリングします
    const persons = predictions.filter(prediction => {
      // 'prediction.class'が'person'であり、'prediction.score'が0.5以上であることを確認します
      return prediction.class === 'person' && prediction.score >= 0.5;
    });

    // フィルタリングされた各人物の情報から、Faceクラスのインスタンスを生成します
    const faces = persons.map(person => {
      // 'person.bbox'には[x, y, width, height]の形式でバウンディングボックスの情報が格納されています
      return new Face(imageData, person.bbox);
    });

    return faces;
  } catch (error) {
    // オブジェクト検出処理中にエラーが発生した場合、エラーをコンソールに出力します
    console.error('人物の検出処理中にエラーが発生しました。', error);
    return [];
  }
}

class Face {
  // --- プライベートプロパティ ---

  // 入力された元画像と顔のバウンディングボックス
  #originalImageData = null;
  #boundingBox = null;

  // 処理効率化のために顔部分だけを切り出した画像データ
  #faceImageData = null;

  // 全ての非同期処理が完了したかを示すフラグ
  #isProcessed = false;

  // 各パーツの検出結果を格納するプロパティ (エラー時は false が代入される)
  #bodyCoords = null;
  #contourCoords = null;
  #eyesCoords = null; // { left: [[...]], right: [[...]] }
  #noseCoords = null;
  #mouthCoords = null;
  #eyebrowsCoords = null; // { left: [[...]], right: [[...]] }
  #eyebagsCoords = null; // { left: [[...]], right: [[...]] }
  #faceAngle = null;


  /**
   * Faceクラスのコンストラクタ。
   * 検出元の画像と、対象の顔のバウンディングボックスを受け取り、プロパティを初期化します。
   * 実際のパーツ検出などの重い処理は、プライベートの#initializeメソッドを呼び出すことで非同期に開始されます。
   * このコンストラクタは、インスタンスを即座に返します。
   *
   * @param {ImageData} originalImageData - 検出元の画像(ImageDataオブジェクト)。
   * @param {number[]} boundingBox - COCO-SSDモデルで検出された顔のバウンディングボックス [x, y, width, height]。
   */
  constructor(originalImageData, boundingBox) {
    // 処理に失敗した場合に備え、結果を格納するプロパティをnullで初期化します
    this.#bodyCoords = null;
    this.#contourCoords = null;
    this.#eyesCoords = null;
    this.#noseCoords = null;
    this.#mouthCoords = null;
    this.#eyebrowsCoords = null;
    this.#eyebagsCoords = null;
    this.#faceAngle = null;

    // 引数として受け取った値をプライベートプロパティに保存します
    this.#originalImageData = originalImageData;
    this.#boundingBox = boundingBox;

    // 処理中であることを示すフラグをfalseに設定します
    this.#isProcessed = false;
    
    // パーツ検出、セグメンテーションなどの全ての非同期処理を開始します。
    // コンストラクタの処理をブロックしないよう、完了を待ちません。
    this.#initialize();
  }

  /**
   * 【参考】コンストラクタから呼び出される非同期初期化メソッド。
   * 仕様書に記述されているWeb Workerの起動や画像処理をここで行います。
   * (このメソッドはコンストラクタの一部として機能するため、参考として記載します)
   */
  async #initialize() {
    try {
      // Step 1: 処理を高速化するため、バウンディングボックスを元に顔部分の画像データを切り出す
      this.#faceImageData = this.#cropImageData(this.#originalImageData, this.#boundingBox);
      if (!this.#faceImageData) {
        // 切り出しに失敗した場合はエラーをスローする
        throw new Error('顔領域の画像切り出しに失敗しました。');
      }
      
      // Step 2: Web Workerを起動し、並列処理を開始する
      // Worker 1: 顔のランドマーク検出 (涙袋の検出も含む)
      const landmarkPromise = new Promise((resolve, reject) => {
        // const worker1 = new Worker('face-landmarks-worker.js');
        // worker1.postMessage({ image: this.#faceImageData }, [this.#faceImageData.data.buffer]);
        // worker1.onmessage = e => resolve(e.data);
        // worker1.onerror = reject;
      });

      // Worker 2: 人物のセグメンテーション
      const segmentationPromise = new Promise((resolve, reject) => {
        // const worker2 = new Worker('segmentation-worker.js');
        // worker2.postMessage({ image: this.#faceImageData }, [this.#faceImageData.data.buffer]);
        // worker2.onmessage = e => resolve(e.data);
        // worker2.onerror = reject;
      });

      // TODO: Promise.allSettled を使用してWorkerからの結果を待つ
      // TODO: Workerから受け取った座標を、バウンディングボックスのオフセットを加えて元画像座標に変換
      // TODO: 変換した座標を各プライベートプロパティ (#contourCoords など) に保存
      // TODO: ランドマークとセグメンテーションの結果を比較し、座標精度を向上させる
      // TODO: Worker 3を起動し、境界線の微細化処理を行う
      // TODO: 処理に失敗した場合は、対応するプライベートプロパティに false を代入する

    } catch (error) {
      // 初期化処理中に致命的なエラーが発生した場合
      console.error('Faceオブジェクトの初期化に失敗しました。', error);
      // 全ての結果プロパティを「失敗」を示すfalseに設定する
      this.#bodyCoords = false;
      this.#contourCoords = false;
      this.#eyesCoords = false;
      this.#noseCoords = false;
      this.#mouthCoords = false;
      this.#eyebrowsCoords = false;
      this.#eyebagsCoords = false;
      this.#faceAngle = false;

    } finally {
      // 成功・失敗にかかわらず、全ての処理が完了したことを示すフラグをtrueに設定する
      this.#isProcessed = true;
    }
  }

  /**
   * 【参考】元画像から指定された範囲を切り出すヘルパーメソッド。
   * OffscreenCanvasを利用してDOMに依存せず効率的に処理します。
   *
   * @param {ImageData} sourceImageData - 切り出し元の画像データ。
   * @param {number[]} bbox - 切り出す範囲 [x, y, width, height]。
   * @returns {ImageData | null} 切り出された新しいImageDataオブジェクト。失敗した場合はnull。
   */
  #cropImageData(sourceImageData, bbox) {
    const [x, y, width, height] = bbox.map(Math.round);

    // 幅や高さが0以下の場合は処理できないためnullを返す
    if (width <= 0 || height <= 0) {
      return null;
    }

    // OffscreenCanvasを使用して、メモリ上で画像の切り出しを行う
    const canvas = new OffscreenCanvas(sourceImageData.width, sourceImageData.height);
    const ctx = canvas.getContext('2d');
    
    // 元の画像を一旦Canvasに描画する
    ctx.putImageData(sourceImageData, 0, 0);
    
    // 指定されたバウンディングボックスの範囲で画像データを取得して返す
    return ctx.getImageData(x, y, width, height);
  }

  /**
 * 顔のパーツの検出やセグメンテーションなど、全ての非同期処理が完了したかを返します。
 * このメソッドは、コンストラクタで開始されたバックグラウンド処理の進捗を確認するために使用できます。
 *
 * @returns {boolean} 全ての処理が完了していればtrue、まだ処理中であればfalseを返します。
 */
hasProcessed() {
  // プライベートプロパティ #isProcessed の値をそのまま返します。
  // このプロパティは、コンストラクタでfalseに初期化され、
  // 全ての非同期処理が完了したタイミングでtrueに設定されます。
  return this.#isProcessed;
}
}
