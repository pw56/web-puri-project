import { createRoot } from 'react-dom/client';
import App from './App';

// レンダリング
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// オフライン対応
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.ts')
      .then(reg => console.log('Service Workerの登録に成功', reg))
      .catch(err => console.error('Service Workerの登録に失敗:', err));
  });
}