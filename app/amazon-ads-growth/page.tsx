import type { Metadata } from 'next'
import AmazonAdsGrowthClient from './AmazonAdsGrowthClient'
import styles from './amazonAdsGrowth.module.css'

export const metadata: Metadata = {
  title: 'Amazon広告 伸びしろ発見機 | ECplayers',
  description: 'Amazon広告の検索語句レポートとバルクファイルから、無駄出稿・伸長候補・ブランド防御・自社ASIN防御の抜けを無料診断します。',
}

export default function AmazonAdsGrowthPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">EC<span>players</span></a>
        <a className={styles.back} href="/#apps">アプリ一覧へ戻る</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.badge}>ECP APP 05 / AMAZON ADS GROWTH FINDER</div>
        <h1>Amazon広告、<br /><em>まだ伸ばせる場所はどこ？</em></h1>
        <p className={styles.lead}>検索語句レポートから無駄出稿を見つけて原資化。バルクファイルも入れると、ブランド広告・自社ブランド防御・自社ASIN防御の抜けまで一気に確認できます。</p>
        <AmazonAdsGrowthClient />
      </section>

      <section className={styles.explain}>
        <div className={styles.explainHead}>
          <span>WHAT IT FINDS</span>
          <h2>「削る」と「増やす」を、同じ画面で決める。</h2>
        </div>
        <div className={styles.featureGrid}>
          <article><b>01</b><h3>無駄出稿を原資化</h3><p>十分なクリックがあるのに売上ゼロの検索語句を抽出。削減候補額を合計します。</p></article>
          <article><b>02</b><h3>勝ち筋を昇格</h3><p>売れていて目標ACoS内の検索語句を抽出。Exact化や独立運用の候補を見つけます。</p></article>
          <article><b>03</b><h3>守りの抜けを確認</h3><p>バルクファイルからSponsored Brands、自社ブランド語、自社ASINターゲティングの有無を確認します。</p></article>
        </div>
      </section>

      <section className={styles.noteSection}>
        <div><span>PRIVACY</span><h2>広告データは、ブラウザ内で処理。</h2></div>
        <p>アップロードしたCSVの解析はこの画面上で行い、診断のためにサーバーへ保存しません。まずルールベースで速く判定し、必要な判断だけ人が確認できる設計です。</p>
      </section>

      <section className={styles.sourceSection}>
        <span>AMAZON ADS OFFICIAL REFERENCES</span>
        <p>除外候補の強判定は、Amazon Ads公式ガイドの「除外ターゲット追加前に20クリック以上で評価」という目安を初期値にしています。検索語句レポートは高成果検索の発見と、目標に合わない検索語句の除外判断に利用できます。</p>
        <div>
          <a href="https://advertising.amazon.com/ja-jp/library/guides/targeting-with-sponsored-products" target="_blank" rel="noreferrer">スポンサープロダクト広告のターゲティングガイド ↗</a>
          <a href="https://advertising.amazon.com/help/G3HEFZYWZF84NPS9" target="_blank" rel="noreferrer">検索語句レポート公式ヘルプ ↗</a>
          <a href="https://advertising.amazon.com/help/GPVTCZRJ7G9HXHWB" target="_blank" rel="noreferrer">バルクスプレッドシート公式ヘルプ ↗</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="/">EC<span>players</span></a>
        <a href="/#apps">アプリ一覧</a>
        <a href="/company">運営：株式会社まんがびと</a>
        <a href="/terms">利用規約</a>
        <a href="/privacy">プライバシー</a>
        <small>AmazonおよびAmazon AdsはAmazon.com, Inc.またはその関連会社の商標です。本サービスはAmazonとは独立した第三者サービスです。</small>
      </footer>
    </main>
  )
}
