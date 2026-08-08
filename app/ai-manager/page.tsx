import styles from './ai-manager.module.css'

const items = [
  ['毎朝の優先順位', '売上・CVR・広告などの変化から、今日確認すべきことを3件程度に絞ります。'],
  ['原因候補まで整理', '「売上が下がった」ではなく、流入・CVR・客単価・広告などに分解して原因候補を示します。'],
  ['施策のインパクト', '改善余地と緊急度から、どの施策を先にやるか判断しやすくします。'],
  ['複数店舗・顧客管理', '将来的には自社だけでなく、コンサル・代理店が複数クライアントを横断して確認できる設計にします。'],
]

export default function AIManagerPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}><a href="/" className={styles.brand}>EC<span>players</span></a><nav><a href="/diagnosis">無料EC診断</a><a className={styles.cta} href="/diagnosis">まず診断する</a></nav></header>

      <section className={styles.hero}>
        <div className={styles.kicker}>AI EC MANAGER</div>
        <h1>EC運営に、<br /><em>もう一人のマネージャー</em>を。</h1>
        <p>数字を見るだけではなく、「何が起きたか」「なぜ起きたか」「次に何をするか」まで。ECの意思決定を毎日支えるAIを目指します。</p>
        <div className={styles.actions}><a className={styles.primary} href="/diagnosis">無料EC診断から試す →</a><a className={styles.secondary} href="#roadmap">できることを見る</a></div>
      </section>

      <section className={styles.demo}>
        <div className={styles.demoHead}><div><small>DAILY BRIEF</small><strong>今日のECアクション</strong></div><span>08:00 更新</span></div>
        <div className={styles.alert}><b>01</b><div><strong>商品AのCVRが前週比 -22%</strong><p>競合価格と商品ページ訴求の変化を優先確認。広告増額より先にCVR改善を推奨します。</p></div><em>優先度 高</em></div>
        <div className={styles.alert}><b>02</b><div><strong>広告予算の再配分余地あり</strong><p>高ROASキャンペーンが予算上限に接近。低効率枠からの移管を検討できます。</p></div><em>機会</em></div>
        <div className={styles.alert}><b>03</b><div><strong>自然検索流入が伸びている商品を発見</strong><p>検索流入増加を売上につなげるため、商品ページの訴求強化候補です。</p></div><em>成長</em></div>
      </section>

      <section className={styles.section} id="roadmap">
        <div className={styles.sectionHead}><span>WHAT IT DOES</span><h2>管理画面を増やすのではなく、<br />判断を減らす。</h2></div>
        <div className={styles.grid}>{items.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className={styles.loop}>
        <div><span>THE LOOP</span><h2>見る → 考える → 動く → 学ぶ。</h2><p>ECplayersは、最終的にこの改善ループをAIと人間で回し続ける仕組みを目指します。</p></div>
        <ol><li><b>01</b> データを取得</li><li><b>02</b> 課題・機会を発見</li><li><b>03</b> 次のアクションを決定</li><li><b>04</b> AIまたは人が実行</li><li><b>05</b> 結果を再評価</li></ol>
      </section>

      <section className={styles.now}>
        <span>NOW BUILDING</span><h2>いまは、無料診断から。</h2><p>現在のMVPでは公開ページを分析して、改善ポイントと優先課題を返します。今後、GA4・広告・モール等の接続を段階的に追加します。</p><a href="/diagnosis">無料EC診断を使う →</a>
      </section>

      <footer className={styles.footer}><a href="/" className={styles.brand}>EC<span>players</span></a><span>売上を伸ばす、次の一手がわかる。</span><a href="/">トップへ戻る</a></footer>
    </main>
  )
}
