export function versionManager() {
  const STORAGE_KEY = "lastVisitedVersion";
  const PREVIOUS_VERSION = localStorage.getItem(STORAGE_KEY);

  return {
    getVersion() {
      return localStorage.getItem(STORAGE_KEY);
    },

    /**
     * 現在のバージョンを設定
     * @param {string} currentVersion - 現在のアプリバージョン（例: "2.0.0"）
     */
    setVersion(currentVersion) {
      // ガード節
      if(currentVersion === getVersion()) return;

      // ローカルストレージに入力されたバージョンを保存
      localStorage.setItem(STORAGE_KEY, currentVersion);
    },

    // 現在のバージョンが前回からアップデートされているかを取得
    isUpdated() {
      return (getVersion() !== PREVIOUS_VERSION);
    }
  };
};