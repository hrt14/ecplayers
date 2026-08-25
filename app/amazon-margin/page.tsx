import type { Metadata } from 'next'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Amazon限界利益計算機 | ECplayers',
  description: '商品ごとの限界利益から、限界ROAS・限界ACOS・限界TACOSを計算。現在TACOSと広告費の余力も確認できます。',
}

export default function AmazonMarginPage() {
  return <Calculator />
}
