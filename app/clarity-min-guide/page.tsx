'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './ClarityGuide.module.css'

type GoalKey = 'cvr' | 'aov' | 'dropoff' | 'lp'

type Step = {
  title: string
  path: string
  look: string[]
  action: string
  source: string
}

type Goal = {
  label: string
  kicker: string
  note: string
  steps: Step[]
}

const goals: Record<GoalKey, Goal> = {
  cvr: {
    label: 'CVRを上げたい',
    kicker: '購入までの迷いを減らす',
    note: '見るのは「届いたか → 押されたか → 迷ったか」の3つだけ。',
    steps: [
      { title: '重要情報まで届いたか', path: 'Heatmaps → Scroll', look: ['購入CTAまで到達しているか', '価格・メリット・レビューまで届いているか', '重要情報が平均折り目より下すぎないか'], action: '届いていない重要情報を上へ移す。', source: 'https://learn.microsoft.com/en-us/clarity/heatmaps/scroll-maps' },
      { title: '押してほしい場所が押されたか', path: 'Heatmaps → Click', look: ['購入ボタンが押されているか', '商品画像・選択肢・FAQ・レビューが使われているか', 'Dead / Rage / Error clickが目立たないか'], action: '押されないCTAは位置・文言・見た目を1つだけ変える。', source: 'https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview' },
      { title: '迷った瞬間を見る', path: 'Recordings', look: ['ECPルール：購入しなかったセッションを10件だけ見る', '戻る・連打・長時間停止がないか', '同じ詰まり方が3件以上ないか'], action: '共通して出た詰まりを次の改善1件にする。', source: 'https://learn.microsoft.com/en-us/clarity/session-recordings/inline-player' },
    ],
  },
  aov: {
    label: '客単価を上げたい',
    kicker: '高い商品が選ばれる導線を見る',
    note: '客単価そのものはEC/GA4を正として、Clarityでは「高価格帯を選ぶ行動」を探します。',
    steps: [
      { title: '高価格帯の商品閲覧に絞る', path: 'Filters → Product → Price', look: ['Product JSON-LD対応サイトで利用', '高価格帯を見たセッションを抽出', 'その人がどの導線・情報を見たか確認'], action: '高価格帯へ進む前に見られている情報を強化する。', source: 'https://learn.microsoft.com/en-us/clarity/filters/clarity-filters' },
      { title: '高購入につながるクリックを見る', path: 'Heatmaps → Conversion', look: ['Purchase eventをClarityが検出している場合に利用', '購入率の高いエリアを確認', '上位商品・セット・関連商品の導線を比較'], action: '購入につながる導線を目立たせる。', source: 'https://learn.microsoft.com/en-us/clarity/heatmaps/conversion-maps' },
      { title: '上位商品への導線を確認', path: 'Heatmaps → Click / Recordings', look: ['上位モデル・セット商品が押されているか', '比較表やレビューが見られているか', '高価格帯へ進んだ人の行動を確認'], action: '押されないアップセル導線を1か所だけ直す。', source: 'https://learn.microsoft.com/en-us/clarity/insights/e-commerce-insights' },
    ],
  },
  dropoff: {
    label: '離脱を減らしたい',
    kicker: '壊れている・詰まっている場所を探す',
    note: '「違和感のある操作」を先に見ると、短時間で直す場所が決まります。',
    steps: [
      { title: '異常クリックを見る', path: 'Heatmaps → Click', look: ['Dead click', 'Rage click', 'Error click'], action: '多い箇所から1つ直す。', source: 'https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview' },
      { title: '詰まりセッションを見る', path: 'Recordings', look: ['Rage clicks', 'Dead clicks', 'Excessive scrolling', 'Quick backs'], action: '同じ症状が繰り返されるページを優先する。', source: 'https://learn.microsoft.com/en-us/clarity/session-recordings/inline-player' },
      { title: '直した後に比較', path: 'Heatmaps → Compare', look: ['変更前後のHeatmapを比較', 'CTA到達・クリックの変化を見る', '異常クリックが減ったか確認'], action: '改善したら次の1件へ。', source: 'https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview' },
    ],
  },
  lp: {
    label: 'LPを改善したい',
    kicker: '順番を固定して迷わない',
    note: 'LPは「Scroll → Click → Recordings」の順だけ覚えればOK。',
    steps: [
      { title: 'Scroll', path: 'Heatmaps → Scroll', look: ['どこで急に到達率が落ちるか', 'CTA・価格・レビューまで届くか', '平均折り目より上に何があるか'], action: '重要情報の順番を直す。', source: 'https://learn.microsoft.com/en-us/clarity/heatmaps/scroll-maps' },
      { title: 'Click', path: 'Heatmaps → Click', look: ['主CTAが押されているか', '意図しない場所が押されていないか', 'PC / Mobileで差がないか'], action: 'クリックを邪魔する要素を1つ減らす。', source: 'https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview' },
      { title: 'Recordings 10件', path: 'Recordings', look: ['ECPルール：10件だけ見る', '共通する迷いを探す', '改善候補を大量に出さない'], action: '最後に「次に直す1個」だけ決める。', source: 'https://learn.microsoft.com/en-us/clarity/session-recordings/inline-player' },
    ],
  },
}

