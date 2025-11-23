import React from 'react';
import { createRoot } from 'react-dom/client';

import 'pages';
import styles from 'App.module.css';
import { AppVersionManager } from './functions/app-version-manager';

const App = () => {
  return (
    <div className={styles.App}>
      <StartPage />
      <ResultPage />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// オフライン対応
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('function/sw.ts')
      .then(reg => console.log('Service Workerの登録に成功', reg))
      .catch(err => console.error('Service Workerの登録に失敗:', err));
  });
}

// ここは新バージョンリリース時に絶対更新！
window.addEventListener('load', () => {
  const appVersion = new AppVersionManager("0.1.0-alpha");
  if(appVersion.isUpdated()) {
    // notice('新機能をリリース！', 'screenshot.png');
  }
});