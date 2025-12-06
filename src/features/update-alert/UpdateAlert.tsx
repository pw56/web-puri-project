import '@debug';
import '@components/Alert';
import { AppVersionManager } from './utils/app-version-manager';
import { fetchTextFile } from "./utils/fetch-text-file";
import 'yaml';

async function updateAlert(): Promise<void> {
  let appVersion: AppVersionManager;

  async function getVersion(): Promise<string> {
    const path: string = "/assets/release/version.yml";
    const versionText: string = await fetchTextFile(path)
    .catch((error) => {
      throw new Error(`アップデートバージョンファイルの読み取りでエラーが発生しました ${error}`);
    });

    const versionObject: Object = YAML.parse(versionText);
    const version: string = versionObject.app_version || '1.0.0';
    return version;
  }

  async function openVersionManager(): Promise<void> {
    const VERSION_ID: string = "window-app-version";
    appVersion = new AppVersionManager(VERSION_ID, await getVersion());

    console.log(`現在のアプリのバージョン: ${await appVersion.getVersion()}`);
    console.log(`アップデートされたか: ${await appVersion.isUpdated()}`);
  }

  await openVersionManager();

  // アップデートがあったら通知
  useEffect(() => {
    const checkUpdate = async () => {
      if (await appVersion.isUpdated()) {
        // useShowAlert({contentUrl: '/assets/release/message.md'});
      }
    };

    checkUpdate();
  }, []);
}

updateAlert();