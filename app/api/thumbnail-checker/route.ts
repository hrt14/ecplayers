import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const dynamic = 'force-dynamic'

const MODEL = '@cf/meta/llama-3.2-11b-vision-instruct'
const MAX_IMAGE_BYTES = 5_000_000

type Platform = 'rakuten' | 'amazon' | 'yahoo'
type AiBinding = {
  run: (model: string, input: Record<string, unknown>) => Promise<unknown>
}

type Improvement = {
  title: string
  current: string
  evidence: string
  action: string
  reason: string
  impactScore: number
}

type AnalysisResult = {
  summary: string
  strengths: string[]
  improvements: Improvement[]
  generationPrompt: string
}

const labels: Record<Platform, string> = {
  rakuten: '楽天市場',
  amazon: 'Amazon',
  yahoo: 'Yahoo!ショッピング',
}

const schema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    improvements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          current: { type: 'string' },
          evidence: { type: 'string' },
          action: { type: 'string' },
          reason: { type: 'string' },
          impactScore: { type: 'integer', minimum: 1, maximum: 5 },
        },
        required: ['title', 'current', 'evidence', 'action', 'reason', 'impactScore'],
      },
    },
    generationPrompt: { type: 'string' },
  },
  required: ['summary', 'strengths', 'improvements', 'generationPrompt'],
}

function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4)
}

function isSupportedImage(dataUrl: string) {
  return /^data:image\/(?:png|jpeg|webp);base64,/i.test(dataUrl)
}

function stripCodeFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
}

function findJsonText(value: string) {
  const cleaned = stripCodeFence(value)
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) return cleaned
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) return cleaned.slice(start, end + 1)
  return cleaned
}

function extractResponseText(result: unknown): string | null {
  if (typeof result === 'string') return result
  if (!result || typeof result !== 'object') return null
  const value = result as Record<string, unknown>
  for (const key of ['response', 'result', 'text', 'output_text']) {
    if (typeof value[key] === 'string') return value[key] as string
  }
  return null
}

function asResult(value: unknown): AnalysisResult | null {
  if (!value || typeof value !== 'object') return null
  const object = value as Record<string, unknown>
  if (typeof object.summary !== 'string' || typeof object.generationPrompt !== 'string') return null
  if (!Array.isArray(object.strengths) || !Array.isArray(object.improvements)) return null

  const strengths = object.strengths.filter((item): item is string => typeof item === 'string').slice(0, 3)
  const improvements = object.improvements
    .filter(item => item && typeof item === 'object')
    .map(item => {
      const row = item as Record<string, unknown>
      if (!['title', 'current', 'evidence', 'action', 'reason'].every(key => typeof row[key] === 'string')) return null
      return {
        title: String(row.title),
        current: String(row.current),
        evidence: String(row.evidence),
        action: String(row.action),
        reason: String(row.reason),
        impactScore: Math.max(1, Math.min(5, Math.round(Number(row.impactScore) || 3))),
      }
    })
    .filter((item): item is Improvement => !!item)
    .slice(0, 5)

  if (!improvements.length) return null
  return {
    summary: object.summary.slice(0, 500),
    strengths,
    improvements,
    generationPrompt: object.generationPrompt.slice(0, 3000),
  }
}

function promptFor(platform: Platform, keyword: string) {
  const marketplaceGuardrail = platform === 'amazon'
    ? 'Amazonの検索結果ではMAIN画像が表示されます。MAIN画像への文字・ロゴ・枠線・色ブロック・透かし・販促グラフィックの追加は提案しないでください。白背景と商品そのものの見せ方の範囲で改善してください。'
    : '画像規約はカテゴリや時期で変わるため、規約違反になり得る断定的な装飾提案は避けてください。必要なら「最新のモール画像ガイドラインを確認」と添えてください。'

  return `あなたはEC検索一覧のサムネイル改善アナリストです。
この画像は「${labels[platform]}」で「${keyword}」を検索した結果画面です。
赤い円と「自社商品」ラベルが付いている商品だけが分析対象の自社商品です。周囲の商品は比較対象です。

目的:
検索結果一覧で実際に並んだ状態を視覚的に比較し、自社サムネイルの改善点を、見えている証拠だけから優先順に5件以内で出してください。

必須ルール:
- 画像から確認できないCTR、CVR、売上、検索順位への効果は断定しない。
- 価格、レビュー数、商品名などは画像から明瞭に読める場合だけ根拠にしてよい。
- 商品占有率、余白、背景、構図、角度、色のコントラスト、一覧での識別性、セット内容の理解しやすさ、サイズ感、人物・利用シーン、文字量など、画像上で観察できる差を中心に見る。
- 「競合がそうしているから」だけで提案せず、自社が一覧で識別されやすくなる具体的な変更にする。
- 競合の商標・画像表現をコピーする提案はしない。
- ${marketplaceGuardrail}
- generationPrompt は、既存の商品そのもの・ブランド要素を維持しながら改善版サムネイルを制作するための日本語の具体的な指示文にする。競合画像の模倣は指示しない。
- JSON以外は出力しない。

出力:
summary: 全体所見を120文字程度。
strengths: 現状の良い点を0〜3件。
improvements: 優先順で最大5件。各件に title / current / evidence / action / reason / impactScore(1〜5) を入れる。
generationPrompt: 制作担当または画像編集AIに渡せる改善指示文。`
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { platform?: Platform; keyword?: string; image?: string } | null
    const platform = body?.platform
    const keyword = body?.keyword?.trim() ?? ''
    const image = body?.image ?? ''

    if (!platform || !labels[platform]) return NextResponse.json({ error: 'モールを選択してください。' }, { status: 400 })
    if (!keyword || keyword.length > 120) return NextResponse.json({ error: '検索キーワードを入力してください。' }, { status: 400 })
    if (!image || !isSupportedImage(image)) return NextResponse.json({ error: '対応するスクリーンショットを選択してください。' }, { status: 400 })
    if (dataUrlBytes(image) > MAX_IMAGE_BYTES) return NextResponse.json({ error: '画像容量が大きすぎます。5MB以下にしてください。' }, { status: 413 })

    const context = await getCloudflareContext({ async: true })
    const ai = (context.env as unknown as { AI?: AiBinding }).AI
    if (!ai?.run) return NextResponse.json({ error: 'AI分析機能を開始できませんでした。' }, { status: 503 })

    const raw = await ai.run(MODEL, {
      messages: [
        { role: 'system', content: 'EC検索結果の画像比較を行い、観察できる事実と提案を明確に分けてください。' },
        { role: 'user', content: promptFor(platform, keyword) },
      ],
      image,
      guided_json: schema,
      max_tokens: 1900,
      temperature: 0.15,
    })

    let parsed = asResult(raw)
    if (!parsed) {
      const text = extractResponseText(raw)
      if (text) {
        try { parsed = asResult(JSON.parse(findJsonText(text))) } catch { parsed = null }
      }
    }
    if (!parsed) return NextResponse.json({ error: '比較結果を整形できませんでした。もう一度お試しください。' }, { status: 502 })

    return NextResponse.json(parsed, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('thumbnail-checker error', error)
    return NextResponse.json({ error: 'AI比較中にエラーが発生しました。もう一度お試しください。' }, { status: 500 })
  }
}
