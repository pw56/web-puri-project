# PuriLoadingAnimation

## Hooks
| Hook  | 引数  | 返り値  | 説明  |
| ------------ | ------------ | ------------ |
| showLoading  | `void`  | `void`  | アプリにローディングアニメーションを表示。  |
| hideLoading  | `void`  | `void`  | ローディングアニメーションを非表示。  |   |

## 振る舞い
- 画面全体を暗転色に暗転させ、ハート(heart.svg)を画面中央に表示し
- CSSの`transform`プロパティと`rotateY`関数を使用して、0.5秒かけて縦の軸を中心に半回転し、0.5秒待機するアニメーションを表示。  
