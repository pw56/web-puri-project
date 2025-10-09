// COCO-SSDモデルのインスタンスをグローバルスコープで保持し、初回ロード後に再利用します
let cocoSsdModel = null;

/**
 * 入力された画像からTensorFlow.jsのCOCO-SSDモデルを用いて単数または複数の人物を検出し、
 * 検出した人物の信頼度(score)が0.5以上のものだけを対象とします。
 * 対象者ごとにFaceクラスのインスタンスを生成し、それらのインスタンスを配列で返します。
 * * @param {ImageData} imageData - 検出対象となる画像(ImageDataオブジェクト)。
 * @returns {Promise<Face[]>} 検出された顔のFaceクラスインスタンスが格納された配列。
 */
export async function detectFaces(imageData) {
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

export class Face {
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
 * [プライベートメソッド]
 * WebGLとGLSLシェーダーを用いて、セグメンテーションマスクから人物と背景の境界線を高速に抽出し、
 * 座標の配列として返します。
 * この処理はOffscreenCanvas上で行われ、DOMに影響を与えません。
 *
 * @param {ImageData} mask - 人物領域が示されたセグメンテーションマスクのImageDataオブジェクト。
 * @returns {Promise<Array<[number, number]>>} 検出された境界線の座標 `[x, y]` の配列。
 * @throws {Error} WebGLの初期化や処理に失敗した場合。
 */
async #selfieSegmentation(mask) {
  const { width, height } = mask;

  // 1. OffscreenCanvasを使用してWebGLコンテキストをセットアップします
  const canvas = new OffscreenCanvas(width, height);
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGLコンテキストの初期化に失敗しました。');
  }

  // 2. GLSLシェーダーコードをコンパイルし、WebGLプログラムを作成します
  // (シェーダーコードは'selfie-segmentation.glsl'ファイルから読み込まれる想定です)
  const vertexShader = this.#createShader(gl, gl.VERTEX_SHADER, selfieSegmentationVertexShaderSource);
  const fragmentShader = this.#createShader(gl, gl.FRAGMENT_SHADER, selfieSegmentationFragmentShaderSource);
  const program = this.#createProgram(gl, vertexShader, fragmentShader);

  // 3. 画面全体を覆う四角形(ポリゴン)の頂点データを準備します
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,   1, -1,   -1, 1,
    -1, 1,    1, -1,   1, 1,
  ]), gl.STATIC_DRAW);

  // 4. 頂点シェーダーの属性(attribute)とバッファを結びつけます
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // 5. 入力マスク画像をテクスチャとしてGPUにアップロードします
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // 6. プログラムを使用し、Uniform変数を設定します
  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, 'u_textureSize'), width, height);

  // 7. レンダリングを実行します (ここでシェーダーが全ピクセルに対して実行されます)
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // 8. レンダリング結果(境界線が白く描画された画像)をGPUから読み出します
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  // 9. ピクセルデータを走査し、白いピクセル(境界線)の座標を抽出します
  const boundaryCoordinates = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const red = pixels[(y * width + x) * 4];
      if (red === 255) {
        // Y座標を上下反転させ、通常の画像座標系に変換します
        boundaryCoordinates.push([x, height - 1 - y]);
      }
    }
  }

  return boundaryCoordinates;
}

/**
 * [プライベートヘルパー] WebGLシェーダーをコンパイルします。
 */
#createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }
  console.error('シェーダーのコンパイルに失敗しました:', gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

/**
 * [プライベートヘルパー] WebGLプログラムをリンクします。
 */
#createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }
  console.error('プログラムのリンクに失敗しました:', gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
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
}