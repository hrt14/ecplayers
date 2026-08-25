'use client'

import { useMemo, useState } from 'react'
import styles from './AmazonMargin.module.css'

type FieldKey =
  | 'price'
  | 'productCost'
  | 'referralFee'
  | 'fbaFee'
  | 'inboundCost'
  | 'couponCost'
  | 'otherCost'
  | 'monthlySales'
  | 'adSpend'

type FormState = Record<FieldKey, string>

const initialForm: FormState = {
  price: '5000',
  productCost: '1800',
  referralFee: '750',
  fbaFee: '500',
  inboundCost: '150',
  couponCost: '0',
  otherCost: '0',
  monthlySales: '1000000',
  adSpend: '120000',
}

const emptyForm: FormState = {
  price: '',
  productCost: '',
  referralFee: '',
  fbaFee: '',
  inboundCost: '',
  couponCost: '',
  otherCost: '',
  monthlySales: '',
  adSpend: '',
}

const money = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
})

function percent(value: number | null, digits = 1) {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(digits)}%`
}

function roas(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(2)}x`
}

function CurrencyField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        <b>{label}</b>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className={styles.inputWrap}>
        <span>¥</span>
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
        />
      </span>
    </label>
  )
}

export default function Calculator() {
  const [form, setForm] = useState<FormState>(initialForm)

  const result = useMemo(() => {
    const numberOf = (key: FieldKey) => {
      const value = Number(form[key])
      return Number.isFinite(value) && value > 0 ? value : 0
    }

    const price = numberOf('price')
    const variableCost =
      numberOf('productCost') +
      numberOf('referralFee') +
      numberOf('fbaFee') +
      numberOf('inboundCost') +
      numberOf('couponCost') +
      numberOf('otherCost')

    const contribution = price - variableCost
    const valid = price > 0 && contribution > 0
    const marginRate = price > 0 ? contribution / price : null
    const breakEvenRoas = valid ? price / contribution : null
    const limitRate = valid && marginRate !== null ? marginRate * 100 : null

    const monthlySales = numberOf('monthlySales')
    const adSpend = numberOf('adSpend')
    const currentTacos = monthlySales > 0 ? (adSpend / monthlySales) * 100 : null
    const monthlyBeforeAds = valid && marginRate !== null ? monthlySales * marginRate : null
    const monthlyAfterAds = monthlyBeforeAds !== null ? monthlyBeforeAds - adSpend : null
    const adHeadroom = monthlyBeforeAds !== null ? monthlyBeforeAds - adSpend : null
    const tacosGap = limitRate !== null && currentTacos !== null ? limitRate - currentTacos : null

    let status = '入力すると判定します'
    let statusTone: 'neutral' | 'good' | 'bad' = 'neutral'

    if (price > 0 && contribution <= 0) {
      status = '広告を出す前から限界利益がマイナスです'
      statusTone = 'bad'
    } else if (valid && currentTacos !== null && limitRate !== null) {
      if (currentTacos > limitRate) {
        status = '現在TACOSは損益分岐を超えています'
        statusTone = 'bad'
      } else {
        status = '現在TACOSは損益分岐の範囲内です'
        statusTone = 'good'
      }
    } else if (valid) {
      status = '商品単体の損益分岐を計算できました'
      statusTone = 'good'
    }

    return {
      price,
      variableCost,
      contribution,
      valid,
      marginRate,
      breakEvenRoas,
      limitRate,
      currentTacos,
      monthlyBeforeAds,
      monthlyAfterAds,
      adHeadroom,
      tacosGap,
      status,
      statusTone,
    }
  }, [form])

  const update = (key: FieldKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav className={styles.nav}>
          <a href="/#apps">アプリ一覧</a>
          <a href="/trademarks">第三者商標</a>
          <a href="/">トップへ戻る</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>AMAZON / CONTRIBUTION MARGIN</span>
          <h1>Amazon<br /><em>限界利益計算機</em></h1>
          <p>この商品は、広告をどこまで回せるのか。1個売れたときの限界利益から、限界ROAS・限界ACOS・限界TACOSをまとめて計算します。</p>
        </div>
        <div className={styles.heroFormula}>
          <span>BREAK-EVEN</span>
          <b>限界ROAS = 売価 ÷ 広告前限界利益</b>
          <small>限界ACOS / 限界TACOS = 広告前限界利益率</small>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.inputPanel}>
          <div className={styles.panelHead}>
            <div>
              <span>STEP 1</span>
              <h2>1個売れたときの数字</h2>
              <p>すべて税込、またはすべて税抜など、同じ基準で入力してください。</p>
            </div>
            <div className={styles.panelActions}>
              <button type="button" onClick={() => setForm(initialForm)}>サンプル</button>
              <button type="button" onClick={() => setForm(emptyForm)}>クリア</button>
            </div>
          </div>

          <div className={styles.fields}>
            <CurrencyField label="販売価格" hint="商品1個の売価" value={form.price} onChange={(value) => update('price', value)} />
            <CurrencyField label="商品原価" hint="仕入・製造原価" value={form.productCost} onChange={(value) => update('productCost', value)} />
            <CurrencyField label="販売手数料" hint="Amazon販売手数料など" value={form.referralFee} onChange={(value) => update('referralFee', value)} />
            <CurrencyField label="FBA配送代行手数料" value={form.fbaFee} onChange={(value) => update('fbaFee', value)} />
            <CurrencyField label="FBA納品・入庫関連費" hint="1個あたりに按分" value={form.inboundCost} onChange={(value) => update('inboundCost', value)} />
            <CurrencyField label="クーポン・値引き等" hint="1注文あたりの変動費" value={form.couponCost} onChange={(value) => update('couponCost', value)} />
            <CurrencyField label="その他変動費" value={form.otherCost} onChange={(value) => update('otherCost', value)} />
          </div>

          <div className={styles.costSummary}>
            <div><span>変動費合計</span><b>{money.format(result.variableCost)}</b></div>
            <div className={result.contribution >= 0 ? styles.positive : styles.negative}>
              <span>広告前限界利益 / 個</span>
              <b>{money.format(result.contribution)}</b>
            </div>
            <div><span>広告前限界利益率</span><b>{result.marginRate === null ? '—' : percent(result.marginRate * 100)}</b></div>
          </div>
        </div>

        <aside className={styles.resultPanel}>
          <div className={`${styles.status} ${styles[result.statusTone]}`}>{result.status}</div>
          <span className={styles.resultLabel}>BREAK-EVEN ROAS</span>
          <div className={styles.heroNumber}>{roas(result.breakEvenRoas)}</div>
          <p className={styles.resultLead}>これを下回るROASでは、広告起因の注文単体は限界利益ベースで赤字になります。</p>

          <div className={styles.resultGrid}>
            <div><span>限界ACOS</span><b>{percent(result.limitRate)}</b><small>広告売上に対する損益分岐</small></div>
            <div><span>限界TACOS</span><b>{percent(result.limitRate)}</b><small>総売上に対する損益分岐</small></div>
          </div>

          <div className={styles.equation}>
            <span>計算式</span>
            <code>限界利益 = 売価 − 広告以外の変動費</code>
            <code>限界ROAS = 売価 ÷ 限界利益</code>
            <code>限界TACOS = 限界利益 ÷ 売価</code>
          </div>
        </aside>
      </section>

      <section className={styles.monthly}>
        <div className={styles.monthlyIntro}>
          <span className={styles.eyebrow}>STEP 2 / OPTIONAL</span>
          <h2>今の広告費は、<br />どこまで余裕がある？</h2>
          <p>月商と広告費を入れると、現在TACOSと損益分岐までの残り広告費を表示します。</p>
        </div>

        <div className={styles.monthlyInputs}>
          <CurrencyField label="月間総売上" hint="広告売上ではなく総売上" value={form.monthlySales} onChange={(value) => update('monthlySales', value)} />
          <CurrencyField label="月間広告費" value={form.adSpend} onChange={(value) => update('adSpend', value)} />
        </div>

        <div className={styles.monthlyResults}>
          <article>
            <span>現在TACOS</span>
            <b>{percent(result.currentTacos)}</b>
            <small>広告費 ÷ 総売上</small>
          </article>
          <article>
            <span>限界までの差</span>
            <b>{result.tacosGap === null ? '—' : `${result.tacosGap >= 0 ? '+' : ''}${result.tacosGap.toFixed(1)}pt`}</b>
            <small>限界TACOS − 現在TACOS</small>
          </article>
          <article>
            <span>限界までの広告費</span>
            <b>{result.adHeadroom === null ? '—' : money.format(result.adHeadroom)}</b>
            <small>現在の月商を固定した場合</small>
          </article>
          <article className={result.monthlyAfterAds !== null && result.monthlyAfterAds < 0 ? styles.warningCard : ''}>
            <span>広告後限界利益</span>
            <b>{result.monthlyAfterAds === null ? '—' : money.format(result.monthlyAfterAds)}</b>
            <small>月商 × 限界利益率 − 広告費</small>
          </article>
        </div>
      </section>

      <section className={styles.notes}>
        <div>
          <span className={styles.eyebrow}>HOW TO READ</span>
          <h2>「限界」は、<br />利益ゼロの線。</h2>
        </div>
        <div className={styles.noteList}>
          <p><b>限界ROAS</b>は、広告経由の注文が限界利益ベースで赤字にならない最低ROASです。</p>
          <p><b>限界ACOS</b>は、その逆数にあたる損益分岐ACOSです。</p>
          <p><b>限界TACOS</b>は、本ツールでは「広告前限界利益率」を総売上に対する広告費の上限として扱います。月間結果は、入力した商品と同じ限界利益率で売上が構成される前提の簡易試算です。</p>
          <p><b>固定費・返品・保管料・長期在庫費用・税金など</b>は自動では入りません。1個売れるたびに増える費用は「その他変動費」に含めてください。</p>
        </div>
      </section>

      <section className={styles.sourceSection}>
        <span>REFERENCE</span>
        <p>ROAS・ACOSの定義はAmazon Ads公式の計算式に基づきます。限界ROAS / 限界TACOSは、その定義に商品ごとの広告前限界利益率を組み合わせた本ツールの損益分岐計算です。</p>
        <div>
          <a href="https://advertising.amazon.com/ja-jp/library/guides/acos-advertising-cost-of-sales" target="_blank" rel="noreferrer">Amazon Ads：ACOSとは？ ↗</a>
          <a href="https://advertising.amazon.com/ja-jp/library/guides/return-on-ad-spend-roas" target="_blank" rel="noreferrer">Amazon Ads：ROASとは？ ↗</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECの面倒を、アプリにする。</p></div>
        <nav><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><a href="/trademarks">第三者商標</a></nav>
        <small>AmazonはAmazon.com, Inc.またはその関連会社の商標です。ECplayersはAmazonとの提携・承認関係にはありません。</small>
      </footer>
    </main>
  )
}
