# puri-images-class.ts

## PuriImages (クラス)
- 概要
> 複数の画像を管理するクラス。画像の追加・取得・削除・一括処理に加え、撮影日時や位置情報の保持も行う。

---

### count (メソッド)
- 概要
> 管理している画像の数を取得する。

- 引数
> なし

- 返り値
> 画像数  
> ```typescript
> number
> ```

---

### dispose (メソッド)
- 概要
> 管理しているすべての画像を破棄する。

- 引数
> なし

- 返り値
> なし

---

### addImageFromBlob (メソッド)
- 概要
> `Blob`から画像を1枚追加する。

- 引数
> 第1引数: 画像データ  
> ```typescript
> Blob
> ```

- 返り値
> なし

---

### addImagesFromBlob (メソッド)
- 概要
> `Blob`配列から複数の画像を追加する。

- 引数
> 第1引数: 画像データの配列  
> ```typescript
> Blob[]
> ```

- 返り値
> なし

---

### delete (メソッド)
- 概要
> 指定したインデックスの画像を破棄し、配列から削除する。

- 引数
> 第1引数: インデックス  
> ```typescript
> number
> ```

- 返り値
> なし

---

### getImageAsImage (メソッド)
- 概要
> 指定インデックスの画像を`HTMLImageElement`として取得する。

- 引数
> 第1引数: インデックス  
> ```typescript
> number
> ```

- 返り値
> ```typescript
> HTMLImageElement
> ```

---

### getImageAsBlob (メソッド)
- 概要
> 指定インデックスの画像を`Blob`として取得する。

- 引数
> 第1引数: インデックス  
> ```typescript
> number
> ```

- 返り値
> ```typescript
> Promise<Blob>
> ```

---

### getImageAsFile (メソッド)
- 概要
> 指定インデックスの画像を`File`として取得する。  
> ファイル名は日時とインデックスから生成される。

- 引数
> 第1引数: インデックス  
> ```typescript
> number
> ```

- 返り値
> ```typescript
> Promise<File>
> ```

---

### getImageAsUrl (メソッド)
- 概要
> 指定されたインデックスの画像のURLを取得する。

- 引数
> 第1引数: インデックス  
> ```typescript
> number
> ```

- 返り値
> ```typescript
> string
> ```

---

### getAllImagesAsImage (メソッド)
- 概要
> すべての画像を`HTMLImageElement`として取得する。

- 引数
> なし

- 返り値
> ```typescript
> HTMLImageElement[]
> ```

---

### getAllImagesAsBlob (メソッド)
- 概要
> すべての画像を`Blob`として取得する。

- 引数
> なし

- 返り値
> ```typescript
> Promise<Blob[]>
> ```

---

### getAllImagesAsFile (メソッド)
- 概要
> すべての画像を`File`として取得する。  
> ファイル名は日時とインデックスから生成される。

- 引数
> なし

- 返り値
> ```typescript
> Promise<File[]>
> ```

---

### getAllImagesAsUrl (メソッド)
- 概要
> すべての画像`URL`を取得する。

- 引数
> なし

- 返り値
> ```typescript
> string[]
> ```

---

### setDate (メソッド)
- 概要
> 日時情報を設定する。

- 引数
> 第1引数: 日時  
> ```typescript
> Date
> ```

- 返り値
> なし

---

### getDate (メソッド)
- 概要
> 設定されている日時を取得する。

- 引数
> なし

- 返り値
> ```typescript
> Date | null
> ```

---

### setLocation (メソッド)
- 概要
> 位置情報を設定する。

- 引数
> 第1引数: 位置情報  
> ```typescript
> GeoLocation
> ```

- 返り値
> なし

---

### getLocation (メソッド)
- 概要
> 設定されている位置情報を取得する。

- 引数
> なし

- 返り値
> ```typescript
> GeoLocation | null
> ```