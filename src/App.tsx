import styles from './App.module.css';
import '@features/pages';
import { AppVersionManager } from './app-version-manager';

const App = () => {
  return (
    <div className={styles.App}>
      {/* <StartPage /> */}
      {/* <ResultPage /> */}
    </div>
  );
}

// アップデートがあったら通知
window.addEventListener('load', () => {
  const appVersion = new AppVersionManager('ここは ./release/version.yml から読み込む');
  if(appVersion.isUpdated()) {
    // notice('ここは ./release/message.md から読み込む');
  }
});

// 誤って編集内容が失われるのを防ぐため、ページの離脱を警告
window.addEventListener('beforeunload',(e)=>{
  e.preventDefault();
});

export default App;