'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './AmazonLpChecker.module.css'

type Status = 'unset' | 'good' | 'partial' | 'bad' | 'na'

type CheckItem = {
  id: string
  title: string
  help: string
  weight: number
  official?: boolean
}

type CheckGroup = {
  id: string
  number: string
  title: string
  subtitle: string
  items: CheckItem[]
}

const STORAGE_KEY = 'ecplayers:amazon-lp-checker:v1'

const groups: CheckGroup[] = [
  {
    id: 'basic',
    number: '01',
    title: '商品名・基本情報',
    subtitle: 'まず「何の商品か」と購入条件が迷わず分かるか。',
    items: [
      { id: 'title-clear', title: '商品名が簡潔・正確で、何の商品か分かる', help: '検索語を詰め込むより、商品を正しく理解できることを優先。', weight: 5, official: true },
      { id: 'variation-clear', title: '色・サイズ・容量などのバリエーションが分かりやすい', help: '選択肢が多い場合も、違いを迷わず選べるか確認。', weight: 3, official: true },
      { id: 'offer-clear', title: '価格・配送・購入条件が理解しやすい', help: 'ページを開いて「いくらで、いつ届くか」が把握しやすいか。', weight: 3 },
      { id: 'first-view', title: 'ファーストビューだけで商品の価値が大まかに伝わる', help: '商品名・画像・価格・評価を見た時点で、続きを見る理由があるか。', weight: 4 },
    ],
  },
  {
    id: 'images',
    number: '02',
    title: '画像',
    subtitle: '文字を読まなくても、画像だけで購入判断が進むか。',
    items: [
      { id: 'main-image', title: 'メイン画像が商品を明確に見せている', help: '小さすぎる、何の商品か分からない、余計な要素が強い状態になっていないか。', weight: 5, official: true },
      { id: 'image-count', title: '画像が4枚以上あり、情報量が十分ある', help: 'Amazonの広告向け公式ガイドでも、商品詳細ページ見直し時に画像4枚以上を確認項目として案内。', weight: 4, official: true },
      { id: 'lifestyle', title: '使用シーンが分かる画像がある', help: '誰が、どこで、どう使う商品かを視覚で理解できるか。', weight: 4 },
      { id: 'size-info', title: 'サイズ・容量・仕様を画像で理解できる', help: '「思ったより大きい／小さい」を購入前に防げる情報があるか。', weight: 4 },
      { id: 'benefit-image', title: '主要ベネフィットを画像で説明している', help: '特徴だけでなく「使うと何が良いか」まで画像で伝えているか。', weight: 4 },
      { id: 'image-order', title: '画像の順番が、重要な情報から並んでいる', help: '2〜4枚目に最も伝えたい理由が来ているか。', weight: 4 },
    ],
  },
  {
    id: 'bullets',
    number: '03',
    title: '商品仕様・商品説明',
    subtitle: '箇条書きを読めば「特徴・利点・違い」が分かるか。',
    items: [
      { id: 'bullets-exist', title: '商品仕様の箇条書きが設定されている', help: 'Amazon公式は商品仕様を、主な特徴や違いを伝える重要項目として案内。', weight: 4, official: true },
      { id: 'bullets-three', title: '主要情報が3項目以上に整理されている', help: 'Amazon公式SEOガイドでは箇条書き3行以上を推奨。', weight: 3, official: true },
      { id: 'benefit-copy', title: '特徴だけでなく、購入者にとっての利点まで書かれている', help: '「○○素材」だけで終わらず、それにより何が良いかまで説明。', weight: 5 },
      { id: 'specific-copy', title: 'サイズ・容量・対象・素材など具体情報が十分ある', help: '購入前に確認したい数字や条件を探さなくてよいか。', weight: 4, official: true },
      { id: 'no-repeat', title: '商品名・画像・箇条書きで同じ話を繰り返しすぎていない', help: '限られた表示領域を別の購入理由に使えているか。', weight: 2 },
      { id: 'description', title: '商品説明にも補足情報がある', help: '機能、使用方法、背景など、箇条書きで足りない情報を補えているか。', weight: 2, official: true },
    ],
  },
  {
    id: 'value',
    number: '04',
    title: '訴求・差別化',
    subtitle: '競合と並べられた時に「これを買う理由」が残るか。',
    items: [
      { id: 'target', title: '誰向けの商品かが分かる', help: '初心者、仕事用、子育て中など、購入者が「自分向け」と判断できるか。', weight: 4 },
      { id: 'problem', title: 'どんな悩み・目的を解決する商品かが分かる', help: '商品スペックではなく、購入前の状態から何が変わるかを確認。', weight: 4 },
      { id: 'difference', title: '競合商品との違いが具体的に伝わる', help: '「高品質」など抽象語だけでなく、比較可能な違いがあるか。', weight: 4 },
      { id: 'reason', title: 'この商品を今選ぶ理由が1つ以上ある', help: 'ページを閉じずに購入へ進める決め手が見つかるか。', weight: 3 },
    ],
  },
  {
    id: 'anxiety',
    number: '05',
    title: '購入前の不安解消',
    subtitle: '低評価レビューになりやすい「思っていたのと違う」を先回りする。',
    items: [
      { id: 'spec-anxiety', title: 'サイズ・重量・容量などの誤解を防げる', help: '実寸、比較対象、利用目安などがあると判断しやすい。', weight: 3 },
      { id: 'compatibility', title: '対応機種・対象条件・使える環境が明確', help: '該当しない商品なら「対象外」を選択。', weight: 2 },
      { id: 'included', title: '同梱物・セット内容が明確', help: '届くもの／届かないものを購入前に理解できるか。', weight: 2 },
      { id: 'howto', title: '使い方・お手入れ・設置方法が分かる', help: '使い始めるまでのハードルが高い商品ほど重要。', weight: 2 },
      { id: 'caution', title: '重要な注意事項・保証情報が必要に応じて分かる', help: '該当しない場合は「対象外」。', weight: 1 },
    ],
  },
  {
    id: 'aplus',
    number: '06',
    title: 'A+・商品紹介コンテンツ',
    subtitle: 'ブランド商品の理解と差別化を、下部コンテンツで補強できているか。',
    items: [
      { id: 'aplus-exist', title: '利用可能な商品ではA+／商品紹介コンテンツが設定されている', help: 'Amazonブランド登録対象外など、利用できない場合は「対象外」。', weight: 3, official: true },
      { id: 'aplus-story', title: 'ブランド説明より先に、商品の価値が分かる', help: 'ブランドの歴史だけで終わらず、購入判断に必要な情報があるか。', weight: 2 },
      { id: 'aplus-visual', title: '文章だけでなく図・画像で理解できる', help: 'スクロールして見る価値がある情報設計になっているか。', weight: 2 },
      { id: 'aplus-compare', title: '比較表・ラインナップ比較で選びやすくしている', help: '複数商品がない場合は「対象外」。', weight: 2 },
      { id: 'aplus-mobile', title: 'スマホでも読みやすい情報量・文字サイズになっている', help: '画像内テキストが小さすぎないか。', weight: 1 },
    ],
  },
  {
    id: 'purchase',
    number: '07',
    title: '購入導線・信頼',
    subtitle: '最後に「買えない・迷う・不安」を残していないか。',
    items: [
      { id: 'stock-delivery', title: '在庫・配送予定が購入の障害になっていない', help: '欠品、極端に遅い配送などがCVRを落としていないか。', weight: 2 },
      { id: 'variation-choice', title: '購入したいバリエーションを迷わず選べる', help: '単一商品なら「対象外」。', weight: 1 },
      { id: 'review-trust', title: 'レビューの評価・件数が購入者の不安を強めていない', help: '低評価がある場合は、内容をページ側で先回りできないか確認。', weight: 2 },
    ],
  },
]

