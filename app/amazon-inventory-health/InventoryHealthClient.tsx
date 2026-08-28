'use client'

import { ChangeEvent, useMemo, useRef, useState } from 'react'
import styles from './AmazonInventoryHealth.module.css'

type RawRow = Record<string, string>
type Status = 'stockout' | 'aged' | 'excess' | 'healthy' | 'insufficient'

type StockRow = {
  key: string
  sku: string
  asin: string
  productName: string
  available: number
  units30: number | null
  units7: number | null
  age271to365: number | null
  age365plus: number | null
}

type EvaluatedRow = StockRow & {
  dailySales: number | null
  daysOfSupply: number | null
  status: Status
  reason: string
  action: string
  score: number
}

const SAMPLE = `SKU,ASIN,商品名,在庫数,30日販売数,271-365日在庫,365日超在庫
SKU-BOTTLE-500,B0EXAMPLE1,ステンレスボトル 500ml,12,90,0,0
SKU-BOTTLE-750,B0EXAMPLE2,ステンレスボトル 750ml,800,60,0,0
SKU-CASE-IPHONE,B0EXAMPLE3,iPhoneケース 耐衝撃タイプ,150,45,40,0
SKU-MASK-3D,B0EXAMPLE4,立体マスク 30枚入,60,0,0,120
SKU-TOWEL-BATH,B0EXAMPLE5,バスタオル 2枚セット,40,20,0,0
SKU-YOGA-MAT,B0EXAMPLE6,ヨガマット 6mm,25,,0,0`

const aliases: Record<string, string[]> = {
  sku: ['sku', 'sellersku', '出品者sku', 'skuコード'],
  asin: ['asin', 'fnsku'],
  productName: ['productname', 'product-name', '商品名', 'title', '品名'],
  available: ['afnfulfillablequantity', 'afntotalquantity', 'sellablequantity', 'fulfillablequantity', 'quantityavailable', '在庫数', '出荷可能在庫数', '在庫'],
  units30: ['unitsshippedt30', 'unitsordered30days', '30日間の販売数', '30日販売数', '直近30日販売数', '過去30日販売数'],
  units7: ['unitsshippedt7', 'unitsordered7days', '7日販売数', '直近7日販売数', '過去7日販売数'],
  age271to365: ['afntotalquantity271to365days', '271365日在庫', '271〜365日在庫', '271365日', '271〜365日'],
  age365plus: ['afntotalquantity365plusdays', '365日以上在庫', '365日超在庫', '365日超', '365日以上'],
}

const integer = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 })

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s_\-()（）#%％:：\/]/g, '')
}

function findHeader(headers: string[], key: keyof typeof aliases) {
  const normalized = headers.map(normalize)
  const candidates = aliases[key].map(normalize)
  let index = normalized.findIndex(header => candidates.includes(header))
  if (index >= 0) return headers[index]
  index = normalized.findIndex(header => candidates.some(candidate => candidate.length >= 4 && header.includes(candidate)))
  return index >= 0 ? headers[index] : ''
}

function detectDelimiter(text: string) {
  const first = text.replace(/^﻿/, '').split(/\r?\n/, 1)[0] || ''
  const tabs = (first.match(/\t/g) || []).length
  const commas = (first.match(/,/g) || []).length
  return tabs > commas ? '\t' : ','
}

function parseDelimited(text: string): { headers: string[]; rows: RawRow[] } {
  const delimiter = detectDelimiter(text)
  const source = text.replace(/^﻿/, '')
  const matrix: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    const next = source[i + 1]
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"'
        i++
      } else {
        quoted = !quoted
      }
    } else if (char === delimiter && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i++
      row.push(cell)
      if (row.some(v => v.trim() !== '')) matrix.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  row.push(cell)
  if (row.some(v => v.trim() !== '')) matrix.push(row)
  if (!matrix.length) return { headers: [], rows: [] }

  const headers = matrix[0].map(v => v.trim())
  const rows = matrix.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ''])))
  return { headers, rows }
}

