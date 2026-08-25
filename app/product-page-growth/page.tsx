'use client'

import { useMemo, useState } from 'react'
import styles from './ProductPageGrowth.module.css'

type Platform = 'rakuten' | 'amazon'

type Method = {
  id: string
  title: string
  summary: string
  examples: string[]
  addPerProduct: number
  rakutenNote: string
  amazonNote: string
}

const methods: Method[] = [
  {
    id: 'multipack',
    title: '複数個セット',
    summary: '同じ商品を2個・3個・5個などの買い方に広げる。',
    examples: ['2個セット', '3個セット', '5個セット'],
    addPerProduct: 3,
    rakutenNote: 'まとめ買い・ストック需要の入口を増やす。',
    amazonNote: '単なる複製ではなく、実際の入数が異なる商品として設計する。',
  },
  {
    id: 'bundle',
    title: '関連商品をセット化',
    summary: '一緒に使う商品を組み合わせ、別の購入目的を作る。',
    examples: ['本体＋消耗品', '商品A＋商品B', 'スターターセット'],
    addPerProduct: 2,
    rakutenNote: 'セット内容と使う場面が一目で分かる商品ページにする。',
    amazonNote: 'セットとして実体のある商品構成にし、最新のセット商品ルールを確認する。',
  },
  {
    id: 'purpose',
    title: '用途別に商品化',
    summary: '同じ商品群でも「誰が・何のために使うか」を変える。',
    examples: ['初心者向け', '旅行用', '法人向け'],
    addPerProduct: 2,
    rakutenNote: '用途キーワードと商品企画を一致させる。',
    amazonNote: 'タイトルだけを変えた重複商品は作らず、セット内容・数量など商品自体を変える。',
  },
  {
    id: 'trial',
    title: 'お試しサイズ',
    summary: '初回購入のハードルを下げる小容量・少量商品を作る。',
    examples: ['少量パック', '3種お試し', '初回向け'],
    addPerProduct: 1,
    rakutenNote: '新規顧客の入口商品として設計する。',
    amazonNote: '既存品と容量・内容が異なることが明確な商品として扱う。',
  },
  {
    id: 'bulk',
    title: '大容量・業務用',
    summary: '家庭用からまとめ買い・法人需要まで価格帯を広げる。',
    examples: ['10個入り', '30個入り', '業務用'],
    addPerProduct: 2,
    rakutenNote: '通常品とは異なる価格帯・顧客層を取りにいく。',
    amazonNote: '入数・容量の違いが商品情報で明確になるようにする。',
  },
  {
    id: 'accessory',
    title: '本体＋付属品',
    summary: '本体にケース・交換品・消耗品などを付けて選択肢を作る。',
    examples: ['本体＋ケース', '本体＋替え2個', '本体＋フルセット'],
    addPerProduct: 2,
    rakutenNote: '買った直後に必要なものをまとめる。',
    amazonNote: 'バリエーション関係に無理に入れず、正しい商品構成で登録する。',
  },
  {
    id: 'gift',
    title: 'ギフト化',
    summary: '包装・箱・組み合わせを変えて、贈る目的の商品を作る。',
    examples: ['誕生日', '母の日・父の日', 'お歳暮'],
    addPerProduct: 2,
    rakutenNote: '楽天のイベント需要と相性が良い。季節前に準備する。',
    amazonNote: '単なる商品名変更ではなく、包装やセット内容など商品価値を変える。',
  },
  {
    id: 'season',
    title: '季節・イベント商品',
    summary: '新生活・夏・帰省・年末など、使う時期を商品企画にする。',
    examples: ['新生活セット', '夏用セット', '年末まとめ買い'],
    addPerProduct: 2,
    rakutenNote: 'イベント検索が始まる前に商品を用意する。',
    amazonNote: '恒常商品のコピーではなく、内容や数量に季節企画としての違いを持たせる。',
  },
]

const platformCopy = {
  rakuten: {
    label: '楽天市場',
    badge: 'RAKUTEN',
    headline: '入口を増やす。ただし、買う理由も増やす。',
    caution: 'SKUにまとめるべき色・サイズまで機械的に分解しない。検索意図・用途・商品構成が変わるものを増やします。',
  },
  amazon: {
    label: 'Amazon',
    badge: 'AMAZON',
    headline: 'ASINを複製しない。商品構成を増やす。',
    caution: '同一商品の重複ASINを作るためのツールではありません。入数・容量・セット内容など、実体のある違いを作ることを前提にします。',
  },
}

