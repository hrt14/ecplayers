import type { Metadata } from 'next'
import ReviewFollowClient from './ReviewFollowClient'

export const metadata: Metadata = {
  title: '楽天市場 低評価レビュー改善 | ECplayers',
  description: '楽天市場の低評価レビューと商品ページを貼るだけで、AIに渡す商品ページ改善プロンプトを無料生成。購入前の説明不足や期待ギャップを見つけます。',
}

export default function RakutenReviewFollowPage() {
  return <ReviewFollowClient />
}
