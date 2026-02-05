# PuriSlider

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `height`  | `React.CSSProperties['height']`  | 自動  | コンポーネントの高さを指定。  |
| `width`  | `React.CSSProperties['width']`  | 自動  | コンポーネントの横幅を指定。  |
| `defaultValue`  | `number`  | 0  | 初期値を設定。  |
| `step`  | `number`  | 1  | 粒度を設定。  |
| `min`  | `number`  | なし  | 最小値を設定。  |
| `max`  | `nmuber`  | なし  | 最大値を設定。  |

## Hooks
| Hook  | 引数  | 返り値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `useGetValue`  | `void`  | `number`  | 保持している入力値を取得。  |

## Behavior
- カスタムフックで入力値を取得
- `defaultValue`が`min`より小さい場合、`defaultValue`が`max`より大きい場合、初期値が`step`で本来到達できない場合の挙動はHTMLの`input`タグと同じ
