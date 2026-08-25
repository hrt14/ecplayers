'use client'

import { FormEvent, useEffect, useState } from 'react'
import styles from './ImprovementBox.module.css'

const COOLDOWN_MS = 60_000
const STORAGE_KEY = 'ecplayers:last-improvement-submit'

export default function ImprovementBox() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  const [page, setPage] = useState('/')

  useEffect(() => {
    setPage(window.location.pathname || '/')
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = message.trim()
    if (text.length < 5) {
      setError('5文字以上で書いてください。')
      setStatus('error')
      return
    }

    const last = Number(window.localStorage.getItem(STORAGE_KEY) || 0)
    if (Date.now() - last < COOLDOWN_MS) {
      setError('送信直後です。少し時間をあけてもう一度お試しください。')
      setStatus('error')
      return
    }

    setStatus('sending')
    setError('')

    try {
      const response = await fetch('/api/improvement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, page }),
      })
      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(data.error || '送信できませんでした。')

      window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
      setMessage('')
      setStatus('sent')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '送信できませんでした。')
      setStatus('error')
    }
  }

  return (
    <div className={styles.root}>
      {open && (
        <section className={styles.panel} aria-label="ご意見・不具合報告">
          <div className={styles.header}>
            <div>
              <strong>ご意見・不具合報告</strong>
              <p>使いにくい点や、欲しい機能があれば教えてください。</p>
            </div>
            <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="閉じる">×</button>
          </div>

          {status === 'sent' ? (
            <div className={styles.sent}>
              <strong>ありがとうございます。</strong>
              <p>今後の改善に活用します。</p>
              <button type="button" onClick={() => setStatus('idle')}>続けて送る</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={2000}
                placeholder="例：ここが分かりにくい／この機能がほしい／ボタンが反応しない"
                aria-label="ご意見・不具合内容"
                disabled={status === 'sending'}
              />
              <p className={styles.notice}>個人情報、注文番号、パスワードなどは書かないでください。</p>
              {status === 'error' && <p className={styles.error}>{error}</p>}
              <button className={styles.submit} type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? '送信中…' : '送信する'}
              </button>
            </form>
          )}
        </section>
      )}

      <button
        className={styles.fab}
        type="button"
        onClick={() => {
          setOpen((value) => !value)
          if (status === 'sent') setStatus('idle')
        }}
        aria-expanded={open}
        aria-label="ご意見・不具合報告を開く"
      >
        ご意見
      </button>
    </div>
  )
}
