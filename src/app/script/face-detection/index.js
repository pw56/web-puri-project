/**
 * MediaPipe Selfie Segmentationモデルで、入力画像から背景を除去して返す。
 * (内部関数)
 *
 * @param {ImageData} image - 処理する画像
 * @returns {Promise<ImageData>} - 背景が除去された画像 (背景は透明)
 */
async function selfieSegmentation(image) {
  // 'selfieSegmenterModel' は、
  // await bodySegmentation.createSegmenter(
  //   bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
  //   { runtime: 'mediapipe', ... }
  // );
  // によって事前にロードされたモデルインスタンスと仮定します。
  
  if (!selfieSegmenterModel) {
    console.error("Selfie Segmentation model (selfieSegmenterModel) is not loaded.");
    // モデルがない場合は、空の（透明な）画像を返します。
    return new ImageData(image.width, image.height);
  }

  const segmentationConfig = {
    flipHorizontal: false, // 水平反転なし
    multiSegmentPerson: false // 単一人物モード
  };
  
  // セグメンテーションの実行
  const people = await selfieSegmenterModel.segmentPeople(image, segmentationConfig);

  if (people.length === 0) {
    // 人物が検出されなかった場合、空の（透明な）画像を返します。
    return new ImageData(image.width, image.height);
  }

  // 人物のマスク(ImageData)を取得
  const foregroundThreshold = 0.5; // 人物と判定する閾値
  const mask = await bodySegmentation.toBinaryMask(
    people,
    { r: 0, g: 0, b: 0, a: 0 }, // 背景色 (透明)
    { r: 255, g: 255, b: 255, a: 255 }, // 前景色 (白)
    false, // foregroundThresholdMask (falseで単一マスク)
    foregroundThreshold
  );

  // 元の画像(image)とマスク(mask)を合成
  const originalData = image.data;
  const maskData = mask.data;
  // 結果を格納する新しいバッファ
  const segmentedData = new Uint8ClampedArray(originalData.length);

  // ピクセルごとに処理
  for (let i = 0; i < originalData.length; i += 4) {
    // マスクが白 (maskData[i] === 255) の場合、それは前景（人物）
    if (maskData[i] === 255) { 
      segmentedData[i]     = originalData[i];     // R
      segmentedData[i + 1] = originalData[i + 1]; // G
      segmentedData[i + 2] = originalData[i + 2]; // B
      segmentedData[i + 3] = originalData[i + 3]; // A
    } 
    // 背景 (maskData[i] === 0) の場合、segmentedDataはデフォルトの (0, 0, 0, 0) [透明] のまま
  }

  // 合成されたデータから新しいImageDataオブジェクトを作成して返す
  return new ImageData(segmentedData, image.width, image.height);
}

// COCO-SSD モデル
importScripts(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd'
);

// COCO-SSDモデルのインスタンスをグローバルスコープで保持します
let cocoSsdModel = null;

/**
 * 入力された画像からまず背景を除去し、その後COCO-SSDモデルで人物を検出します。
 * 検出した人物の信頼度(score)が0.5以上のものだけを対象とします。
 * 対象者ごとにFaceクラスのインスタンスを生成し、それらのインスタンスを配列で返します。
 *
 * @param {ImageData} originalImageData - 検出対象となる元の画像(ImageDataオブジェクト)。
 * @returns {Promise<Face[]>} 検出された顔のFaceクラスインスタンスが格納された配列。
 */
