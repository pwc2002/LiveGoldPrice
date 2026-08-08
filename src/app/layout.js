import './globals.css'

export const metadata = {
  title: '실시간 금시세',
  description: '한국금거래소 실시간 금시세',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
