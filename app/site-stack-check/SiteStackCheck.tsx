'use client'

import { FormEvent, useMemo, useState } from 'react'
import styles from './SiteStackCheck.module.css'

type DetectionKey = 'ga4' | 'gtm' | 'clarity' | 'metaPixel' | 'googleAds' | 'consent' | 'productSchema' | 'searchConsoleMeta'

type ScanResult = {
  url: string
  title: string | null
  checkedAt: string
  detections: Record<DetectionKey, boolean>
}

type AutoItem = {
  key: DetectionKey
  name: string
  level: string
  purpose: string
  note: string
  weight: number
  applicable?: boolean
}

const sourceLinks = [
  ['GA4', 'https://support.google.com/analytics/answer/9304153?hl=ja'],
  ['Google Tag Manager', 'https://support.google.com/tagmanager/answer/6103696?hl=ja'],
  ['Microsoft Clarity', 'https://learn.microsoft.com/clarity/setup-and-installation/clarity-setup'],
  ['Search Console', 'https://support.google.com/webmasters/answer/9128668?hl=ja'],
]

export default function SiteStackCheck() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [sellProducts, setSellProducts] = useState(true)
  const [useGoogleAds, setUseGoogleAds] = useState(false)
  const [useMetaAds, setUseMetaAds] = useState(false)
  const [manual, setManual] = useState({ searchConsole: false, merchantCenter: false, googleAdsConversion: false })

  const autoItems = useMemo<AutoItem[]>(() => [
    { key: 'ga4', name: 'Google Analytics 4（GA4）', level: '必須', purpose: 'アクセス・流入・購入などを計測', note: 'GTM内だけで設定している場合はHTMLから直接検出できないことがあります。', weight: 24 },
    { key: 'gtm', name: 'Google Tag Manager', level: '強く推奨', purpose: '計測・広告タグを一元管理', note: '今後タグを増やすなら、直接埋め込みより管理しやすくなります。', weight: 12 },
    { key: 'clarity', name: 'Microsoft Clarity', level: '推奨', purpose: 'ヒートマップ・録画でCVR改善', note: '「どこで迷ったか」を数字以外から確認できます。', weight: 14 },
    { key: 'consent', name: 'Cookie / Consent管理', level: '要確認', purpose: '同意状態に応じた計測管理', note: '必要性は利用地域・取得データ・利用サービスで変わります。', weight: 10 },
    { key: 'productSchema', name: '商品構造化データ', level: 'ECなら推奨', purpose: '商品情報を検索エンジンに伝える', note: 'トップページではなく商品ページ側にだけ存在する場合があります。', weight: 8, applicable: sellProducts },
    { key: 'googleAds', name: 'Google広告タグ', level: '広告利用時', purpose: 'Google広告の成果計測', note: 'GTM経由の場合はHTMLだけで判定できないことがあります。', weight: 10, applicable: useGoogleAds },
    { key: 'metaPixel', name: 'Meta Pixel', level: '広告利用時', purpose: 'Meta広告の成果計測・最適化', note: 'GTM経由の場合はHTMLだけで判定できないことがあります。', weight: 10, applicable: useMetaAds },
  ], [sellProducts, useGoogleAds, useMetaAds])

  const manualItems = useMemo(() => [
    { key: 'searchConsole' as const, name: 'Google Search Console', level: '必須', purpose: '検索語句・表示回数・インデックス状況を確認', weight: 22, applicable: true },
    { key: 'merchantCenter' as const, name: 'Google Merchant Center', level: 'ECなら推奨', purpose: '商品情報をGoogleへ連携', weight: 10, applicable: sellProducts },
    { key: 'googleAdsConversion' as const, name: 'Google広告 コンバージョン', level: '広告利用時', purpose: '購入・問い合わせを広告成果として計測', weight: 10, applicable: useGoogleAds },
  ], [sellProducts, useGoogleAds])

  const score = useMemo(() => {
    if (!result) return null
    let earned = 0
    let total = 0
    for (const item of autoItems) {
      if (item.applicable === false) continue
      total += item.weight
      if (result.detections[item.key]) earned += item.weight
    }
    for (const item of manualItems) {
      if (!item.applicable) continue
      total += item.weight
      if (manual[item.key]) earned += item.weight
    }
    return total ? Math.round((earned / total) * 100) : 0
  }, [result, autoItems, manualItems, manual])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/site-stack-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'サイトを確認できませんでした。')
      setResult(data)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'サイトを確認できませんでした。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/" className={styles.back}>← アプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>FREE TOOL / SELF EC</div>
        <h1>自社EC、<br /><em>何を入れればいい？</em></h1>
        <p>URLを入れると、GA4・GTM・Clarityなど公開ページから確認できる導入痕跡をチェック。最後に「次に入れるもの」を優先順で整理します。</p>

        <form className={styles.search} onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            aria-label="診断するサイトURL"
            required
          />
          <button type="submit" disabled={loading}>{loading ? '確認中…' : '無料でチェック →'}</button>
        </form>
        {error && <div className={styles.error}>{error}</div>}
        <p className={styles.caution}>公開HTMLだけを確認します。ログイン情報や管理画面へのアクセスは不要です。</p>
      </section>

      <section className={styles.conditions}>
        <div><span className={styles.label}>YOUR SITE</span><h2>使っているものだけ判定</h2></div>
        <div className={styles.switches}>
          <label><input type="checkbox" checked={sellProducts} onChange={(e) => setSellProducts(e.target.checked)} /><span>商品を販売している</span></label>
          <label><input type="checkbox" checked={useGoogleAds} onChange={(e) => setUseGoogleAds(e.target.checked)} /><span>Google広告を使う</span></label>
          <label><input type="checkbox" checked={useMetaAds} onChange={(e) => setUseMetaAds(e.target.checked)} /><span>Meta広告を使う</span></label>
        </div>
      </section>

      {result ? (
        <>
          <section className={styles.summary}>
            <div className={styles.scoreBox}>
              <span>SETUP SCORE</span>
              <strong>{score}</strong><small>/100</small>
            </div>
            <div>
              <span className={styles.label}>CHECKED</span>
              <h2>{result.title || 'サイトを確認しました'}</h2>
              <p>{result.url}</p>
              <small>※ スコアは公開HTMLの検出結果＋下の自己確認項目から算出します。</small>
            </div>
          </section>

          <section className={styles.results}>
            <div className={styles.sectionHead}>
              <div><span className={styles.label}>AUTO CHECK</span><h2>自動で確認できたもの</h2></div>
              <p>「未導入」ではなく「このページから検出できなかった」という判定です。GTM内設定や別ページだけの実装は見えない場合があります。</p>
            </div>
            <div className={styles.grid}>
              {autoItems.filter(item => item.applicable !== false).map(item => {
                const detected = result.detections[item.key]
                return (
                  <article className={styles.card} key={item.key}>
                    <div className={styles.cardTop}>
                      <span className={detected ? styles.found : styles.notFound}>{detected ? '検出' : '要確認'}</span>
                      <b>{item.level}</b>
                    </div>
                    <h3>{item.name}</h3>
                    <p className={styles.purpose}>{item.purpose}</p>
                    <p className={styles.note}>{detected ? '公開HTMLから導入痕跡を確認できました。' : item.note}</p>
                  </article>
                )
              })}
            </div>
          </section>

          <section className={styles.manualSection}>
            <div className={styles.sectionHead}>
              <div><span className={styles.label}>MANUAL CHECK</span><h2>ここだけ自分で確認</h2></div>
              <p>公開ページだけでは正確に判定できない項目です。設定済みならチェックしてください。</p>
            </div>
            <div className={styles.manualList}>
              {manualItems.filter(item => item.applicable).map(item => (
                <label key={item.key} className={manual[item.key] ? styles.manualDone : ''}>
                  <input type="checkbox" checked={manual[item.key]} onChange={(e) => setManual({ ...manual, [item.key]: e.target.checked })} />
                  <div><strong>{item.name}</strong><span>{item.level}</span><p>{item.purpose}</p></div>
                  <b>{manual[item.key] ? '設定済み' : '未確認'}</b>
                </label>
              ))}
            </div>
          </section>

          <section className={styles.nextAction}>
            <span className={styles.label}>NEXT ACTION</span>
            <h2>まず「要確認」を上から潰す。</h2>
            <p>最優先は計測の土台です。GA4 → GTM → Search Consoleを確認し、次にClarity。広告を使う場合だけ広告タグとコンバージョン計測を追加してください。</p>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>別のサイトをチェック ↑</button>
          </section>
        </>
      ) : (
        <section className={styles.before}>
          <div><span>01</span><strong>URLを入れる</strong><p>公開中の自社ECトップページでOK。</p></div>
          <div><span>02</span><strong>自動チェック</strong><p>GA4・GTM・Clarityなどの導入痕跡を確認。</p></div>
          <div><span>03</span><strong>抜け漏れを見る</strong><p>必要なものだけ優先度順に確認。</p></div>
        </section>
      )}

      <section className={styles.sources}>
        <span className={styles.label}>OFFICIAL GUIDES</span>
        <h2>設定するときは公式情報へ</h2>
        <div>{sourceLinks.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer">{name} ↗</a>)}</div>
      </section>

      <footer className={styles.footer}><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p></footer>
    </main>
  )
}
