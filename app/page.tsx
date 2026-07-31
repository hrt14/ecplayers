const playerTags = ['楽天市場', 'Amazon', 'Shopify', '広告運用', 'CRM', '商品開発', '物流', 'デザイン']

const players = [
  { id: '01842', title: '楽天市場の運営・改善が得意', meta: 'EC運営 10年以上', tags: ['楽天市場', 'RPP', '商品ページ改善'], text: '年商10億円規模のEC事業で運営経験。売上分析から広告運用、商品ページ改善まで対応可能。' },
  { id: '00617', title: 'Amazon広告・商品改善を支援', meta: 'EC支援 7年以上', tags: ['Amazon', '広告運用', 'SEO'], text: 'メーカー・小売のAmazon運用を経験。広告最適化と商品ページ改善を中心に支援できます。' },
  { id: '02109', title: '自社ECのグロースが得意', meta: 'EC責任者経験あり', tags: ['Shopify', 'CRM', '分析'], text: '自社ECの立ち上げから運営改善まで経験。CRM、LTV改善、サイト分析を横断して対応。' },
]

const jobs = [
  { id: '00321', title: '楽天市場の売上改善を相談したい', company: '食品メーカー', tags: ['楽天', '月20時間程度', '15〜25万円'], text: 'EC年商1〜5億円。楽天市場の改善を一緒に進められる経験者を探しています。' },
  { id: '00148', title: 'Amazon運営を一緒に伸ばしたい', company: '生活雑貨メーカー', tags: ['Amazon', 'リモート', '月10〜20時間'], text: '広告と商品ページを中心に、運用を伴走してくれるプレイヤーを探しています。' },
]

export default function Home() {
  return (
    <main>
      <header className="header">
        <a className="logo" href="#">EC<span>players</span></a>
        <nav>
          <a href="#players">プレイヤーを探す</a>
          <a href="#jobs">仕事を探す</a>
          <a href="#about">ECplayersとは</a>
          <a className="navButton" href="#register">無料で登録</a>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow">EC BUSINESS NETWORK</div>
        <h1>ECの仕事なら、<br /><em>ECplayers。</em></h1>
        <p className="lead">ECの経験を持つ人と、ECの力を必要とする企業が、もっと気軽につながれる場所。<br className="desktop" />匿名で登録できる、無料のECビジネスマッチングサイトです。</p>
        <div className="actions" id="register">
          <a className="primary" href="#players">プレイヤーとして無料登録 <b>→</b></a>
          <a className="secondary" href="#jobs">企業として無料登録 <b>→</b></a>
        </div>
        <div className="freeLine"><span>登録</span><b>0円</b><i>・</i><span>掲載</span><b>0円</b><i>・</i><span>マッチング</span><b>0円</b></div>
      </section>

      <section className="networkStrip">
        <p>ECに関わる、いろんな経験が集まる。</p>
        <div>{playerTags.map(tag => <span key={tag}>{tag}</span>)}</div>
      </section>

      <section className="section" id="players">
        <div className="sectionHeadRow">
          <div className="sectionHeading"><span>FIND PLAYERS</span><h2>「誰か」より、<br />「何ができるか」で探す。</h2><p>本名も勤務先も必要ありません。仕事に必要な経験とスキルだけでつながります。</p></div>
          <a className="textLink" href="#">プレイヤーをもっと見る →</a>
        </div>
        <div className="cardGrid">
          {players.map((p, index) => <article className="profileCard" key={p.id}>
            <div className="cardTop"><div className={`avatar a${index}`}>P</div><div><small>PLAYER #{p.id}</small><strong>{p.meta}</strong></div></div>
            <h3>{p.title}</h3><div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div><p>{p.text}</p>
            <button>連絡してみる <span>→</span></button>
          </article>)}
        </div>
      </section>

      <section className="section jobsSection" id="jobs">
        <div className="sectionHeadRow">
          <div className="sectionHeading"><span>FIND WORK</span><h2>ECの経験を、<br />必要としている企業がいる。</h2><p>企業も匿名で相談できます。会社名ではなく、仕事内容や条件を見て話してみる。</p></div>
          <a className="textLink" href="#">仕事をもっと見る →</a>
        </div>
        <div className="jobGrid">
          {jobs.map(j => <article className="jobCard" key={j.id}><div className="jobLabel">COMPANY #{j.id}</div><div className="companyType">{j.company}</div><h3>{j.title}</h3><div className="tags">{j.tags.map(t => <span key={t}>{t}</span>)}</div><p>{j.text}</p><button>この企業に連絡してみる <span>→</span></button></article>)}
          <article className="joinCard"><span>FOR COMPANIES</span><h3>探しているEC人材を、<br />無料で募集できます。</h3><p>会社名を公開しなくてもOK。まずは相談内容だけ掲載してみませんか。</p><a href="#register">企業として無料登録 →</a></article>
        </div>
      </section>

      <section className="philosophy" id="about">
        <div><span>WHY ECplayers?</span><h2>もっと気軽に、<br />もっと直接つながれる<br />EC業界へ。</h2></div>
        <div className="philosophyText"><p>ECの仕事には、運営、広告、制作、物流、商品開発など、たくさんの専門性があります。</p><p>ECplayersは、その経験を持つ人と必要とする企業が、肩書きや会社名に縛られず出会える場所をつくります。</p><strong>まずは「ちょっと話してみる」から。</strong></div>
      </section>

      <section className="privacyBlock">
        <div className="lock">◎</div><div><span>ANONYMOUS BY DESIGN</span><h2>仕事に必要な情報だけ。</h2><p>公開プロフィールに本名・勤務先・住所・電話番号は必要ありません。スキル、経歴、希望条件など、マッチングに必要な情報だけで登録できます。</p></div>
        <div className="privacyItems"><p><b>✓</b> 匿名プロフィール</p><p><b>✓</b> 企業も匿名掲載OK</p><p><b>✓</b> 連絡先は一般公開しない</p></div>
      </section>

      <section className="cta">
        <span>JOIN ECplayers</span><h2>ECの経験と仕事が、<br />ここに集まる。</h2><p>登録も、掲載も、マッチングも無料。</p><div className="actions"><a className="primary light" href="#register">プレイヤーとして登録 →</a><a className="secondary dark" href="#register">企業として登録 →</a></div>
      </section>

      <footer><a className="logo" href="#">EC<span>players</span></a><span>無料のECビジネスマッチングサイト</span><nav><a href="#about">ECplayersとは</a><a href="#players">プレイヤー</a><a href="#jobs">仕事</a></nav><small>© ECplayers</small></footer>
    </main>
  )
}