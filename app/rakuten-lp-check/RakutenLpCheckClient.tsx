'use client'

import { FormEvent, useState } from 'react'
import styles from './rakutenLpCheck.module.css'

type CheckStatus = 'good' | 'warn' | 'missing'

type LpCheck = {
  key: string
  label: string
  weight: number
  status: CheckStatus
  summary: string
  evidence: string | null
  suggestion: string
}

type ManualCheck = {
  title: string
  detail: string
  sourceLabel: string
  sourceUrl: string
}

type Result = {
  finalUrl: string
  pageTitle: string
  score: number
  summary: string
  checks: LpCheck[]
  priorities: LpCheck[]
  manualChecks: ManualCheck[]
  prompt: string
  signals: {
    textLength: number
    imageCount: number
  }
}

const statusLabel: Record<CheckStatus, string> = {
  good: 'あり',
  warn: '弱め',
  missing: '不足',
}

export default function RakutenLpCheckClient() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setCopied(false)
    setLoading(true)
    try {
      const res = await fetch('/api/rakuten-lp-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'チェックできませんでした。')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チェックできませんでした。')
    } finally {
      setLoading(false)
    }
  }

  async function copyPrompt() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('コピーできませんでした。プロンプト欄を選択してコピーしてください。')
    }
  }

  return (
    <div className={styles.toolWrap}>
      <form className={styles.urlForm} onSubmit={submit}>
        <label htmlFor="rakuten-url">楽天市場の商品URL</label>
        <div className={styles.inputRow}>
          <input
            id="rakuten-url"
            type="text"
            inputMode="url"
            placeholder="https://item.rakuten.co.jp/shop/item/"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'チェック中…' : 'LPをチェック →'}</button>
        </div>
        <small>公開中の楽天市場ページだけを読み取ります。RMSへのログイン情報は不要です。</small>
      </form>

      {loading && (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <div><b>商品ページを確認しています</b><span>訴求・比較・安心材料・仕様などをチェック中…</span></div>
        </div>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      {result && (
        <section className={styles.resultBox}>
          <div className={styles.resultTop}>
            <div className={styles.resultTitle}>
              <small>RAKUTEN LP SCORE</small>
              <h2>{result.pageTitle}</h2>
              <a href={result.finalUrl} target="_blank" rel="noreferrer">元ページを開く ↗</a>
            </div>
            <div className={styles.scoreCircle}><strong>{result.score}</strong><span>/100</span></div>
          </div>

          <p className={styles.summary}>{result.summary}</p>

          <div className={styles.prioritySection}>
            <div className={styles.resultSectionHead}><span>TOP PRIORITY</span><h3>まず追加したい3項目</h3></div>
            <div className={styles.priorityGrid}>
              {result.priorities.map((item, index) => (
                <article key={item.key}>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  <div><h4>{item.label}</h4><p>{item.suggestion}</p></div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.checkSection}>
            <div className={styles.resultSectionHead}><span>LP CHECKLIST</span><h3>購入を決める情報が揃っているか</h3></div>
            <div className={styles.checkList}>
              {result.checks.map(item => (
                <article className={styles.checkItem} key={item.key}>
                  <div className={`${styles.statusMark} ${styles[item.status]}`}>{statusLabel[item.status]}</div>
                  <div className={styles.checkBody}>
                    <div className={styles.checkTitle}><h4>{item.label}</h4><span>{item.weight}点</span></div>
                    <p>{item.summary}</p>
                    {item.evidence && <small>検出例：{item.evidence}</small>}
                    {item.status !== 'good' && <strong>改善：{item.suggestion}</strong>}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.manualSection}>
            <div className={styles.resultSectionHead}><span>RAKUTEN RULES</span><h3>自動判定せず、RMSで確認する項目</h3></div>
            {result.manualChecks.map(item => (
              <article key={item.title}>
                <div className={styles.manualBadge}>要確認</div>
                <div><h4>{item.title}</h4><p>{item.detail}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceLabel} ↗</a></div>
              </article>
            ))}
          </div>

          <div className={styles.promptSection}>
            <div className={styles.promptHead}>
              <div><span>AI IMPROVEMENT PROMPT</span><h3>このままAIに貼って改善する</h3></div>
              <button type="button" onClick={copyPrompt}>{copied ? 'コピーしました ✓' : 'プロンプトをコピー'}</button>
            </div>
            <textarea readOnly value={result.prompt} aria-label="AI改善用プロンプト" />
            <p>ChatGPT、Gemini、Claudeなどに貼り付けて使えます。AIがURLを直接読めない場合でも、取得できたページ情報をプロンプト内に含めています。</p>
          </div>

          <div className={styles.signalBox}>
            <span>取得できた公開情報</span>
            <div><b>本文</b>{result.signals.textLength.toLocaleString()}文字</div>
            <div><b>画像タグ</b>{result.signals.imageCount.toLocaleString()}件</div>
            <small>画像タグ数には楽天市場共通UIの画像が含まれる場合があります。</small>
          </div>
        </section>
      )}
    </div>
  )
}
