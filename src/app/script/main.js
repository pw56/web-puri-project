// React呼び出し
import "../style/main.js";

import "face-detection/index.js";
import "face-editing/index.js";
import "output/index.js";
import "app-version-manager/index.js";

// オフライン対応
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registered!', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}

// Reactの仮想DOMのページ読み込み時
// ここは新バージョンリリース時に絶対更新！
() => {
  const appVersion = new AppVersionManager("1.0.0");
  if(appVersion.isUpdated()) {
    // notice関数でポップアップ
  }
}