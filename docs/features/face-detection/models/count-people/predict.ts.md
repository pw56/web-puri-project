# predict.ts

- 概要
> 実際の推論処理が実装されるファイル。

---

## countPeople (関数)
- 概要
> MediaPipe BlazeFaceモデルで、入力画像から背景を除去して返す。

- 引数
> 第1引数: 処理する画像またはそのURL(`string`型, `ImageData`型, `Blob`型)
>   
> ```typescript
> "data:image/png;base64,..." // 第1引数
> ```

- 返り値
> 画像から検出された人数(`number`型)
>   
> ```typescript
> 3
> ```