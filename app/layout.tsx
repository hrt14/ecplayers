import './globals.css'
import type { Metadata } from 'next'
import ImprovementBox from './components/ImprovementBox'
import MatchingBand from './components/MatchingBand'

export const metadata: Metadata = {
  title: 'ECプレイヤーズ | 中抜きゼロ。ECのプロと企業が直接つながる',
  description: '紹介料・手数料0円のECマッチング。企業が払った報酬は、そのままECプレイヤーに届きます。',
  icons: {
    icon: [{ url: '/favicon.svg?v=20261015', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg?v=20261015',
  },
}

const brandLogoStyles = `
  a[href="/"][class*="brand"] {
    display: block !important;
    width: 174px !important;
    height: 40px !important;
    flex: 0 0 174px !important;
    background: url('/ecplayers-logo.svg?v=20261015') left center / contain no-repeat !important;
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
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <style dangerouslySetInnerHTML={{ __html: brandLogoStyles }} />
      </head>
      <body>
        {children}
        <MatchingBand />
        <ImprovementBox />
      </body>
    </html>
  )
}
