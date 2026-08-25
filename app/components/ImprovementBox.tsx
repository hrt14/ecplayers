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
        <section className={styles.panel} aria-label="改善ボックス">
          <div className={styles.header}>
            <div>
              <strong>改善ボックス</strong>
              <p>気づいたことをそのまま書いてください。</p>
            </div>
            <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="閉じる">×</button>
          </div>

          {status === 'sent' ? (
            <div className={styles.sent}>
              <strong>ありがとうございます。</strong>
              <p>内容を検証し、安全に自動修正できる場合は反映します。</p>
              <button type="button" onClick={() => setStatus('idle')}>続けて送る</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={2000}
                placeholder="例：このボタンを押しても反応しない／結果画面から戻れない／スマホだと文字が重なる"
                aria-label="改善内容"
                disabled={status === 'sending'}
              />
              <div className={styles.meta}>対象ページ: {page}</div>
              <p className={styles.notice}>個人情報、注文番号、パスワードなどは書かないでください。</p>
              {status === 'error' && <p className={styles.error}>{error}</p>}
              <button className={styles.submit} type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? '送信中…' : '改善を送る'}
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
        aria-label="改善ボックスを開く"
      >
        改善
      </button>
    </div>
  )
}
