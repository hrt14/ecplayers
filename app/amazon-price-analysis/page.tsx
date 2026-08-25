'use client'

import { ChangeEvent, useMemo, useRef, useState } from 'react'
import styles from './amazon-price-analysis.module.css'

type RawRow = Record<string, string>
type BucketSize = 1 | 100 | 500 | 1000

type BusinessRow = {
  asin: string
  sku: string
  title: string
  units: number
  sales: number
  sessions: number
}

type AdRow = {
  asin: string
  sku: string
  spend: number
  sales: number
  orders: number
}

type ProductRow = BusinessRow & {
  price: number
  adSpend: number
  adSales: number
  adOrders: number
}

type PriceGroup = {
  price: number
  products: number
  units: number
  sales: number
  sessions: number
  adSpend: number
  adSales: number
  adOrders: number
  recovery: number
  recoveryPerUnit: number
  tacos: number | null
  roas: number | null
  cvr: number | null
}

const BUSINESS_SAMPLE = `（子）ASIN,SKU,商品名,セッション,注文商品点数,注文商品売上\nB0AAA00001,EAR-BLK,骨伝導イヤホン ブラック,1250,53,157940\nB0AAA00002,EAR-WHT,骨伝導イヤホン ホワイト,980,42,137760\nB0AAA00003,EAR-BLU,骨伝導イヤホン ブルー,760,35,121800\nB0AAA00004,EAR-GRY,骨伝導イヤホン グレー,540,19,66120`
const ADS_SAMPLE = `広告対象ASIN,広告対象SKU,費用,7日間の広告売上高,7日間の注文数\nB0AAA00001,EAR-BLK,35000,92000,31\nB0AAA00002,EAR-WHT,21000,74000,23\nB0AAA00003,EAR-BLU,14000,63000,18\nB0AAA00004,EAR-GRY,12000,21000,7`

const businessAliases = {
  asin: ['(子)asin', '（子）asin', 'childasin', 'asin'],
  sku: ['sku', '出品者sku', 'sellersku', 'merchant sku'],
  title: ['商品名', '商品タイトル', 'title', 'producttitle'],
  sessions: ['セッション', 'セッション合計', 'sessionstotal', 'sessions'],
  units: ['注文商品点数', '注文商品数', 'unitsordered', 'orderedproductunits'],
  sales: ['注文商品売上', '注文商品売上高', 'orderedproductsales'],
} as const

const adAliases = {
  asin: ['広告対象asin', 'advertisedasin', 'asin'],
  sku: ['広告対象sku', 'advertisedsku', 'sku'],
  spend: ['費用', '広告費', 'spend', 'cost'],
  sales: ['7日間の広告売上高', '14日間の広告売上高', '7daystotalsales', '14daystotalsales', 'advertisedsales', 'sales'],
  orders: ['7日間の注文数', '14日間の注文数', '7daystotalorders', '14daystotalorders', 'orders'],
} as const

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const integer = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 })

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s_\-()（）#%％:：\/・]/g, '')
}

function findHeader<T extends Record<string, readonly string[]>>(headers: string[], aliases: T, key: keyof T) {
  const normalizedHeaders = headers.map(normalize)
  const candidates = aliases[key].map(normalize)
  let index = normalizedHeaders.findIndex(header => candidates.includes(header))
  if (index >= 0) return headers[index]
  index = normalizedHeaders.findIndex(header => candidates.some(candidate => candidate.length >= 5 && header.includes(candidate)))
  return index >= 0 ? headers[index] : ''
}

function detectDelimiter(text: string) {
  const first = text.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] || ''
  return (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? '\t' : ','
}

function parseDelimited(text: string): { headers: string[]; rows: RawRow[] } {
  const source = text.replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(source)
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
      if (row.some(value => value.trim())) matrix.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell)
  if (row.some(value => value.trim())) matrix.push(row)
  if (!matrix.length) return { headers: [], rows: [] }
  const headers = matrix[0].map(value => value.trim())
  const rows = matrix.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ''])))
  return { headers, rows }
}

