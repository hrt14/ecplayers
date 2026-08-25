'use client'

import { useMemo, useState } from 'react'
import styles from './ReviewCostCalculator.module.css'

const yen = (value: number) => new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
}).format(Number.isFinite(value) ? value : 0)

const number = (value: string) => Math.max(0, Number(value) || 0)

export default function ReviewCostCalculator() {
  const [orders, setOrders] = useState('1000')
  const [reviews, setReviews] = useState('100')
  const [couponAmount, setCouponAmount] = useState('500')
  const [couponUses, setCouponUses] = useState('50')
  const [fixedCost, setFixedCost] = useState('10000')
  const [otherCost, setOtherCost] = useState('0')
  const [targetReviews, setTargetReviews] = useState('100')

  const result = useMemo(() => {
    const orderCount = number(orders)
    const reviewCount = number(reviews)
    const couponUnit = number(couponAmount)
    const usedCount = number(couponUses)
    const fixed = number(fixedCost)
    const other = number(otherCost)
    const target = number(targetReviews)

    const couponCost = couponUnit * usedCount
    const totalCost = couponCost + fixed + other
    const costPerReview = reviewCount > 0 ? totalCost / reviewCount : 0
    const reviewRate = orderCount > 0 ? (reviewCount / orderCount) * 100 : 0
    const targetBudget = costPerReview * target

    return { couponCost, totalCost, costPerReview, reviewRate, targetBudget }
  }, [orders, reviews, couponAmount, couponUses, fixedCost, otherCost, targetReviews])

  const reset = () => {
    setOrders('')
    setReviews('')
    setCouponAmount('')
    setCouponUses('')
    setFixedCost('')
    setOtherCost('')
    setTargetReviews('100')
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>← アプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>FREE EC CALCULATOR</span>
        <h1>レビュー1件、<br /><em>実際いくら？</em></h1>
        <p>らくらくーぽん施策の実コストを入れるだけ。クーポンの「発行額」ではなく、実際に使われた分と固定費を含めて、レビュー1件あたりの獲得コストを計算します。</p>
      </section>

      <section className={styles.workspace}>
        <div className={styles.formCard}>
          <div className={styles.cardHead}>
            <div><span>INPUT</span><h2>数字を入れる</h2></div>
            <button type="button" onClick={reset}>クリア</button>
          </div>

          <div className={styles.fields}>
            <label>
              <span>対象注文件数 <small>レビュー率の計算用</small></span>
              <div className={styles.inputWrap}><input inputMode="numeric" value={orders} onChange={(e) => setOrders(e.target.value)} placeholder="1000" /><b>件</b></div>
            </label>
            <label>
              <span>獲得レビュー件数</span>
              <div className={styles.inputWrap}><input inputMode="numeric" value={reviews} onChange={(e) => setReviews(e.target.value)} placeholder="100" /><b>件</b></div>
            </label>
            <label>
              <span>クーポン金額</span>
              <div className={styles.inputWrap}><input inputMode="numeric" value={couponAmount} onChange={(e) => setCouponAmount(e.target.value)} placeholder="500" /><b>円</b></div>
            </label>
            <label>
              <span>実際に使われたクーポン枚数</span>
              <div className={styles.inputWrap}><input inputMode="numeric" value={couponUses} onChange={(e) => setCouponUses(e.target.value)} placeholder="50" /><b>枚</b></div>
            </label>
            <label>
              <span>月額・固定費</span>
              <div className={styles.inputWrap}><input inputMode="numeric" value={fixedCost} onChange={(e) => setFixedCost(e.target.value)} placeholder="10000" /><b>円</b></div>
            </label>
            <label>
              <span>その他費用</span>
              <div className={styles.inputWrap}><input inputMode="numeric" value={otherCost} onChange={(e) => setOtherCost(e.target.value)} placeholder="0" /><b>円</b></div>
            </label>
          </div>

          <div className={styles.formula}>
            <span>計算式</span>
            <strong>（クーポン金額 × 利用枚数 ＋ 固定費 ＋ その他費用）÷ レビュー件数</strong>
          </div>
        </div>

        <div className={styles.resultCard}>
          <div className={styles.resultLabel}>REVIEW COST</div>
          <p>あなたのお店は、レビュー1件を</p>
          <div className={styles.bigNumber}>{reviews && number(reviews) > 0 ? yen(result.costPerReview) : '—'}<small>/件</small></div>
          <div className={styles.metrics}>
            <div><span>レビュー率</span><b>{orders && number(orders) > 0 ? `${result.reviewRate.toFixed(1)}%` : '—'}</b></div>
            <div><span>クーポン実コスト</span><b>{yen(result.couponCost)}</b></div>
            <div><span>施策総コスト</span><b>{yen(result.totalCost)}</b></div>
          </div>

          <div className={styles.targetBox}>
            <label>
              <span>あと何件レビューを増やしたい？</span>
              <div><input inputMode="numeric" value={targetReviews} onChange={(e) => setTargetReviews(e.target.value)} /><b>件</b></div>
            </label>
            <p>今と同じ獲得単価なら必要予算は</p>
            <strong>{reviews && number(reviews) > 0 ? yen(result.targetBudget) : '—'}</strong>
          </div>
        </div>
      </section>

      <section className={styles.notes}>
        <article><b>01</b><h3>発行額ではなく実利用額</h3><p>500円クーポンを100枚配っても、20枚しか使われなければ実コストは10,000円として計算します。</p></article>
        <article><b>02</b><h3>固定費も含める</h3><p>レビュー施策のために発生している月額費用や運用費があれば入れると、実態に近い獲得単価になります。</p></article>
        <article><b>03</b><h3>前月と比較する</h3><p>レビュー件数だけでなく、1件あたりの獲得単価が改善しているかを見ると施策効率を判断しやすくなります。</p></article>
      </section>

      <footer className={styles.footer}>
        <p>本ツールはECplayersが提供する非公式の計算補助ツールです。外部サービス提供元による公式ツールではありません。</p>
        <a href="/">ECplayers トップへ →</a>
      </footer>
    </main>
  )
}
