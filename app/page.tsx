import styles from './Home.module.css'

const freeTools = [
  { status: 'NEXT', title: 'Amazon商品診断', body: '商品ページの訴求・レビュー・競合との差から、売上改善ポイントを見つけます。', note: 'β版 準備中', href: '#amazon' },
  { status: 'LIVE', title: 'ECサイト診断', body: 'URLだけでSEO・商品情報・購入導線をチェック。改善優先度まで無料で返します。', note: '今すぐ使える', href: '/diagnosis' },
  { status: 'NEXT', title: 'レビュー分析', body: '高評価の理由、不満、返品につながる要因を整理し、商品改善と訴求に変えます。', note: 'Amazon診断に統合予定', href: '#amazon' },
  { status: 'NEXT', title: '競合比較', body: '自社商品と競合商品の強み・弱みを並べ、次に勝ちにいくポイントを明確にします。', note: 'Amazon診断に統合予定', href: '#amazon' },
]

const managerRows = [
  ['商品ページ診断', 'その場で1回診断', '保存した商品を継続チェック'],
  ['レビュー分析', '今あるレビューを分析', '新着レビューと変化を追跡'],
  ['競合比較', '比較したい時に実行', '競合の変化を自動検知'],
  ['改善提案', '診断時に表示', '優先順位をつけて「今日やること」に'],
  ['履歴', 'なし', '改善前後を蓄積して振り返る'],
]

