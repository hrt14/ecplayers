'use client'

import { useMemo, useRef, useState } from 'react'
import styles from './review-follow.module.css'

type PromptInput = {
  url: string
  productPage: string
  reviews: string
}

const sample = {
  url: 'https://item.rakuten.co.jp/example-shop/example-item/',
  productPage: `商品名：サンプル収納ケース\nサイズ：約 幅30×奥行20×高さ12cm\n素材：ポリエステル\n商品説明：デスクまわりや小物の整理に便利な収納ケースです。\n※モニター環境により実際の色味と異なる場合があります。`,
  reviews: `評価 2.00\n思っていたより小さかった\n写真ではもっと大きく見えました。入れたかった物が入りませんでした。\n\n評価 2.00\n生地が薄い\n想像していたより柔らかく、しっかりしたケースではありません。\n\n評価 3.00\n色が写真と少し違う\n使えますが、写真より暗めに感じました。`,
}

function buildPrompt({ url, productPage, reviews }: PromptInput) {
  const cleanUrl = url.trim() || '（URL未入力）'
  const cleanPage = productPage.trim() || '（商品ページ本文は未入力。URLへアクセスできる場合のみ補助的に確認してください）'
  const cleanReviews = reviews.trim()

  return `あなたは楽天市場の商品ページ改善を専門とするECコンサルタントです。\n\n目的は「悪いレビューを消すこと」ではありません。低評価・不満レビューから、購入前に伝えておけば防げた可能性のある誤解・期待ギャップ・説明不足を見つけ、現在の商品ページに足りないコンテンツを具体化することです。\n\n以下の入力だけを根拠に分析してください。商品仕様、レビュー件数、原因などを推測で補わないでください。商品ページURLへアクセスできる環境なら公開ページを補助的に確認して構いませんが、確認できなかった場合はその旨を明記し、貼り付け本文を優先してください。\n\n# 商品ページURL\n${cleanUrl}\n\n# 現在の商品ページからコピーした内容\n${cleanPage}\n\n# レビューページからコピーした内容\n${cleanReviews}\n\n---\n\n# 分析手順\n\n## 1. コピペされたレビュー構造を読み取る\nレビュー画面由来の余計なナビゲーション、並び替え、商品情報、店舗情報などが混ざっていても、可能な範囲でレビュー単位に分離してください。\n\n各レビューから確認できる範囲で、次を抽出してください。\n- 評価\n- レビュータイトル\n- 不満の本文\n- 不満の対象\n- 購入前に想像していたこと\n- 実際とのギャップ\n\n情報がない項目は「不明」としてください。\n\n## 2. 同じ不満を論点別にまとめる\n例：サイズ、色、質感、重さ、性能、耐久性、操作、組立、適合条件、付属品、配送、梱包、写真との印象差、仕様の誤解など。\n\n同じ意味の不満はまとめてください。ただし件数を正確に数えられない入力の場合、件数を推測しないでください。\n\n## 3. 商品ページで防げる問題か分ける\n各論点を次の3つに分類してください。\nA. 商品ページの説明改善で防げる可能性が高い\nB. 商品ページの説明改善で一部防げる\nC. 商品そのもの・配送事故など、ページ改善だけでは解決しにくい\n\nCを無理にコンテンツ改善案へ変換しないでください。\n\n## 4. 現在の商品ページと照合する\n各論点について、購入前に判断できる説明が現在ページにあるか確認し、次の4段階で判定してください。\n\n○ 十分：購入前に誤解しにくい程度まで明確\n△ 弱い：情報はあるが目立たない、数字だけ、理解しにくい\n× 不足：関連情報はあるが判断材料として足りない\n― なし：該当説明が見つからない\n\n## 5. 追加コンテンツを制作できるレベルまで具体化する\n「サイズを分かりやすくする」のような抽象案は禁止です。\n\nたとえばサイズ問題なら、\n- A4用紙との比較画像\n- 手に持った写真\n- 収納できる物／できない物の例\n- 実寸図\n- 『○○用途には小さめです』という購入前注意\nなど、制作担当がそのまま着手できる単位まで落としてください。\n\n---\n\n# 最終出力\n\n## ① 結論サマリー\nこの商品ページで最優先に直すべきことを3行以内で。\n\n## ② 悪いレビューの主要論点\n| 優先度 | レビューの不満 | 入力から確認できる事実 | ページ改善で防げる度合い |\n|---|---|---|---|\n\n優先度は、入力から確認できる「購入判断への影響」と「ページ改善可能性」を中心に判断してください。頻度が不明なら頻度を推測しないでください。\n\n## ③ 商品ページとのギャップ分析\n| 優先度 | レビュー論点 | 現ページの説明 | 判定 | 足りない情報 |\n|---|---|---|---|---|\n\n## ④ 今すぐ追加・改善すべきコンテンツ TOP5\n各案について必ず次を出してください。\n- コンテンツ名\n- 対応するレビュー問題\n- なぜ必要か\n- 掲載内容\n- 推奨形式（画像／比較表／FAQ／注意書き／商品説明文／動画など）\n- 推奨掲載場所（商品画像、ページ上部、商品説明、FAQ付近など）\n- 実際に使える見出しコピー案\n- 実際に使える本文・注意書き案\n\n## ⑤ 「売らない説明」\n低評価や返品につながりそうな期待ギャップを減らすため、必要なら次を提案してください。\n- この商品が向いていない人\n- 使用できない条件\n- 購入前に必ず確認してほしいこと\n\n短期的なCVRだけを上げるのではなく、購入後の納得度を優先してください。\n\n## ⑥ 追加対応不要\n悪いレビューに書かれていても、現在ページですでに十分説明できているものは「追加対応不要」として分けてください。\n\n## ⑦ 商品側で直すべき問題\nページ改善ではなく、商品仕様・品質・物流・梱包など別の改善が必要と考えられる論点を、入力から確認できる範囲だけで分けてください。\n\n# 厳守ルール\n- 入力にない事実を作らない\n- 商品仕様を推測しない\n- レビュー件数を推測しない\n- 商品ページに既にある説明を「ない」と決めつけない\n- URLへアクセスできなかった場合は明記する\n- 悪いレビューをすべてページ改善で解決できるように見せない\n- 抽象論ではなく、制作できる具体案を出す\n- 追加不要なものは追加不要と判断する\n`
}

