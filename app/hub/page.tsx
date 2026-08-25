import styles from './hub.module.css'

const jobs = [
  { label: 'NEW', title: '楽天市場の売上改善を支援してほしい', pay: '月 15〜25万円', type: '業務委託', area: 'フルリモート', role: '楽天運営・広告改善' },
  { label: 'NEW', title: 'Amazon広告と商品ページ改善を相談したい', pay: '月 10〜20万円', type: '副業・業務委託', area: 'リモート', role: 'Amazon運用' },
  { label: '急募', title: 'ShopifyのCRM改善を一緒に進めたい', pay: '月 20〜30万円', type: 'プロジェクト', area: 'リモート', role: 'CRM / LTV改善' },
  { label: '相談', title: 'EC責任者経験者に壁打ちをお願いしたい', pay: '1回 3〜5万円', type: 'スポット', area: 'オンライン', role: 'EC戦略' },
]

export default function HubPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>ECPアプリ一覧へ</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.kicker}>ECP EXPERIMENT / EC WORK FEED</div>
        <h1>EC案件を、<br />一気見できる。</h1>
        <p>ツールだけでは解けないECの仕事を、人につなぐための実験アプリ。仲介会社ごとに探し回らず、ECの仕事をひとつの場所で探せる形を検証しています。</p>
        <div className={styles.search}><span>⌕</span><div><small>希望条件で絞り込み</small><strong>楽天 / Amazon / Shopify / 広告...</strong></div><button>検索</button></div>
      </section>

      <section className={styles.agents}>
        <span className={styles.agentRed}>楽天</span>
        <span className={styles.agentPink}>Amazon</span>
        <span className={styles.agentBlue}>Shopify</span>
        <span className={styles.agentGreen}>自社EC</span>
      </section>

      <section className={styles.feed}>
        <div className={styles.feedHeader}><div><small>PROTOTYPE</small><h2>EC案件の掲載イメージ</h2></div><span>実験中</span></div>
        {jobs.map((job, i) => (
          <article className={styles.card} key={job.title}>
            <div className={styles.cardTop}><span className={i === 2 ? styles.urgent : styles.new}>{job.label}</span><button>☆</button></div>
            <h3>{job.title}</h3>
            <strong className={styles.pay}>¥ {job.pay}</strong>
            <dl><div><dt>▣</dt><dd>{job.type}</dd></div><div><dt>⌖</dt><dd>{job.area}</dd></div><div><dt>●</dt><dd>{job.role}</dd></div></dl>
            <div className={styles.cardActions}><button>詳細を見る</button><button>話を聞いてみる</button></div>
          </article>
        ))}
      </section>

      <section className={styles.stickyCta}>
        <div><small>ECP EXPERIMENT</small><strong>ツールで解けない仕事は、人につなぐ。</strong></div>
        <a href="/#apps" style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: 12, background: '#fff', color: '#111827', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>アプリ一覧へ</a>
      </section>
    </main>
  )
}
