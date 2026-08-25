'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import styles from './RakutenWatch.module.css'

type ResolvedShop = {
  shopCode: string | null
  shopId: string | null
  shopName: string | null
  shopUrl: string
  searchUrl: string | null
  newItemsUrl: string | null
  deliveryUrl: string | null
  detectedAutomatically: boolean
}

type ShopWatch = {
  id: string
  name: string
  shopCode: string | null
  shopId: string
  sourceUrl: string
  shopUrl: string
  searchUrl: string
  newItemsUrl: string
  deliveryUrl: string
  currentCount?: number
  previousCount?: number
  checkedAt?: string
  createdAt: string
}

const STORAGE_KEY = 'ecp-rakuten-competitor-watcher-v1'

function formatDate(value?: string) {
  if (!value) return '未確認'
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCount(value?: number) {
  return typeof value === 'number' ? value.toLocaleString('ja-JP') : '—'
}

function countDelta(shop: ShopWatch) {
  if (typeof shop.currentCount !== 'number' || typeof shop.previousCount !== 'number') return null
  const delta = shop.currentCount - shop.previousCount
  if (delta === 0) return '±0'
  return `${delta > 0 ? '+' : ''}${delta.toLocaleString('ja-JP')}`
}

export default function RakutenWatchClient() {
  const [shops, setShops] = useState<ShopWatch[]>([])
  const [shopUrl, setShopUrl] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopId, setShopId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [countDrafts, setCountDrafts] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ShopWatch[]
        if (Array.isArray(parsed)) setShops(parsed)
      }
    } catch {
      // Ignore broken local storage and start clean.
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shops))
  }, [shops, loaded])

  const totalRecorded = useMemo(
    () => shops.reduce((sum, shop) => sum + (shop.currentCount || 0), 0),
    [shops],
  )

  async function addShop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!shopUrl.trim()) {
      setError('楽天ショップURLを入力してください。')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ url: shopUrl.trim() })
      if (shopId.trim()) params.set('sid', shopId.trim())

      const response = await fetch(`/api/rakuten-shop?${params.toString()}`)
      const data = (await response.json()) as ResolvedShop & { error?: string }

      if (!response.ok) throw new Error(data.error || 'ショップ情報を取得できませんでした。')
      if (!data.shopId || !data.searchUrl || !data.newItemsUrl || !data.deliveryUrl) {
        throw new Error('店舗ID（sid）を自動取得できませんでした。ショップ内検索URLの「sid=数字」を店舗ID欄に入れてください。')
      }

      const id = `sid:${data.shopId}`
      const now = new Date().toISOString()
      const nextShop: ShopWatch = {
        id,
        name: shopName.trim() || data.shopName || data.shopCode || `楽天ショップ ${data.shopId}`,
        shopCode: data.shopCode,
        shopId: data.shopId,
        sourceUrl: shopUrl.trim(),
        shopUrl: data.shopUrl,
        searchUrl: data.searchUrl,
        newItemsUrl: data.newItemsUrl,
        deliveryUrl: data.deliveryUrl,
        createdAt: now,
      }

      setShops((current) => {
        const existing = current.find((shop) => shop.id === id)
        if (!existing) return [nextShop, ...current]
        return current.map((shop) =>
          shop.id === id
            ? {
                ...shop,
                ...nextShop,
                currentCount: shop.currentCount,
                previousCount: shop.previousCount,
                checkedAt: shop.checkedAt,
                createdAt: shop.createdAt,
              }
            : shop,
        )
      })
      setShopUrl('')
      setShopName('')
      setShopId('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '登録できませんでした。')
    } finally {
      setLoading(false)
    }
  }

  function recordCount(shop: ShopWatch) {
    const raw = countDrafts[shop.id] ?? (typeof shop.currentCount === 'number' ? String(shop.currentCount) : '')
    const value = Number(raw.replace(/,/g, ''))
    if (!Number.isInteger(value) || value < 0) {
      setError('商品点数は0以上の整数で入力してください。')
      return
    }

    setError('')
    setShops((current) =>
      current.map((item) =>
        item.id === shop.id
          ? {
              ...item,
              previousCount: item.currentCount,
              currentCount: value,
              checkedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
  }

  function markChecked(shopIdValue: string) {
    setShops((current) =>
      current.map((shop) =>
        shop.id === shopIdValue ? { ...shop, checkedAt: new Date().toISOString() } : shop,
      ),
    )
  }

  function removeShop(shopIdValue: string) {
    setShops((current) => current.filter((shop) => shop.id !== shopIdValue))
  }

  async function copyLink(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(id)
      window.setTimeout(() => setCopied(''), 1400)
    } catch {
      setError('URLをコピーできませんでした。ブラウザの権限を確認してください。')
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav>
          <a href="/#apps">アプリ一覧</a>
          <a href="/trademarks">第三者商標</a>
          <a href="/">トップへ戻る</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>RAKUTEN COMPETITOR WATCHER</span>
          <h1>楽天の競合店を、<br /><em>1画面で見る。</em></h1>
          <p>競合ショップのURLを登録すると、商品一覧・新着順・納期確認のURLをまとめて生成。商品点数も記録して、前回との差をすぐ確認できます。</p>
          <div className={styles.heroBadges}>
            <span>登録無料</span><span>ログイン不要</span><span>このブラウザに保存</span>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div><small>WATCHING</small><strong>{shops.length}</strong><span>shops</span></div>
          <div><small>RECORDED ITEMS</small><strong>{totalRecorded ? totalRecorded.toLocaleString('ja-JP') : '—'}</strong><span>items</span></div>
        </div>
      </section>

      <section className={styles.registerSection}>
        <div className={styles.sectionTitle}>
          <span>ADD COMPETITOR</span>
          <h2>競合ショップを登録</h2>
          <p>通常のショップURLでOK。店舗ID（sid）は可能な限り自動取得します。</p>
        </div>

        <form className={styles.form} onSubmit={addShop}>
          <label className={styles.mainField}>
            <span>楽天ショップURL</span>
            <input
              value={shopUrl}
              onChange={(event) => setShopUrl(event.target.value)}
              placeholder="https://www.rakuten.co.jp/example-shop/"
              inputMode="url"
            />
          </label>
          <div className={styles.subFields}>
            <label>
              <span>表示名 <small>任意</small></span>
              <input value={shopName} onChange={(event) => setShopName(event.target.value)} placeholder="競合A" />
            </label>
            <label>
              <span>店舗ID（sid） <small>自動取得できない時だけ</small></span>
              <input value={shopId} onChange={(event) => setShopId(event.target.value.replace(/\D/g, ''))} placeholder="例：412341" inputMode="numeric" />
            </label>
          </div>
          <button className={styles.addButton} type="submit" disabled={loading}>
            {loading ? '確認中…' : '＋ 競合店を登録'}
          </button>
          {error && <p className={styles.error}>{error}</p>}
          <p className={styles.formHelp}>sidが不明な場合は、競合ショップ内で検索ボタンを押した後のURLにある <b>sid=数字</b> を入力してください。</p>
        </form>
      </section>

      <section className={styles.watchSection}>
        <div className={styles.sectionTitle}>
          <span>WATCH LIST</span>
          <h2>競合店一覧</h2>
          <p>各リンクは楽天市場の公開ページを開きます。確認後に商品点数を記録すると、次回から増減が分かります。</p>
        </div>

        {!loaded ? (
          <div className={styles.empty}>読み込み中…</div>
        ) : shops.length === 0 ? (
          <div className={styles.empty}>
            <strong>まだ競合店がありません。</strong>
            <p>上のフォームから1店舗登録すると、ここにウォッチカードが表示されます。</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {shops.map((shop) => {
              const delta = countDelta(shop)
              const countDraft = countDrafts[shop.id] ?? (typeof shop.currentCount === 'number' ? String(shop.currentCount) : '')
              return (
                <article className={styles.card} key={shop.id}>
                  <div className={styles.cardTop}>
                    <div>
                      <span className={styles.shopCode}>{shop.shopCode || `sid:${shop.shopId}`}</span>
                      <h3>{shop.name}</h3>
                    </div>
                    <button className={styles.remove} type="button" onClick={() => removeShop(shop.id)} aria-label={`${shop.name}を削除`}>×</button>
                  </div>

                  <div className={styles.metrics}>
                    <div>
                      <small>商品点数</small>
                      <strong>{formatCount(shop.currentCount)}</strong>
                    </div>
                    <div>
                      <small>前回比</small>
                      <strong className={delta && delta.startsWith('+') ? styles.up : delta && delta.startsWith('-') ? styles.down : ''}>{delta || '—'}</strong>
                    </div>
                    <div>
                      <small>最終確認</small>
                      <strong className={styles.date}>{formatDate(shop.checkedAt)}</strong>
                    </div>
                  </div>

                  <div className={styles.links}>
                    <a href={shop.searchUrl} target="_blank" rel="noreferrer" onClick={() => markChecked(shop.id)}><span>全商品</span><b>商品点数を見る ↗</b></a>
                    <a href={shop.newItemsUrl} target="_blank" rel="noreferrer" onClick={() => markChecked(shop.id)}><span>新商品</span><b>新着順で見る ↗</b></a>
                    <a href={shop.deliveryUrl} target="_blank" rel="noreferrer" onClick={() => markChecked(shop.id)}><span>納期</span><b>お届け日を見る ↗</b></a>
                    <a href={shop.shopUrl} target="_blank" rel="noreferrer" onClick={() => markChecked(shop.id)}><span>店舗</span><b>ショップを見る ↗</b></a>
                  </div>

                  <div className={styles.countBox}>
                    <label>
                      <span>今回の商品点数</span>
                      <input
                        value={countDraft}
                        onChange={(event) => setCountDrafts((current) => ({ ...current, [shop.id]: event.target.value.replace(/[^\d,]/g, '') }))}
                        placeholder="例：3842"
                        inputMode="numeric"
                      />
                    </label>
                    <button type="button" onClick={() => recordCount(shop)}>点数を記録</button>
                  </div>

                  <div className={styles.cardFooter}>
                    <span>sid: {shop.shopId}</span>
                    <button type="button" onClick={() => copyLink(`${shop.id}:new`, shop.newItemsUrl)}>
                      {copied === `${shop.id}:new` ? 'コピーしました' : '新着URLをコピー'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className={styles.noteSection}>
        <div>
          <span>HOW TO USE</span>
          <h2>毎週3分で、競合の動きを見る。</h2>
        </div>
        <ol>
          <li><b>01</b><span>「全商品」で現在の商品点数を確認して記録。</span></li>
          <li><b>02</b><span>「新商品」で直近の追加・更新商品を見る。</span></li>
          <li><b>03</b><span>「納期」で配送スピードや最短お届け日を確認。</span></li>
        </ol>
      </section>

      <footer className={styles.footer}>
        <div><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p></div>
        <p>楽天市場の公開ページへの確認導線を提供する独立サービスです。楽天グループ株式会社との提携・承認・後援関係はありません。</p>
      </footer>
    </main>
  )
}