export default function ReviewFollowClient() {
  const [url, setUrl] = useState('')
  const [productPage, setProductPage] = useState('')
  const [reviews, setReviews] = useState('')
  const [prompt, setPrompt] = useState('')
  const [copyState, setCopyState] = useState('プロンプトをコピー')
  const resultRef = useRef<HTMLDivElement>(null)

  const readyCount = useMemo(
    () => [url.trim(), productPage.trim(), reviews.trim()].filter(Boolean).length,
    [url, productPage, reviews],
  )

  function generate() {
    if (!reviews.trim()) return
    setPrompt(buildPrompt({ url, productPage, reviews }))
    setCopyState('プロンプトをコピー')
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  async function copyPrompt() {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyState('コピーしました')
      window.setTimeout(() => setCopyState('プロンプトをコピー'), 1800)
    } catch {
      setCopyState('コピーできませんでした')
    }
  }

  function loadSample() {
    setUrl(sample.url)
    setProductPage(sample.productPage)
    setReviews(sample.reviews)
    setPrompt('')
    setCopyState('プロンプトをコピー')
  }

  function clearAll() {
    setUrl('')
    setProductPage('')
    setReviews('')
    setPrompt('')
    setCopyState('プロンプトをコピー')
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav>
          <a href="/#apps">アプリ一覧</a>
          <a href="/trademarks">第三者商標</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>RAKUTEN REVIEW → CONTENT</div>
          <h1>悪いレビューから、<br /><em>足りない説明</em>を見つける。</h1>
          <p>楽天市場の低評価レビューをページごとコピー。商品ページと一緒に貼ると、AIが「購入前に伝えるべきだった情報」を探せる分析プロンプトに変換します。</p>
          <div className={styles.heroBadges}>
            <span>無料</span>
            <span>登録不要</span>
            <span>入力はブラウザ内で処理</span>
          </div>
        </div>
        <div className={styles.heroFlow}>
          <div><b>01</b><span>レビューを貼る</span></div>
          <i>→</i>
          <div><b>02</b><span>ページと照合</span></div>
          <i>→</i>
          <div><b>03</b><span>追加コンテンツ化</span></div>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.workspaceHead}>
          <div>
            <span className={styles.label}>INPUT</span>
            <h2>そのまま貼ればOK。</h2>
            <p>レビュー画面の余計な文字が混ざっていても削除不要です。AI側でレビュー構造を読み取る前提のプロンプトを作ります。</p>
          </div>
          <div className={styles.inputStatus}><b>{readyCount}</b><span>/ 3 入力済み</span></div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldTop}><b>1. 商品ページURL</b><small>推奨</small></span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://item.rakuten.co.jp/..." inputMode="url" />
            <em>{url.trim() ? '入力済み' : '商品を識別しやすくします'}</em>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldTop}><b>2. 現在の商品ページ</b><small>推奨</small></span>
            <textarea value={productPage} onChange={(e) => setProductPage(e.target.value)} placeholder="商品名、商品説明、仕様、注意書きなど。ページをコピーしてそのまま貼り付け。" rows={10} />
            <em>{productPage.length.toLocaleString()} 文字</em>
          </label>

          <label className={`${styles.field} ${styles.reviewField}`}>
            <span className={styles.fieldTop}><b>3. 悪いレビューページ</b><small className={styles.required}>必須</small></span>
            <textarea value={reviews} onChange={(e) => setReviews(e.target.value)} placeholder="低評価レビューが表示されているページを選択してコピー。そのまま全部貼り付けてください。" rows={15} />
            <em>{reviews.length.toLocaleString()} 文字</em>
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={generate} disabled={!reviews.trim()}>改善プロンプトを作る →</button>
          <button type="button" className={styles.secondary} onClick={loadSample}>サンプルで試す</button>
          <button type="button" className={styles.ghost} onClick={clearAll}>クリア</button>
        </div>
        {!reviews.trim() && <p className={styles.hint}>まず「3. 悪いレビューページ」を貼ると生成できます。</p>}
      </section>

      {prompt && (
        <section className={styles.result} ref={resultRef}>
          <div className={styles.resultHead}>
            <div>
              <span className={styles.label}>PROMPT READY</span>
              <h2>AIに貼るだけ。</h2>
              <p>ChatGPTなどにこのプロンプトを貼ると、レビューの不満と現ページを照合し、追加コンテンツ案まで出すよう指示します。</p>
            </div>
            <button type="button" onClick={copyPrompt}>{copyState}</button>
          </div>
          <textarea className={styles.prompt} value={prompt} readOnly aria-label="生成された分析プロンプト" />
          <div className={styles.resultTips}>
            <div><b>精度を上げる</b><span>商品ページ本文も一緒に入れる</span></div>
            <div><b>レビューは掃除しない</b><span>ページごとコピーでOK</span></div>
            <div><b>判断させる</b><span>追加不要・商品側の問題も分離</span></div>
          </div>
        </section>
      )}

      <section className={styles.pro}>
        <div>
          <span className={styles.proLabel}>PRO / NEXT</span>
          <h2>コピーせず、この画面で分析。</h2>
          <p>API接続版では、同じ入力からギャップ分析・TOP5・コピー案までこの画面に直接返す設計です。APIを無制限公開せず、課金・利用制限を入れてから有効化します。</p>
        </div>
        <button type="button" disabled>AIで直接分析する — 準備中</button>
      </section>

      <section className={styles.whatYouGet}>
        <span className={styles.label}>WHAT AI WILL RETURN</span>
        <h2>「レビュー要約」で終わらせない。</h2>
        <div className={styles.cards}>
          <article><b>01</b><h3>不満の構造化</h3><p>サイズ、色、質感、使い方など、同じ不満を論点ごとにまとめます。</p></article>
          <article><b>02</b><h3>ページとのギャップ</h3><p>十分・弱い・不足・なしの4段階で、現在の説明と照合します。</p></article>
          <article><b>03</b><h3>制作できる改善案</h3><p>画像、比較表、注意書き、FAQといった具体的な追加コンテンツにします。</p></article>
          <article><b>04</b><h3>売らない説明</h3><p>向いていない人や購入前注意も出し、期待ギャップを減らします。</p></article>
        </div>
      </section>

      <section className={styles.notice}>
        <strong>第三者サービスについて</strong>
        <p>本ツールは株式会社まんがびとが独自に提供するEC支援ツールです。楽天グループ株式会社または楽天市場との提携・承認・後援関係を示すものではありません。「楽天市場」の名称は対応する第三者サービスを説明する目的で使用しています。</p>
        <a href="/trademarks">第三者商標について →</a>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <p>ECの面倒を、アプリにする。</p>
        <nav><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><a href="/trademarks">第三者商標</a></nav>
      </footer>
    </main>
  )
}
