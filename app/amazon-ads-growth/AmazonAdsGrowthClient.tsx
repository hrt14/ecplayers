'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import styles from './amazonAdsGrowth.module.css'

type CsvRow = Record<string, string>

type CandidateRow = {
  campaign: string
  adGroup: string
  searchTerm: string
  targeting: string
  matchType: string
  clicks: number
  spend: number
  sales: number
  orders: number
  acos: number | null
}

type Finding = {
  id: string
  priority: 'HIGH' | 'MEDIUM' | 'GOOD' | 'INFO'
  category: string
  title: string
  body: string
  value?: string
}

const REPORT_ALIASES = {
  campaign: ['campaign name', 'campaign', 'キャンペーン名', 'キャンペーン'],
  adGroup: ['ad group name', 'ad group', '広告グループ名', '広告グループ'],
  searchTerm: ['customer search term', 'search term', '検索語句', '検索用語', '顧客の検索用語'],
  targeting: ['targeting', 'keyword', 'keyword text', 'targeting expression', 'product targeting expression', 'ターゲティング', 'キーワード', '商品ターゲティング'],
  matchType: ['match type', 'マッチタイプ'],
  clicks: ['clicks', 'クリック数', 'クリック'],
  spend: ['spend', 'cost', '広告費', '費用'],
  sales: ['14 day total sales', '7 day total sales', 'sales', 'sales14d', 'sales7d', '売上', '広告売上', '14日間の総売上', '7日間の総売上'],
  orders: ['14 day total orders (#)', '7 day total orders (#)', 'orders', 'purchases', '注文数', '購入数', '14日間の総注文数', '7日間の総注文数'],
}

const BULK_ALIASES = {
  product: ['product', 'ad product', '広告商品'],
  entity: ['entity', 'レコードタイプ', 'エンティティ'],
  keyword: ['keyword text', 'keyword', 'キーワード'],
  targeting: ['product targeting expression', 'targeting expression', 'targeting', '商品ターゲティング', 'ターゲティング'],
  matchType: ['match type', 'マッチタイプ'],
}

function normalize(value: string) {
  return value.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_\-–—:：/\\()（）\[\]#]+/g, '')
}

