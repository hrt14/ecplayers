'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './InitiativeLog.module.css'

type Platform = 'Amazon' | '楽天' | 'GA4'
type Goal = 'セッション' | 'CVR' | '客単価' | '売上'
type MetricField = 'traffic' | 'orders' | 'sales'

type Initiative = {
  id: string
  name: string
  date: string
  platform: Platform
  goal: Goal
  windowDays: number
  target: string
  memo: string
  before: Partial<Record<MetricField, string>>
  after: Partial<Record<MetricField, string>>
  createdAt: number
}

type Draft = {
  name: string
  date: string
  platform: Platform
  goal: Goal
  windowDays: number
  target: string
  memo: string
}

const STORAGE_KEY = 'ecp-initiative-log-v1'
const WINDOWS = [7, 14, 28]

const todayLocal = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const blankDraft = (): Draft => ({
  name: '',
  date: todayLocal(),
  platform: 'Amazon',
  goal: 'CVR',
  windowDays: 7,
  target: '',
  memo: '',
})

const sampleInitiatives: Initiative[] = [
  {
    id: 'sample-1',
    name: '商品画像1枚目を変更',
    date: todayLocal(),
    platform: 'Amazon',
    goal: 'CVR',
    windowDays: 7,
    target: '主力商品',
    memo: '検索結果で訴求が弱かったため、ベネフィットを大きく見せる画像へ変更。',
    before: { traffic: '2450', orders: '86' },
    after: { traffic: '2510', orders: '104' },
    createdAt: Date.now(),
  },
]

const metricFieldsByGoal: Record<Goal, MetricField[]> = {
  'セッション': ['traffic'],
  'CVR': ['traffic', 'orders'],
  '客単価': ['sales', 'orders'],
  '売上': ['sales'],
}

const platformLabels: Record<Platform, Record<MetricField, string>> = {
  Amazon: {
    traffic: 'セッション',
    orders: '注文数',
    sales: '売上',
  },
  楽天: {
    traffic: 'アクセス人数',
    orders: '注文数',
    sales: '売上',
  },
  GA4: {
    traffic: 'セッション',
    orders: '購入数',
    sales: '購入売上',
  },
}

const sourceHint: Record<Platform, string> = {
  Amazon: 'Amazon側のレポートから対象期間の数値を確認',
  楽天: '楽天側のアクセス・売上分析から対象期間の数値を確認',
  GA4: 'GA4で対象期間のセッション・購入・購入売上を確認',
}

