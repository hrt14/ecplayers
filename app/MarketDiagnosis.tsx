'use client'

import { useMemo, useState } from 'react'

type Mode = 'player' | 'company'

const skills = [
  ['楽天市場', 1.12], ['Amazon', 1.12], ['Shopify', 1.10], ['広告運用', 1.16],
  ['CRM / LTV改善', 1.14], ['SEO / 商品ページ改善', 1.08], ['デザイン / LP', 1.03],
  ['物流 / 在庫改善', 1.05], ['商品企画', 1.08], ['EC責任者 / 戦略', 1.25],
] as const

const experience = [
  ['1年未満', 0.72], ['1〜3年', 0.86], ['3〜5年', 1.00], ['5〜10年', 1.16], ['10年以上', 1.32],
] as const

const workTypes = [
  ['スポット相談', 1.18], ['月10時間程度', 0.95], ['月20時間程度', 1.00], ['月40時間程度', 0.96], ['運営をまとめて任せたい', 1.12],
] as const

export default function MarketDiagnosis() {
  const [mode, setMode] = useState<Mode>('player')
  const [skill, setSkill] = useState('楽天市場')
  const [exp, setExp] = useState('3〜5年')
  const [work, setWork] = useState('月20時間程度')

  const result = useMemo(() => {
    const skillRate = skills.find(([s]) => s === skill)?.[1] ?? 1
    const expRate = experience.find(([s]) => s === exp)?.[1] ?? 1
    const workRate = workTypes.find(([s]) => s === work)?.[1] ?? 1
    const hours = work === 'スポット相談' ? 3 : work === '月10時間程度' ? 10 : work === '月40時間程度' ? 40 : work === '運営をまとめて任せたい' ? 60 : 20
    const baseHourly = 8500
    const mid = Math.round((baseHourly * skillRate * expRate * workRate * hours) / 10000)
    const low = Math.max(3, Math.round(mid * 0.78))
    const high = Math.max(low + 2, Math.round(mid * 1.28))
    const hourly = Math.round((baseHourly * skillRate * expRate * workRate) / 500) * 500
    return { low, high, hourly, hours }
  }, [skill, exp, work])

  return (
    <section className="diagnosisSection" id="diagnosis">
      <div className="diagnosisIntro">
        <span>EC REWARD CHECK</span>
        <h2>{mode === 'player' ? 'あなたのECスキル、\nいくらくらい？' : 'この仕事、\nいくらで頼むのが妥当？'}</h2>
        <p>スキル・経験・お願いしたい稼働量から、EC業務の報酬目安を簡単にチェックできます。</p>
        <div className="diagnosisTabs">
          <button className={mode === 'player' ? 'active' : ''} onClick={() => setMode('player')}>プレイヤー向け</button>
          <button className={mode === 'company' ? 'active' : ''} onClick={() => setMode('company')}>企業向け</button>
        </div>
      </div>

      <div className="diagnosisCard">
        <label><span>1. {mode === 'player' ? '得意なスキル' : '依頼したいスキル'}</span><select value={skill} onChange={e => setSkill(e.target.value)}>{skills.map(([name]) => <option key={name}>{name}</option>)}</select></label>
        <label><span>2. {mode === 'player' ? '経験年数' : '求める経験年数'}</span><select value={exp} onChange={e => setExp(e.target.value)}>{experience.map(([name]) => <option key={name}>{name}</option>)}</select></label>
        <label><span>3. {mode === 'player' ? '希望する働き方' : 'お願いしたい稼働量'}</span><select value={work} onChange={e => setWork(e.target.value)}>{workTypes.map(([name]) => <option key={name}>{name}</option>)}</select></label>

        <div className="diagnosisResult">
          <small>{mode === 'player' ? 'あなたの報酬目安' : '企業側の予算目安'}</small>
          <strong>月 {result.low}〜{result.high}<b>万円</b></strong>
          <div><span>参考時間単価</span><b>約 {result.hourly.toLocaleString()}円 / 時間</b></div>
          <p>{skill} × {exp} × {work} の簡易診断結果です。</p>
        </div>
        <div className="diagnosisNote">※ 現時点では一般的なEC業務の難易度・経験年数・稼働量をもとにした参考値です。登録データが蓄積された後は、ECplayers内の実際の募集・希望報酬データを反映する予定です。</div>
      </div>
    </section>
  )
}
