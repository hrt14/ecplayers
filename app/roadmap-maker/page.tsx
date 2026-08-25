'use client'

import { useMemo, useState } from 'react'
import styles from './RoadmapMaker.module.css'

type Channel = '楽天' | 'Amazon' | '自社EC' | 'Yahoo!ショッピング' | 'その他'
type Actuals = Record<number, string>

type RoadmapRow = {
  month: number
  revenue: number
  sessions: number
  cvr: number
  aov: number
  theme: string
  actions: string[]
}

const channelActions: Record<Channel, { sessions: string[]; cvr: string[]; aov: string[] }> = {
  楽天: {
    sessions: ['RPP検索語句を分解し、伸ばすKWを追加', 'イベント流入に合わせてクーポン・広告を前倒し', '商品ページ数・セット商品を増やして入口を増やす'],
    cvr: ['1枚目画像と商品名を競合検索結果で比較', '低評価レビューから不足説明を商品ページへ追加', 'ランキング・レビュー・FAQなど安心材料を強化'],
    aov: ['2個・3個セット商品を追加', '送料無料ラインを使った買い足し導線を作る', 'まとめ買いクーポンをテスト'],
  },
  Amazon: {
    sessions: ['広告の検索語句から新規KWを追加', 'スポンサーブランド・動画広告の未実施枠を確認', 'バリエーション分解やセット品で商品入口を増やす'],
    cvr: ['メイン画像・タイトルを検索結果で競合比較', 'A+・FAQ・商品仕様の不足を低評価レビューから補完', 'レビュー数・評価差を踏まえて訴求順を見直す'],
    aov: ['複数個セットASINを追加', '容量違い・上位モデルへの比較導線を強化', 'まとめ買い前提の価格設計をテスト'],
  },
  自社EC: {
    sessions: ['Google・Meta広告の増額余地を確認', 'SEOで新規流入ページを追加', 'LINE・メルマガから再訪セッションを作る'],
    cvr: ['Clarityで離脱箇所を確認して購入導線を修正', 'ファーストビュー・CTA・送料表示を改善', 'レビュー・FAQ・返品条件を購入前に見せる'],
    aov: ['セット販売・アップセルを追加', '送料無料条件とカート内レコメンドを調整', '購入点数別の特典をテスト'],
  },
  'Yahoo!ショッピング': {
    sessions: ['検索広告の実績KWを追加', '商品数・セット商品を増やす', '販促日程に合わせて流入施策を集中'],
    cvr: ['商品画像・タイトルを検索結果で比較', 'レビュー・商品説明・配送情報を強化', '価格・ポイント込みの見え方を競合比較'],
    aov: ['複数個セット商品を追加', 'まとめ買い施策を追加', '関連商品の同時購入導線を作る'],
  },
  その他: {
    sessions: ['伸びている流入元へ予算・工数を寄せる', '新しい商品入口・記事・広告面を追加', '既存顧客への再訪導線を作る'],
    cvr: ['購入前の不安・不足情報を洗い出す', 'ファーストビューとCTAを改善', 'レビュー・FAQ・実績など信頼材料を追加'],
    aov: ['セット販売を追加', 'アップセル・クロスセルを追加', 'まとめ買い特典をテスト'],
  },
}

const yen = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 })

function solveMonthlyGrowth(baseMonthlyRevenue: number, annualTarget: number) {
  if (baseMonthlyRevenue <= 0 || annualTarget <= 0) return 1
  const flat = baseMonthlyRevenue * 12
  if (Math.abs(flat - annualTarget) / Math.max(annualTarget, 1) < 0.0001) return 1

  let low = 0.55
  let high = 1.65
  for (let i = 0; i < 100; i += 1) {
    const g = (low + high) / 2
    let total = 0
    for (let m = 1; m <= 12; m += 1) total += baseMonthlyRevenue * Math.pow(g, m)
    if (total < annualTarget) low = g
    else high = g
  }
  return (low + high) / 2
}

