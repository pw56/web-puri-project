# predict.ts

- 概要
> 実際の推論処理が実装されるファイル。

---

## selfieSegmentation (関数)
- 概要
> MediaPipe Selfie Segmentationモデルで、入力画像から背景を除去して返す。

- 引数
> 第1引数: 処理する画像
>   
> ```typescript
> ImageData // 第1引数
> ```

- 返り値
> 除去された画像
>   
> ```typescript
> ImageData
> ```