import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECplayers | EC分析を、もっと軽く。',
  description: 'Amazonの商品を見ながら分析対象に追加し、価格・評価・レビュー数・画像・A+などの公開情報を比較。ECサイト無料診断も使える、軽量なEC分析ツールです。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
