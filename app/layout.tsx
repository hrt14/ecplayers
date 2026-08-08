import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECplayers | 売上を伸ばす、次の一手がわかる。',
  description: '売上・広告・商品・競合を分析し、ECで次にやるべきことを見つけ、実行までつなげるEC改善プラットフォーム。無料EC診断から始められます。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
