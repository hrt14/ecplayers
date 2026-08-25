import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 4_000_000
const TIMEOUT_MS = 12_000

type Status = 'good' | 'warn' | 'missing'

type Check = {
  key: string
  label: string
  weight: number
  status: Status
  summary: string
  evidence: string | null
  suggestion: string
}

type CheckDefinition = {
  key: string
  label: string
  weight: number
  strong: RegExp[]
  weak: RegExp[]
  goodSummary: string
  warnSummary: string
  missingSummary: string
  suggestion: string
}

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

function isRakutenUrl(url: URL) {
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  return host === 'rakuten.co.jp' || host.endsWith('.rakuten.co.jp')
}

function assertRakutenUrl(url: URL) {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('http / https のURLを入力してください。')
  if (!isRakutenUrl(url)) throw new Error('楽天市場の商品URLを入力してください。')
  if (url.username || url.password) throw new Error('認証情報を含むURLは利用できません。')
}

function decoderFor(contentType: string) {
  const charset = contentType.match(/charset\s*=\s*([^;]+)/i)?.[1]?.trim().toLowerCase() ?? ''
  if (/(shift[_-]?jis|sjis|windows-31j|ms932)/i.test(charset)) return new TextDecoder('shift_jis')
  return new TextDecoder('utf-8')
}

async function fetchHtml(start: URL) {
  let current = start
  for (let i = 0; i < 4; i++) {
    assertRakutenUrl(current)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let response: Response
    try {
      response = await fetch(current, {
        redirect: 'manual',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.7',
        },
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new Error('ページ取得がタイムアウトしました。もう一度お試しください。')
      throw error
    } finally {
      clearTimeout(timer)
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      if (!location) throw new Error('リダイレクト先を取得できませんでした。')
      const next = new URL(location, current)
      assertRakutenUrl(next)
      current = next
      continue
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 429) {
        throw new Error('楽天側でページの自動取得が制限されています。少し時間を置くか、別の商品URLでお試しください。')
      }
      throw new Error(`ページを取得できませんでした（HTTP ${response.status}）。`)
    }

    const type = response.headers.get('content-type') ?? ''
    if (!type.toLowerCase().includes('text/html') && !type.toLowerCase().includes('application/xhtml')) {
      throw new Error('楽天市場の商品HTMLページを入力してください。')
    }

    const declared = Number(response.headers.get('content-length') ?? 0)
    if (declared > MAX_BYTES) throw new Error('ページ容量が大きすぎるため簡易チェックできませんでした。')
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_BYTES) throw new Error('ページ容量が大きすぎるため簡易チェックできませんでした。')
    return { html: decoderFor(type).decode(buffer), finalUrl: current.toString() }
  }
  throw new Error('リダイレクト回数が多すぎます。')
}

function stripHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<!--([\s\S]*?)-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const flags = pattern.flags.replace('g', '')
    const m = new RegExp(pattern.source, flags).exec(text)
    if (!m || m.index == null) continue
    const start = Math.max(0, m.index - 42)
    const end = Math.min(text.length, m.index + m[0].length + 70)
    return text.slice(start, end).trim()
  }
  return null
}

