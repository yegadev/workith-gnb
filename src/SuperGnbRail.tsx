import { useEffect, useState } from 'react'
import AppIcon from './AppIcon'
import { type AppsSource, defaultAppsSource, type GnbApp } from './apps'

/** 펼침 상태 저장 키 — origin 단위라 도메인이 다른 서비스 간에는 공유되지 않음 (스펙 §5) */
const STORAGE_KEY = 'wgnb.expanded'

/** localStorage 에서 펼침 상태 복원 (접근 불가 환경은 접힘으로 폴백) */
function readExpanded(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

interface SuperGnbRailProps {
  /** 현재 앱 id — 해당 앱을 강조 표시하고 클릭을 무시한다 */
  currentAppId: string
  /**
   * 앱 목록 공급자 — 생략 시 mock JSON 기반 StaticAppsSource.
   * 주의: useEffect 의존성이므로 매 렌더마다 새 인스턴스를 넘기면 무한 재조회가 발생한다.
   * 모듈 상수 또는 useMemo/useState 로 안정화된 참조를 전달할 것.
   */
  appsSource?: AppsSource
}

/**
 * 좌측 아이콘 레일 본체.
 * - 접힘 56px ↔ 펼침 200px, 로고(W) 클릭으로 토글 (200ms transition)
 * - 모바일(<768px)에서는 숨김 — 1단계는 데스크톱 전용
 * - getApps 실패 시에도 레일은 렌더링하되 현재 앱만 표시 (fail-open)
 */
export default function SuperGnbRail({
  currentAppId,
  appsSource = defaultAppsSource,
}: SuperGnbRailProps) {
  const [apps, setApps] = useState<GnbApp[]>([])
  const [expanded, setExpanded] = useState(readExpanded)

  useEffect(() => {
    let cancelled = false
    appsSource.getApps().then(
      (loaded) => {
        if (!cancelled) setApps([...loaded].sort((a, b) => a.order - b.order))
      },
      () => {
        // fail-open: 목록 조회 실패 시 현재 앱 항목만 합성해 표시.
        // 메타데이터가 없으므로 id 를 이름으로, 아이콘은 폴백에 맡긴다.
        if (!cancelled) {
          setApps([
            { id: currentAppId, name: currentAppId, url: '#', icon: currentAppId, order: 0 },
          ])
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [appsSource, currentAppId])

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // 저장 실패는 무시 — 다음 방문 시 기본(접힘)으로 열릴 뿐
      }
      return next
    })
  }

  return (
    <nav
      aria-label="Workith 앱 전환"
      className={`wgnb-hidden wgnb-h-full wgnb-shrink-0 wgnb-flex-col wgnb-gap-1 wgnb-overflow-hidden wgnb-bg-slate-800 wgnb-px-2 wgnb-py-2.5 wgnb-transition-[width] wgnb-duration-200 wgnb-ease-out md:wgnb-flex ${
        expanded ? 'wgnb-w-[200px]' : 'wgnb-w-14'
      }`}
    >
      {/* 로고 버튼 = 접기/펼치기 토글 */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-label={expanded ? '메뉴 접기' : '메뉴 펼치기'}
        className="wgnb-mb-2.5 wgnb-flex wgnb-cursor-pointer wgnb-items-center wgnb-gap-2.5 wgnb-rounded-lg wgnb-border-0 wgnb-bg-transparent wgnb-p-1"
      >
        <span className="wgnb-flex wgnb-h-8 wgnb-w-8 wgnb-shrink-0 wgnb-items-center wgnb-justify-center wgnb-rounded-lg wgnb-bg-gradient-to-br wgnb-from-blue-500 wgnb-to-violet-500 wgnb-text-sm wgnb-font-extrabold wgnb-text-white">
          W
        </span>
        {expanded && <span className="wgnb-text-sm wgnb-font-bold wgnb-text-white">Workith</span>}
      </button>

      {apps.map((app) => (
        <AppIcon key={app.id} app={app} active={app.id === currentAppId} expanded={expanded} />
      ))}
    </nav>
  )
}
