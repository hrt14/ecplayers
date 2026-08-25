import styles from './Home.module.css'

const apps = [
  {
    status: 'LIVE',
    tone: 'live',
    number: '01',
    title: 'ECサイト診断',
    description: 'URLを入れるだけで、SEO・商品情報・購入導線などを公開ページからチェック。',
    tags: ['自社EC', '診断', '無料'],
    href: '/diagnosis',
    action: '今すぐ使う →',
  },
  {
    status: 'LIVE',
    tone: 'live',
    number: '02',
    title: '商品ページ増やし方',
    description: '楽天・Amazonで、既存商品からセット・複数個・用途別などの商品化候補を見つける。',
    tags: ['楽天', 'Amazon', '商品ページ'],
    href: '/product-page-growth',
    action: '今すぐ使う →',
  },
  {
    status: 'BUILDING',
    tone: 'building',
    number: '03',
    title: '商品比較',
    description: '商品ページを見ながら自社・競合を追加し、価格・評価・レビュー数・画像などを横並び比較。',
    tags: ['Amazon', '競合比較', 'Chrome拡張'],
    href: null,
    action: 'β版 開発中',
  },
  {
    status: 'BUILDING',
    tone: 'building',
    number: '04',
    title: 'AI ECマネージャー',
    description: '単発の分析を継続運用へ。変化を見つけて、今日やる改善アクションにつなげる構想。',
    tags: ['AI', '継続改善', '運用'],
    href: '/ai-manager',
    action: '構想を見る →',
  },
  {
    status: 'EXPERIMENT',
    tone: 'experiment',
    number: '05',
    title: 'EC案件ハブ',
    description: 'ECの仕事を探す人と、EC人材を探す企業の探索コストを下げる実験プロダクト。',
    tags: ['人材', '案件', 'マッチング'],
    href: '/hub',
    action: '試作を見る →',
  },
  {
    status: 'LIVE',
    tone: 'live',
    number: '06',
    title: '楽天 限界利益計算機',
    description: '限界利益・限界ROAS・限界広告費率を商品単位で計算し、RPPをどこまで攻められるか判断。',
    tags: ['楽天', 'RPP', '利益計算'],
    href: '/rakuten-margin',
    action: '今すぐ計算する →',
  },
  {
    status: 'LIVE',
    tone: 'live',
    number: '07',
    title: 'ロードマップメーカー',
    description: '目標年商から月次売上・セッション・CVR・客単価を逆算し、毎月の施策までロードマップ化。',
    tags: ['計画', 'KPI', '施策管理'],
    href: '/roadmap-maker',
    action: 'ロードマップを作る →',
  },
  {
    status: 'LIVE',
    tone: 'live',
    number: '08',
    title: 'Meta広告 はじめて設定ナビ',
    description: '読むだけの手順書ではなく、今やる1手だけを表示。Meta広告の初期設定と計測確認を最後まで進める。',
    tags: ['Meta広告', '初期設定', '計測'],
    href: '/meta-setup',
    action: '設定をはじめる →',
  },
  {
    status: 'LIVE',
    tone: 'live',
    number: '09',
    title: 'GA4 定番レポート設定',
    description: 'ECで見る場所を7つに固定。GA4を開きながら10分で設定でき、完了チェックも保存。',
    tags: ['GA4', '自社EC', '計測・分析'],
    href: '/ga4-report-setup',
    action: '10分で設定する →',
  },
]

const categories = [
  ['集客・広告', 'RPP、Amazon広告、流入改善など。'],
  ['商品ページ', '競合比較、訴求、画像、レビューなど。'],
  ['計測・分析', 'CVR、アクセス、診断、変化検知など。'],
  ['CRM・LTV', 'LINE、リピート、顧客育成など。'],
  ['業務自動化', '毎日の集計・確認・判断を短く。'],
  ['人材・案件', 'ECの仕事とプレイヤーをつなぐ。'],
]

