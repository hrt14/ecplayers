import { NextRequest, NextResponse } from 'next/server'

const MAX_HTML_BYTES = 900_000
const RAKUTEN_HOSTS = ['rakuten.co.jp', 'rakuten.ne.jp']

function isRakutenHost(hostname: string) {
  return RAKUTEN_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
}

function cleanShopCode(value?: string | null) {
  if (!value) return null
  const cleaned = value.trim().replace(/^\/+|\/+$/g, '')
  return /^[a-zA-Z0-9_-]{2,80}$/.test(cleaned) ? cleaned : null
}

function getShopCode(url: URL) {
  const parts = url.pathname.split('/').filter(Boolean)
  if (url.hostname.endsWith('rakuten.ne.jp') && parts[0] === 'gold') {
    return cleanShopCode(parts[1])
  }
  if (url.hostname === 'search.rakuten.co.jp') return null
  return cleanShopCode(parts[0])
}

function getShopIdFromText(text: string) {
  const patterns = [
    /[?&](?:amp;)?sid=(\d{5,9})/i,
    /%3Fsid%3D(\d{5,9})/i,
    /%26sid%3D(\d{5,9})/i,
    /scid=rm_(\d{5,9})/i,
    /["']shopId["']\s*:\s*["']?(\d{5,9})/i,
    /["']shop_id["']\s*:\s*["']?(\d{5,9})/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function getShopName(html: string, fallback: string | null) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  if (!title) return fallback
  return decodeBasicEntities(title)
    .replace(/^【楽天市場】/, '')
    .replace(/の通販.*$/, '')
    .replace(/楽天市場店.*$/, '楽天市場店')
    .trim() || fallback
}

async function readPrefix(response: Response, maxBytes: number) {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let total = 0
  let output = ''

  try {
    while (total < maxBytes) {
      const { value, done } = await reader.read()
      if (done || !value) break
      const remaining = maxBytes - total
      const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value
      total += chunk.byteLength
      output += decoder.decode(chunk, { stream: true })
      if (chunk.byteLength < value.byteLength) break
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }

  output += decoder.decode()
  return output
}

async function fetchShopHtml(shopCode: string) {
  const target = `https://www.rakuten.co.jp/${encodeURIComponent(shopCode)}/`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)

  try {
    const response = await fetch(target, {
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; ECplayers/1.0; +https://ecplayers.com)',
        accept: 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) return null
    return await readPrefix(response, MAX_HTML_BYTES)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url')?.trim()
  const rawShopId = request.nextUrl.searchParams.get('sid')?.trim()

  if (!rawUrl) {
    return NextResponse.json({ error: '楽天ショップURLを入力してください。' }, { status: 400 })
  }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: 'URLの形式を確認してください。' }, { status: 400 })
  }

  if (url.protocol !== 'https:' || !isRakutenHost(url.hostname)) {
    return NextResponse.json({ error: '楽天市場のHTTPS URLを入力してください。' }, { status: 400 })
  }

  const shopCode = getShopCode(url)
  const explicitShopId = /^\d{5,9}$/.test(rawShopId || '') ? rawShopId! : null
  const urlShopId = /^\d{5,9}$/.test(url.searchParams.get('sid') || '') ? url.searchParams.get('sid') : null

  let html: string | null = null
  let detectedShopId = explicitShopId || urlShopId
  let shopName = shopCode

  if (shopCode && !detectedShopId) {
    html = await fetchShopHtml(shopCode)
    if (html) {
      detectedShopId = getShopIdFromText(html)
      shopName = getShopName(html, shopCode)
    }
  }

  const shopUrl = shopCode ? `https://www.rakuten.co.jp/${shopCode}/` : rawUrl
  const searchUrl = detectedShopId
    ? `https://search.rakuten.co.jp/search/mall/?sid=${detectedShopId}`
    : null
  const newItemsUrl = detectedShopId
    ? `https://search.rakuten.co.jp/search/mall/?s=4&sid=${detectedShopId}`
    : null

  return NextResponse.json({
    shopCode,
    shopId: detectedShopId,
    shopName,
    shopUrl,
    searchUrl,
    newItemsUrl,
    deliveryUrl: searchUrl,
    detectedAutomatically: Boolean(detectedShopId && !explicitShopId && !urlShopId),
  })
}
