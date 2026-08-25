'use client'

import { ChangeEvent, MouseEvent, useMemo, useRef, useState } from 'react'
import styles from './ThumbnailChecker.module.css'

type Platform = 'rakuten' | 'amazon' | 'yahoo'
type Point = { x: number; y: number }
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

const platforms: { id: Platform; label: string; hint: string }[] = [
  { id: 'rakuten', label: '楽天市場', hint: 'ビッグワードの検索結果' },
  { id: 'amazon', label: 'Amazon', hint: '検索結果のメイン画像' },
  { id: 'yahoo', label: 'Yahoo!', hint: 'Yahoo!ショッピング検索結果' },
]

function dataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] || ''
  return Math.ceil((base64.length * 3) / 4)
}

function annotateImage(source: string, point: Point): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const maxSide = 1600
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
      const width = Math.max(1, Math.round(image.naturalWidth * scale))
      const height = Math.max(1, Math.round(image.naturalHeight * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('画像処理を開始できませんでした。'))

      ctx.drawImage(image, 0, 0, width, height)
      const x = point.x * width
      const y = point.y * height
      const radius = Math.max(28, Math.min(70, Math.min(width, height) * 0.045))
      const line = Math.max(5, Math.round(width / 260))

      ctx.beginPath()
      ctx.arc(x, y, radius + line, 0, Math.PI * 2)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = line + 6
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = '#ff2a2a'
      ctx.lineWidth = line
      ctx.stroke()

      const fontSize = Math.max(22, Math.min(42, Math.round(width / 32)))
      ctx.font = `700 ${fontSize}px sans-serif`
      const label = '自社商品'
      const padX = Math.round(fontSize * 0.55)
      const padY = Math.round(fontSize * 0.34)
      const textWidth = ctx.measureText(label).width
      const boxW = textWidth + padX * 2
      const boxH = fontSize + padY * 2
      let labelX = x + radius + 12
      let labelY = y - boxH / 2
      if (labelX + boxW > width - 8) labelX = x - radius - boxW - 12
      labelX = Math.max(8, labelX)
      labelY = Math.max(8, Math.min(height - boxH - 8, labelY))
      ctx.fillStyle = '#ff2a2a'
      ctx.fillRect(labelX, labelY, boxW, boxH)
      ctx.fillStyle = '#ffffff'
      ctx.textBaseline = 'top'
      ctx.fillText(label, labelX + padX, labelY + padY)

      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    image.onerror = () => reject(new Error('画像を読み込めませんでした。'))
    image.src = source
  })
}

