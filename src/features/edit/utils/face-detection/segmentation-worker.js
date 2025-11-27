/**
 * segmentation-worker.js
 * Web Worker for MediaPipe Selfie Segmentation.
 */

// 必要なライブラリをWorkerのスコープにインポートします
importScripts(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js'
);

// セグメンテーションモデルのインスタンスをWorkerスコープで保持します
let segmenter = null;

/**
 * MediaPipe Selfie Segmentationモデルを初期化します。
 * 初回呼び出し時のみ実行されます。
 */
function initializeSegmenter() {
  if (segmenter) {
    return;
  }
  
  try {
    // SelfieSegmentationのインスタンスを生成します
    segmenter = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
      }
    });

    // モデルのオプションを設定します (0: generalモデル)
    segmenter.setOptions({
      modelSelection: 0, 
    });

  } catch (error) {
    console.error('Selfie Segmentationモデルの初期化に失敗しました。', error);
    throw error; // エラーをonmessageハンドラに伝播させます
  }
}

/**
 * メインスレッドからのメッセージを受信した際の処理です。
 */
self.onmessage = async (event) => {
  const imageData = event.data.image;
  const { width, height } = imageData;

  try {
    // モデルを初期化します
    initializeSegmenter();
    if (!segmenter) {
      throw new Error('セグメンテーションモデルが利用できません。');
    }

    // MediaPipeのAPIはPromiseを返さないため、Promiseでラップします
    const results = await new Promise((resolve, reject) => {
      segmenter.onResults((res) => {
        if (res.segmentationMask) {
          resolve(res);
        } else {
          reject(new Error('セグメンテーションマスクを生成できませんでした。'));
        }
      });
      // 処理を開始します
      segmenter.send({ image: imageData });
    });

    // --- 結果の処理 ---
    // results.segmentationMask は ImageBitmap です
    const maskBitmap = results.segmentationMask;

    // 1. マスク画像のImageDataを生成します
    const maskCanvas = new OffscreenCanvas(width, height);
    const maskCtx = maskCanvas.getContext('2d');
    maskCtx.drawImage(maskBitmap, 0, 0, width, height);
    const maskImageData = maskCtx.getImageData(0, 0, width, height);

    // 2. 背景除去済みの画像を生成します
    const segmentedCanvas = new OffscreenCanvas(width, height);
    const segmentedCtx = segmentedCanvas.getContext('2d');
    
    // 元の画像を描画します
    segmentedCtx.putImageData(imageData, 0, 0);
    
    // 合成モードを設定し、マスク（人物部分）のみを残します
    segmentedCtx.globalCompositeOperation = 'destination-in';
    segmentedCtx.drawImage(maskBitmap, 0, 0, width, height);
    
    const segmentedImageData = segmentedCtx.getImageData(0, 0, width, height);
    
    // --- メインスレッドへの送信 ---
    const result = {
      image: segmentedImageData,
      mask: maskImageData
    };

    // 処理結果をメインスレッドに転送します
    self.postMessage(
      { result: result },
      [result.image.data.buffer, result.mask.data.buffer]
    );

  } catch (error) {
    // 処理中にエラーが発生した場合、その内容をメインスレッドに通知します
    console.error('Workerでのセグメンテーション処理中にエラーが発生しました。', error);
    self.postMessage({ error: error.message || '不明なWorkerエラーが発生しました。' });
  }
};
