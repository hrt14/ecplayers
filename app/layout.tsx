import './globals.css'
import type { Metadata } from 'next'
import ImprovementBox from './components/ImprovementBox'

export const metadata: Metadata = {
  title: 'ECplayers | Amazon・楽天・自社ECの無料ECツール集',
  description: 'Amazon広告、楽天RPP、限界利益、商品ページ、レビュー、GA4、Clarity、施策効果検証まで。ECの売上改善に使える無料ツールをまとめています。',
  icons: {
    icon: [{ url: '/favicon.svg?v=20260808', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg?v=20260808',
  },
}

const brandLogoStyles = `
  a[href="/"][class*="brand"] {
    display: block !important;
    width: 174px !important;
    height: 40px !important;
    flex: 0 0 174px !important;
    background: url('/ecplayers-logo.svg?v=20260808') left center / contain no-repeat !important;
    font-size: 0 !important;
    line-height: 0 !important;
    letter-spacing: 0 !important;
    color: transparent !important;
    text-decoration: none !important;
  }
  a[href="/"][class*="brand"] > span {
    display: none !important;
  }
  @media (max-width: 640px) {
    a[href="/"][class*="brand"] {
      width: 154px !important;
      height: 36px !important;
      flex-basis: 154px !important;
    }
  }
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandLogoStyles }} />
      </head>
      <body>
        {children}
        <ImprovementBox />
      </body>
    </html>
  )
}
