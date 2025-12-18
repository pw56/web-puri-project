export class AppVersionManager {
  readonly #BASE_KEY: string = "lastVisitedVersion";
  #STORAGE_KEY:string = "";
  readonly #previousVersion: string | null = localStorage.getItem(this.#STORAGE_KEY);

  /**
   * 文字列型かチェック
   * @throw 文字列型の例外
   */
  constructor(id: string, initialVersion: string) {
    this.#STORAGE_KEY = this.#BASE_KEY + id;
    this.#setVersion(initialVersion);
  }

  /**
   * 現在のアプリのバージョンを取得
   * @returns {string | null} 現在のアプリのバージョン（例: "1.0.0"）
   */
  getVersion(): string | null {
    const result:string | null = localStorage.getItem(this.#STORAGE_KEY);
    return result;
  }

  /**
   * バージョンを保存する（プライベート）
   */
  #setVersion(version: string): void {
    if (typeof version !== "string") {
      throw new Error("入力値が文字列ではありません。");
    }
    localStorage.setItem(this.#STORAGE_KEY, version);
  }

  /**
   * 前回アクセス時からアップデートされたかを確認
   * @returns {boolean} 更新されたか否か
   */
  isUpdated(): boolean {
    // 前回のデータが存在しなかったら
    if(this.getVersion() === null)
      return false;
    // 前回から更新されたか
    else
      return (this.getVersion() !== this.#previousVersion);
  }
};