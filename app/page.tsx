import styles from './Home.module.css'

const PLAYER_URL = 'https://shindan.ecplayers.com/'
const REQUEST_URL = 'https://shindan.ecplayers.com/request'

type Tool = {
  title: string
  problem: string
  description: string
  href: string
  tags: string[]
}

const amazonTools: Tool[] = [
  { title: 'Amazon 限界利益計算機', problem: '広告費、どこまで使っていい？', description: '原価・販売手数料・FBA費用などを入れると、限界利益・限界ROAS・限界TACOSをすぐ計算できます。', href: '/amazon-margin', tags: ['利益', '広告判断'] },
  { title: 'Amazon 売価分析', problem: '値下げして、本当に得した？', description: 'ビジネスレポートと広告商品レポートを重ね、売価ごとの売上・広告費・TACOS・広告差引回収を比較できます。', href: '/amazon-price-analysis', tags: ['売価', '広告回収'] },
  { title: 'Amazon広告 除外発見', problem: 'ムダな検索語句を止めたい', description: '広告レポートから、露出やクリックはあるのに成果が弱い検索語句を見つけ、除外候補を整理します。', href: '/amazon-negative-finder', tags: ['広告', '検索語句'] },
  { title: 'Amazon広告 伸ばせるポイント発見', problem: '広告の次の一手が分からない', description: '自社防御、ブランド広告、無駄な出稿などをチェックし、伸ばせるところと削れるところを整理します。', href: '/amazon-ads-growth', tags: ['広告', '改善診断'] },
  { title: 'Amazon 商品ページチェック', problem: '商品ページ、何が足りない？', description: '画像・訴求・比較・安心材料など、購入率を上げるために商品ページへ入れたい項目を順番に確認できます。', href: '/amazon-lp-checker', tags: ['商品ページ', 'CVR'] },
  { title: 'Amazon 低評価レビュー対策', problem: '悪いレビューを売上改善につなげたい', description: '低評価レビューから不安・不満を整理し、商品ページに追加すべき説明やコンテンツ案を作れます。', href: '/amazon-review-follow', tags: ['レビュー', '商品ページ'] },
  { title: 'Amazon 在庫健全度チェック', problem: '欠品や長期保管手数料に気づけていない', description: '在庫レポートCSVを読み込むだけ。欠品リスク・長期保管リスク・過剰在庫をSKUごとに判定し、対応が必要なものだけ一覧で確認できます。', href: '/amazon-inventory-health', tags: ['在庫', '欠品対策'] },
]

const rakutenTools: Tool[] = [
  { title: '楽天 限界利益計算機', problem: 'RPPをどこまで攻められる？', description: '商品原価やモール費用を入れると、限界利益と広告に使える上限を商品単位で確認できます。', href: '/rakuten-margin', tags: ['利益', 'RPP'] },
  { title: 'RPPオート キーワード分解', problem: 'オート広告の数字をキーワード別に見たい', description: 'RPPオートのレポートCSVを入れるだけ。混ざったキーワードと数字を分離して、見やすい形に整理できます。', href: '/rpp-auto-keyword', tags: ['RPP', 'CSV'] },
  { title: '楽天 商品ページチェック', problem: 'ページ改善の抜け漏れをなくしたい', description: '購入前の不安解消・比較・訴求・レビュー活用などを、楽天の商品ページを見ながら順番にチェックできます。', href: '/rakuten-lp-check', tags: ['商品ページ', 'CVR'] },
  { title: '楽天 低評価レビュー対策', problem: '悪いレビューを放置したくない', description: '低評価レビューから、商品ページで先回りして説明した方がいい内容や改善案を整理できます。', href: '/rakuten-review-follow', tags: ['レビュー', '改善案'] },
  { title: 'レビュー1件いくら？計算機', problem: 'レビュー施策の費用対効果を知りたい', description: 'レビュー施策にかかった費用と獲得件数から、レビュー1件あたりの実質コストを簡単に計算できます。', href: '/rakurakupon-review-cost', tags: ['レビュー', '費用対効果'] },
]

