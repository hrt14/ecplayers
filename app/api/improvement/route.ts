import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_MESSAGE_LENGTH = 2000
const REPOSITORY = process.env.GITHUB_FEEDBACK_REPOSITORY || 'hrt14/ecplayers'

function normalizePath(value: unknown) {
  if (typeof value !== 'string') return '/'
  try {
    const url = new URL(value, 'https://www.ecplayers.com')
    return url.pathname.startsWith('/') ? url.pathname.slice(0, 500) : '/'
  } catch {
    return '/'
  }
}

export async function POST(request: NextRequest) {
  let payload: { message?: unknown; page?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: '入力内容を確認してください。' }, { status: 400 })
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : ''
  if (message.length < 5 || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: '改善内容は5〜2000文字で入力してください。' }, { status: 400 })
  }

  const token = process.env.GITHUB_FEEDBACK_TOKEN
  if (!token) {
    return NextResponse.json({ error: '改善受付を準備中です。' }, { status: 503 })
  }

  const id = crypto.randomUUID()
  const page = normalizePath(payload.page)
  const [owner, repo] = REPOSITORY.split('/')
  if (!owner || !repo) {
    return NextResponse.json({ error: '改善受付の設定に問題があります。' }, { status: 500 })
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ecplayers-improvement-box',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      event_type: 'ecplayers_improvement',
      client_payload: {
        id,
        message,
        page,
        submitted_at: new Date().toISOString(),
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    console.error('Improvement dispatch failed', response.status)
    return NextResponse.json({ error: '送信できませんでした。時間をあけてお試しください。' }, { status: 502 })
  }

  return NextResponse.json({ accepted: true, id }, { status: 202 })
}
