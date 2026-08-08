import type { Metadata } from 'next'
import styles from '../legal/legal.module.css'

export const metadata: Metadata = {
  title: '利用規約 | ECplayers',
  description: 'ECplayersの利用規約です。',
}

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav><a href="/company">会社概要</a><a href="/privacy">プライバシー</a><a href="/">トップへ戻る</a></nav>
      </header>
      <section className={styles.hero}>
        <span className={styles.kicker}>TERMS OF USE</span>
        <h1>利用規約</h1>
        <p>ECplayersは、株式会社まんがびとが提供するEC分析・比較支援サービスです。本規約は、ECplayersのWebサービスおよび今後提供する関連機能に適用されます。</p>
      </section>
      <div className={styles.body}>
        <section><h2>1. サービスの目的</h2><p>ECplayersは、EC運営に必要な情報の整理、比較、分析を効率化することを目的としています。表示される分析結果、スコア、提案等は参考情報であり、売上、利益、検索順位その他の成果を保証するものではありません。</p></section>
        <section><h2>2. 第三者サービスの利用</h2><p>ECplayersはAmazon.co.jpその他の第三者サービス上で表示される情報を、ユーザー自身の操作に基づき確認・整理する機能を提供する場合があります。ユーザーは、利用対象となる第三者サービスの規約、ポリシー、法令等を遵守して利用するものとします。</p><div className={styles.note}>ECplayersはAmazon.com, Inc.またはその関連会社との提携・承認・後援関係にはありません。</div></section>
        <section><h2>3. Chrome拡張の設計方針</h2><p>開発中のChrome拡張β版は、ユーザーが明示的に操作した時点で現在表示しているページを対象に、比較に必要な情報を確認する設計です。自動巡回や大量取得を目的とした機能として提供しません。</p><p>初期版では、HTML、商品画像、レビュー本文そのものを当社サーバーへ恒常的に保存せず、比較に必要な定量情報を中心に扱う方針です。仕様変更時は、必要に応じて本規約またはプライバシーポリシーで告知します。</p></section>
        <section><h2>4. 禁止事項</h2><ul><li>法令または第三者サービスの規約に違反する利用</li><li>自動巡回、大量取得、過度なアクセス等、第三者サービスへ不当に負荷をかける利用</li><li>第三者の著作権、商標権、プライバシーその他の権利を侵害する利用</li><li>ECplayersの機能を不正アクセス、解析妨害、サービス妨害等に利用する行為</li></ul></section>
        <section><h2>5. 免責</h2><p>第三者サイトの表示変更、仕様変更、アクセス制限等により、機能の全部または一部が利用できなくなる場合があります。当社は、合理的な範囲で改善に努めますが、継続提供や完全な正確性を保証するものではありません。</p></section>
        <section><h2>6. 規約の変更</h2><p>サービス内容の変更、法令対応その他必要がある場合、本規約を変更することがあります。重要な変更については、本サービス上で分かりやすく案内します。</p><p>制定日：2026年8月8日</p></section>
        <div className={styles.links}><a href="/privacy">プライバシーポリシー</a><a href="/trademarks">第三者商標について</a><a href="/company">運営会社</a></div>
      </div>
      <footer className={styles.footer}><span>© 株式会社まんがびと</span><nav><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><a href="/trademarks">第三者商標</a></nav></footer>
    </main>
  )
}
