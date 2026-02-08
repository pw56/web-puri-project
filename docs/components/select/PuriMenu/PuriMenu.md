# PuriMenu

## Interfaces
| Interface  | 型  | 説明  |
| ------------ | ------------ | ------------ |
| `PuriMenuOption`  | `[{ label?: string, image: string \| URL \| HTMLImageElement \| Blob, value: string, onSelected?: () => void }]`  | 選択肢のデータ配列。  |

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `height`  | `React.CSSProperties['height']`  | 自動  | コンポーネントの高さを指定。  |
| `width`  | `React.CSSProperties['width']`  | 自動  | コンポーネントの横幅を指定。  |
| `spacing`  | `React.CSSProperties['padding']`  | 自動  | 選択肢の間隔を指定。  |
| `maxColumn`  | `number`  | なし  | 表示する選択肢の横方向の最大の個数を指定。収まりきらない選択肢は、次の行に右から順に表示。  |
| `items`  | `PuriMenuOption[]`  | なし  | 選択肢が選択されたときのハンドラを指定。  |

## Hooks
| Hook  | 引数  | 返り値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `useGetValue`  | `void`  | `string`  | 選択されている選択肢の値を取得。  |

## Notes
- 選択肢のサイズは、親の領域で自動調整
