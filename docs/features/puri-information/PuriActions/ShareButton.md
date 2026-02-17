# ShareButton

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `puri`  | `PuriImages`  | なし  | 共有するプリを指定。  |
| `message`  | `string`  | なし  | 共有するメッセージを指定。  |

## Behavior
- `puri`で指定されたプリは、クラスの保持する画像を1枚ずつファイルとして共有する

## Notes
- `PuriButton`の継承
- `share.svg`をアイコンとして表示
- このコンポーネントは`PuriActions`のみで使用できる