const today = [
  ['01', '商品画像2枚目を改善', 'レビューで高評価の「軽さ」が画像で十分に伝わっていません。', '優先度 高'],
  ['02', '低評価レビューの原因を確認', '直近レビューで「接続」に関する不満が増えています。', '要確認'],
  ['03', '競合Aの値下げを確認', '競合が500円値下げ。現時点では価格追随より訴求強化を推奨します。', '競合変化'],
]

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav className={styles.nav}>
          <a href="#tools">できること</a>
          <a href="#manager">AI ECマネージャー</a>
          <a href="/diagnosis">ECサイト診断</a>
          <a href="/diagnosis">無料で試す</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>AI COMMERCE IMPROVEMENT</div>
          <h1>売上を伸ばす、<br /><em>次の一手</em>がわかる。</h1>
          <p className={styles.heroLead}>商品ページ、レビュー、競合、ECサイトをAIで分析。まずは無料で診断。気に入った商品は、そのままAIに継続管理させられます。</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#amazon">Amazon商品診断を見る →</a>
            <a className={styles.secondary} href="/diagnosis">ECサイトを無料診断</a>
          </div>
          <p className={styles.micro}>ECサイト診断は今すぐ利用可能。Amazon商品診断はβ版を準備中です。</p>
        </div>

        <div className={styles.productMock} id="amazon">
          <div className={styles.mockHead}><div><small>AMAZON PRODUCT CHECK</small><strong>商品URLを入れるだけ</strong></div><span>β 準備中</span></div>
          <div className={styles.urlMock}><span>amazon.co.jp / 商品URL・ASIN</span><b>診断 →</b></div>
          <div className={styles.mockScoreRow}>
            <div><small>商品ページ</small><strong>58</strong><span>/100</span></div>
            <div><small>レビュー</small><strong>82</strong><span>/100</span></div>
            <div><small>競合比較</small><strong>46</strong><span>/100</span></div>
          </div>
          <div className={styles.insight}><b>最大の改善ポイント</b><p>レビューで評価されている強みが、商品画像では十分に伝わっていません。</p><strong>次に直すなら：画像2枚目の訴求</strong></div>
          <div className={styles.mockNote}>商品ページ → レビュー → 競合 → 画像まで、ひとつの診断体験につなげます。</div>
        </div>
      </section>

      <section className={styles.simpleFlow}>
        <div><b>1</b><span>URLを入れる</span></div><i>→</i>
        <div><b>2</b><span>無料で分析</span></div><i>→</i>
        <div><b>3</b><span>商品を保存</span></div><i>→</i>
        <div><b>4</b><span>AIに任せる</span></div>
      </section>

      <section className={styles.section} id="tools">
        <div className={styles.sectionHead}>
          <span className={styles.label}>START FREE</span>
          <h2>まずは、1回使ってみる。</h2>
          <p>会員登録を先に求めるのではなく、URLを入れて結果を見るところから。ECplayersの機能を単発で無料体験できます。</p>
        </div>
        <div className={styles.toolGrid}>
          {freeTools.map(tool => (
            <a className={styles.toolCard} href={tool.href} key={tool.title}>
              <div className={styles.toolTop}><span className={tool.status === 'LIVE' ? styles.liveTag : styles.nextTag}>{tool.status}</span><small>{tool.note}</small></div>
              <h3>{tool.title}</h3><p>{tool.body}</p><b>詳しく見る →</b>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.bridge}>
        <div className={styles.bridgeInner}>
          <span className={styles.label}>ONE PRODUCT, CONTINUOUSLY</span>
          <h2>便利だったら、<br />毎回やらなくていい。</h2>
          <p>無料診断とAI ECマネージャーは別サービスではありません。無料では「今」を1回分析。商品を保存すると、同じ分析をAIが継続して行います。</p>
          <div className={styles.bridgeArrow}>1回診断する <b>→</b> 商品を保存する <b>→</b> AIが見続ける</div>
        </div>
      </section>

      <section className={styles.manager} id="manager">
        <div className={styles.managerInner}>
          <div className={styles.managerCopy}>
            <span className={styles.label}>AI EC MANAGER</span>
            <h2>気に入った商品を、<br />AIに任せる。</h2>
            <p>毎回URLを入れて調べる代わりに、商品やECサイトを保存。レビュー、競合、商品ページの変化を継続して確認し、今日やるべきことだけを出します。</p>
            <a href="/ai-manager">AI ECマネージャーの構想を見る →</a>
          </div>
          <div className={styles.dailyBoard}>
            <div className={styles.dailyHead}><div><small>TODAY&apos;S ACTION</small><strong>今日やること</strong></div><span>3件</span></div>
            {today.map(([n,title,body,badge]) => <article key={n}><b>{n}</b><div><strong>{title}</strong><p>{body}</p></div><span>{badge}</span></article>)}
          </div>
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className={styles.sectionHead}><span className={styles.label}>FREE → MANAGED</span><h2>同じ機能が、継続利用になる。</h2><p>課金価値は「分析項目を増やすこと」ではなく、保存・継続監視・優先順位・履歴で、毎日の判断を減らすことです。</p></div>
        <div className={styles.compareTable}>
          <div className={styles.compareHeader}><b>機能</b><b>無料で使う</b><b>AIに任せる</b></div>
          {managerRows.map(([name,free,managed]) => <div className={styles.compareRow} key={name}><strong>{name}</strong><span>{free}</span><span className={styles.managed}>{managed}</span></div>)}
        </div>
      </section>

      <section className={styles.useCases}>
        <div className={styles.sectionHead}><span className={styles.label}>FOR EC OPERATORS</span><h2>1店舗でも、20店舗でも。</h2></div>
        <div className={styles.useGrid}>
          <article><small>STORE</small><h3>ショップ運営者</h3><p>自社の商品を登録して、レビュー・競合・商品ページの変化を見逃さない。</p></article>
          <article><small>EC TEAM</small><h3>企業のEC担当者</h3><p>「何を見るか」ではなく「今日何をするか」をチームで共有しやすくする。</p></article>
          <article><small>AGENCY</small><h3>コンサル・代理店</h3><p>複数クライアントを横断し、変化が起きた案件だけに時間を使う。</p></article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <span className={styles.label}>TRY ECplayers</span>
        <h2>まず、1回診断する。</h2>
        <p>今すぐ使えるECサイト診断から、ECplayersの考え方を体験できます。</p>
        <div className={styles.actions}><a className={styles.primary} href="/diagnosis">ECサイトを無料診断 →</a><a className={styles.secondary} href="#amazon">Amazon商品診断を見る</a></div>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <span>売上を伸ばす、次の一手がわかる。</span>
        <nav><a href="#tools">できること</a><a href="#manager">AI ECマネージャー</a><a href="/diagnosis">ECサイト診断</a></nav>
        <span className={styles.operator}>運営：まんがびと</span>
      </footer>
    </main>
  )
}
