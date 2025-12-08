# use-update-alert.tsx

## useUpdateAlert (エクスポート関数)
- 概要  
> アプリのバージョン更新を検知し、更新があった場合にアラート通知を行うカスタムフック。

---

### 内部変数
- `appVersion`  
> バージョン管理を行う `AppVersionManager` インスタンス。

---

### getVersion (内部関数)
- 概要  
> バージョンファイルを読み込み、アプリのバージョンを取得する。

- 引数  
> なし

- 処理内容  
> - `/assets/release/version.yml` を読み込む。  
> - YAML をパースし、`app_version` キーの値を取得する。  
> - 値が存在しない場合は `'1.0.0'` を返す。  
> - 読み込みエラー時は例外を投げる。

- 返り値  
> バージョン文字列  
> ```typescript
> Promise<string>
> ```

---

### openVersionManager (内部関数)
- 概要  
> バージョン管理クラスを初期化する。

- 引数  
> なし

- 処理内容  
> - 識別子 `"window-app-version"` を用いて `AppVersionManager` を生成する。  
> - `getVersion()` で取得したバージョンを初期値として設定する。  
> - 現在のバージョンと更新判定結果をログ出力する。

- 返り値  
> なし  
> ```typescript
> Promise<void>
> ```

---

### useUpdateAlert (関数)
- 概要  
> バージョン更新を検知し、更新がある場合にアラートを表示する。

- 引数  
> なし

- 処理内容  
> - `useAlert()` を呼び出し、アラート表示機能を取得する。  
> - `openVersionManager()` を実行し、バージョン管理を初期化する。  
> - `useEffect` 内で非同期処理を行い、更新がある場合に `/assets/release/message.md` を表示する。

- 返り値  
> なし  
> ```typescript
> Promise<void>
> ```