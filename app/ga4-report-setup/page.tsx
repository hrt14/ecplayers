'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './Ga4ReportSetup.module.css'

type Step = {
  id: string
  number: string
  title: string
  purpose: string
  path: string
  checks: string[]
  tip: string
  source: string
}

const steps: Step[] = [
  {
    id: 'purchase',
    number: '01',
    title: 'purchaseを確認',
    purpose: 'まず購入完了がGA4に入っているかを確認します。ここが取れていない状態では、売上分析を先に進めません。',
    path: '管理 → データの表示 → イベント',
    checks: ['purchase が一覧にある', '実際の購入テスト後にイベントが確認できる', 'ECサイト側の売上計測と大きなズレがない'],
    tip: 'purchase が見つからない場合は、レポート設定より先にEC計測の実装を確認します。',
    source: 'https://support.google.com/analytics/answer/9267735?hl=ja',
  },
  {
    id: 'traffic',
    number: '02',
    title: '流入別レポート',
    purpose: 'Google広告、自然検索、SNS、メールなど、どこから来たセッションが成果につながっているかを見ます。',
    path: 'レポート → 集客 → トラフィック獲得',
    checks: ['セッションのデフォルト チャネル グループで見られる', '必要ならセッションの参照元 / メディアへ切り替えられる', 'セッション・キーイベント・総収益を一緒に見られる'],
    tip: '日常運用では「セッションが増えたか」「成果率が変わったか」「売上まで増えたか」を流入元ごとに確認します。',
    source: 'https://support.google.com/analytics/answer/12923437?hl=ja',
  },
  {
    id: 'landing',
    number: '03',
    title: 'ランディングページ',
    purpose: 'ユーザーが最初に入ったページごとに、入口の強さを確認します。SEO・広告・LP改善の基本レポートです。',
    path: 'レポート → エンゲージメント → ランディング ページ',
    checks: ['ランディング ページを開ける', 'セッションを確認できる', 'キーイベント・総収益を確認できる'],
    tip: 'アクセスが多いのに成果が弱い入口ページは、優先的な改善候補になります。',
    source: 'https://support.google.com/analytics/answer/12931766?hl=ja',
  },
  {
    id: 'pages',
    number: '04',
    title: 'ページ別レポート',
    purpose: 'サイト内でどのページが見られているかを確認します。商品ページ、特集、FAQなどの利用状況を見る基本レポートです。',
    path: 'レポート → エンゲージメント → ページとスクリーン',
    checks: ['ページとスクリーンを開ける', 'ページパスまたはページタイトルで見られる', '表示回数・ユーザー・キーイベントを確認できる'],
    tip: '「よく見られるページ」だけでなく「見られているのに成果につながっていないページ」を探します。',
    source: 'https://support.google.com/analytics/answer/12926732?hl=ja',
  },
  {
    id: 'ecommerce',
    number: '05',
    title: '商品別レポート',
    purpose: '商品ごとの閲覧、カート追加、購入、収益を確認します。ECでは最重要の標準レポートのひとつです。',
    path: 'レポート → 収益化 → eコマース購入数',
    checks: ['eコマース購入数を開ける', 'アイテム名またはアイテムIDで見られる', '閲覧・カート追加・購入・アイテム収益を確認できる'],
    tip: '商品を見る → カートに入れる → 購入する、のどこで弱くなっているかを見ます。',
    source: 'https://support.google.com/analytics/answer/12924131?hl=ja',
  },
  {
    id: 'key-events',
    number: '06',
    title: 'キーイベントを整理',
    purpose: '購入以外に重要な行動がある場合だけ、問い合わせ・会員登録などをキーイベントとして整理します。',
    path: '管理 → データの表示 → イベント',
    checks: ['本当に重要なイベントだけを選んだ', '問い合わせ・登録など必要な成果地点を確認した', '不要なイベントを成果指標にしていない'],
    tip: 'キーイベントを増やしすぎると「成果」が何を指すか分かりづらくなります。経営上の成果に直結するものを優先します。',
    source: 'https://support.google.com/analytics/answer/13128484?hl=ja',
  },
  {
    id: 'customize',
    number: '07',
    title: '見やすく固定',
    purpose: '毎回迷わないように、よく見る指標だけを詳細レポートに残して日常運用を短くします。',
    path: '対象レポート → 右上「レポートをカスタマイズ」',
    checks: ['不要な指標を減らした', 'アクセス → 行動 → 成果 → 売上の順で見やすくした', '必要なレポートを左メニューからすぐ開ける'],
    tip: '最初は「セッション・ユーザー・キーイベント・成果率・総収益」程度に絞り、必要になってから増やします。',
    source: 'https://support.google.com/analytics/answer/10445879?hl=ja',
  },
]

const storageKey = 'ecp-ga4-report-setup-v1'

