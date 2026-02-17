# PuriActionsArea

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `variant`  | `string`  | `'after-shooting'`  | コンポーネントのバリアントを指定。`after-shooting`と`album-view`がある。  |
| `onAddToFavorites`  | `() => void`  | なし  | お気に入りに追加されたときのハンドラを指定。  |
| `onRemoveFromFavorites`  | `() => void`  | なし  | お気に入りから削除されたときのハンドラを指定。  |
| `onAllowRecordLocation`  | `() => void`  | なし  | 位置情報の記録が許可されたときのハンドラを指定。  |
| `onDenyRecordLocation`  | `() => void`  | なし  | 位置情報の記録が拒否されたときのハンドラを指定。  |

## Behavior
- 独自コンポーネントでも、ホバー時にマウスカーソルをリンク(`pointer`)に変化

## Notes
- 位置情報ボタンが押されたらハンドラよりも先に、許可コンフィルムを表示
- 位置情報が拒否されたら拒否時のハンドラを実行
