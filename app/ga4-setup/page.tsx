'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './ga4-setup.module.css'

type Platform = 'shopify' | 'futureshop' | 'makeshop' | 'wordpress' | 'other'
type ScoreKey = 'realtime' | 'viewItem' | 'addToCart' | 'purchase' | 'revenue' | 'item' | 'acquisition' | 'keyEvent'

const platforms: { id: Platform; label: string; note: string }[] = [
  { id: 'shopify', label: 'Shopify', note: 'Google公式のCMS向け手順で進める' },
  { id: 'futureshop', label: 'futureshop', note: '測定IDを管理画面へ設定' },
  { id: 'makeshop', label: 'makeshop', note: 'GA4 eコマース対応欄へ測定IDを設定' },
  { id: 'wordpress', label: 'WordPress', note: 'Google公式のCMS向け手順で進める' },
  { id: 'other', label: 'その他 / 自社開発', note: 'GoogleタグまたはGTMで設置' },
]

const scoreItems: { key: ScoreKey; title: string; detail: string }[] = [
  { key: 'realtime', title: 'リアルタイムに自分のアクセスが出る', detail: '基本タグの受信確認' },
  { key: 'viewItem', title: '商品詳細の閲覧が取れる', detail: 'view_item' },
  { key: 'addToCart', title: 'カート投入が取れる', detail: 'add_to_cart' },
  { key: 'purchase', title: '購入完了が取れる', detail: 'purchase' },
  { key: 'revenue', title: '売上金額が取れる', detail: 'purchase の value / currency' },
  { key: 'item', title: '商品名または商品IDが取れる', detail: 'items の中身を確認' },
  { key: 'acquisition', title: '流入元を確認できる', detail: 'トラフィック獲得レポート' },
  { key: 'keyEvent', title: '重要成果をキーイベントとして確認できる', detail: '購入・申込みなど事業上の重要イベント' },
]

const sourceLinks = [
  ['Google｜GA4をWebサイトに設定', 'https://support.google.com/analytics/answer/14183469?hl=ja'],
  ['Google｜推奨イベント', 'https://support.google.com/analytics/answer/9267735?hl=ja'],
  ['Google｜eコマース', 'https://support.google.com/analytics/answer/14430645?hl=ja'],
  ['futureshop｜Google Analytics設定', 'https://manual.future-shop.jp/settings/promotion/analyticsEnhancedEcommerce/'],
  ['makeshop｜アクセス解析用タグ設定', 'https://manual.makeshop.jp/hc/ja/articles/32676014073113'],
]

const emptyScore: Record<ScoreKey, boolean> = {
  realtime: false,
  viewItem: false,
  addToCart: false,
  purchase: false,
  revenue: false,
  item: false,
  acquisition: false,
  keyEvent: false,
}

