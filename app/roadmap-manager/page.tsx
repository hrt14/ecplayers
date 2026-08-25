'use client'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import styles from './RoadmapManager.module.css'

type InitiativeStatus = '' | '未着手' | '進行中' | '完了'

type MonthRow = {
  month: string
  targetSales: string
  actualSales: string
  targetSessions: string
  actualSessions: string
  targetCvr: string
  actualCvr: string
  targetAov: string
  actualAov: string
  initiative: string
  initiativeStatus: InitiativeStatus
}

type SavedState = {
  projectName: string
  rows: MonthRow[]
}

const STORAGE_KEY = 'ecp-roadmap-manager-v1'
const MONTHS = Array.from({ length: 12 }, (_, index) => `${index + 1}月`)

const blankRows = (): MonthRow[] => MONTHS.map((month) => ({
  month,
  targetSales: '',
  actualSales: '',
  targetSessions: '',
  actualSessions: '',
  targetCvr: '',
  actualCvr: '',
  targetAov: '',
  actualAov: '',
  initiative: '',
  initiativeStatus: '',
}))

const sampleRows: MonthRow[] = [
  ['1月', '8000000', '7900000', '88000', '90000', '3.6', '3.5', '2525', '2508', '商品画像を上位3商品で改善', '完了'],
  ['2月', '8500000', '8800000', '92000', '94500', '3.7', '3.8', '2498', '2451', 'レビュー獲得導線を改善', '完了'],
  ['3月', '9000000', '9100000', '96000', '97000', '3.8', '3.9', '2467', '2406', '検索広告の無駄出稿を削減', '完了'],
  ['4月', '9500000', '9300000', '100000', '103000', '3.8', '3.5', '2500', '2580', '主要LPのファーストビュー改善', '完了'],
  ['5月', '10000000', '9700000', '105000', '108000', '3.9', '3.6', '2442', '2495', '低評価レビューの改善コンテンツ追加', '進行中'],
  ['6月', '10500000', '10200000', '108000', '112000', '4.0', '3.7', '2431', '2462', 'セット商品の追加', '完了'],
  ['7月', '11000000', '10700000', '112000', '116000', '4.0', '3.7', '2455', '2493', 'リピート導線・LINE配信改善', '進行中'],
  ['8月', '11500000', '9900000', '116000', '121000', '4.1', '3.4', '2418', '2407', '商品ページ改善・レビュー強化', '未着手'],
  ['9月', '12000000', '', '120000', '', '4.1', '', '2439', '', '主力商品の訴求ABテスト', '未着手'],
  ['10月', '12500000', '', '124000', '', '4.2', '', '2400', '', '大型販促前の広告再設計', '未着手'],
  ['11月', '13500000', '', '130000', '', '4.2', '', '2473', '', 'ギフト・セット訴求強化', '未着手'],
  ['12月', '14000000', '', '136000', '', '4.3', '', '2394', '', '年末需要の取り切り', '未着手'],
].map(([month, targetSales, actualSales, targetSessions, actualSessions, targetCvr, actualCvr, targetAov, actualAov, initiative, initiativeStatus]) => ({
  month,
  targetSales,
  actualSales,
  targetSessions,
  actualSessions,
  targetCvr,
  actualCvr,
  targetAov,
  actualAov,
  initiative,
  initiativeStatus: initiativeStatus as InitiativeStatus,
}))

const toNumber = (value: string) => {
  const normalized = String(value ?? '').replace(/[\s,，¥￥%％]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const hasValue = (value: string) => String(value ?? '').trim() !== ''

const ratio = (actual: string, target: string) => {
  if (!hasValue(actual) || !hasValue(target) || toNumber(target) === 0) return null
  return toNumber(actual) / toNumber(target)
}

const percent = (value: number | null) => value === null ? '—' : `${Math.round(value * 100)}%`

const compactYen = (value: number) => {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) >= 100000000) return `${(value / 100000000).toFixed(2).replace(/\.00$/, '')}億円`
  if (Math.abs(value) >= 10000) return `${Math.round(value / 10000).toLocaleString('ja-JP')}万円`
  return `${Math.round(value).toLocaleString('ja-JP')}円`
}

