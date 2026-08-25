import type { Metadata } from 'next'
import AovChecklist from './AovChecklist'

export const metadata: Metadata = {
  title: '客単価アップチェックリスト | ECplayers',
  description: '客単価アップ施策をチェックし、変更ログを保存。店舗CSVを読み込むと施策前後の客単価・売上・CVRを比較して、何が効いたかを確認できます。',
}

export default function AovChecklistPage() {
  return <AovChecklist />
}
