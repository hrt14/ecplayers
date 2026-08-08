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
  ['価格', '表示価格を確認して商品間で比較'],
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
          <a href="#extension">商品比較</a>
          <a href="/diagnosis">ECサイト診断</a>
          <a href="#future">今後の機能</a>
          <a href="/company">会社概要</a>
          <a className={styles.navCta} href="/diagnosis">無料診断を使う</a>
        </nav>
      </header>

      <section className={styles.hero} id="extension">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>ECplayers PRODUCT COMPARE / BETA BUILDING</div>
          <h1>商品比較を、<br /><em>もっと軽く。</em></h1>
          <p className={styles.heroLead}>Amazon.co.jpの商品ページに対応予定。現在表示している商品ページをユーザー操作でチェックし、価格、評価、レビュー件数、画像枚数、A+の有無などを整理して、複数商品を並べて比較します。</p>
          <div className={styles.promiseRow}>
            <span>現在のページだけ</span><span>自動巡回なし</span><span>AIなしで定量分析</span><span>ユーザー操作起点</span>
          </div>
          <div className={styles.actions}>
            <span className={styles.buildingButton}>Chrome拡張 β版 開発中</span>
          </div>
          <p className={styles.micro}>β版は、必要最小限の情報だけをユーザー操作で確認する設計です。まずは軽く、速く、分かりやすく。</p>
        </div>

        <div className={styles.extensionMock} aria-label="Chrome拡張の商品比較画面イメージ">
          <div className={styles.mockChrome}>
            <div className={styles.dots}><i/><i/><i/></div>
            <span>Amazon.co.jp 商品ページ</span>
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
        <div><b>01</b><span>商品ページを見る</span></div>
        <i>→</i><div><b>02</b><span>分析対象に追加</span></div>
        <i>→</i><div><b>03</b><span>競合も追加</span></div>
        <i>→</i><div><b>04</b><span>まとめて比較</span></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.label}>WHAT IT CHECKS</span>
          <h2>まずは、数字だけで<br />十分わかることから。</h2>
          <p>最初からAIに考えさせません。現在ブラウザに表示されている情報のうち、比較に必要な項目をユーザー操作で確認し、普通のコードで整理・比較します。</p>
        </div>
        <div className={styles.metricGrid}>
          {metrics.map(([title, body]) => <article key={title}><div>✓</div><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className={styles.compareCopy}>
          <span className={styles.label}>MULTI PRODUCT COMPARE</span>
          <h2>気になる商品を、<br />どんどん入れる。</h2>
          <p>自社・競合・参考商品として比較リストに追加。複数商品が入ったら、同じ指標で横並びにします。</p>
          <div className={styles.tagExample}><span>自社商品</span><span>競合商品</span><span>参考商品</span></div>
        </div>
        <div className={styles.tableCard}>
          <div className={styles.tableHead}><b>指標</b><b>自社 A</b><b>競合 B</b><b>競合 C</b></div>
          {compareRows.map(row => <div className={styles.tableRow} key={row[0]}>{row.map((cell, i) => i === 0 ? <strong key={cell}>{cell}</strong> : <span key={`${row[0]}-${cell}`}>{cell}</span>)}</div>)}
          <div className={styles.tableNote}>※ 画面イメージ。実際の取得項目はβ版で調整します。</div>
        </div>
      </section>

      <section className={styles.principles}>
        <div className={styles.sectionHead}><span className={styles.label}>PRIVACY & DATA DESIGN</span><h2>勝手に集めない。<br />必要なものだけ。</h2></div>
        <div className={styles.principleGrid}>
          <article><b>01</b><h3>現在のページだけ</h3><p>ユーザーが操作した時点で表示している商品ページを対象にします。サイト全体を自動巡回する用途にはしません。</p></article>
          <article><b>02</b><h3>ユーザー操作起点</h3><p>「分析対象に追加」など、ユーザーが明示的に操作したときだけチェックする設計です。</p></article>
          <article><b>03</b><h3>原文・画像をためない</h3><p>初期版ではHTML、商品画像、レビュー本文そのものを当社サーバーへ保存せず、比較に必要な定量情報を中心に扱う方針です。</p></article>
          <article><b>04</b><h3>必要最小限の権限</h3><p>Chrome拡張では機能提供に必要な範囲の権限だけを求め、取得内容と利用目的を明示します。</p></article>
        </div>
        <div className={styles.legalNote}>
          <strong>第三者サービスについて</strong>
          <p>ECplayersは株式会社まんがびとが独自に開発・運営するサービスです。Amazon、Amazon.co.jpおよび関連する名称・商標はAmazon.com, Inc.またはその関連会社に帰属します。ECplayersはAmazon.com, Inc.またはその関連会社との提携・承認・後援関係にはありません。</p>
          <div><a href="/terms">利用規約</a><a href="/privacy">プライバシーポリシー</a><a href="/trademarks">第三者商標について</a></div>
        </div>
      </section>

      <section className={styles.webTool}>
        <div>
          <span className={styles.liveBadge}>LIVE</span>
          <span className={styles.label}>WEB TOOL</span>
          <h2>ECサイト診断は、<br />今すぐ使えます。</h2>
          <p>自社ECのURLを入れると、SEO・商品情報・購入導線など、公開ページから確認できる情報を無料で定量診断します。</p>
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
          <article><small>FUTURE</small><h3>AI ECマネージャー</h3><p>許可された方法で取得できるデータを活用し、「今日やること」の提示へつなげます。</p></article>
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
        <nav><a href="#extension">商品比較</a><a href="/diagnosis">ECサイト診断</a><a href="/company">会社概要</a><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a></nav>
        <a className={styles.operator} href="/company">運営：株式会社まんがびと</a>
      </footer>
    </main>
  )
}
