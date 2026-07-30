import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECplayers | 無料のECビジネスマッチング',
  description: 'ECの仕事を頼みたい企業と、ECの経験を持つプレイヤーがつながる無料のECビジネスマッチングサイト。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
