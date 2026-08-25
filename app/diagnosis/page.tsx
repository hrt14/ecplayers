import type { Metadata } from 'next'
import DiagnosisClient from './DiagnosisClient'
import styles from './diagnosis.module.css'

export const metadata: Metadata = {
  title: '無料ECサイト診断 | ECplayers',
  description: 'ECサイトのURLを入力するだけ。公開ページをチェックし、検索流入・商品ページ・購入導線の改善ポイントを無料で定量診断します。',
}

export default function DiagnosisPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">EC<span>players</span></a>
        <a className={styles.back} href="/#tools">無料ツール一覧へ戻る</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.badge}>無料 ECサイト診断</div>
        <h1>あなたのEC、<br /><em>どこを直せば伸びる？</em></h1>
        <p className={styles.lead}>ECサイトのURLを入れるだけ。公開ページを読み取り、検索流入・商品ページ・購入導線を自動チェックします。</p>
        <DiagnosisClient />
        <div className={styles.safetyLine}>
          <span>✓ 登録不要で診断</span>
          <span>✓ 公開ページのみ分析</span>
          <span>✓ 約10秒</span>
        </div>
      </section>

      <section className={styles.explain}>
        <div className={styles.explainHead}>
          <span>診断するポイント</span>
          <h2>「数字を見る前」に直せることを、まず洗い出す。</h2>
        </div>
        <div className={styles.featureGrid}>
          <article><b>01</b><h3>検索流入</h3><p>title、description、見出し、構造化データ、本文量など、検索流入の土台を確認します。</p></article>
          <article><b>02</b><h3>商品ページ</h3><p>商品情報、画像alt、価格・配送情報、Product構造化データなど、購入判断に必要な情報を確認します。</p></article>
          <article><b>03</b><h3>購入導線</h3><p>CTA、フォーム、モバイル対応、安心材料など、購入・問い合わせまでの導線を確認します。</p></article>
        </div>
      </section>

      <section className={styles.roadmap}>
        <div><span>NEXT STEP</span><h2>課題が見つかったら、<br />次の改善へ。</h2></div>
        <p>商品ページの改善、GA4の設定、Clarityでの行動確認、売上アップ施策の洗い出しなど、診断後に使える無料ツールも用意しています。必要なものから1つずつ使ってください。</p>
      </section>

      <footer className={styles.footer}><a className={styles.brand} href="/">EC<span>players</span></a><a href="/#tools">無料ツール一覧</a><a href="/company">運営：株式会社まんがびと</a><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><small>© 株式会社まんがびと</small></footer>
    </main>
  )
}
