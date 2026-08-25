import type { Metadata } from 'next'
import RakutenLpCheckClient from './RakutenLpCheckClient'
import styles from './rakutenLpCheck.module.css'

export const metadata: Metadata = {
  title: '楽天LPチェッカー | ECplayers',
  description: '楽天市場の商品URLを入れるだけで、商品ページに不足している訴求要素をチェックし、AI改善用プロンプトまで無料で作成します。',
}

export default function RakutenLpCheckPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">EC<span>players</span></a>
        <a className={styles.back} href="/#apps">アプリ一覧へ戻る</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.badge}>ECP APP / RAKUTEN LP CHECKER</div>
        <h1>楽天LPに、<br /><em>足りないものを見つける。</em></h1>
        <p className={styles.lead}>商品URLを入れるだけ。ターゲット、悩み、ベネフィット、比較、使用シーン、根拠、FAQなど「購入を決めるための情報」が揃っているかを公開ページからチェックします。</p>
        <RakutenLpCheckClient />
      </section>

      <section className={styles.explain}>
        <div className={styles.sectionHead}>
          <span>HOW TO USE</span>
          <h2>チェックして、そのままAI改善へ。</h2>
        </div>
        <div className={styles.featureGrid}>
          <article><b>01</b><h3>楽天URLを入れる</h3><p>公開中の商品ページを読み取り、LPにある訴求要素を確認します。</p></article>
          <article><b>02</b><h3>不足を優先順で見る</h3><p>「何がないか」だけでなく、売上改善で先に追加したい項目を上から表示します。</p></article>
          <article><b>03</b><h3>AI用プロンプトをコピー</h3><p>診断結果と取得できたページ情報をまとめたプロンプトを、ChatGPT等へそのまま貼れます。</p></article>
        </div>
      </section>

      <section className={styles.referenceSection}>
        <div>
          <span>RAKUTEN OFFICIAL REFERENCES</span>
          <h2>楽天固有ルールは、公式資料と分けて確認。</h2>
        </div>
        <p>LPの売れやすさ診断と、楽天市場の運営ルールは別物です。このアプリでは自動判定できないルールを「要確認」として分離しています。</p>
        <div className={styles.referenceLinks}>
          <a href="https://www.rakuten.co.jp/ec/start/shohinpage_design/" target="_blank" rel="noreferrer">楽天市場出店：商品ページのデザイン基本 ↗</a>
          <a href="https://service.rms.rakuten.co.jp/column/detail/123" target="_blank" rel="noreferrer">RMS Service Square：第1商品画像の20%ルール ↗</a>
          <a href="https://www.rakuten.co.jp/ec/open/attention/pdf/disclosure/03_tempounei_guideline.pdf" target="_blank" rel="noreferrer">楽天市場 店舗運営ガイドライン ↗</a>
          <a href="https://service.rms.rakuten.co.jp/column/detail/125" target="_blank" rel="noreferrer">RMS Service Square：商品画像A/Bテスト ↗</a>
        </div>
      </section>

      <section className={styles.noteSection}>
        <div><span>IMPORTANT</span><h2>自動判定は、公開HTMLから確認できる範囲。</h2></div>
        <p>画像内の文字・デザイン品質、表現の正確性、法令適合性、楽天RMS内だけで確認できる設定は自動判定しません。診断結果は改善候補の発見に使い、最終確認は実ページとRMSで行ってください。</p>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="/">EC<span>players</span></a>
        <a href="/#apps">アプリ一覧</a>
        <a href="/company">運営：株式会社まんがびと</a>
        <a href="/terms">利用規約</a>
        <a href="/privacy">プライバシー</a>
        <small>楽天市場および楽天は楽天グループ株式会社の商標または登録商標です。本サービスは楽天グループ株式会社とは独立した第三者サービスです。</small>
      </footer>
    </main>
  )
}
