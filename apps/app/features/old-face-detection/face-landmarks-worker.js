import '@debug';
import '@tensorflow/tfjs';
import '@mediapipe/tasks-vision';

// モデルのインスタンスをWorkerスコープで保持し、再利用します
let model = null;

/**
 * Face Landmarkerモデルをロードします。
 * 虹彩検出(predictIrises: true)を有効にしてロードします。
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
      {
        maxFaces: 1, // 処理対象は顔1つ
        predictIrises: true // 虹彩検出を有効化
      }
    );
  } catch (error) {
    console.error('Face Landmarkerモデルのロードに失敗しました。', error);
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
    const faces = await model.estimateFaces({
      input: imageData,
      flipHorizontal: false
    });

    // 顔が検出されなかった場合はエラーを通知します
    if (faces.length === 0) {
      throw new Error('画像から顔を検出できませんでした。');
    }

    const keypoints = faces[0].keypoints;

    // --- 各パーツの座標を抽出・整形します ---

    // 既存のパーツ
    const contour = keypoints.filter(p => p.name && p.name.startsWith('faceOval')).map(p => [p.x, p.y, p.z]);
    const leftEye = keypoints.filter(p => p.name && p.name.startsWith('leftEye')).map(p => [p.x, p.y, p.z]);
    const rightEye = keypoints.filter(p => p.name && p.name.startsWith('rightEye')).map(p => [p.x, p.y, p.z]);
    const leftEyebrow = keypoints.filter(p => p.name && p.name.startsWith('leftEyebrow')).map(p => [p.x, p.y, p.z]);
    const rightEyebrow = keypoints.filter(p => p.name && p.name.startsWith('rightEyebrow')).map(p => [p.x, p.y, p.z]);
    const nose = keypoints.filter(p => p.name && p.name.startsWith('nose')).map(p => [p.x, p.y, p.z]);
    const mouth = keypoints.filter(p => p.name && p.name.startsWith('lips')).map(p => [p.x, p.y, p.z]);

    // [仕様変更] 虹彩(Iris)の座標を抽出します
    const leftIris = keypoints.filter(p => p.name && p.name.startsWith('leftIris')).map(p => [p.x, p.y, p.z]);
    const rightIris = keypoints.filter(p => p.name && p.name.startsWith('rightIris')).map(p => [p.x, p.y, p.z]);

    // 仕様書に基づき、目元の明暗から涙袋の境界を検出します
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
        irisCoords: { left: leftIris, right: rightIris }, // 虹彩データを追加
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
 * @param {ImageData} imageData - 顔領域全体の ImageData
 * @param {object} eyes - { left: [{x,y},...], right: [{x,y},...] }  各目のランドマーク（画像座標）
 * @param {object} [opts] - オプション
 *   opts.roiPadding: 目下 ROI の上下左右余白（ピクセル, デフォルト: 8）
 *   opts.minWidth: ROI の最小幅（ピクセル, デフォルト: 12）
 *   opts.smoothRadius: 平滑化カーネル半径（デフォルト: 3）
 * @returns {object} { left: [{x,y},...], right: [{x,y},...] }
 */