const buildLoop = [
  ['01', '困る', 'ECの実務で「これ面倒だな」を見つける。'],
  ['02', '小さく作る', 'まず1つの作業だけを速くする。'],
  ['03', '無料で出す', '説明を読まなくても使える形で公開する。'],
  ['04', '育てる', '本当に使われるものだけ、AIや継続機能を足す。'],
]

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav className={styles.nav}>
          <a href="#apps">アプリ</a>
          <a href="#concept">コンセプト</a>
          <a href="#categories">カテゴリ</a>
          <a href="/hub">EC案件</a>
          <a href="/company">会社概要</a>
          <a className={styles.navCta} href="/diagnosis">無料アプリを使う</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>ECP / EC APP PLATFORM</div>
          <h1>ECの面倒を、<br /><em>アプリにする。</em></h1>
          <p className={styles.heroLead}>分析、比較、広告、商品ページ、CRM、業務改善。ECの現場で「毎回これやるの面倒だな」と思うことを、小さなアプリにして次々公開していきます。</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#apps">アプリを見る →</a>
            <a className={styles.secondary} href="/diagnosis">まずECサイトを無料診断</a>
          </div>
          <div className={styles.heroPoints}>
            <span><b>FREE FIRST</b> まず無料で使える</span>
            <span><b>SMALL APPS</b> 1アプリ1課題</span>
            <span><b>KEEP SHIPPING</b> 役立つものを増やす</span>
          </div>
        </div>

        <div className={styles.appStack} aria-label="ECPのアプリイメージ">
          <article className={styles.stackMain}>
            <div className={styles.stackTop}><span>LIVE APP</span><b>01</b></div>
            <strong>ECサイト診断</strong>
            <p>URLを入れて、改善ポイントをチェック。</p>
            <div className={styles.score}><span>EC SCORE</span><b>72</b><small>/100</small></div>
            <a href="/diagnosis">無料で診断する →</a>
          </article>
          <article className={styles.stackSub}><span>02</span><div><small>LIVE</small><strong>商品ページ増やし方</strong></div><b>→</b></article>
          <article className={styles.stackSub}><span>03</span><div><small>BUILDING</small><strong>商品比較</strong></div><b>→</b></article>
          <article className={styles.stackSub}><span>04</span><div><small>BUILDING</small><strong>AI ECマネージャー</strong></div><b>→</b></article>
        </div>
      </section>

      <section className={styles.manifesto} id="concept">
        <div><span className={styles.label}>NEW CONCEPT</span><h2>ECの「ちょっと面倒」を、<br />ひとつずつ消していく。</h2></div>
        <div className={styles.manifestoText}>
          <p>ECPは、大きな業務システムを最初から作る場所ではありません。</p>
          <p>現場で困る瞬間ごとに、小さく、すぐ使えるアプリを作る。使われるものだけを育て、必要になったところにAIを足す。</p>
          <strong>ECで困ったら、とりあえずECPを見る。</strong>
          <p>そんな「ECの道具箱」を目指します。</p>
        </div>
      </section>

      <section className={styles.appsSection} id="apps">
        <div className={styles.sectionHead}>
          <div><span className={styles.label}>APPS</span><h2>使えるものから、<br />どんどん増やす。</h2></div>
          <p>完成するまで隠しません。小さく公開し、実際に役立つかを見ながら改善します。</p>
        </div>

        <div className={styles.appGrid}>
          {apps.map((app) => (
            <article className={styles.appCard} key={app.title}>
              <div className={styles.appTop}>
                <span className={`${styles.status} ${styles[app.tone]}`}>{app.status}</span>
                <b>{app.number}</b>
              </div>
              <h3>{app.title}</h3>
              <p>{app.description}</p>
              <div className={styles.tags}>{app.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
              {app.href ? <a href={app.href}>{app.action}</a> : <span className={styles.disabled}>{app.action}</span>}
            </article>
          ))}
          <article className={`${styles.appCard} ${styles.nextCard}`}>
            <div className={styles.plus}>＋</div>
            <h3>次のECアプリ</h3>
            <p>広告、商品ページ、CVR、CRM、集計、自動化。実務で必要になったものから追加していきます。</p>
            <span className={styles.disabled}>COMING NEXT</span>
          </article>
        </div>
      </section>

      <section className={styles.categories} id="categories">
        <div className={styles.sectionHead}>
          <div><span className={styles.label}>CATEGORIES</span><h2>ECの仕事を、<br />アプリ単位に分解する。</h2></div>
          <p>モール、自社EC、広告、CRMをまたいで、「やること」単位で道具を揃えていきます。</p>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map(([title, body], index) => (
            <article key={title}><b>{String(index + 1).padStart(2, '0')}</b><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className={styles.loopSection}>
        <div className={styles.sectionHead}>
          <div><span className={styles.label}>HOW ECP GROWS</span><h2>作って、使って、<br />残ったものを育てる。</h2></div>
          <p>機能の多さではなく、ECの仕事が本当に短くなるかを基準にします。</p>
        </div>
        <div className={styles.loopGrid}>
          {buildLoop.map(([num, title, body]) => <article key={num}><b>{num}</b><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className={styles.aiSection}>
        <div>
          <span className={styles.label}>AI WHEN IT HELPS</span>
          <h2>AIありきにしない。<br />便利になる場所だけAI化。</h2>
          <p>単純な比較や集計は普通のコードで速く。意味理解、提案、継続監視など、AIが効くところだけAIを使います。</p>
          <a href="/ai-manager">AI ECマネージャー構想を見る →</a>
        </div>
        <div className={styles.aiFlow}>
          <article><span>STEP 1</span><strong>単発ツール</strong><p>診断・比較・チェック</p></article>
          <i>→</i>
          <article><span>STEP 2</span><strong>保存・履歴</strong><p>前回との差を見る</p></article>
          <i>→</i>
          <article><span>STEP 3</span><strong>AI運用</strong><p>次の一手を出す</p></article>
        </div>
      </section>

      <section className={styles.workSection}>
        <div><span className={styles.label}>ECP WORK</span><h2>ツールで解けない仕事は、<br />人につなぐ。</h2><p>アプリで自己解決できることを増やし、それでも人の経験が必要な仕事は、EC案件・人材の仕組みへつなげていきます。</p></div>
        <a href="/hub">EC案件ハブの試作を見る →</a>
      </section>

      <section className={styles.finalCta}>
        <span className={styles.label}>START WITH ONE APP</span>
        <h2>まず1個、<br />仕事を軽くする。</h2>
        <p>ECサイト診断は今すぐ無料で使えます。ECPのアプリは、ここから増えていきます。</p>
        <div className={styles.heroActions}><a className={styles.primaryLight} href="/diagnosis">ECサイトを無料診断 →</a><a className={styles.secondaryDark} href="#apps">アプリ一覧を見る</a></div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p></div>
        <nav><a href="#apps">アプリ</a><a href="/hub">EC案件</a><a href="/company">会社概要</a><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><a href="/trademarks">第三者商標</a></nav>
        <small>運営：株式会社まんがびと</small>
      </footer>
    </main>
  )
}
