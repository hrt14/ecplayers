import styles from './ai-manager.module.css'

const items = [
  ['商品を保存', '無料診断で気に入った商品やECサイトを保存。毎回URLを入れ直す必要をなくします。'],
  ['継続して見る', '商品ページ、レビュー、競合などの変化を継続的に確認します。'],
  ['今日やることにする', '見つかった変化を、インパクトと緊急度で並べ替えて行動に変えます。'],
  ['改善履歴をためる', '何を直し、その後どう変わったかを残して、次の改善判断に使います。'],
]

export default function AIManagerPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}><a href="/" className={styles.brand}>EC<span>players</span></a><nav><a href="/diagnosis">ECサイト診断</a><a href="/company">会社概要</a><a className={styles.cta} href="/diagnosis">無料で試す</a></nav></header>

      <section className={styles.hero}>
        <div className={styles.kicker}>AI EC MANAGER</div>
        <h1>便利だったら、<br /><em>AIに任せる。</em></h1>
        <p>AI ECマネージャーは、無料診断とは別のサービスではありません。単発で使っていた分析を、商品を保存して継続的に回す状態です。</p>
        <div className={styles.actions}><a className={styles.primary} href="/diagnosis">まず無料で診断する →</a><a className={styles.secondary} href="#roadmap">違いを見る</a></div>
      </section>

      <section className={styles.demo}>
        <div className={styles.demoHead}><div><small>DAILY BRIEF</small><strong>今日のECアクション</strong></div><span>継続チェック</span></div>
        <div className={styles.alert}><b>01</b><div><strong>商品画像2枚目を改善</strong><p>レビューで高評価の「軽さ」が画像で十分に伝わっていません。競合比較でも訴求差が出ています。</p></div><em>優先度 高</em></div>
        <div className={styles.alert}><b>02</b><div><strong>低評価レビューの原因を確認</strong><p>直近レビューで「接続」に関する不満が増えています。FAQ・説明文の改善候補です。</p></div><em>要確認</em></div>
        <div className={styles.alert}><b>03</b><div><strong>競合Aが500円値下げ</strong><p>現時点では価格追随よりも、強みの訴求強化を優先することを推奨します。</p></div><em>競合変化</em></div>
      </section>

      <section className={styles.section} id="roadmap">
        <div className={styles.sectionHead}><span>FROM ONE-OFF TO CONTINUOUS</span><h2>1回の分析を、<br />毎日の改善にする。</h2></div>
        <div className={styles.grid}>{items.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className={styles.loop}>
        <div><span>THE LOOP</span><h2>診断 → 保存 → 継続監視 → 改善。</h2><p>無料では「今」を見る。AI ECマネージャーでは、その後も見続けて変化を行動に変えます。</p></div>
        <ol><li><b>01</b> 無料で診断</li><li><b>02</b> 自分の商品を保存</li><li><b>03</b> レビュー・競合等を継続確認</li><li><b>04</b> 今日やることを提示</li><li><b>05</b> 改善履歴を蓄積</li></ol>
      </section>

      <section className={styles.now}>
        <span>NOW BUILDING</span><h2>まずは、単発診断から。</h2><p>現在はECサイトの公開ページ診断を提供中です。次にAmazon商品診断、レビュー分析、競合比較を追加し、そのまま商品保存・継続管理へつなげます。</p><a href="/diagnosis">ECサイト診断を使う →</a>
      </section>

      <footer className={styles.footer}><a href="/" className={styles.brand}>EC<span>players</span></a><span>売上を伸ばす、次の一手がわかる。</span><a href="/company">運営：株式会社まんがびと</a><a href="/">トップへ戻る</a></footer>
    </main>
  )
}
