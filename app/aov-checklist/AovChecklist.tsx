'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import styles from './AovChecklist.module.css'

type Impact = 1 | 2 | 3

type ChecklistItem = {
  id: string
  category: string
  title: string
  impact: Impact
}

type LogEntry = {
  id: string
  date: string
  category: string
  title: string
  target: string
  before: string
  after: string
  note: string
  createdAt: string
}

type DailyRow = {
  date: string
  sales: number
  orders: number
  sessions?: number
  cvr?: number
  grossProfit?: number
  units?: number
}

type PeriodStats = {
  days: number
  sales: number
  orders: number
  aov: number
  sessions?: number
  cvr?: number
  grossProfit?: number
  grossProfitPerOrder?: number
  units?: number
  unitsPerOrder?: number
}

type LogAnalysis = {
  before: PeriodStats | null
  after: PeriodStats | null
  aovChange: number | null
  salesChange: number | null
  cvrChange: number | null
  verdict: 'good' | 'watch' | 'bad' | 'insufficient'
  label: string
}

const STORAGE_CHECKS = 'ecp-aov-checklist-v1'
const STORAGE_LOGS = 'ecp-aov-change-logs-v1'

const checklist: ChecklistItem[] = [
  { id: 'multi-2', category: '購入点数を増やす', title: '2個セット・3個セットを用意している', impact: 3 },
  { id: 'multi-discount', category: '購入点数を増やす', title: 'まとめ買いで割安になる設計がある', impact: 3 },
  { id: 'cross-product', category: '購入点数を増やす', title: '商品ページで関連商品を提案している', impact: 2 },
  { id: 'cross-cart', category: '購入点数を増やす', title: 'カート画面で追加購入を提案している', impact: 3 },
  { id: 'consumable', category: '購入点数を増やす', title: '消耗品・交換品の同時購入導線がある', impact: 3 },
  { id: 'spare', category: '購入点数を増やす', title: '予備・買い替え・色違い購入を提案している', impact: 2 },

  { id: 'premium', category: '高い商品を選んでもらう', title: '上位モデル・プレミアム版が存在する', impact: 3 },
  { id: 'comparison', category: '高い商品を選んでもらう', title: '通常版と上位版の比較表がある', impact: 3 },
  { id: 'good-better-best', category: '高い商品を選んでもらう', title: '松竹梅の3段階で選べる', impact: 3 },
  { id: 'recommend-premium', category: '高い商品を選んでもらう', title: '中〜高価格帯を「おすすめ」として明示している', impact: 2 },
  { id: 'premium-reason', category: '高い商品を選んでもらう', title: '高価格商品の購入理由・価格差の価値を説明している', impact: 3 },

  { id: 'free-line', category: '送料無料ライン', title: '送料無料条件を設定している', impact: 3 },
  { id: 'free-gap', category: '送料無料ライン', title: '「送料無料まであと○円」を表示している', impact: 3 },
  { id: 'free-fillers', category: '送料無料ライン', title: '送料無料調整用の商品を提案している', impact: 2 },
  { id: 'free-above-aov', category: '送料無料ライン', title: '送料無料ラインが現状客単価より少し高い位置にある', impact: 3 },

  { id: 'set-standard', category: 'セット販売', title: '定番商品のセット商品ページがある', impact: 3 },
  { id: 'set-purpose', category: 'セット販売', title: '用途別・初心者向けセットがある', impact: 2 },
  { id: 'set-gift', category: 'セット販売', title: 'ギフトセットがある', impact: 2 },
  { id: 'set-saving', category: 'セット販売', title: 'セットのお得額・お得率が一目でわかる', impact: 2 },
  { id: 'set-search', category: 'セット販売', title: 'セット専用商品ページで検索流入も狙っている', impact: 2 },

  { id: 'accessory', category: 'クロスセル・追加オプション', title: '本体＋アクセサリーを提案している', impact: 3 },
  { id: 'maintenance', category: 'クロスセル・追加オプション', title: 'メンテナンス用品・交換部品を提案している', impact: 2 },
  { id: 'giftwrap', category: 'クロスセル・追加オプション', title: 'ギフト包装を追加できる', impact: 1 },
  { id: 'warranty', category: 'クロスセル・追加オプション', title: '延長保証・追加サービスを販売している', impact: 2 },
  { id: 'easy-add', category: 'クロスセル・追加オプション', title: '追加商品を少ない操作で同時購入できる', impact: 3 },

  { id: 'threshold-gift', category: 'オファー設計', title: '○円以上購入で特典がある', impact: 2 },
  { id: 'threshold-points', category: 'オファー設計', title: '○円以上購入でポイントアップする', impact: 2 },
  { id: 'quantity-coupon', category: 'オファー設計', title: '2点目割引・3点購入割引がある', impact: 3 },
  { id: 'coupon-min', category: 'オファー設計', title: 'クーポンに最低購入金額を設定している', impact: 3 },
  { id: 'line-min', category: 'オファー設計', title: 'LINE・会員クーポンに最低利用金額がある', impact: 2 },

  { id: 'page-set-link', category: '商品ページ・カート', title: '単品ページからセット商品へ誘導している', impact: 3 },
  { id: 'page-premium-link', category: '商品ページ・カート', title: '単品ページから上位商品へ誘導している', impact: 2 },
  { id: 'page-qty', category: '商品ページ・カート', title: '数量変更が簡単にできる', impact: 2 },
  { id: 'cart-recommend', category: '商品ページ・カート', title: 'カート内におすすめ追加商品がある', impact: 3 },
  { id: 'cart-threshold', category: '商品ページ・カート', title: 'カート内で特典・送料無料条件が見える', impact: 3 },

  { id: 'subscription', category: 'リピート・定期', title: '定期購入を用意している', impact: 3 },
  { id: 'subscription-value', category: 'リピート・定期', title: '定期購入の方がお得になる', impact: 2 },
  { id: 'subscription-qty', category: 'リピート・定期', title: '定期購入でも数量を選べる', impact: 2 },
  { id: 'repeat-set', category: 'リピート・定期', title: 'リピーター向けまとめ買いセットがある', impact: 3 },
  { id: 'repeat-cross', category: 'リピート・定期', title: '再購入時に関連商品も提案している', impact: 2 },
]