export default function Ga4SetupPage() {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [step, setStep] = useState(0)
  const [setup, setSetup] = useState({ property: false, stream: false, measurementId: false, installed: false })
  const [score, setScore] = useState<Record<ScoreKey, boolean>>(emptyScore)
  const [beginCheckout, setBeginCheckout] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecp-ga4-setup-v1')
      if (!saved) return
      const parsed = JSON.parse(saved)
      setPlatform(parsed.platform ?? null)
      setStep(parsed.step ?? 0)
      setSetup(parsed.setup ?? setup)
      setScore({ ...emptyScore, ...(parsed.score ?? {}) })
      setBeginCheckout(Boolean(parsed.beginCheckout))
    } catch {
      // Ignore damaged local state and start fresh.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem('ecp-ga4-setup-v1', JSON.stringify({ platform, step, setup, score, beginCheckout }))
  }, [platform, step, setup, score, beginCheckout])

  const scoreCount = useMemo(() => Object.values(score).filter(Boolean).length, [score])
  const progress = Math.round(((step + 1) / 6) * 100)
  const selectedPlatform = platforms.find((item) => item.id === platform)

  const setSetupKey = (key: keyof typeof setup) => setSetup((prev) => ({ ...prev, [key]: !prev[key] }))
  const setScoreKey = (key: ScoreKey) => setScore((prev) => ({ ...prev, [key]: !prev[key] }))

  const reset = () => {
    setPlatform(null)
    setStep(0)
    setSetup({ property: false, stream: false, measurementId: false, installed: false })
    setScore(emptyScore)
    setBeginCheckout(false)
    localStorage.removeItem('ecp-ga4-setup-v1')
  }

  const prompt = `GA4をECサイトに導入しています。利用環境は「${selectedPlatform?.label ?? '未選択'}」です。\nいま開いている管理画面のスクリーンショットを見て、次に押す場所を1つだけ教えてください。\n目的は「GA4の測定IDを正しく設定し、ECのpurchaseまで確認すること」です。\n画面にない項目名を推測で作らず、見えている内容だけを根拠に案内してください。`

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">EC<span>players</span></a>
        <div className={styles.headerActions}>
          <button onClick={reset}>最初から</button>
          <a href="/">ECPトップ</a>
        </div>
      </header>

      <div className={styles.shell}>
        <div className={styles.kickerRow}>
          <span>GA4 SETUP / EC</span>
          <b>STEP {step + 1} / 6</b>
        </div>
        <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>

        {step === 0 && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.badge}>超最小導入</span>
              <h1>GA4を、<br />「入れたつもり」で終わらせない。</h1>
              <p>ECサイトにGA4を導入し、リアルタイム・商品閲覧・カート・購入・売上まで取れているかを順番に確認します。</p>
            </div>
            <div className={styles.cardBody}>
              <h2>まず、ECサイトの環境を選ぶ</h2>
              <div className={styles.platformGrid}>
                {platforms.map((item) => (
                  <button key={item.id} className={platform === item.id ? styles.activeChoice : ''} onClick={() => setPlatform(item.id)}>
                    <strong>{item.label}</strong><span>{item.note}</span>
                  </button>
                ))}
              </div>
              <div className={styles.actions}><button className={styles.primary} disabled={!platform} onClick={() => setStep(1)}>この環境で始める →</button></div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.badge}>STEP 1</span>
              <h1>GA4本体を作る。</h1>
              <p>Google Analyticsでプロパティを作成し、ウェブデータストリームから「G-」で始まる測定IDを確認します。</p>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.checkList}>
                <CheckRow checked={setup.property} onClick={() => setSetupKey('property')} title="GA4プロパティを作成した" note="Google Analyticsの管理画面で作成" />
                <CheckRow checked={setup.stream} onClick={() => setSetupKey('stream')} title="ウェブデータストリームを作成した" note="ショップURLを登録。拡張計測は基本ONで開始" />
                <CheckRow checked={setup.measurementId} onClick={() => setSetupKey('measurementId')} title="G-XXXXXXXXXX を確認した" note="この測定IDを次のSTEPで使う" />
              </div>
              <a className={styles.official} href="https://support.google.com/analytics/answer/14183469?hl=ja" target="_blank" rel="noreferrer">Google公式の設定手順 ↗</a>
              <Nav step={step} back={() => setStep(0)} next={() => setStep(2)} disabled={!setup.measurementId} />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.badge}>STEP 2</span>
              <h1>{selectedPlatform?.label}にGA4を入れる。</h1>
              <p>測定IDまたはGoogleタグを、利用環境に合った方法で設定します。</p>
            </div>
            <div className={styles.cardBody}>
              <PlatformGuide platform={platform} />
              <CheckRow checked={setup.installed} onClick={() => setSetupKey('installed')} title="設定を保存・公開した" note="ここではまだ完了扱いにしません。次に実際の受信を確認します。" />
              <div className={styles.helpBox}>
                <div><strong>管理画面が説明と違う？</strong><span>スクショと一緒にAIへ貼るためのプロンプト</span></div>
                <button onClick={copyPrompt}>{copied ? 'コピーしました' : 'プロンプトをコピー'}</button>
              </div>
              <Nav step={step} back={() => setStep(1)} next={() => setStep(3)} disabled={!setup.installed} />
            </div>
          </section>
        )}

        {step === 3 && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.badge}>STEP 3</span>
              <h1>リアルタイムで、<br />本当に入ったか確認。</h1>
              <p>GA4の「リアルタイム」を開いたまま、自分でショップへアクセスします。Google公式では、データ収集開始まで最大30分かかる場合があると案内しています。</p>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.testBox}><b>TEST</b><strong>自分のアクセスが表示された？</strong><p>表示されない場合は「導入済み」にしない。測定ID・タグの出力・公開状態を再確認します。</p></div>
              <CheckRow checked={score.realtime} onClick={() => setScoreKey('realtime')} title="リアルタイムに自分のアクセスが出た" note="基本計測OK" />
              <Nav step={step} back={() => setStep(2)} next={() => setStep(4)} disabled={!score.realtime} />
            </div>
          </section>
        )}

        {step === 4 && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.badge}>STEP 4</span>
              <h1>ECイベントを確認する。</h1>
              <p>ページビューだけではEC分析は不十分です。商品閲覧→カート→購入の主要イベントを確認します。</p>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.eventGrid}>
                <EventToggle code="view_item" title="商品詳細を見た" checked={score.viewItem} onClick={() => setScoreKey('viewItem')} />
                <EventToggle code="add_to_cart" title="カートに入れた" checked={score.addToCart} onClick={() => setScoreKey('addToCart')} />
                <EventToggle code="begin_checkout" title="購入手続きを開始した" checked={beginCheckout} onClick={() => setBeginCheckout((v) => !v)} optional />
                <EventToggle code="purchase" title="購入した" checked={score.purchase} onClick={() => setScoreKey('purchase')} />
              </div>
              <div className={styles.notice}>purchaseは「イベント名が出た」だけでなく、次のSTEPで売上金額と商品情報まで確認します。</div>
              <Nav step={step} back={() => setStep(3)} next={() => setStep(5)} disabled={!score.viewItem || !score.addToCart || !score.purchase} />
            </div>
          </section>
        )}

        {step === 5 && (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.badge}>FINAL CHECK</span>
              <h1>GA4導入スコア<br /><em>{scoreCount} / 8</em></h1>
              <p>全部YESなら「GA4導入済み」。足りない項目が、そのまま次に直す場所です。</p>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.scoreList}>
                {scoreItems.map((item) => (
                  <button key={item.key} onClick={() => setScoreKey(item.key)} className={score[item.key] ? styles.scoreDone : ''}>
                    <span>{score[item.key] ? '✓' : '—'}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div><b>{score[item.key] ? 'OK' : '未確認'}</b>
                  </button>
                ))}
              </div>

              <div className={scoreCount === 8 ? styles.complete : styles.incomplete}>
                <strong>{scoreCount === 8 ? 'GA4導入完了' : `あと ${8 - scoreCount} 項目`}</strong>
                <p>{scoreCount === 8 ? 'どこから来て、どの商品を見て、どこで落ち、何が売れたかを確認できる状態です。次は分析ではなく、改善施策を1つ決めます。' : '未確認の項目だけを上から潰してください。特に purchase・売上金額・商品情報を優先します。'}</p>
              </div>

              <div className={styles.sources}>
                <strong>根拠・公式マニュアル</strong>
                <div>{sourceLinks.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label} ↗</a>)}</div>
              </div>

              <div className={styles.actions}><button className={styles.secondary} onClick={() => setStep(4)}>← ECイベントへ戻る</button><button className={styles.ghost} onClick={reset}>もう一度チェック</button></div>
            </div>
          </section>
        )}

        <p className={styles.footerNote}>ECPはGoogle、Shopify、futureshop、makeshop、WordPressの公式サービスではありません。画面や仕様は変更されるため、最終確認は各公式マニュアルを参照してください。</p>
      </div>
    </main>
  )
}

