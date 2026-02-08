# PuriColorPalette

## Interfaces
| Interface  | 型  | 説明  |
| ------------ | ------------ | ------------ |
| `PuriColorSwatch`  | `Array<color: React.CSSProperties['color']>`  | 色見本の配列。  |

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `height`  | `React.CSSProperties['height']`  | 自動  | コンポーネントの高さを指定。  |
| `width`  | `React.CSSProperties['width']`  | 自動  | コンポーネントの横幅を指定。  |
| `spacing`  | `React.CSSProperties['padding']`  | 自動  | 選択肢の間隔を指定。  |
| `column`  | `number`  | 自動  | 表示するカラーピッカーの横方向の個数を指定。オーバーフローは非表示。  |
| `row`  | `number`  | 自動  | 表示するカラーピッカーの縦方向の個数を指定。オーバーフローは非表示。  |
| `onChange`  | `() => void`  | なし  | 色見本が選択されたときのハンドラを指定。  |

## Hooks
| Hook  | 引数  | 返り値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `useGetColor`  | `void`  | `React.CSSProperties['color']`  | 選択されている色見本の色を取得。  |

## Notes
- 色見本のサイズは、親の領域で自動調整