export async function detectFaces(originalImageData) {
  // Step 1: 背景除去を実行します
  const segmentationResult = await selfieSegmentation(originalImageData);

  // 背景除去に失敗した場合は、処理を中断します
  if (segmentationResult === null) {
    console.error('背景除去に失敗したため、人物検出を中断します。');
    return [];
  }

  const { image: segmentedImage, mask: segmentationMask } = segmentationResult;
  
  // Step 2: 人物検出を実行します
  
  // COCO-SSDモデルがロードされていない場合、初回のみロード処理を実行します
  if (cocoSsdModel === null) {
    try {
      cocoSsdModel = await cocoSsd.load();
    } catch (error) {
      console.error('COCO-SSDモデルのロードに失敗しました。', error);
      return [];
    }
  }

  try {
    // 背景除去済みの画像を使用して、オブジェクトを検出します
    const predictions = await cocoSsdModel.detect(segmentedImage);

    // 検出結果から「人物」であり、かつ信頼度スコアが0.5以上のものだけをフィルタリングします
    const persons = predictions.filter(prediction => {
      return prediction.class === 'person' && prediction.score >= 0.5;
    });

    // Step 3: Faceクラスのインスタンスを生成します
    // フィルタリングされた各人物の情報から、Faceクラスのインスタンスを生成します
    const faces = persons.map(person => {
      // 背景除去済み画像、バウンディングボックス、セグメンテーションマスクを渡します
      return new Face(segmentedImage, person.bbox, segmentationMask);
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

  #originalImageData = null; // 背景除去済みの画像がここに入ります
  #bbox = null;
  #croppedImage = null;
  #isProcessed = false;
  #bodyCoords = null;
  #contourCoords = null;
  #eyesCoords = null;
  #noseCoords = null;
  #mouthCoords = null;
  #eyebrowsCoords = null;
  #eyebagsCoords = null;
  #faceAngle = null;
  #hairCoords = null;
  #irisCoords = null;

  /**
   * Faceクラスのコンストラクタ。
   * 実際のパーツ検出などの重い処理は、プライベートの#initializeメソッドを非同期で開始します。
   *
   * @param {ImageData} segmentedImageData - 背景が除去された画像(ImageDataオブジェクト)。
   * @param {number[]} boundingBox - COCO-SSDモデルで検出された顔のバウンディングボックス [x, y, width, height]。
   */
  constructor(segmentedImageData, boundingBox) {
    // 処理に失敗した場合に備え、結果を格納するプロパティをnullで初期化します
    this.#bodyCoords = null;
    this.#contourCoords = null;
    this.#eyesCoords = null;
    this.#noseCoords = null;
    this.#mouthCoords = null;
    this.#eyebrowsCoords = null;
    this.#eyebagsCoords = null;
    this.#faceAngle = null;
    this.#hairCoords = null;
    this.#irisCoords = null;

    // 引数として受け取った値をプライベートプロパティに保存します
    this.#originalImageData = segmentedImageData;
    this.#bbox = boundingBox;

    // 処理中であることを示すフラグをfalseに設定します
    this.#isProcessed = false;
    
    // パーツ検出、セグメンテーションなどの全ての非同期処理を開始します。
    // コンストラクタの処理をブロックしないよう、完了を待ちません。
    this.#initialize();
  }
  
  // (以下、#initialize, #cropImageData, hasProcessed, faceAngle, isFaceTouched,
  //  body, contour, eyes, nose, mouth, eyebrows, eyebags メソッドが続く...)

  // (※#initializeメソッドは、内部で #segmentationMask を使って #bodyCoords を計算し、
  //   face-landmarks-worker.jsから #irisCoords を受け取り、
  //   #bodyCoords と #contourCoords から #hairCoords を計算するように変更されます)

  /**
   * 【参考】コンストラクタから呼び出される非同期初期化メソッド。
   * 仕様書に記述されているWeb Workerの起動や画像処理をここで行います。
   * (このメソッドはコンストラクタの一部として機能するため、参考として記載します)
   */
  
  async #initialize() {
    try {
      // Step 1: 処理を高速化するため、バウンディングボックスを元に顔部分の画像データを切り出す
      this.#croppedImage = this.#cropImageData(this.#originalImageData, this.#bbox);
      if (!this.#croppedImage) {
        // 切り出しに失敗した場合はエラーをスローする
        throw new Error('顔領域の画像切り出しに失敗しました。');
      }

      // Step 2: Web Workerを起動し、並列処理を開始する
      // Worker 1: 顔のランドマーク検出 (涙袋の検出も含む)
      const landmarkPromise = new Promise((resolve, reject) => {
        // const worker1 = new Worker('face-landmarks-worker.js');
        // worker1.postMessage({ image: this.#croppedImage }, [this.#croppedImage.data.buffer]);
        // worker1.onmessage = e => resolve(e.data);
        // worker1.onerror = reject;
      });

      // Worker 2: 人物のセグメンテーション
      const segmentationPromise = new Promise((resolve, reject) => {
        // const worker2 = new Worker('segmentation-worker.js');
        // worker2.postMessage({ image: this.#croppedImage }, [this.#croppedImage.data.buffer]);
        // worker2.onmessage = e => resolve(e.data);
        // worker2.onerror = reject;
      });

      // TODO: Promise.allSettled を使用してWorkerからの結果を待つ
      // TODO: Workerから受け取った座標を、バウンディングボックスのオフセットを加えて元画像座標に変換
      // TODO: 変換した座標を各プライベートプロパティ (#contourCoords など) に保存
      // TODO: ランドマークとセグメンテーションの結果を比較し、座標精度を向上させる
      // TODO: Worker 3と#refineIris()を起動し、境界線の微細化処理を行う
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

// Faceクラスの静的プロパティとしてIris検出モデルを保持します
Face.irisModel = null;

/**
 * [プライベートメソッド]
 * MediaPipe Irisモデル（face-landmarks-detectionの機能）を使用して、
 * 顔画像から高精度な虹彩（瞳）のランドマークを検出します。
 *
 * @param {ImageData} faceImageData - 検出対象となる顔部分のImageDataオブジェクト。
 * @returns {Promise<{left: Array<[number, number, number]>, right: Array<[number, number, number]>} | false>} 
 * 左右の虹彩の座標配列を持つオブジェクト。検出に失敗した場合は false。
 */
async #refineIris(faceImageData) {
  try {
    // 1. モデルのロード（初回のみ）
    if (Face.irisModel === null) {
      // HTMLでインポート済みのfaceLandmarksDetectionを使用します
      Face.irisModel = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        {
          maxFaces: 1,
          // 虹彩検出を有効化します
          predictIrises: true
        }
      );
    }
    
    // 2. 虹彩を含む顔ランドマークの推定
    const predictions = await Face.irisModel.estimateFaces({
      input: faceImageData,
      // trueに設定すると、モデルは入力画像の向きを自動補正します
      flipHorizontal: false
    });

    if (!predictions || predictions.length === 0) {
      // 顔（虹彩）が検出できなかった場合
      return false;
    }

    const keypoints = predictions[0].keypoints;

    // 3. 虹彩のキーポイントのみを抽出・整形します
    // 'leftIris' と 'rightIris' という名前でキーポイントが取得されます
    const leftIrisCoords = keypoints
      .filter(p => p.name && p.name.startsWith('leftIris'))
      .map(p => [p.x, p.y, p.z]);
      
    const rightIrisCoords = keypoints
      .filter(p => p.name && p.name.startsWith('rightIris'))
      .map(p => [p.x, p.y, p.z]);

    // 両方の虹彩が検出できた場合のみ結果を返します
    if (leftIrisCoords.length > 0 && rightIrisCoords.length > 0) {
      return {
        left: leftIrisCoords,
        right: rightIrisCoords
      };
    } else {
      // 虹彩の座標が取得できなかった場合
      return false;
    }

  } catch (error) {
    console.error('虹彩の検出処理中にエラーが発生しました。', error);
    return false;
  }
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

  /**
 * 顔の傾き(角度)を返します。
 * 検出処理が完了していない場合や、何らかの理由で角度の検出に失敗した場合は例外をスローします。
 *
 * @returns {{x: number, y: number, z: number}} 顔の軸ごと(X, Y, Z)の傾きの角度(-180° ~ 180°)を持つオブジェクト。
 * @throws {Error} 検出処理がまだ完了していない場合、または顔の傾きの検出に失敗した場合にスローされます。
 */
  faceAngle() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します
    // 完了していない場合、まだ結果は利用できないため例外をスローします
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、角度の検出に成功したかを確認します
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します
    if (this.#faceAngle === false) {
      throw new Error('顔の傾きの検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します
    return this.#faceAngle;
  }

  /**
   * 入力された元の画像の座標が、このオブジェクトの保持している顔(Face Landmarks Detectionモデルで検出した顔の輪郭の内側)の範囲内かを判別します。
   * 境界線上の座標も範囲内として扱います。
   *
   * @param {number[]} coordinate - 判別対象の座標 `[x, y]`。
   * @returns {boolean} 座標が顔の輪郭の内側または境界線上に重なっている場合はtrue、それ以外はfalse。
   * @throws {Error} 検出処理が完了していない場合、または顔の輪郭が検出できなかった場合にスローされます。
   */
  isFaceTouched(coordinate) {
    // ガード節: 引数の形式が不正な場合は、意図しない動作を防ぐためにエラーをスローします
    if (!Array.isArray(coordinate) || coordinate.length !== 2 || typeof coordinate[0] !== 'number' || typeof coordinate[1] !== 'number') {
      throw new Error('引数が不正です。座標は [x, y] の形式で指定してください。');
    }

    // ガード節: 顔の検出処理が完了しているかを確認します
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 顔の輪郭データが正常に取得できているかを確認します
    // 失敗を示す `false` またはデータがない `null` の場合はエラーをスローします
    if (!this.#contourCoords || this.#contourCoords === false) {
      throw new Error('顔の輪郭が検出できなかったため、内外の判定ができません。');
    }

    // Point-in-Polygon アルゴリズム (Ray Casting法) を用いて内外判定を行います
    const [px, py] = coordinate;
    const vertices = this.#contourCoords; // [[x1, y1, z1], [x2, y2, z2], ...]
    let isInside = false;

    // 輪郭を形成する全ての辺に対してループ処理を行います
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      // 現在の頂点(i)と前の頂点(j)で辺を定義します
      const [xi, yi] = vertices[i];
      const [xj, yj] = vertices[j];

      // 水平な半直線（レイ）が辺と交差するかを判定します
      const doesIntersect = ((yi > py) !== (yj > py))
        && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);

      // 交差していた場合、内外の状態を反転させます
      if (doesIntersect) {
        isInside = !isInside;
      }
    }

    // 交差した回数が奇数回なら内側、偶数回なら外側となります
    return isInside;
  }

  /**
   * 検出された体全体の、背景との境界線の座標の配列を返します。
   * このデータは人物のセグメンテーション結果から生成されます。
   *
   * @returns {Array<[number, number]>} 検出された体全体の境界線の座標 `[x, y]` が格納された配列。
   * @throws {Error} 検出処理がまだ完了していない場合、または体の検出に失敗した場合にスローされます。
   */
  body() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    // 完了していない場合、まだ結果は利用できないため例外をスローします。
    if (!this.#isProcessed) {
      throw new Error('顔と体の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、体の輪郭の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#bodyCoords === false) {
      throw new Error('体の輪郭の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#bodyCoords;
  }

  /**
   * 検出された顔の輪郭の座標の配列を返します。
   * このデータは顔のランドマーク検出モデルから生成されます。
   *
   * @returns {Array<[number, number, number]>} 検出された顔の輪郭の座標 `[x, y, z]` が格納された配列。
   * @throws {Error} 検出処理がまだ完了していない場合、または顔の輪郭の検出に失敗した場合にスローされます。
   */
  contour() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、顔の輪郭の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#contourCoords === false) {
      throw new Error('顔の輪郭の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#contourCoords;
  }

  /**
 * 左右の目の縁（目と肌の境目）の座標を、"left"と"right"のキーを持つオブジェクトとして返します。
 * 'left'と'right'は、本人（検出対象）視点での左右を示します。
 *
 * @returns {{left: Array<[number, number, number]>, right: Array<[number, number, number]>}} 左右の目の縁の座標 `[x, y, z]` が格納された配列を持つオブジェクト。
 * @throws {Error} 検出処理がまだ完了していない場合、または目の検出に失敗した場合にスローされます。
 */
  eyes() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、目の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#eyesCoords === false) {
      throw new Error('目の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#eyesCoords;
  }

  /**
 * 肌と鼻の境界線の座標の配列を返します。
 *
 * @returns {Array<[number, number, number]>} 鼻の縁（鼻と肌の境目）の座標 `[x, y, z]` が格納された配列。
 * @throws {Error} 検出処理がまだ完了していない場合、または鼻の検出に失敗した場合にスローされます。
 */
  nose() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、鼻の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#noseCoords === false) {
      throw new Error('鼻の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#noseCoords;
  }

  /**
 * 肌と口の境界線の座標の配列を返します。
 *
 * @returns {Array<[number, number, number]>} 口の縁（口と肌の境目）の座標 `[x, y, z]` が格納された配列。
 * @throws {Error} 検出処理がまだ完了していない場合、または口の検出に失敗した場合にスローされます。
 */
  mouth() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、口の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#mouthCoords === false) {
      throw new Error('口の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#mouthCoords;
  }

  /**
 * 左右の眉毛の上下を含めた全体の縁（眉毛と肌の境目）の座標を、"left"と"right"のキーを持つオブジェクトとして返します。
 * 'left'と'right'は、本人（検出対象）視点での左右を示します。
 *
 * @returns {{left: Array<[number, number, number]>, right: Array<[number, number, number]>}} 左右の眉毛の縁の座標 `[x, y, z]` が格納された配列を持つオブジェクト。
 * @throws {Error} 検出処理がまだ完了していない場合、または眉毛の検出に失敗した場合にスローされます。
 */
  eyebrows() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、眉毛の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#eyebrowsCoords === false) {
      throw new Error('眉毛の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#eyebrowsCoords;
  }

  /**
 * 左右の涙袋の縁（涙袋と肌の境目）の座標を、"left"と"right"のキーを持つオブジェクトとして返します。
 * 'left'と'right'は、本人（検出対象）視点での左右を示します。
 * このデータは、顔のランドマーク検出後に実行される独自の画像処理によって生成されます。
 *
 * @returns {{left: Array<[number, number, number]>, right: Array<[number, number, number]>}} 左右の涙袋の縁の座標 `[x, y, z]` が格納された配列を持つオブジェクト。
 * @throws {Error} 検出処理がまだ完了していない場合、または涙袋の検出に失敗した場合にスローされます。
 */
  eyebags() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、涙袋の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#eyebagsCoords === false) {
      throw new Error('涙袋の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#eyebagsCoords;
  }

  /**
   * 検出された髪の毛（人物セグメンテーションと顔輪郭の差分）の座標の配列を返します。
   *
   * @returns {Array<[number, number]>} 検出された髪の毛の領域の座標 `[x, y]` が格納された配列。
   * @throws {Error} 検出処理がまだ完了していない場合、または髪の毛の検出に失敗した場合にスローされます。
   */
  hair() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、髪の毛の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#hairCoords === false) {
      throw new Error('髪の毛の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#hairCoords;
  }

  /**
   * 左右の虹彩（瞳）の中心と縁の座標を、"left"と"right"のキーを持つオブジェクトとして返します。
   * 'left'と'right'は、本人（検出対象）視点での左右を示します。
   *
   * @returns {{left: Array<[number, number, number]>, right: Array<[number, number, number]>}} 左右の虹彩の座標 `[x, y, z]` が格納された配列を持つオブジェクト。
   * @throws {Error} 検出処理がまだ完了していない場合、または虹彩の検出に失敗した場合にスローされます。
   */
  iris() {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、虹彩の検出に成功したかを確認します。
    // プライベートプロパティが false の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#irisCoords === false) {
      throw new Error('虹彩の検出に失敗しました。');
    }

    // 上記のチェックを通過した場合、有効なデータが存在するため、
    // プライベートプロパティに保存されている値を返します。
    return this.#irisCoords;
  }

  /**
   * このFaceインスタンスが対象としている顔のバウンディングボックスを返します。
   * この座標は、COCO-SSDによって検出された時点のものです。
   *
   * @returns {number[]} バウンディングボックスの座標 `[x, y, width, height]`。
   */
  bbox() {
    // このメソッドは非同期処理に依存しないため、#isProcessedのチェックは不要です。
    // コンストラクタで受け取った値をそのまま返します。
    return this.#bbox;
  }
}
