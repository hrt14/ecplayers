'use client'

import { ChangeEvent, useMemo, useRef, useState } from 'react'
import styles from './amazon-negative-finder.module.css'

type RawRow = Record<string, string>
type Status = 'exclude' | 'review' | 'keep' | 'insufficient'

type AggregatedRow = {
  key: string
  campaign: string
  adGroup: string
  campaignId: string
  adGroupId: string
  searchTerm: string
  impressions: number
  clicks: number
  spend: number
  orders: number
  sales: number
  asin: boolean
}

type EvaluatedRow = AggregatedRow & {
  acos: number | null
  status: Status
  reason: string
  score: number
}

const SAMPLE = `キャンペーン名,広告グループ名,カスタマーの検索用語,インプレッション数,クリック数,広告費,注文数,売上\nAUTO_イヤホン,auto,骨伝導 イヤホン 安い,8200,54,6200,0,0\nAUTO_イヤホン,auto,骨伝導 イヤホン,6100,31,3000,5,20000\nAUTO_イヤホン,auto,ランニング イヤホン,4120,38,4800,1,3000\nMANUAL_指名,exact,ブランド名 イヤホン,2200,17,1900,0,0\nAUTO_イヤホン,auto,B0ABC12345,1900,28,3500,0,0`

const aliases: Record<string, string[]> = {
  campaign: ['campaignname', 'キャンペーン名'],
  adGroup: ['adgroupname', '広告グループ名'],
  campaignId: ['campaignid', 'キャンペーンid'],
  adGroupId: ['adgroupid', '広告グループid'],
  searchTerm: ['customersearchterm', 'customersearchquery', 'searchterm', 'カスタマーの検索用語', 'カスタマー検索用語', '検索用語', '検索語句'],
  impressions: ['impressions', 'impression', 'インプレッション数', 'インプレッション', '表示回数'],
  clicks: ['clicks', 'click', 'クリック数', 'クリック'],
  spend: ['spend', 'cost', '広告費', '費用'],
  orders: ['7daystotalorders', '14daystotalorders', 'orders', 'order', '注文数', '注文'],
  sales: ['7daystotalsales', '14daystotalsales', 'advertisedsales', 'sales', '売上高', '売上'],
}

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const integer = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 })

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s_\-()（）#%％:：\/]/g, '')
}

function findHeader(headers: string[], key: keyof typeof aliases) {
  const normalized = headers.map(normalize)
  const candidates = aliases[key].map(normalize)
  let index = normalized.findIndex(header => candidates.includes(header))
  if (index >= 0) return headers[index]
  index = normalized.findIndex(header => candidates.some(candidate => candidate.length >= 5 && header.includes(candidate)))
  return index >= 0 ? headers[index] : ''
}

function detectDelimiter(text: string) {
  const first = text.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] || ''
  const tabs = (first.match(/\t/g) || []).length
  const commas = (first.match(/,/g) || []).length
  return tabs > commas ? '\t' : ','
}

