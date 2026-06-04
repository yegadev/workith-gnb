import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GnbShell } from '../src'
import '../src/styles.css'

/** 호스트 앱을 흉내내는 데모 콘텐츠 */
function DemoApp() {
  return (
    <GnbShell currentAppId="mail">
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h1>호스트 앱 영역</h1>
        <p>좌측 W 로고를 클릭하면 레일이 펼쳐집니다 (56px ↔ 200px).</p>
        <p>비활성 앱 아이콘에 호버하면 툴팁이 표시됩니다.</p>
      </div>
    </GnbShell>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root 엘리먼트가 없습니다')

createRoot(rootEl).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>
)