const definitions: CheckDefinition[] = [
  {
    key: 'target', label: '誰向けの商品か', weight: 10,
    strong: [/こんな(?:方|人)に(?:おすすめ)?/i, /おすすめ(?:したい)?(?:方|人)/i, /こんなお悩み/i],
    weak: [/おすすめ/i, /対象/i, /向け/i],
    goodSummary: '購入者像を示す表現が見つかりました。',
    warnSummary: '対象を示す語はありますが、具体的な購入者像は弱い可能性があります。',
    missingSummary: '「誰のための商品か」を明示する訴求を確認できませんでした。',
    suggestion: '「こんな方におすすめ」を3〜5項目で追加し、自分向けの商品だと一目で分かるようにする。',
  },
  {
    key: 'problem', label: '悩み・課題の提示', weight: 10,
    strong: [/こんな(?:お)?悩み/i, /お困りではありませんか/i, /こんなことで困/i, /こんな経験ありませんか/i],
    weak: [/悩み/i, /困(?:る|った|り)/i, /不満/i, /面倒/i],
    goodSummary: '購入前の悩み・課題を言語化する表現が見つかりました。',
    warnSummary: '悩み系の語はありますが、共感を作る導入としては弱い可能性があります。',
    missingSummary: '商品が解決する悩み・課題の提示を確認できませんでした。',
    suggestion: '商品の説明より前に、購入者が抱えている困りごとを具体的な言葉で提示する。',
  },
  {
    key: 'benefit', label: '購入後のベネフィット', weight: 15,
    strong: [/メリット/i, /ベネフィット/i, /快適/i, /時短/i, /手間.{0,8}(?:減|省)/i, /ラク(?:に|になる)/i, /楽(?:に|になる)/i],
    weak: [/便利/i, /簡単/i, /使いやす/i, /うれしい/i],
    goodSummary: '購入後に得られる価値・変化を示す表現が見つかりました。',
    warnSummary: '便利さは伝わりますが、購入後の変化まで強く言えていない可能性があります。',
    missingSummary: '機能ではなく「買うとどう良くなるか」の訴求を確認できませんでした。',
    suggestion: '機能説明を「だから何が楽になる・早くなる・安心になる」の形へ変換して冒頭に置く。',
  },
  {
    key: 'features', label: '特徴・こだわり', weight: 10,
    strong: [/商品の特徴/i, /特長/i, /こだわり/i, /ポイント\s*[0-9０-９一二三]/i, /選ばれる理由/i],
    weak: [/特徴/i, /機能/i, /性能/i],
    goodSummary: '商品の特徴を整理して見せる表現が見つかりました。',
    warnSummary: '特徴はありますが、整理された見せ方になっていない可能性があります。',
    missingSummary: '商品の主要な特徴をまとめる訴求を確認できませんでした。',
    suggestion: '主要特徴を3〜5点に絞り、各特徴を「見出し＋1メリット」で読める構成にする。',
  },
  {
    key: 'difference', label: '他商品との違い', weight: 10,
    strong: [/他社/i, /従来(?:品|モデル)/i, /比較/i, /違い/i, /当社比/i, /選ばれる理由/i],
    weak: [/独自/i, /オリジナル/i, /専用設計/i],
    goodSummary: '他商品・従来品との違いを示す表現が見つかりました。',
    warnSummary: '独自性の主張はありますが、比較軸が具体的でない可能性があります。',
    missingSummary: '「なぜこの商品を選ぶのか」を比較で伝える要素を確認できませんでした。',
    suggestion: '価格・仕様・使いやすさ等、購入者が迷う3〜5軸で比較表または違いの説明を追加する。',
  },
  {
    key: 'usage', label: '使用シーン・使い方', weight: 10,
    strong: [/使用シーン/i, /利用シーン/i, /使い方/i, /使用方法/i, /こんな(?:時|とき)に/i],
    weak: [/使用/i, /利用/i, /シーン/i],
    goodSummary: '使う場面・使い方をイメージさせる表現が見つかりました。',
    warnSummary: '使用に触れていますが、具体的な生活シーンが弱い可能性があります。',
    missingSummary: '購入後の使用場面や使い方を伝える要素を確認できませんでした。',
    suggestion: '実際の利用シーンを2〜4パターン追加し、「自分が使う姿」を想像できるようにする。',
  },
  {
    key: 'specs', label: 'サイズ・素材・仕様', weight: 10,
    strong: [/サイズ/i, /寸法/i, /素材/i, /材質/i, /重量/i, /容量/i, /スペック/i, /仕様/i],
    weak: [/カラー/i, /色/i, /型番/i],
    goodSummary: 'サイズ・素材・仕様に関する情報が見つかりました。',
    warnSummary: '一部の仕様情報はありますが、購入判断に十分か確認が必要です。',
    missingSummary: 'サイズ・素材・仕様の情報を確認できませんでした。',
    suggestion: 'サイズ、重量、素材、容量、対応範囲など「買ってから困る情報」を表形式でまとめる。',
  },
  {
    key: 'proof', label: '根拠・実績・第三者評価', weight: 10,
    strong: [/試験/i, /検査/i, /実証/i, /特許/i, /認証/i, /受賞/i, /ランキング/i, /累計.{0,12}(?:個|本|台|枚|人|件)/i, /販売実績/i],
    weak: [/実績/i, /No\.?\s*1/i, /ナンバーワン/i],
    goodSummary: '購入理由を補強する根拠・実績系の表現が見つかりました。',
    warnSummary: '実績の主張はあります。出典・条件・期間が明確か確認してください。',
    missingSummary: '品質や人気を裏づける根拠・実績を確認できませんでした。',
    suggestion: '実在する試験結果、受賞、販売実績などがある場合だけ、出典・期間・条件とセットで追加する。',
  },
  {
    key: 'reviews', label: 'レビュー・購入者の声', weight: 8,
    strong: [/お客様の声/i, /購入者の声/i, /口コミ/i, /レビュー/i],
    weak: [/評価/i],
    goodSummary: 'レビュー・購入者評価に関する表現が見つかりました。',
    warnSummary: '評価には触れていますが、購入者の具体的な声は弱い可能性があります。',
    missingSummary: '購入者の声・レビューを訴求に活用する要素を確認できませんでした。',
    suggestion: '楽天上のレビューを確認し、頻出する購入理由や不安解消ポイントをLP構成へ反映する。',
  },
  {
    key: 'anxiety', label: '不安解消・FAQ・保証', weight: 7,
    strong: [/よくある質問/i, /FAQ/i, /Q\s*&\s*A/i, /保証/i, /返品/i, /交換/i, /アフターサポート/i],
    weak: [/安心/i, /サポート/i],
    goodSummary: '購入前の不安を解消する情報が見つかりました。',
    warnSummary: '安心系の表現はありますが、具体的な疑問への回答は弱い可能性があります。',
    missingSummary: '購入前の疑問・不安を解消するFAQや保証情報を確認できませんでした。',
    suggestion: 'レビューや問い合わせで実際に出る質問を5つ程度選び、購入直前のFAQとして追加する。',
  },
]