function buildRoadmap(
  annualTarget: number,
  baseRevenue: number,
  baseSessions: number,
  baseCvr: number,
  baseAov: number,
  channel: Channel,
  weights: { sessions: number; cvr: number; aov: number },
): RoadmapRow[] {
  const totalWeight = Math.max(weights.sessions + weights.cvr + weights.aov, 1)
  const ws = weights.sessions / totalWeight
  const wc = weights.cvr / totalWeight
  const wa = weights.aov / totalWeight
  const g = solveMonthlyGrowth(baseRevenue, annualTarget)
  const actions = channelActions[channel]

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    const rawRevenue = baseRevenue * Math.pow(g, month)
    const ratio = Math.max(rawRevenue / Math.max(baseRevenue, 1), 0.01)
    const sessionTarget = baseSessions * Math.pow(ratio, ws)
    const cvrTarget = baseCvr * Math.pow(ratio, wc)
    const aovTarget = baseAov * Math.pow(ratio, wa)

    const gaps = [
      { key: 'sessions' as const, label: 'セッション', value: Math.abs(sessionTarget / Math.max(baseSessions, 1) - 1) },
      { key: 'cvr' as const, label: 'CVR', value: Math.abs(cvrTarget / Math.max(baseCvr, 0.01) - 1) },
      { key: 'aov' as const, label: '客単価', value: Math.abs(aovTarget / Math.max(baseAov, 1) - 1) },
    ].sort((a, b) => b.value - a.value)

    const primary = gaps[0]
    const secondary = gaps[1]
    const actionList = [
      actions[primary.key][index % actions[primary.key].length],
      actions[secondary.key][(index + 1) % actions[secondary.key].length],
      index % 3 === 0 ? '前月施策の効果を振り返り、翌月目標を補正' : '未実施施策を棚卸しして優先順位を更新',
    ]

    return {
      month,
      revenue: rawRevenue,
      sessions: sessionTarget,
      cvr: cvrTarget,
      aov: aovTarget,
      theme: `${primary.label}を伸ばす月`,
      actions: actionList,
    }
  })
}

