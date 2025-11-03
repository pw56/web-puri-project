export class AppVersionManager {
  #STORAGE_KEY = "lastVisitedVersion";
  #PREVIOUS_VERSION = localStorage.getItem(this.#STORAGE_KEY);

  /**
   * 文字列型かチェック
   * @throw 文字列型の例外
   */
  constructor(initialVersion) {
    if(typeof initialVersion !== 'string') throw new Error("入力値が文字列ではありません。");

    this.setVersion(initialVersion);
  }

  /**
   * 現在のアプリのバージョンを取得
   * @returns {string} 現在のアプリのバージョン（例: "1.0.0"）
   */
  getVersion() {
    const result = localStorage.getItem(this.#STORAGE_KEY);
    return result;
  }

  /**
   * 前回アクセス時からアップデートされたかを確認
   * @returns {boolean} 更新されたか否か
   */
  isUpdated() {
    const result = (getVersion() !== this.#PREVIOUS_VERSION);
    return result;
  }
};