const normalizeHeader = (value: string) => value
  .replace(/^\uFEFF/, '')
  .trim()
  .toLowerCase()
  .replace(/[\s_\-／/（）()]/g, '')

const headerAliases: Record<keyof MonthRow, string[]> = {
  month: ['month', '月', '年月', '期間'],
  targetSales: ['targetsales', '売上目標', '目標売上', '計画売上'],
  actualSales: ['actualsales', '売上実績', '実績売上', 'sales', '売上'],
  targetSessions: ['targetsessions', 'セッション目標', '目標セッション', 'アクセス目標'],
  actualSessions: ['actualsessions', 'セッション実績', '実績セッション', 'sessions', 'アクセス実績', 'アクセス'],
  targetCvr: ['targetcvr', 'cvr目標', '目標cvr'],
  actualCvr: ['actualcvr', 'cvr実績', '実績cvr', 'cvr'],
  targetAov: ['targetaov', '客単価目標', '目標客単価'],
  actualAov: ['actualaov', '客単価実績', '実績客単価', 'aov', '客単価'],
  initiative: ['initiative', '施策', '今月の施策', 'アクション'],
  initiativeStatus: ['status', '施策状況', '進捗', 'ステータス'],
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
    } else if ((char === ',' || char === '\t') && !quoted) {
      cells.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current.trim())
  return cells
}

function parseCsv(text: string): MonthRow[] {
  const lines = text.replace(/\r/g, '').split('\n').filter((line) => line.trim())
  if (lines.length < 2) throw new Error('見出し行とデータ行が必要です。')

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const indexMap = {} as Record<keyof MonthRow, number>
  ;(Object.keys(headerAliases) as (keyof MonthRow)[]).forEach((key) => {
    indexMap[key] = headers.findIndex((header) => headerAliases[key].map(normalizeHeader).includes(header))
  })

  if (indexMap.month < 0) throw new Error('「月」または「month」列が見つかりません。')

  const imported = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    const get = (key: keyof MonthRow) => indexMap[key] >= 0 ? cells[indexMap[key]] ?? '' : ''
    const rawStatus = get('initiativeStatus')
    const initiativeStatus: InitiativeStatus = rawStatus === '完了' || rawStatus === '進行中' || rawStatus === '未着手' ? rawStatus : ''
    return {
      month: get('month'),
      targetSales: get('targetSales'),
      actualSales: get('actualSales'),
      targetSessions: get('targetSessions'),
      actualSessions: get('actualSessions'),
      targetCvr: get('targetCvr'),
      actualCvr: get('actualCvr'),
      targetAov: get('targetAov'),
      actualAov: get('actualAov'),
      initiative: get('initiative'),
      initiativeStatus,
    }
  }).filter((row) => row.month)

  return MONTHS.map((month) => {
    const matched = imported.find((row) => normalizeHeader(row.month) === normalizeHeader(month))
    return matched ? { ...matched, month } : blankRows().find((row) => row.month === month)!
  })
}

function statusFor(row: MonthRow) {
  const salesRatio = ratio(row.actualSales, row.targetSales)
  if (salesRatio === null) return { label: '未入力', tone: 'neutral' }
  if (salesRatio >= 1) return { label: '順調', tone: 'green' }
  if (salesRatio >= 0.9) return { label: '注意', tone: 'yellow' }
  return { label: '要対策', tone: 'red' }
}