function CheckRow({ checked, onClick, title, note }: { checked: boolean; onClick: () => void; title: string; note: string }) {
  return <button className={`${styles.checkRow} ${checked ? styles.checked : ''}`} onClick={onClick}><span>{checked ? '✓' : ''}</span><div><strong>{title}</strong><small>{note}</small></div></button>
}

function EventToggle({ code, title, checked, onClick, optional = false }: { code: string; title: string; checked: boolean; onClick: () => void; optional?: boolean }) {
  return <button className={`${styles.eventToggle} ${checked ? styles.eventOn : ''}`} onClick={onClick}><div><code>{code}</code>{optional && <small>推奨確認</small>}</div><strong>{title}</strong><span>{checked ? '確認済み ✓' : '未確認'}</span></button>
}

function Nav({ back, next, disabled }: { step: number; back: () => void; next: () => void; disabled?: boolean }) {
  return <div className={styles.actions}><button className={styles.secondary} onClick={back}>← 戻る</button><button className={styles.primary} onClick={next} disabled={disabled}>次へ →</button></div>
}

function PlatformGuide({ platform }: { platform: Platform | null }) {
  if (platform === 'futureshop') return <div className={styles.guide}><span>futureshop</span><h2>設定 ＞ プロモーション ＞ Google Analytics設定</h2><ol><li>「利用する」を選ぶ</li><li>Google Analytics 4設定の「測定ID」に G-XXXXXXXXXX を入力</li><li>保存後、次のSTEPでリアルタイム受信を確認</li></ol><a href="https://manual.future-shop.jp/settings/promotion/analyticsEnhancedEcommerce/" target="_blank" rel="noreferrer">futureshop公式マニュアル ↗</a></div>
  if (platform === 'makeshop') return <div className={styles.guide}><span>makeshop</span><h2>ショップ構築 / 設定 / SEO・SNS・マーケティング / タグの設定 / アクセス解析用のタグの設定</h2><ol><li>「Google Analytics（GA4）の設定 eコマース対応」を開く</li><li>G-から始まる測定IDを入力</li><li>既存のhead/body用GA4タグと重複させない</li></ol><a href="https://manual.makeshop.jp/hc/ja/articles/32676014073113" target="_blank" rel="noreferrer">makeshop公式マニュアル ↗</a></div>
  if (platform === 'shopify' || platform === 'wordpress') return <div className={styles.guide}><span>{platform === 'shopify' ? 'Shopify' : 'WordPress'}</span><h2>Google公式のCMS向け導入手順から進める</h2><ol><li>GA4のウェブデータストリームを開く</li><li>GoogleタグID / 測定IDを確認</li><li>Google公式に掲載されているCMS別の案内に従って設定</li></ol><a href="https://support.google.com/analytics/answer/10447272?hl=ja" target="_blank" rel="noreferrer">Google公式 CMS設定 ↗</a></div>
  return <div className={styles.guide}><span>その他 / 自社開発</span><h2>Googleタグを直接設置、またはGTMを使う</h2><ol><li>GA4の「タグの実装手順」を開く</li><li>直接設置ならGoogleタグを各ページのhead直後へ設置</li><li>GTMを使う場合はGoogle公式のGA4設定手順に従う</li></ol><a href="https://support.google.com/analytics/answer/14183469?hl=ja" target="_blank" rel="noreferrer">Google公式 設定手順 ↗</a></div>
}
