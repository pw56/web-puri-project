default export function Page() {
  return (
    <div className="container">
      <div className="title">Web Puri Project</div>
      <div className="desc">
        Web Puri Project へようこそ！<br>
        このプロジェクトは、AIや画像処理などの最新技術を使ったWebアプリケーションです。<br>
        かわいらしい配色と手書き風フォントで、誰でも楽しく使える体験を目指しています。<br>
        下のボタンからスタートしてみましょう！
      </div>
      <a href="./dummies/dummy-1.html" className="nav-link">ダミー1</a>
      <a href="./dummies/dummy-2.html" className="nav-link">ダミー2</a>
      <div className="share-heading">このページを共有する</div>
      <ShareButton service="x" />
      <ShareButton service="instagram" />
      <ShareButton />
      <ShareButton />
      </div>
    </div>
  );
}