const storageKey = 'ecp-clarity-min-guide-v1'

export default function ClarityGuidePage() {
  const [goal, setGoal] = useState<GoalKey>('cvr')
  const [done, setDone] = useState<number[]>([])
  const [nextFix, setNextFix] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.goal && parsed.goal in goals) setGoal(parsed.goal as GoalKey)
        if (Array.isArray(parsed.done)) setDone(parsed.done)
        if (typeof parsed.nextFix === 'string') setNextFix(parsed.nextFix)
      }
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { window.localStorage.setItem(storageKey, JSON.stringify({ goal, done, nextFix })) } catch {}
  }, [goal, done, nextFix, ready])

  const current = goals[goal]
  const progress = useMemo(() => Math.round((done.length / current.steps.length) * 100), [done, current.steps.length])

  const chooseGoal = (key: GoalKey) => { setGoal(key); setDone([]); setNextFix('') }
  const toggle = (index: number) => setDone((prev) => prev.includes(index) ? prev.filter((v) => v !== index) : [...prev, index])

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>← アプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>ECP / CLARITY MINIMUM GUIDE</span>
          <h1>Clarity、<br /><em>見る場所だけ。</em></h1>
          <p>使い方を覚えなくてOK。改善したい数字を選ぶと、今日見る場所を3つに絞ります。</p>
          <a className={styles.open} href="https://clarity.microsoft.com/" target="_blank" rel="noreferrer">Clarityを開く ↗</a>
        </div>
        <div className={styles.progressCard}>
          <span>TODAY&apos;S PROGRESS</span><strong>{progress}%</strong>
          <div><i style={{ width: `${progress}%` }} /></div>
          <p>{done.length} / {current.steps.length} 完了</p>
        </div>
      </section>

      <section className={styles.goals}>
        <span className={styles.sectionLabel}>01 / GOAL</span>
        <h2>今日は何を改善する？</h2>
        <div className={styles.goalGrid}>
          {(Object.keys(goals) as GoalKey[]).map((key) => (
            <button key={key} className={goal === key ? styles.activeGoal : ''} onClick={() => chooseGoal(key)}>
              <small>{goals[key].kicker}</small><strong>{goals[key].label}</strong><b>→</b>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.guide}>
        <div className={styles.guideHead}>
          <div><span className={styles.sectionLabel}>02 / LOOK HERE</span><h2>{current.label}</h2><p>{current.note}</p></div>
          <div className={styles.rule}>Clarityを全部見ない。<br /><strong>3つ見て、1個直す。</strong></div>
        </div>

        <div className={styles.steps}>
          {current.steps.map((step, index) => {
            const isDone = done.includes(index)
            return (
              <article key={`${goal}-${index}`} className={isDone ? styles.stepDone : ''}>
                <div className={styles.stepTop}><span>0{index + 1}</span><button onClick={() => toggle(index)}>{isDone ? '✓ 完了' : '完了にする'}</button></div>
                <h3>{step.title}</h3>
                <div className={styles.path}>{step.path}</div>
                <ul>{step.look.map((item) => <li key={item}>{item}</li>)}</ul>
                <div className={styles.action}><small>見たらやること</small><strong>{step.action}</strong></div>
                <a href={step.source} target="_blank" rel="noreferrer">Microsoft公式 ↗</a>
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.finish}>
        <span className={styles.sectionLabel}>03 / ONE ACTION</span>
        <h2>次に直す1個だけ決める。</h2>
        <p>改善候補を10個作らない。今日のClarity確認は、この1件が決まったら終了です。</p>
        <textarea value={nextFix} onChange={(e) => setNextFix(e.target.value)} placeholder="例：購入ボタン直前に送料説明を追加する" />
        <div className={styles.finishMeta}><span>{nextFix ? '保存済み' : '未入力'}</span><button onClick={() => { setDone([]); setNextFix('') }}>今日のチェックをリセット</button></div>
      </section>

      <section className={styles.truth}>
        <strong>客単価について</strong>
        <p>客単価の数値そのものはGA4やECカート側を正として使います。Clarityは、Product JSON-LDがある場合のPriceフィルターや、購入イベント検出時のConversion mapsなどで「高価格帯を選ぶ行動」を確認する用途に使います。</p>
        <a href="https://learn.microsoft.com/en-us/clarity/insights/e-commerce-insights" target="_blank" rel="noreferrer">E-Commerce Insights公式 ↗</a>
      </section>

      <footer className={styles.footer}><a href="/">ECplayers</a><span>ECの面倒を、アプリにする。</span></footer>
    </main>
  )
}