function num(value = '') {
  const cleaned = value.replace(/[,，￥¥$€£\s]/g, '').replace(/[^0-9.\-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function percent(value: number | null) {
  return value === null || !Number.isFinite(value) ? '—' : `${value.toFixed(1)}%`
}

function csvEscape(value: string | number) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = '\uFEFF' + rows.map(row => row.map(csvEscape).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function readText(file: File) {
  const buffer = await file.arrayBuffer()
  const utf8 = new TextDecoder('utf-8').decode(buffer)
  const broken = (utf8.match(/\uFFFD/g) || []).length
  if (broken === 0) return utf8
  try {
    const sjis = new TextDecoder('shift_jis').decode(buffer)
    const sjisBroken = (sjis.match(/\uFFFD/g) || []).length
    return sjisBroken < broken ? sjis : utf8
  } catch {
    return utf8
  }
}

function parseBusiness(text: string) {
  const parsed = parseDelimited(text)
  if (!parsed.headers.length) throw new Error('ビジネスレポートを読み取れませんでした。')
  const h = {
    asin: findHeader(parsed.headers, businessAliases, 'asin'),
    sku: findHeader(parsed.headers, businessAliases, 'sku'),
    title: findHeader(parsed.headers, businessAliases, 'title'),
    sessions: findHeader(parsed.headers, businessAliases, 'sessions'),
    units: findHeader(parsed.headers, businessAliases, 'units'),
    sales: findHeader(parsed.headers, businessAliases, 'sales'),
  }
  const missing = [['ASIN', h.asin], ['注文商品点数', h.units], ['注文商品売上', h.sales]].filter(([, value]) => !value).map(([label]) => label)
  if (missing.length) throw new Error(`必要な列を見つけられません: ${missing.join('、')}。ビジネスレポート「詳細ページ 売上・トラフィック（子商品）」のCSVを選んでください。`)

  const map = new Map<string, BusinessRow>()
  parsed.rows.forEach(raw => {
    const asin = raw[h.asin]?.trim().toUpperCase()
    if (!asin) return
    const sku = h.sku ? raw[h.sku]?.trim() || '' : ''
    const current = map.get(asin) || { asin, sku, title: h.title ? raw[h.title]?.trim() || '' : '', units: 0, sales: 0, sessions: 0 }
    current.units += num(raw[h.units])
    current.sales += num(raw[h.sales])
    current.sessions += h.sessions ? num(raw[h.sessions]) : 0
    if (!current.sku && sku) current.sku = sku
    if (!current.title && h.title) current.title = raw[h.title]?.trim() || ''
    map.set(asin, current)
  })
  const rows = Array.from(map.values()).filter(row => row.units > 0 && row.sales > 0)
  if (!rows.length) throw new Error('売上と注文商品点数が入った行を見つけられませんでした。')
  return { rows, detected: h }
}

function parseAds(text: string) {
  const parsed = parseDelimited(text)
  if (!parsed.headers.length) throw new Error('広告商品レポートを読み取れませんでした。')
  const h = {
    asin: findHeader(parsed.headers, adAliases, 'asin'),
    sku: findHeader(parsed.headers, adAliases, 'sku'),
    spend: findHeader(parsed.headers, adAliases, 'spend'),
    sales: findHeader(parsed.headers, adAliases, 'sales'),
    orders: findHeader(parsed.headers, adAliases, 'orders'),
  }
  const missing = [['広告対象ASINまたはSKU', h.asin || h.sku], ['費用', h.spend]].filter(([, value]) => !value).map(([label]) => label)
  if (missing.length) throw new Error(`必要な列を見つけられません: ${missing.join('、')}。Amazon Adsの広告商品レポートを選んでください。`)

  const map = new Map<string, AdRow>()
  parsed.rows.forEach(raw => {
    const asin = h.asin ? raw[h.asin]?.trim().toUpperCase() || '' : ''
    const sku = h.sku ? raw[h.sku]?.trim() || '' : ''
    const key = asin ? `asin:${asin}` : sku ? `sku:${sku.toLowerCase()}` : ''
    if (!key) return
    const current = map.get(key) || { asin, sku, spend: 0, sales: 0, orders: 0 }
    current.spend += num(raw[h.spend])
    current.sales += h.sales ? num(raw[h.sales]) : 0
    current.orders += h.orders ? num(raw[h.orders]) : 0
    map.set(key, current)
  })
  const rows = Array.from(map.values())
  if (!rows.length) throw new Error('広告対象商品を見つけられませんでした。')
  return { rows, detected: h }
}

function FileCard({
  step,
  title,
  description,
  fileName,
  inputRef,
  onFile,
  onSample,
  error,
}: {
  step: string
  title: string
  description: string
  fileName: string
  inputRef: { current: HTMLInputElement | null }
  onFile: (event: ChangeEvent<HTMLInputElement>) => void
  onSample: () => void
  error: string
}) {
  return (
    <article className={styles.fileCard}>
      <span className={styles.step}>{step}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <input ref={inputRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={onFile} hidden />
      <button className={styles.uploadButton} onClick={() => inputRef.current?.click()}><span>↑</span>{fileName || 'CSVを選ぶ'}</button>
      <button className={styles.sampleButton} onClick={onSample}>サンプルで試す</button>
      {error ? <div className={styles.error}>{error}</div> : null}
    </article>
  )
}

export default function AmazonPriceAnalysisPage() {
  const businessRef = useRef<HTMLInputElement>(null)
  const adsRef = useRef<HTMLInputElement>(null)
  const [businessRows, setBusinessRows] = useState<BusinessRow[]>([])
  const [adRows, setAdRows] = useState<AdRow[]>([])
  const [businessName, setBusinessName] = useState('')
  const [adsName, setAdsName] = useState('')
  const [businessError, setBusinessError] = useState('')
  const [adsError, setAdsError] = useState('')
  const [bucketSize, setBucketSize] = useState<BucketSize>(1)
  const [sortKey, setSortKey] = useState<'price' | 'sales' | 'recovery'>('price')

  const products = useMemo<ProductRow[]>(() => {
    const byAsin = new Map<string, AdRow>()
    const bySku = new Map<string, AdRow>()
    adRows.forEach(row => {
      if (row.asin) byAsin.set(row.asin, row)
      if (row.sku) bySku.set(row.sku.toLowerCase(), row)
    })
    return businessRows.map(row => {
      const ad = byAsin.get(row.asin) || (row.sku ? bySku.get(row.sku.toLowerCase()) : undefined)
      return {
        ...row,
        price: row.units > 0 ? row.sales / row.units : 0,
        adSpend: ad?.spend || 0,
        adSales: ad?.sales || 0,
        adOrders: ad?.orders || 0,
      }
    })
  }, [businessRows, adRows])

  const groups = useMemo<PriceGroup[]>(() => {
    const map = new Map<number, Omit<PriceGroup, 'recovery' | 'recoveryPerUnit' | 'tacos' | 'roas' | 'cvr'>>()
    products.forEach(product => {
      const price = Math.round(product.price / bucketSize) * bucketSize
      const current = map.get(price) || { price, products: 0, units: 0, sales: 0, sessions: 0, adSpend: 0, adSales: 0, adOrders: 0 }
      current.products += 1
      current.units += product.units
      current.sales += product.sales
      current.sessions += product.sessions
      current.adSpend += product.adSpend
      current.adSales += product.adSales
      current.adOrders += product.adOrders
      map.set(price, current)
    })
    const result = Array.from(map.values()).map(group => ({
      ...group,
      recovery: group.sales - group.adSpend,
      recoveryPerUnit: group.units > 0 ? (group.sales - group.adSpend) / group.units : 0,
      tacos: group.sales > 0 ? (group.adSpend / group.sales) * 100 : null,
      roas: group.adSpend > 0 ? group.adSales / group.adSpend : null,
      cvr: group.sessions > 0 ? (group.units / group.sessions) * 100 : null,
    }))
    return result.sort((a, b) => sortKey === 'price' ? a.price - b.price : sortKey === 'sales' ? b.sales - a.sales : b.recovery - a.recovery)
  }, [products, bucketSize, sortKey])

  const summary = useMemo(() => {
    const sales = products.reduce((sum, row) => sum + row.sales, 0)
    const units = products.reduce((sum, row) => sum + row.units, 0)
    const sessions = products.reduce((sum, row) => sum + row.sessions, 0)
    const adSpend = products.reduce((sum, row) => sum + row.adSpend, 0)
    const adSales = products.reduce((sum, row) => sum + row.adSales, 0)
    const matchedAds = products.filter(row => row.adSpend > 0 || row.adSales > 0).length
    const best = groups.reduce<PriceGroup | null>((winner, group) => !winner || group.recovery > winner.recovery ? group : winner, null)
    return {
      sales,
      units,
      sessions,
      adSpend,
      adSales,
      recovery: sales - adSpend,
      recoveryPerUnit: units > 0 ? (sales - adSpend) / units : 0,
      avgPrice: units > 0 ? sales / units : 0,
      tacos: sales > 0 ? (adSpend / sales) * 100 : null,
      roas: adSpend > 0 ? adSales / adSpend : null,
      cvr: sessions > 0 ? (units / sessions) * 100 : null,
      matchedAds,
      best,
    }
  }, [products, groups])

  const maxRecovery = Math.max(...groups.map(group => group.recovery), 1)

  function loadBusiness(text: string, name: string) {
    try {
      const parsed = parseBusiness(text)
      setBusinessRows(parsed.rows)
      setBusinessName(name)
      setBusinessError('')
    } catch (error) {
      setBusinessRows([])
      setBusinessError(error instanceof Error ? error.message : 'ビジネスレポートを読み取れませんでした。')
    }
  }

  function loadAds(text: string, name: string) {
    try {
      const parsed = parseAds(text)
      setAdRows(parsed.rows)
      setAdsName(name)
      setAdsError('')
    } catch (error) {
      setAdRows([])
      setAdsError(error instanceof Error ? error.message : '広告商品レポートを読み取れませんでした。')
    }
  }

  async function handleBusiness(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try { loadBusiness(await readText(file), file.name) } catch { setBusinessError('ファイルを読み取れませんでした。') }
  }

  async function handleAds(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try { loadAds(await readText(file), file.name) } catch { setAdsError('ファイルを読み取れませんでした。') }
  }

  function exportResult() {
    const rows: Array<Array<string | number>> = [[
      '推定実売価/価格帯', 'ASIN数', '販売数', '総売上', '広告費', '広告売上', 'ROAS', 'TACOS', '広告差引回収額', '1個あたり回収額', 'セッション', 'CVR'
    ]]
    groups.forEach(group => rows.push([
      Math.round(group.price), group.products, Math.round(group.units), Math.round(group.sales), Math.round(group.adSpend), Math.round(group.adSales), group.roas === null ? '' : group.roas.toFixed(2), group.tacos === null ? '' : group.tacos.toFixed(2) + '%', Math.round(group.recovery), Math.round(group.recoveryPerUnit), Math.round(group.sessions), group.cvr === null ? '' : group.cvr.toFixed(2) + '%'
    ]))
    downloadCsv(`amazon-price-analysis-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerRight}><span>Amazon / 無料分析ツール</span><a href="/#apps">アプリ一覧へ</a></div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>ECP / AMAZON PRICE ANALYSIS</span>
          <h1>Amazon<br /><em>売価分析</em></h1>
          <p>値下げして売れた。でも本当に得だった？ ビジネスレポートと広告商品レポートを重ねて、売価ごとの売上・広告費・実質回収を一画面で比較します。</p>
          <div className={styles.heroBadges}><span>売価別集計</span><span>TACOS</span><span>ブラウザ内処理</span></div>
        </div>
        <div className={styles.heroFormula}>
          <small>CORE METRIC</small>
          <strong>広告差引回収額</strong>
          <b>総売上 − 広告費</b>
          <p>広告売上は総売上へ足しません。広告経由売上の二重計上を避けます。</p>
        </div>
      </section>

      <section className={styles.uploadSection}>
        <FileCard step="STEP 1 / REQUIRED" title="ビジネスレポート" description="「詳細ページ 売上・トラフィック（子商品）」のCSV。ASIN・注文商品点数・注文商品売上を使います。" fileName={businessName} inputRef={businessRef} onFile={handleBusiness} onSample={() => loadBusiness(BUSINESS_SAMPLE, 'サンプル_ビジネスレポート.csv')} error={businessError} />
        <FileCard step="STEP 2 / OPTIONAL" title="広告商品レポート" description="Amazon Adsの広告商品レポート。広告対象ASIN / SKU・費用・広告売上をASIN単位で合流します。" fileName={adsName} inputRef={adsRef} onFile={handleAds} onSample={() => loadAds(ADS_SAMPLE, 'サンプル_広告商品レポート.csv')} error={adsError} />
        <div className={styles.privacyCard}>
          <span>LOCAL PROCESSING</span>
          <h3>CSVは外に送らない</h3>
          <p>アップロードしたファイルは、このブラウザ内だけで読み取り・集計します。</p>
          <div><b>{businessRows.length || '—'}</b><small>売上ASIN</small></div>
          <div><b>{adRows.length || '—'}</b><small>広告商品</small></div>
        </div>
      </section>

      <section className={styles.analysis}>
        <div className={styles.analysisHead}>
          <div><span className={styles.step}>STEP 3</span><h2>売価ごとの回収を見る</h2><p>推定実売価 = 注文商品売上 ÷ 注文商品点数。価格変更を含む期間では、そのASINの期間平均売価になります。</p></div>
          <div className={styles.controls}>
            <label><span>価格のまとめ方</span><select value={bucketSize} onChange={event => setBucketSize(Number(event.target.value) as BucketSize)}><option value={1}>1円単位</option><option value={100}>100円単位</option><option value={500}>500円単位</option><option value={1000}>1,000円単位</option></select></label>
            <label><span>並び順</span><select value={sortKey} onChange={event => setSortKey(event.target.value as 'price' | 'sales' | 'recovery')}><option value="price">売価順</option><option value="recovery">回収額が大きい順</option><option value="sales">売上が大きい順</option></select></label>
          </div>
        </div>

        {!businessRows.length ? (
          <div className={styles.empty}><div>CSV + CSV</div><h3>まずビジネスレポートを入れてください</h3><p>広告レポートなしでも売価別の売上・販売数・CVRまで確認できます。</p></div>
        ) : (
          <>
            <div className={styles.summaryGrid}>
              <article><span>総売上</span><strong>{yen.format(summary.sales)}</strong><small>{integer.format(summary.units)}個 / 平均 {yen.format(summary.avgPrice)}</small></article>
              <article><span>広告費</span><strong>{yen.format(summary.adSpend)}</strong><small>{adsName ? `${summary.matchedAds} ASIN/SKUに合流` : '広告CSV未読込'}</small></article>
              <article className={styles.accent}><span>広告差引回収</span><strong>{yen.format(summary.recovery)}</strong><small>1個あたり {yen.format(summary.recoveryPerUnit)}</small></article>
              <article><span>TACOS</span><strong>{percent(summary.tacos)}</strong><small>広告費 ÷ 総売上</small></article>
              <article><span>広告ROAS</span><strong>{summary.roas === null ? '—' : `${summary.roas.toFixed(2)}x`}</strong><small>広告売上 ÷ 広告費</small></article>
              <article><span>全体CVR</span><strong>{percent(summary.cvr)}</strong><small>注文商品点数 ÷ セッション</small></article>
            </div>

            <div className={styles.chartPanel}>
              <div className={styles.chartHead}><div><span>RECOVERY BY PRICE</span><h3>売価 × 広告差引回収額</h3></div>{summary.best ? <p>この期間の回収額最大：<b>{yen.format(summary.best.price)}</b> 帯</p> : null}</div>
              <div className={styles.bars}>{groups.map(group => <div className={styles.barRow} key={group.price}><span>{yen.format(group.price)}</span><div><i style={{ width: `${Math.max(2, (group.recovery / maxRecovery) * 100)}%` }} /></div><b>{yen.format(group.recovery)}</b></div>)}</div>
              <small className={styles.chartNote}>※「回収額最大」はこのアップロード期間の結果比較であり、その価格が因果的に最適だと断定するものではありません。</small>
            </div>

            <div className={styles.tablePanel}>
              <div className={styles.tableHead}><div><span>DETAIL</span><h3>売価別集計</h3></div><button onClick={exportResult}>集計CSVをダウンロード ↓</button></div>
              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>売価</th><th>ASIN</th><th>販売数</th><th>総売上</th><th>広告費</th><th>広告売上</th><th>ROAS</th><th>TACOS</th><th>広告差引回収</th><th>回収/個</th><th>CVR</th></tr></thead>
                  <tbody>{groups.map(group => <tr key={group.price}><td><strong>{yen.format(group.price)}</strong></td><td>{group.products}</td><td>{integer.format(group.units)}</td><td>{yen.format(group.sales)}</td><td>{yen.format(group.adSpend)}</td><td>{yen.format(group.adSales)}</td><td>{group.roas === null ? '—' : `${group.roas.toFixed(2)}x`}</td><td>{percent(group.tacos)}</td><td className={styles.recovery}>{yen.format(group.recovery)}</td><td>{yen.format(group.recoveryPerUnit)}</td><td>{percent(group.cvr)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      <section className={styles.readingSection}>
        <div><span className={styles.step}>HOW TO READ</span><h2>値下げで増えたのは、<br />売上か。回収か。</h2></div>
        <div className={styles.readingGrid}>
          <article><b>01</b><h3>販売数だけで判断しない</h3><p>安い価格ほど販売数が増えても、広告費まで引くと回収が伸びていないことがあります。</p></article>
          <article><b>02</b><h3>TACOSで広告依存を見る</h3><p>売価別に「総売上の何％を広告費に使ったか」を並べると、価格ごとの広告依存度を比較できます。</p></article>
          <article><b>03</b><h3>利益とは分けて考える</h3><p>広告差引回収額には原価・Amazon手数料・FBA費用は含みません。最終利益は限界利益計算機と合わせて判断します。</p></article>
        </div>
      </section>

      <section className={styles.sources}>
        <span>REFERENCE</span>
        <h2>Amazon公式情報に合わせた設計</h2>
        <p>Amazon Ads公式では、広告商品レポートで広告対象商品ごとの売上・パフォーマンスを確認できます。ROASは広告売上 ÷ 広告費、ACOSは広告費 ÷ 広告売上です。本ツールのTACOSは広告費 ÷ 総売上として別に計算します。</p>
        <div><a href="https://advertising.amazon.com/ja-jp/library/guides/sponsored-products-best-practices" target="_blank" rel="noreferrer">Amazon Ads：スポンサープロダクト広告 ベストプラクティス ↗</a><a href="https://advertising.amazon.com/ja-jp/resources/faq" target="_blank" rel="noreferrer">Amazon Ads：FAQ（ACOS / ROAS） ↗</a></div>
      </section>

      <footer className={styles.footer}><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p><a href="/amazon-margin">Amazon限界利益計算機 →</a></footer>
    </main>
  )
}
