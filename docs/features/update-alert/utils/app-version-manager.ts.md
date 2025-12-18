# app-version-manager.ts 仕様書

## AppVersionManager (クラス)
- 概要  
> アプリのバージョン管理を行うクラス。ローカルストレージを使用して前回アクセス時のバージョンを保持し、更新の有無を判定する。

---

### フィールド
- `#BASE_KEY: string`  
> バージョン保存用キーの基礎文字列。固定値 `"lastVisitedVersion"`。

- `#STORAGE_KEY: string`  
> 実際に利用するストレージキー。`#BASE_KEY` と識別子を結合して生成される。

- `#previousVersion: string | null`  
> 前回アクセス時に保存されていたバージョン。`localStorage` から取得される。

---

### コンストラクタ
- 概要  
> インスタンス生成時に識別子と初期バージョンを受け取り、ストレージキーを設定し、初期バージョンを保存する。

- 引数  
> 第1引数: 識別子  
> ```typescript
> string
> ```  
> 第2引数: 初期バージョン  
> ```typescript
> string
> ```

- 処理内容  
> - `#STORAGE_KEY` を `#BASE_KEY + id` で生成する。  
> - `#setVersion(initialVersion)` を呼び出し、初期バージョンを保存する。

---

### getVersion (メソッド)
- 概要  
> 現在保存されているアプリのバージョンを取得する。

- 引数  
> なし

- 返り値  
> 保存されているバージョン文字列。存在しない場合は `null`。  
> ```typescript
> string | null
> ```

---

### #setVersion (プライベートメソッド)
- 概要  
> バージョンを保存する。

- 引数  
> 第1引数: バージョン文字列  
> ```typescript
> string
> ```

- 処理内容  
> - 引数が文字列型であることを確認する。  
> - 文字列型でない場合は例外を投げる。  
> - `localStorage.setItem` を用いてバージョンを保存する。

- 返り値  
> なし  
> ```typescript
> void
> ```

---

### isUpdated (メソッド)
- 概要  
> 前回アクセス時からバージョンが更新されたかを判定する。

- 引数  
> なし

- 処理内容  
> - `getVersion()` が `null` の場合は更新なし (`false`)。  
> - それ以外の場合、現在のバージョンと `#previousVersion` を比較し、異なれば更新あり (`true`)。

- 返り値  
> 更新されていれば `true`、そうでなければ `false`。  
> ```typescript
> boolean
> ```