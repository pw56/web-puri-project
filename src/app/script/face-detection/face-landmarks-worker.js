/**
 * face-landmarks-worker.js
 * Web Worker for face landmark, eyebag, and iris detection.
 */

// 必要なライブラリをWorkerのスコープにインポートします
importScripts(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection/dist/face-landmarks-detection.js'
);

// モデルのインスタンスをWorkerスコープで保持し、再利用します
let model = null;

/**
 * Face Landmarks Detectionモデルをロードします。
 * 仕様変更に基づき、虹彩検出(predictIrises: true)を有効にしてロードします。
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
 * (この関数の実装は以前のものから変更ありません)
 *
 * @param {ImageData} imageData - 顔部分の画像データ。
 * @param {object} eyes - 左右の目のランドマーク座標。
 * @returns {object} 左右の涙袋の座標配列 { left: [...], right: [...] }。
 */
function detectEyebags(imageData, eyes) {
  // TODO: 涙袋検出の高度な画像処理アルゴリズムを実装します。
  // (輝度変化の分析、エッジ検出など)
  
  // 以下はダミーの戻り値です
  return { left: [], right: [] };
}

/**
 * 3Dランドマークから顔の傾き(オイラー角)を推定します。
 * (この関数の実装は以前のものから変更ありません)
 *
 * @param {Array} keypoints - 全てのランドマークキーポイント。
 * @returns {object} X, Y, Z軸周りの回転角度 { x, y, z }。
 */
function calculateFaceAngle(keypoints) {
  // TODO: 顔の傾きを計算する3Dジオメトリ計算を実装します。
  
  // 以下はダミーの戻り値です
  return { x: 0, y: 0, z: 0 };
}