export default function ThumbnailChecker() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [platform, setPlatform] = useState<Platform>('rakuten')
  const [keyword, setKeyword] = useState('')
  const [imageData, setImageData] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [point, setPoint] = useState<Point | null>(null)
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedPlatform = useMemo(() => platforms.find(item => item.id === platform)!, [platform])
  const ready = !!keyword.trim() && !!annotatedImage && !loading

  async function loadFile(file: File | undefined) {
    setError('')
    setResult(null)
    setPoint(null)
    setAnnotatedImage(null)
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('PNG・JPEG・WebPのスクリーンショットを選んでください。')
      return
    }
    if (file.size > 8_000_000) {
      setError('画像は8MB以下にしてください。')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result || '')
      setImageData(value)
      setFileName(file.name)
    }
    reader.onerror = () => setError('画像を読み込めませんでした。')
    reader.readAsDataURL(file)
  }

  async function chooseOwnProduct(event: MouseEvent<HTMLImageElement>) {
    if (!imageData) return
    const rect = event.currentTarget.getBoundingClientRect()
    const nextPoint = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    }
    setPoint(nextPoint)
    setResult(null)
    setError('')
    try {
      setAnnotatedImage(await annotateImage(imageData, nextPoint))
    } catch (e) {
      setError(e instanceof Error ? e.message : '自社商品の位置を指定できませんでした。')
    }
  }

  async function analyze() {
    if (!ready || !annotatedImage) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      if (dataUrlBytes(annotatedImage) > 5_000_000) throw new Error('画像容量が大きすぎます。もう少し小さいスクリーンショットでお試しください。')
      const response = await fetch('/api/thumbnail-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, keyword: keyword.trim(), image: annotatedImage }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body?.error || '分析できませんでした。')
      setResult(body as AnalysisResult)
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析できませんでした。')
    } finally {
      setLoading(false)
    }
  }

  async function copyPrompt() {
    if (!result?.generationPrompt) return
    await navigator.clipboard.writeText(result.generationPrompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function resetImage() {
    setImageData(null)
    setFileName('')
    setPoint(null)
    setAnnotatedImage(null)
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerRight}><span>FREE TOOL</span><a href="/#apps">アプリ一覧</a></div>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>SEARCH THUMBNAIL CHECKER</div>
        <h1>検索結果で、<br /><em>自社だけ弱い理由</em>を見つける。</h1>
        <p>楽天・Amazon・Yahoo!ショッピングの検索結果をスクショして、自社商品をクリック。競合と並んだ瞬間の見え方から、サムネイル改善点をAIが優先順で出します。</p>
        <div className={styles.steps}><span><b>1</b>スクショ</span><i>→</i><span><b>2</b>自社を指定</span><i>→</i><span><b>3</b>改善TOP5</span></div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.settings}>
          <div className={styles.field}>
            <label>1. モール</label>
            <div className={styles.platforms}>
              {platforms.map(item => (
                <button key={item.id} className={platform === item.id ? styles.activePlatform : ''} onClick={() => { setPlatform(item.id); setResult(null) }} type="button">
                  <strong>{item.label}</strong><small>{item.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="keyword">2. 検索キーワード</label>
            <input id="keyword" value={keyword} onChange={event => { setKeyword(event.target.value); setResult(null) }} placeholder="例：ワイヤレスイヤホン" />
            <small>実際に検索したビッグワードを入力</small>
          </div>

          <div className={styles.field}>
            <label>3. 検索結果スクショ</label>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className={styles.hiddenInput} onChange={(event: ChangeEvent<HTMLInputElement>) => loadFile(event.target.files?.[0])} />
            {!imageData ? (
              <button type="button" className={styles.uploadButton} onClick={() => fileRef.current?.click()}><span>＋</span><strong>スクショを選ぶ</strong><small>PNG / JPEG / WebP・8MBまで</small></button>
            ) : (
              <div className={styles.fileRow}><div><strong>{fileName}</strong><small>画像を変更すると指定位置はリセットされます</small></div><button type="button" onClick={resetImage}>削除</button></div>
            )}
          </div>

          <button className={styles.analyzeButton} disabled={!ready} onClick={analyze} type="button">
            {loading ? <><span className={styles.spinner} />比較中...</> : '改善点を発見する →'}
          </button>
          {!annotatedImage && imageData && <p className={styles.helper}>右の画像で<strong>自社商品を1回クリック</strong>してください。</p>}
          <p className={styles.notice}>画面に表示されている情報だけを比較します。順位上昇・CTR改善など、画像だけでは確認できない効果は断定しません。</p>
        </aside>

        <div className={styles.previewPanel}>
          <div className={styles.panelHead}><div><span>SCREENSHOT</span><strong>{selectedPlatform.label} / {keyword.trim() || 'キーワード未入力'}</strong></div>{point && <b>自社商品 指定済み</b>}</div>
          {!imageData ? (
            <button className={styles.emptyPreview} type="button" onClick={() => fileRef.current?.click()}><span>SEARCH RESULT</span><strong>検索結果のスクリーンショットを<br />ここに読み込みます</strong><small>PCでもスマホでもOK</small></button>
          ) : (
            <div className={styles.imageStage}>
              <img src={imageData} alt="検索結果スクリーンショット" onClick={chooseOwnProduct} />
              {point && <div className={styles.marker} style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}><span>自社</span></div>}
              <div className={styles.clickGuide}>{point ? '位置を変える場合は別の商品をクリック' : '自社商品をクリックして指定'}</div>
            </div>
          )}
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <section className={styles.result} id="result">
          <div className={styles.resultHead}><div><span>AI COMPARISON</span><h2>改善ポイント TOP {result.improvements.length}</h2></div><p>{result.summary}</p></div>

          {result.strengths.length > 0 && <div className={styles.strengths}><strong>今のサムネで良いところ</strong><div>{result.strengths.map(item => <span key={item}>✓ {item}</span>)}</div></div>}

          <div className={styles.improvementList}>
            {result.improvements.map((item, index) => (
              <article key={`${item.title}-${index}`}>
                <div className={styles.rank}>{String(index + 1).padStart(2, '0')}</div>
                <div className={styles.improvementBody}>
                  <div className={styles.improvementTitle}><h3>{item.title}</h3><span>優先度 {'★'.repeat(Math.max(1, Math.min(5, item.impactScore)))}</span></div>
                  <div className={styles.compareGrid}>
                    <div><small>現在</small><p>{item.current}</p></div>
                    <div><small>検索結果で見える差</small><p>{item.evidence}</p></div>
                    <div className={styles.actionCell}><small>やること</small><p>{item.action}</p></div>
                  </div>
                  <p className={styles.reason}>{item.reason}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.promptBox}>
            <div><span>IMAGE CREATION PROMPT</span><h3>画像制作・AI画像編集にそのまま使う</h3><p>元画像を編集する担当者や画像生成AIへ渡すための指示文です。</p></div>
            <pre>{result.generationPrompt}</pre>
            <button type="button" onClick={copyPrompt}>{copied ? 'コピーしました ✓' : 'プロンプトをコピー'}</button>
          </div>

          <div className={styles.resultActions}><button type="button" onClick={() => setResult(null)}>同じ画像でもう一度見る</button><button type="button" onClick={resetImage}>別の検索結果を分析</button></div>
        </section>
      )}

      <section className={styles.howTo}>
        <div><span>GOOD SCREENSHOT</span><h2>競合が多く見えるほど、<br />比較しやすい。</h2></div>
        <div className={styles.tips}>
          <article><b>01</b><strong>ビッグワードで検索</strong><p>実際に獲りたい検索語句で検索。指名ワードより、競合が並ぶ一般ワード向きです。</p></article>
          <article><b>02</b><strong>1画面に複数商品</strong><p>自社だけを切り抜かず、前後左右の競合商品が見える状態でスクショします。</p></article>
          <article><b>03</b><strong>検索結果そのまま</strong><p>画像単体ではなく、実際の一覧画面を使うことで「並んだ時の弱さ」を見ます。</p></article>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p></div>
        <p>Amazon、楽天市場、Yahoo!ショッピングの各運営会社とは関係のない非公式ツールです。各モールの最新ガイドラインを確認したうえで画像を変更してください。</p>
      </footer>
    </main>
  )
}
