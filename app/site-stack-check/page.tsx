import type { Metadata } from 'next'
import SiteStackCheck from './SiteStackCheck'

export const metadata: Metadata = {
  title: '自社EC 導入ツール診断 | ECplayers',
  description: 'URLを入れるだけでGA4・Google Tag Manager・Microsoft Clarityなどの導入痕跡を確認し、自社ECに必要な計測・改善ツールの抜け漏れをチェックします。',
}

export default function SiteStackCheckPage() {
  return <SiteStackCheck />
}
