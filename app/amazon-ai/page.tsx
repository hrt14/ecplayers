import type { Metadata } from 'next'
import AmazonAiLanding from './AmazonAiLanding'

export const metadata: Metadata = {
  title: 'Amazon競合分析AI | ECplayers',
  description:
    '自社商品と競合商品のスマホページ・商品画像・レビューをAIで比較。Amazonで負けている理由と改善案を見つけるEC分析ツールの先行利用登録。',
}

export default function AmazonAiPage() {
  return <AmazonAiLanding />
}
