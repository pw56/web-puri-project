export class AppVersionManager {
  private readonly STORAGE_KEY:string = "lastVisitedVersion";
  private readonly previousVersion: string | null = localStorage.getItem(this.STORAGE_KEY);

  /**
   * 文字列型かチェック
   * @throw 文字列型の例外
   */
  constructor(initialVersion: string) {
    this.setVersion(initialVersion);
  }

  /**
   * 現在のアプリのバージョンを取得
   * @returns {string | null} 現在のアプリのバージョン（例: "1.0.0"）
   */
  getVersion(): string | null {
    const result:string | null = localStorage.getItem(this.STORAGE_KEY);
    return result;
  }

  /**
   * バージョンを保存する（プライベート）
   */
  private setVersion(version: string): void {
    if (typeof version !== "string") {
      throw new Error("入力値が文字列ではありません。");
    }
    localStorage.setItem(this.STORAGE_KEY, version);
  }

  /**
   * 前回アクセス時からアップデートされたかを確認
   * @returns {boolean} 更新されたか否か
   */
  isUpdated(): boolean {
    const result: boolean = (this.getVersion() !== this.previousVersion);
    return result;
  }
};