function detectEyebags(imageData, eyes, opts) {
  opts = Object.assign({ roiPadding: 8, minWidth: 12, smoothRadius: 3 }, opts || {});

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // 画像情報
  const W = imageData.width;
  const H = imageData.height;
  const data = imageData.data;

  // ランドマーク配列からバウンディングボックスを作る
  function bboxFromPoints(points) {
    if (!points || points.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  // ROI を決める（目の下：上下方向はランドマークの高さの比で拡張）
  function computeEyeROI(eyePoints) {
    const bb = bboxFromPoints(eyePoints);
    if (!bb) return null;
    const centerY = (bb.minY + bb.maxY) / 2;
    // 目下を伸ばす：下に多めに伸ばす
    const pad = opts.roiPadding;
    const roiMinX = Math.floor(clamp(bb.minX - pad, 0, W - 1));
    const roiMaxX = Math.ceil(clamp(bb.maxX + pad, 0, W - 1));
    // 上端は目の下少し上から、下端は目の高さに応じて伸ばす
    const roiMinY = Math.floor(clamp(bb.minY - pad * 0.2, 0, H - 1));
    const roiMaxY = Math.ceil(clamp(bb.maxY + pad * 2.0, 0, H - 1));
    const width = Math.max(opts.minWidth, roiMaxX - roiMinX);
    return { x: roiMinX, y: roiMinY, w: width, h: roiMaxY - roiMinY };
  }

  // ImageData 内の (x,y) の輝度を返す
  function luminanceAt(x, y) {
    x = Math.floor(x); y = Math.floor(y);
    const idx = (y * W + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // ROI をグレースケール配列として抽出（row-major: rows x cols）
  function extractGrayROI(roi) {
    const rows = roi.h;
    const cols = roi.w;
    const gray = new Float32Array(rows * cols);
    for (let ry = 0; ry < rows; ry++) {
      const y = roi.y + ry;
      for (let cx = 0; cx < cols; cx++) {
        const x = roi.x + cx;
        gray[ry * cols + cx] = luminanceAt(x, y);
      }
    }
    return { gray, rows, cols };
  }

  // 垂直方向（上下）の勾配を sobel風に簡易計算：Gy = I(y+1)-I(y-1)
  function verticalGradient(gray, rows, cols) {
    const Gy = new Float32Array(rows * cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const above = r <= 0 ? gray[c] : gray[(r - 1) * cols + c];
        const below = r >= rows - 1 ? gray[(rows - 1) * cols + c] : gray[(r + 1) * cols + c];
        Gy[r * cols + c] = below - above;
      }
    }
    return Gy;
  }

  // 各列ごとに最大勾配位置を探す（エッジが上向きか下向きかを考慮）
  function findEdgePolyline(Gy, rows, cols, roi) {
    const edgeYs = new Array(cols).fill(null);
    for (let c = 0; c < cols; c++) {
      // 列 c の勾配列をスキャンして、絶対値が最大の位置を採る
      let bestR = -1;
      let bestVal = -Infinity;
      for (let r = 1; r < rows - 1; r++) {
        const val = Math.abs(Gy[r * cols + c]);
        if (val > bestVal) {
          bestVal = val;
          bestR = r;
        }
      }
      if (bestR >= 0) {
        edgeYs[c] = bestR + roi.y; // 画像座標系の y
      } else {
        edgeYs[c] = null;
      }
    }

    // 外れ値除去：連続した null は補間し、小さなスパイクを除去する
    // 1) 線形補間で短い欠損を埋める
    function linearFill(arr) {
      let i = 0;
      while (i < arr.length) {
        if (arr[i] == null) {
          let j = i + 1;
          while (j < arr.length && arr[j] == null) j++;
          // if edges at both ends exist and gap small, interpolate
          if (i > 0 && j < arr.length && (j - i) <= 6) {
            const a = arr[i - 1], b = arr[j];
            for (let k = i; k < j; k++) {
              const t = (k - i + 1) / (j - i + 1);
              arr[k] = a * (1 - t) + b * t;
            }
          }
          i = j;
        } else i++;
      }
    }
    linearFill(edgeYs);

    // 2) 簡単な中央値フィルタでスパイク除去
    const smoothed = edgeYs.slice();
    const r = Math.max(1, Math.floor(opts.smoothRadius));
    for (let i = 0; i < edgeYs.length; i++) {
      const window = [];
      for (let k = Math.max(0, i - r); k <= Math.min(edgeYs.length - 1, i + r); k++) {
        if (edgeYs[k] != null) window.push(edgeYs[k]);
      }
      if (window.length > 0) {
        window.sort((a, b) => a - b);
        smoothed[i] = window[Math.floor(window.length / 2)];
      } else {
        smoothed[i] = null;
      }
    }

    // 出力を画像座標の点配列に変換（x,y）
    const points = [];
    for (let c = 0; c < cols; c++) {
      const y = smoothed[c];
      if (y != null) {
        const x = roi.x + c;
        points.push({ x: x, y: y });
      }
    }
    return points;
  }

  // メイン処理：左右の目それぞれ処理
  function processEye(eyePoints) {
    const roi = computeEyeROI(eyePoints);
    if (!roi || roi.w <= 0 || roi.h <= 0) return [];
    const { gray, rows, cols } = extractGrayROI(roi);
    const Gy = verticalGradient(gray, rows, cols);
    const poly = findEdgePolyline(Gy, rows, cols, roi);
    // 最終的に、目の幅外の極端な点を削る（ランドマーク幅に近いもののみ残す）
    const bb = bboxFromPoints(eyePoints);
    const minX = Math.max(0, Math.floor(bb.minX - opts.roiPadding));
    const maxX = Math.min(W - 1, Math.ceil(bb.maxX + opts.roiPadding));
    const filtered = poly.filter(p => p.x >= minX && p.x <= maxX);
    return filtered;
  }

  return {
    left: processEye(eyes.left || []),
    right: processEye(eyes.right || [])
  };
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