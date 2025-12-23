import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "評価項目管理",
  description: "評価項目の一覧とCRUD機能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
