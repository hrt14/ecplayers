'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './GrowthFinder.module.css'

type Status = 'done' | 'todo' | 'unknown'
type Metric = '商品数' | 'セッション' | 'CVR' | '客単価' | 'リピート'

type CheckItem = {
  id: string
  category: string
  title: string
  description: string
  metric: Metric
  impact: 1 | 2 | 3 | 4 | 5
  hint: string
}

const groups: Array<[string, Array<Omit<CheckItem, 'category'>>]> = [
  ['商品数・品揃え', [
    { id: 'product-new', title: '新商品を定期的に追加している', description: '新しい検索入口と購入理由を継続的に増やす。', metric: '商品数', impact: 5, hint: '月1回でも新商品追加の型を作る' },
    { id: 'product-set', title: 'セット商品を作っている', description: '既存商品を組み合わせて別の商品ページを作る。', metric: '商品数', impact: 5, hint: '売れ筋2〜3商品からセット化' },
    { id: 'product-multi', title: '複数個セットを用意している', description: '2個・3個・まとめ買いなど購入量別の選択肢を作る。', metric: '商品数', impact: 4, hint: '単品の次に2個・3個セットを追加' },
    { id: 'product-size', title: '容量・サイズ違いを商品化している', description: '用途や予算に合わせて商品ページを増やす。', metric: '商品数', impact: 4, hint: '小容量・大容量の需要を確認' },
    { id: 'product-variation', title: 'バリエーションを適切に分けている', description: '検索需要が別なら独立ページ化も検討する。', metric: '商品数', impact: 4, hint: '色・用途・型番ごとに検索需要を確認' },
    { id: 'product-entry', title: 'お試し・入口商品がある', description: '初回購入の心理的ハードルを下げる商品を持つ。', metric: 'CVR', impact: 4, hint: '低価格・小容量のお試し商品を検討' },
  ]],
  ['検索・SEO', [
    { id: 'seo-title', title: '商品名に主要検索語を入れている', description: 'ユーザーが実際に探す言葉を商品名へ反映する。', metric: 'セッション', impact: 5, hint: '上位検索語と自社商品名を比較' },
    { id: 'seo-keyword', title: '検索語句を定期的に見直している', description: '検索トレンドや売れ筋変化を商品ページへ反映する。', metric: 'セッション', impact: 4, hint: '月1回、流入検索語を棚卸し' },
    { id: 'seo-category', title: 'カテゴリ登録を最適化している', description: '適切なカテゴリに露出しているか確認する。', metric: 'セッション', impact: 4, hint: '競合上位商品のカテゴリを確認' },
    { id: 'seo-longtail', title: 'ロングテール商品ページがある', description: '用途・悩み・対象者別に検索入口を増やす。', metric: 'セッション', impact: 4, hint: '用途別・対象者別ページを追加' },
    { id: 'seo-season', title: '季節検索に合わせて更新している', description: '季節需要の前にタイトルや特集を整える。', metric: 'セッション', impact: 3, hint: '需要期の4〜8週前に準備' },
    { id: 'seo-ranking', title: '検索順位を追っている', description: '主要語の順位低下を早く発見する。', metric: 'セッション', impact: 3, hint: '重要語だけでも週次記録' },
  ]],
  ['広告', [
    { id: 'ads-running', title: '主要商品の広告を出している', description: '自然流入だけに頼らず売れる商品の露出を増やす。', metric: 'セッション', impact: 5, hint: 'まず売れ筋から広告を開始' },
    { id: 'ads-profit', title: '限界ROAS・TACOSを把握している', description: '利益を残せる広告ラインを数字で持つ。', metric: 'CVR', impact: 5, hint: '粗利と広告費から許容値を算出' },
    { id: 'ads-searchterm', title: '検索語句を見て除外している', description: '成果の薄い出稿を止めて原資を作る。', metric: 'CVR', impact: 4, hint: '一定クリック・無注文語を確認' },
    { id: 'ads-brand', title: 'ブランド防御広告を検討している', description: '指名検索を競合に奪われないよう守る。', metric: 'CVR', impact: 3, hint: '自社ブランド名の検索結果を確認' },
    { id: 'ads-budget', title: '予算不足で機会損失していない', description: '成果が良い広告が予算切れしていないか確認する。', metric: 'セッション', impact: 4, hint: '好調キャンペーンの予算消化率を見る' },
    { id: 'ads-creative', title: '広告クリエイティブを改善している', description: '画像・見出し・訴求を定期的にテストする。', metric: 'CVR', impact: 3, hint: '勝ちクリエイティブを残す運用にする' },
  ]],
  ['商品ページ・LP', [
    { id: 'lp-firstview', title: 'ファーストビューで価値が伝わる', description: '誰向けで何が良い商品か数秒で理解できる。', metric: 'CVR', impact: 5, hint: '1画面目だけを競合と横比較' },
    { id: 'lp-benefit', title: '特徴ではなくベネフィットを伝えている', description: '機能説明だけでなく購入後の変化を見せる。', metric: 'CVR', impact: 5, hint: '「だから何が嬉しい？」へ書き換える' },
    { id: 'lp-comparison', title: '比較表・選ばれる理由がある', description: '競合や自社内商品との違いを明確にする。', metric: 'CVR', impact: 4, hint: '3項目程度の比較表を追加' },
    { id: 'lp-faq', title: '購入前の不安をFAQで解消している', description: 'サイズ・納期・返品・使い方などを先回りする。', metric: 'CVR', impact: 4, hint: '問い合わせ上位10件をFAQ化' },
    { id: 'lp-video', title: '動画・使用イメージがある', description: '写真だけでは伝わりにくい体験を見せる。', metric: 'CVR', impact: 3, hint: '30秒の使用動画から始める' },
    { id: 'lp-mobile', title: 'スマホで見やすい', description: '文字サイズ・画像順・CTAをスマホ基準で確認する。', metric: 'CVR', impact: 5, hint: '実機で最初から購入まで確認' },
  ]],
  ['購入率・安心材料', [
    { id: 'cvr-shipping', title: '送料条件がわかりやすい', description: '購入直前の送料不安をなくす。', metric: 'CVR', impact: 4, hint: '送料無料条件を商品ページ上部にも表示' },
    { id: 'cvr-delivery', title: '納期・発送日がわかりやすい', description: 'いつ届くかを購入前に明確にする。', metric: 'CVR', impact: 4, hint: '最短発送・到着目安を明示' },
    { id: 'cvr-stock', title: '欠品を減らしている', description: '売れるタイミングで在庫切れを起こさない。', metric: 'CVR', impact: 5, hint: '売れ筋の欠品日数を記録' },
    { id: 'cvr-return', title: '返品・保証条件が明確', description: '購入失敗への不安を下げる。', metric: 'CVR', impact: 3, hint: '保証内容を短く見える位置へ' },
    { id: 'cvr-trust', title: '運営者・実績・受賞など信頼材料がある', description: '初見客が安心できる根拠を見せる。', metric: 'CVR', impact: 3, hint: '実績を数字で1〜3個表示' },
    { id: 'cvr-payment', title: '決済方法が十分にある', description: '使いたい支払い方法がない離脱を減らす。', metric: 'CVR', impact: 3, hint: '離脱率と主要決済手段を確認' },
  ]],
  ['客単価', [
    { id: 'aov-upsell', title: '上位商品へのアップセルがある', description: 'より高い価値の商品を自然に提案する。', metric: '客単価', impact: 4, hint: '標準・上位の違いを明示' },
    { id: 'aov-crosssell', title: '関連商品をクロスセルしている', description: '一緒に使う商品を購入導線に出す。', metric: '客単価', impact: 5, hint: '購入セット率が高い組み合わせを表示' },
    { id: 'aov-bundle', title: 'まとめ買い特典がある', description: '購入点数が増える理由を作る。', metric: '客単価', impact: 5, hint: '2点・3点の価格差を設計' },
    { id: 'aov-threshold', title: '送料無料ラインを活用している', description: 'あと少し買うと得になる金額設計をする。', metric: '客単価', impact: 4, hint: '現在の客単価より少し上に設定' },
    { id: 'aov-gift', title: 'ギフト需要を取り込んでいる', description: 'ラッピング・メッセージ・セットで単価を上げる。', metric: '客単価', impact: 3, hint: 'ギフト対応を商品ページで明示' },
    { id: 'aov-price', title: '価格改定を定期的に検討している', description: '売上だけでなく利益とCVRを見ながら価格を最適化する。', metric: '客単価', impact: 4, hint: '価格変更前後のCVRと粗利を比較' },
  ]],
  ['レビュー・UGC', [
    { id: 'review-request', title: 'レビュー依頼の仕組みがある', description: '購入後に自然にレビューを書いてもらう。', metric: 'CVR', impact: 5, hint: '購入後フォローへレビュー依頼を追加' },
    { id: 'review-rate', title: 'レビュー獲得率を追っている', description: '注文数に対して何件増えたかを見る。', metric: 'CVR', impact: 3, hint: '月次でレビュー件数÷注文数を記録' },
    { id: 'review-bad', title: '低評価レビューを分析している', description: '不満を商品・説明・配送改善へ戻す。', metric: 'CVR', impact: 5, hint: '★1〜3を理由別に分類' },
    { id: 'review-content', title: 'レビュー内容をページ改善に使っている', description: '購入者の言葉を訴求・FAQへ反映する。', metric: 'CVR', impact: 4, hint: '頻出の褒め言葉をLPへ反映' },
    { id: 'ugc', title: 'UGCを活用している', description: '実際の利用シーンを第三者視点で見せる。', metric: 'CVR', impact: 3, hint: '利用許諾を取ってSNS投稿を掲載' },
    { id: 'review-response', title: 'レビュー返信を運用している', description: '購入者と閲覧者の両方に誠実さを伝える。', metric: 'CVR', impact: 2, hint: '低評価から優先して返信' },
  ]],
  ['CRM・メルマガ・LINE', [
    { id: 'crm-mail', title: 'メルマガを定期配信している', description: '既存顧客へ新商品・再購入・企画を知らせる。', metric: 'リピート', impact: 5, hint: 'まず月2回から固定化' },
    { id: 'crm-line', title: 'LINEなど再接触チャネルがある', description: 'メール以外でも顧客とつながる。', metric: 'リピート', impact: 4, hint: '登録メリットを1つ明確にする' },
    { id: 'crm-segment', title: '顧客を分けて配信している', description: '購入商品・回数・経過日数で内容を変える。', metric: 'リピート', impact: 4, hint: '新規・リピーターだけでも分ける' },
    { id: 'crm-newitem', title: '新商品を既存客へ告知している', description: '新商品発売時に一番買いやすい顧客へ届ける。', metric: 'リピート', impact: 4, hint: '発売日当日に既存客へ告知' },
    { id: 'crm-campaign', title: 'セール・イベント告知を事前にしている', description: '開催当日だけでなく予告で需要を作る。', metric: 'セッション', impact: 3, hint: '前日・当日の2段階配信を試す' },
    { id: 'crm-popup', title: '会員・LINE登録導線が目立つ', description: '一度の訪問で終わらない接点を作る。', metric: 'リピート', impact: 3, hint: '登録特典と導線位置を改善' },
  ]],
  ['リピート・LTV', [
    { id: 'repeat-timing', title: '再購入タイミングを把握している', description: '商品ごとの買い替え・消費周期を知る。', metric: 'リピート', impact: 5, hint: '前回購入から次回購入までの日数を集計' },
    { id: 'repeat-reminder', title: '再購入時期にリマインドしている', description: '必要になる直前にメールやLINEで思い出してもらう。', metric: 'リピート', impact: 5, hint: '平均再購入日の少し前に配信' },
    { id: 'repeat-coupon', title: '2回目購入の理由がある', description: '初回客をリピーターへ変えるきっかけを作る。', metric: 'リピート', impact: 4, hint: '次回使える特典を同梱・配信' },
    { id: 'repeat-subscribe', title: '定期購入の余地を検討している', description: '消耗品や継続利用品なら定期化を検討する。', metric: 'リピート', impact: 5, hint: '再購入率が高い商品から検討' },
    { id: 'repeat-vip', title: '優良顧客向け施策がある', description: '購入回数・金額の高い顧客を特別扱いする。', metric: 'リピート', impact: 3, hint: '上位10%顧客の特徴を確認' },
    { id: 'repeat-churn', title: '離反・休眠顧客を掘り起こしている', description: '30日・60日・90日などで再接触する。', metric: 'リピート', impact: 4, hint: '最終購入日で休眠顧客を抽出' },
  ]],
  ['店舗回遊・導線', [
    { id: 'nav-related', title: '関連商品導線がある', description: '閲覧商品の次に見るべき商品を出す。', metric: '客単価', impact: 4, hint: '同用途・上位・補完商品を表示' },
    { id: 'nav-ranking', title: 'ランキングを見せている', description: '迷っている人に人気という判断材料を渡す。', metric: 'CVR', impact: 3, hint: 'カテゴリ別TOP3から開始' },
    { id: 'nav-category', title: 'カテゴリが買い手目線で整理されている', description: '社内都合ではなく用途・悩みで探せるようにする。', metric: 'セッション', impact: 4, hint: '初見ユーザーが3クリック以内で到達できるか確認' },
    { id: 'nav-feature', title: '特集・まとめページがある', description: '季節・用途・テーマで商品をまとめる。', metric: 'セッション', impact: 3, hint: '売れ筋テーマを1本特集化' },
    { id: 'nav-search', title: 'サイト内検索が使いやすい', description: '検索ゼロ件や表記揺れによる離脱を減らす。', metric: 'CVR', impact: 3, hint: 'ゼロ件検索語を確認' },
    { id: 'nav-cart', title: 'カートまでの導線が短い', description: '欲しいと思った瞬間から購入までの障害を減らす。', metric: 'CVR', impact: 5, hint: 'スマホで購入完了まで実測' },
  ]],
  ['販促・イベント', [
    { id: 'promo-calendar', title: '年間販促カレンダーがある', description: 'セールや需要期を場当たり的に運用しない。', metric: 'セッション', impact: 4, hint: '12か月の主要需要期を先に埋める' },
    { id: 'promo-mall', title: 'モール大型イベントを活用している', description: '楽天・Amazon・Yahoo!の需要増に合わせる。', metric: 'セッション', impact: 5, hint: '大型イベント前に商品・広告・在庫を準備' },
    { id: 'promo-coupon', title: 'クーポンを目的別に使い分けている', description: '新規・まとめ買い・休眠復帰など目的で設計する。', metric: 'CVR', impact: 4, hint: '一律値引きではなく対象を分ける' },
    { id: 'promo-point', title: 'ポイント施策を利益と比較している', description: '売上だけでなく粗利を見て効果判断する。', metric: 'CVR', impact: 3, hint: 'ポイント費用込みの限界利益で判断' },
    { id: 'promo-deal', title: 'タイムセール・限定性を活用している', description: '今買う理由を作る。', metric: 'CVR', impact: 3, hint: '期間と対象を限定してテスト' },
    { id: 'promo-stock', title: '販促前に在庫を確保している', description: '売れる日に欠品して機会損失しない。', metric: 'CVR', impact: 5, hint: 'イベント別販売予測を在庫へ反映' },
  ]],
  ['計測・改善運用', [
    { id: 'data-kpi', title: 'セッション・CVR・客単価を月次で見ている', description: '売上の増減を要因分解できる状態にする。', metric: 'CVR', impact: 5, hint: '最低3指標を同じシートで追う' },
    { id: 'data-product', title: '商品別に売上・CVRを見ている', description: '店舗平均だけでなく伸ばす商品を特定する。', metric: 'CVR', impact: 5, hint: '売上上位20商品から確認' },
    { id: 'data-channel', title: '流入元別に成果を見ている', description: '広告・自然検索・SNSなどの質を比べる。', metric: 'セッション', impact: 4, hint: '流入別のCVRまで確認' },
    { id: 'data-log', title: '施策の実施日を記録している', description: '何を変えた結果、数字が動いたか振り返る。', metric: 'CVR', impact: 4, hint: '変更日・内容・狙う指標を1行で残す' },
    { id: 'data-test', title: '改善前後を比較している', description: '感覚ではなく数字で続ける・戻すを判断する。', metric: 'CVR', impact: 4, hint: '最低2〜4週間の前後比較' },
    { id: 'data-weekly', title: '毎週「次に何をするか」を決めている', description: '分析だけで終わらず改善行動につなげる。', metric: 'CVR', impact: 5, hint: '週1回、最優先施策を1〜3個決める' },
  ]],
]

