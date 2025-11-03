export class AppVersionManager {
  #INITIAL_VERSION = "";
  #STORAGE_KEY = "lastVisitedVersion";
  #PREVIOUS_VERSION = localStorage.getItem(STORAGE_KEY);

  /**
   * 文字列型かチェック
   * @throw - 文字列型の例外
   */
  constructor(initialVersion) {
    if(typeof(initialVersion) !== 'string') throw new Error("入力値が文字列ではありません。");
    
    this.#INITIAL_VERSION = initialVersion;
  }

  /**
   * 現在のアプリのバージョンを取得
   * @returns {string} result - 現在のアプリのバージョン（例: "1.0.0"）
   */
  getVersion() {
    const result = localStorage.getItem(STORAGE_KEY);
    return result;
  }

  /**
   * アプリのバージョンを設定
   * @param {string} newVersion - 設定するアプリバージョン（例: "2.0.0"）
   * 
   * 文字列型かチェック
   * @throw - 文字列型の例外
   */
  setVersion(newVersion) {
    // ガード節
    if(typeof(newVersion) !== 'string') throw new Error("入力値が文字列ではありません。");

    // ガード節
    if(newVersion === getVersion()) return;

    // ローカルストレージに新しいバージョンを保存
    localStorage.setItem(STORAGE_KEY, newVersion);
  }

  /**
   * 前回アクセス時からアップデートされたかを確認
   * @returns {boolean} result - 更新されたか否か
   */
  isUpdated() {
    const result = (getVersion() !== PREVIOUS_VERSION);
    return result;
  }
};