export default function RoadmapMaker() {
  const [annualTarget, setAnnualTarget] = useState(180000000)
  const [baseRevenue, setBaseRevenue] = useState(10000000)
  const [baseSessions, setBaseSessions] = useState(100000)
  const [baseCvr, setBaseCvr] = useState(5)
  const [baseAov, setBaseAov] = useState(2000)
  const [channel, setChannel] = useState<Channel>('楽天')
  const [sessionWeight, setSessionWeight] = useState(50)
  const [cvrWeight, setCvrWeight] = useState(30)
  const [aovWeight, setAovWeight] = useState(20)
  const [actuals, setActuals] = useState<Actuals>({})
  const [copied, setCopied] = useState(false)

  const roadmap = useMemo(
    () => buildRoadmap(annualTarget, baseRevenue, baseSessions, baseCvr, baseAov, channel, {
      sessions: sessionWeight,
      cvr: cvrWeight,
      aov: aovWeight,
    }),
    [annualTarget, baseRevenue, baseSessions, baseCvr, baseAov, channel, sessionWeight, cvrWeight, aovWeight],
  )

  const roadmapTotal = roadmap.reduce((sum, row) => sum + row.revenue, 0)
  const final = roadmap[11]
  const growthRate = annualTarget / Math.max(baseRevenue * 12, 1)

  function copyRoadmap() {
    const header = '月\t売上目標\tセッション\tCVR\t客単価\tテーマ\t施策'
    const body = roadmap.map(row => [
      `${row.month}月`,
      Math.round(row.revenue),
      Math.round(row.sessions),
      `${row.cvr.toFixed(2)}%`,
      Math.round(row.aov),
      row.theme,
      row.actions.join(' / '),
    ].join('\t')).join('\n')
    navigator.clipboard.writeText(`${header}\n${body}`).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  function downloadCsv() {
    const rows = [
      ['月', '売上目標', 'セッション', 'CVR', '客単価', 'テーマ', '施策1', '施策2', '施策3'],
      ...roadmap.map(row => [
        `${row.month}月`,
        Math.round(row.revenue),
        Math.round(row.sessions),
        row.cvr.toFixed(2),
        Math.round(row.aov),
        row.theme,
        ...row.actions,
      ]),
    ]
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'ec-roadmap.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerRight}>
          <span>FREE TOOL</span>
          <a href="/">アプリ一覧へ</a>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>ROADMAP MAKER</span>
          <h1>年商目標から、<br /><em>毎月やること</em>まで逆算。</h1>
          <p>売上 = セッション × CVR × 客単価。目標年商を12か月のKPIへ分解し、EC施策のロードマップを自動で作ります。</p>
        </div>
        <div className={styles.heroFormula}>
          <small>EC GROWTH FORMULA</small>
          <b>売上</b>
          <span>=</span>
          <strong>Session</strong><i>×</i><strong>CVR</strong><i>×</i><strong>客単価</strong>
        </div>
      </section>

      <section className={styles.builder}>
        <aside className={styles.panel}>
          <div className={styles.panelHead}>
            <span>01</span>
            <div><small>INPUT</small><h2>目標と現状</h2></div>
          </div>

          <label className={styles.field}>
            <span>目標年商</span>
            <div><input type="number" min="1" value={annualTarget} onChange={e => setAnnualTarget(Number(e.target.value))} /><b>円</b></div>
          </label>
          <label className={styles.field}>
            <span>現在の月商</span>
            <div><input type="number" min="1" value={baseRevenue} onChange={e => setBaseRevenue(Number(e.target.value))} /><b>円</b></div>
          </label>
          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span>月間セッション</span>
              <div><input type="number" min="1" value={baseSessions} onChange={e => setBaseSessions(Number(e.target.value))} /><b>回</b></div>
            </label>
            <label className={styles.field}>
              <span>CVR</span>
              <div><input type="number" min="0.01" step="0.01" value={baseCvr} onChange={e => setBaseCvr(Number(e.target.value))} /><b>%</b></div>
            </label>
          </div>
          <label className={styles.field}>
            <span>客単価</span>
            <div><input type="number" min="1" value={baseAov} onChange={e => setBaseAov(Number(e.target.value))} /><b>円</b></div>
          </label>
          <label className={styles.field}>
            <span>チャネル</span>
            <select value={channel} onChange={e => setChannel(e.target.value as Channel)}>
              <option>楽天</option><option>Amazon</option><option>自社EC</option><option>Yahoo!ショッピング</option><option>その他</option>
            </select>
          </label>

          <div className={styles.weightBox}>
            <div className={styles.weightTitle}><b>KPIの伸ばし方</b><small>合計値は自動で比率化します</small></div>
            <label><span>セッション <b>{sessionWeight}</b></span><input type="range" min="0" max="100" value={sessionWeight} onChange={e => setSessionWeight(Number(e.target.value))} /></label>
            <label><span>CVR <b>{cvrWeight}</b></span><input type="range" min="0" max="100" value={cvrWeight} onChange={e => setCvrWeight(Number(e.target.value))} /></label>
            <label><span>客単価 <b>{aovWeight}</b></span><input type="range" min="0" max="100" value={aovWeight} onChange={e => setAovWeight(Number(e.target.value))} /></label>
          </div>
        </aside>

        <div className={styles.output}>
          <div className={styles.summaryGrid}>
            <article><span>年間目標</span><b>¥{yen.format(Math.round(annualTarget))}</b><small>現状年商比 ×{growthRate.toFixed(2)}</small></article>
            <article><span>12月 月商目標</span><b>¥{yen.format(Math.round(final.revenue))}</b><small>現在 ¥{yen.format(baseRevenue)}</small></article>
            <article><span>12月 Session</span><b>{num.format(Math.round(final.sessions))}</b><small>現在 {num.format(baseSessions)}</small></article>
            <article><span>12月 CVR</span><b>{final.cvr.toFixed(2)}%</b><small>現在 {baseCvr.toFixed(2)}%</small></article>
            <article><span>12月 客単価</span><b>¥{yen.format(Math.round(final.aov))}</b><small>現在 ¥{yen.format(baseAov)}</small></article>
          </div>

          <div className={styles.planHead}>
            <div><span>02</span><div><small>ROADMAP</small><h2>12か月ロードマップ</h2></div></div>
            <div className={styles.planActions}><button onClick={copyRoadmap}>{copied ? 'コピーしました' : '表をコピー'}</button><button className={styles.darkButton} onClick={downloadCsv}>CSV保存</button></div>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>月</th><th>売上目標</th><th>Session</th><th>CVR</th><th>客単価</th><th>重点</th><th>実績売上</th></tr></thead>
              <tbody>
                {roadmap.map(row => {
                  const actual = Number(actuals[row.month] || 0)
                  const gap = actual > 0 ? actual / row.revenue - 1 : null
                  return (
                    <tr key={row.month}>
                      <td><b>{row.month}月</b></td>
                      <td>¥{yen.format(Math.round(row.revenue))}</td>
                      <td>{num.format(Math.round(row.sessions))}</td>
                      <td>{row.cvr.toFixed(2)}%</td>
                      <td>¥{yen.format(Math.round(row.aov))}</td>
                      <td><span className={styles.theme}>{row.theme}</span></td>
                      <td>
                        <div className={styles.actualCell}>
                          <input aria-label={`${row.month}月の実績売上`} type="number" placeholder="実績" value={actuals[row.month] ?? ''} onChange={e => setActuals(prev => ({ ...prev, [row.month]: e.target.value }))} />
                          {gap !== null && <small className={gap >= 0 ? styles.plusGap : styles.minusGap}>{gap >= 0 ? '+' : ''}{(gap * 100).toFixed(1)}%</small>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.actionSection}>
            <div className={styles.actionHead}><span>03</span><div><small>ACTIONS</small><h2>月ごとの施策</h2></div></div>
            <div className={styles.actionGrid}>
              {roadmap.map(row => (
                <article key={row.month}>
                  <div className={styles.monthTop}><b>{String(row.month).padStart(2, '0')}</b><span>{row.theme}</span></div>
                  <strong>¥{yen.format(Math.round(row.revenue))}</strong>
                  <ul>{row.actions.map(action => <li key={action}>{action}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.note}>
        <b>計算ロジック</b>
        <p>現在の月商から目標年商へ到達する月次成長率を逆算し、売上差分を「セッション・CVR・客単価」に指定比率で配分しています。季節要因や在庫制約がある場合は、完成したロードマップを実態に合わせて調整してください。</p>
        <span>入力した数値はこのページ内の計算だけに使われ、サーバーには保存しません。</span>
      </section>

      <footer className={styles.footer}><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p></footer>
    </main>
  )
}
