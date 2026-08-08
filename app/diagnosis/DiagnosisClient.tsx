'use client'

import { FormEvent, useState } from 'react'
import styles from './diagnosis.module.css'

type DiagnosisResult = {
  finalUrl: string
  siteName: string
  score: number
  categories: { key: string; label: string; score: number; summary: string }[]
  issues: { priority: 'high' | 'medium' | 'low'; title: string; detail: string; impact: string }[]
  signals: {
    title: string | null
    description: string | null
    textLength: number
    h1Count: number
    imageCount: number
    altRate: number
    hasProductSchema: boolean
    hasCanonical: boolean
  }
}

export default function DiagnosisClient() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '診断できませんでした。')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '診断できませんでした。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.toolWrap}>
      <form className={styles.urlForm} onSubmit={submit}>
        <label htmlFor="site-url">診断したいECサイトURL</label>
        <div className={styles.inputRow}>
          <input id="site-url" type="text" inputMode="url" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? '分析中…' : '無料で診断する →'}</button>
        </div>
        <small>ログインが必要な管理画面や非公開ページは読み取りません。</small>
      </form>

      {loading && <div className={styles.loadingBox}><div className={styles.spinner} /><div><b>公開ページを分析しています</b><span>SEO・商品情報・購入導線をチェック中…</span></div></div>}
      {error && <div className={styles.errorBox}>{error}</div>}

      {result && (
        <section className={styles.resultBox}>
          <div className={styles.resultTop}>
            <div><small>AI EC DIAGNOSIS</small><h2>{result.siteName}</h2><a href={result.finalUrl} target="_blank" rel="noreferrer">{result.finalUrl}</a></div>
            <div className={styles.scoreCircle}><strong>{result.score}</strong><span>/100</span></div>
          </div>

          <div className={styles.categoryGrid}>
            {result.categories.map(c => <article key={c.key}><div><span>{c.label}</span><b>{c.score}</b></div><div className={styles.bar}><i style={{ width: `${c.score}%` }} /></div><p>{c.summary}</p></article>)}
          </div>

          <div className={styles.issueSection}>
            <div className={styles.issueHead}><span>PRIORITY ACTIONS</span><h3>まず直したいポイント</h3></div>
            {result.issues.slice(0, 5).map((issue, i) => (
              <article className={styles.issue} key={`${issue.title}-${i}`}>
                <b className={styles[issue.priority]}>{issue.priority === 'high' ? '優先' : issue.priority === 'medium' ? '改善' : '確認'}</b>
                <div><h4>{issue.title}</h4><p>{issue.detail}</p><small>{issue.impact}</small></div>
              </article>
            ))}
          </div>

          <div className={styles.signalBox}>
            <span>取得できた公開情報</span>
            <div><b>H1</b>{result.signals.h1Count}個</div>
            <div><b>本文</b>{result.signals.textLength.toLocaleString()}文字</div>
            <div><b>画像alt</b>{result.signals.altRate}%</div>
            <div><b>Product構造化</b>{result.signals.hasProductSchema ? 'あり' : 'なし'}</div>
          </div>

          <div className={styles.nextCta}>
            <div><span>NEXT STEP</span><h3>次は、アクセス・広告・売上データまでつないで診断。</h3><p>このβ版は公開ページだけを見ています。GA4や広告データを接続すると、「何が原因で、何から直すべきか」まで精度を上げられます。</p></div>
            <a href="/">ECplayersを見る →</a>
          </div>
        </section>
      )}
    </div>
  )
}
