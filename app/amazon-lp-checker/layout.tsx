import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Amazon LPチェッカー | ECplayers',
  description: 'Amazonの商品詳細ページを見ながら○・△・×でチェック。改善優先度とスコアを確認し、AIへ渡せる商品ページ改善プロンプトを作成できます。',
}

export default function AmazonLpCheckerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
