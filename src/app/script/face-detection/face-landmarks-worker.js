/**
 * face-landmarks-worker.js
 * Web Worker for face landmark and eyebag detection.
 */

// 必要なライブラリをWorkerのスコープにインポートします
importScripts(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0',
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection'
);

// モデルのインスタンスをWorkerスコープで保持し、再利用します
let model = null;

/**
 * Face Landmarks Detectionモデルをロードします。
 * 初回呼び出し時のみロード処理を実行します。
 */
async function loadModel() {
  // モデルが既にロード済みの場合は何もしません
  if (model) {
    return;
  }
  
  // モデルをロードし、インスタンスをグローバル変数に格納します
  try {
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1 } // 処理対象は顔1つなので、パフォーマンスのために最大数を1に設定します
    );
  } catch (error) {
    console.error('Face Landmarks Detectionモデルのロードに失敗しました。', error);
    // エラーが発生した場合は、メインスレッドに通知します
    self.postMessage({ error: 'モデルのロードに失敗しました。' });
  }
}

/**
 * メインスレッドからのメッセージを受信した際の処理です。
 * @param {MessageEvent} event - メインスレッドから渡されたイベントオブジェクト。
 * @param {ImageData} event.data.image - 処理対象の画像データ。
 */
self.onmessage = async (event) => {
  const imageData = event.data.image;

  try {
    // モデルがロード済みであることを確認します
    await loadModel();
    if (!model) {
      throw new Error('モデルが利用できません。');
    }

    // 画像データから顔のランドマークを推定します
    const faces = await model.estimateFaces({ input: imageData });

    // 顔が検出されなかった場合はエラーを通知します
    if (faces.length === 0) {
      throw new Error('画像から顔を検出できませんでした。');
    }

    const keypoints = faces[0].keypoints;

    // 各パーツの座標を抽出・整形します
    const contour = keypoints.filter(p => p.name && p.name.startsWith('faceOval')).map(p => [p.x, p.y, p.z]);
    const leftEye = keypoints.filter(p => p.name && p.name.startsWith('leftEye')).map(p => [p.x, p.y, p.z]);
    const rightEye = keypoints.filter(p => p.name && p.name.startsWith('rightEye')).map(p => [p.x, p.y, p.z]);
    const leftEyebrow = keypoints.filter(p => p.name && p.name.startsWith('leftEyebrow')).map(p => [p.x, p.y, p.z]);
    const rightEyebrow = keypoints.filter(p => p.name && p.name.startsWith('rightEyebrow')).map(p => [p.x, p.y, p.z]);
    const nose = keypoints.filter(p => p.name && p.name.startsWith('nose')).map(p => [p.x, p.y, p.z]);
    const mouth = keypoints.filter(p => p.name && p.name.startsWith('lips')).map(p => [p.x, p.y, p.z]);

    // 仕様書に基づき、目元の明暗から涙袋の境界を検出します
    // (これは高度な画像処理であり、ここではそのロジックを担う関数を呼び出す conceptually な実装です)
    const eyebags = detectEyebags(imageData, { leftEye, rightEye });

    // 3Dキーポイントから顔の傾きを計算します
    const angle = calculateFaceAngle(keypoints);
    
    // 処理結果を整形してメインスレッドに送信します
    self.postMessage({
      results: {
        contourCoords: contour,
        eyesCoords: { left: leftEye, right: rightEye },
        noseCoords: nose,
        mouthCoords: mouth,
        eyebrowsCoords: { left: leftEyebrow, right: rightEyebrow },
        eyebagsCoords: eyebags,
        faceAngle: angle
      }
    });

  } catch (error) {
    // 処理中にエラーが発生した場合、その内容をメインスレッドに通知します
    console.error('Workerでの顔パーツ検出中にエラーが発生しました。', error);
    self.postMessage({ error: error.message });
  }
};

/**
 * 目元のランドマークと画像データから涙袋の境界線を検出します。
 * 仕様: 目元の明暗の境界から検出する。
 * この関数は、指定された領域内の輝度変化を分析し、エッジを検出する簡易的な実装です。
 *
 * @param {ImageData} imageData - 顔部分の画像データ。
 * @param {object} eyes - 左右の目のランドマーク座標。
 * @returns {object} 左右の涙袋の座標配列 { left: [...], right: [...] }。
 */
