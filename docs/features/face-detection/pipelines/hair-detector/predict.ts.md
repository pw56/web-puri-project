# predict.ts

- 概要
> 実際の推論処理が実装されるファイル。

---

## hairDetector (関数)
- 概要
> MediaPipeのImage Segmenterモデルで、人物の髪の領域を検出する。
> さらにピクセル単位で領域を細分化し、結果を返す。

- 引数
> 第1引数: 検出する画像
>   
> ```typescript
> ImageData // 第1引数
> ```

- 返り値
> バウンディングボックスの座標
> 
> ```typescript
> // モデルから返ってきたものをそのまま返す
> ```