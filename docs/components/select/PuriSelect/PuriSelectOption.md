# PuriSelectOption

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `label`  | `string`  | なし  | 選択肢に表示するテキストを指定。  |
| `image`  | `string` \| `URL` \| `HTMLImageElement` \| `Blob`  | なし  | 選択肢に表示する画像を指定。  |
| `variant`  | `string`  | `'primary'`  | コンポーネントのバリアントを指定。  |
| `value`  | `string`  | なし  | 選択肢が持つ値を設定。  |
| `onChange`  | `() => void`  | なし  | 選択肢が選択されたときのハンドラを指定。  |

## Behavior
- ホバー時に、背景が0.5秒かけて指定色から薄い色に変化するアニメーションを表示
- ホバー時に、マウスカーソルをリンク(`pointer`)に変化

## Notes
- `PuriSelect`で内部的に使用され、エクスポートされない
