# PuriAlert

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `content`  | { message?: `string`, baseUrl?: `string` \| `URL`, contentUrl?: `string` \| `URL` }  | なし  | ダイアログに表示するメッセージの文章, メッセージ内の相対パスのベースURL, メッセージのコンテンツURLを指定。  |

## Hooks
| Hook  | 引数  | 返り値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `useShowAlert`  | { message?: `string`, okButtonMessage?: `string`, noButtonMessage?: `string` }  | `void`  | アラートを表示。  |