const storeTools: Tool[] = [
  { title: 'ECサイト無料診断', problem: 'まず、どこを直せばいい？', description: 'URLを入れるだけ。公開ページからSEO・商品情報・購入導線などをチェックし、改善ポイントを整理します。', href: '/diagnosis', tags: ['自社EC', '無料診断'] },
  { title: '自社EC 導入ツール診断', problem: 'GA4やClarity、何を入れればいい？', description: 'URLからGA4・GTM・Clarityなどの導入痕跡を確認し、次に入れるべき計測・改善ツールを優先順で整理します。', href: '/site-stack-check', tags: ['GA4', 'Clarity', '導入診断'] },
  { title: '売上アップ施策 発見機', problem: '売上を増やす打ち手を洗い出したい', description: '集客、CVR、客単価、商品数、リピートなどを横断して、まだやれていない売上アップ施策を見つけます。', href: '/growth-finder', tags: ['売上改善', 'チェック'] },
  { title: '客単価アップ チェックリスト', problem: '客単価をもっと上げたい', description: 'セット販売、まとめ買い、送料無料ラインなど、客単価を上げる施策をチェックし、変更内容も残せます。', href: '/aov-checklist', tags: ['客単価', '施策'] },
  { title: '商品ページの増やし方', problem: 'アクセスを増やせる商品を増やしたい', description: 'セット、複数個、用途別など、既存商品から新しい商品ページを作る切り口を見つけます。', href: '/product-page-growth', tags: ['楽天', 'Amazon'] },
  { title: '検索サムネイル改善発見', problem: '検索結果で自社だけ弱く見える？', description: '楽天・Amazon・Yahoo!の検索結果スクショで自社商品を指定。競合と並んだ見え方をAIで比較し、改善点を優先順で出します。', href: '/thumbnail-checker', tags: ['楽天', 'Amazon', 'Yahoo!'] },
  { title: 'GA4 超最小導入ナビ', problem: 'GA4を正しく入れたい', description: 'プロパティ作成からタグ設置、計測確認まで。ECで使える状態にするための必要な手順だけを進めます。', href: '/ga4-setup', tags: ['GA4', '導入'] },
  { title: 'GA4 定番レポート設定', problem: 'GA4を開いても見る場所が分からない', description: 'ECで見る場所を絞り、GA4を開きながら定番レポートを順番に設定できます。', href: '/ga4-report-setup', tags: ['GA4', '分析'] },
  { title: 'Clarity 超最小ガイド', problem: 'Clarity、どこを見ればいい？', description: '難しい分析は抜き。CVRや客単価の改善につながる、最低限見る場所だけに絞って案内します。', href: '/clarity-min-guide', tags: ['自社EC', '行動分析'] },
  { title: 'Meta広告 はじめて設定ナビ', problem: 'Meta広告の初期設定で迷う', description: '長いマニュアルではなく、今やる1手だけを表示。初期設定と計測確認を順番に進められます。', href: '/meta-setup', tags: ['Meta広告', '初期設定'] },
]

const managementTools: Tool[] = [
  { title: '売上ロードマップメーカー', problem: '目標はあるけど、月ごとの数字がない', description: '年商目標から月次売上・セッション・CVR・客単価を逆算し、毎月の施策までロードマップにします。', href: '/roadmap-maker', tags: ['目標設定', 'KPI'] },
  { title: 'ロードマップ進捗管理', problem: '計画どおり進んでいるか確認したい', description: '実績数字を入れて、目標との差と進捗を確認。次に見るべき指標が分かります。', href: '/roadmap-manager', tags: ['進捗管理', 'KPI'] },
  { title: '施策効果チェック', problem: 'やった施策、本当に効いた？', description: '施策を実施した日と前後の数字を記録し、セッション・CVR・客単価・売上の変化を振り返れます。', href: '/initiative-log', tags: ['効果検証', 'Amazon・楽天・GA4'] },
]

const allTools = [...amazonTools, ...rakutenTools, ...storeTools, ...managementTools]

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a className={styles.toolCard} href={tool.href}>
      <div className={styles.toolProblem}>{tool.problem}</div>
      <h3>{tool.title}</h3>
      <p>{tool.description}</p>
      <div className={styles.toolBottom}>
        <div className={styles.tags}>{tool.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <strong>無料で使う <span>→</span></strong>
      </div>
    </a>
  )
}

