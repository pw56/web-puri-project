# コンポーネント仕様書: Button

## 1. 概要 (Overview)
システム全体で使用される汎用的なボタンコンポーネント。
一貫したユーザー体験を提供するため、デザインシステムで定義されたスタイルとアクセシビリティ基準を遵守する。

## 2. インターフェース (Props Definition)
| Prop名 | 型 | 必須 | 既定値 | 説明 |
| :--- | :--- | :---: | :--- | :--- |
| `label` | `string` | ✅ | - | ボタンに表示するテキスト |
| `intent` | `'primary' \| 'secondary' \| 'danger'` | - | `'primary'` | ボタンの視覚的意図（色味） |
| `size` | `'sm' \| 'md' \| 'lg'` | - | `'md'` | ボタンのサイズ |
| `isDisabled` | `boolean` | - | `false` | trueの場合、クリック不可かつグレーアウト |
| `onClick` | `(event: MouseEvent) => void` | - | - | クリック時のコールバック関数 |

## 3. 外観とスタイル (UI & Styling)
- **Border Radius**: 4px 固定。
- **Typography**: 
  - `sm`: 12px, `md`: 14px, `lg`: 16px
- **Interactions**:
  - `Hover`: 背景色を 10% 暗くする。
  - `Active`: 背景色を 20% 暗くする。
  - `Focus`: 外側に 2px の青いアウトラインを表示。

## 4. 振る舞いとロジック (Behavior)
- **クリック抑制**: `isDisabled` が `true` の時、`onClick` は発火せず、`cursor: not-allowed` とすること。
- **読み上げ**: アイコンのみのボタンとして使用される場合は、内部的に `aria-label` を必須とする。

## 5. テスト・受入条件 (Acceptance Criteria)
- [ ] 指定した `label` が正しくレンダリングされること。
- [ ] `onClick` イベントが一度のクリックで一度だけ実行されること。
- [ ] キーボードの `Enter` または `Space` キーで実行可能であること（アクセシビリティ）。

## 6. 備考 (Notes)
- ローディング状態（`isLoading`）の追加は次期スプリントで検討。
