'use client'

import { useMemo, useState } from 'react'
import styles from './rakuten-margin.module.css'

type Inputs = {
  price: string
  cost: string
  shipping: string
  rakutenRate: string
  pointRate: string
  coupon: string
  other: string
  targetProfitRate: string
  actualRoas: string
}

const initialInputs: Inputs = {
  price: '',
  cost: '',
  shipping: '',
  rakutenRate: '',
  pointRate: '',
  coupon: '',
  other: '',
  targetProfitRate: '10',
  actualRoas: '',
}

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const pct = (value: number) => `${value.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}%`
const num = (value: string) => {
  const parsed = Number(value.replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export default function RakutenMarginPage() {
  const [inputs, setInputs] = useState<Inputs>(initialInputs)

  const result = useMemo(() => {
    const price = num(inputs.price)
    const cost = num(inputs.cost)
    const shipping = num(inputs.shipping)
    const rakutenRate = num(inputs.rakutenRate)
    const pointRate = num(inputs.pointRate)
    const coupon = num(inputs.coupon)
    const other = num(inputs.other)
    const targetProfitRate = num(inputs.targetProfitRate)
    const actualRoas = num(inputs.actualRoas)

    const rateCost = price * (rakutenRate + pointRate) / 100
    const contribution = price - cost - shipping - rateCost - coupon - other
    const contributionRate = price > 0 ? contribution / price * 100 : 0
    const breakEvenAdCost = Math.max(contribution, 0)
    const breakEvenRoas = contribution > 0 ? price / contribution * 100 : null
    const breakEvenAdRate = price > 0 ? breakEvenAdCost / price * 100 : 0

    const targetProfit = price * targetProfitRate / 100
    const targetAdCost = contribution - targetProfit
    const targetRoas = targetAdCost > 0 ? price / targetAdCost * 100 : null

    const actualAdCost = actualRoas > 0 ? price / (actualRoas / 100) : null
    const actualProfit = actualAdCost !== null ? contribution - actualAdCost : null
    const actualProfitRate = actualProfit !== null && price > 0 ? actualProfit / price * 100 : null

    let status: 'green' | 'yellow' | 'red' | 'none' = 'none'
    let statusText = '実績ROASを入れると判定します'
    if (actualRoas > 0 && breakEvenRoas !== null) {
      if (actualRoas < breakEvenRoas) {
        status = 'red'
        statusText = '赤字ゾーン'
      } else if (targetRoas !== null && actualRoas >= targetRoas) {
        status = 'green'
        statusText = '攻められる'
      } else {
        status = 'yellow'
        statusText = '利益は出るが目標未達'
      }
    }

    return {
      price,
      rateCost,
      contribution,
      contributionRate,
      breakEvenAdCost,
      breakEvenRoas,
      breakEvenAdRate,
      targetProfit,
      targetAdCost,
      targetRoas,
      actualAdCost,
      actualProfit,
      actualProfitRate,
      status,
      statusText,
    }
  }, [inputs])

  const setValue = (key: keyof Inputs, value: string) => setInputs(prev => ({ ...prev, [key]: value }))

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>← ECPアプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.badge}>FREE TOOL / RAKUTEN</span>
          <h1>楽天<br /><em>限界利益計算機</em></h1>
          <p>「この商品、広告費をどこまで使っていい？」を商品1個単位で即計算。限界ROAS、限界広告費率、目標利益を残すROASまで見えます。</p>
        </div>
        <div className={styles.formula}>
          <small>基本ロジック</small>
          <strong>売上 − 変動費 ＝ 広告前限界利益</strong>
          <span>広告前限界利益を超えて広告費を使うと、商品単位では赤字になります。</span>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.inputPanel}>
          <div className={styles.panelHead}>
            <div><span>STEP 1</span><h2>商品条件を入力</h2></div>
            <button onClick={() => setInputs(initialInputs)} type="button">クリア</button>
          </div>

          <div className={styles.fields}>
            <Field label="販売価格" unit="円" value={inputs.price} onChange={v => setValue('price', v)} placeholder="例：5,000" />
            <Field label="商品原価" unit="円" value={inputs.cost} onChange={v => setValue('cost', v)} placeholder="例：2,000" />
            <Field label="送料・出荷変動費" unit="円" value={inputs.shipping} onChange={v => setValue('shipping', v)} placeholder="例：600" />
            <Field label="楽天関連の売上連動費" unit="%" value={inputs.rakutenRate} onChange={v => setValue('rakutenRate', v)} placeholder="合計率を入力" note="システム利用料・決済等、売上に連動する自社負担分を合算" />
            <Field label="ポイント原資率" unit="%" value={inputs.pointRate} onChange={v => setValue('pointRate', v)} placeholder="例：1" />
            <Field label="クーポン店舗負担" unit="円" value={inputs.coupon} onChange={v => setValue('coupon', v)} placeholder="1注文あたり" />
            <Field label="その他変動費" unit="円" value={inputs.other} onChange={v => setValue('other', v)} placeholder="梱包・外注等" />
            <Field label="残したい利益率" unit="%" value={inputs.targetProfitRate} onChange={v => setValue('targetProfitRate', v)} placeholder="例：10" />
          </div>

          <div className={styles.actualBox}>
            <div><span>OPTION</span><strong>実績RPPのROASも判定する</strong><small>入力すると「攻める / 境界 / 赤字」を表示</small></div>
            <Field label="実績ROAS" unit="%" value={inputs.actualRoas} onChange={v => setValue('actualRoas', v)} placeholder="例：600" compact />
          </div>
        </div>

        <div className={styles.resultPanel}>
          <div className={styles.panelHead}><div><span>STEP 2</span><h2>広告の限界を見る</h2></div></div>

          {result.price <= 0 ? (
            <div className={styles.empty}>
              <b>¥</b>
              <strong>販売価格を入力すると計算します</strong>
              <p>料率は店舗・商品・施策ごとの実際の条件を入力してください。</p>
            </div>
          ) : (
            <>
              <div className={styles.primaryResult}>
                <small>広告前限界利益</small>
                <strong className={result.contribution >= 0 ? styles.positive : styles.negative}>{yen.format(result.contribution)}</strong>
                <span>限界利益率 {pct(result.contributionRate)}</span>
              </div>

              <div className={styles.metrics}>
                <Metric label="限界ROAS" value={result.breakEvenRoas !== null ? pct(result.breakEvenRoas) : '計算不可'} sub="これ未満は赤字" />
                <Metric label="限界広告費率" value={pct(result.breakEvenAdRate)} sub="売上に対して使える上限" />
                <Metric label="広告費上限 / 注文" value={yen.format(result.breakEvenAdCost)} sub="利益ゼロまで使える額" />
                <Metric label="目標ROAS" value={result.targetRoas !== null ? pct(result.targetRoas) : '設定不可'} sub={`${pct(num(inputs.targetProfitRate))}の利益を残す`} />
              </div>

              <div className={styles.breakdown}>
                <h3>1注文の内訳</h3>
                <Row label="売上" value={result.price} positive />
                <Row label="楽天関連費 + ポイント" value={-result.rateCost} />
                <Row label="広告前限界利益" value={result.contribution} strong />
                <Row label="目標利益" value={result.targetProfit} />
                <Row label="目標達成時に使える広告費" value={Math.max(result.targetAdCost, 0)} strong />
              </div>

              <div className={`${styles.status} ${styles[result.status]}`}>
                <span className={styles.dot} />
                <div><small>実績判定</small><strong>{result.statusText}</strong></div>
                {result.actualProfit !== null && <div className={styles.actualProfit}><small>広告後利益 / 注文</small><b>{yen.format(result.actualProfit)}</b>{result.actualProfitRate !== null && <span>{pct(result.actualProfitRate)}</span>}</div>}
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.guide}>
        <div><span>01</span><strong>限界ROAS</strong><p>利益がちょうど0円になるROAS。実績がこれを下回ると商品単位で赤字。</p></div>
        <div><span>02</span><strong>目標ROAS</strong><p>指定した利益率を残すために必要なROAS。広告を増減する基準に。</p></div>
        <div><span>03</span><strong>限界広告費率</strong><p>売上の何%まで広告費に回せるか。商品ごとの「攻められる幅」が見える。</p></div>
      </section>

      <section className={styles.note}>
        <strong>計算前提について</strong>
        <p>本ツールは入力値を使った簡易的な商品別採算シミュレーションです。楽天市場の料金・料率を固定値では持っていません。実際の請求条件、ポイント・クーポン負担、税務上の扱い等は店舗ごとに確認してください。</p>
        <p>本サービスは楽天グループ株式会社の公式サービスではありません。第三者商標については<a href="/trademarks">こちら</a>。</p>
      </section>
    </main>
  )
}

function Field({ label, unit, value, onChange, placeholder, note, compact = false }: { label: string; unit: string; value: string; onChange: (value: string) => void; placeholder?: string; note?: string; compact?: boolean }) {
  return (
    <label className={`${styles.field} ${compact ? styles.compact : ''}`}>
      <span>{label}</span>
      <div><input inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /><b>{unit}</b></div>
      {note && <small>{note}</small>}
    </label>
  )
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className={styles.metric}><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>
}

function Row({ label, value, strong = false, positive = false }: { label: string; value: number; strong?: boolean; positive?: boolean }) {
  return <div className={`${styles.row} ${strong ? styles.rowStrong : ''}`}><span>{label}</span><b className={positive ? styles.positive : value < 0 ? styles.negative : ''}>{value < 0 ? `−${yen.format(Math.abs(value))}` : yen.format(value)}</b></div>
}
