/**
 * segmentation-worker.js
 * Web Worker for person segmentation using MediaPipe Selfie Segmentation.
 */

// 必要なライブラリをWorkerのスコープにインポートします
// TensorFlow.jsは、MediaPipeのバックエンドとして利用される可能性があるため含めています
importScripts(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js'
);

// セグメンテーションモデルのインスタンスをWorkerスコープで保持し、再利用します
let segmenter = null;

/**
 * MediaPipe Selfie Segmentationモデルをロード（初期化）します。
 * 初回呼び出し時のみ初期化処理を実行します。
 */
function initializeSegmenter() {
  // モデルが既に初期化済みの場合は何もしません
  if (segmenter) {
    return;
  }
  
  try {
    // SelfieSegmentationのインスタンスを生成します
    segmenter = new SelfieSegmentation({
      // WASMなどの関連ファイルのパスを指定します
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
      }
    });

    // モデルのオプションを設定します。
    // modelSelection: 0 は、仕様書で要求されている汎用モデル(general model)です
    segmenter.setOptions({
      modelSelection: 0, 
    });

  } catch (error) {
    console.error('Selfie Segmentationモデルの初期化に失敗しました。', error);
    // エラーが発生した場合は、メインスレッドに通知します
    self.postMessage({ error: 'モデルの初期化に失敗しました。' });
  }
}

/**
 * メインスレッドからのメッセージを受信した際の処理です。
 * @param {MessageEvent} event - メインスreadから渡されたイベントオブジェクト。
 * @param {ImageData} event.data.image - 処理対象の画像データ。
 */
self.onmessage = async (event) => {
  const imageData = event.data.image;

  try {
    // モデルが初期化済みであることを確認します
    initializeSegmenter();
    if (!segmenter) {
      throw new Error('セグメンテーションモデルが利用できません。');
    }

    // MediaPipeのAPIはPromiseを返さないため、Promiseでラップして結果を待ち受けます
    const segmentationMask = await new Promise((resolve, reject) => {
      // 結果が返ってきたときのコールバックを設定します
      segmenter.onResults((results) => {
        // 結果オブジェクトからセグメンテーションマスクを取り出します
        if (results.segmentationMask) {
          // 結果はImageBitmap形式なので、メインスレッドで扱いやすいImageData形式に変換します
          const canvas = new OffscreenCanvas(results.segmentationMask.width, results.segmentationMask.height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(results.segmentationMask, 0, 0);
          const maskImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          resolve(maskImageData);
        } else {
          // マスクが生成できなかった場合はエラーとします
          reject(new Error('セグメンテーションマスクを生成できませんでした。'));
        }
      });

      // 画像データを送信してセグメンテーション処理を開始します
      segmenter.send({ image: imageData });
    });

    // 処理結果のマスク画像をメインスレッドに送信します
    // パフォーマンス向上のため、画像バッファをコピーではなく転送(transfer)します
    self.postMessage({ mask: segmentationMask }, [segmentationMask.data.buffer]);

  } catch (error) {
    // 処理中にエラーが発生した場合、その内容をメインスレッドに通知します
    console.error('Workerでのセグメンテーション処理中にエラーが発生しました。', error);
    self.postMessage({ error: error.message });
  }
};
