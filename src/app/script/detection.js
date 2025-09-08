// detection.js

// Preload TensorFlow and MediaPipe models
const _cocoModelPromise = cocoSsd.load();
const _faceMeshModelPromise = faceLandmarksDetection.load(
  faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
);
const _selfieSegmentation = new SelfieSegmentation({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
});
_selfieSegmentation.setOptions({ modelSelection: 1 });

/**
 * detectFaces(imageData)
 * - 入力画像からCOCO-SSDで人物を検出し、
 *   score >= 0.5 のボックスを Face インスタンスに変換して返す。
 */
export async function detectFaces(imageData) {
  const cocoModel = await _cocoModelPromise;
  const predictions = await cocoModel.detect(imageData);
  const faces = predictions
    .filter((p) => p.class === 'person' && p.score >= 0.5)
    .map((p) => new Face(imageData, p.bbox));
  return faces;
}

class Face {
  // プライベート変数
  #imageData;
  #bbox;
  #processed = false;
  #landmarks = null;
  #segmentationBorder = null;
  #contour = null;
  #bodyBorder = null;
  #angle = { x: 0, y: 0, z: 0 };
  #features = {
    eyes: null,
    nose: null,
    mouth: null,
    eyebrows: null,
    eyebags: null,
  };

  /**
   * constructor(imageData: ImageData, bbox: [x,y,w,h])
   */
  constructor(imageData, bbox) {
    this.#imageData = imageData;
    this.#bbox = bbox;
    this.#init();
  }

  // 初期化処理：Web Workerではなく同一スレッドで直列に実行
  async #init() {
    try {
      const [x, y, w, h] = this.#bbox;

      // 顔切り出し用Canvas
      const faceCanvas = new OffscreenCanvas(w, h);
      const faceCtx = faceCanvas.getContext('2d');
      faceCtx.putImageData(this.#imageData, -x, -y);

      // 1. Face Landmarks Detection
      const facemesh = await _faceMeshModelPromise;
      const results = await facemesh.estimateFaces({
        input: faceCanvas,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: false,
      });
      this.#landmarks = results[0]?.scaledMesh || [];

      // 2. 顔の傾きを算出
      this.#angle = computeFaceAngle(this.#landmarks);

      // 3. Selfie Segmentation で人物マスク取得→境界線抽出
      this.#segmentationBorder = await this.#selfieSegmentation(
        this.#imageData
      );

      // 4. 輪郭／体境界線を計算
      this.#contour = this.#landmarks.map((p) => [
        p[0] + x,
        p[1] + y,
        p[2] || 0,
      ]);
      this.#bodyBorder = refineBodyBorder(
        this.#segmentationBorder,
        this.#landmarks
      );

      // 5. 各パーツ境界抽出
      this.#features.eyes = extractEyeContours(
        this.#landmarks,
        x,
        y
      );
      this.#features.nose = extractNoseContour(
        this.#landmarks,
        x,
        y
      );
      this.#features.mouth = extractMouthContour(
        this.#landmarks,
        x,
        y
      );
      this.#features.eyebrows = extractEyebrowsContour(
        this.#landmarks,
        x,
        y
      );
      this.#features.eyebags = extractEyebagsContour(
        this.#landmarks,
        x,
        y
      );

      this.#processed = true;
    } catch (e) {
      console.error('Face init failed:', e);
      this.#processed = false;
    }
  }

  /** hasProcessed(): boolean */
  hasProcessed() {
    return this.#processed;
  }

  /** faceAngle(): [x°, y°, z°] */
  faceAngle() {
    return [this.#angle.x, this.#angle.y, this.#angle.z];
  }

  /** isFaceTouched([px,py]): boolean */
  isFaceTouched([px, py]) {
    return pointInPolygon([px, py], this.contour());
  }

  // プライベート：Selfie Segmentation + GLSL 境界抽出
  async #selfieSegmentation(imageData) {
    return new Promise((resolve) => {
      _selfieSegmentation.onResults((results) => {
        const mask = results.segmentationMask;
        const border = extractBorderFromMask(mask);
        resolve(border);
      });
      _selfieSegmentation.send({ image: imageData });
    });
  }

  /** body(): [ [x,y], ... ] */
  body() {
    if (!this.#bodyBorder) throw new Error('body not found');
    return this.#bodyBorder;
  }

  /** contour(): [ [x,y,z], ... ] */
  contour() {
    if (!this.#contour) throw new Error('contour not found');
    return this.#contour;
  }

  /** eyes(): { left: [...], right: [...] } */
  eyes() {
    if (!this.#features.eyes) throw new Error('eyes not found');
    return this.#features.eyes;
  }

  /** nose(): [ [x,y,z], ... ] */
  nose() {
    if (!this.#features.nose) throw new Error('nose not found');
    return this.#features.nose;
  }

  /** mouth(): [ [x,y,z], ... ] */
  mouth() {
    if (!this.#features.mouth) throw new Error('mouth not found');
    return this.#features.mouth;
  }

  /** eyebrows(): { left: [...], right: [...] } */
  eyebrows() {
    if (!this.#features.eyebrows) throw new Error('eyebrows not found');
    return this.#features.eyebrows;
  }

  /** eyebags(): { left: [...], right: [...] } */
  eyebags() {
    if (!this.#features.eyebags) throw new Error('eyebags not found');
    return this.#features.eyebags;
  }
}

// --- ユーティリティ関数群 ---

// 点 in 多角形
function pointInPolygon(pt, vs) {
  let x = pt[0],
    y = pt[1],
    inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1],
      xj = vs[j][0],
      yj = vs[j][1];
    const intersect =
      yi > y !== yj > y &&
      x <
        ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// 顔の傾きをランドマークから推定
function computeFaceAngle(mesh) {
  // 例: 左目(33) 右目(263) 鼻先(1) のベクトルから単純推定
  if (mesh.length < 300) return { x: 0, y: 0, z: 0 };
  const L = mesh[33],
    R = mesh[263],
    N = mesh[1];
  const dx = R[0] - L[0],
    dy = R[1] - L[1],
    dz = R[2] - L[2];
  const yaw = Math.atan2(dy, dx) * (180 / Math.PI);
  const pitch = Math.atan2(N[1] - (L[1] + R[1]) / 2, dz) * (180 / Math.PI);
  return { x: pitch, y: yaw, z: 0 };
}

// マスク画像から境界線を抽出
function extractBorderFromMask(maskImage) {
  const w = maskImage.width,
    h = maskImage.height;
  const ctx = new OffscreenCanvas(w, h).getContext('2d');
  ctx.drawImage(maskImage, 0, 0);
  const img = ctx.getImageData(0, 0, w, h).data;
  const border = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4 + 3;
      const a = img[idx] / 255;
      if (a > 0.5) {
        // 任意の隣接ピクセルに背景があれば境界
        const neighbors = [
          img[idx - 4] / 255,
          img[idx + 4] / 255,
          img[idx - w * 4] / 255,
          img[idx + w * 4] / 255,
        ];
        if (neighbors.some((na) => na <= 0.5)) border.push([x, y]);
      }
    }
  }
  return border;
}

// セグメンテーション境界＋ランドマークで体領域を精度向上
function refineBodyBorder(segBorder, landmarks) {
  // 簡易: segBorder をそのまま返す
  return segBorder;
}

// 各パーツ抽出：ランドマークのインデックス参照
function extractEyeContours(mesh, ox, oy) {
  const LEFT = [33, 133, 144, 163, 7, 33];
  const RIGHT = [263, 362, 373, 390, 249, 263];
  return {
    left: LEFT.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]),
    right: RIGHT.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]),
  };
}
function extractNoseContour(mesh, ox, oy) {
  const IDX = [1, 2, 98, 327, 168];
  return IDX.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]);
}
function extractMouthContour(mesh, ox, oy) {
  const IDX = [61, 291, 78, 308, 13, 14, 87];
  return IDX.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]);
}
function extractEyebrowsContour(mesh, ox, oy) {
  const LEFT = [70, 63, 105, 66, 107];
  const RIGHT = [300, 293, 334, 296, 336];
  return {
    left: LEFT.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]),
    right: RIGHT.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]),
  };
}
function extractEyebagsContour(mesh, ox, oy) {
  const LEFT = [145, 159, 23, 24, 110];
  const RIGHT = [374, 386, 351, 352, 337];
  return {
    left: LEFT.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]),
    right: RIGHT.map((i) => [mesh[i][0] + ox, mesh[i][1] + oy, mesh[i][2] || 0]),
  };
}