function analyze(html: string, finalUrl: string) {
  const rawTitle = decodeEntities(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const pageTitle = rawTitle.replace(/\s*[|｜]\s*楽天市場.*$/i, '').trim() || '楽天市場の商品ページ'
  const text = stripHtml(html)
  const imageCount = (html.match(/<img\b[^>]*>/gi) ?? []).length

  const checks: Check[] = definitions.map(def => {
    const strongEvidence = firstMatch(text, def.strong)
    const weakEvidence = strongEvidence ? null : firstMatch(text, def.weak)
    const status: Status = strongEvidence ? 'good' : weakEvidence ? 'warn' : 'missing'
    return {
      key: def.key,
      label: def.label,
      weight: def.weight,
      status,
      summary: status === 'good' ? def.goodSummary : status === 'warn' ? def.warnSummary : def.missingSummary,
      evidence: strongEvidence ?? weakEvidence,
      suggestion: def.suggestion,
    }
  })

  const score = Math.round(checks.reduce((sum, item) => {
    if (item.status === 'good') return sum + item.weight
    if (item.status === 'warn') return sum + item.weight * 0.55
    return sum
  }, 0))

  const priorities = [...checks]
    .filter(item => item.status !== 'good')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'missing' ? -1 : 1
      return b.weight - a.weight
    })
    .slice(0, 3)

  if (priorities.length < 3) {
    for (const item of [...checks].sort((a, b) => b.weight - a.weight)) {
      if (!priorities.some(p => p.key === item.key)) priorities.push(item)
      if (priorities.length === 3) break
    }
  }

  const summary = score >= 85
    ? '主要なLP要素はかなり揃っています。次は不足項目より、訴求順・画像・実データでのCVR検証が中心です。'
    : score >= 70
      ? '基本要素は揃っていますが、購入理由を強くする要素にまだ改善余地があります。'
      : score >= 50
        ? '商品の情報はありますが、「なぜ自分がこれを買うのか」を決める材料が不足しています。'
        : '商品説明より先に、ターゲット・悩み・ベネフィット・比較・安心材料の土台から整える余地があります。'

  const manualChecks = [
    {
      title: '第1商品画像のテキスト・装飾占有率',
      detail: '楽天市場では第1商品画像のテキストや装飾の占有率を20%以内にするルールがあります。画像そのものの判定はこの簡易版では行わないため、RMSで確認してください。',
      sourceLabel: 'RMS Service Square（楽天公式）',
      sourceUrl: 'https://service.rms.rakuten.co.jp/column/detail/123',
    },
    {
      title: '商品と無関係なキーワードの記載',
      detail: '商品名・キャッチコピーへの商品と直接関係ないワード、商品説明文への検索目的の無関係キーワード羅列は禁止事項です。文脈判断が必要なため自動判定せず、最終確認してください。',
      sourceLabel: '楽天市場 店舗運営ガイドライン',
      sourceUrl: 'https://www.rakuten.co.jp/ec/open/attention/pdf/disclosure/03_tempounei_guideline.pdf',
    },
  ]

  const priorityText = priorities.map((item, i) => `${i + 1}. ${item.label}：${item.suggestion}`).join('\n')
  const checkText = checks.map(item => `- ${item.label}: ${item.status === 'good' ? '確認できた' : item.status === 'warn' ? '弱い可能性' : '不足'} / ${item.summary}`).join('\n')
  const excerpt = text.slice(0, 5200)

  const prompt = `あなたは楽天市場の商品ページ改善に詳しいECコンサルタントです。\n以下の商品ページを、事実を捏造せずに改善してください。\n\n【商品ページURL】\n${finalUrl}\n\n【ページタイトル】\n${pageTitle}\n\n【簡易LPスコア】\n${score}/100\n\n【最優先で改善したい項目】\n${priorityText}\n\n【LPチェック結果】\n${checkText}\n\n【依頼】\n1. 現在のLPで弱い点を重要度順に整理\n2. LP全体の推奨構成を上から順に作成\n3. 追加すべき各セクションの見出し案と本文案を作成\n4. 各セクションで必要な画像・図・比較表の案を提示\n5. 最後に「今すぐ直す3点」を出す\n\n【厳守事項】\n- 下記のページ情報にない性能、効果、受賞、販売実績、口コミ、保証内容などを創作しない\n- 不明な事実は「要確認」と明記する\n- 医薬品的な効果効能など、根拠のない強い表現を作らない\n- 楽天市場のガイドラインに抵触しうる表現は避ける\n- 機能説明だけで終わらず、購入者にとってのメリットへ変換する\n\n【取得できた公開ページテキスト抜粋】\n${excerpt}`

  return {
    finalUrl,
    pageTitle,
    score,
    summary,
    checks,
    priorities,
    manualChecks,
    prompt,
    signals: { textLength: text.length, imageCount },
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { url?: unknown } | null
    if (!body || typeof body.url !== 'string' || !body.url.trim()) {
      return NextResponse.json({ error: '楽天市場の商品URLを入力してください。' }, { status: 400 })
    }

    let url: URL
    try {
      url = new URL(body.url.trim().match(/^https?:\/\//i) ? body.url.trim() : `https://${body.url.trim()}`)
    } catch {
      return NextResponse.json({ error: '正しいURLを入力してください。' }, { status: 400 })
    }

    assertRakutenUrl(url)
    const { html, finalUrl } = await fetchHtml(url)
    return NextResponse.json(analyze(html, finalUrl), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'チェックできませんでした。'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
