import { Hachi_Maru_Pop } from "next/font/google";

const hachi = Hachi_Maru_Pop({
  variable: "--font-hachi",
});

export const metadata = {
  title: "Web Puri Project",
  description: "AIや画像処理を使ったWebアプリケーション",
  icons: {
    icon: "/app-icons/icon-192x192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={hachi.variable}>
      <body className="font-hachi">{children}</body>
    </html>
  );
}