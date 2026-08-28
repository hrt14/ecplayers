import type { Metadata } from 'next'
import InventoryHealthClient from './InventoryHealthClient'

export const metadata: Metadata = {
  title: 'Amazon 在庫健全度チェック | ECplayers',
  description: '在庫レポートCSVを読み込むだけ。欠品リスク・長期保管リスク・過剰在庫をSKUごとに判定し、対応が必要なものだけ一覧で確認できます。',
}

export default function AmazonInventoryHealthPage() {
  return <InventoryHealthClient />
}