const parseNumber = (value?: string) => {
  if (!value) return null
  const normalized = value.replace(/[\s,，¥￥%％]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const formatNumber = (value: number, digits = 0) => value.toLocaleString('ja-JP', {
  maximumFractionDigits: digits,
  minimumFractionDigits: digits,
})

const formatYen = (value: number) => `${Math.round(value).toLocaleString('ja-JP')}円`

const evaluate = (initiative: Initiative) => {
  const trafficBefore = parseNumber(initiative.before.traffic)
  const trafficAfter = parseNumber(initiative.after.traffic)
  const ordersBefore = parseNumber(initiative.before.orders)
  const ordersAfter = parseNumber(initiative.after.orders)
  const salesBefore = parseNumber(initiative.before.sales)
  const salesAfter = parseNumber(initiative.after.sales)

  let before: number | null = null
  let after: number | null = null
  let displayBefore = '—'
  let displayAfter = '—'
  let absolute = ''

  if (initiative.goal === 'セッション') {
    before = trafficBefore
    after = trafficAfter
    if (before !== null) displayBefore = formatNumber(before)
    if (after !== null) displayAfter = formatNumber(after)
  }

  if (initiative.goal === 'CVR') {
    if (trafficBefore && ordersBefore !== null) before = (ordersBefore / trafficBefore) * 100
    if (trafficAfter && ordersAfter !== null) after = (ordersAfter / trafficAfter) * 100
    if (before !== null) displayBefore = `${formatNumber(before, 2)}%`
    if (after !== null) displayAfter = `${formatNumber(after, 2)}%`
    if (before !== null && after !== null) absolute = `${after >= before ? '+' : ''}${formatNumber(after - before, 2)}pt`
  }

  if (initiative.goal === '客単価') {
    if (salesBefore !== null && ordersBefore) before = salesBefore / ordersBefore
    if (salesAfter !== null && ordersAfter) after = salesAfter / ordersAfter
    if (before !== null) displayBefore = formatYen(before)
    if (after !== null) displayAfter = formatYen(after)
  }

  if (initiative.goal === '売上') {
    before = salesBefore
    after = salesAfter
    if (before !== null) displayBefore = formatYen(before)
    if (after !== null) displayAfter = formatYen(after)
  }

  if (before === null || after === null || before === 0) {
    return {
      ready: false,
      displayBefore,
      displayAfter,
      change: null as number | null,
      changeLabel: '検証待ち',
      absolute,
      verdict: 'afterを入力すると判定します',
      tone: 'waiting',
    }
  }

  const change = ((after - before) / before) * 100
  const changeLabel = `${change >= 0 ? '+' : ''}${formatNumber(change, 1)}%`
  const threshold = 3
  const verdict = change >= threshold
    ? '数値上は改善'
    : change <= -threshold
      ? '数値上は悪化'
      : 'ほぼ横ばい'
  const tone = change >= threshold ? 'good' : change <= -threshold ? 'bad' : 'flat'

  return { ready: true, displayBefore, displayAfter, change, changeLabel, absolute, verdict, tone }
}

const overlapMessage = (initiative: Initiative, all: Initiative[]) => {
  const base = new Date(`${initiative.date}T00:00:00`).getTime()
  if (!Number.isFinite(base)) return ''

  const overlaps = all.filter((other) => {
    if (other.id === initiative.id || other.platform !== initiative.platform) return false
    const otherDate = new Date(`${other.date}T00:00:00`).getTime()
    if (!Number.isFinite(otherDate)) return false
    const diffDays = Math.abs(otherDate - base) / 86400000
    return diffDays <= initiative.windowDays
  })

  if (!overlaps.length) return ''
  const names = overlaps.slice(0, 2).map((item) => `「${item.name}」`).join('、')
  return `同じ評価期間に ${names}${overlaps.length > 2 ? ' など' : ''} も実施されています。単独の効果とは断定しにくい状態です。`
}

export default function InitiativeLogPage() {
  const [draft, setDraft] = useState<Draft>(blankDraft)
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [platformFilter, setPlatformFilter] = useState<'すべて' | Platform>('すべて')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setInitiatives(parsed)
      }
    } catch {
      // 保存データが壊れている場合は空の状態で開始する
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initiatives))
  }, [hydrated, initiatives])

  const requiredFields = metricFieldsByGoal[draft.goal]

  const visibleInitiatives = useMemo(() => {
    const filtered = platformFilter === 'すべて'
      ? initiatives
      : initiatives.filter((item) => item.platform === platformFilter)
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }, [initiatives, platformFilter])

  const summary = useMemo(() => {
    const ready = initiatives.map((item) => ({ item, result: evaluate(item) })).filter(({ result }) => result.ready)
    const improved = ready.filter(({ result }) => result.tone === 'good').length
    const waiting = initiatives.length - ready.length
    return { total: initiatives.length, evaluated: ready.length, improved, waiting }
  }, [initiatives])

  const addInitiative = () => {
    if (!draft.name.trim() || !draft.date) return
    const next: Initiative = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...draft,
      name: draft.name.trim(),
      target: draft.target.trim(),
      memo: draft.memo.trim(),
      before: {},
      after: {},
      createdAt: Date.now(),
    }
    setInitiatives((current) => [next, ...current])
    setDraft((current) => ({ ...blankDraft(), platform: current.platform, goal: current.goal, windowDays: current.windowDays }))
  }

  const updateMetric = (id: string, phase: 'before' | 'after', field: MetricField, value: string) => {
    setInitiatives((current) => current.map((item) => item.id === id
      ? { ...item, [phase]: { ...item[phase], [field]: value } }
      : item))
  }

  const removeInitiative = (id: string) => {
    setInitiatives((current) => current.filter((item) => item.id !== id))
  }

  const loadSample = () => {
    setInitiatives(sampleInitiatives)
    setPlatformFilter('すべて')
  }

  const clearAll = () => {
    setInitiatives([])
    setPlatformFilter('すべて')
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/" className={styles.back}>← アプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>ECP / ACTION REVIEW</span>
          <h1>施策をやった日だけ、<br /><em>記録する。</em></h1>
          <p>Amazon・楽天・GA4。何を変えたかを残すと、あとで見るべき数字を自動で指定。前後の数値を入れるだけで、施策が効いたかを簡単に振り返れます。</p>
        </div>
        <div className={styles.heroCard}>
          <span>最小運用</span>
          <strong>① やった日に記録</strong>
          <strong>② あとで数字を入力</strong>
          <strong>③ 残す / 戻すを判断</strong>
          <small>データはこのブラウザ内に保存されます。</small>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article><span>記録した施策</span><strong>{summary.total}</strong><small>件</small></article>
        <article><span>検証済み</span><strong>{summary.evaluated}</strong><small>件</small></article>
        <article><span>改善</span><strong>{summary.improved}</strong><small>件</small></article>
        <article><span>検証待ち</span><strong>{summary.waiting}</strong><small>件</small></article>
      </section>

      <section className={styles.newSection}>
        <div className={styles.sectionHead}>
          <div><span className={styles.label}>01 / LOG</span><h2>今日やった施策を記録</h2></div>
          <p>細かく書かなくてOK。「何を変えたか」と「何に効かせたいか」だけ残します。</p>
        </div>

        <div className={styles.formCard}>
          <div className={styles.fieldWide}>
            <label>施策名</label>
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="例：商品画像1枚目を変更" />
          </div>
          <div className={styles.field}>
            <label>実施日</label>
            <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
          </div>
          <div className={styles.field}>
            <label>対象</label>
            <select value={draft.platform} onChange={(event) => setDraft({ ...draft, platform: event.target.value as Platform })}>
              <option>Amazon</option>
              <option>楽天</option>
              <option>GA4</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>狙い</label>
            <select value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value as Goal })}>
              <option>セッション</option>
              <option>CVR</option>
              <option>客単価</option>
              <option>売上</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>前後の比較期間</label>
            <select value={draft.windowDays} onChange={(event) => setDraft({ ...draft, windowDays: Number(event.target.value) })}>
              {WINDOWS.map((days) => <option key={days} value={days}>前後 {days} 日</option>)}
            </select>
          </div>
          <div className={styles.fieldWide}>
            <label>対象商品・ページ <small>任意</small></label>
            <input value={draft.target} onChange={(event) => setDraft({ ...draft, target: event.target.value })} placeholder="例：ASIN / 商品管理番号 / LP名" />
          </div>
          <div className={styles.fieldWide}>
            <label>メモ <small>任意</small></label>
            <textarea value={draft.memo} onChange={(event) => setDraft({ ...draft, memo: event.target.value })} placeholder="なぜ変えたか、何を変えたかを一言だけ" rows={3} />
          </div>

          <div className={styles.requestBox}>
            <div>
              <span>この施策であとから必要なデータ</span>
              <strong>{draft.platform} / {draft.goal}</strong>
              <p>{sourceHint[draft.platform]}</p>
            </div>
            <div className={styles.requestTags}>
              {requiredFields.map((field) => <span key={field}>{platformLabels[draft.platform][field]}</span>)}
              <b>実施前 {draft.windowDays}日</b>
              <b>実施後 {draft.windowDays}日</b>
            </div>
          </div>

          <button className={styles.addButton} onClick={addInitiative} disabled={!draft.name.trim() || !draft.date}>施策を記録する →</button>
        </div>
      </section>

      <section className={styles.reviewSection}>
        <div className={styles.sectionHead}>
          <div><span className={styles.label}>02 / REVIEW</span><h2>あとで数字を入れて振り返る</h2></div>
          <p>施策前後で同じ長さの期間を比較します。季節性や他施策が重なる場合は、結果を因果関係として断定しません。</p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {(['すべて', 'Amazon', '楽天', 'GA4'] as const).map((item) => (
              <button key={item} className={platformFilter === item ? styles.activeFilter : ''} onClick={() => setPlatformFilter(item)}>{item}</button>
            ))}
          </div>
          <div className={styles.toolbarActions}>
            {!initiatives.length && <button onClick={loadSample}>サンプルを見る</button>}
            {!!initiatives.length && <button onClick={clearAll}>すべて消す</button>}
          </div>
        </div>

        {!visibleInitiatives.length ? (
          <div className={styles.empty}>
            <strong>まだ施策がありません。</strong>
            <p>上で1件記録すると、ここに振り返り欄ができます。</p>
            <button onClick={loadSample}>サンプルで試す</button>
          </div>
        ) : (
          <div className={styles.logList}>
            {visibleInitiatives.map((initiative) => {
              const fields = metricFieldsByGoal[initiative.goal]
              const result = evaluate(initiative)
              const overlap = overlapMessage(initiative, initiatives)
              return (
                <article className={styles.logCard} key={initiative.id}>
                  <div className={styles.logHead}>
                    <div>
                      <div className={styles.meta}><span>{initiative.platform}</span><b>{initiative.goal}</b><time>{initiative.date}</time></div>
                      <h3>{initiative.name}</h3>
                      {(initiative.target || initiative.memo) && <p>{initiative.target ? `対象：${initiative.target}` : ''}{initiative.target && initiative.memo ? ' / ' : ''}{initiative.memo}</p>}
                    </div>
                    <button className={styles.deleteButton} onClick={() => removeInitiative(initiative.id)} aria-label="施策を削除">×</button>
                  </div>

                  <div className={styles.periodNote}>実施前 {initiative.windowDays}日 ↔ 実施後 {initiative.windowDays}日 を比較</div>

                  <div className={styles.dataGrid}>
                    <div className={styles.dataColumn}>
                      <span>実施前</span>
                      {fields.map((field) => (
                        <label key={`before-${field}`}>
                          <small>{platformLabels[initiative.platform][field]}</small>
                          <input inputMode="decimal" value={initiative.before[field] ?? ''} onChange={(event) => updateMetric(initiative.id, 'before', field, event.target.value)} placeholder="0" />
                        </label>
                      ))}
                    </div>
                    <div className={styles.arrow}>→</div>
                    <div className={styles.dataColumn}>
                      <span>実施後</span>
                      {fields.map((field) => (
                        <label key={`after-${field}`}>
                          <small>{platformLabels[initiative.platform][field]}</small>
                          <input inputMode="decimal" value={initiative.after[field] ?? ''} onChange={(event) => updateMetric(initiative.id, 'after', field, event.target.value)} placeholder="0" />
                        </label>
                      ))}
                    </div>
                    <div className={`${styles.resultBox} ${styles[result.tone]}`}>
                      <span>{initiative.goal}</span>
                      <div className={styles.beforeAfter}><small>{result.displayBefore}</small><b>→</b><small>{result.displayAfter}</small></div>
                      <strong>{result.changeLabel}</strong>
                      {result.absolute && <em>{result.absolute}</em>}
                      <p>{result.verdict}</p>
                    </div>
                  </div>

                  {overlap && <div className={styles.warning}><b>⚠ 他施策と重複</b><span>{overlap}</span></div>}
                  <div className={styles.sourceLine}>{sourceHint[initiative.platform]}</div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className={styles.ruleSection}>
        <span className={styles.label}>HOW TO READ</span>
        <h2>「上がった」ことと、<br />「この施策が原因」は別。</h2>
        <div className={styles.ruleGrid}>
          <article><b>01</b><strong>前後は同じ日数</strong><p>7日前と7日後など、まず比較条件を揃えます。</p></article>
          <article><b>02</b><strong>他施策を重ねすぎない</strong><p>同時に複数変更すると、どれが効いたか判断しにくくなります。</p></article>
          <article><b>03</b><strong>数字が良ければ残す</strong><p>改善が再現するかを見ながら、店ごとの勝ち施策を蓄積します。</p></article>
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <p>ECの面倒を、アプリにする。</p>
      </footer>
    </main>
  )
}
