'use client'

import { useMemo, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import styles from './rpp-auto-keyword.module.css'

type RowType = 'auto' | 'keyword'
type FilterType = 'all' | RowType

type DataRow = {
  type: RowType
  productId: string
  productName: string
  campaign: string
  keyword: string
  impressions: number
  clicks: number
  spend: number
  sales: number
  orders: number
  keywordCpc: number
}

type AggregatedRow = DataRow & {
  sourceRows: number
  cpc: number
  ctr: number
  cvr: number
  roas: number
}

type ColumnKey = 'productId' | 'productName' | 'campaign' | 'keyword' | 'impressions' | 'clicks' | 'spend' | 'sales' | 'orders' | 'keywordCpc'

type ColumnMap = Partial<Record<ColumnKey, number>>

const aliases: Record<ColumnKey, string[]> = {
  productId: ['商品管理番号', '商品管理番号（商品url）', '商品管理番号(商品url)', '商品番号', '商品id', 'itemid'],
  productName: ['商品名', '商品名称'],
  campaign: ['キャンペーン名', 'キャンペーン'],
  keyword: ['キーワード', 'keyword'],
  impressions: ['表示回数', 'インプレッション数', 'インプレッション', 'imp'],
  clicks: ['クリック数', 'clicks', 'click'],
  spend: ['実績額', '広告費', '広告費用', '消化金額', 'cost'],
  sales: ['売上金額', '売上額', '広告経由売上', 'sales'],
  orders: ['注文件数', '注文数', '売上件数', '受注件数', 'orders'],
  keywordCpc: ['キーワードcpc', 'キーワードcpc単価', 'キーワード入札単価'],
}

const autoMarkers = new Set(['', '-', '－', 'ー', '―', '自動', 'オート', 'auto', '自動配信', '自動選定', '未設定'])
const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const number = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 })
const pct = (value: number) => `${value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}%`

function normalize(value: string) {
  return value
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s　_・:：［］\[\]（）()]/g, '')
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''))
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ''))
    rows.push(row)
  }

  return rows.filter(values => values.some(value => value.trim() !== ''))
}

function findColumn(headers: string[], key: ColumnKey) {
  const normalizedHeaders = headers.map(normalize)
  const normalizedAliases = aliases[key].map(normalize)

  for (const alias of normalizedAliases) {
    const exact = normalizedHeaders.findIndex(header => header === alias)
    if (exact >= 0) return exact
  }

  for (const alias of normalizedAliases.filter(value => value.length >= 4)) {
    const partial = normalizedHeaders.findIndex(header => header.includes(alias))
    if (partial >= 0) return partial
  }

  return -1
}

function buildColumnMap(headers: string[]) {
  const map: ColumnMap = {}
  ;(Object.keys(aliases) as ColumnKey[]).forEach(key => {
    const index = findColumn(headers, key)
    if (index >= 0) map[key] = index
  })
  return map
}

function findHeaderRow(rows: string[][]) {
  let bestIndex = -1
  let bestScore = -1

  rows.slice(0, 20).forEach((row, index) => {
    const map = buildColumnMap(row)
    const score = Object.keys(map).length + (map.keyword !== undefined ? 4 : 0) + (map.productId !== undefined ? 2 : 0)
    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  })

  return bestScore >= 5 ? bestIndex : -1
}

function metric(value: string | undefined) {
  if (!value) return 0
  const cleaned = value.replace(/[¥￥,%％円\s]/g, '').replace(/,/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function textAt(row: string[], index: number | undefined) {
  return index === undefined ? '' : (row[index] ?? '').trim()
}

function decodeCsv(buffer: ArrayBuffer) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(buffer), encoding: 'UTF-8' }
  } catch {
    return { text: new TextDecoder('shift-jis').decode(buffer), encoding: 'Shift_JIS' }
  }
}

