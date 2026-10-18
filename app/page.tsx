import type { Metadata } from 'next'
import styles from './Home.module.css'

const PLAYER_URL = 'https://shindan.ecplayers.com/'
const REQUEST_URL = 'https://shindan.ecplayers.com/request'

export const metadata: Metadata = {
  title: 'ECプレイヤーズ | 中抜きゼロ。ECプレイヤーと企業が直接つながる',
  description:
    '紹介料・手数料0円のECマッチング。企業が払った報酬は、そのままECプレイヤーに届きます。Amazon・楽天・自社ECの運用ができるプロに、実技診断のスコアを見て直接依頼できます。',
}

// 診断の時給目安（src/data/salary.json の年収レンジ × 倍率から算出した、レベルごとの業務委託の時給相当）
const RATES = [
  { level: 'ビギナー', range: '3,000〜4,100' },
  { level: 'ジュニア', range: '4,100〜5,700' },
  { level: 'ミドル', range: '5,700〜8,300' },
  { level: 'シニア', range: '8,300〜11,000' },
  { level: 'エキスパート', range: '11,000〜15,000' },
]

const FAQ = [
  ['ECの副業・業務委託の仕事はどこで探せますか？', 'ECプレイヤーズでは、約10分の実技診断を受けて無料登録すると、スキルに合ったEC企業からの相談がメールで届きます。報酬から手数料が引かれないので、提示された金額がそのまま手取りになります。'],
  ['EC運用代行やEC人材を、手数料なしで頼めるサービスはありますか？', 'ECプレイヤーズは、企業からもプレイヤーからも紹介料・手数料を取らないECマッチングです。依頼内容をフォームで送ると、条件に合うECプレイヤーを実技診断のスコア付きで無料で紹介します。'],
  ['本当に無料ですか？', 'はい。プレイヤーの登録、企業からの相談、プレイヤーのご紹介まで、どちら側からも紹介料・手数料・月額費用は現在いただいていません。'],
  ['どうして手数料がかからないのですか？', 'いまは、手数料0円でどれだけ多くの企業とプレイヤーに使っていただけるかを確かめている段階のため、どちらからも手数料をいただいていません。報酬のやりとりにECプレイヤーズは入らないので、差し引く手数料もありません。料金について変更する場合は、事前にサイトでお知らせします。'],
  ['契約や報酬の支払いはどうなりますか？', 'ご紹介のあとは、企業とプレイヤーが直接やりとりし、契約・報酬・支払い方法も当事者どうしで決めていただきます。'],
  ['どんな仕事がありますか？', 'Amazon・楽天・Yahoo!・自社ECの運営代行、広告運用、商品ページ改善、データ分析、CRMなど、EC実務全般です。週5時間程度の副業から相談できます。'],
  ['スキルはどうやって確かめるのですか？', 'プレイヤーは登録の前に、EC実務の判断を問う18問の実技診断を受けます。企業には分野別のスコアと想定レベルをお伝えするので、経歴書だけでは分からない実力を確かめられます。'],
]

const SITE = 'https://ecplayers.com'
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'ECプレイヤーズ',
      alternateName: ['EC PLAYERS', 'ECplayers'],
      url: SITE,
      parentOrganization: { '@type': 'Organization', name: '株式会社まんがびと', url: `${SITE}/company` },
      description: 'ECの仕事をしたいECプレイヤーと、EC人材を探す企業を、紹介料・手数料0円で直接つなぐマッチングサービス。',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'ECプレイヤーズ',
      inLanguage: 'ja',
      publisher: { '@id': `${SITE}/#org` },
    },
    {
      '@type': 'Service',
      name: 'ECプレイヤーズ（ECプレイヤーと企業のマッチング）',
      provider: { '@id': `${SITE}/#org` },
      serviceType: 'EC人材マッチング・EC副業マッチング',
      areaServed: 'JP',
      audience: [
        { '@type': 'Audience', audienceType: 'EC運用の副業・業務委託の仕事を探しているECプレイヤー' },
        { '@type': 'Audience', audienceType: 'Amazon・楽天・自社ECの運用を依頼したいEC企業' },
      ],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '紹介料・手数料・月額費用は0円。報酬は企業からプレイヤーに全額直接支払われます。' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
}

function HeroVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.deal}>
        <div className={styles.dealRow}><span>企業が払う報酬</span><b className={styles.num}>¥200,000</b></div>
        <div className={styles.dealFee}><span>手数料</span><b className={styles.num}>¥0</b></div>
        <div className={`${styles.dealRow} ${styles.dealTotal}`}><span>プレイヤーの手取り</span><b className={styles.num}>¥200,000</b></div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.avatar}>KS</span>
          <div>
            <strong>楽天・Amazon運用</strong>
            <small>シニア ・ 経験8年 ・ 週15時間</small>
          </div>
          <span className={styles.badge}>実技診断済</span>
        </div>
        <ul className={styles.skills}>
          <li><span>広告運用</span><i style={{ width: '92%' }} /></li>
          <li><span>モール運営</span><i style={{ width: '86%' }} /></li>
          <li><span>データ分析</span><i style={{ width: '74%' }} /></li>
        </ul>
        <div className={styles.cardFoot}>
          <span>希望時給</span>
          <b className={styles.num}>¥9,000</b>
        </div>
      </div>

      <div className={styles.request}>
        <span className={styles.requestTag}>新しい相談</span>
        <strong>楽天RPP広告の改善を手伝ってほしい</strong>
        <small>月10〜30万円 ・ 週5〜10時間 ・ リモート</small>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <header className={styles.header}>
        <a href="/" className={styles.wordmark}>EC PLAYERS</a>
        <nav className={styles.nav}>
          <a href="#players">プレイヤーの方</a>
          <a href="#companies">企業の方</a>
          <a href="#faq">よくある質問</a>
          <a className={styles.navCta} href={PLAYER_URL}>無料で登録</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>紹介料・手数料 0円のECマッチング</p>
          <h1>払った報酬が、<br />そのまま届く。</h1>
          <p className={styles.lead}>
            Amazon・楽天・自社ECを動かせるECプレイヤーと、手を借りたい企業を直接つなぎます。
            間に入って手数料を抜く人はいません。企業は相場より安く頼めて、プレイヤーは相場より高く受けられます。
          </p>
          <div className={styles.ctas}>
            <a className={styles.primary} href={PLAYER_URL}>プレイヤーとして登録する</a>
            <a className={styles.secondary} href={REQUEST_URL}>ECプレイヤーに依頼する</a>
          </div>
          <p className={styles.note}>どちらも無料です。登録の前に、約10分の実技診断で想定時給が分かります。</p>
        </div>
        <HeroVisual />
      </section>

      <section className={styles.facts}>
        <div><b className={styles.num}>0<small>円</small></b><span>紹介料・手数料</span></div>
        <div><b className={styles.num}>100<small>%</small></b><span>報酬はプレイヤーへ</span></div>
        <div><b className={styles.num}>18<small>問</small></b><span>実技診断でスキルを確認</span></div>
      </section>

      <section className={styles.compare}>
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>中抜きゼロ</p>
          <h2>同じ20万円で、<br />手取りがこれだけ違う。</h2>
          <p>一般的なクラウドソーシングでは、報酬から手数料が差し引かれます。ECプレイヤーズは報酬のやりとりに入らないので、差し引くものがありません。</p>
        </div>
        <div className={styles.compareGrid}>
          <div className={styles.compareCol}>
            <span>手数料16.5%のサービスの場合</span>
            <dl>
              <div><dt>企業が払う</dt><dd className={styles.num}>¥200,000</dd></div>
              <div><dt>手数料</dt><dd className={`${styles.num} ${styles.minus}`}>−¥33,000</dd></div>
              <div className={styles.compareTotal}><dt>プレイヤーの手取り</dt><dd className={styles.num}>¥167,000</dd></div>
            </dl>
          </div>
          <div className={`${styles.compareCol} ${styles.compareUs}`}>
            <span>ECプレイヤーズ</span>
            <dl>
              <div><dt>企業が払う</dt><dd className={styles.num}>¥200,000</dd></div>
              <div><dt>手数料</dt><dd className={styles.num}>¥0</dd></div>
              <div className={styles.compareTotal}><dt>プレイヤーの手取り</dt><dd className={styles.num}>¥200,000</dd></div>
            </dl>
          </div>
        </div>
        <p className={styles.fine}>手数料率はサービスや金額によって異なります。上の例は報酬から16.5%が差し引かれる場合の計算です。</p>
      </section>

      <section className={`${styles.side} ${styles.light}`} id="players">
        <div className={styles.sideInner}>
          <div className={styles.sideCopy}>
            <p className={styles.kicker}>ECプレイヤーの方へ</p>
            <h2>ECの腕を、<br />正当な時給で。</h2>
            <ul className={styles.points}>
              <li><strong>報酬は全額あなたに</strong><span>手数料で手取りが削られません。決めた金額がそのまま入ります。</span></li>
              <li><strong>職務経歴書はいらない</strong><span>実技診断のスコアが実力の証明になります。肩書きより腕で選ばれます。</span></li>
              <li><strong>週5時間・リモートから</strong><span>本業のかたわらの副業でも。稼働時間と希望時給はあなたが決めます。</span></li>
            </ul>
            <a className={styles.primary} href={PLAYER_URL}>実技診断を受けて登録する</a>
          </div>
          <div className={styles.rates}>
            <p className={styles.ratesTitle}>実技診断のレベル別 時給目安</p>
            <table>
              <tbody>
                {RATES.map((r) => (
                  <tr key={r.level}><th>{r.level}</th><td className={styles.num}>{r.range}<small>円</small></td></tr>
                ))}
              </tbody>
            </table>
            <p className={styles.fine}>業務委託の時給相当の目安です。実際の報酬は企業との相談で決まります。</p>
          </div>
        </div>
      </section>

      <section className={styles.side} id="companies">
        <div className={styles.sideInner}>
          <div className={styles.sideCopy}>
            <p className={styles.kicker}>EC企業の方へ</p>
            <h2>手数料0円で、<br />腕の確かなプロに頼む。</h2>
            <ul className={styles.points}>
              <li><strong>予算がまるごと仕事になる</strong><span>手数料に消える分がありません。同じ予算で、より経験のあるプロに頼めます。</span></li>
              <li><strong>実力はスコアで分かる</strong><span>広告運用・分析・CVR改善・CRM・モール運営・利益管理の6分野のスコアを見て選べます。</span></li>
              <li><strong>直接やりとり・直接契約</strong><span>間に誰も入らないので、話が早く、条件も自由に決められます。</span></li>
            </ul>
            <a className={styles.primary} href={REQUEST_URL}>無料で依頼内容を送る</a>
          </div>
          <ol className={styles.steps}>
            <li><b className={styles.num}>01</b><div><strong>依頼内容を送る</strong><span>やりたいこと・販路・予算感をフォームで。3分ほどです。</span></div></li>
            <li><b className={styles.num}>02</b><div><strong>合うプロを紹介</strong><span>条件に合う登録プレイヤーを、診断スコア付きでメールでご紹介します。</span></div></li>
            <li><b className={styles.num}>03</b><div><strong>直接契約</strong><span>気になるプレイヤーと直接話して、報酬と進め方を決めます。</span></div></li>
          </ol>
        </div>
      </section>

      <section className={`${styles.faq} ${styles.light}`} id="faq">
        <div className={styles.faqInner}>
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>よくある質問</p>
            <h2>無料なのには、理由があります。</h2>
          </div>
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.final}>
        <h2>ECの仕事を、<br />中抜きなしで。</h2>
        <div className={styles.ctas}>
          <a className={styles.primary} href={PLAYER_URL}>プレイヤーとして登録する</a>
          <a className={styles.secondary} href={REQUEST_URL}>ECプレイヤーに依頼する</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="/" className={styles.wordmark}>EC PLAYERS</a>
        <nav>
          <a href={PLAYER_URL}>プレイヤー登録</a>
          <a href={REQUEST_URL}>企業の方</a>
          <a href="/company">運営会社</a>
          <a href="/terms">利用規約</a>
          <a href="/privacy">プライバシー</a>
        </nav>
        <small>運営：株式会社まんがびと</small>
      </footer>
    </main>
  )
}
