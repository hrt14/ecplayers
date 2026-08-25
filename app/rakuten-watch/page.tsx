import type { Metadata } from 'next'
import RakutenWatchClient from './RakutenWatchClient'

export const metadata: Metadata = {
  title: '楽天競合店ウォッチャー | ECplayers',
  description: '楽天市場の競合ショップを登録し、商品一覧・新着順・納期確認をワンクリック化。商品点数の前回比も記録できます。',
}

export default function RakutenWatchPage() {
  return <RakutenWatchClient />
}