function num(value = '') {
  const cleaned = value.replace(/[,，￥¥$€£\s]/g, '').replace(/[^0-9.\-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function numOrNull(raw: RawRow, header: string) {
  if (!header) return null
  const cell = raw[header]
  if (cell === undefined || cell.trim() === '') return null
  return num(cell)
}

function csvEscape(value: string | number) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = '﻿' + rows.map(row => row.map(csvEscape).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const statusLabel: Record<Status, string> = {
  stockout: '欠品リスク',
  aged: '長期保管リスク',
  excess: '過剰在庫',
  healthy: '健全',
  insufficient: 'データ不足',
}

export default function InventoryHealthClient() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<StockRow[]>([])
  const [error, setError] = useState('')
  const [leadTimeDays, setLeadTimeDays] = useState(30)
  const [safetyDays, setSafetyDays] = useState(14)
  const [excessDays, setExcessDays] = useState(120)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [query, setQuery] = useState('')
  const [promptOpen, setPromptOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const reorderThreshold = leadTimeDays + safetyDays

  const evaluated = useMemo<EvaluatedRow[]>(() => {
    return rows.map(row => {
      const dailySales = row.units30 !== null ? row.units30 / 30 : row.units7 !== null ? row.units7 / 7 : null
      const daysOfSupply = dailySales === null ? null : dailySales > 0 ? row.available / dailySales : Infinity

      const ageSevere = (row.age365plus ?? 0) > 0
      const ageWarn = (row.age271to365 ?? 0) > 0
      const isStockoutRisk = daysOfSupply !== null && daysOfSupply < reorderThreshold
      const isExcess = daysOfSupply !== null && daysOfSupply > excessDays

      let status: Status
      let reason: string
      let action: string
      let score: number

      if (isStockoutRisk) {
        status = 'stockout'
        reason = `在庫日数 約${Math.round(daysOfSupply as number)}日（発注目安 ${reorderThreshold}日 未満）`
        action = '追加発注・補充を検討'
        score = 400 + Math.max(0, reorderThreshold - (daysOfSupply as number))
      } else if (ageSevere) {
        status = 'aged'
        reason = `365日超の在庫が${integer.format(row.age365plus as number)}個あります`
        action = '値下げ・クーポン・出庫などで長期保管手数料を回避'
        score = 320 + (row.age365plus as number) / 10
      } else if (ageWarn) {
        status = 'aged'
        reason = `271〜365日の在庫が${integer.format(row.age271to365 as number)}個あります（長期保管手数料の対象になり得ます）`
        action = '販促・セット販売などで消化を早める'
        score = 260 + (row.age271to365 as number) / 10
      } else if (isExcess) {
        status = 'excess'
        reason = `在庫日数 約${daysOfSupply === Infinity ? '∞' : Math.round(daysOfSupply as number)}日（過剰在庫の目安 ${excessDays}日 超）`
        action = '仕入れ調整・販促強化を検討'
        score = 150 + Math.min(daysOfSupply === Infinity ? 9999 : (daysOfSupply as number), 9999) / 10
      } else if (dailySales === null) {
        status = 'insufficient'
        reason = '30日（または7日）販売数のデータがありません'
        action = '販売実績データを確認'
        score = 50
      } else {
        status = 'healthy'
        reason = `在庫日数 約${Math.round(daysOfSupply ?? 0)}日`
        action = '現状維持'
        score = 0
      }

      return { ...row, dailySales, daysOfSupply, status, reason, action, score }
    }).sort((a, b) => b.score - a.score)
  }, [rows, reorderThreshold, excessDays])

  const visible = useMemo(() => evaluated.filter(row => {
    if (filter !== 'all' && row.status !== filter) return false
    if (query && !`${row.sku} ${row.asin} ${row.productName}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [evaluated, filter, query])

  const selectedRows = useMemo(() => evaluated.filter(row => selected.has(row.key)), [evaluated, selected])
  const summary = useMemo(() => ({
    stockout: evaluated.filter(row => row.status === 'stockout').length,
    aged: evaluated.filter(row => row.status === 'aged').length,
    excess: evaluated.filter(row => row.status === 'excess').length,
    selected: selectedRows.length,
  }), [evaluated, selectedRows])

  const slidePrompt = useMemo(() => {
    const lines = selectedRows.slice(0, 100).map((row, index) => `${index + 1}. ${row.productName || row.sku || row.asin} / SKU:${row.sku || '-'} / ASIN:${row.asin || '-'} / 在庫${integer.format(row.available)}個 / 判定:${statusLabel[row.status]} / ${row.reason}`).join('\n')
    return `Amazonの在庫健全度チェック結果をもとに、EC担当者・経営者向けの改善提案スライドを作成してください。\n\n目的は、欠品による機会損失と、長期保管手数料・過剰在庫による資金の目詰まりの両方を防ぐことです。\n\n【判定条件】\n発注リードタイム: ${leadTimeDays}日\n安全在庫日数: ${safetyDays}日（発注目安 ${reorderThreshold}日）\n過剰在庫の目安: ${excessDays}日\n欠品リスクSKU: ${summary.stockout}件\n長期保管リスクSKU: ${summary.aged}件\n過剰在庫SKU: ${summary.excess}件\n選択したSKU: ${summary.selected}件\n\n【スライド構成】\n1. 今回の分析概要\n2. 在庫全体の健全度サマリー\n3. 欠品リスクSKU一覧と発注優先度\n4. 長期保管リスクSKU一覧と回避策\n5. 過剰在庫SKU一覧と消化策\n6. 今すぐやること\n\n在庫日数だけで短絡的に判断せず、季節性・リードタイム・単価も考慮した現実的な提案にしてください。\n\n【選択したSKU】\n${lines || 'まだSKUが選択されていません。'}`
  }, [selectedRows, leadTimeDays, safetyDays, excessDays, reorderThreshold, summary])

  function loadText(text: string, name: string) {
    try {
      const parsed = parseDelimited(text)
      if (!parsed.headers.length) throw new Error('CSVの中身を読み取れませんでした。')

      const h = {
        sku: findHeader(parsed.headers, 'sku'),
        asin: findHeader(parsed.headers, 'asin'),
        productName: findHeader(parsed.headers, 'productName'),
        available: findHeader(parsed.headers, 'available'),
        units30: findHeader(parsed.headers, 'units30'),
        units7: findHeader(parsed.headers, 'units7'),
        age271to365: findHeader(parsed.headers, 'age271to365'),
        age365plus: findHeader(parsed.headers, 'age365plus'),
      }

      if (!h.sku && !h.asin) throw new Error('必要な列を見つけられません: SKU または ASIN。Amazonの在庫レポートCSVを使用してください。')
      if (!h.available) throw new Error('必要な列を見つけられません: 在庫数。Amazonの在庫レポートCSVを使用してください。')

      const map = new Map<string, StockRow>()
      for (const raw of parsed.rows) {
        const sku = h.sku ? raw[h.sku]?.trim() || '' : ''
        const asin = h.asin ? raw[h.asin]?.trim() || '' : ''
        if (!sku && !asin) continue
        const key = `${sku}__${asin}`
        const current = map.get(key) || {
          key,
          sku,
          asin,
          productName: h.productName ? raw[h.productName] || '' : '',
          available: 0,
          units30: null,
          units7: null,
          age271to365: null,
          age365plus: null,
        }
        current.available += num(raw[h.available])
        const u30 = numOrNull(raw, h.units30)
        if (u30 !== null) current.units30 = (current.units30 ?? 0) + u30
        const u7 = numOrNull(raw, h.units7)
        if (u7 !== null) current.units7 = (current.units7 ?? 0) + u7
        const a271 = numOrNull(raw, h.age271to365)
        if (a271 !== null) current.age271to365 = (current.age271to365 ?? 0) + a271
        const a365 = numOrNull(raw, h.age365plus)
        if (a365 !== null) current.age365plus = (current.age365plus ?? 0) + a365
        map.set(key, current)
      }

      const nextRows = Array.from(map.values())
      if (!nextRows.length) throw new Error('分析できるSKUがありませんでした。')
      setRows(nextRows)
      setFileName(name)
      setError('')
      setSelected(new Set())
    } catch (err) {
      setRows([])
      setSelected(new Set())
      setError(err instanceof Error ? err.message : 'CSVを読み取れませんでした。')
    }
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
      setError('CSV / TSVファイルを選択してください。')
      return
    }
    const reader = new FileReader()
    reader.onload = () => loadText(String(reader.result || ''), file.name)
    reader.onerror = () => setError('ファイルを読み取れませんでした。')
    reader.readAsText(file)
  }

  function toggle(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function selectRecommended() {
    setSelected(new Set(evaluated.filter(row => row.status === 'stockout' || row.status === 'aged').map(row => row.key)))
  }

  function exportCsv() {
    const data: Array<Array<string | number>> = [[
      '対応', '判定', 'SKU', 'ASIN', '商品名', '在庫数', '30日販売数', '在庫日数', '271-365日在庫', '365日超在庫', '理由', '推奨アクション'
    ]]
    selectedRows.forEach(row => data.push([
      'YES', statusLabel[row.status], row.sku, row.asin, row.productName,
      Math.round(row.available),
      row.units30 === null ? '' : Math.round(row.units30),
      row.daysOfSupply === null ? '' : row.daysOfSupply === Infinity ? '∞' : Math.round(row.daysOfSupply),
      row.age271to365 === null ? '' : Math.round(row.age271to365),
      row.age365plus === null ? '' : Math.round(row.age365plus),
      row.reason, row.action,
    ]))
    downloadCsv(`amazon-inventory-health-${new Date().toISOString().slice(0, 10)}.csv`, data)
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(slidePrompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerRight}><span>Amazon FBA / 無料ツール</span><a href="/#apps">アプリ一覧へ</a></div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>ECP / AMAZON INVENTORY HEALTH</span>
          <h1>Amazon 在庫<br /><em>健全度チェック</em></h1>
          <p>在庫レポートCSVを読み込むだけ。欠品で売り逃していないか、長期保管手数料の対象になっていないか、SKUごとに判定して対応が必要なものだけ並べます。</p>
          <div className={styles.heroBadges}><span>欠品リスク</span><span>長期保管リスク</span><span>過剰在庫</span><span>ブラウザ内処理</span></div>
        </div>
        <div className={styles.heroPanel}>
          <small>THIS APP DOES</small>
          <ol><li><b>1</b> CSVを読む</li><li><b>2</b> リスクを判定</li><li><b>3</b> 一覧で確認</li><li><b>4</b> CSV / 提案プロンプト化</li></ol>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.panel}>
            <span className={styles.step}>STEP 1</span>
            <h2>在庫レポート</h2>
            <p>SKU/ASIN・在庫数・30日販売数などを含むCSV / TSVを選択。列名は多少違っても自動で判別します。</p>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={handleFile} hidden />
            <button className={styles.upload} onClick={() => fileRef.current?.click()}><span>↑</span>{fileName || 'CSVを選ぶ'}</button>
            <button className={styles.sample} onClick={() => loadText(SAMPLE, 'サンプルデータ.csv')}>サンプルで試す</button>
            {error && <div className={styles.error}>{error}</div>}
            <small className={styles.privacy}>ファイルはサーバーへ送信せず、このブラウザ内だけで処理します。</small>
          </div>

          <div className={styles.panel}>
            <span className={styles.step}>STEP 2</span>
            <h2>判定条件</h2>
            <label className={styles.field}><span>発注リードタイム</span><div><input type="number" min="0" value={leadTimeDays} onChange={e => setLeadTimeDays(Math.max(0, Number(e.target.value) || 0))} /><b>日</b></div></label>
            <label className={styles.field}><span>安全在庫日数</span><div><input type="number" min="0" value={safetyDays} onChange={e => setSafetyDays(Math.max(0, Number(e.target.value) || 0))} /><b>日</b></div></label>
            <label className={styles.field}><span>過剰在庫の目安</span><div><input type="number" min="1" value={excessDays} onChange={e => setExcessDays(Math.max(1, Number(e.target.value) || 1))} /><b>日</b></div></label>
            <p className={styles.note}>在庫日数が「発注リードタイム＋安全在庫日数（{reorderThreshold}日）」を下回ったら欠品リスクとして扱います。</p>
          </div>
        </aside>

        <div className={styles.results}>
          <div className={styles.summaryGrid}>
            <article className={styles.accent}><span>欠品リスク</span><strong>{summary.stockout}</strong><small>SKU</small></article>
            <article className={styles.accent}><span>長期保管リスク</span><strong>{summary.aged}</strong><small>SKU</small></article>
            <article><span>過剰在庫</span><strong>{summary.excess}</strong><small>SKU</small></article>
            <article><span>現在の選択</span><strong>{summary.selected}</strong><small>SKU</small></article>
          </div>

          <section className={styles.listPanel}>
            <div className={styles.listHead}>
              <div><span className={styles.step}>STEP 3</span><h2>一覧で最終判断</h2><p>対応するSKUだけチェックしてください。</p></div>
              <div className={styles.listActions}><button onClick={selectRecommended} disabled={!rows.length}>推奨だけ選択</button><button className={styles.primaryButton} onClick={exportCsv} disabled={!summary.selected}>対応CSVを作る ↓</button></div>
            </div>

            <div className={styles.filters}>
              <div className={styles.tabs}>
                {(['all', 'stockout', 'aged', 'excess', 'healthy', 'insufficient'] as const).map(value => <button key={value} className={filter === value ? styles.activeTab : ''} onClick={() => setFilter(value)}>{value === 'all' ? 'すべて' : statusLabel[value]}</button>)}
              </div>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="SKU・ASIN・商品名で絞る" />
            </div>

            {!rows.length ? (
              <div className={styles.empty}><div>CSV</div><h3>まず在庫レポートを入れてください</h3><p>判定 → チェック → CSV出力まで、この画面だけで完了します。</p></div>
            ) : (
              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>対応</th><th>判定</th><th>商品</th><th>在庫数</th><th>30日販売数</th><th>在庫日数</th><th>271-365日</th><th>365日超</th><th>理由・推奨アクション</th></tr></thead>
                  <tbody>{visible.map(row => (
                    <tr key={row.key} className={selected.has(row.key) ? styles.selectedRow : ''}>
                      <td><label className={styles.check}><input type="checkbox" checked={selected.has(row.key)} onChange={() => toggle(row.key)} /><span /></label></td>
                      <td><span className={`${styles.status} ${styles[row.status]}`}>{statusLabel[row.status]}</span></td>
                      <td><strong>{row.productName || row.sku || row.asin}</strong><small>{row.sku ? `SKU: ${row.sku}` : ''}{row.sku && row.asin ? ' / ' : ''}{row.asin ? `ASIN: ${row.asin}` : ''}</small></td>
                      <td>{integer.format(row.available)}</td>
                      <td>{row.units30 === null ? '—' : integer.format(row.units30)}</td>
                      <td>{row.daysOfSupply === null ? '—' : row.daysOfSupply === Infinity ? '∞' : `${Math.round(row.daysOfSupply)}日`}</td>
                      <td>{row.age271to365 === null ? '—' : integer.format(row.age271to365)}</td>
                      <td>{row.age365plus === null ? '—' : integer.format(row.age365plus)}</td>
                      <td>{row.reason}。{row.action}。</td>
                    </tr>
                  ))}</tbody>
                </table>
                {!visible.length && <div className={styles.noRows}>この条件に該当するSKUはありません。</div>}
              </div>
            )}
          </section>

          <section className={styles.outputPanel}>
            <div><span className={styles.step}>STEP 4</span><h2>そのまま改善提案にもする</h2><p>選んだSKUと集計値を入れた、スライド生成用プロンプトを自動作成します。</p></div>
            <button onClick={() => setPromptOpen(true)} disabled={!summary.selected}>スライド化プロンプトを見る →</button>
          </section>

          <div className={styles.sourceNote}>
            <strong>判定について</strong>
            <p>在庫日数は「在庫数 ÷（30日販売数÷30、無ければ7日販売数÷7）」の簡易計算です。季節性やセール予定は考慮していません。271〜365日・365日超の在庫数の列がある場合は、長期保管手数料の対象になり得る在庫として優先的に表示します。列が無い場合、長期保管リスクの判定は行われません。</p>
          </div>
        </div>
      </section>

      {promptOpen && <div className={styles.modal} role="dialog" aria-modal="true"><div className={styles.modalCard}><div className={styles.modalHead}><div><span>AI PROMPT</span><h2>在庫健全化 改善提案スライド</h2></div><button onClick={() => setPromptOpen(false)}>×</button></div><textarea readOnly value={slidePrompt} /><div className={styles.modalActions}><button onClick={() => setPromptOpen(false)}>閉じる</button><button className={styles.primaryButton} onClick={copyPrompt}>{copied ? 'コピーしました ✓' : 'プロンプトをコピー'}</button></div></div></div>}

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <p>ECの面倒を、アプリにする。</p>
        <a href="/#apps">ほかのECPアプリを見る →</a>
      </footer>
    </main>
  )
}