const statusMeta: Record<Status, { label: string; short: string; multiplier: number | null }> = {
  unset: { label: '未確認', short: '—', multiplier: null },
  good: { label: 'できている', short: '○', multiplier: 1 },
  partial: { label: '一部できている', short: '△', multiplier: 0.5 },
  bad: { label: 'できていない', short: '×', multiplier: 0 },
  na: { label: '対象外', short: 'N/A', multiplier: null },
}

const initialStatuses = Object.fromEntries(
  groups.flatMap((group) => group.items.map((item) => [item.id, 'unset' as Status])),
) as Record<string, Status>

function normalizeAmazonUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) return `https://www.amazon.co.jp/dp/${trimmed.toUpperCase()}`
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function extractAsin(value: string) {
  const trimmed = value.trim()
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) return trimmed.toUpperCase()
  const match = trimmed.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})(?:[/?#]|$)/i)
  return match?.[1]?.toUpperCase() || ''
}

export default function AmazonLpCheckerPage() {
  const [url, setUrl] = useState('')
  const [statuses, setStatuses] = useState<Record<string, Status>>(initialStatuses)
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { url?: string; statuses?: Record<string, Status>; notes?: string }
        if (typeof parsed.url === 'string') setUrl(parsed.url)
        if (parsed.statuses) setStatuses((current) => ({ ...current, ...parsed.statuses }))
        if (typeof parsed.notes === 'string') setNotes(parsed.notes)
      }
    } catch {
      // 保存データが壊れている場合は初期状態で続行
    } finally {
      setRestored(true)
    }
  }, [])

  useEffect(() => {
    if (!restored) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, statuses, notes }))
  }, [url, statuses, notes, restored])

  const asin = useMemo(() => extractAsin(url), [url])
  const amazonUrl = useMemo(() => normalizeAmazonUrl(url), [url])

  const score = useMemo(() => {
    let earned = 0
    let possible = 0
    let answered = 0
    let applicable = 0

    groups.forEach((group) => {
      group.items.forEach((item) => {
        const status = statuses[item.id] || 'unset'
        if (status === 'unset') return
        answered += 1
        if (status === 'na') return
        const multiplier = statusMeta[status].multiplier ?? 0
        earned += item.weight * multiplier
        possible += item.weight
        applicable += 1
      })
    })

    return {
      value: possible ? Math.round((earned / possible) * 100) : 0,
      answered,
      applicable,
      possible,
    }
  }, [statuses])

  const priorityIssues = useMemo(() => {
    return groups
      .flatMap((group) => group.items.map((item) => ({ ...item, group: group.title, status: statuses[item.id] || 'unset' })))
      .filter((item) => item.status === 'bad' || item.status === 'partial')
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'bad' ? -1 : 1
        return b.weight - a.weight
      })
      .slice(0, 5)
  }, [statuses])

  const prompt = useMemo(() => {
    const lines = groups.flatMap((group) => [
      `\n【${group.title}】`,
      ...group.items.map((item) => {
        const status = statuses[item.id] || 'unset'
        return `- ${statusMeta[status].short} ${item.title}`
      }),
    ])

    return `あなたはAmazon.co.jpの商品詳細ページ改善に強いECコンサルタントです。\n以下の商品ページを、購入率（CVR）改善の観点から診断してください。\n\n対象URL：${amazonUrl || '未入力'}\nASIN：${asin || 'URLから取得できていません'}\nECPチェック暫定スコア：${score.answered ? `${score.value}/100` : '未採点'}\n\n私がページを見ながら確認した結果：${lines.join('\n')}\n\n補足メモ：\n${notes.trim() || 'なし'}\n\n依頼内容：\n1. このURLへアクセスできる場合は、商品ページの実物も確認してください。アクセスできない情報は推測しないでください。\n2. 問題点を「CVRへの影響が大きい順」に並べてください。\n3. 最優先で直すべき3点を、理由と一緒に具体化してください。\n4. 画像1枚目〜7枚目の改善構成案を出してください。各画像について「伝えること」「見せ方」「短いコピー案」を示してください。\n5. 商品仕様（箇条書き）の改善案を最大5項目で出してください。事実として確認できない商品性能は創作しないでください。\n6. A+／商品紹介コンテンツが利用できる場合の構成案を出してください。\n7. 低評価レビューやQ&Aを確認できる場合は、購入前にページ上で解消すべき不安を抽出してください。\n8. Amazonの最新の商品詳細ページルール・ポリシーに反する提案はしないでください。ルールに関する断定は、確認できた公式情報に基づいてください。\n\n出力形式：\n- 総評\n- 最優先3点\n- 改善優先順位一覧\n- 画像1〜7枚目の構成案\n- 商品仕様の改善案\n- A+構成案\n- 不安解消コンテンツ\n- 確認できなかったこと\n\nチェックの○△×を鵜呑みにせず、実物を確認できた範囲と照合して診断してください。`
  }, [amazonUrl, asin, notes, score.answered, score.value, statuses])

  const updateStatus = (id: string, value: Status) => {
    setStatuses((current) => ({ ...current, [id]: value }))
  }

  const reset = () => {
    setStatuses(initialStatuses)
    setNotes('')
    setCopied(false)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <a href="/#apps" className={styles.back}>← アプリ一覧</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>ECP / AMAZON LP CHECKER</div>
        <div className={styles.heroGrid}>
          <div>
            <h1>Amazon商品ページを、<br /><em>見ながら10分で診断。</em></h1>
            <p>URLを入れてAmazonの商品詳細ページを開き、○・△・×を付けるだけ。足りないところを優先順に見つけ、最後にAIへそのまま渡せる診断プロンプトを作ります。</p>
          </div>
          <div className={styles.heroScore}>
            <span>LP SCORE</span>
            <strong>{score.answered ? score.value : '—'}<small>{score.answered ? '/100' : ''}</small></strong>
            <p>{score.answered} / {groups.flatMap((group) => group.items).length} 項目確認</p>
          </div>
        </div>
      </section>

      <section className={styles.startBox}>
        <div className={styles.sectionLabel}>START HERE</div>
        <h2>1. 商品URLかASINを入れる</h2>
        <div className={styles.urlRow}>
          <label>
            <span>Amazon.co.jp 商品URL / ASIN</span>
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.amazon.co.jp/dp/B0XXXXXXXXX"
              inputMode="url"
            />
          </label>
          {amazonUrl ? (
            <a className={styles.openAmazon} href={amazonUrl} target="_blank" rel="noreferrer">Amazonでページを開く ↗</a>
          ) : (
            <span className={`${styles.openAmazon} ${styles.disabled}`}>URLを入力</span>
          )}
        </div>
        <div className={styles.asinLine}>
          <span>ASIN</span>
          <b>{asin || 'URLから自動抽出'}</b>
          <p>Amazonページは別タブで開き、この画面と行き来しながらチェックしてください。</p>
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.checkArea}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>CHECK</span>
              <h2>2. ページを見ながらチェック</h2>
            </div>
            <button type="button" className={styles.reset} onClick={reset}>チェックをリセット</button>
          </div>

          <div className={styles.legend}>
            <span><b>○</b> できている</span>
            <span><b>△</b> 一部できている</span>
            <span><b>×</b> できていない</span>
            <span><b>N/A</b> 対象外</span>
          </div>

          {groups.map((group) => {
            const groupItems = group.items.filter((item) => statuses[item.id] !== 'na')
            const groupPossible = groupItems.reduce((sum, item) => sum + item.weight, 0)
            const groupEarned = groupItems.reduce((sum, item) => {
              const status = statuses[item.id] || 'unset'
              return sum + item.weight * (statusMeta[status].multiplier ?? 0)
            }, 0)
            const groupAnswered = group.items.some((item) => statuses[item.id] !== 'unset')
            const groupScore = groupPossible && groupAnswered ? Math.round((groupEarned / groupPossible) * 100) : null

            return (
              <article className={styles.group} key={group.id}>
                <div className={styles.groupHead}>
                  <div className={styles.groupNumber}>{group.number}</div>
                  <div className={styles.groupTitle}>
                    <h3>{group.title}</h3>
                    <p>{group.subtitle}</p>
                  </div>
                  <strong>{groupScore === null ? '—' : `${groupScore}%`}</strong>
                </div>

                <div className={styles.items}>
                  {group.items.map((item) => {
                    const current = statuses[item.id] || 'unset'
                    return (
                      <div className={`${styles.item} ${current !== 'unset' ? styles[`state_${current}`] : ''}`} key={item.id}>
                        <div className={styles.itemCopy}>
                          <div className={styles.itemTitleLine}>
                            <h4>{item.title}</h4>
                            {item.official ? <span className={styles.official}>Amazon公式基準を含む</span> : <span className={styles.ecp}>ECP CVRチェック</span>}
                          </div>
                          <p>{item.help}</p>
                        </div>
                        <div className={styles.statusButtons} role="group" aria-label={`${item.title}の評価`}>
                          {(['good', 'partial', 'bad', 'na'] as Status[]).map((value) => (
                            <button
                              type="button"
                              key={value}
                              className={current === value ? styles.selected : ''}
                              onClick={() => updateStatus(item.id, current === value ? 'unset' : value)}
                              aria-pressed={current === value}
                              title={statusMeta[value].label}
                            >
                              {statusMeta[value].short}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </section>

        <aside className={styles.summary}>
          <div className={styles.stickySummary}>
            <span className={styles.sectionLabel}>LIVE SCORE</span>
            <div className={styles.bigScore}>
              <strong>{score.answered ? score.value : '—'}</strong>
              <span>{score.answered ? '/100' : '未採点'}</span>
            </div>
            <div className={styles.meter}><i style={{ width: `${score.answered ? score.value : 0}%` }} /></div>
            <p>{score.answered}項目を確認済み。N/Aは点数計算から除外します。</p>

            <div className={styles.priority}>
              <h3>優先して見るところ</h3>
              {priorityIssues.length ? priorityIssues.map((item, index) => (
                <div key={item.id}>
                  <b>{index + 1}</b>
                  <span>{item.status === 'bad' ? '×' : '△'}</span>
                  <p>{item.title}</p>
                </div>
              )) : <p className={styles.empty}>△または×を付けると、改善候補を上から表示します。</p>}
            </div>

            <a href="#ai-prompt" className={styles.jump}>AI改善案を作る ↓</a>
          </div>
        </aside>
      </div>

      <section className={styles.notesSection}>
        <span className={styles.sectionLabel}>MEMO</span>
        <h2>3. 気づいたことを残す</h2>
        <p>低評価レビュー、競合との差、ページを見て気になったことなど。ここもAIプロンプトへ入ります。</p>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="例：低評価レビューで『サイズが分かりにくい』が多い。競合は2枚目で利用シーンを見せている。"
          rows={6}
        />
      </section>

      <section className={styles.aiSection} id="ai-prompt">
        <div className={styles.aiHead}>
          <div>
            <span className={styles.sectionLabel}>AI PROMPT</span>
            <h2>4. AIに改善案を作らせる</h2>
            <p>URL・ASIN・○△×・メモを1つのプロンプトにまとめます。ChatGPTなど、Webを確認できるAIなら商品ページの実物確認も依頼できます。</p>
          </div>
          <button type="button" onClick={copyPrompt}>{copied ? 'コピーしました ✓' : 'プロンプトをコピー'}</button>
        </div>
        <pre>{prompt}</pre>
      </section>

      <section className={styles.sources}>
        <span className={styles.sectionLabel}>OFFICIAL SOURCES</span>
        <h2>Amazon公式情報を基準に更新</h2>
        <p>このツールはAmazonの公式ガイドにある商品名・画像・商品仕様・商品説明・商品紹介コンテンツ等を土台にし、ECP独自のCVR改善観点を追加しています。Amazonの仕様は変更されることがあるため、最終判断は最新の公式情報を確認してください。</p>
        <div className={styles.sourceLinks}>
          <a href="https://sell.amazon.co.jp/learn/listing" target="_blank" rel="noreferrer">Amazon商品登録の完全ガイド ↗</a>
          <a href="https://sell.amazon.co.jp/learn/seo" target="_blank" rel="noreferrer">Amazon SEO 商品ページ作成ガイド ↗</a>
          <a href="https://sell.amazon.co.jp/grow/advertising" target="_blank" rel="noreferrer">Amazon広告・商品詳細ページ見直し ↗</a>
          <a href="https://sell.amazon.co.jp/learn/seller-university" target="_blank" rel="noreferrer">Amazon出品大学 ↗</a>
        </div>
        <small>AmazonはAmazon.com, Inc.またはその関連会社の商標です。ECplayers / ECPはAmazonとは提携していません。</small>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <p>ECの面倒を、アプリにする。</p>
      </footer>
    </main>
  )
}