export default function RoadmapManagerPage() {
  const [projectName, setProjectName] = useState('')
  const [rows, setRows] = useState<MonthRow[]>(blankRows)
  const [csvText, setCsvText] = useState('')
  const [message, setMessage] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as SavedState
        if (saved.projectName) setProjectName(saved.projectName)
        if (Array.isArray(saved.rows) && saved.rows.length === 12) setRows(saved.rows)
      }
    } catch {
      // 壊れたローカル保存は無視して初期状態で開く
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectName, rows }))
  }, [hydrated, projectName, rows])

  const summary = useMemo(() => {
    const entered = rows.filter((row) => hasValue(row.actualSales))
    const annualTarget = rows.reduce((sum, row) => sum + toNumber(row.targetSales), 0)
    const targetToDate = entered.reduce((sum, row) => sum + toNumber(row.targetSales), 0)
    const actualToDate = entered.reduce((sum, row) => sum + toNumber(row.actualSales), 0)
    const runRate = targetToDate > 0 ? actualToDate / targetToDate : 0
    const remainingTarget = Math.max(annualTarget - targetToDate, 0)
    const forecast = entered.length > 0 ? actualToDate + remainingTarget * runRate : 0
    const gap = annualTarget > 0 ? annualTarget - forecast : 0

    const aggregateRatio = (actualKey: keyof MonthRow, targetKey: keyof MonthRow) => {
      const applicable = entered.filter((row) => hasValue(row[actualKey]) && hasValue(row[targetKey]) && toNumber(row[targetKey]) > 0)
      if (!applicable.length) return null
      if (actualKey === 'actualCvr') {
        const values = applicable.map((row) => toNumber(row[actualKey]) / toNumber(row[targetKey]))
        return values.reduce((sum, value) => sum + value, 0) / values.length
      }
      const actual = applicable.reduce((sum, row) => sum + toNumber(row[actualKey]), 0)
      const target = applicable.reduce((sum, row) => sum + toNumber(row[targetKey]), 0)
      return target > 0 ? actual / target : null
    }

    const kpis = [
      { key: 'セッション', ratio: aggregateRatio('actualSessions', 'targetSessions'), action: '流入を増やす施策・広告配分・検索露出を優先' },
      { key: 'CVR', ratio: aggregateRatio('actualCvr', 'targetCvr'), action: '商品ページ・レビュー・訴求・購入導線の改善を優先' },
      { key: '客単価', ratio: aggregateRatio('actualAov', 'targetAov'), action: 'セット・複数個・上位商品の構成で客単価改善を優先' },
    ].filter((item) => item.ratio !== null) as { key: string; ratio: number; action: string }[]

    const blocker = kpis.length ? [...kpis].sort((a, b) => a.ratio - b.ratio)[0] : null
    const lastEntered = entered[entered.length - 1]
    const pending = lastEntered && lastEntered.initiative && lastEntered.initiativeStatus !== '完了' ? lastEntered : null

    return { entered, annualTarget, targetToDate, actualToDate, runRate, forecast, gap, blocker, pending }
  }, [rows])

  const updateRow = (index: number, key: keyof MonthRow, value: string) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row))
  }

  const importText = (text: string) => {
    try {
      const parsed = parseCsv(text)
      setRows(parsed)
      setMessage('CSVをロードマップに取り込みました。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'CSVを読み込めませんでした。')
    }
  }

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setCsvText(text)
    importText(text)
    event.target.value = ''
  }

  const downloadTemplate = () => {
    const header = '月,売上目標,売上実績,セッション目標,セッション実績,CVR目標,CVR実績,客単価目標,客単価実績,施策,施策状況'
    const lines = MONTHS.map((month) => `${month},,,,,,,,,,`)
    const blob = new Blob([`\uFEFF${[header, ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'roadmap-manager-template.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const resetAll = () => {
    setProjectName('')
    setRows(blankRows())
    setCsvText('')
    setMessage('入力をクリアしました。')
    localStorage.removeItem(STORAGE_KEY)
  }

  const insight = summary.entered.length === 0
    ? '実績数字を入れると、計画との差・年間着地予測・最優先で直すKPIを自動で表示します。'
    : summary.blocker
      ? `現在のボトルネックは「${summary.blocker.key}」です。計画比 ${percent(summary.blocker.ratio)}。${summary.blocker.action}。${summary.pending ? ` ${summary.pending.month}の「${summary.pending.initiative}」が${summary.pending.initiativeStatus || '未設定'}です。` : ''}`
      : '売上進捗を確認できました。セッション・CVR・客単価も入れると原因まで特定できます。'

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerRight}>
          <span>ROADMAP MANAGER</span>
          <a href="/">← ECPトップ</a>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>ECP / FREE APP</span>
          <h1>数字を入れると、<br /><em>ロードマップが動き出す。</em></h1>
          <p>月次目標に実績をはめ込み、遅れ・原因・年間着地を自動で確認。計画を「作って終わり」にしないための進捗管理ツールです。</p>
        </div>
        <div className={styles.heroBadge}>
          <small>CHECK</small>
          <strong>PLAN → ACTUAL</strong>
          <span>赤黄緑で進捗判定</span>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.topbar}>
          <label className={styles.projectField}>
            <span>ロードマップ名</span>
            <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="例：楽天 2026年 成長ロードマップ" />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={() => { setRows(sampleRows); setProjectName('サンプルEC 2026年ロードマップ'); setMessage('サンプルデータを読み込みました。') }}>サンプルを見る</button>
            <button type="button" className={styles.ghostButton} onClick={downloadTemplate}>CSVひな形</button>
            <button type="button" className={styles.dangerButton} onClick={resetAll}>クリア</button>
          </div>
        </div>

        <div className={styles.importPanel}>
          <div className={styles.importIntro}>
            <span>01</span>
            <div>
              <h2>数字を取り込む</h2>
              <p>CSVファイルを選ぶか、Excel / スプレッドシートの内容をCSV形式で貼り付けます。</p>
            </div>
          </div>
          <label className={styles.fileButton}>
            CSVファイルを選ぶ
            <input type="file" accept=".csv,text/csv,.txt,text/plain" onChange={onFile} />
          </label>
          <textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} placeholder={'月,売上目標,売上実績,セッション目標,セッション実績,CVR目標,CVR実績,客単価目標,客単価実績,施策,施策状況\n1月,8000000,7900000,88000,90000,3.6,3.5,2525,2508,商品画像改善,完了'} />
          <button type="button" className={styles.primaryButton} onClick={() => importText(csvText)}>貼り付けた数字を反映 →</button>
          {message && <p className={styles.message}>{message}</p>}
        </div>

        <div className={styles.summaryGrid}>
          <article>
            <span>年間売上目標</span>
            <strong>{summary.annualTarget ? compactYen(summary.annualTarget) : '—'}</strong>
            <small>月別目標の合計</small>
          </article>
          <article>
            <span>実績 / 目標（入力済み月）</span>
            <strong>{percent(summary.targetToDate > 0 ? summary.actualToDate / summary.targetToDate : null)}</strong>
            <small>{summary.actualToDate ? `${compactYen(summary.actualToDate)} / ${compactYen(summary.targetToDate)}` : '実績未入力'}</small>
          </article>
          <article>
            <span>年間着地予測</span>
            <strong>{summary.forecast ? compactYen(summary.forecast) : '—'}</strong>
            <small>{summary.entered.length ? `現在ペース ${percent(summary.runRate)}` : '実績から自動予測'}</small>
          </article>
          <article className={summary.gap > 0 ? styles.alertCard : styles.goodCard}>
            <span>年間目標との差</span>
            <strong>{summary.annualTarget && summary.forecast ? `${summary.gap > 0 ? '▲' : '＋'}${compactYen(Math.abs(summary.gap))}` : '—'}</strong>
            <small>{summary.gap > 0 ? 'このままだと不足見込み' : summary.forecast ? '目標ペース以上' : '実績を入力してください'}</small>
          </article>
        </div>

        <div className={styles.insight}>
          <div className={styles.insightIcon}>!</div>
          <div>
            <span>自動チェック</span>
            <p>{insight}</p>
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.sectionTitle}>
            <div><span>02</span><h2>ロードマップ進捗</h2></div>
            <div className={styles.legend}><i className={styles.greenDot} />順調 <i className={styles.yellowDot} />注意 <i className={styles.redDot} />要対策</div>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th rowSpan={2}>月</th>
                  <th colSpan={3}>売上</th>
                  <th colSpan={2}>セッション</th>
                  <th colSpan={2}>CVR</th>
                  <th colSpan={2}>客単価</th>
                  <th rowSpan={2}>今月の施策</th>
                  <th rowSpan={2}>施策状況</th>
                </tr>
                <tr>
                  <th>目標</th><th>実績</th><th>達成</th>
                  <th>目標</th><th>実績</th>
                  <th>目標%</th><th>実績%</th>
                  <th>目標</th><th>実績</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const status = statusFor(row)
                  return (
                    <tr key={row.month} className={styles[`${status.tone}Row`]}>
                      <td className={styles.monthCell}><strong>{row.month}</strong><span className={styles[status.tone]}>{status.label}</span></td>
                      <td><input inputMode="numeric" value={row.targetSales} onChange={(event) => updateRow(index, 'targetSales', event.target.value)} placeholder="目標" /></td>
                      <td><input inputMode="numeric" value={row.actualSales} onChange={(event) => updateRow(index, 'actualSales', event.target.value)} placeholder="実績" /></td>
                      <td className={styles.ratioCell}>{percent(ratio(row.actualSales, row.targetSales))}</td>
                      <td><input inputMode="numeric" value={row.targetSessions} onChange={(event) => updateRow(index, 'targetSessions', event.target.value)} placeholder="目標" /></td>
                      <td><input inputMode="numeric" value={row.actualSessions} onChange={(event) => updateRow(index, 'actualSessions', event.target.value)} placeholder="実績" /></td>
                      <td><input inputMode="decimal" value={row.targetCvr} onChange={(event) => updateRow(index, 'targetCvr', event.target.value)} placeholder="%" /></td>
                      <td><input inputMode="decimal" value={row.actualCvr} onChange={(event) => updateRow(index, 'actualCvr', event.target.value)} placeholder="%" /></td>
                      <td><input inputMode="numeric" value={row.targetAov} onChange={(event) => updateRow(index, 'targetAov', event.target.value)} placeholder="目標" /></td>
                      <td><input inputMode="numeric" value={row.actualAov} onChange={(event) => updateRow(index, 'actualAov', event.target.value)} placeholder="実績" /></td>
                      <td className={styles.initiativeCell}><input value={row.initiative} onChange={(event) => updateRow(index, 'initiative', event.target.value)} placeholder="施策を入力" /></td>
                      <td>
                        <select value={row.initiativeStatus} onChange={(event) => updateRow(index, 'initiativeStatus', event.target.value)}>
                          <option value="">—</option>
                          <option value="未着手">未着手</option>
                          <option value="進行中">進行中</option>
                          <option value="完了">完了</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <section className={styles.howTo}>
          <div><span>03</span><h2>これだけ見ればいい</h2></div>
          <div className={styles.howGrid}>
            <article><b>1</b><strong>赤い月を見る</strong><p>まず売上が計画から外れた月を特定。</p></article>
            <article><b>2</b><strong>原因KPIを見る</strong><p>セッション / CVR / 客単価のどこが弱いか確認。</p></article>
            <article><b>3</b><strong>施策を戻す</strong><p>未実施・進行中の施策を優先して実行。</p></article>
            <article><b>4</b><strong>着地予測を見る</strong><p>今のペースで年間目標に届くかを毎月更新。</p></article>
          </div>
        </section>
      </section>

      <footer className={styles.footer}>
        <strong>EC<span>players</span></strong>
        <p>入力内容はこのブラウザ内に自動保存されます。サーバーには送信しません。</p>
      </footer>
    </main>
  )
}