export default function Ga4ReportSetupPage() {
  const [completed, setCompleted] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved) setCompleted(JSON.parse(saved))
    } catch {
      // localStorageが使えない環境でもマニュアル自体は利用できる
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(completed))
    } catch {
      // 保存できない場合はセッション中だけ状態を保持する
    }
  }, [completed, ready])

  const progress = useMemo(() => Math.round((completed.length / steps.length) * 100), [completed])

  const toggle = (id: string) => {
    setCompleted((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const reset = () => setCompleted([])

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>← アプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>ECP / GA4 STANDARD REPORT SETUP</div>
          <h1>GA4、<br /><em>見る場所を固定する。</em></h1>
          <p>EC運用で毎回迷わないための、定番レポート設定マニュアル。GA4を横に開いて、上から順に完了させればOKです。</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#setup">10分セットアップを始める →</a>
            <a className={styles.secondary} href="#daily">毎日の見方だけ見る</a>
          </div>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.progressTop}><span>SETUP PROGRESS</span><strong>{progress}%</strong></div>
          <div className={styles.progressTrack}><i style={{ width: `${progress}%` }} /></div>
          <p>{completed.length} / {steps.length} 完了</p>
          {progress === 100 ? <b className={styles.doneMessage}>設定完了。次からは見るだけです。</b> : <b>上から順にチェックしてください。</b>}
          {completed.length > 0 && <button type="button" onClick={reset}>進捗をリセット</button>}
        </div>
      </section>

      <section className={styles.ruleBox}>
        <span>EC RULE</span>
        <h2>売上 ＝ セッション × CVR × 客単価</h2>
        <p>GA4を全部覚える必要はありません。まず「どこから来たか」「どこから入ったか」「何を見たか」「何が売れたか」「成果につながったか」を固定して見ます。</p>
      </section>

      <section className={styles.setup} id="setup">
        <div className={styles.sectionTitle}>
          <span>10 MINUTE SETUP</span>
          <h2>この7つだけ設定。</h2>
          <p>各カードの「GA4で開く場所」をそのまま辿ってください。終わったら右上のチェックを押します。</p>
        </div>

        <div className={styles.stepList}>
          {steps.map((step) => {
            const isDone = completed.includes(step.id)
            return (
              <article className={`${styles.stepCard} ${isDone ? styles.completed : ''}`} key={step.id}>
                <div className={styles.stepHead}>
                  <div><span>{step.number}</span><h3>{step.title}</h3></div>
                  <button type="button" onClick={() => toggle(step.id)} aria-pressed={isDone} aria-label={`${step.title}を${isDone ? '未完了' : '完了'}にする`}>
                    {isDone ? '✓ 完了' : '完了にする'}
                  </button>
                </div>
                <p className={styles.purpose}>{step.purpose}</p>

                <div className={styles.pathBox}>
                  <small>GA4で開く場所</small>
                  <strong>{step.path}</strong>
                </div>

                <div className={styles.checkGrid}>
                  {step.checks.map((check) => <div key={check}><i>✓</i><span>{check}</span></div>)}
                </div>

                <div className={styles.tip}><b>見るポイント</b><p>{step.tip}</p></div>
                <a className={styles.source} href={step.source} target="_blank" rel="noreferrer">Google公式ヘルプで確認 ↗</a>
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.daily} id="daily">
        <div className={styles.sectionTitle}>
          <span>DAILY ROUTINE</span>
          <h2>数字が動いたら、この順番。</h2>
          <p>毎回すべてのレポートを眺めるのではなく、売上の変化から原因を下へ掘ります。</p>
        </div>

        <div className={styles.flow}>
          <article><b>1</b><span>売上</span><strong>増えた？減った？</strong><p>まず変化があったかだけ確認。</p></article>
          <i>↓</i>
          <article><b>2</b><span>セッション</span><strong>アクセス量は変わった？</strong><p>トラフィック獲得へ。</p></article>
          <i>↓</i>
          <article><b>3</b><span>CVR</span><strong>成果率は変わった？</strong><p>キーイベント・購入を見る。</p></article>
          <i>↓</i>
          <article><b>4</b><span>入口</span><strong>どこが変わった？</strong><p>流入元・ランディングページへ。</p></article>
          <i>↓</i>
          <article><b>5</b><span>商品</span><strong>何が売れた／落ちた？</strong><p>eコマース購入数へ。</p></article>
        </div>
      </section>

      <section className={styles.minimum}>
        <div>
          <span>MINIMUM DASHBOARD</span>
          <h2>迷ったら、この5つ。</h2>
        </div>
        <div className={styles.minimumGrid}>
          <article><b>01</b><h3>流入</h3><p>トラフィック獲得</p></article>
          <article><b>02</b><h3>入口</h3><p>ランディング ページ</p></article>
          <article><b>03</b><h3>ページ</h3><p>ページとスクリーン</p></article>
          <article><b>04</b><h3>商品</h3><p>eコマース購入数</p></article>
          <article><b>05</b><h3>成果</h3><p>キーイベント・総収益</p></article>
        </div>
      </section>

      <section className={styles.note}>
        <span>NOTE</span>
        <h2>メニューが見つからない場合</h2>
        <p>GA4ではプロパティの設定や権限により表示されるレポートが異なる場合があります。必要なレポートが左メニューにないときは、レポートの「ライブラリ」やカスタマイズ機能を確認してください。</p>
        <a href="https://support.google.com/analytics/answer/10445879?hl=ja" target="_blank" rel="noreferrer">Google公式：詳細レポートをカスタマイズする ↗</a>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <p>ECの面倒を、アプリにする。</p>
      </footer>
    </main>
  )
}