export default function ProductPageGrowth() {
  const [platform, setPlatform] = useState<Platform>('rakuten')
  const [currentPages, setCurrentPages] = useState(100)
  const [targetProducts, setTargetProducts] = useState(10)
  const [selected, setSelected] = useState<string[]>(['multipack', 'bundle', 'purpose'])

  const selectedMethods = useMemo(
    () => methods.filter((method) => selected.includes(method.id)),
    [selected],
  )

  const candidateAdds = useMemo(
    () => selectedMethods.reduce((sum, method) => sum + method.addPerProduct, 0) * Math.max(0, targetProducts),
    [selectedMethods, targetProducts],
  )

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const reset = () => setSelected([])
  const chooseAll = () => setSelected(methods.map((method) => method.id))

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>← アプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>ECP / PRODUCT PAGE GROWTH</div>
        <h1>商品ページ、<br /><em>まだ増やせる。</em></h1>
        <p>楽天・Amazonで、既存商品から新しい「買う理由」を見つける実践マニュアル。ページをコピーするのではなく、数量・セット・用途・価格帯を広げます。</p>

        <div className={styles.platformTabs} role="tablist" aria-label="モールを選択">
          {(['rakuten', 'amazon'] as Platform[]).map((item) => (
            <button
              key={item}
              type="button"
              className={platform === item ? styles.activeTab : ''}
              onClick={() => setPlatform(item)}
            >
              <small>{platformCopy[item].badge}</small>
              <strong>{platformCopy[item].label}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.ruleBox}>
        <span>{platformCopy[platform].badge} RULE</span>
        <h2>{platformCopy[platform].headline}</h2>
        <p>{platformCopy[platform].caution}</p>
      </section>

      <section className={styles.calculator}>
        <div className={styles.sectionTitle}>
          <span>01 / QUICK ESTIMATE</span>
          <h2>まず、増やせる余地を見る。</h2>
          <p>売上上位の商品から、何種類の展開を作れそうかを粗く洗い出します。候補数は「作成確定数」ではなく、企画を考えるための目安です。</p>
        </div>

        <div className={styles.calcGrid}>
          <label>
            <span>現在の商品ページ数</span>
            <div><input type="number" min="0" value={currentPages} onChange={(e) => setCurrentPages(Number(e.target.value) || 0)} /><b>ページ</b></div>
          </label>
          <label>
            <span>まず見直す重点商品数</span>
            <div><input type="number" min="0" value={targetProducts} onChange={(e) => setTargetProducts(Number(e.target.value) || 0)} /><b>商品</b></div>
          </label>
          <div className={styles.resultCard}>
            <span>選択中の増やし方</span>
            <strong>{selected.length}<small>種類</small></strong>
          </div>
          <div className={styles.resultCard}>
            <span>商品化候補の粗い目安</span>
            <strong>+{candidateAdds}<small>候補</small></strong>
            <p>全部採用した場合のページ数イメージ：{currentPages + candidateAdds}</p>
          </div>
        </div>
      </section>

      <section className={styles.methodsSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            <span>02 / METHODS</span>
            <h2>増やし方を選ぶ。</h2>
            <p>商品を1つ見ながら、「これは作れる」をチェックしてください。</p>
          </div>
          <div className={styles.selectionActions}>
            <button type="button" onClick={chooseAll}>全部チェック</button>
            <button type="button" onClick={reset}>クリア</button>
          </div>
        </div>

        <div className={styles.methodGrid}>
          {methods.map((method, index) => {
            const checked = selected.includes(method.id)
            return (
              <button
                type="button"
                key={method.id}
                className={`${styles.methodCard} ${checked ? styles.checked : ''}`}
                onClick={() => toggle(method.id)}
                aria-pressed={checked}
              >
                <div className={styles.methodTop}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i>{checked ? '✓' : '+'}</i>
                </div>
                <h3>{method.title}</h3>
                <p>{method.summary}</p>
                <div className={styles.chips}>{method.examples.map((example) => <span key={example}>{example}</span>)}</div>
                <div className={styles.mallNote}>
                  <small>{platformCopy[platform].label}での考え方</small>
                  <b>{platform === 'rakuten' ? method.rakutenNote : method.amazonNote}</b>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className={styles.workflow}>
        <div className={styles.sectionTitle}>
          <span>03 / WORKFLOW</span>
          <h2>売上上位から、1商品ずつ。</h2>
        </div>
        <div className={styles.steps}>
          <article><b>1</b><h3>商品一覧を出す</h3><p>CSVなどで現在の商品を一覧化する。</p></article>
          <article><b>2</b><h3>売上上位から見る</h3><p>売れている商品ほど展開したときのインパクトを確認しやすい。</p></article>
          <article><b>3</b><h3>8つの方法を当てる</h3><p>数量・セット・用途・容量・ギフトなどを順番に検討する。</p></article>
          <article><b>4</b><h3>商品として成立させる</h3><p>タイトルだけでなく、内容・数量・包装・用途などに実体を持たせる。</p></article>
          <article><b>5</b><h3>公開後の数字を見る</h3><p>ページ数だけでなく、表示回数・アクセス・注文・売上まで追う。</p></article>
        </div>
      </section>

      <section className={styles.selectedPlan}>
        <div className={styles.sectionTitle}>
          <span>04 / YOUR PLAN</span>
          <h2>今回やること。</h2>
        </div>
        {selectedMethods.length ? (
          <div className={styles.planList}>
            {selectedMethods.map((method) => (
              <article key={method.id}>
                <span>TODO</span>
                <div><h3>{method.title}</h3><p>{method.examples.join(' / ')}</p></div>
                <b>重点{targetProducts}商品で確認</b>
              </article>
            ))}
          </div>
        ) : <div className={styles.empty}>上のカードから「作れそう」を1つ以上チェックしてください。</div>}
      </section>

      <section className={styles.kpi}>
        <span>MEASURE THIS</span>
        <h2>ページ数 → 表示回数 → アクセス → 注文 → 売上</h2>
        <p>ページが増えたこと自体を成功にしません。新しい入口が実際にアクセスと売上につながったかまで確認します。</p>
      </section>

      <section className={styles.lastWord}>
        <p>商品ページを増やすときの合言葉</p>
        <h2>同じページを増やすな。<br /><em>買う理由を増やせ。</em></h2>
      </section>

      <section className={styles.sources}>
        <h2>公式情報</h2>
        <p>モールの仕様・登録ルールは変更されるため、実際の登録前に最新の公式ヘルプを確認してください。</p>
        <div>
          <a href="https://www.rakuten.co.jp/ec/plan/" target="_blank" rel="noreferrer">楽天市場 出店プラン・商品登録数の案内 ↗</a>
          <a href="https://sell.amazon.co.jp/learn/seller-university" target="_blank" rel="noreferrer">Amazon 出品大学 ↗</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <p>ECの面倒を、アプリにする。</p>
      </footer>
    </main>
  )
}
