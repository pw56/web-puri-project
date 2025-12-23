# puri-class.ts

## Puri (クラス)
- 概要  
> `Blob`から生成した画像データを扱うクラス。`URL.createObjectURL()`により生成したオブジェクトURLを内部に保持し、画像を URL・`Blob`・`HTMLImageElement` として取得できる。不要になった際は`URL.revokeObjectURL()`によりメモリを解放する。

---

### フィールド
- `#imageUrl: string`  
> コンストラクタで受け取った`Blob`から生成したオブジェクトURL。画像取得メソッドで利用される。

---

### コンストラクタ
- 概要  
> `Blob`を受け取り、オブジェクトURLを生成して内部に保持する。

- 引数  
> 第1引数: 画像データ  
> ```typescript
> Blob
> ```

- 処理内容  
> - `URL.createObjectURL(image)`を実行し、生成されたURLを`#imageUrl`に保存する。

---

### dispose (メソッド)
- 概要  
> 生成したURLを破棄し、メモリリークを防ぐ。

- 引数  
> なし

- 処理内容  
> - `URL.revokeObjectURL(this.getImageAsUrl())`を実行し、内部で保持している画像のURLを破棄する。

- 返り値
> なし

---

### getImageAsImage (メソッド)
- 概要  
> 内部で保持している画像のURLを`src`に設定した`HTMLImageElement`を生成して返す。

- 引数  
> なし

- 返り値  
> 保持している画像を`HTMLImageElement`オブジェクトとして返す  
> ```typescript
> HTMLImageElement
> ```

---

### getImageAsBlob (メソッド)
- 概要  
> 内部で保持している画像のURLを`fetch`し、画像を`Blob`として取得する。

- 引数  
> なし

- 返り値  
> 非同期でBlobを返す
> ```typescript
> Promise<Blob>
> ```

---

### getImageAsUrl (メソッド)
- 概要  
> 内部で保持している画像のURLをそのまま返す。

- 引数  
> なし

- 返り値  
> 内部で保持している画像のURL  
> ```typescript
> string
> ```