import type { Metadata } from 'next'
import ThumbnailChecker from './ThumbnailChecker'

export const metadata: Metadata = {
  title: '検索サムネイル改善発見 | ECplayers',
  description: '楽天・Amazon・Yahoo!ショッピングの検索結果スクリーンショットから、自社商品のサムネイル改善点をAIで比較・発見します。',
}

export default function ThumbnailCheckerPage() {
  return <ThumbnailChecker />
}
