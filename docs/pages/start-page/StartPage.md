# StartPage

## Overview
アプリを開いたときに最初に表示されるページ。
ルーターのフォールバック先もこのページ。

## Elements

### Title
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | タイトルのコンポーネントをグループ化するコンポーネント。  |
| Behavior  | ページ読み込み完了時から開始。`Sample1`→`Sample2`→`Heart1`→`Heart2`→`AppName`の順でフェードイン。  |

#### Sample1
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アプリの使用イメージの画像。  |
| Behavior  | 0.5秒かけてフェードイン。  |
| Notes  | `sample-1.svg`を表示する。  |

#### Sample2
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アプリの使用イメージの画像。  |
| Behavior  | 0.5秒かけてフェードイン。  |
| Notes  | `sample-2.svg`を表示する。  |

#### Heart1
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | ページの装飾の図形。  |
| Behavior  | 0.5秒かけてフェードイン。  |
| Notes  | `heart-1.svg`を表示する。  |

#### Heart2
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | ページの装飾の図形。  |
| Behavior  | 0.5秒かけてフェードイン。  |
| Notes  | `heart-2.svg`を表示する。  |

#### AppName
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アプリ名の表示。  |
| Behavior  | 1秒かけてフェードイン。  |

### nav
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | セマンティックHTML。  |
| Behavior  | メニューボタンをそれぞれ0.5秒かけてフェードイン。  |

#### SelfShootButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | セルフ撮影モードを選択。  |
| Behavior  | `SelftShootPage`に遷移。  |

#### PuriShootButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | プリ撮影モードを選択。  |
| Behavior  | `PuriShootPage`に遷移。  |

#### UploadButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アップロードモードを選択。  |
| Behavior  | 画像をアップロード。`EditPage`に遷移。  |

### AlbumButton
| 項目  | 説明  |
| ------------ | ------------ |
| Overview  | アルバムに保存されたプリを閲覧。  |
| Behavior  | `AlbumPage`に遷移。  |