const items: CheckItem[] = groups.flatMap(([category, list]) => list.map(item => ({ ...item, category })))
const categories = ['すべて', ...groups.map(([name]) => name)]
const STORAGE_KEY = 'ecp-growth-finder-v1'

export default function GrowthFinderPage() {
  const [answers, setAnswers] = useState<Record<string, Status>>({})
  const [category, setCategory] = useState('すべて')
  const [onlyTodo, setOnlyTodo] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setAnswers(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    if (Object.keys(answers).length === 0) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const answered = Object.keys(answers).length
  const done = Object.values(answers).filter(v => v === 'done').length
  const todo = Object.values(answers).filter(v => v === 'todo').length
  const unknown = Object.values(answers).filter(v => v === 'unknown').length
  const score = answered ? Math.round((done / answered) * 100) : 0

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (category !== 'すべて' && item.category !== category) return false
      if (onlyTodo && answers[item.id] !== 'todo') return false
      if (query && !`${item.title}${item.description}${item.hint}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [answers, category, onlyTodo, query])

  const topOpportunities = useMemo(() => {
    return items
      .filter(item => answers[item.id] === 'todo')
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5)
  }, [answers])

  const metricSummary = useMemo(() => {
    const metrics: Metric[] = ['商品数', 'セッション', 'CVR', '客単価', 'リピート']
    return metrics.map(metric => ({
      metric,
      count: items.filter(item => item.metric === metric && answers[item.id] === 'todo').length,
    }))
  }, [answers])

  const setStatus = (id: string, status: Status) => setAnswers(current => ({ ...current, [id]: status }))

  const reset = () => {
    if (!window.confirm('診断結果をリセットしますか？')) return
    setAnswers({})
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <div className={styles.headerActions}>
          <span>売上の伸びしろ発見機</span>
          <a href="/">← アプリ一覧</a>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>FREE / STORE GROWTH CHECK</span>
          <h1>売上を増やす方法を、<br /><em>「まだやっていないこと」から見つける。</em></h1>
          <p>LPだけではなく、商品数・SEO・広告・客単価・レビュー・メルマガ・リピートまで。EC店舗の売上アップ要素を72項目で総点検します。</p>
        </div>
        <div className={styles.heroStat}>
          <b>72</b>
          <span>売上アップ項目</span>
          <small>Amazon / 楽天 / Yahoo! / 自社EC</small>
        </div>
      </section>

      <section className={styles.summary}>
        <article><span>診断済み</span><b>{answered}<small>/72</small></b></article>
        <article className={styles.todoCard}><span>伸びしろ</span><b>{todo}<small>件</small></b></article>
        <article><span>実施済み</span><b>{done}<small>件</small></b></article>
        <article><span>不明</span><b>{unknown}<small>件</small></b></article>
        <article><span>実施率</span><b>{score}<small>%</small></b></article>
      </section>

      {topOpportunities.length > 0 && (
        <section className={styles.opportunityPanel}>
          <div className={styles.panelHead}>
            <div><span className={styles.kicker}>PRIORITY</span><h2>まずここから。伸びしろTOP5</h2></div>
            <p>未実施の中から、売上への影響が大きい項目を優先表示しています。</p>
          </div>
          <div className={styles.opportunityGrid}>
            {topOpportunities.map((item, index) => (
              <article key={item.id}>
                <span className={styles.rank}>0{index + 1}</span>
                <div><small>{item.category} / {item.metric}</small><h3>{item.title}</h3><p>{item.hint}</p></div>
              </article>
            ))}
          </div>
          <div className={styles.metricStrip}>
            {metricSummary.map(({ metric, count }) => <div key={metric}><span>{metric}</span><b>{count}</b><small>未実施</small></div>)}
          </div>
        </section>
      )}

      <section className={styles.controls}>
        <div className={styles.controlTop}>
          <div>
            <span className={styles.kicker}>FULL CHECKLIST</span>
            <h2>店舗全体をチェック</h2>
          </div>
          <div className={styles.searchWrap}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="項目を検索" aria-label="項目を検索" />
            <button className={onlyTodo ? styles.activeFilter : ''} onClick={() => setOnlyTodo(v => !v)}>未実施だけ</button>
            <button className={styles.reset} onClick={reset}>リセット</button>
          </div>
        </div>
        <div className={styles.tabs}>
          {categories.map(name => <button key={name} className={category === name ? styles.activeTab : ''} onClick={() => setCategory(name)}>{name}</button>)}
        </div>
      </section>

      <section className={styles.list}>
        {filtered.map(item => {
          const status = answers[item.id]
          return (
            <article className={`${styles.checkItem} ${status === 'todo' ? styles.isTodo : ''}`} key={item.id}>
              <div className={styles.itemMain}>
                <div className={styles.itemMeta}><span>{item.category}</span><b>{item.metric}</b>{Array.from({ length: item.impact }).map((_, i) => <i key={i}>★</i>)}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {status === 'todo' && <div className={styles.hint}>次の一手：{item.hint}</div>}
              </div>
              <div className={styles.answerButtons}>
                <button className={status === 'done' ? styles.done : ''} onClick={() => setStatus(item.id, 'done')}>✓ 実施済み</button>
                <button className={status === 'todo' ? styles.todo : ''} onClick={() => setStatus(item.id, 'todo')}>＋ 未実施</button>
                <button className={status === 'unknown' ? styles.unknown : ''} onClick={() => setStatus(item.id, 'unknown')}>？ 不明</button>
              </div>
            </article>
          )
        })}
        {filtered.length === 0 && <div className={styles.empty}>該当する項目がありません。</div>}
      </section>

      <section className={styles.nextStep}>
        <div>
          <span className={styles.kicker}>NEXT ACTION</span>
          <h2>診断だけで終わらせない。</h2>
          <p>未実施が見つかったら、最優先の1〜3項目だけ実行してください。商品ページの改善余地は、ECPのECサイト診断でも確認できます。</p>
        </div>
        <a href="/diagnosis">ECサイト診断を使う →</a>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <span>ECの面倒を、アプリにする。</span>
      </footer>
    </main>
  )
}
