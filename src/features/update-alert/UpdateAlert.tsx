import '@debug';
import '@components/Alert';
import { AppVersionManager } from './utils/app-version-manager';

// ここに ./release/version.yml を読み込む処理
const file: File | null = ;
const result: Object = file;
const version: string = result.version || '1.0.0';
const appVersion = new AppVersionManager("window-app-version", version);

console.log(`現在のアプリのバージョン: ${appVersion.getVersion()}`);
console.log(`アップデートされたか: ${appVersion.isUpdated()}`);

// アップデートがあったら通知
useEffect(async () => {
  if(await appVersion.isUpdated()) {
    // showAlert('ここは ./release/message.md から読み込む');
  }
}, []);