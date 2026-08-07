'use client'

import { FormEvent, useEffect, useState } from 'react'
import styles from './amazon-ai.module.css'

type FormState = {
  email: string
  role: string
  products: string
  priceIntent: string
  note: string
  company: string
  website: string
}

const initialForm: FormState = {
  email: '',
  role: '',
  products: '',
  priceIntent: '',
  note: '',
  company: '',
  website: '',
}

const scoreRows = [
  ['総合', 68, 84, 76],
  ['ファーストビュー', 55, 88, 72],
  ['商品画像', 72, 84, 76],
  ['訴求', 61, 91, 70],
  ['レビュー整合性', 78, 74, 82],
]

export default function AmazonAiLanding() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [utm, setUtm] = useState<Record<string, string>>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUtm({
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      referrer: document.referrer || '',
    })
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...utm, source: 'amazon-ai-lp' }),
      })

      if (!response.ok) throw new Error('waitlist request failed')
      setStatus('done')
      setForm(initialForm)
    } catch {
      setStatus('error')
    }
  }

  const scrollToForm = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">ECplayers</a>
        <button className={styles.headerCta} onClick={scrollToForm}>無料で先行登録</button>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Amazon商品ページ競合分析AI — 開発中</p>
          <h1>Amazonで競合に<br />負けている理由、<br /><span>AIが見つけます。</span></h1>
          <p className={styles.lead}>
            自社商品と競合商品を開くだけ。スマホページ・商品画像・レビューを横並びで比較し、
            「どこで負けているか」と「次に何を直すか」まで提案します。
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryCta} onClick={scrollToForm}>β版を無料で先行利用する</button>
            <span>クレジットカード不要</span>
          </div>
        </div>

        <div className={styles.demoCard} aria-label="競合比較画面のイメージ">
          <div className={styles.demoTopbar}>
            <div><b>競合比較</b><span>Amazon / スマホ表示</span></div>
            <span className={styles.aiBadge}>AI ANALYSIS</span>
          </div>
          <div className={styles.phoneGrid}>
            {[
              ['自社商品', '68'],
              ['競合A', '84'],
              ['競合B', '76'],
            ].map(([name, score], index) => (
              <div className={styles.phoneCol} key={name}>
                <div className={styles.phoneLabel}><span>{name}</span><strong>{score}</strong></div>
                <div className={styles.phone}>
                  <div className={styles.phoneBar} />
                  <div className={styles.fakeHero} data-variant={index} />
                  <div className={styles.fakeTextLg} />
                  <div className={styles.fakeStars}>★★★★★</div>
                  <div className={styles.fakeText} />
                  <div className={styles.fakeTextShort} />
                  <div className={styles.fakeImage} />
                  <div className={styles.fakeText} />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.insightBox}>
            <b>AIが見つけた最大の差</b>
            <p>競合Aは2枚目までに「誰に・何が便利か」が伝わる一方、自社は機能説明から始まりメリット理解が遅れています。</p>
          </div>
        </div>
      </section>

      <section className={styles.problemSection}>
        <p className={styles.sectionEyebrow}>MANUAL WORK → AI</p>
        <h2>競合分析、まだ<br className={styles.mobileOnly} />人力でやっていませんか？</h2>
        <div className={styles.problemGrid}>
          {[
            ['01', 'スマホで競合を何商品も開く', '商品ごとにスクショを撮り、行ったり来たりしながら比較。'],
            ['02', '商品画像を1枚ずつ見比べる', '訴求・順番・不足情報を担当者の経験だけで判断。'],
            ['03', 'レビューを何ページも読む', '数十〜数百件を読み、不満や購入理由を手作業で集計。'],
            ['04', '最後に資料へまとめ直す', '分析より、スクショ整理と資料化に時間が消える。'],
          ].map(([num, title, text]) => (
            <article className={styles.problemCard} key={num}>
              <span>{num}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionEyebrow}>ONE CLICK COMPETITIVE INTELLIGENCE</p>
          <h2>見るだけで終わらない。<br />直すところまで。</h2>
        </div>
        <div className={styles.featureGrid}>
          {[
            ['スマホ画面を横並び比較', '自社・競合のスマホページを同じ視点で並べ、ファーストビューや情報順序の差を見える化。'],
            ['商品画像をAIで比較', '各画像の役割、重複訴求、不足している説明、競合だけが伝えている価値を抽出。'],
            ['レビューの評価・不満を整理', '高評価理由、低評価理由、購入動機、改善要求をテーマ別にまとめて商品ページと照合。'],
            ['改善後の画像構成まで提案', '「画像2枚目をこう変える」まで具体化し、7枚構成・コピー・制作指示へ落とし込み。'],
          ].map(([title, text], index) => (
            <article className={styles.featureCard} key={title}>
              <div className={styles.featureIcon}>{index + 1}</div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.scoreSection}>
        <div className={styles.scoreCopy}>
          <p className={styles.sectionEyebrow}>SAMPLE REPORT</p>
          <h2>「なんとなく競合の方が良い」を、数字と言葉に。</h2>
          <p>商品ページを総合点だけで評価せず、ファーストビュー、画像、訴求、レビューとの整合性まで分解。改善優先度を明確にします。</p>
          <div className={styles.callout}>
            <span>最優先の改善</span>
            <b>機能説明より先に、利用メリットを見せる</b>
          </div>
        </div>
        <div className={styles.scoreTable}>
          <div className={styles.scoreHead}><span>評価項目</span><b>自社</b><b>競合A</b><b>競合B</b></div>
          {scoreRows.map(([label, self, a, b]) => (
            <div className={styles.scoreRow} key={String(label)}>
              <span>{label}</span><b>{self}</b><b className={styles.best}>{a}</b><b>{b}</b>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.audienceSection}>
        <p className={styles.sectionEyebrow}>FOR EC PROFESSIONALS</p>
        <h2>Amazonを仕事にする人ほど、<br />使う回数が増える。</h2>
        <div className={styles.audienceGrid}>
          {['Amazonセラー・メーカー', 'ECコンサル', 'Amazon運用代行', '商品画像制作会社'].map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
        <p className={styles.audienceNote}>分析レポートは顧客への提案・営業資料として共有できる機能を予定しています。</p>
      </section>

      <section className={styles.waitlistSection} id="waitlist">
        <div className={styles.waitlistCopy}>
          <p className={styles.sectionEyebrow}>EARLY ACCESS</p>
          <h2>β版を無料で<br />先行利用しませんか？</h2>
          <p>現在は開発前の需要検証フェーズです。登録者にはβ版公開時に優先してご案内します。</p>
          <ul>
            <li>初期β版は無料で案内予定</li>
            <li>EC実務者の意見を優先して開発</li>
            <li>不要な営業メールは送りません</li>
          </ul>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label>メールアドレス<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
          <label>会社名・屋号（任意）<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="株式会社○○" /></label>
          <label>あなたの立場<select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="">選択してください</option><option>Amazonセラー・メーカー</option><option>ECコンサル</option><option>Amazon運用代行</option><option>商品画像・LP制作</option><option>その他EC支援</option></select></label>
          <label>月に扱うAmazon商品数<select required value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })}><option value="">選択してください</option><option>1〜5商品</option><option>6〜20商品</option><option>21〜50商品</option><option>51〜100商品</option><option>101商品以上</option></select></label>
          <fieldset>
            <legend>月額9,800円で競合比較・画像分析まで使える場合</legend>
            {['ぜひ使いたい', '内容次第で検討したい', '無料なら使いたい', '使わない'].map((value) => (
              <label className={styles.radio} key={value}><input required type="radio" name="priceIntent" value={value} checked={form.priceIntent === value} onChange={(e) => setForm({ ...form, priceIntent: e.target.value })} />{value}</label>
            ))}
          </fieldset>
          <label>欲しい機能・困っていること（任意）<textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="例：競合レビューを読むのに毎回時間がかかる" /></label>
          <input className={styles.honeypot} tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} aria-hidden="true" />
          <button className={styles.formButton} disabled={status === 'sending'}>{status === 'sending' ? '登録中…' : 'β版に無料で先行登録する'}</button>
          {status === 'done' && <p className={styles.success}>登録しました。β版公開時にご案内します。</p>}
          {status === 'error' && <p className={styles.error}>登録できませんでした。時間をおいてもう一度お試しください。</p>}
          <small>登録情報はβ版案内と需要検証のためにのみ使用します。</small>
        </form>
      </section>

      <footer className={styles.footer}>
        <a href="/">ECplayers</a><span>Amazon競合分析AI — Early Access</span>
      </footer>
    </main>
  )
}