function parseCSV(text: string): CsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1]
    if (ch === '"') {
      if (quoted && next === '"') {
        cell += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (ch === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1
      row.push(cell)
      if (row.some(v => v.trim() !== '')) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }

  row.push(cell)
  if (row.some(v => v.trim() !== '')) rows.push(row)
  if (rows.length < 2) return []

  const headers = rows[0].map((h, i) => h.replace(/^\uFEFF/, '').trim() || `column_${i + 1}`)
  return rows.slice(1).map(values => {
    const record: CsvRow = {}
    headers.forEach((header, index) => { record[header] = (values[index] ?? '').trim() })
    return record
  })
}

function findValue(row: CsvRow, aliases: string[]) {
  const entries = Object.entries(row)
  const normalizedAliases = aliases.map(normalize)
  for (const [key, value] of entries) {
    const nk = normalize(key)
    if (normalizedAliases.includes(nk)) return value
  }
  for (const [key, value] of entries) {
    const nk = normalize(key)
    if (normalizedAliases.some(alias => nk.includes(alias) || alias.includes(nk))) return value
  }
  return ''
}

function hasMappedColumn(rows: CsvRow[], aliases: string[]) {
  if (!rows[0]) return false
  const normalizedAliases = aliases.map(normalize)
  return Object.keys(rows[0]).some(key => {
    const nk = normalize(key)
    return normalizedAliases.some(alias => nk === alias || nk.includes(alias) || alias.includes(nk))
  })
}

function num(value: string) {
  const normalized = value.replace(/[¥￥$,，\s]/g, '').replace(/%$/, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function money(value: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(Math.round(value))
}

function percent(value: number) {
  return `${value.toFixed(1)}%`
}

function toCandidate(row: CsvRow): CandidateRow {
  const spend = num(findValue(row, REPORT_ALIASES.spend))
  const sales = num(findValue(row, REPORT_ALIASES.sales))
  return {
    campaign: findValue(row, REPORT_ALIASES.campaign) || '—',
    adGroup: findValue(row, REPORT_ALIASES.adGroup) || '—',
    searchTerm: findValue(row, REPORT_ALIASES.searchTerm) || '—',
    targeting: findValue(row, REPORT_ALIASES.targeting) || '—',
    matchType: findValue(row, REPORT_ALIASES.matchType) || '—',
    clicks: num(findValue(row, REPORT_ALIASES.clicks)),
    spend,
    sales,
    orders: num(findValue(row, REPORT_ALIASES.orders)),
    acos: sales > 0 ? (spend / sales) * 100 : null,
  }
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(row => row.map(cell => {
    const value = String(cell ?? '')
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  }).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const demoSearch = `Campaign Name,Ad Group Name,Customer Search Term,Targeting,Match Type,Clicks,Spend,7 Day Total Sales,7 Day Total Orders (#)\nSP_Auto_Main,Auto,kaibo 骨伝導イヤホン,*,,31,6800,0,0\nSP_Auto_Main,Auto,オープンイヤー イヤホン,*,,24,4200,16800,3\nSP_Generic,Exact,骨伝導 イヤホン,骨伝導 イヤホン,EXACT,42,7800,26000,5\nSP_Generic,Broad,ランニング イヤホン,イヤホン,BROAD,23,5100,6000,1\nSP_Product,ASIN,B0COMPETITOR1,asin="B0COMPETITOR1",,28,4400,17600,4\nSP_Auto_Main,Auto,安い イヤホン,*,,12,2100,0,0`

const demoBulk = `Product,Entity,Keyword Text,Product Targeting Expression,Match Type\nSponsored Products,Keyword,骨伝導 イヤホン,,EXACT\nSponsored Products,Product Targeting,,asin="B0COMPETITOR1",\nSponsored Products,Product Ad,, ,`

export default function AmazonAdsGrowthClient() {
  const [reportRows, setReportRows] = useState<CsvRow[]>([])
  const [bulkRows, setBulkRows] = useState<CsvRow[]>([])
  const [reportName, setReportName] = useState('')
  const [bulkName, setBulkName] = useState('')
  const [brand, setBrand] = useState('')
  const [asins, setAsins] = useState('')
  const [targetAcos, setTargetAcos] = useState(30)
  const [minClicks, setMinClicks] = useState(20)
  const [error, setError] = useState('')

  const readFile = async (event: ChangeEvent<HTMLInputElement>, kind: 'report' | 'bulk') => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (!rows.length) throw new Error('CSVの行を読み取れませんでした。')
      if (kind === 'report') {
        setReportRows(rows)
        setReportName(file.name)
      } else {
        setBulkRows(rows)
        setBulkName(file.name)
      }
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'CSVの読み込みに失敗しました。')
    }
  }

  const analysis = useMemo(() => {
    const candidates = reportRows.map(toCandidate).filter(row => row.searchTerm !== '—' || row.spend > 0 || row.clicks > 0)
    const totalSpend = candidates.reduce((sum, row) => sum + row.spend, 0)
    const totalSales = candidates.reduce((sum, row) => sum + row.sales, 0)
    const totalOrders = candidates.reduce((sum, row) => sum + row.orders, 0)
    const accountAcos = totalSales > 0 ? (totalSpend / totalSales) * 100 : 0

    const waste = candidates
      .filter(row => row.sales <= 0 && row.spend > 0 && row.clicks >= minClicks)
      .sort((a, b) => b.spend - a.spend)
    const watch = candidates
      .filter(row => row.sales <= 0 && row.spend > 0 && row.clicks > 0 && row.clicks < minClicks)
      .sort((a, b) => b.spend - a.spend)
    const exactCandidates = candidates
      .filter(row => row.orders >= 2 && row.sales > 0 && (row.acos ?? Infinity) <= targetAcos && !/exact|完全一致/i.test(row.matchType))
      .sort((a, b) => (b.sales - b.spend) - (a.sales - a.spend))
    const highAcos = candidates
      .filter(row => row.sales > 0 && row.clicks >= minClicks && (row.acos ?? 0) > targetAcos * 1.5)
      .sort((a, b) => (b.acos ?? 0) - (a.acos ?? 0))

    const wasteSpend = waste.reduce((sum, row) => sum + row.spend, 0)
    const watchSpend = watch.reduce((sum, row) => sum + row.spend, 0)
    const findings: Finding[] = []

    if (waste.length) {
      findings.push({ id: 'waste', priority: 'HIGH', category: '原資', title: `売上0の強い除外候補が${waste.length}件`, body: `${minClicks}クリック以上かつ売上0。検索語句を確認し、不要なら除外候補へ。`, value: `${money(wasteSpend)} 原資候補` })
    } else if (reportRows.length) {
      findings.push({ id: 'waste-ok', priority: 'GOOD', category: '原資', title: '強い除外候補は見つかりませんでした', body: `${minClicks}クリック以上・売上0の検索語句は現在0件です。` })
    }

    if (exactCandidates.length) {
      findings.push({ id: 'exact', priority: 'HIGH', category: '攻め', title: `勝ち検索語句の昇格候補が${exactCandidates.length}件`, body: `2件以上売れて目標ACoS ${targetAcos}%以内。Exact化・独立広告グループ化を検討。`, value: `${money(exactCandidates.reduce((s, r) => s + r.sales, 0))} 売上` })
    }

    if (highAcos.length) {
      findings.push({ id: 'high-acos', priority: 'MEDIUM', category: '効率', title: `高ACoSの見直し候補が${highAcos.length}件`, body: `${minClicks}クリック以上で、ACoSが目標の1.5倍を超えています。入札・ターゲット継続可否を確認。` })
    }

    if (watch.length) {
      findings.push({ id: 'watch', priority: 'INFO', category: '観察', title: `まだ判断を急がない売上0語句が${watch.length}件`, body: `${minClicks}クリック未満なので即除外ではなく観察候補。`, value: `${money(watchSpend)} 観察中` })
    }

    let hasSB: boolean | null = null
    let brandCovered: boolean | null = null
    let ownAsinCovered = 0
    let ownAsinTotal = 0
    const asinList = asins.split(/[\s,、\n]+/).map(v => v.trim().toUpperCase()).filter(Boolean)

    if (bulkRows.length) {
      hasSB = bulkRows.some(row => {
        const product = findValue(row, BULK_ALIASES.product)
        return /sponsored\s*brands|スポンサーブランド/i.test(product || Object.values(row).join(' '))
      })
      if (!hasSB) findings.push({ id: 'sb', priority: 'HIGH', category: '守り/攻め', title: 'Sponsored Brandsが見つかりません', body: 'バルクファイル内にSponsored Brandsを確認できません。ブランド検索面の防御・訴求余地を確認してください。' })
      else findings.push({ id: 'sb-ok', priority: 'GOOD', category: '守り', title: 'Sponsored Brandsを確認', body: '少なくとも1件のSponsored Brands関連レコードを検出しました。' })

      if (brand.trim()) {
        const lowerBrand = brand.trim().toLowerCase()
        brandCovered = bulkRows.some(row => {
          const keyword = `${findValue(row, BULK_ALIASES.keyword)} ${findValue(row, BULK_ALIASES.targeting)}`.toLowerCase()
          const match = findValue(row, BULK_ALIASES.matchType)
          return keyword.includes(lowerBrand) && /exact|完全一致/i.test(match)
        })
        if (!brandCovered) findings.push({ id: 'brand', priority: 'HIGH', category: '守り', title: `自社ブランド「${brand.trim()}」のExact防御が未確認`, body: 'ブランド語を含むExactターゲットをバルクファイルから確認できませんでした。' })
        else findings.push({ id: 'brand-ok', priority: 'GOOD', category: '守り', title: '自社ブランドExact防御を確認', body: `「${brand.trim()}」を含むExactターゲットを検出しました。` })
      }

      if (asinList.length) {
        ownAsinTotal = asinList.length
        ownAsinCovered = asinList.filter(asin => bulkRows.some(row => {
          const target = findValue(row, BULK_ALIASES.targeting).toUpperCase()
          return target.includes(asin)
        })).length
        if (ownAsinCovered < ownAsinTotal) findings.push({ id: 'asin', priority: 'HIGH', category: '守り', title: `自社ASIN防御 ${ownAsinCovered}/${ownAsinTotal}件`, body: `${ownAsinTotal - ownAsinCovered}件の自社ASINが商品ターゲティング欄で未確認です。商品詳細ページ防御の余地を確認してください。` })
        else findings.push({ id: 'asin-ok', priority: 'GOOD', category: '守り', title: `自社ASIN防御 ${ownAsinCovered}/${ownAsinTotal}件`, body: '入力した自社ASINはすべて商品ターゲティング欄で確認できました。' })
      }
    }

    return { candidates, totalSpend, totalSales, totalOrders, accountAcos, waste, watch, exactCandidates, highAcos, wasteSpend, findings, hasSB, brandCovered, ownAsinCovered, ownAsinTotal }
  }, [reportRows, bulkRows, brand, asins, targetAcos, minClicks])

  const missingCoreColumns = reportRows.length > 0 && (
    !hasMappedColumn(reportRows, REPORT_ALIASES.searchTerm) ||
    !hasMappedColumn(reportRows, REPORT_ALIASES.clicks) ||
    !hasMappedColumn(reportRows, REPORT_ALIASES.spend) ||
    !hasMappedColumn(reportRows, REPORT_ALIASES.sales)
  )

  const loadDemo = () => {
    setReportRows(parseCSV(demoSearch))
    setBulkRows(parseCSV(demoBulk))
    setReportName('demo-search-term-report.csv')
    setBulkName('demo-bulk-operations.csv')
    setBrand('Kaibo')
    setAsins('B0OWNASIN001\nB0OWNASIN002')
    setTargetAcos(30)
    setMinClicks(20)
    setError('')
  }

  const exportFindings = () => {
    const rows: string[][] = [['優先度', 'カテゴリ', 'キャンペーン', '広告グループ', '検索語句/対象', 'クリック', '広告費', '売上', '注文', 'ACoS', '推奨アクション']]
    analysis.waste.forEach(r => rows.push(['HIGH', '原資', r.campaign, r.adGroup, r.searchTerm, String(r.clicks), String(r.spend), String(r.sales), String(r.orders), r.acos == null ? '' : percent(r.acos), '除外候補として確認']))
    analysis.exactCandidates.forEach(r => rows.push(['HIGH', '攻め', r.campaign, r.adGroup, r.searchTerm, String(r.clicks), String(r.spend), String(r.sales), String(r.orders), r.acos == null ? '' : percent(r.acos), 'Exact化・独立運用を検討']))
    analysis.highAcos.forEach(r => rows.push(['MEDIUM', '効率', r.campaign, r.adGroup, r.searchTerm, String(r.clicks), String(r.spend), String(r.sales), String(r.orders), r.acos == null ? '' : percent(r.acos), '入札・継続可否を見直し']))
    analysis.watch.forEach(r => rows.push(['INFO', '観察', r.campaign, r.adGroup, r.searchTerm, String(r.clicks), String(r.spend), String(r.sales), String(r.orders), '', 'クリック蓄積まで観察']))
    analysis.findings.filter(f => ['sb', 'brand', 'asin'].includes(f.id)).forEach(f => rows.push([f.priority, f.category, '', '', f.title, '', '', '', '', '', f.body]))
    downloadCSV(`amazon-ads-growth-actions-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  const hasAnalysis = reportRows.length > 0

  return (
    <div className={styles.tool}>
      <div className={styles.inputsGrid}>
        <label className={styles.uploadCard}>
          <span className={styles.step}>必須 01</span>
          <strong>検索語句レポート CSV</strong>
          <small>Sponsored Products / Sponsored Brands の検索語句レポート</small>
          <input type="file" accept=".csv,text/csv" onChange={e => readFile(e, 'report')} />
          <b>{reportName || 'CSVを選択'}</b>
        </label>

        <label className={styles.uploadCard}>
          <span className={styles.step}>任意 02</span>
          <strong>バルクファイル CSV</strong>
          <small>守り・ブランド広告の抜けまで診断したい場合</small>
          <input type="file" accept=".csv,text/csv" onChange={e => readFile(e, 'bulk')} />
          <b>{bulkName || 'CSVを選択'}</b>
        </label>
      </div>

      <div className={styles.settingsGrid}>
        <label><span>自社ブランド名</span><input value={brand} onChange={e => setBrand(e.target.value)} placeholder="例：Kaibo" /></label>
        <label><span>自社ASIN</span><textarea value={asins} onChange={e => setAsins(e.target.value)} placeholder={'1行1ASIN\nB0XXXXXXXXX'} rows={2} /></label>
        <label><span>目標ACoS</span><div className={styles.numberInput}><input type="number" min="1" max="300" value={targetAcos} onChange={e => setTargetAcos(Number(e.target.value) || 30)} /><i>%</i></div></label>
        <label><span>売上0の強判定</span><div className={styles.numberInput}><input type="number" min="1" max="200" value={minClicks} onChange={e => setMinClicks(Number(e.target.value) || 20)} /><i>clicks</i></div></label>
      </div>

      <div className={styles.toolActions}>
        <button className={styles.demoButton} type="button" onClick={loadDemo}>サンプルで試す</button>
        {hasAnalysis && <button className={styles.exportButton} type="button" onClick={exportFindings}>改善候補CSVをダウンロード</button>}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {missingCoreColumns && <p className={styles.error}>検索語句・クリック・広告費・売上のいずれかの列を認識できませんでした。Amazon Adsから出力した検索語句レポートCSVか確認してください。</p>}

      {!hasAnalysis ? (
        <div className={styles.emptyState}>
          <b>まず検索語句レポートを入れてください。</b>
          <p>CSVはブラウザ内で解析します。試したい場合は「サンプルで試す」で診断画面を確認できます。</p>
        </div>
      ) : (
        <section className={styles.results}>
          <div className={styles.resultHeadline}>
            <span>DIAGNOSIS RESULT</span>
            <h2>この広告アカウントには、<em>{analysis.findings.filter(f => f.priority === 'HIGH' || f.priority === 'MEDIUM').length}個</em>の改善ポイントがあります。</h2>
          </div>

          <div className={styles.metrics}>
            <article><span>広告費</span><strong>{money(analysis.totalSpend)}</strong></article>
            <article><span>広告売上</span><strong>{money(analysis.totalSales)}</strong></article>
            <article><span>ACoS</span><strong>{analysis.totalSales ? percent(analysis.accountAcos) : '—'}</strong></article>
            <article className={styles.metricPrimary}><span>原資化候補</span><strong>{money(analysis.wasteSpend)}</strong><small>{analysis.totalSpend > 0 ? `広告費の ${percent((analysis.wasteSpend / analysis.totalSpend) * 100)}` : ''}</small></article>
          </div>

          <div className={styles.findingsList}>
            {analysis.findings.map((finding, index) => (
              <article className={`${styles.finding} ${styles[`finding${finding.priority}`]}`} key={finding.id}>
                <div className={styles.findingNo}>{String(index + 1).padStart(2, '0')}</div>
                <div className={styles.findingBody}>
                  <div className={styles.findingMeta}><span>{finding.category}</span><b>{finding.priority === 'HIGH' ? '優先' : finding.priority === 'MEDIUM' ? '見直し' : finding.priority === 'GOOD' ? '確認済み' : '観察'}</b></div>
                  <h3>{finding.title}</h3>
                  <p>{finding.body}</p>
                </div>
                {finding.value && <strong className={styles.findingValue}>{finding.value}</strong>}
              </article>
            ))}
          </div>

          {(analysis.waste.length > 0 || analysis.exactCandidates.length > 0 || analysis.highAcos.length > 0) && (
            <div className={styles.tableWrap}>
              <div className={styles.tableHead}><div><span>ACTION CANDIDATES</span><h3>具体的に見る検索語句</h3></div><small>上位20件を表示</small></div>
              <div className={styles.tableScroll}>
                <table>
                  <thead><tr><th>判定</th><th>検索語句</th><th>Campaign</th><th>Clicks</th><th>広告費</th><th>売上</th><th>注文</th><th>ACoS</th></tr></thead>
                  <tbody>
                    {[
                      ...analysis.waste.map(r => ({ type: '除外候補', tone: 'danger', row: r })),
                      ...analysis.exactCandidates.map(r => ({ type: 'Exact候補', tone: 'grow', row: r })),
                      ...analysis.highAcos.map(r => ({ type: '見直し', tone: 'warn', row: r })),
                    ].slice(0, 20).map((item, index) => (
                      <tr key={`${item.type}-${item.row.campaign}-${item.row.searchTerm}-${index}`}>
                        <td><span className={`${styles.tableBadge} ${styles[item.tone]}`}>{item.type}</span></td>
                        <td><strong>{item.row.searchTerm}</strong></td>
                        <td>{item.row.campaign}</td>
                        <td>{item.row.clicks}</td>
                        <td>{money(item.row.spend)}</td>
                        <td>{money(item.row.sales)}</td>
                        <td>{item.row.orders}</td>
                        <td>{item.row.acos == null ? '—' : percent(item.row.acos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!bulkRows.length && (
            <div className={styles.nextStep}><span>さらに診断</span><strong>バルクファイルを追加すると「守りの抜け」まで見つかります。</strong><p>Sponsored Brands、自社ブランドExact、自社ASIN商品ターゲティングを確認します。</p></div>
          )}
        </section>
      )}
    </div>
  )
}
