import '@debug';
import { createRoot } from 'react-dom/client';
import '@fontsource/hachi-maru-pop';
import App from './app/App';
import { registerSW } from 'virtual:pwa-register';

// プラグインでPWAのService Workerを登録
registerSW({
  immediate: true,
});

// レンダリング
const root = createRoot(document.getElementById('root')!);
root.render(<App />);