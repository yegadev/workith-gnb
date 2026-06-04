import type { ReactNode } from 'react'
import type { AppsSource } from './apps'
import GnbErrorBoundary from './GnbErrorBoundary'
import SuperGnbRail from './SuperGnbRail'

export interface GnbShellProps {
  /** 현재 앱 id (예: 'mail') — 강조 표시용 */
  currentAppId: string
  /** 앱 목록 공급자 — 생략 시 mock JSON 기반 StaticAppsSource */
  appsSource?: AppsSource
  /** 기존 호스트 앱 전체 */
  children: ReactNode
}

/**
 * 호스트 앱이 사용하는 유일한 진입점.
 * 좌측 레일 + 콘텐츠 영역의 flex 레이아웃을 패키지가 책임지므로
 * 호스트는 offset 계산 없이 앱 최상위를 이 컴포넌트로 감싸기만 하면 된다.
 *
 * 사용 예:
 *   <GnbShell currentAppId="mail">
 *     <App />
 *   </GnbShell>
 */
export default function GnbShell({ currentAppId, appsSource, children }: GnbShellProps) {
  return (
    <div className="wgnb-flex wgnb-h-screen wgnb-w-full">
      {/* 레일만 에러 경계로 보호 — GNB 장애 시 children 은 영향 없음 */}
      <GnbErrorBoundary>
        <SuperGnbRail currentAppId={currentAppId} appsSource={appsSource} />
      </GnbErrorBoundary>
      {/* 호스트 콘텐츠 — 레일 폭 변화에 flex 로 자동 추종, 스크롤은 이 영역 안에서 */}
      <div className="wgnb-min-w-0 wgnb-flex-1 wgnb-overflow-auto">{children}</div>
    </div>
  )
}
