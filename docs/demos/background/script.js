let video, can, ctx;
window.addEventListener('load', async function (event) {
  video = document.querySelector('.video');
  can = document.querySelector('.can');
  ctx = can.getContext('2d');

  const selfieSegmentation = new SelfieSegmentation({
    locateFile: function (file) {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
    }
  });
  selfieSegmentation.setOptions({
    //0:一般的なモデルを使用、1:ランドスケープモデルを使用
    modelSelection: 0,
  });
  selfieSegmentation.onResults(onResults);
  const camera = new Camera(video, {
    onFrame: async function () {
      await selfieSegmentation.send({ image: video });
    },
    width: 640,
    height: 480
  });
  camera.start();
});

function onResults(results) {
  ctx.save();
  //既存のキャンバスのコンテンツの上に新しい図形を描画(既定)
  ctx.globalCompositeOperation = 'source-over';
  //透明な黒で塗りつぶす
  ctx.clearRect(0, 0, can.width, can.height);
  //人物のセグメンテーションを描画
  ctx.drawImage(results.segmentationMask, 0, 0, can.width, can.height);

  //透明でない部分だけ描画
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(results.image, 0, 0, can.width, can.height);

  //現在イメージの領域のみが描画され重なった部分は新規イメージとなる。
  //つまり、透明部分のみに描画される
  ctx.globalCompositeOperation = 'destination-atop';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, can.width, can.height);

  ctx.restore();
}
