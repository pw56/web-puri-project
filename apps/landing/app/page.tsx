import { ShareButton } from "@landing/components/ShareButton";
import "./globals.css";

const desc: string =
`Web Puri Project へようこそ！
このプロジェクトは、AIや画像処理などの最新技術を使ったWebアプリケーションです。
かわいらしい配色と手書き風フォントで、誰でも楽しく使える体験を目指しています。
下のボタンからスタートしてみましょう！`;

export default function Page() {
  return (
    <div className="container">
      <div className="title">Web Puri Project</div>
      <div className="desc">{desc}</div>
      <a href="/app" className="nav-link">始める</a>
      <div className="share-heading">このページを共有する</div>
      <ShareButton service="x" />
      <ShareButton service="instagram" />
      <ShareButton service="line" />
      <ShareButton service="mail" />
    </div>
  );
}