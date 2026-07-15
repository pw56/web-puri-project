# StartPage

## Overview
アプリを開いたときに最初に表示されるページ。
ルーターのフォールバック先もこのページ。

## Elements

### AppTitle
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アプリのタイトルのコンポーネント。  |

### nav
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | セマンティックHTML。  |
| Behavior  | メニューボタンをそれぞれ0.5秒かけてフェードイン。  |
| Notes  | フェードインは各ページの`opacity`を`0`から`1`へ、`duration`は仕様書通り。  |

#### SelfieButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | 自撮りモードを選択。  |
| Behavior  | `setAppMode()`で、`FlowMode`を`SELFIE`にして、`QuantitySlectPage`に遷移。  |

#### AutoShootButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | 自動撮影モードを選択。  |
| Behavior  | `setAppMode()`で、`FlowMode`を`AUTO`にして、`QuantitySlectPage`に遷移。  |

#### UploadButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アップロードモードを選択。  |
| Behavior  | 画像をアップロード。`setAppMode()`で、`FlowMode`を`UPLOAD`にして、`EditPage`に遷移。  |

### AlbumButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アルバムに保存されたプリを閲覧。  |
| Behavior  | `AlbumPage`に遷移。  |
