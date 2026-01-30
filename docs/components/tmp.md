# ボタン
## Props:
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| text  |   |   |   |
| font-size  |   |   |   |
| imageSrc  |   |   |   |
| height  |   |   |   |
| width  |   |   |   |

- type
ボタンの種類(`button-1`, `button-2`など)を指定。

```xml
<Button type="button-1"/>
```

- text
ボタンに表示するテキストを指定。

```xml
<Button text="開始"/>
```

- font-size
ボタンに表示するテキストのサイズを指定。

```xml
<Button font-size="20rem"/>
```

- image
ボタンに表示するアイコン(画像)のパスを指定。

```xml
<Button image="camera.png"/>
```

- height
ボタンの高さ(縦方向の大きさ)を指定。

```xml
<Button height="20rem"/>
```

- width
ボタンの横幅(横方向の大きさ)を指定。

```xml
<Button width="20rem"/>
```

## 振る舞い
- ボタン押下時に登録された関数を実行
- ボタン押下時に、背景が0.5秒かけて指定色から薄い色に変化するアニメーションを表示
