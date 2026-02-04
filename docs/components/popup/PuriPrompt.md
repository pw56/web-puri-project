# PuriPrompt

## Props
| Prop  | 型  | 初期値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `content`  | { message?: `string`, baseUrl?: `string` \| `URL`, contentUrl?: `string` \| `URL` }  | なし  | ダイアログに表示するメッセージの文章, メッセージ内の相対パスのベースURL, メッセージのコンテンツURLを指定。  |
| `okButtonMessage`  | `string`  | はい  | OKボタンのメッセージを指定。  |
| `noButtonMessage`  | `string`  | いいえ  | NOボタンのメッセージを指定。  |

## Hooks
| Hook  | 引数  | 返り値  | 説明  |
| ------------ | ------------ | ------------ | ------------ |
| `useShowPrompt`  | { message?: `string`, okButtonMessage?: `string`, noButtonMessage?: `string` }  | `boolean`  | プロンプトを表示。  |
