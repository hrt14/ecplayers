import type { Metadata } from 'next'
import styles from '../legal/legal.module.css'

export const metadata: Metadata = {
  title: '第三者商標について | ECplayers',
  description: 'ECplayersにおける第三者の商標・サービス名称の取り扱いについて。',
}

export default function TrademarksPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav><a href="/company">会社概要</a><a href="/terms">利用規約</a><a href="/">トップへ戻る</a></nav>
      </header>
      <section className={styles.hero}>
        <span className={styles.kicker}>THIRD-PARTY TRADEMARKS</span>
        <h1>第三者商標について</h1>
        <p>ECplayersでは、対応サービスや分析対象を説明するために、第三者のサービス名称・商標を記載する場合があります。</p>
      </section>
      <div className={styles.body}>
        <section><h2>Amazonに関する表示</h2><p>Amazon、Amazon.co.jpおよび関連する名称・商標は、Amazon.com, Inc.またはその関連会社に帰属します。</p><div className={styles.note}>ECplayersは株式会社まんがびとが独自に開発・運営するサービスであり、Amazon.com, Inc.またはその関連会社との提携・承認・後援関係にはありません。</div><p>本サービス上の「Amazon.co.jp対応」等の記載は、対応する第三者サービスを説明する目的で使用しています。</p></section>
        <section><h2>楽天市場に関する表示</h2><p>楽天市場および関連する名称・商標は、楽天グループ株式会社またはその関連会社に帰属します。</p><div className={styles.note}>ECplayersは株式会社まんがびとが独自に開発・運営するサービスであり、楽天グループ株式会社またはその関連会社との提携・承認・後援関係にはありません。</div><p>本サービス上の「楽天」「楽天市場」等の記載は、対応する第三者サービスや公開ページへの確認導線を説明する目的で使用しています。</p></section>
        <section><h2>Google Chromeに関する表示</h2><p>Google Chrome、Chrome Web Storeおよび関連する名称・商標はGoogle LLCに帰属します。ECplayersのChrome拡張に関する表示は、対応ブラウザや配布方法を説明する目的で使用しています。</p></section>
        <section><h2>その他の第三者商標</h2><p>その他、本サイトに掲載される会社名、製品名、サービス名等は、各権利者の商号、商標または登録商標である場合があります。ECplayersは、これらの権利を主張するものではありません。</p></section>
        <section><h2>ECplayersの表示方針</h2><p>第三者のロゴ、ブランドデザイン等を無断でECplayersのブランドとして使用せず、第三者との提携・公認を誤認させる表現を避けます。対応先を示す必要がある場合は、ECplayersを主ブランドとして明確に表示し、第三者名は説明的に用います。</p><p>制定日：2026年8月8日</p><p>最終更新日：2026年8月26日</p></section>
        <div className={styles.links}><a href="/terms">利用規約</a><a href="/privacy">プライバシーポリシー</a><a href="/company">運営会社</a></div>
      </div>
      <footer className={styles.footer}><span>© 株式会社まんがびと</span><nav><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><a href="/trademarks">第三者商標</a></nav></footer>
    </main>
  )
}
