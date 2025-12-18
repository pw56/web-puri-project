# index.ts 仕様書

## LeaveGuard (クラス)
- 概要  
> ページ離脱時に確認ダイアログを表示させるためのガード機能を提供するクラス。`beforeunload` イベントを利用して、ユーザーがページを離れる際に警告を出す。

---

### フィールド
- `#handler: (event: BeforeUnloadEvent) => void`  
> プライベートプロパティ。`beforeunload` イベント発火時に呼び出されるハンドラ。  
> - `event.preventDefault()` を実行し、離脱を防止する。  
> - `event.returnValue = ""` を設定し、ブラウザに確認ダイアログを表示させる。

---

### on (メソッド)
- 概要  
> ページ離脱ガードを有効化する。

- 引数  
> なし

- 処理内容  
> - `window.addEventListener("beforeunload", this.#handler)` を登録する。  
> - ページ離脱時に確認ダイアログが表示されるようになる。

- 返り値  
> なし  
> ```typescript
> void
> ```

---

### off (メソッド)
- 概要  
> ページ離脱ガードを無効化する。

- 引数  
> なし

- 処理内容  
> - `window.removeEventListener("beforeunload", this.#handler)` を解除する。  
> - ページ離脱時に確認ダイアログが表示されなくなる。

- 返り値  
> なし  
> ```typescript
> void
> ```

---

### leaveGuard (エクスポート定数)
- 概要  
> `LeaveGuard` クラスのインスタンス。クラス自体ではなく、生成済みのオブジェクトをエクスポートする。  
> - これにより、他のモジュールから直接 `leaveGuard.on()` / `leaveGuard.off()` を呼び出して利用できる。