function detectEyebags(imageData, eyes) {
  // TODO: 涙袋検出の高度な画像処理アルゴリズムを実装します。
  // 1. 目の下の領域(ROI)を特定する。
  // 2. ROIをグレースケール化し、輝度データを取得する。
  // 3. 輝度の勾配が最大になる水平ライン(エッジ)を探索する。
  // 4. 検出されたエッジの座標を返す。
  
  // 以下はダミーの戻り値です
  return { left: [], right: [] };
}

/**
 * 3Dランドマークから顔の傾き(オイラー角)を推定します。
 *
 * @param {Array} keypoints - ランドマーク配列。各要素は {x, y, z} または [x, y, z]。
 * @returns {object} 回転角度 { x: rollDeg, y: pitchDeg, z: yawDeg } （度）
 */
function calculateFaceAngle(keypoints, options = {}) {
  if (!Array.isArray(keypoints) || keypoints.length === 0) {
    throw new Error('keypoints must be a non-empty array');
  }

  // ユーティリティ
  const toPoint = (p) => {
    if (Array.isArray(p)) return { x: p[0], y: p[1], z: p[2] ?? 0 };
    return { x: p.x ?? 0, y: p.y ?? 0, z: p.z ?? 0 };
  };
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
  const mul = (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s });
  const norm = (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1e-9;
  const normalize = (v) => {
    const n = norm(v);
    return { x: v.x / n, y: v.y / n, z: v.z / n };
  };
  const cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  });
  const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const toDeg = (r) => (r * 180) / Math.PI;

  // MediaPipe FaceMesh の代表的インデックス（使うランドマークのインデックス）
  const idx = {
    leftEye: 33,
    rightEye: 263,
    noseTip: 1,
    chin: 152,
  };

  // 安全にランドマークを取得（存在しない場合は centroid を使って近似）
  const getLandmark = (i) => {
    if (i != null && i >= 0 && i < keypoints.length) return toPoint(keypoints[i]);
    // fallback: compute centroid
    let cx = 0, cy = 0, cz = 0;
    for (let p of keypoints) {
      const q = toPoint(p);
      cx += q.x; cy += q.y; cz += q.z;
    }
    const n = keypoints.length;
    return { x: cx / n, y: cy / n, z: cz / n };
  };

  const leftEye = getLandmark(idx.leftEye);
  const rightEye = getLandmark(idx.rightEye);
  const nose = getLandmark(idx.noseTip);
  const chin = getLandmark(idx.chin);

  // 基本ベクトル
  const eyeMid = mul(add(leftEye, rightEye), 0.5);
  const eyeVec = sub(rightEye, leftEye); // 右方向ベクトル（ローカル）
  const noseVec = sub(nose, eyeMid);      // 前方を向くベクトル（鼻先方向）
  const chinVec = sub(chin, eyeMid);

  // forward ベクトル（顔が向いている方向）と right, up を定義
  let forward = normalize(noseVec);
  // もし forward が不安定なら chin を使う
  if (norm(forward) < 1e-4) forward = normalize(chinVec);

  let right = normalize(eyeVec);
  // up は forward と right の外積
  let up = normalize(cross(forward, right));
  // 再正規化 right を up と forward から作り直す（直交基底）
  right = normalize(cross(up, forward));

  // Euler 推定（Tait-Bryan ZYX に近い解釈で計算）
  // yaw: y 軸周り（左右向き）
  // pitch: x 軸周り（上下向き）
  // roll: z 軸周り（傾き）
  // ここでは forward をカメラ座標系の「前方（z）」とみなし計算する
  const fx = forward.x, fy = forward.y, fz = forward.z;

  // 数値的安定化
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // yaw: 左右（右が正）
  const yaw = Math.atan2(fx, fz);
  // pitch: 上下（上を見ると負か正かは定義次第。ここでは上を見ると負になるように asin(-fy) を用いる）
  const pitch = Math.asin(clamp(-fy, -1, 1));
  // roll: 顔の回転（左右の目線差から近似）
  // right ベクトルと水平面（y=0）成分を利用して roll を推定
  const roll = Math.atan2(right.y, right.x);

  return {
    x: toDeg(roll),   // roll (around Z in this local convention)
    y: toDeg(pitch),  // pitch (around X)
    z: toDeg(yaw),    // yaw (around Y)
  };
}
