import styles from './App.module.css';
import '@features/pages';
import '@features/update-alert/UpdateAlert';

const App = () => {
  return (
    <div className={styles.App}>
      {/* <StartPage /> */}
      {/* <ResultPage /> */}
    </div>
  );
}

// 誤って編集内容が失われるのを防ぐため、ページの離脱を警告
window.addEventListener('beforeunload',(e)=>{
  e.preventDefault();
});

export default App;