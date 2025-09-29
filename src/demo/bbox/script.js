const canvas = document.getElementById('out');
const ctx = canvas.getContext('2d');
const video = document.createElement('video');
video.autoplay = true;
video.playsInline = true;

let model = null;
let stream = null;

async function init() {
  model = await cocoSsd.load();
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
  video.srcObject = stream;

  video.addEventListener('loadeddata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    loop();
  });
}

async function loop() {
  // ビデオを一旦描画
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 人物検出
  const predictions = await model.detect(video);

  // 背景を塗りつぶし
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 検出されたすべての人物を残す
  for (const p of predictions) {
    if (p.class === 'person' && p.score > 0.5) {
      const [x, y, w, h] = p.bbox;
      ctx.drawImage(video, x, y, w, h, x, y, w, h);
    }
  }

  requestAnimationFrame(loop);
}

init();