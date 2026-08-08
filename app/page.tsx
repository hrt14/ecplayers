import styles from './Home.module.css'

const tasks = [
  { n: '01', title: '商品AのCVR低下を確認', body: '競合値下げと商品ページ訴求の弱まりが要因候補です。', impact: '優先度 高' },
  { n: '02', title: '広告予算の配分を見直す', body: 'ROASの高いキャンペーンへ予算を寄せる余地があります。', impact: '+売上余地' },
  { n: '03', title: '検索流入の弱い商品を改善', body: 'タイトル・説明文・内部導線の改善候補を抽出しました。', impact: 'SEO' },
]

const features = [
  ['今日やること', '数字の変化から、優先して着手すべき施策を絞り込みます。'],
  ['売上・CVR分析', 'セッション、CVR、客単価に分解してボトルネックを見つけます。'],
  ['広告分析', '広告費・ROAS・CPC・CVRを見ながら予算配分の改善余地を探します。'],
  ['商品・競合分析', '商品ページ、価格、訴求、競合との差から改善候補を整理します。'],
]

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav className={styles.nav}>
          <a href="/diagnosis">無料EC診断</a>
          <a href="/ai-manager">AI ECマネージャー</a>
          <a href="#pro">プロに依頼</a>
          <a href="/diagnosis">無料で診断する</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>AI COMMERCE ACTION PLATFORM</div>
          <h1>売上を伸ばす、<br /><em>次の一手</em>がわかる。</h1>
          <p className={styles.heroLead}>売上・広告・商品・競合をAIが分析。いま何を改善すべきかを見つけ、実行までつなげるEC改善プラットフォームです。</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="/diagnosis">あなたのECを無料診断 →</a>
            <a className={styles.secondary} href="/ai-manager">AI ECマネージャーを見る</a>
          </div>
          <p className={styles.micro}>まずはURLだけで診断。ログインやカード登録は不要です。</p>
        </div>

        <div className={styles.dashboard} aria-label="AI ECマネージャーの画面イメージ">
          <div className={styles.dashTop}><strong>AI EC Manager</strong><span className={styles.live}>● DAILY CHECK</span></div>
          <div className={styles.score}>
            <small>EC HEALTH SCORE</small>
            <div className={styles.scoreRow}><strong>72</strong><span>+4 pts 今週</span></div>
          </div>
          <div className={styles.todayTitle}>TODAY&apos;S ACTION</div>
          {tasks.map(task => (
            <div className={styles.task} key={task.n}>
              <div className={styles.taskTop}><span className={styles.num}>{task.n}</span><strong>{task.title}</strong><span className={styles.impact}>{task.impact}</span></div>
              <p>{task.body}</p>
            </div>
          ))}
          <div className={styles.handoff}>↗ 人の専門性が必要な施策は、プロへの依頼につなげる。</div>
        </div>
      </section>

      <section className={styles.strip}>
        <div className={styles.stripInner}>
          <div className={styles.stripItem}><small>01 / FIND</small><strong>課題を見つける</strong></div>
          <div className={styles.stripItem}><small>02 / DECIDE</small><strong>次の一手を決める</strong></div>
          <div className={styles.stripItem}><small>03 / ACT</small><strong>AIか人が実行する</strong></div>
          <div className={styles.stripItem}><small>04 / LEARN</small><strong>結果からまた改善する</strong></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.label}>FROM DATA TO ACTION</span>
          <h2>分析で終わらない。<br />ECを動かす。</h2>
          <p>管理画面を眺める時間を減らして、「結局、今日は何をすればいいのか」まで落とし込みます。</p>
        </div>
        <div className={styles.steps}>
          <article className={styles.step}><span className={styles.stepNum}>01</span><h3>見つける</h3><p>売上、流入、CVR、広告、商品ページなどから変化と改善余地を発見します。</p></article>
          <article className={styles.step}><span className={styles.stepNum}>02</span><h3>決める</h3><p>インパクトと緊急度から、やるべき施策を優先順位付きで提案します。</p></article>
          <article className={styles.step}><span className={styles.stepNum}>03</span><h3>つなげる</h3><p>AIでできる作業はAIへ。人の経験が必要な課題は専門家への依頼につなげます。</p></article>
        </div>
      </section>

      <section className={styles.diagnosisBand}>
        <div className={styles.diagnosisCard}>
          <div><span className={styles.label}>FREE EC CHECK</span><h2>あなたのEC、まだ伸ばせる。</h2><p>ECサイトのURLを入れるだけ。公開情報から改善ポイントと優先課題を無料でチェックします。</p></div>
          <a href="/diagnosis">無料で診断する →</a>
        </div>
      </section>

      <section className={styles.manager} id="manager">
        <div className={styles.managerInner}>
          <div className={styles.managerCopy}><span className={styles.label}>AI EC MANAGER</span><h2>EC運営に、<br />もう一人のマネージャーを。</h2><p>無料診断の先では、毎日のデータを見て「今日やるべきこと」を提案するAI ECマネージャーへ。自社ECにも、複数クライアントを持つコンサル・代理店にも使える設計を目指します。</p><a href="/ai-manager">詳しく見る →</a></div>
          <div className={styles.featureGrid}>{features.map(([title, text]) => <article className={styles.feature} key={title}><b>{title}</b><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className={styles.pro} id="pro">
        <div className={styles.proCard}>
          <div><span className={styles.label}>HUMAN WHEN NEEDED</span><h2>AIで足りない仕事は、<br />プロへ。</h2><p>ECplayersが人材データベースをゼロから抱えるのではなく、まずAIが課題を具体化。専門家が必要な施策だけ、既存のEC専門家ネットワーク等への連携を検討します。</p><div className={styles.coming}>専門家連携は今後の実装予定です。</div></div>
          <div className={styles.flow}><div className={styles.flowItem}><span>01</span>AIが課題を発見</div><div className={styles.flowItem}><span>02</span>必要なスキルと業務を定義</div><div className={styles.flowItem}><span>03</span>人が必要かを判断</div><div className={styles.flowItem}><span>04</span>最適な専門家へつなぐ</div></div>
        </div>
      </section>

      <section className={styles.audience}>
        <div className={styles.sectionHead}><span className={styles.label}>FOR EVERY EC PLAYER</span><h2>企業だけのツールではありません。</h2></div>
        <div className={styles.audienceGrid}>
          <article className={styles.audienceCard}><small>EC BUSINESS</small><h3>EC事業者・ショップ運営者</h3><p>自社の売上改善ポイントを継続的に把握し、次にやることを迷わない。</p></article>
          <article className={styles.audienceCard}><small>EC TEAM</small><h3>企業のEC担当者</h3><p>複数チャネルの情報を整理して、社内で優先順位を共有しやすくする。</p></article>
          <article className={styles.audienceCard}><small>EC PROFESSIONAL</small><h3>コンサル・代理店</h3><p>複数クライアントをAIにチェックさせ、見るべき案件へ時間を集中する。</p></article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <span className={styles.label}>START WITH A FREE CHECK</span>
        <h2>まず、次の一手を<br />見つけよう。</h2>
        <p>URLを入力して、ECplayersの無料EC診断を試せます。</p>
        <div className={styles.actions}><a className={styles.primary} href="/diagnosis">無料EC診断を始める →</a><a className={styles.secondary} href="/ai-manager">AI ECマネージャーを見る</a></div>
      </section>

      <footer className={styles.footer}><a href="/" className={styles.brand}>EC<span>players</span></a><span>売上を伸ばす、次の一手がわかる。</span><nav><a href="/diagnosis">無料診断</a><a href="/ai-manager">AI ECマネージャー</a><a href="/legacy">旧サイト</a></nav><span className={styles.operator}>運営：まんがびと</span></footer>
    </main>
  )
}
