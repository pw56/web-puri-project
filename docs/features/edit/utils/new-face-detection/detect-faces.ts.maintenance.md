# detect-faces.ts

## detectFaces (関数)
- 概要
> 入力された画像を背景除去メソッド(`useSelfieSegmentation`)で背景除去し、`ImageData`型に変換。
> 処理した画像から人物検出メソッド(`usePersonDetector`)を用いて単数または複数の人物を検出しランドマークの処理範囲を限定(ROI処理)。
> 検出した人物のうち、信頼度(`score`)が0.5以上のものだけ、それぞれの人物の顔で`DetectedFace`クラスのインスタンスを生成し、それらのインスタンスを配列で返す。

- 引数
> 第1引数: 検出する画像(ImageDataオブジェクト)
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