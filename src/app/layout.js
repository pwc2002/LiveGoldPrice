import './globals.css'

export const metadata = {
  title: '실시간 금시세',
  description: '한국금거래소 실시간 금시세',
}

// TV WebView가 ~960px 가상 폭으로 렌더링해 xl 브레이크포인트가 안 걸리는 문제 방지 —
// 뷰포트를 1280으로 고정해 TV에서 항상 xl 크기(가장 큰 글자)로 표시되게 한다
export const viewport = {
  width: '1280',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
