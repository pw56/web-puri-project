# face-detection.ts

## faceDetection (クラス)
- 概要
> ユーザーが利用する顔のパーツ検出クラス。

### loadModels (メソッド)
- 概要
> このメソッドで事前にモデルを読み込んでおくことができる。
> モデルごとの起動したいワーカーの数を`Object`型で指定。
> 複数回呼び出しがあった場合、最後に呼び出されたときの入力が設定される。

- 引数
> 第1引数: モデルごとの起動したいワーカーの数(`Object`型)
>
> ```typescript
> {
>   countPeople?: 1,
>   selfieSegmentation?: 2,
>   personDetector?: 1,
>   faceLandmarker?: 4
> }
> ```

### disposeModels (メソッド)

### detectFaces (メソッド)
- 概要
> 入力された画像を背景除去メソッド(`useSelfieSegmentation`メソッド)で背景除去し、`ImageData`型に変換。
> 処理した画像から人物検出メソッド(`usePersonDetector`メソッド)を用いて単数または複数の人物を検出しランドマークの処理範囲を限定(ROI処理)。
> 検出した人物のうち、信頼度(`score`)が0.5以上のものだけ、それぞれの人物の顔で`DetectedFace`クラスのインスタンスを生成し、それらのインスタンスを配列で返す。

- 引数
> 第1引数: 検出する画像(`ImageData`型)
>   
> ```typescript
> ImageData // 第1引数
> ```

- 返り値
> 検出された顔のインスタンス(`DetectedFace`クラス)が入った配列
>   
> ```typescript
> [DetectedFace, DetectedFace, DetectedFace...]
> ```