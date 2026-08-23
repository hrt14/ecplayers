import { NextResponse } from 'next/server'
import dns from 'node:dns/promises'
import net from 'node:net'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 2_000_000
const TIMEOUT_MS = 9_000

type Priority = 'high' | 'medium' | 'low'
type Issue = { priority: Priority; title: string; detail: string; impact: string }

function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))) }

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function attr(tag: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = tag.match(new RegExp(`${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return decodeEntities(m?.[1] ?? m?.[2] ?? m?.[3] ?? '') || null
}

function findMeta(html: string, key: string, value: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const tag of tags) {
    if ((attr(tag, key) ?? '').toLowerCase() === value.toLowerCase()) return attr(tag, 'content')
  }
  return null
}

function findCanonical(html: string) {
  const links = html.match(/<link\b[^>]*>/gi) ?? []
  for (const tag of links) {
    if ((attr(tag, 'rel') ?? '').toLowerCase().split(/\s+/).includes('canonical')) return attr(tag, 'href')
  }
  return null
}

function isPrivateAddress(address: string) {
  if (address.startsWith('::ffff:')) return isPrivateAddress(address.slice(7))
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number)
    return a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
  }
  if (net.isIPv6(address)) {
    const v = address.toLowerCase()
    return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') ||
      v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb')
  }
  return true
}

async function assertPublicUrl(url: URL) {
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('http / https のURLを入力してください。')
  if (url.username || url.password) throw new Error('認証情報を含むURLは利用できません。')
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('公開サイトのURLを入力してください。')
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) throw new Error('公開サイトのURLを入力してください。')
    return
  }

  // Cloudflare Workers の node:dns は lookup() 未実装のため、A/AAAA を明示的に解決する。
  const [v4, v6] = await Promise.allSettled([dns.resolve4(host), dns.resolve6(host)])
  const addresses = [
    ...(v4.status === 'fulfilled' ? v4.value : []),
    ...(v6.status === 'fulfilled' ? v6.value : []),
  ]
  if (!addresses.length || addresses.some(isPrivateAddress)) throw new Error('公開サイトのURLを入力してください。')
}

async function fetchHtml(start: URL) {
  let current = start
  for (let i = 0; i < 4; i++) {
    await assertPublicUrl(current)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let response: Response
    try {
      response = await fetch(current, {
        redirect: 'manual',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ECplayersDiagnosis/0.1; +https://ecplayers.com)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'ja,en;q=0.8',
        },
      })
    } finally {
      clearTimeout(timer)
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      if (!location) throw new Error('リダイレクト先を取得できませんでした。')
      current = new URL(location, current)
      continue
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('サイト側で自動取得が制限されています。別の公開ページURLでお試しください。')
      throw new Error(`ページを取得できませんでした（HTTP ${response.status}）。`)
    }
    const type = response.headers.get('content-type') ?? ''
    if (!type.toLowerCase().includes('text/html') && !type.toLowerCase().includes('application/xhtml')) throw new Error('HTMLページのURLを入力してください。')
    const declared = Number(response.headers.get('content-length') ?? 0)
    if (declared > MAX_BYTES) throw new Error('ページ容量が大きすぎるため簡易診断できませんでした。')
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) throw new Error('ページ容量が大きすぎるため簡易診断できませんでした。')
    return { html: new TextDecoder().decode(buffer), finalUrl: current.toString() }
  }
  throw new Error('リダイレクト回数が多すぎます。')
}

function analyze(html: string, finalUrl: string) {
  const title = decodeEntities(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '') || null
  const description = findMeta(html, 'name', 'description')
  const ogSiteName = findMeta(html, 'property', 'og:site_name')
  const canonical = findCanonical(html)
  const h1Count = (html.match(/<h1\b/gi) ?? []).length
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? []
  const imageCount = imageTags.length
  const altCount = imageTags.filter(tag => (attr(tag, 'alt') ?? '').trim().length > 0).length
  const altRate = imageCount ? Math.round((altCount / imageCount) * 100) : 0
  const hasViewport = !!findMeta(html, 'name', 'viewport')
  const jsonLd = (html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? []).join(' ')
  const hasProductSchema = /["']@type["']\s*:\s*["']Product["']/i.test(jsonLd) || /schema\.org\/Product/i.test(html)
  const hasStructuredData = jsonLd.length > 0
  const stripped = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
  const text = decodeEntities(stripped)
  const textLength = text.length
  const priceSignal = /(?:¥|￥|\d[\d,]*\s*円|税込|価格)/i.test(text)
  const shippingSignal = /(送料|配送|お届け|発送)/i.test(text)
  const returnsSignal = /(返品|返金|交換)/i.test(text)
  const legalSignal = /(特定商取引|会社概要|運営会社|プライバシー|利用規約)/i.test(text)
  const reviewSignal = /(レビュー|口コミ|評価|お客様の声)/i.test(text)
  const ctaCount = (text.match(/(カートに入|購入する|今すぐ購入|注文する|申し込|お問い合わせ|見積)/g) ?? []).length
  const hasInteractive = /<(button|form)\b/i.test(html) || /type=["'](?:submit|button)["']/i.test(html)
  const trustCount = [shippingSignal, returnsSignal, legalSignal, reviewSignal].filter(Boolean).length

  const issues: Issue[] = []
  let seo = 100
  if (!title) { seo -= 28; issues.push({ priority: 'high', title: 'ページタイトルが確認できません', detail: '検索結果でページ内容を伝えるtitleタグが見つかりませんでした。', impact: '検索流入の入口になる基本設定です。' }) }
  else if (title.length < 8 || title.length > 65) { seo -= 9; issues.push({ priority: 'medium', title: 'ページタイトルの長さを見直す余地があります', detail: `現在のtitleは${title.length}文字です。検索意図と主力キーワードが伝わる長さ・内容か確認してください。`, impact: '検索結果での理解・クリックに影響します。' }) }
  if (!description) { seo -= 18; issues.push({ priority: 'medium', title: 'meta descriptionを設定する', detail: '検索結果でページの価値を説明するdescriptionが確認できませんでした。', impact: '検索結果からのクリック率改善余地があります。' }) }
  if (h1Count === 0) { seo -= 18; issues.push({ priority: 'high', title: 'H1見出しを明確にする', detail: 'ページの主題を示すH1が見つかりませんでした。', impact: 'ユーザーと検索エンジンの双方がページ主題を理解しやすくなります。' }) }
  else if (h1Count > 2) { seo -= 5; issues.push({ priority: 'low', title: 'H1の使い方を確認する', detail: `H1が${h1Count}個あります。意図した見出し構造か確認してください。`, impact: '情報構造を整理できます。' }) }
  if (!canonical) { seo -= 8; issues.push({ priority: 'low', title: 'canonical設定を確認する', detail: 'canonical URLが確認できませんでした。類似URLが発生するECでは正規URLの明示が有効です。', impact: '重複URLの整理に役立ちます。' }) }
  if (textLength < 450) { seo -= 17; issues.push({ priority: 'high', title: 'HTMLテキストの情報量を増やす', detail: `取得できた本文テキストは約${textLength.toLocaleString()}文字でした。画像だけでなく、商品・カテゴリの説明をHTMLテキストでも伝える余地があります。`, impact: '検索流入と購入前理解の両方に効く可能性があります。' }) }
  if (!hasStructuredData) seo -= 7

  let product = 100
  if (!priceSignal) { product -= 17; issues.push({ priority: 'medium', title: '価格情報の見え方を確認する', detail: '取得したページ本文から明確な価格表現を確認できませんでした。商品ページの場合は価格の視認性を確認してください。', impact: '購入判断までの迷いを減らせます。' }) }
  if (imageCount < 3) { product -= 13; issues.push({ priority: 'medium', title: '商品・利用イメージを増やす', detail: `画像は${imageCount}点検出されました。商品ページなら、特徴・利用シーン・サイズ感などを十分に伝えられているか確認してください。`, impact: '購入前の不安解消につながります。' }) }
  if (imageCount > 0 && altRate < 60) { product -= 14; issues.push({ priority: 'medium', title: '画像altを整備する', detail: `altが入っている画像は約${altRate}%でした。意味のある商品画像には内容を表すaltを設定してください。`, impact: '画像検索・アクセシビリティ・内容理解の改善余地があります。' }) }
  if (!hasProductSchema) { product -= 14; issues.push({ priority: 'low', title: 'Product構造化データを確認する', detail: 'Product構造化データは確認できませんでした。商品詳細ページであれば価格・在庫・レビュー等のマークアップを検討できます。', impact: '検索結果で商品情報を正しく伝える土台になります。' }) }
  if (!shippingSignal) product -= 10
  if (!reviewSignal) product -= 9
  if (textLength < 800) product -= 8

  let conversion = 100
  if (ctaCount === 0) { conversion -= 28; issues.push({ priority: 'high', title: '次の行動を明確にする', detail: '「購入」「カート」「問い合わせ」などの主要CTAを本文から確認できませんでした。ファーストビューから次の行動が明確か確認してください。', impact: '訪問者を購入・問い合わせへ進める最重要ポイントです。' }) }
  if (!hasInteractive) conversion -= 12
  if (!hasViewport) { conversion -= 18; issues.push({ priority: 'high', title: 'モバイル表示設定を確認する', detail: 'viewport設定を確認できませんでした。スマートフォンでの表示・操作性を確認してください。', impact: 'モバイル流入の離脱に直結しやすい項目です。' }) }
  if (!shippingSignal) { conversion -= 12; issues.push({ priority: 'medium', title: '配送条件を購入前に伝える', detail: '送料・配送・お届けに関する文言を確認できませんでした。購入前に到着時期や送料が分かる導線を確認してください。', impact: 'カート直前の不安を減らせます。' }) }
  if (!returnsSignal) conversion -= 9
  if (!legalSignal) conversion -= 11
  if (trustCount < 2) { conversion -= 8; issues.push({ priority: 'medium', title: '安心材料を増やす', detail: '配送、返品、運営会社、レビューなどの安心材料が少ない可能性があります。', impact: '初回訪問者の購入心理を後押しします。' }) }

  seo = clamp(seo); product = clamp(product); conversion = clamp(conversion)
  const score = clamp(seo * .35 + product * .35 + conversion * .30)
  const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
  issues.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  if (!issues.length) issues.push({ priority: 'low', title: '公開ページの基本項目は良好です', detail: '今回確認した基本項目では大きな欠落は見つかりませんでした。次はGA4・広告・売上データからボトルネックを特定する段階です。', impact: 'データ接続で改善優先順位の精度を上げられます。' })

  const hostname = new URL(finalUrl).hostname.replace(/^www\./, '')
  const siteName = ogSiteName || title?.split(/[|｜–—-]/)[0]?.trim() || hostname
  return {
    finalUrl,
    siteName,
    score,
    categories: [
      { key: 'seo', label: '検索流入', score: seo, summary: seo >= 80 ? '検索流入の基礎は比較的整っています。' : 'SEOの基礎設定に改善余地があります。' },
      { key: 'product', label: '商品ページ', score: product, summary: product >= 80 ? '商品理解に必要な情報は比較的充実しています。' : '商品情報・安心材料を補強できる余地があります。' },
      { key: 'conversion', label: '購入導線', score: conversion, summary: conversion >= 80 ? '購入・問い合わせへの導線は比較的明確です。' : 'CTAや購入前の不安解消に改善余地があります。' },
    ],
    issues,
    signals: { title, description, textLength, h1Count, imageCount, altRate, hasProductSchema, hasCanonical: !!canonical },
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const raw = typeof body?.url === 'string' ? body.url.trim() : ''
    if (!raw) return NextResponse.json({ error: '診断したいURLを入力してください。' }, { status: 400 })
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    let url: URL
    try { url = new URL(normalized) } catch { return NextResponse.json({ error: '正しいURLを入力してください。' }, { status: 400 }) }
    const { html, finalUrl } = await fetchHtml(url)
    return NextResponse.json(analyze(html, finalUrl), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'ページの取得に時間がかかりすぎました。別のページURLでお試しください。'
      : error instanceof Error ? error.message : '診断中にエラーが発生しました。'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
