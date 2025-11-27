import { createRoot } from 'react-dom/client';

import './features/pages';
import styles from './App.module.css';
import { AppVersionManager } from './app-version-manager';

// const App = () => {
//   return (
//     <div className={styles.App}>
//       <StartPage />
//       <ResultPage />
//     </div>
//   );
// }

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);

// オフライン対応
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.ts')
      .then(reg => console.log('Service Workerの登録に成功', reg))
      .catch(err => console.error('Service Workerの登録に失敗:', err));
  });
}

// window.addEventListener('load', () => {
//   const appVersion = new AppVersionManager();
//   if(appVersion.isUpdated()) {
//     notice('ここのマークダウン形式のコンテンツは ./release/message.md から読み込む');
//   }
// });