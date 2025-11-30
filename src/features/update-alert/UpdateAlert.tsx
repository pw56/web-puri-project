import '@components/Alert';
import { AppVersionManager } from './utils/app-version-manager';

// アップデートがあったら通知
window.addEventListener('load', () => {
  const appVersion = new AppVersionManager('ここは ./release/version.yml から読み込む');
  if(appVersion.isUpdated()) {
    // notice('ここは ./release/message.md から読み込む');
  }
});