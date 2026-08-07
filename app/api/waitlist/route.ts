import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type WaitlistPayload = {
  email?: string
  role?: string
  products?: string
  priceIntent?: string
  note?: string
  company?: string
  website?: string
  source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  referrer?: string
}

export async function POST(request: NextRequest) {
  let payload: WaitlistPayload

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  if (payload.website) {
    return NextResponse.json({ ok: true })
  }

  if (!payload.email || !payload.role || !payload.products || !payload.priceIntent) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const webhookUrl = process.env.WAITLIST_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('WAITLIST_WEBHOOK_URL is not configured')
    return NextResponse.json({ ok: false, error: 'waitlist_not_configured' }, { status: 503 })
  }

  const lead = {
    ...payload,
    createdAt: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || '',
    ipCountry: request.headers.get('x-vercel-ip-country') || '',
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Waitlist webhook failed', response.status)
      return NextResponse.json({ ok: false, error: 'webhook_failed' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Waitlist webhook request failed', error)
    return NextResponse.json({ ok: false, error: 'webhook_unreachable' }, { status: 502 })
  }
}
