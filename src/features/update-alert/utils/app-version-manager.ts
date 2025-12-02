import Dexie from "@libs/dexie.min.js";

class VersionDB extends Dexie {
  versions: Dexie.Table<{ key: string; value: string }, string>;

  constructor() {
    super("AppVersionDB");
    this.versions(1).stores({
      versions: "&key"
    });
    this.versions = this.table("versions");
  }
}

const db = new VersionDB();

export class AppVersionManager {
  readonly #BASE_KEY: string = "lastVisitedVersion";
  #STORAGE_KEY: string = "";
  #previousVersion: string | null = null;

  constructor(id: string, initialVersion: string) {
    this.#STORAGE_KEY = this.#BASE_KEY + id;

    // 非同期 init を投げる（await はできない）
    this.#init(initialVersion);
  }

  /**
   * プライベート初期化処理（非同期）
   */
  async #init(initialVersion: string): Promise<void> {
    this.#previousVersion = await this.getVersion();
    await this.#setVersion(initialVersion);
  }

  /**
   * 現在のバージョンを取得
   */
  async getVersion(): Promise<string | null> {
    const record = await db.versions.get(this.#STORAGE_KEY);
    return record?.value ?? null;
  }

  /**
   * バージョンを保存（プライベート）
   */
  async #setVersion(version: string): Promise<void> {
    if (typeof version !== "string") {
      throw new Error("入力値が文字列ではありません。");
    }
    await db.versions.put({ key: this.#STORAGE_KEY, value: version });
  }

  /**
   * 前回アクセス時からアップデートされたか確認
   */
  async isUpdated(): Promise<boolean> {
    const current = await this.getVersion();

    if (current === null) return false;

    return current !== this.#previousVersion;
  }
}