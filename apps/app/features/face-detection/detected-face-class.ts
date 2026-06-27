import { DetectedObject } from '@tensorflow-models/coco-ssd';

// ここに座標の型

export class DetectedFace {
  // --- プライベートプロパティ ---

  #segmentedImageData: ImageData; // 背景除去済みの画像がここに入ります
  #bbox: DetectedObject;
  #croppedImage: ImageData | null;
  #isProcessed: boolean;
  #bodyCoords;
  #contourCoords;
  #eyesCoords;
  #noseCoords;
  #mouthCoords;
  #eyebrowsCoords;
  #eyebagsCoords;
  #faceAngle;
  #hairCoords;
  #irisCoords;

  /**
   * DetectedFaceクラスのコンストラクタ。
   * 実際のパーツ検出などの重い処理は、プライベートの#initializeメソッドを非同期で開始します。
   *
   * @param {ImageData} segmentedImageData - 背景が除去された画像(ImageDataオブジェクト)。
   * @param {number[]} boundingBox - COCO-SSDモデルで検出された顔のバウンディングボックス [x, y, width, height]。
   */
  constructor(segmentedImageData: ImageData, boundingBox: DetectedObject) {
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
    this.#segmentedImageData = segmentedImageData;
    this.#bbox = boundingBox;
    this.#croppedImage = this.#cropImageData(this.#segmentedImageData, this.#bbox);

    // 処理中であることを示すフラグをfalseに設定します
    this.#isProcessed = false;

    // コンストラクタの処理をブロックしないよう、完了を待ちません。
    this.#initialize();
  }

  /**
   * コンストラクタから呼び出される非同期初期化メソッド。
   */
  async #initialize() {
    try {
      // Step 1: 処理を高速化するため、バウンディングボックスを元に顔部分の画像データを切り出す
      this.#croppedImage = this.#cropImageData(this.#segmentedImageData, this.#bbox);
      if (this.#croppedImage === null) {
        throw new Error('顔領域の画像切り出しに失敗しました。');
      }

      // TODO: ここからメインのモデルを利用した抽出処理
      
    } catch (error) {
      console.error('Faceオブジェクトの初期化に失敗しました。', error);
      // 全ての結果プロパティを「失敗」を示すnullに設定する
      this.#bodyCoords = null;
      this.#contourCoords = null;
      this.#eyesCoords = null;
      this.#noseCoords = null;
      this.#mouthCoords = null;
      this.#eyebrowsCoords = null;
      this.#eyebagsCoords = null;
      this.#faceAngle = null;

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
   * @param {DetectedObject} bbox - 切り出す範囲 [x, y, width, height]。
   * @returns {ImageData | null} 切り出された新しいImageDataオブジェクト。失敗した場合はnull。
   */
  #cropImageData(sourceImageData: ImageData, bbox: DetectedObject): ImageData | null {
    const {x, y, width, height} = bbox.bbox;

    // 幅や高さが0以下の場合は処理できないためnullを返す
    if (width <= 0 || height <= 0) {
      return null;
    }

    // OffscreenCanvasを使用して、メモリ上で画像の切り出しを行う
    const canvas = new OffscreenCanvas(sourceImageData.width, sourceImageData.height);
    const ctx: OffscreenCanvasRenderingContext2D | null = canvas.getContext('2d');

    if (ctx === null) {
      return null;
    }

    // 元の画像を一旦Canvasに描画する
    ctx.putImageData(sourceImageData, 0, 0);

    // 指定されたバウンディングボックスの範囲で画像データを取得して返す
    return ctx.getImageData(x, y, width, height);
  }