const categories = Array.from(new Set(checklist.map(item => item.category)))

const emptyLog = () => ({
  date: new Date().toISOString().slice(0, 10),
  category: categories[0],
  title: '',
  target: '',
  before: '',
  after: '',
  note: '',
})

function formatYen(value: number) {
  return `${Math.round(value).toLocaleString('ja-JP')}円`
}

function formatPct(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

function pctChange(before: number, after: number) {
  if (!before) return null
  return ((after - before) / before) * 100
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[\s_\-・/()（）%％]/g, '')
}

function parseNumber(value: string | undefined) {
  if (!value) return 0
  const cleaned = value.replace(/[¥￥円,%％\s]/g, '').replace(/,/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeDate(value: string | undefined) {
  if (!value) return null
  const text = value.trim()
  const ymd = text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/)
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`
  const jp = text.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (jp) return `${jp[1]}-${jp[2].padStart(2, '0')}-${jp[3].padStart(2, '0')}`
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map(cell => cell.trim())
}

function detectColumn(headers: string[], aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeHeader)
  const index = headers.findIndex(header => {
    const normalized = normalizeHeader(header)
    return normalizedAliases.some(alias => normalized === alias || normalized.includes(alias))
  })
  return index >= 0 ? index : null
}

function parseStoreCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) throw new Error('データ行が見つかりません。')

  const headers = parseCsvLine(lines[0])
  const dateIndex = detectColumn(headers, ['日付', 'date', '注文日', '年月日'])
  const salesIndex = detectColumn(headers, ['売上', '売上高', 'sales', 'revenue', '注文金額'])
  const ordersIndex = detectColumn(headers, ['注文数', '注文件数', '受注件数', 'orders', 'transactions'])
  const sessionsIndex = detectColumn(headers, ['セッション', 'sessions', 'アクセス', '訪問数', 'visits'])
  const cvrIndex = detectColumn(headers, ['cvr', '転換率', 'コンバージョン率', 'conversionrate'])
  const grossProfitIndex = detectColumn(headers, ['粗利', '粗利益', 'grossprofit', 'profit'])
  const unitsIndex = detectColumn(headers, ['購入点数', '販売点数', '商品点数', 'units', 'quantity'])

  if (dateIndex === null || salesIndex === null || ordersIndex === null) {
    throw new Error('「日付」「売上」「注文件数」に相当する列が必要です。')
  }

  const grouped = new Map<string, DailyRow>()

  lines.slice(1).forEach(line => {
    const cells = parseCsvLine(line)
    const date = normalizeDate(cells[dateIndex])
    if (!date) return

    const sales = parseNumber(cells[salesIndex])
    const orders = parseNumber(cells[ordersIndex])
    const sessions = sessionsIndex === null ? undefined : parseNumber(cells[sessionsIndex])
    const cvrRaw = cvrIndex === null ? undefined : parseNumber(cells[cvrIndex])
    const grossProfit = grossProfitIndex === null ? undefined : parseNumber(cells[grossProfitIndex])
    const units = unitsIndex === null ? undefined : parseNumber(cells[unitsIndex])

    const current = grouped.get(date) ?? { date, sales: 0, orders: 0 }
    current.sales += sales
    current.orders += orders
    if (sessions !== undefined) current.sessions = (current.sessions ?? 0) + sessions
    if (grossProfit !== undefined) current.grossProfit = (current.grossProfit ?? 0) + grossProfit
    if (units !== undefined) current.units = (current.units ?? 0) + units
    if (cvrRaw !== undefined) current.cvr = cvrRaw > 1 ? cvrRaw : cvrRaw * 100
    grouped.set(date, current)
  })

  const rows = Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date))
  if (!rows.length) throw new Error('読み取れる日付データがありません。')
  return rows
}

function daysBetween(date: string, anchor: string) {
  const ms = new Date(`${date}T00:00:00Z`).getTime() - new Date(`${anchor}T00:00:00Z`).getTime()
  return Math.round(ms / 86400000)
}

function aggregateRows(rows: DailyRow[]): PeriodStats | null {
  if (!rows.length) return null
  const sales = rows.reduce((sum, row) => sum + row.sales, 0)
  const orders = rows.reduce((sum, row) => sum + row.orders, 0)
  const sessionsAvailable = rows.some(row => row.sessions !== undefined)
  const profitAvailable = rows.some(row => row.grossProfit !== undefined)
  const unitsAvailable = rows.some(row => row.units !== undefined)
  const sessions = sessionsAvailable ? rows.reduce((sum, row) => sum + (row.sessions ?? 0), 0) : undefined
  const grossProfit = profitAvailable ? rows.reduce((sum, row) => sum + (row.grossProfit ?? 0), 0) : undefined
  const units = unitsAvailable ? rows.reduce((sum, row) => sum + (row.units ?? 0), 0) : undefined

  return {
    days: rows.length,
    sales,
    orders,
    aov: orders ? sales / orders : 0,
    sessions,
    cvr: sessions ? (orders / sessions) * 100 : undefined,
    grossProfit,
    grossProfitPerOrder: grossProfit !== undefined && orders ? grossProfit / orders : undefined,
    units,
    unitsPerOrder: units !== undefined && orders ? units / orders : undefined,
  }
}

function analyzeLog(log: LogEntry, rows: DailyRow[]): LogAnalysis {
  const beforeRows = rows.filter(row => {
    const diff = daysBetween(row.date, log.date)
    return diff >= -14 && diff <= -1
  })
  const afterRows = rows.filter(row => {
    const diff = daysBetween(row.date, log.date)
    return diff >= 0 && diff <= 13
  })

  const before = aggregateRows(beforeRows)
  const after = aggregateRows(afterRows)
  if (!before || !after || before.days < 3 || after.days < 3) {
    return { before, after, aovChange: null, salesChange: null, cvrChange: null, verdict: 'insufficient', label: 'データ不足' }
  }

  const aovChange = pctChange(before.aov, after.aov)
  const salesChange = pctChange(before.sales / before.days, after.sales / after.days)
  const cvrChange = before.cvr !== undefined && after.cvr !== undefined ? pctChange(before.cvr, after.cvr) : null

  let verdict: LogAnalysis['verdict'] = 'watch'
  let label = '△ 要確認'

  if ((aovChange ?? 0) >= 3 && (salesChange ?? 0) >= 0 && (cvrChange === null || cvrChange > -10)) {
    verdict = 'good'
    label = '◎ 効果あり'
  } else if ((aovChange ?? 0) <= -2 || (salesChange ?? 0) <= -8) {
    verdict = 'bad'
    label = '× 見直し候補'
  }

  return { before, after, aovChange, salesChange, cvrChange, verdict, label }
}

export default function AovChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [draft, setDraft] = useState(emptyLog)
  const [rows, setRows] = useState<DailyRow[]>([])
  const [fileName, setFileName] = useState('')
  const [csvError, setCsvError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedChecks = localStorage.getItem(STORAGE_CHECKS)
      const storedLogs = localStorage.getItem(STORAGE_LOGS)
      if (storedChecks) setChecked(JSON.parse(storedChecks))
      if (storedLogs) setLogs(JSON.parse(storedLogs))
    } catch {
      // Ignore malformed local storage and start fresh.
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_CHECKS, JSON.stringify(checked))
  }, [checked, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_LOGS, JSON.stringify(logs))
  }, [logs, hydrated])

  const completed = checklist.filter(item => checked[item.id]).length
  const score = Math.round((completed / checklist.length) * 100)
  const priorities = useMemo(
    () => checklist.filter(item => !checked[item.id]).sort((a, b) => b.impact - a.impact).slice(0, 3),
    [checked],
  )

  const analyses = useMemo(
    () => logs.map(log => ({ log, result: analyzeLog(log, rows) })),
    [logs, rows],
  )

  const totalStats = useMemo(() => aggregateRows(rows), [rows])

  const toggle = (id: string) => {
    setChecked(current => ({ ...current, [id]: !current[id] }))
  }

  const addLog = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...draft,
      title: draft.title.trim(),
      target: draft.target.trim(),
      before: draft.before.trim(),
      after: draft.after.trim(),
      note: draft.note.trim(),
      createdAt: new Date().toISOString(),
    }
    setLogs(current => [entry, ...current])
    setDraft(emptyLog())
  }

  const removeLog = (id: string) => {
    setLogs(current => current.filter(log => log.id !== id))
  }

  const handleCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCsvError('')
    try {
      const text = await file.text()
      const parsed = parseStoreCsv(text)
      setRows(parsed)
      setFileName(file.name)
    } catch (error) {
      setRows([])
      setFileName('')
      setCsvError(error instanceof Error ? error.message : 'CSVを読み込めませんでした。')
    }
    event.target.value = ''
  }

  const resetChecks = () => {
    if (!window.confirm('チェック状態をすべて未実施に戻しますか？')) return
    setChecked({})
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav className={styles.nav}>
          <a href="#checklist">チェック</a>
          <a href="#log">変更ログ</a>
          <a href="#analysis">効果測定</a>
          <a className={styles.navCta} href="/">アプリ一覧</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>AOV GROWTH / FREE TOOL</span>
          <h1>限界まで、<br /><em>客単価を上げろ。</em></h1>
          <p>施策をチェックして、実施日を記録。あとから店舗データを入れると、変更前後の客単価・売上・CVRを重ねて「結局、何が効いたか」を確認できます。</p>
        </div>
        <div className={styles.scoreCard}>
          <span>客単価アップ度</span>
          <div className={styles.score}><b>{score}</b><small>/100</small></div>
          <div className={styles.progress}><i style={{ width: `${score}%` }} /></div>
          <p>{completed} / {checklist.length} 施策 実施済み</p>
        </div>
      </section>

      <section className={styles.priorityStrip}>
        <div className={styles.priorityIntro}>
          <span>NEXT ACTION</span>
          <h2>次にやる3つ</h2>
          <p>未実施の中から、客単価への影響が大きいものを先に表示。</p>
        </div>
        <div className={styles.priorityGrid}>
          {priorities.length ? priorities.map((item, index) => (
            <button key={item.id} type="button" onClick={() => toggle(item.id)}>
              <small>0{index + 1} / {item.category}</small>
              <strong>{item.title}</strong>
              <span>実施済みにする →</span>
            </button>
          )) : (
            <div className={styles.completeMessage}>全施策チェック済み。次は変更ログと効果測定へ。</div>
          )}
        </div>
      </section>

      <section className={styles.checkSection} id="checklist">
        <div className={styles.sectionHead}>
          <div><span>CHECKLIST</span><h2>客単価を上げる余地を、<br />全部つぶす。</h2></div>
          <button type="button" onClick={resetChecks}>チェックをリセット</button>
        </div>

        <div className={styles.categoryList}>
          {categories.map(category => {
            const items = checklist.filter(item => item.category === category)
            const done = items.filter(item => checked[item.id]).length
            return (
              <section className={styles.categoryCard} key={category}>
                <div className={styles.categoryHead}>
                  <div><span>{done}/{items.length}</span><h3>{category}</h3></div>
                  <b>{Math.round((done / items.length) * 100)}%</b>
                </div>
                <div className={styles.items}>
                  {items.map(item => (
                    <label className={`${styles.checkItem} ${checked[item.id] ? styles.checked : ''}`} key={item.id}>
                      <input type="checkbox" checked={Boolean(checked[item.id])} onChange={() => toggle(item.id)} />
                      <i aria-hidden="true">{checked[item.id] ? '✓' : ''}</i>
                      <span>{item.title}</span>
                      <small>{'●'.repeat(item.impact)}{'○'.repeat(3 - item.impact)}</small>
                    </label>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </section>

      <section className={styles.logSection} id="log">
        <div className={styles.sectionHeadLight}>
          <div><span>CHANGE LOG</span><h2>やったことを、<br />日付で残す。</h2></div>
          <p>客単価が動いたときに「何を変えたか」を後から追えるようにします。</p>
        </div>

        <div className={styles.logWorkspace}>
          <form className={styles.logForm} onSubmit={addLog}>
            <label><span>実施日</span><input type="date" value={draft.date} onChange={e => setDraft({ ...draft, date: e.target.value })} required /></label>
            <label><span>施策カテゴリ</span><select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
            <label className={styles.full}><span>実施内容 *</span><input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="例：送料無料ラインを5,000円→7,000円に変更" required /></label>
            <label><span>対象</span><input value={draft.target} onChange={e => setDraft({ ...draft, target: e.target.value })} placeholder="全商品 / 商品A / カート" /></label>
            <label><span>狙い・メモ</span><input value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} placeholder="客単価を上げつつCVR維持" /></label>
            <label><span>変更前</span><input value={draft.before} onChange={e => setDraft({ ...draft, before: e.target.value })} placeholder="5,000円以上送料無料" /></label>
            <label><span>変更後</span><input value={draft.after} onChange={e => setDraft({ ...draft, after: e.target.value })} placeholder="7,000円以上送料無料" /></label>
            <button type="submit">変更を記録する →</button>
          </form>

          <div className={styles.logList}>
            <div className={styles.logListHead}><b>変更履歴</b><span>{logs.length}件</span></div>
            {logs.length === 0 ? (
              <div className={styles.empty}>まだ変更ログがありません。<br />施策を実施した日に1件ずつ残してください。</div>
            ) : logs.map(log => (
              <article key={log.id}>
                <div className={styles.logMeta}><time>{log.date}</time><span>{log.category}</span></div>
                <h3>{log.title}</h3>
                {log.target && <p><b>対象</b>{log.target}</p>}
                {(log.before || log.after) && <div className={styles.beforeAfter}><span>{log.before || '—'}</span><i>→</i><strong>{log.after || '—'}</strong></div>}
                {log.note && <p><b>メモ</b>{log.note}</p>}
                <button type="button" onClick={() => removeLog(log.id)}>削除</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.analysisSection} id="analysis">
        <div className={styles.sectionHead}>
          <div><span>IMPACT ANALYSIS</span><h2>何が効いたか、<br />数字で見る。</h2></div>
          <p>CSVの最低必須列は「日付・売上・注文件数」。セッション・粗利・購入点数があれば、CVRや注文あたり粗利まで評価します。</p>
        </div>

        <div className={styles.uploadArea}>
          <label className={styles.uploadButton}>
            <input type="file" accept=".csv,text/csv" onChange={handleCsv} />
            <span>店舗CSVを読み込む</span>
            <small>CSVはブラウザ内で処理され、サーバーには送信しません。</small>
          </label>
          <div className={styles.dataStatus}>
            {fileName && rows.length ? (
              <>
                <b>{fileName}</b>
                <span>{rows[0].date} 〜 {rows[rows.length - 1].date} / {rows.length}日</span>
                <small>売上 {formatYen(totalStats?.sales ?? 0)} ・ 注文 {(totalStats?.orders ?? 0).toLocaleString('ja-JP')}件</small>
              </>
            ) : <><b>データ未読込</b><span>変更ログだけ先に貯めてもOKです。</span></>}
            {csvError && <em>{csvError}</em>}
          </div>
        </div>

        <div className={styles.analysisGrid}>
          {logs.length === 0 ? (
            <div className={styles.analysisEmpty}>先に変更ログを1件以上記録すると、ここに施策別の効果測定が表示されます。</div>
          ) : analyses.map(({ log, result }) => (
            <article className={styles.analysisCard} key={log.id}>
              <div className={styles.analysisTop}>
                <div><time>{log.date}</time><h3>{log.title}</h3></div>
                <span className={styles[result.verdict]}>{result.label}</span>
              </div>

              {result.before && result.after ? (
                <>
                  <div className={styles.metricHero}>
                    <span>客単価</span>
                    <b>{formatYen(result.before.aov)} <i>→</i> {formatYen(result.after.aov)}</b>
                    <strong className={(result.aovChange ?? 0) >= 0 ? styles.up : styles.down}>{formatPct(result.aovChange)}</strong>
                  </div>
                  <div className={styles.metricGrid}>
                    <div><span>1日あたり売上</span><b>{formatPct(result.salesChange)}</b><small>{formatYen(result.before.sales / result.before.days)} → {formatYen(result.after.sales / result.after.days)}</small></div>
                    <div><span>CVR</span><b>{result.cvrChange === null ? '—' : formatPct(result.cvrChange)}</b><small>{result.before.cvr === undefined ? 'セッション列なし' : `${result.before.cvr.toFixed(2)}% → ${result.after.cvr?.toFixed(2)}%`}</small></div>
                    <div><span>注文数</span><b>{result.before.orders.toLocaleString('ja-JP')} → {result.after.orders.toLocaleString('ja-JP')}</b><small>前{result.before.days}日 / 後{result.after.days}日</small></div>
                    <div><span>購入点数/注文</span><b>{result.before.unitsPerOrder === undefined ? '—' : `${result.before.unitsPerOrder.toFixed(2)} → ${result.after.unitsPerOrder?.toFixed(2)}`}</b><small>{result.before.unitsPerOrder === undefined ? '購入点数列なし' : 'まとめ買い効果の確認'}</small></div>
                  </div>
                  <p className={styles.analysisNote}>変更日を境に、前14日と後14日を比較。季節性・広告・価格変更など他要因もあるため、因果関係の確定ではなく施策判断の一次評価として使います。</p>
                </>
              ) : (
                <div className={styles.insufficientBox}>変更日の前後にそれぞれ3日以上のデータが入ると比較を開始します。</div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ruleSection}>
        <span>RULE</span>
        <h2>客単価だけ上がっても、<br />売上が落ちたら成功ではない。</h2>
        <div>
          <article><b>売上</b><strong>セッション × CVR × 客単価</strong><p>客単価アップと同時にCVRが崩れていないかを見る。</p></article>
          <article><b>利益</b><strong>注文件数 × 注文あたり粗利</strong><p>粗利列があれば、最終的には売上より利益で判断する。</p></article>
          <article><b>学習</b><strong>仮説 → 実施 → 記録 → 計測</strong><p>勝ち施策だけ残し、この店の客単価アップパターンを蓄積する。</p></article>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p></div>
        <nav><a href="/">アプリ一覧</a><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a></nav>
        <small>変更ログはこのブラウザのlocalStorageに保存されます。端末・ブラウザをまたいだ同期は現時点では行いません。</small>
      </footer>
    </main>
  )
}
