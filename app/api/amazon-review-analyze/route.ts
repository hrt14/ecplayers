import { NextResponse } from 'next/server'

const ALLOWED_MODELS = new Set(['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'])
const MAX_PROMPT_LENGTH = 300_000

type AnalyzeRequest = {
  apiKey?: string
  model?: string
  prompt?: string
}

type OpenAIContent = {
  type?: string
  text?: string
}

type OpenAIOutputItem = {
  type?: string
  content?: OpenAIContent[]
}

type OpenAIResponse = {
  output_text?: string
  output?: OpenAIOutputItem[]
  error?: { message?: string }
  usage?: unknown
}

function extractOutputText(data: OpenAIResponse) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim()
  }

  const parts: string[] = []
  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        parts.push(content.text)
      }
    }
  }
  return parts.join('\n\n').trim()
}

export async function POST(request: Request) {
  let body: AnalyzeRequest
  try {
    body = (await request.json()) as AnalyzeRequest
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が正しくありません。' }, { status: 400 })
  }

  const apiKey = body.apiKey?.trim() ?? ''
  const model = body.model?.trim() ?? ''
  const prompt = body.prompt?.trim() ?? ''

  if (!apiKey || !model || !prompt) {
    return NextResponse.json({ error: 'APIキー、モデル、プロンプトが必要です。' }, { status: 400 })
  }
  if (!ALLOWED_MODELS.has(model)) {
    return NextResponse.json({ error: '選択できないモデルです。' }, { status: 400 })
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: '入力が長すぎます。レビューや商品ページ本文を分けて分析してください。' }, { status: 413 })
  }

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    })

    const data = (await openAIResponse.json()) as OpenAIResponse

    if (!openAIResponse.ok) {
      const message = data.error?.message || `OpenAI APIエラー (${openAIResponse.status})`
      return NextResponse.json({ error: message }, { status: openAIResponse.status })
    }

    const text = extractOutputText(data)
    if (!text) {
      return NextResponse.json({ error: 'AIからテキスト結果を取得できませんでした。' }, { status: 502 })
    }

    return NextResponse.json({ text, usage: data.usage })
  } catch {
    return NextResponse.json({ error: 'OpenAI APIへの接続に失敗しました。' }, { status: 502 })
  }
}
