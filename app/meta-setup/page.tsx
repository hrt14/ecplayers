'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './meta-setup.module.css'

type EventKey = 'pageView' | 'viewContent' | 'addToCart' | 'initiateCheckout' | 'purchase'
type InstagramMode = '' | 'use' | 'skip'

const STORAGE_KEY = 'ecp-meta-setup-v1'
const BUSINESS_SETTINGS = 'https://business.facebook.com/settings'
const EVENTS_MANAGER = 'https://business.facebook.com/events_manager2/'
const META_PIXEL = 'https://www.facebook.com/business/tools/meta-pixel'

const profileItems = [
  ['facebook', 'Facebookアカウントはある'],
  ['page', 'Facebookページはある'],
  ['instagram', 'Instagramアカウントはある'],
  ['shop', 'ネットショップは公開済み'],
  ['newAds', 'Meta広告はまだ出したことがない'],
  ['unknown', 'よくわからない'],
]

const shops = ['Shopify', 'futureshop', 'makeshop', 'カラーミーショップ', 'BASE', 'WordPress / WooCommerce', 'その他', 'わからない']

const eventRows: { key: EventKey; label: string; note: string }[] = [
  { key: 'pageView', label: 'PageView', note: 'サイトを開いた' },
  { key: 'viewContent', label: 'ViewContent', note: '商品・主要ページを見た' },
  { key: 'addToCart', label: 'AddToCart', note: 'カートに入れた' },
  { key: 'initiateCheckout', label: 'InitiateCheckout', note: '購入手続きへ進んだ' },
  { key: 'purchase', label: 'Purchase', note: '購入が完了した' },
]

const defaultEvents: Record<EventKey, boolean> = {
  pageView: false,
  viewContent: false,
  addToCart: false,
  initiateCheckout: false,
  purchase: false,
}

function shopInstruction(shop: string) {
  if (!shop) return 'ショップを選ぶと、次に確認する場所だけ表示します。'
  if (shop === 'わからない') return 'ショップ管理画面のサービス名が分かる画面を確認してください。分からなければ「画面が違う」からスクリーンショット相談用プロンプトを作れます。'
  if (shop === 'その他') return 'まずEvents ManagerでWebのデータソースを確認し、その後ショップ側にMeta Pixel / Meta連携 / 計測設定がないか探します。見つからなければ手動設置やタグ管理の検討に進みます。'
  return `${shop}の管理画面で、Meta連携・Meta Pixel・Facebook / Instagram連携などの計測設定を確認します。先にEvents Managerで使うデータソースを確認してから進めると迷いにくくなります。`
}

