# extract-people.ts

- 概要
> Shared Workerで立ち上げて利用されることを想定する。
> バランス管理は('.ts')で行う。

---

## extractPeople (関数)
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