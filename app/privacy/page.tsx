import type { Metadata } from 'next'
import styles from '../legal/legal.module.css'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | ECplayers',
  description: 'ECplayersのプライバシーポリシーです。',
}

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>EC<span>players</span></a>
        <nav><a href="/#apps">アプリ一覧</a><a href="/company">会社概要</a><a href="/terms">利用規約</a><a href="/">トップへ戻る</a></nav>
      </header>
      <section className={styles.hero}>
        <span className={styles.kicker}>PRIVACY POLICY</span>
        <h1>プライバシーポリシー</h1>
        <p>株式会社まんがびとは、ECplayers上で提供する各アプリの運営にあたり、必要な情報を必要な範囲で取り扱います。</p>
      </section>
      <div className={styles.body}>
        <section><h2>1. 取得する情報</h2><p>ECplayersでは、各アプリの提供・改善のため、入力されたURLその他ユーザーが入力した情報、アクセス日時、ブラウザ情報、利用機能、エラー情報等を取得する場合があります。アカウント機能を提供する場合は、ログインに必要な識別情報等を取得する場合があります。</p></section>
        <section><h2>2. 画像比較・AI分析で扱う情報</h2><p>「検索サムネイル改善発見」では、ユーザーが選択した検索結果のスクリーンショット、モール種別、検索キーワードおよび自社商品の指定位置を、ユーザーが分析を実行した場合に限り、AI解析のため処理します。画像解析にはCloudflare Workers AIを利用します。</p><p>現行版では、アップロードされたスクリーンショットをECplayers独自の保存領域へ恒常的に保存する処理は行っていません。スクリーンショットには、分析に不要な個人情報、注文情報、ログイン情報その他の機密情報を含めないでください。</p></section>
        <section><h2>3. Chrome拡張で扱う情報</h2><p>開発中のChrome拡張β版では、ユーザーが明示的に分析操作を行った現在表示中のページから、価格、評価、レビュー件数、画像枚数、A+の有無等、比較に必要な情報を確認する設計です。</p><p>初期版では、ページHTML、商品画像、レビュー本文そのものを当社サーバーへ恒常的に保存せず、定量化・整理した情報を中心に扱う方針です。実際の提供時には、Chrome Web Store上の開示内容と本ポリシーを一致させます。</p></section>
        <section><h2>4. 利用目的</h2><ul><li>各アプリ・サービス機能の提供</li><li>分析結果、比較結果、提案その他の機能結果の表示</li><li>不具合調査、セキュリティ確保、品質改善</li><li>利用状況の統計的な分析</li><li>重要な仕様変更、規約変更等の案内</li></ul></section>
        <section><h2>5. 第三者提供・外部サービス</h2><p>法令に基づく場合を除き、本人の同意なく個人情報を第三者へ提供しません。サービス提供のためCloudflareその他の外部事業者を利用する場合は、必要な範囲で委託し、適切な管理に努めます。</p></section>
        <section><h2>6. アクセス解析等</h2><p>ECplayersでは、サービス改善のためアクセス解析等の外部サービスを利用する場合があります。導入するサービスに応じて、Cookieその他の識別技術が使用されることがあります。</p></section>
        <section><h2>7. 安全管理</h2><p>取得した情報について、不正アクセス、漏えい、滅失、毀損等を防ぐため、合理的な安全管理措置を講じます。また、不要となった情報は、利用目的や法令上の必要性を踏まえて削除・匿名化等を行います。</p></section>
        <section><h2>8. お問い合わせ</h2><p>本ポリシーに関するお問い合わせは、株式会社まんがびと公式サイトからご連絡ください。</p><p>制定日：2026年8月8日<br />最終改定日：2026年8月26日</p></section>
        <div className={styles.links}><a href="/terms">利用規約</a><a href="/trademarks">第三者商標について</a><a href="https://mangabito.biz/" target="_blank" rel="noreferrer">株式会社まんがびと公式サイト</a></div>
      </div>
      <footer className={styles.footer}><span>© 株式会社まんがびと</span><nav><a href="/#apps">アプリ一覧</a><a href="/terms">利用規約</a><a href="/privacy">プライバシー</a><a href="/trademarks">第三者商標</a></nav></footer>
    </main>
  )
}
