# app-version-manager.ts

## AppVersionManager (クラス)
- 概要  
> アプリのバージョン管理を行うクラス。前回アクセス時のバージョンを保持し、更新の有無を判定する。

### コンストラクタ
- 概要  
> インスタンス生成時に識別子と初期バージョンを受け取り、内部キーを設定。非同期初期化処理を実行する。

- 引数  
> 第1引数: 識別子  
> ```typescript
> string
> ```  
> 第2引数: 初期バージョン  
> ```typescript
> string
> ```

---

### getVersion (メソッド)
- 概要  
> 現在保存されているバージョンを取得する。

- 引数  
> なし

- 返り値  
> 保存されているバージョン文字列。存在しない場合は `null`。  
> ```typescript
> Promise<string | null>
> ```

---

### isUpdated (メソッド)
- 概要  
> 前回アクセス時からバージョンが更新されたかを判定する。

- 引数  
> なし

- 返り値  
> 更新されていれば `true`、そうでなければ `false`。  
> ```typescript
> Promise<boolean>
> ```