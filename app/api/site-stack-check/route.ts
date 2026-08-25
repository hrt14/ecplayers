import { NextRequest, NextResponse } from 'next/server'

const MAX_HTML_BYTES = 1_200_000
const MAX_REDIRECTS = 3

function normalizeUrl(input: string) {
  const trimmed = input.trim()
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  return new URL(candidate)
}

function isBlockedHost(url: URL) {
  const host = url.hostname.toLowerCase()
  if (url.username || url.password) return true
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
  if (url.port && !['80', '443'].includes(url.port)) return true
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return true
  if (host.includes(':') || host.startsWith('[')) return true
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true
  return false
}

async function fetchHtml(initialUrl: URL) {
  let current = initialUrl

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    if (isBlockedHost(current)) throw new Error('このURLは確認対象にできません。公開中の通常ドメインを入力してください。')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    let response: Response

    try {
      response = await fetch(current.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'ECplayers-SiteStackCheck/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
        cache: 'no-store',
      })
    } catch {
      throw new Error('サイトへ接続できませんでした。URLと公開状態を確認してください。')
    } finally {
      clearTimeout(timer)
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) throw new Error('リダイレクト先を確認できませんでした。')
      current = new URL(location, current)
      continue
    }

    if (!response.ok) throw new Error(`サイトから正常な応答を取得できませんでした（HTTP ${response.status}）。`)

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error('HTMLページを確認できませんでした。サイトのトップページURLを入力してください。')
    }

    const contentLength = Number(response.headers.get('content-length') || '0')
    if (contentLength > MAX_HTML_BYTES) throw new Error('ページサイズが大きすぎるため確認できませんでした。')

    const reader = response.body?.getReader()
    if (!reader) return { html: await response.text(), finalUrl: current.toString() }

    const decoder = new TextDecoder()
    let html = ''
    let received = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      if (received > MAX_HTML_BYTES) {
        await reader.cancel()
        break
      }
      html += decoder.decode(value, { stream: true })
    }
    html += decoder.decode()

    return { html, finalUrl: current.toString() }
  }

  throw new Error('リダイレクトが多すぎるため確認できませんでした。')
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return null
  return match[1].replace(/\s+/g, ' ').trim().slice(0, 160) || null
}

function detect(html: string) {
  return {
    ga4:
      /googletagmanager\.com\/gtag\/js\?[^"'<>]*id=G-[A-Z0-9]+/i.test(html) ||
      /gtag\s*\(\s*["']config["']\s*,\s*["']G-[A-Z0-9]+["']/i.test(html),
    gtm:
      /googletagmanager\.com\/gtm\.js/i.test(html) ||
      /\bGTM-[A-Z0-9]{5,}\b/i.test(html),
    clarity:
      /clarity\.ms\/tag\//i.test(html) ||
      /\bclarity\s*\(\s*["'](?:set|event|identify|consent)["']/i.test(html),
    metaPixel:
      /connect\.facebook\.net\/[^"']+\/fbevents\.js/i.test(html) ||
      /\bfbq\s*\(/i.test(html),
    googleAds:
      /\bAW-\d{5,}\b/i.test(html) ||
      /googleadservices\.com\/pagead\/conversion/i.test(html),
    consent:
      /cookiebot|onetrust|cookieyes|usercentrics|iubenda|consentmanager|__tcfapi|gtag\s*\(\s*["']consent["']/i.test(html),
    productSchema:
      /["']@type["']\s*:\s*["']Product["']/i.test(html) ||
      /schema\.org\/Product/i.test(html),
    searchConsoleMeta:
      /<meta[^>]+name=["']google-site-verification["']/i.test(html),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null) as { url?: unknown } | null
    if (!body || typeof body.url !== 'string' || !body.url.trim()) {
      return NextResponse.json({ error: 'サイトURLを入力してください。' }, { status: 400 })
    }

    let target: URL
    try {
      target = normalizeUrl(body.url)
    } catch {
      return NextResponse.json({ error: '正しいURLを入力してください。' }, { status: 400 })
    }

    if (isBlockedHost(target)) {
      return NextResponse.json({ error: 'このURLは確認対象にできません。公開中の通常ドメインを入力してください。' }, { status: 400 })
    }

    const { html, finalUrl } = await fetchHtml(target)

    return NextResponse.json({
      url: finalUrl,
      title: getTitle(html),
      checkedAt: new Date().toISOString(),
      detections: detect(html),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'サイトを確認できませんでした。'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
