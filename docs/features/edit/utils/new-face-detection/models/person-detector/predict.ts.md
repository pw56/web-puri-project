# predict.ts

- 概要
> 実際の推論処理が実装されるファイル。

---

## personDetector (関数)
- 概要
> TensorFlow.jsのCOCO-SSDモデルで、単数または複数の人物を検出し、そのまま返す。

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