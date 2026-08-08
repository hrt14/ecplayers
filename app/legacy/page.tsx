import MarketDiagnosis from '../MarketDiagnosis'

const playerTags = ['楽天市場', 'Amazon', 'Shopify', 'Yahoo!ショッピング', '広告運用', 'CRM', '商品開発', '物流', 'デザイン']

const players = [
  { id: '01842', title: '楽天市場の運営・改善が得意', meta: 'EC運営 10年以上', availability: '月20〜40時間', tags: ['楽天市場', 'RPP', '商品ページ改善'], text: '年商10億円規模のEC事業で運営経験。売上分析から広告運用、商品ページ改善まで対応可能。' },
  { id: '00617', title: 'Amazon広告・商品改善を支援', meta: 'EC支援 7年以上', availability: '月10〜30時間', tags: ['Amazon', '広告運用', 'SEO'], text: 'メーカー・小売のAmazon運用を経験。広告最適化と商品ページ改善を中心に支援できます。' },
  { id: '02109', title: '自社ECのグロースが得意', meta: 'EC責任者経験あり', availability: '月20時間〜', tags: ['Shopify', 'CRM', '分析'], text: '自社ECの立ち上げから運営改善まで経験。CRM、LTV改善、サイト分析を横断して対応。' },
  { id: '01456', title: 'ECデザイン・LP改善を担当', meta: '制作経験 8年以上', availability: 'スポット相談可', tags: ['デザイン', 'LP', 'バナー'], text: 'EC向けクリエイティブを中心に、LP・商品画像・広告バナーの改善に対応できます。' },
  { id: '00983', title: '物流・バックヤード改善が得意', meta: '物流管理 10年以上', availability: '月10時間〜', tags: ['物流', '在庫', '業務改善'], text: '出荷、在庫、倉庫連携などECバックヤードの改善と運用設計を経験しています。' },
  { id: '02531', title: '商品企画から販売まで伴走', meta: 'メーカーEC経験あり', availability: 'プロジェクト可', tags: ['商品開発', '販促', 'モール'], text: '商品企画・発売・販促まで一連のEC業務を経験。新商品の立ち上げ支援が可能です。' },
]

const jobs = [
  { id: '00321', title: '楽天市場の売上改善を相談したい', company: '食品メーカー', condition: '月15〜25万円', tags: ['楽天', '月20時間程度', 'リモート'], text: 'EC年商1〜5億円。楽天市場の改善を一緒に進められる経験者を探しています。' },
  { id: '00148', title: 'Amazon運営を一緒に伸ばしたい', company: '生活雑貨メーカー', condition: '月10〜20万円', tags: ['Amazon', '広告運用', 'リモート'], text: '広告と商品ページを中心に、運用を伴走してくれるプレイヤーを探しています。' },
  { id: '00402', title: 'ShopifyのCRM改善を相談したい', company: 'D2Cブランド', condition: '条件応相談', tags: ['Shopify', 'CRM', 'スポット可'], text: 'リピート率とLTV改善のため、CRM施策を一緒に設計できる経験者を探しています。' },
]

export default function LegacyHome() {
  return (
    <main>
      <header className="header">
        <a className="logo" href="/legacy">EC<span>players</span></a>
        <nav><a href="#players">プレイヤーを探す</a><a href="#jobs">仕事を探す</a><a href="#diagnosis">報酬診断</a><a href="#about">ECplayersとは</a><a className="navButton" href="/">新サイトへ</a></nav>
      </header>
      <section className="hero"><div className="eyebrow">EC BUSINESS NETWORK</div><h1>ECの経験が、<br /><em>仕事になる。</em></h1><p className="lead">ECの経験を持つ人と、ECの力を必要とする企業が、もっと気軽につながれる場所。<br className="desktop" />本名や勤務先を出さずに使える、無料のECビジネスマッチングサイトです。</p><div className="searchBox"><div className="searchIcon">⌕</div><div className="searchCopy"><small>スキル・経験から探す</small><strong>楽天、Amazon、Shopify、広告運用...</strong></div><a href="#players">探す →</a></div><div className="quickTags">{playerTags.slice(0,6).map(tag => <a href="#players" key={tag}>{tag}</a>)}</div></section>
      <section className="networkStrip"><p>ECに関わる、いろんな経験が集まる。</p><div>{playerTags.map(tag => <span key={tag}>{tag}</span>)}</div></section>
      <MarketDiagnosis />
      <section className="section" id="players"><div className="sectionHeadRow"><div className="sectionHeading"><span>FIND PLAYERS</span><h2>会社名ではなく、<br />できることで探す。</h2><p>仕事に必要なスキル・経歴・稼働条件だけで探せる、匿名のECプレイヤーデータベース。</p></div></div><div className="cardGrid playerGrid">{players.map((p, index) => <article className="profileCard" key={p.id}><div className="cardTop"><div className={`avatar a${index % 3}`}>P</div><div><small>PLAYER #{p.id}</small><strong>{p.meta}</strong></div><span className="availability">{p.availability}</span></div><h3>{p.title}</h3><div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div><p>{p.text}</p></article>)}</div></section>
      <section className="section jobsSection" id="jobs"><div className="sectionHeadRow"><div className="sectionHeading"><span>FIND WORK</span><h2>「ちょっと相談したい」も、<br />立派な仕事になる。</h2></div></div><div className="jobGrid">{jobs.map(j => <article className="jobCard" key={j.id}><div className="companyType">{j.company}</div><h3>{j.title}</h3><strong className="condition">{j.condition}</strong><div className="tags">{j.tags.map(t => <span key={t}>{t}</span>)}</div><p>{j.text}</p></article>)}</div></section>
      <section className="philosophy" id="about"><div><span>WHY ECplayers?</span><h2>もっと気軽に、<br />もっと直接つながれる<br />EC業界へ。</h2></div><div className="philosophyText"><p>旧コンセプトの保存ページです。</p><strong><a href="/">現在のECplayersを見る →</a></strong></div></section>
    </main>
  )
}
