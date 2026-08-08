import styles from './Home.module.css'

const compareRows = [
  ['価格', '¥12,980', '¥9,980', '¥14,800'],
  ['評価', '4.2', '4.4', '4.0'],
  ['レビュー数', '382', '2,140', '690'],
  ['画像枚数', '6', '8', '7'],
  ['動画', 'なし', 'あり', 'あり'],
  ['A+', 'あり', 'あり', 'なし'],
]

const metrics = [
  ['価格', '表示価格を取得して商品間で比較'],
  ['評価・レビュー数', '星評価とレビュー件数を横並び'],
  ['画像・動画', '画像枚数と動画の有無を確認'],
  ['A+', 'A+コンテンツの有無を確認'],
  ['商品情報', 'タイトル・箇条書き・ブランド等を整理'],
  ['バリエーション', '表示されている選択肢を把握'],
]

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav className={styles.nav}>
          <a href="#extension">Amazon比較</a>
          <a href="/diagnosis">ECサイト診断</a>
          <a href="#future">今後の機能</a>
          <a className={styles.navCta} href="/diagnosis">無料診断を使う</a>
        </nav>
      </header>

      <section className={styles.hero} id="extension">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>CHROME EXTENSION / BETA BUILDING</div>
          <h1>Amazonの商品比較を、<br /><em>もっと軽く。</em></h1>
          <p className={styles.heroLead}>見ている商品を「分析対象に追加」。価格、評価、レビュー数、画像枚数、A+など、画面に出ている公開情報をその場で集めて、複数商品を並べて比較します。</p>
          <div className={styles.promiseRow}>
            <span>登録不要</span><span>公開情報だけ</span><span>AIなしで定量分析</span><span>ユーザー操作起点</span>
          </div>
          <div className={styles.actions}>
            <span className={styles.buildingButton}>Chrome拡張 β版 開発中</span>
            <a className={styles.secondary} href="/diagnosis">ECサイト無料診断を使う →</a>
          </div>
          <p className={styles.micro}>まずは軽く、速く、分かりやすく。AIは必要になった部分だけ後から追加します。</p>
        </div>

        <div className={styles.extensionMock} aria-label="Chrome拡張の商品比較画面イメージ">
          <div className={styles.mockChrome}>
            <div className={styles.dots}><i/><i/><i/></div>
            <span>amazon.co.jp / 商品ページ</span>
            <b>ECplayers</b>
          </div>
          <div className={styles.currentProduct}>
            <div><small>いま見ている商品</small><strong>ワイヤレスイヤホン 商品A</strong><span>¥12,980 ・ ★4.2 ・ 382 reviews</span></div>
            <button>＋ 分析対象に追加</button>
          </div>
          <div className={styles.listHead}><strong>比較リスト</strong><span>3商品</span></div>
          <div className={styles.productList}>
            <article><b className={styles.own}>自社</b><div><strong>商品A</strong><span>¥12,980 / ★4.2</span></div><em>×</em></article>
            <article><b>競合</b><div><strong>商品B</strong><span>¥9,980 / ★4.4</span></div><em>×</em></article>
            <article><b>競合</b><div><strong>商品C</strong><span>¥14,800 / ★4.0</span></div><em>×</em></article>
          </div>
          <div className={styles.compareButton}>3商品を比較する →</div>
        </div>
      </section>

      <section className={styles.flowStrip}>
        <div><b>01</b><span>Amazonで商品を見る</span></div>
        <i>→</i><div><b>02</b><span>分析対象に追加</span></div>
        <i>→</i><div><b>03</b><span>競合も追加</span></div>
        <i>→</i><div><b>04</b><span>まとめて比較</span></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.label}>WHAT IT CHECKS</span>
          <h2>まずは、数字だけで<br />十分わかることから。</h2>
          <p>最初からAIに考えさせません。ブラウザに表示されている公開情報を取得し、普通のコードで整理・比較します。</p>
        </div>
        <div className={styles.metricGrid}>
          {metrics.map(([title, body]) => <article key={title}><div>✓</div><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className={styles.compareCopy}>
          <span className={styles.label}>MULTI PRODUCT COMPARE</span>
          <h2>気になる商品を、<br />どんどん入れる。</h2>
          <p>自社・競合・参考商品を分けて保存。複数商品がリストに入ったら、同じ指標で横並びにします。</p>
          <div className={styles.tagExample}><span>自社商品</span><span>競合商品</span><span>参考商品</span></div>
        </div>
        <div className={styles.tableCard}>
          <div className={styles.tableHead}><b>指標</b><b>自社 A</b><b>競合 B</b><b>競合 C</b></div>
          {compareRows.map(row => <div className={styles.tableRow} key={row[0]}>{row.map((cell, i) => i === 0 ? <strong key={cell}>{cell}</strong> : <span key={`${row[0]}-${cell}`}>{cell}</span>)}</div>)}
          <div className={styles.tableNote}>※ 画面イメージ。実際の取得項目はβ版で調整します。</div>
        </div>
      </section>

      <section className={styles.principles}>
        <div className={styles.sectionHead}><span className={styles.label}>LIGHT BY DESIGN</span><h2>勝手に集めない。<br />見ているものだけ。</h2></div>
        <div className={styles.principleGrid}>
          <article><b>01</b><h3>公開情報のみ</h3><p>Amazonの商品ページなど、ユーザーがブラウザで見ている公開情報を対象にします。</p></article>
          <article><b>02</b><h3>ユーザー操作起点</h3><p>自動でAmazon全体を巡回せず、「分析対象に追加」を押したページだけを取得します。</p></article>
          <article><b>03</b><h3>個人情報を集めない</h3><p>Seller Central、注文情報、顧客情報などの非公開情報はMVPでは扱いません。</p></article>
          <article><b>04</b><h3>AIを使いすぎない</h3><p>数えられるものはコードで。AIは画像の意味やレビュー内容など、本当に必要な部分だけに使います。</p></article>
        </div>
      </section>

      <section className={styles.webTool}>
        <div>
          <span className={styles.liveBadge}>LIVE</span>
          <span className={styles.label}>WEB TOOL</span>
          <h2>ECサイト診断は、<br />今すぐ使えます。</h2>
          <p>自社ECのURLを入れると、SEO・商品情報・購入導線など、公開ページから取れる情報を無料で定量診断します。</p>
          <a href="/diagnosis">ECサイトを無料診断する →</a>
        </div>
        <div className={styles.webScore}>
          <small>EC SITE CHECK</small><strong>72</strong><span>/100</span>
          <ul><li>SEO基本設定 <b>○</b></li><li>商品情報 <b>△</b></li><li>購入導線 <b>○</b></li><li>画像alt <b>54%</b></li></ul>
        </div>
      </section>

      <section className={styles.future} id="future">
        <div className={styles.sectionHead}><span className={styles.label}>ONLY WHEN NEEDED</span><h2>便利になった先で、<br />AIを足す。</h2><p>ECplayersの最初の価値は「比較が速い」こと。利用が増えて、本当に欲しい分析が見えたら高度化します。</p></div>
        <div className={styles.futureFlow}>
          <article className={styles.nowCard}><small>NOW</small><h3>無料・定量比較</h3><p>商品を追加して、価格・評価・レビュー・画像・A+などを比較。</p></article>
          <i>→</i>
          <article><small>NEXT</small><h3>保存・履歴</h3><p>比較セットを保存し、前回との差分や変化を確認。</p></article>
          <i>→</i>
          <article><small>LATER</small><h3>AI分析</h3><p>レビュー内容や画像訴求など、意味理解が必要な部分だけAIで深掘り。</p></article>
          <i>→</i>
          <article><small>FUTURE</small><h3>AI ECマネージャー</h3><p>保存商品を継続監視し、「今日やること」だけを提示。</p></article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <span className={styles.label}>ECplayers</span>
        <h2>EC分析を、<br />もっと軽く。</h2>
        <p>Chrome拡張はβ版を開発中。ECサイト診断は今すぐ無料で使えます。</p>
        <div className={styles.actions}><span className={styles.buildingButton}>Chrome拡張 β版 開発中</span><a className={styles.secondaryDark} href="/diagnosis">ECサイト診断を使う →</a></div>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <span>EC分析を、もっと軽く。</span>
        <nav><a href="#extension">Amazon比較</a><a href="/diagnosis">ECサイト診断</a><a href="#future">今後の機能</a></nav>
        <span className={styles.operator}>運営：まんがびと</span>
      </footer>
    </main>
  )
}