function parseDelimited(text: string): { headers: string[]; rows: RawRow[] } {
  const delimiter = detectDelimiter(text)
  const source = text.replace(/^\uFEFF/, '')
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

function isAsin(value: string) {
  return /^B[A-Z0-9]{9}$/i.test(value.trim())
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

export default function AmazonNegativeFinderPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<AggregatedRow[]>([])
  const [error, setError] = useState('')
  const [targetAcos, setTargetAcos] = useState(30)
  const [minClicks, setMinClicks] = useState(20)
  const [minSpend, setMinSpend] = useState(0)
  const [matchType, setMatchType] = useState<'exact' | 'phrase'>('exact')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [query, setQuery] = useState('')
  const [promptOpen, setPromptOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const evaluated = useMemo<EvaluatedRow[]>(() => {
    return rows.map(row => {
      const acos = row.sales > 0 ? (row.spend / row.sales) * 100 : null
      let status: Status = 'keep'
      let reason = `目標ACOS ${targetAcos}%以内`
      let score = 0

      if (row.clicks < minClicks || row.spend < minSpend) {
        status = 'insufficient'
        reason = row.clicks < minClicks ? `まだ${minClicks}クリック未満` : `広告費が判定下限未満`
      } else if (row.orders === 0) {
        status = 'exclude'
        reason = `${integer.format(row.clicks)}クリックで注文0件`
        score = 200 + row.clicks + row.spend / 100
      } else if (acos !== null && acos > targetAcos * 1.5) {
        status = 'exclude'
        reason = `ACOS ${acos.toFixed(1)}%（目標の1.5倍超）`
        score = 150 + acos + row.spend / 1000
      } else if (acos !== null && acos > targetAcos) {
        status = 'review'
        reason = `ACOS ${acos.toFixed(1)}%（目標超過）`
        score = 100 + acos + row.spend / 1000
      } else {
        score = acos === null ? 0 : Math.max(0, 100 - acos)
      }

      return { ...row, acos, status, reason, score }
    }).sort((a, b) => b.score - a.score)
  }, [rows, minClicks, minSpend, targetAcos])

  const visible = useMemo(() => evaluated.filter(row => {
    if (filter !== 'all' && row.status !== filter) return false
    if (query && !`${row.searchTerm} ${row.campaign} ${row.adGroup}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [evaluated, filter, query])

  const selectedRows = useMemo(() => evaluated.filter(row => selected.has(row.key)), [evaluated, selected])
  const summary = useMemo(() => {
    const candidates = evaluated.filter(row => row.status === 'exclude')
    const reviews = evaluated.filter(row => row.status === 'review')
    return {
      candidates: candidates.length,
      reviews: reviews.length,
      selected: selectedRows.length,
      selectedSpend: selectedRows.reduce((sum, row) => sum + row.spend, 0),
      selectedClicks: selectedRows.reduce((sum, row) => sum + row.clicks, 0),
      zeroOrders: selectedRows.filter(row => row.orders === 0).length,
    }
  }, [evaluated, selectedRows])

  const slidePrompt = useMemo(() => {
    const lines = selectedRows.slice(0, 100).map((row, index) => `${index + 1}. ${row.searchTerm} / ${row.campaign} / ${row.adGroup} / Click ${row.clicks} / Cost ¥${Math.round(row.spend)} / Orders ${row.orders} / Sales ¥${Math.round(row.sales)} / ACOS ${row.acos === null ? '-' : row.acos.toFixed(1) + '%'} / ${row.reason}`).join('\n')
    return `Amazon広告の検索語句レポート分析結果をもとに、EC担当者・経営者向けの改善提案スライドを作成してください。\n\n目的は「広告費を削ること」ではなく、成果につながりにくい検索への投資を減らし、成果の出ている検索へ広告費を再配分することです。\n\n【判定条件】\n目標ACOS: ${targetAcos}%\n最低クリック数: ${minClicks}\n最低広告費: ¥${minSpend}\n選択した除外候補: ${summary.selected}件\n対象広告費: ¥${Math.round(summary.selectedSpend)}\n対象クリック: ${summary.selectedClicks}\nうち注文0件: ${summary.zeroOrders}件\n\n【スライド構成】\n1. 今回の分析概要\n2. Amazon広告の現状\n3. 除外候補の件数と対象広告費\n4. 問題の大きい検索語句 TOP10\n5. 除外候補に共通する検索意図\n6. 除外を推奨する理由\n7. 除外しない方がよい検索語句\n8. 広告費の再配分案\n9. 今すぐやること\n\n各スライドは「事実」「そこから分かること」「推奨アクション」を明確に分けてください。ACOSだけで短絡的に判断せず、クリック数、注文数、広告費、売上、検索意図、データ量を考慮してください。\n\n【選択した除外候補】\n${lines || 'まだ除外候補が選択されていません。'}`
  }, [selectedRows, targetAcos, minClicks, minSpend, summary])

  function loadText(text: string, name: string) {
    try {
      const parsed = parseDelimited(text)
      if (!parsed.headers.length) throw new Error('CSVの中身を読み取れませんでした。')

      const h = {
        campaign: findHeader(parsed.headers, 'campaign'),
        adGroup: findHeader(parsed.headers, 'adGroup'),
        campaignId: findHeader(parsed.headers, 'campaignId'),
        adGroupId: findHeader(parsed.headers, 'adGroupId'),
        searchTerm: findHeader(parsed.headers, 'searchTerm'),
        impressions: findHeader(parsed.headers, 'impressions'),
        clicks: findHeader(parsed.headers, 'clicks'),
        spend: findHeader(parsed.headers, 'spend'),
        orders: findHeader(parsed.headers, 'orders'),
        sales: findHeader(parsed.headers, 'sales'),
      }

      const missing = [
        ['検索用語', h.searchTerm],
        ['クリック数', h.clicks],
        ['広告費', h.spend],
        ['注文数', h.orders],
      ].filter(([, value]) => !value).map(([label]) => label)
      if (missing.length) throw new Error(`必要な列を見つけられません: ${missing.join('、')}。Amazon広告の検索語句レポートCSVを使用してください。`)

      const map = new Map<string, AggregatedRow>()
      for (const raw of parsed.rows) {
        const searchTerm = raw[h.searchTerm]?.trim()
        if (!searchTerm) continue
        const campaign = h.campaign ? raw[h.campaign] || '' : ''
        const adGroup = h.adGroup ? raw[h.adGroup] || '' : ''
        const campaignId = h.campaignId ? raw[h.campaignId] || '' : ''
        const adGroupId = h.adGroupId ? raw[h.adGroupId] || '' : ''
        const key = `${campaignId || campaign}__${adGroupId || adGroup}__${searchTerm}`
        const current = map.get(key) || {
          key,
          campaign,
          adGroup,
          campaignId,
          adGroupId,
          searchTerm,
          impressions: 0,
          clicks: 0,
          spend: 0,
          orders: 0,
          sales: 0,
          asin: isAsin(searchTerm),
        }
        current.impressions += h.impressions ? num(raw[h.impressions]) : 0
        current.clicks += num(raw[h.clicks])
        current.spend += num(raw[h.spend])
        current.orders += num(raw[h.orders])
        current.sales += h.sales ? num(raw[h.sales]) : 0
        map.set(key, current)
      }

      const nextRows = Array.from(map.values())
      if (!nextRows.length) throw new Error('分析できる検索語句がありませんでした。')
      setRows(nextRows)
      setFileName(name)
      setError('')

      const defaults = new Set<string>()
      nextRows.forEach(row => {
        const acos = row.sales > 0 ? (row.spend / row.sales) * 100 : null
        if (row.clicks >= minClicks && row.spend >= minSpend && (row.orders === 0 || (acos !== null && acos > targetAcos * 1.5))) defaults.add(row.key)
      })
      setSelected(defaults)
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
    setSelected(new Set(evaluated.filter(row => row.status === 'exclude').map(row => row.key)))
  }

  function exportCsv() {
    const data: Array<Array<string | number>> = [[
      '除外', '種別', '検索語句/ASIN', '推奨マッチタイプ', 'キャンペーン名', '広告グループ名', 'Campaign ID', 'Ad Group ID', 'インプレッション', 'クリック', '広告費', '注文', '売上', 'ACOS', '判定理由'
    ]]
    selectedRows.forEach(row => data.push([
      'YES', row.asin ? 'ASIN' : 'Keyword', row.searchTerm, row.asin ? 'negative product target' : matchType, row.campaign, row.adGroup, row.campaignId, row.adGroupId, Math.round(row.impressions), Math.round(row.clicks), Math.round(row.spend), row.orders, Math.round(row.sales), row.acos === null ? '' : row.acos.toFixed(1) + '%', row.reason
    ]))
    downloadCsv(`amazon-negative-candidates-${new Date().toISOString().slice(0, 10)}.csv`, data)
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(slidePrompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const statusLabel: Record<Status, string> = {
    exclude: '除外推奨',
    review: '要判断',
    keep: '継続',
    insufficient: 'データ不足',
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerRight}><span>Amazon広告 / 無料ツール</span><a href="/#apps">アプリ一覧へ</a></div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>ECP APP 05 / AMAZON ADS</span>
          <h1>Amazon広告<br /><em>除外発見機</em></h1>
          <p>検索語句レポートを入れるだけ。十分クリックされたのに成果が狙い通りではない検索語句を並べ、除外するものだけチェックしてCSVにします。</p>
          <div className={styles.heroBadges}><span>20クリック基準</span><span>ACOS判定</span><span>ブラウザ内処理</span></div>
        </div>
        <div className={styles.heroPanel}>
          <small>THIS APP DOES</small>
          <ol><li><b>1</b> CSVを読む</li><li><b>2</b> 除外候補を出す</li><li><b>3</b> 人が最終判断</li><li><b>4</b> CSV / 提案プロンプト化</li></ol>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.panel}>
            <span className={styles.step}>STEP 1</span>
            <h2>検索語句レポート</h2>
            <p>Amazon広告の検索語句レポートCSV / TSVを選択。</p>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={handleFile} hidden />
            <button className={styles.upload} onClick={() => fileRef.current?.click()}><span>↑</span>{fileName || 'CSVを選ぶ'}</button>
            <button className={styles.sample} onClick={() => loadText(SAMPLE, 'サンプルデータ.csv')}>サンプルで試す</button>
            {error && <div className={styles.error}>{error}</div>}
            <small className={styles.privacy}>ファイルはサーバーへ送信せず、このブラウザ内だけで処理します。</small>
          </div>

          <div className={styles.panel}>
            <span className={styles.step}>STEP 2</span>
            <h2>判定条件</h2>
            <label className={styles.field}><span>目標ACOS</span><div><input type="number" min="1" max="1000" value={targetAcos} onChange={e => setTargetAcos(Math.max(1, Number(e.target.value) || 1))} /><b>%</b></div></label>
            <label className={styles.field}><span>最低クリック数</span><div><input type="number" min="1" value={minClicks} onChange={e => setMinClicks(Math.max(1, Number(e.target.value) || 1))} /><b>click</b></div></label>
            <label className={styles.field}><span>最低広告費</span><div><input type="number" min="0" value={minSpend} onChange={e => setMinSpend(Math.max(0, Number(e.target.value) || 0))} /><b>円</b></div></label>
            <label className={styles.field}><span>除外マッチタイプ</span><select value={matchType} onChange={e => setMatchType(e.target.value as 'exact' | 'phrase')}><option value="exact">完全一致（推奨）</option><option value="phrase">フレーズ一致</option></select></label>
            <p className={styles.note}>Amazon Ads公式は、除外判断前に少なくとも20クリックの実績を評価することを推奨しています。</p>
          </div>
        </aside>

        <div className={styles.results}>
          <div className={styles.summaryGrid}>
            <article><span>除外推奨</span><strong>{summary.candidates}</strong><small>件</small></article>
            <article><span>要判断</span><strong>{summary.reviews}</strong><small>件</small></article>
            <article className={styles.accent}><span>現在の除外選択</span><strong>{summary.selected}</strong><small>件</small></article>
            <article className={styles.accent}><span>対象広告費</span><strong>{yen.format(summary.selectedSpend)}</strong></article>
          </div>

          <section className={styles.listPanel}>
            <div className={styles.listHead}>
              <div><span className={styles.step}>STEP 3</span><h2>一覧で最終判断</h2><p>除外しないものはチェックを外すだけです。</p></div>
              <div className={styles.listActions}><button onClick={selectRecommended} disabled={!rows.length}>推奨だけ選択</button><button className={styles.primaryButton} onClick={exportCsv} disabled={!summary.selected}>除外CSVを作る ↓</button></div>
            </div>

            <div className={styles.filters}>
              <div className={styles.tabs}>
                {(['all', 'exclude', 'review', 'keep', 'insufficient'] as const).map(value => <button key={value} className={filter === value ? styles.activeTab : ''} onClick={() => setFilter(value)}>{value === 'all' ? 'すべて' : statusLabel[value]}</button>)}
              </div>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="検索語句・キャンペーンで絞る" />
            </div>

            {!rows.length ? (
              <div className={styles.empty}><div>CSV</div><h3>まず検索語句レポートを入れてください</h3><p>候補抽出 → チェック → CSV出力まで、この画面だけで完了します。</p></div>
            ) : (
              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>除外</th><th>判定</th><th>検索語句</th><th>IMP</th><th>Click</th><th>Cost</th><th>注文</th><th>売上</th><th>ACOS</th><th>理由</th></tr></thead>
                  <tbody>{visible.map(row => (
                    <tr key={row.key} className={selected.has(row.key) ? styles.selectedRow : ''}>
                      <td><label className={styles.check}><input type="checkbox" checked={selected.has(row.key)} onChange={() => toggle(row.key)} /><span /></label></td>
                      <td><span className={`${styles.status} ${styles[row.status]}`}>{statusLabel[row.status]}</span></td>
                      <td><strong>{row.searchTerm}</strong>{row.asin && <small className={styles.asin}>ASIN</small>}<small>{row.campaign || 'キャンペーン名なし'}{row.adGroup ? ` / ${row.adGroup}` : ''}</small></td>
                      <td>{integer.format(row.impressions)}</td><td>{integer.format(row.clicks)}</td><td>{yen.format(row.spend)}</td><td>{integer.format(row.orders)}</td><td>{yen.format(row.sales)}</td><td>{row.acos === null ? '—' : `${row.acos.toFixed(1)}%`}</td><td>{row.reason}</td>
                    </tr>
                  ))}</tbody>
                </table>
                {!visible.length && <div className={styles.noRows}>この条件に該当する検索語句はありません。</div>}
              </div>
            )}
          </section>

          <section className={styles.outputPanel}>
            <div><span className={styles.step}>STEP 4</span><h2>そのまま改善提案にもする</h2><p>選んだ除外候補と集計値を入れた、スライド生成用プロンプトを自動作成します。</p></div>
            <button onClick={() => setPromptOpen(true)} disabled={!summary.selected}>スライド化プロンプトを見る →</button>
          </section>

          <div className={styles.sourceNote}>
            <strong>判定について</strong>
            <p>このツールは除外を自動実行しません。データ量と目標ACOSから候補を絞り、人が最終判断するための補助ツールです。ASIN形式の検索語句は「キーワード」ではなく商品除外候補として区別してCSVに出します。</p>
          </div>
        </div>
      </section>

      {promptOpen && <div className={styles.modal} role="dialog" aria-modal="true"><div className={styles.modalCard}><div className={styles.modalHead}><div><span>AI PROMPT</span><h2>Amazon広告 改善提案スライド</h2></div><button onClick={() => setPromptOpen(false)}>×</button></div><textarea readOnly value={slidePrompt} /><div className={styles.modalActions}><button onClick={() => setPromptOpen(false)}>閉じる</button><button className={styles.primaryButton} onClick={copyPrompt}>{copied ? 'コピーしました ✓' : 'プロンプトをコピー'}</button></div></div></div>}

      <footer className={styles.footer}><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p><a href="/#apps">ほかのECPアプリを見る →</a></footer>
    </main>
  )
}
