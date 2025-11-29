import { createRoot } from 'react-dom/client';

import './features/pages';
import styles from './App.module.css';
import { AppVersionManager } from './app-version-manager';

// オフライン対応
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.ts')
      .then(reg => console.log('Service Workerの登録に成功', reg))
      .catch(err => console.error('Service Workerの登録に失敗:', err));
  });
}

// レンダリング
// const App = () => {
//   return (
//     <div className={styles.App}>
//       <StartPage />
//       <ResultPage />
//     </div>
//   );
// }
//
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);

// アップデートがあったら通知
// window.addEventListener('load', () => {
//   const appVersion = new AppVersionManager();
//   if(appVersion.isUpdated()) {
//     notice('ここのマークダウン形式のコンテンツは ./release/message.md から読み込む');
//   }
// });

// 誤って編集内容が失われるのを防ぐため、ページの離脱を警告
window.addEventListener('beforeunload',(e)=>{
  e.preventDefault();
})