# ボタン
- 種類: ボタン
- 機能: ボタン押下時に登録された関数を実行。
- 表示: 
> ページ全体で設定されているフォントでテキストを表示。
> ボタンの両端が半円になる程度の丸みを帯びている。
> 画像が指定されている場合は、画像がボタンの中に収まるサイズに調整し、ボタン中央に表示する。
> その他はボタンの種類ごとに異なる。  
> ![ボタン全種類](Button-all.png)
- 属性:
  - type
> ボタンの種類(`button-1`, `button-2`など)を指定。
> 
> ```xml
> <Button type="button-1"/>
> ```

  - text
> ボタンに表示するテキストを指定。
> 
> ```xml
> <Button text="開始"/>
> ```

  - font-size
> ボタンに表示するテキストのサイズを指定。
> 
> ```xml
> <Button font-size="20rem"/>
> ```

  - image
> ボタンに表示するアイコン(画像)のパスを指定。
> 
> ```xml
> <Button image="camera.png"/>
> ```

  - height
> ボタンの高さ(縦方向の大きさ)を指定。
> 
> ```xml
> <Button height="20rem"/>
> ```

  - width
> ボタンの横幅(横方向の大きさ)を指定。
> 
> ```xml
> <Button width="20rem"/>
> ```

## ボタン1
- 属性: `button-1`
- 表示:
> ピンクの背景、白の文字のボタン。
> ボタン押下時に背景が、0.5秒かけてピンクから薄い色に変化するアニメーションを表示。  
> ![button-1](button-1.png)

## ボタン2
- 属性: `button-2`
- 表示:
> 白の背景、ピンクの文字、ピンクの縁のボタン。
> CSSの`box-sizing`プロパティと`border-box`を使用して、ボタンの縁を内側に収まるようにする。
> ボタン押下時に文字、縁がそれぞれ、0.5秒かけて文字がピンクから薄い色に変化するアニメーションを表示。  
> ![button-2](button-2.png)

## 戻る
- 属性: `back`
- 表示:
> ボタン1の派生。
> ボタンに戻るアイコン(back.svg)を表示する。  
> ![button-back](button-back.png)

## 次
- 属性: `next`
- 表示:
> ボタン1の派生。
> ボタンに戻るアイコン(next.svg)を表示する。  
> ![button-next](button-next.png)

## チェック
- 属性: `check`
- 表示:
> ボタン1の派生。
> ボタンにチェックアイコン(check.svg)を表示する。  
> ![button-next](button-check.png)

## キャンセル
- 属性: `cancel`
- 表示:
> ボタン1の派生。
> ボタンにキャンセルアイコン(cancle.svg)を表示する。  
> ![button-next](button-cancel.png)