export default function MetaSetupPage() {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<string[]>([])
  const [completed, setCompleted] = useState<number[]>([])
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [instagramMode, setInstagramMode] = useState<InstagramMode>('')
  const [shop, setShop] = useState('')
  const [events, setEvents] = useState<Record<EventKey, boolean>>(defaultEvents)
  const [helpOpen, setHelpOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (typeof saved.step === 'number') setStep(saved.step)
        if (Array.isArray(saved.profile)) setProfile(saved.profile)
        if (Array.isArray(saved.completed)) setCompleted(saved.completed)
        if (saved.checks && typeof saved.checks === 'object') setChecks(saved.checks)
        if (saved.instagramMode === 'use' || saved.instagramMode === 'skip') setInstagramMode(saved.instagramMode)
        if (typeof saved.shop === 'string') setShop(saved.shop)
        if (saved.events && typeof saved.events === 'object') setEvents({ ...defaultEvents, ...saved.events })
      }
    } catch {
      // Ignore broken local state and start fresh.
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, profile, completed, checks, instagramMode, shop, events }))
  }, [loaded, step, profile, completed, checks, instagramMode, shop, events])

  useEffect(() => {
    setHelpOpen(false)
    setCopied(false)
  }, [step])

  const progress = step === 0 ? 0 : Math.min(100, (Math.min(step, 8) / 8) * 100)
  const basicEventsOk = events.pageView && events.viewContent && events.addToCart && events.initiateCheckout

  const resultItems = useMemo(() => [
    ['ビジネス管理環境', completed.includes(1)],
    ['Facebookページと権限', completed.includes(2)],
    ['Instagram', completed.includes(3)],
    ['広告アカウント', completed.includes(4)],
    ['支払い方法', completed.includes(5)],
    ['Pixel / Webデータソース', completed.includes(6)],
    ['基本イベント', basicEventsOk],
    ['Purchase', events.purchase],
  ] as const, [completed, basicEventsOk, events.purchase])

  const score = resultItems.filter(([, done]) => done).length

  const toggleProfile = (key: string) => {
    setProfile(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key])
  }

  const toggleCheck = (key: string) => setChecks(current => ({ ...current, [key]: !current[key] }))

  const completeAndNext = (currentStep: number) => {
    setCompleted(current => current.includes(currentStep) ? current : [...current, currentStep])
    setStep(Math.min(8, currentStep + 1))
  }

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStep(0)
    setProfile([])
    setCompleted([])
    setChecks({})
    setInstagramMode('')
    setShop('')
    setEvents(defaultEvents)
    setHelpOpen(false)
    setCopied(false)
  }

  const helpPrompt = `Meta広告の初期設定をしています。\n現在は STEP ${Math.min(step, 7)} です。${shop ? `\n利用中のショップ: ${shop}` : ''}\n添付するスクリーンショットを見て、次に押す場所だけ教えてください。\n画面名が変わっている可能性も考慮し、見えていない項目を推測で断定しないでください。\n不要な説明は省き、1手ずつ案内してください。`

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(helpPrompt)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const HelpBox = () => (
    <div className={styles.help}>
      <div className={styles.helpTop}>
        <strong>今の画面が説明と違う？</strong>
        <button type="button" onClick={() => setHelpOpen(value => !value)}>{helpOpen ? '閉じる' : '画面が違う'}</button>
      </div>
      {helpOpen && (
        <>
          <p className={styles.micro}>Metaは管理画面の表示が変わることがあります。下の文をコピーし、今見えている画面のスクリーンショットと一緒にAIへ貼ってください。</p>
          <div className={styles.prompt}>{helpPrompt}</div>
          <div className={styles.actions}>
            <button type="button" className={styles.ghost} onClick={copyPrompt}>プロンプトをコピー</button>
            {copied && <span className={styles.copied}>コピーしました</span>}
          </div>
        </>
      )}
    </div>
  )

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerRight}>
          {step > 0 && <button type="button" className={styles.reset} onClick={resetAll}>最初から</button>}
          <a className={styles.back} href="/#apps">ECPアプリ一覧へ</a>
        </div>
      </header>

      <div className={styles.shell}>
        <div className={styles.topline}>
          <span className={styles.eyebrow}>ECP / META START</span>
          <span className={styles.stepCount}>{step === 0 ? 'START' : step === 8 ? 'RESULT' : `STEP ${step} / 7`}</span>
        </div>
        <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>

        <section className={styles.card}>
          {step === 0 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>META FIRST SETUP</span>
                <h1>Meta広告、<br />最初の設定を終わらせよう。</h1>
                <p className={styles.lead}>読むためのマニュアルではありません。今やることを1個ずつ出します。終わったら押す。分からなければ「画面が違う」。それだけで進めます。</p>
                <p className={styles.oneThing}>今やること：あなたの現在地をチェック</p>
              </div>
              <div className={styles.body}>
                <h3 className={styles.sectionTitle}>当てはまるものを選んでください</h3>
                <div className={styles.choices}>
                  {profileItems.map(([key, label]) => (
                    <label className={styles.checkRow} key={key}>
                      <input type="checkbox" checked={profile.includes(key)} onChange={() => toggleProfile(key)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.primary} onClick={() => setStep(1)}>設定をはじめる →</button>
                </div>
                <p className={styles.micro}>途中の状態はこのブラウザに自動保存します。閉じても続きから再開できます。</p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>STEP 1</span>
                <h2>ビジネス管理環境を確認</h2>
                <p className={styles.lead}>まず、会社・店舗としてMetaの資産を管理する場所を開きます。ここでは新しく何かを作るより、すでにある環境を見つけることを優先します。</p>
                <p className={styles.oneThing}>今やること：Metaのビジネス設定を開く</p>
              </div>
              <div className={styles.body}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoBox}><small>見るもの</small><strong>会社・店舗のビジネス環境</strong></div>
                  <div className={styles.infoBox}><small>まだしない</small><strong>よく分からないまま新規作成</strong></div>
                </div>
                <div className={styles.actions}>
                  <a className={styles.secondary} href={BUSINESS_SETTINGS} target="_blank" rel="noreferrer">Metaのビジネス設定を開く ↗</a>
                  <button type="button" className={styles.primary} onClick={() => completeAndNext(1)}>この画面が出た →</button>
                </div>
                <HelpBox />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>STEP 2</span>
                <h2>Facebookページと権限を確認</h2>
                <p className={styles.lead}>広告で使うFacebookページが既にあるなら、それを使います。二重に作る前に、正しいページと自分のアクセス権を確認します。</p>
                <p className={styles.oneThing}>今やること：ページ名と自分の権限を確認</p>
              </div>
              <div className={styles.body}>
                <div className={styles.choices}>
                  <label className={styles.checkRow}><input type="checkbox" checked={!!checks.pageCorrect} onChange={() => toggleCheck('pageCorrect')} /><span>正しいFacebookページが表示されている</span></label>
                  <label className={styles.checkRow}><input type="checkbox" checked={!!checks.pageAccess} onChange={() => toggleCheck('pageAccess')} /><span>自分に必要なアクセス権がある</span></label>
                </div>
                <div className={styles.actions}>
                  <a className={styles.officialLink} href={BUSINESS_SETTINGS} target="_blank" rel="noreferrer">ビジネス設定を開く ↗</a>
                  <button type="button" className={styles.primary} disabled={!checks.pageCorrect || !checks.pageAccess} onClick={() => completeAndNext(2)}>確認できた →</button>
                </div>
                <HelpBox />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>STEP 3</span>
                <h2>Instagramを使うか決める</h2>
                <p className={styles.lead}>今すぐ広告で使わないなら、この手順は飛ばして構いません。使う場合だけ接続を確認します。</p>
                <p className={styles.oneThing}>今やること：使う / 今は使わない を選ぶ</p>
              </div>
              <div className={styles.body}>
                <div className={styles.choices}>
                  <button type="button" className={`${styles.radioRow} ${instagramMode === 'use' ? styles.active : ''}`} onClick={() => setInstagramMode('use')}><span className={styles.radioDot} /><span>Instagramを使う</span></button>
                  <button type="button" className={`${styles.radioRow} ${instagramMode === 'skip' ? styles.active : ''}`} onClick={() => setInstagramMode('skip')}><span className={styles.radioDot} /><span>今は使わない</span></button>
                </div>
                {instagramMode === 'use' && (
                  <div className={styles.shopGuide}>
                    <strong>Instagramを使う場合</strong>
                    <p>ビジネス設定で対象のInstagramアカウントが正しいビジネスに接続されていることを確認します。</p>
                    <label className={styles.checkRow}><input type="checkbox" checked={!!checks.instagramConnected} onChange={() => toggleCheck('instagramConnected')} /><span>接続を確認できた</span></label>
                  </div>
                )}
                <div className={styles.actions}>
                  <a className={styles.officialLink} href={BUSINESS_SETTINGS} target="_blank" rel="noreferrer">ビジネス設定を開く ↗</a>
                  <button type="button" className={styles.primary} disabled={!instagramMode || (instagramMode === 'use' && !checks.instagramConnected)} onClick={() => completeAndNext(3)}>{instagramMode === 'skip' ? 'スキップして次へ →' : 'できた →'}</button>
                </div>
                <HelpBox />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>STEP 4</span>
                <h2>広告アカウントを確認</h2>
                <p className={styles.lead}>ここでも先に「既存の広告アカウントがないか」を見ます。過去に広告を出していた場合は、安易に新しいものを増やさない方が管理しやすくなります。</p>
                <p className={styles.oneThing}>今やること：使う広告アカウントを1つ特定</p>
              </div>
              <div className={styles.body}>
                <div className={styles.choices}>
                  <label className={styles.checkRow}><input type="checkbox" checked={!!checks.adAccountFound} onChange={() => toggleCheck('adAccountFound')} /><span>使う広告アカウントを確認できた</span></label>
                </div>
                <div className={styles.actions}>
                  <a className={styles.officialLink} href={BUSINESS_SETTINGS} target="_blank" rel="noreferrer">ビジネス設定を開く ↗</a>
                  <button type="button" className={styles.primary} disabled={!checks.adAccountFound} onClick={() => completeAndNext(4)}>確認できた →</button>
                </div>
                <HelpBox />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>STEP 5</span>
                <h2>支払い方法を確認</h2>
                <p className={styles.lead}>広告を配信する広告アカウントで、支払いに使う方法が設定されているかだけ確認します。</p>
                <p className={styles.oneThing}>今やること：支払い方法が登録済みか確認</p>
              </div>
              <div className={styles.body}>
                <div className={styles.choices}>
                  <label className={styles.checkRow}><input type="checkbox" checked={!!checks.paymentReady} onChange={() => toggleCheck('paymentReady')} /><span>支払い方法を確認できた</span></label>
                </div>
                <div className={styles.actions}>
                  <a className={styles.officialLink} href={BUSINESS_SETTINGS} target="_blank" rel="noreferrer">ビジネス設定を開く ↗</a>
                  <button type="button" className={styles.primary} disabled={!checks.paymentReady} onClick={() => completeAndNext(5)}>確認できた →</button>
                </div>
                <HelpBox />
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>STEP 6</span>
                <h2>Pixel / Web計測を設定</h2>
                <p className={styles.lead}>ここだけはショップによって操作が違います。あなたのショップを選び、関係ある説明だけ見ます。</p>
                <p className={styles.oneThing}>今やること：ショップを選ぶ</p>
              </div>
              <div className={styles.body}>
                <div className={styles.shopGrid}>
                  {shops.map(item => <button type="button" key={item} className={`${styles.shopButton} ${shop === item ? styles.active : ''}`} onClick={() => setShop(item)}>{item}</button>)}
                </div>
                <div className={styles.shopGuide}>
                  <strong>{shop || 'ショップ未選択'}</strong>
                  <p>{shopInstruction(shop)}</p>
                </div>
                {shop && (
                  <div className={styles.choices} style={{ marginTop: 14 }}>
                    <label className={styles.checkRow}><input type="checkbox" checked={!!checks.pixelReady} onChange={() => toggleCheck('pixelReady')} /><span>Events ManagerでWebのデータソースを確認し、ショップ側の設定まで進めた</span></label>
                  </div>
                )}
                <div className={styles.actions}>
                  <a className={styles.secondary} href={EVENTS_MANAGER} target="_blank" rel="noreferrer">Events Managerを開く ↗</a>
                  <button type="button" className={styles.primary} disabled={!shop || !checks.pixelReady} onClick={() => completeAndNext(6)}>設定した →</button>
                </div>
                <p className={styles.micro}>コードを入れただけでは完了にしません。次のSTEPで実際にイベントが届くところまで確認します。</p>
                <HelpBox />
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>STEP 7</span>
                <h2>本当に計測できているか確認</h2>
                <p className={styles.lead}>ショップを実際に操作し、Events Manager側でイベントを確認します。「設定した」ではなく「届いた」で判定します。</p>
                <p className={styles.oneThing}>今やること：確認できたイベントをONにする</p>
              </div>
              <div className={styles.body}>
                <div className={styles.eventList}>
                  {eventRows.map(row => (
                    <div className={styles.eventRow} key={row.key}>
                      <div className={styles.eventName}><span className={`${styles.eventState} ${events[row.key] ? styles.ok : ''}`} /><div><strong>{row.label}</strong><small>{row.note}</small></div></div>
                      <button type="button" className={`${styles.toggle} ${events[row.key] ? styles.on : ''}`} onClick={() => setEvents(current => ({ ...current, [row.key]: !current[row.key] }))}>{events[row.key] ? '確認済み' : '未確認'}</button>
                    </div>
                  ))}
                </div>
                <div className={styles.actions}>
                  <a className={styles.secondary} href={EVENTS_MANAGER} target="_blank" rel="noreferrer">Events Managerを開く ↗</a>
                  <button type="button" className={styles.primary} onClick={() => { setCompleted(current => current.includes(7) ? current : [...current, 7]); setStep(8) }}>結果を見る →</button>
                </div>
                <p className={styles.micro}>Purchaseだけ未確認でも結果画面へ進めます。未完了項目として残し、後から戻って確認できます。</p>
                <HelpBox />
              </div>
            </>
          )}

          {step === 8 && (
            <>
              <div className={styles.cardHead}>
                <span className={styles.stepLabel}>SETUP SCORE</span>
                <h2>{score === 8 ? 'Meta広告を始められる状態です。' : 'あと少し。未完了だけ見ればOK。'}</h2>
                <p className={styles.lead}>全部の説明を覚える必要はありません。赤い項目だけ戻って確認してください。</p>
              </div>
              <div className={styles.body}>
                <div className={styles.scoreHero}><b>{score}</b><span>/ 8 完了</span></div>
                <div className={styles.resultList}>
                  {resultItems.map(([label, done]) => (
                    <div className={styles.resultRow} key={label}><strong>{label}</strong><span className={`${styles.resultStatus} ${done ? styles.done : styles.todo}`}>{done ? '● 完了' : '● 未完了'}</span></div>
                  ))}
                </div>
                <div className={styles.finishBox}>
                  <strong>{score === 8 ? '次は「最初の1キャンペーン」へ。' : '未完了だけ直せば前に進めます。'}</strong>
                  <p>初期設定の目的は、Metaの機能を全部理解することではなく、正しい資産で広告を出し、必要な計測ができる状態にすることです。</p>
                </div>
                <div className={styles.actions}>
                  {score < 8 && <button type="button" className={styles.primary} onClick={() => setStep(events.purchase ? 1 : 7)}>未完了を確認する →</button>}
                  <a className={styles.ghost} href="/#apps">ECPアプリ一覧へ</a>
                  <button type="button" className={styles.ghost} onClick={resetAll}>最初からやり直す</button>
                </div>
                <div className={styles.sources}>
                  <strong>公式画面・参考</strong>
                  <div className={styles.sourceLinks}>
                    <a href={BUSINESS_SETTINGS} target="_blank" rel="noreferrer">Meta ビジネス設定 ↗</a>
                    <a href={EVENTS_MANAGER} target="_blank" rel="noreferrer">Meta Events Manager ↗</a>
                    <a href={META_PIXEL} target="_blank" rel="noreferrer">Meta Pixel公式ページ ↗</a>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <p className={styles.footerNote}>Meta、Facebook、InstagramはMeta Platforms, Inc.の商標または登録商標です。本ツールはMeta Platforms, Inc.が提供・承認するものではありません。画面表示が異なる場合は、公式管理画面を優先してください。</p>
      </div>
    </main>
  )
}