  /**
   * [プライベートメソッド]
   * ランドマーク座標とセグメンテーション境界座標の間にある空間の「色の勾配」を分析し、
   * 輝度変化が最も大きい点（エッジ）に座標をスナップさせることで微細化（高精度化）します。
   *
   * @param {Array<[number, number, number]>} landmarkCoords - 顔パーツのグローバル座標配列 (例: 顔輪郭)。
   * @param {Array<[number, number]>} bodyBoundaryCoords - 体の境界線のグローバル座標配列。
   * @param {ImageData} sourceImageData - 色の勾配を分析するための元画像(背景除去済み)のImageData。
   * @param {number} snapThreshold - ランドマークと境界点を関連付ける最大距離 (ピクセル単位)。
   * @param {number} numSteps - 2点間をサンプリングする分割数。
   * @returns {Array<[number, number, number]>} 精度が向上されたグローバル座標の配列。
   */
  #refineCoordsByGradient(
    landmarkCoords: Array<[number, number, number]>, 
    bodyBoundaryCoords: Array<[number, number]>, 
    sourceImageData: ImageData,
    snapThreshold: number = 15.0,
    numSteps: number = 10 
  ): Array<[number, number, number]> {
    // ガード節: 必要なデータが不足している場合は、元の座標をそのまま返します
    if (!bodyBoundaryCoords || bodyBoundaryCoords.length === 0 || !landmarkCoords || !sourceImageData) {
      return landmarkCoords;
    }
    if (numSteps <= 0) {
      console.error('refineCoordsByGradient: numStepsは1以上である必要があります。');
      return landmarkCoords;
    }

    const refinedCoords = [];

    // ランドマークの各点について処理を実行します
    for (const landmarkPoint of landmarkCoords) {
      const [lx, ly, lz] = landmarkPoint;
      
      let minDistanceSq = Infinity;
      let nearestBodyPoint = null;

      // 1. ランドマーク点 (P_landmark) に最も近いセグメンテーション境界点 (P_body) を探します
      for (const bodyPoint of bodyBoundaryCoords) {
        const [bx, by] = bodyPoint;
        const distanceSq = (lx - bx) ** 2 + (ly - by) ** 2;
        
        if (distanceSq < minDistanceSq) {
          minDistanceSq = distanceSq;
          nearestBodyPoint = bodyPoint;
        }
      }

      const distance = Math.sqrt(minDistanceSq);

      // 2. 距離が閾値 (snapThreshold) より大きいか、近すぎる(1.0未満)場合は、
      //    関連性が低いとみなし、元の座標をそのまま採用します
      if (!nearestBodyPoint || distance > snapThreshold || distance < 1.0) {
        refinedCoords.push(landmarkPoint);
        continue;
      }

      // 3. P_landmark と P_body 間の線分上で色の勾配を分析します
      const [bx, by] = nearestBodyPoint;
      const vecX = bx - lx;
      const vecY = by - ly;

      let maxGradient = -1.0;
      let bestPoint = landmarkPoint; // 最も勾配が大きかった点（デフォルトは元の点）
      
      // 最初の点の輝度を取得
      let lastIntensity = this.#getPixelIntensity(sourceImageData, lx, ly);

      // 線分上を (numSteps) 回サンプリングします
      for (let i = 1; i <= numSteps; i++) {
        // 現在のサンプリング位置 (t = 0.0 ... 1.0)
        const t = i / numSteps;
        const currentX = lx + vecX * t;
        const currentY = ly + vecY * t;

        const currentIntensity = this.#getPixelIntensity(sourceImageData, currentX, currentY);
        
        // 1つ前の点との輝度の差（勾配）を計算します
        const gradient = Math.abs(currentIntensity - lastIntensity);

        // 勾配がこれまでの最大値を更新した場合
        if (gradient > maxGradient) {
          maxGradient = gradient;
          
          // エッジは、最も勾配が急だった2点間の中間にあると仮定します
          const prevT = (i - 1) / numSteps;
          const prevX = lx + vecX * prevT;
          const prevY = ly + vecY * prevT;
          
          // Z座標は元のランドマークのものを維持します
          bestPoint = [ (prevX + currentX) / 2, (prevY + currentY) / 2, lz ];
        }
        
        lastIntensity = currentIntensity;
      }
      
      // 4. 検出された「最もエッジらしい点」を結果として採用します
      refinedCoords.push(bestPoint);
    }
    
    return refinedCoords;
  }

  /**
   * [プライベートヘルパー]
   * ImageDataから指定された座標の輝度（Luma）を取得します。
   * @param {ImageData} imageData - ピクセルデータを保持するImageDataオブジェクト。
   * @param {number} x - X座標。
   * @param {number} y - Y座標。
   * @returns {number} 輝度 (0.0 ~ 255.0)。
   */
  #getPixelIntensity(imageData: ImageData, x: number, y: number): number {
    const { data, width, height } = imageData;
    
    // 座標を整数に丸め、画像境界内に収めます
    const xi = Math.max(0, Math.min(width - 1, Math.floor(x)));
    const yi = Math.max(0, Math.min(height - 1, Math.floor(y)));

    const i = (yi * width + xi) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 輝度計算 (Rec. 601 Luma)
    // Y' = 0.299 * R' + 0.587 * G' + 0.114 * B'
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  /**
   * 背景除去済みの画像を返します。
   * このメソッドは、背景除去済みの画像を取得するために使用します。
   *
   * @returns {ImageData} クラスのインスタンス生成時に渡された背景除去済みの画像を返します。
   */
  getSegmented(): ImageData {
    // プライベートプロパティ #segmentedImageData の値をそのまま返します。
    return this.#segmentedImageData;
  }

  /**
   * 顔のパーツの検出やセグメンテーションなど、全ての非同期処理が完了したかを返します。
   * このメソッドは、コンストラクタで開始されたバックグラウンド処理の進捗を確認するために使用できます。
   *
   * @returns {boolean} 全ての処理が完了していればtrue、まだ処理中であればfalseを返します。
   */
  hasProcessed(): boolean {
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
  getFaceAngle(): { x: number; y: number; z: number; } {
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
   * 入力された元の画像の座標が、このオブジェクトの保持している顔(Face Landmarkerモデルで検出した顔の輪郭の内側)の範囲内かを判別します。
   * 境界線上の座標も範囲内として扱います。
   *
   * @param {number[]} coordinate - 判別対象の座標 `[x, y]`。
   * @returns {boolean} 座標が顔の輪郭の内側または境界線上に重なっている場合はtrue、それ以外はfalse。
   * @throws {Error} 検出処理が完了していない場合、または顔の輪郭が検出できなかった場合にスローされます。
   */
  isFaceTouched(coordinate: number[]): boolean {
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
  getBody(): Array<[number, number]> {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    // 完了していない場合、まだ結果は利用できないため例外をスローします。
    if (!this.#isProcessed) {
      throw new Error('顔と体の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、体の輪郭の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#bodyCoords === null) {
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
  getContour(): Array<[number, number, number]> {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、顔の輪郭の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#contourCoords === null) {
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
  getEyes(): { left: Array<[number, number, number]>; right: Array<[number, number, number]>; } {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、目の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#eyesCoords === null) {
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
  getNose(): Array<[number, number, number]> {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、鼻の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#noseCoords === null) {
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
  getMouth(): Array<[number, number, number]> {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、口の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#mouthCoords === null) {
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
  getEyebrows(): { left: Array<[number, number, number]>; right: Array<[number, number, number]>; } {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、眉毛の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#eyebrowsCoords === null) {
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
  getEyebags(): { left: Array<[number, number, number]>; right: Array<[number, number, number]>; } {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、涙袋の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#eyebagsCoords === null) {
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
  getHair(): Array<[number, number]> {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、髪の毛の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#hairCoords === null) {
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
  getIris(): { left: Array<[number, number, number]>; right: Array<[number, number, number]>; } {
    // ガード節: まず、全ての非同期処理が完了しているかを確認します。
    if (!this.#isProcessed) {
      throw new Error('顔の検出処理が完了していません。hasProcessed()で完了を確認してください。');
    }

    // ガード節: 次に、虹彩の検出に成功したかを確認します。
    // プライベートプロパティが null の場合、処理は完了したものの検出に失敗したことを示します。
    if (this.#irisCoords === null) {
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
  getBbox(): number[] {
    // このメソッドは非同期処理に依存しないため、#isProcessedのチェックは不要です。
    // コンストラクタで受け取った値をそのまま返します。
    return this.#bbox;
  }
}