import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECplayers | ECの面倒を、アプリにする。',
  description: '分析、比較、広告、商品ページ、CRM、業務改善。ECの現場で面倒な仕事を小さなアプリにして次々公開する、ECの道具箱です。',
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
      <body>{children}</body>
    </html>
  )
}
