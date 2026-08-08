import type { Metadata } from 'next'
import styles from './company.module.css'

export const metadata: Metadata = {
  title: '会社概要 | ECplayers',
  description: 'ECplayersを運営する株式会社まんがびとの会社概要です。',
}

const profile = [
  ['社名', '株式会社まんがびと'],
  ['代表', '平田 学'],
  ['設立', '2013年8月26日'],
]

const businesses = [
  ['EC支援・コンサルティング', 'EC運営、商品ページ改善、広告運用、売上分析など、EC事業の成長支援を行っています。'],
  ['Webサービスの企画・運営', 'ECplayersをはじめ、実務をより軽く、速くするためのWebサービスやAI活用ツールを企画・開発しています。'],
  ['電子書籍出版', 'ビジネス・仕事術などを中心に、電子書籍の企画・編集・出版を行っています。'],
  ['Webメディア運営', '出版・ビジネス領域を中心としたWebメディアを運営しています。'],
]

const history = [
  ['2001', '株式会社サードウェーブにアルバイトとして入社。パソコンショップ店長を経て、中国での新規事業立ち上げ、新商品開拓を行う。'],
  ['2004', 'グループ会社である株式会社エバーグリーンに出向。同年、インターネットショップ「上海問屋」を立ち上げる。'],
  ['2005–2012', '「上海問屋」を、楽天市場で通算6回（2005/2006/2007/2008/2011/2012）のショップ・オブ・ザ・イヤー受賞を果たす人気ショップに育て上げる。'],
  ['2011', '株式会社エバーグリーン取締役に就任。'],
  ['2013', '同社取締役を辞任し、株式会社まんがびとを設立。'],
  ['2014', 'まんがびとビジネスhowtoブック事業開始。'],
  ['2015', 'ECコンサル事業開始。'],
  ['2016', '電子書籍事業の出版数1000冊突破。'],
  ['2025', '電子書籍の出版数3000冊突破。'],
  ['NOW', 'ECplayersを企画・開発。'],
]

export default function CompanyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav><a href="/diagnosis">ECサイト診断</a><a href="/">トップへ戻る</a></nav>
      </header>

      <section className={styles.hero}>
        <span>COMPANY</span>
        <h1>会社概要</h1>
        <p>ECplayersは、株式会社まんがびとが企画・開発・運営しています。</p>
      </section>

      <section className={styles.profileSection}>
        <div className={styles.profileCard}>
          {profile.map(([label, value]) => (
            <div className={styles.profileRow} key={label}><b>{label}</b><span>{value}</span></div>
          ))}
          <div className={styles.profileRow}><b>事業内容</b><span>EC支援・コンサルティング / Webサービスの企画・運営 / 電子書籍出版 / Webメディア運営</span></div>
        </div>
        <div className={styles.companyCopy}>
          <span>ABOUT MANGABITO</span>
          <h2>ECの実務から、<br />役に立つ仕組みをつくる。</h2>
          <p>株式会社まんがびとは、出版事業とEC支援を手がけてきた会社です。ECplayersでは、長年のEC運営・改善の経験を、誰でも使える診断・比較・分析の仕組みに変えていきます。</p>
          <a href="https://mangabito.biz/" target="_blank" rel="noreferrer">株式会社まんがびと 公式サイト →</a>
        </div>
      </section>

      <section className={styles.businessSection}>
        <div className={styles.sectionHead}><span>BUSINESS</span><h2>主な事業</h2></div>
        <div className={styles.businessGrid}>
          {businesses.map(([title, body], index) => (
            <article key={title}><small>0{index + 1}</small><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className={styles.historySection}>
        <div className={styles.sectionHead}><span>BACKGROUND</span><h2>代表のEC経歴と、まんがびとの歩み</h2><p>以下は、株式会社まんがびと代表・平田 学の経歴と、会社設立後の歩みです。</p></div>
        <div className={styles.historyList}>
          {history.map(([year, text]) => <div key={year}><b>{year}</b><span>{text}</span></div>)}
        </div>
      </section>

      <section className={styles.ecplayersSection}>
        <span>ECplayers</span>
        <h2>EC分析を、もっと軽く。</h2>
        <p>数えられるものはコードで。意味を考える必要があるところだけAIで。EC担当者が「次に何を見るべきか、何を直すべきか」に早くたどり着けるサービスを目指しています。</p>
        <a href="/">ECplayersを見る →</a>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <span>運営：株式会社まんがびと</span>
        <nav><a href="/company">会社概要</a><a href="https://mangabito.biz/" target="_blank" rel="noreferrer">公式サイト</a></nav>
        <small>© 株式会社まんがびと</small>
      </footer>
    </main>
  )
}