function ToolSection({ id, kicker, title, lead, tools }: { id: string; kicker: string; title: string; lead: string; tools: Tool[] }) {
  return (
    <section className={styles.toolSection} id={id}>
      <div className={styles.sectionHead}>
        <div><span className={styles.kicker}>{kicker}</span><h2>{title}</h2></div>
        <p>{lead}</p>
      </div>
      <div className={styles.toolGrid}>{tools.map((tool) => <ToolCard key={tool.title} tool={tool} />)}</div>
    </section>
  )
}

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav className={styles.nav}>
          <a href="#how">使い方</a>
          <a href="#tools">無料ツール</a>
          <a href="/company">運営会社</a>
          <a href={REQUEST_URL}>企業の方</a>
          <a className={styles.navCta} href={PLAYER_URL}>プレイヤー登録</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.heroBadge}>完全無料・手数料ゼロのECマッチング</div>
          <h1 className={styles.matchTitle}><span>ECプレイヤーと、</span><br /><em><span>EC企業を</span><span>つなぐ。</span></em></h1>
          <p className={styles.heroLead}>広告運用、楽天・Amazonの運営、商品ページ改善、CRM。<strong>実技診断でスキルが見えるECプレイヤーと、手を借りたいEC企業が、無料で直接つながる場所です。</strong>EC担当者向けの無料ツールも{allTools.length}個そろえています。</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href={PLAYER_URL}>実技診断を受けて登録する</a>
            <a className={styles.secondary} href={REQUEST_URL}>企業の方：無料で相談する →</a>
          </div>
          <div className={styles.trustRow}><span>✓ 登録も相談も無料</span><span>✓ 紹介料・手数料ゼロ</span><span>✓ スキルは実技診断で見える</span></div>
        </div>

        <div className={styles.doors}>
          <a className={styles.door} href={PLAYER_URL}>
            <span className={styles.doorFor}>ECの仕事を探している方</span>
            <strong>EC市場価値診断を受けて、副業・業務委託の相談を受け取る</strong>
            <p>実務の問題18問で、想定年収・時給相当・得意分野が分かります。結果からそのまま無料登録できます。</p>
            <b>無料で診断する →</b>
          </a>
          <a className={`${styles.door} ${styles.doorCompany}`} href={REQUEST_URL}>
            <span className={styles.doorFor}>EC人材を探している企業の方</span>
            <strong>やりたいことを送るだけで、合うECプレイヤーを紹介</strong>
            <p>分野・販路・予算感を送ると、条件に合う登録プレイヤーを診断スコア付きでご紹介します。</p>
            <b>無料で相談する →</b>
          </a>
        </div>
      </section>

      <section className={styles.how} id="how">
        <div className={styles.howCol}>
          <span className={styles.kicker}>ECプレイヤーの方</span>
          <h2>実力を見せて、仕事を受ける</h2>
          <ol>
            <li><b>01</b><div><strong>実技診断を受ける</strong><p>約10分・登録不要。想定年収と時給相当が分かります。</p></div></li>
            <li><b>02</b><div><strong>結果から無料登録</strong><p>稼働時間・希望時給・得意分野を登録。診断スコアが実績の証明になります。</p></div></li>
            <li><b>03</b><div><strong>相談が届く</strong><p>合う企業の相談がメールで届きます。受けるかどうかはあなたが決められます。</p></div></li>
          </ol>
          <a className={styles.primary} href={PLAYER_URL}>無料で診断する</a>
        </div>
        <div className={styles.howCol}>
          <span className={styles.kicker}>EC企業の方</span>
          <h2>困りごとを送って、プロに頼む</h2>
          <ol>
            <li><b>01</b><div><strong>相談内容を送る</strong><p>分野・販路・予算感・稼働をフォームで送ります。3分ほどです。</p></div></li>
            <li><b>02</b><div><strong>プレイヤーの紹介を受ける</strong><p>条件に合う登録プレイヤーを、実技診断のスコア付きでご紹介します。</p></div></li>
            <li><b>03</b><div><strong>直接やりとり</strong><p>契約・報酬はプレイヤーと直接決めます。紹介料・手数料はかかりません。</p></div></li>
          </ol>
          <a className={styles.primary} href={REQUEST_URL}>無料で相談する</a>
        </div>
      </section>

      <section className={styles.quickPick} id="tools">
        <div className={styles.quickIntro}><span className={styles.kicker}>EC担当者のための無料ツール</span><h2>まず自分で直すなら？</h2></div>
        <div className={styles.quickGrid}>
          <a href="#amazon"><span>01</span><strong>Amazonを改善したい</strong><p>広告・利益・商品ページ・レビュー</p><b>→</b></a>
          <a href="#rakuten"><span>02</span><strong>楽天を改善したい</strong><p>RPP・利益・商品ページ・レビュー</p><b>→</b></a>
          <a href="#store"><span>03</span><strong>自社ECを改善したい</strong><p>サイト診断・GA4・Clarity・Meta広告</p><b>→</b></a>
          <a href="#management"><span>04</span><strong>数字と施策を管理したい</strong><p>目標・進捗・効果検証</p><b>→</b></a>
        </div>
      </section>

      <ToolSection id="amazon" kicker="Amazon" title="Amazonの売上・広告を改善" lead="利益を守りながら広告を伸ばす。商品ページとレビューも含めて、Amazon運営で繰り返し発生する判断を短くします。" tools={amazonTools} />
      <ToolSection id="rakuten" kicker="楽天市場" title="楽天の売上・RPPを改善" lead="広告をどこまで使えるか、商品ページに何が足りないか、レビューをどう売上改善につなげるかをすぐ確認できます。" tools={rakutenTools} />
      <ToolSection id="store" kicker="自社EC・共通" title="集客・CVR・計測を改善" lead="サイト全体の診断からGA4、Clarity、Meta広告まで。専門用語を覚えるより先に、必要な設定と改善を進められます。" tools={storeTools} />
      <ToolSection id="management" kicker="計画・効果検証" title="目標を作って、施策の結果まで見る" lead="売上目標をKPIに分解し、実績との差を確認。施策をやりっぱなしにせず、本当に効いたかまで振り返れます。" tools={managementTools} />

      <section className={styles.reasonSection}>
        <div className={styles.reasonCopy}>
          <span className={styles.kicker}>EC担当者のための道具箱</span>
          <h2>Excelを作る前に、<br />ここで終わらせる。</h2>
          <p>「毎回同じ計算をする」「レポートを見ても判断できない」「チェック項目を忘れる」。そんな小さな作業を、その場で終わらせるためのツールを揃えています。</p>
        </div>
        <div className={styles.reasonGrid}>
          <article><b>01</b><strong>入力が少ない</strong><p>URL、CSV、数字など、必要なものだけ入れて使えます。</p></article>
          <article><b>02</b><strong>結果が分かりやすい</strong><p>分析そのものではなく、「次に何を見るか・何をするか」まで整理します。</p></article>
          <article><b>03</b><strong>ECに特化</strong><p>Amazon、楽天、自社ECの実務で使う判断だけに絞っています。</p></article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <span>日本一のECプレイヤーマッチングを、無料で</span>
        <h2>ECの仕事と人が、<br />ここでつながる。</h2>
        <p>プレイヤーは実技診断から無料登録。企業はフォームから無料で相談。手数料はどちらもかかりません。</p>
        <div className={styles.finalActions}>
          <a href={PLAYER_URL}>プレイヤーとして登録する →</a>
          <a className={styles.finalGhost} href={REQUEST_URL}>企業として相談する →</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}><a href="/" className={styles.brand}>EC<span>players</span></a><p>ECプレイヤーとEC企業をつなぐ無料マッチング｜ECの売上改善に使う無料ツール集</p></div>
        <nav><a href={PLAYER_URL}>プレイヤー登録</a><a href={REQUEST_URL}>企業の方：無料相談</a><a href="#amazon">Amazon</a><a href="#rakuten">楽天</a><a href="#store">自社EC</a><a href="#management">計画・効果検証</a><a href="/company">会社概要</a><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><a href="/trademarks">第三者商標</a></nav>
        <small>運営：株式会社まんがびと</small>
      </footer>
    </main>
  )
}