function aggregate(rows: DataRow[]) {
  const groups = new Map<string, DataRow & { sourceRows: number }>()

  rows.forEach(row => {
    const keywordKey = row.type === 'keyword' ? row.keyword : '__AUTO__'
    const key = [row.type, row.productId, row.productName, row.campaign, keywordKey].join('\u0001')
    const current = groups.get(key)

    if (!current) {
      groups.set(key, { ...row, sourceRows: 1 })
      return
    }

    current.impressions += row.impressions
    current.clicks += row.clicks
    current.spend += row.spend
    current.sales += row.sales
    current.orders += row.orders
    current.keywordCpc = row.keywordCpc || current.keywordCpc
    current.sourceRows += 1
  })

  return Array.from(groups.values()).map<AggregatedRow>(row => ({
    ...row,
    cpc: row.clicks > 0 ? row.spend / row.clicks : 0,
    ctr: row.impressions > 0 ? row.clicks / row.impressions * 100 : 0,
    cvr: row.clicks > 0 ? row.orders / row.clicks * 100 : 0,
    roas: row.spend > 0 ? row.sales / row.spend * 100 : 0,
  }))
}

function csvCell(value: string | number) {
  let text = String(value)
  if (/^[=+@]/.test(text)) text = `'${text}`
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`
  return text
}

export default function RppAutoKeywordPage() {
  const [fileName, setFileName] = useState('')
  const [encoding, setEncoding] = useState('')
  const [rows, setRows] = useState<AggregatedRow[]>([])
  const [rawCount, setRawCount] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<'spend' | 'sales' | 'roas' | 'clicks' | 'orders'>('spend')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  const loadFile = async (file?: File) => {
    if (!file) return
    setError('')
    setRows([])
    setRawCount(0)
    setFileName(file.name)

    if (file.size > 40 * 1024 * 1024) {
      setError('40MBを超えるCSVは、このブラウザ版では処理できません。期間を分けて出力してください。')
      return
    }

    try {
      const decoded = decodeCsv(await file.arrayBuffer())
      setEncoding(decoded.encoding)
      const matrix = parseCsv(decoded.text)
      const headerIndex = findHeaderRow(matrix)

      if (headerIndex < 0) {
        setError('RPPレポートの見出し行を自動判別できませんでした。楽天RPPのパフォーマンスレポートCSVをそのまま選択してください。')
        return
      }

      const headers = matrix[headerIndex]
      const columns = buildColumnMap(headers)
      if (columns.keyword === undefined) {
        setError('「キーワード」列が見つかりません。商品別ではなく、キーワードを含むRPPレポートを選択してください。')
        return
      }

      if (columns.productId === undefined && columns.productName === undefined) {
        setError('商品を識別する列が見つかりません。RPPパフォーマンスレポートのCSVか確認してください。')
        return
      }

      const parsed: DataRow[] = matrix.slice(headerIndex + 1).map(row => {
        const keyword = textAt(row, columns.keyword)
        const keywordNormalized = normalize(keyword)
        const keywordCpc = metric(textAt(row, columns.keywordCpc))
        const type: RowType = autoMarkers.has(keywordNormalized) ? 'auto' : 'keyword'

        return {
          type,
          productId: textAt(row, columns.productId),
          productName: textAt(row, columns.productName),
          campaign: textAt(row, columns.campaign),
          keyword: type === 'auto' ? '' : keyword,
          impressions: metric(textAt(row, columns.impressions)),
          clicks: metric(textAt(row, columns.clicks)),
          spend: metric(textAt(row, columns.spend)),
          sales: metric(textAt(row, columns.sales)),
          orders: metric(textAt(row, columns.orders)),
          keywordCpc,
        }
      }).filter(row => row.productId || row.productName || row.keyword || row.clicks || row.spend || row.sales)

      if (parsed.length === 0) {
        setError('実績行を読み取れませんでした。CSVの内容を確認してください。')
        return
      }

      setRawCount(parsed.length)
      setRows(aggregate(parsed))
      setFilter('all')
      setQuery('')
    } catch {
      setError('CSVを読み込めませんでした。ファイルが破損していないか確認してください。')
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => loadFile(event.target.files?.[0])
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    loadFile(event.dataTransfer.files?.[0])
  }

  const summary = useMemo(() => {
    const total = rows.reduce((acc, row) => {
      acc.spend += row.spend
      acc.sales += row.sales
      acc.clicks += row.clicks
      acc.orders += row.orders
      return acc
    }, { spend: 0, sales: 0, clicks: 0, orders: 0 })

    return {
      ...total,
      roas: total.spend > 0 ? total.sales / total.spend * 100 : 0,
      auto: rows.filter(row => row.type === 'auto').length,
      keyword: rows.filter(row => row.type === 'keyword').length,
    }
  }, [rows])

  const visibleRows = useMemo(() => {
    const needle = normalize(query)
    return rows
      .filter(row => filter === 'all' || row.type === filter)
      .filter(row => !needle || [row.productId, row.productName, row.keyword, row.campaign].some(value => normalize(value).includes(needle)))
      .sort((a, b) => b[sortKey] - a[sortKey])
  }, [rows, filter, query, sortKey])

  const download = (mode: FilterType) => {
    const targets = rows
      .filter(row => mode === 'all' || row.type === mode)
      .sort((a, b) => b.spend - a.spend)

    const header = ['区分', '商品管理番号', '商品名', 'キャンペーン', 'キーワード', '表示回数', 'クリック数', 'CPC実績', 'キーワードCPC', '広告費', '売上金額', '注文件数', 'CTR', 'CVR', 'ROAS', '元レポート行数']
    const body = targets.map(row => [
      row.type === 'auto' ? 'オート' : 'キーワード',
      row.productId,
      row.productName,
      row.campaign,
      row.type === 'auto' ? 'オート配信' : row.keyword,
      row.impressions,
      row.clicks,
      row.cpc.toFixed(2),
      row.keywordCpc || '',
      row.spend,
      row.sales,
      row.orders,
      row.ctr.toFixed(2),
      row.cvr.toFixed(2),
      row.roas.toFixed(2),
      row.sourceRows,
    ])

    const csv = '\uFEFF' + [header, ...body].map(line => line.map(csvCell).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rpp_${mode === 'all' ? 'split' : mode}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFileName('')
    setEncoding('')
    setRows([])
    setRawCount(0)
    setFilter('all')
    setQuery('')
    setError('')
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>← ECPアプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.badge}>FREE TOOL / RAKUTEN RPP</span>
          <h1>RPPオート<br /><em>キーワード分解</em></h1>
          <p>楽天RPPのCSVをそのまま入れるだけ。オート配信と登録キーワードの実績を分離し、商品×キーワード単位にまとめて見やすくします。</p>
        </div>
        <div className={styles.privacyBox}>
          <small>DATA PRIVACY</small>
          <strong>CSVはブラウザ内だけで処理</strong>
          <span>ファイル内容をサーバーへ送信・保存しません。</span>
        </div>
      </section>

      <section className={styles.uploadSection}>
        <div className={styles.stepHead}>
          <div><span>STEP 1</span><h2>RPPのCSVを入れる</h2></div>
          {fileName && <button type="button" onClick={reset}>別のCSVを選ぶ</button>}
        </div>

        {!rows.length ? (
          <label
            className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
            onDragOver={event => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input type="file" accept=".csv,text/csv" onChange={onChange} />
            <div className={styles.uploadIcon}>CSV</div>
            <strong>CSVをここにドロップ</strong>
            <span>またはクリックしてファイルを選択</span>
            <small>UTF-8 / Shift_JIS 自動判定・40MBまで</small>
          </label>
        ) : (
          <div className={styles.loadedFile}>
            <div><span>読み込み完了</span><strong>{fileName}</strong><small>{encoding} / 元データ {number.format(rawCount)} 行 → 集約後 {number.format(rows.length)} 行</small></div>
            <b>✓</b>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        <p className={styles.uploadNote}>RPPパフォーマンスレポートの先頭に説明行が入っていても、見出し行を自動検出します。商品管理番号の先頭0も文字列のまま保持します。</p>
      </section>

      {rows.length > 0 && (
        <>
          <section className={styles.summarySection}>
            <div className={styles.stepHead}><div><span>STEP 2</span><h2>オートとキーワードを分けて見る</h2></div></div>
            <div className={styles.metrics}>
              <Metric label="オート" value={`${number.format(summary.auto)}件`} sub="キーワード未設定行" />
              <Metric label="キーワード" value={`${number.format(summary.keyword)}件`} sub="登録キーワード行" />
              <Metric label="広告費" value={yen.format(summary.spend)} sub={`${number.format(summary.clicks)}クリック`} />
              <Metric label="売上" value={yen.format(summary.sales)} sub={`${number.format(summary.orders)}件`} />
              <Metric label="ROAS" value={pct(summary.roas)} sub="全体集計" />
            </div>
          </section>

          <section className={styles.tableSection}>
            <div className={styles.toolbar}>
              <div className={styles.tabs}>
                <button className={filter === 'all' ? styles.active : ''} onClick={() => setFilter('all')}>すべて</button>
                <button className={filter === 'auto' ? styles.active : ''} onClick={() => setFilter('auto')}>オート</button>
                <button className={filter === 'keyword' ? styles.active : ''} onClick={() => setFilter('keyword')}>キーワード</button>
              </div>
              <div className={styles.controls}>
                <input value={query} onChange={event => setQuery(event.target.value)} placeholder="商品番号・商品名・キーワード検索" />
                <select value={sortKey} onChange={event => setSortKey(event.target.value as typeof sortKey)}>
                  <option value="spend">広告費が大きい順</option>
                  <option value="sales">売上が大きい順</option>
                  <option value="roas">ROASが高い順</option>
                  <option value="clicks">クリックが多い順</option>
                  <option value="orders">注文が多い順</option>
                </select>
              </div>
            </div>

            <div className={styles.resultCount}>{number.format(visibleRows.length)}件表示 {visibleRows.length > 200 && <span>（表は上位200件まで。CSVは全件出力）</span>}</div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>区分</th>
                    <th>商品</th>
                    <th>キーワード</th>
                    <th className={styles.num}>クリック</th>
                    <th className={styles.num}>CPC</th>
                    <th className={styles.num}>広告費</th>
                    <th className={styles.num}>売上</th>
                    <th className={styles.num}>注文</th>
                    <th className={styles.num}>CVR</th>
                    <th className={styles.num}>ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.slice(0, 200).map((row, index) => (
                    <tr key={`${row.type}-${row.productId}-${row.keyword}-${index}`}>
                      <td><span className={`${styles.typeBadge} ${row.type === 'keyword' ? styles.keyword : styles.auto}`}>{row.type === 'keyword' ? 'KEYWORD' : 'AUTO'}</span></td>
                      <td><strong>{row.productId || '—'}</strong><small>{row.productName || row.campaign || ''}</small></td>
                      <td className={styles.keywordCell}><strong>{row.type === 'keyword' ? row.keyword : 'オート配信'}</strong>{row.keywordCpc > 0 && <small>設定CPC {yen.format(row.keywordCpc)}</small>}</td>
                      <td className={styles.num}>{number.format(row.clicks)}</td>
                      <td className={styles.num}>{yen.format(row.cpc)}</td>
                      <td className={styles.num}>{yen.format(row.spend)}</td>
                      <td className={styles.num}>{yen.format(row.sales)}</td>
                      <td className={styles.num}>{number.format(row.orders)}</td>
                      <td className={styles.num}>{pct(row.cvr)}</td>
                      <td className={styles.num}><b>{pct(row.roas)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.downloadSection}>
            <div><span className={styles.label}>STEP 3</span><h2>分離したCSVをダウンロード</h2><p>Excelで開きやすいUTF-8 BOM付きCSVで出力します。元ファイルは変更しません。</p></div>
            <div className={styles.downloads}>
              <button onClick={() => download('all')}><strong>全件・整理済みCSV</strong><span>オート/キーワード列つき</span></button>
              <button onClick={() => download('auto')}><strong>オートのみCSV</strong><span>自動配信だけ抽出</span></button>
              <button onClick={() => download('keyword')}><strong>キーワードのみCSV</strong><span>登録キーワードだけ抽出</span></button>
            </div>
          </section>
        </>
      )}

      <section className={styles.note}>
        <strong>このツールの判定</strong>
        <p>CSV内の「キーワード」列が空欄・オート・自動配信等の行をオート、それ以外をキーワードとして分離します。同じ商品・同じキーワードの複数行は合算し、CPC・CTR・CVR・ROASを再計算します。</p>
        <p>楽天RPPのレポート仕様変更や店舗固有の出力形式により自動判定できない場合があります。本サービスは楽天グループ株式会社の公式サービスではありません。第三者商標については<a href="/trademarks">こちら</a>。</p>
      </section>
    </main>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className={styles.metric}><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>
}
