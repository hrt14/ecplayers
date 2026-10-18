'use client'

import { usePathname } from 'next/navigation'
import styles from './MatchingBand.module.css'

const PLAYER_URL = 'https://shindan.ecplayers.com/'
const REQUEST_URL = 'https://shindan.ecplayers.com/request'

// ツール以外のページには出さない
const HIDDEN = ['/', '/company', '/terms', '/privacy', '/trademarks', '/legacy', '/hub']

// ツールの分野に合わせて、相談の呼びかけを変える
function topicOf(path: string) {
  if (path.startsWith('/amazon')) return 'Amazonの改善'
  if (/^\/(rakuten|rpp|rakurakupon)/.test(path)) return '楽天の改善'
  if (/^\/(ga4|clarity|site-stack)/.test(path)) return '計測・分析の設定'
  if (path.startsWith('/meta')) return '広告運用'
  if (/^\/(roadmap|initiative)/.test(path)) return '売上計画と施策の実行'
  return 'ECの売上改善'
}

export default function MatchingBand() {
  const path = usePathname() || '/'
  if (HIDDEN.includes(path)) return null
  return (
    <aside className={styles.band}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span>ECプレイヤーズ ・ 紹介料・手数料0円</span>
          <strong>{topicOf(path)}、プロに任せませんか？</strong>
          <p>実技診断でスキルが分かるECプレイヤーに、直接依頼できます。払った報酬は中抜きされず、そのままプレイヤーに届きます。</p>
        </div>
        <div className={styles.actions}>
          <a className={styles.primary} href={REQUEST_URL}>ECプレイヤーに依頼する</a>
          <a className={styles.secondary} href={PLAYER_URL}>ECの仕事を受けたい方</a>
        </div>
      </div>
    </aside>
  )
}
