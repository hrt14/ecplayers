const features = [
  {
    title: '匿名プロフィール',
    text: '本名や勤務先を公開せず、スキル・経歴・希望条件など仕事に必要な情報だけで登録できます。',
  },
  {
    title: '企業も匿名で募集',
    text: '企業名を公開せず、事業内容・募集内容・予算・必要スキルなどからプレイヤーを探せます。',
  },
  {
    title: 'まずは、話してみる',
    text: '気になる相手が見つかったら「連絡してみる」。ECplayersは出会いのきっかけをつくります。',
  },
]

export default function Home() {
  return (
    <main>
      <header className="header">
        <a className="logo" href="#">ECplayers</a>
        <nav>
          <a href="#players">プレイヤーを探す</a>
          <a href="#jobs">仕事を探す</a>
          <a className="navButton" href="#register">無料登録</a>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow">FREE EC BUSINESS MATCHING</div>
        <h1>ECの仕事と、人が、<br />もっと自由につながる。</h1>
        <p className="lead">
          ECを成長させたい企業と、ECの経験を持つプレイヤーがつながる、
          無料のECビジネスマッチングサイト。
        </p>
        <div className="actions" id="register">
          <a className="primary" href="#players">プレイヤーとして無料登録</a>
          <a className="secondary" href="#companies">企業として無料登録</a>
        </div>
        <p className="note">登録無料・掲載無料・マッチング無料</p>
      </section>

      <section className="stats" aria-label="ECplayersの特徴">
        <div><strong>0円</strong><span>登録料</span></div>
        <div><strong>0円</strong><span>案件掲載料</span></div>
        <div><strong>0円</strong><span>マッチング手数料</span></div>
      </section>

      <section className="section" id="players">
        <div className="sectionHeading">
          <span>FOR PLAYERS</span>
          <h2>あなたのEC経験が、次の仕事になる。</h2>
          <p>会社名や本名ではなく、何ができるかでつながる場所。</p>
        </div>
        <div className="sampleCard">
          <div className="sampleTop">
            <div className="avatar">P</div>
            <div>
              <small>PLAYER #01842</small>
              <h3>楽天市場の運営・改善が得意</h3>
            </div>
          </div>
          <div className="tags">
            <span>楽天市場</span><span>RPP</span><span>商品ページ改善</span><span>10年以上</span><span>月20〜40時間</span>
          </div>
          <p>年商10億円規模のEC事業で運営経験。売上分析から広告運用、商品ページ改善まで対応可能。</p>
          <button type="button">このプレイヤーに連絡してみる</button>
        </div>
      </section>

      <section className="section alt" id="companies">
        <div className="sectionHeading">
          <span>FOR COMPANIES</span>
          <h2>会社名を出さなくても、相談できる。</h2>
          <p>募集内容や条件から、必要なECプレイヤーとつながれます。</p>
        </div>
        <div className="sampleCard company" id="jobs">
          <div className="sampleTop">
            <div className="avatar">C</div>
            <div>
              <small>COMPANY #00321</small>
              <h3>楽天市場の売上改善を相談したい</h3>
            </div>
          </div>
          <div className="tags">
            <span>食品メーカー</span><span>楽天</span><span>Amazon</span><span>月20時間程度</span><span>予算15〜25万円</span>
          </div>
          <p>EC年商1〜5億円。楽天市場の改善を一緒に進められる経験者を探しています。</p>
          <button type="button">この企業に連絡してみる</button>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeading centered">
          <span>HOW IT WORKS</span>
          <h2>個人を特定せず、仕事に必要な情報だけ。</h2>
        </div>
        <div className="featureGrid">
          {features.map((feature, index) => (
            <article key={feature.title}>
              <b>0{index + 1}</b>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>ECの仕事なら、ECplayers。</h2>
        <p>まずは匿名プロフィールから。無料で始められます。</p>
        <div className="actions">
          <a className="primary light" href="#register">プレイヤーとして登録</a>
          <a className="secondary dark" href="#register">企業として登録</a>
        </div>
      </section>

      <footer>
        <strong>ECplayers</strong>
        <span>無料のECビジネスマッチングサイト</span>
        <small>© ECplayers</small>
      </footer>
    </main>
  )
}
