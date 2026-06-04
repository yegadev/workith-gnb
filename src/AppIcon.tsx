import type { GnbApp } from './apps'
import { resolveIcon } from './icons'

interface AppIconProps {
  app: GnbApp
  /** 현재 보고 있는 앱인지 여부 — true 면 강조 표시 + 클릭 무시 */
  active: boolean
  /** 레일 펼침 여부 — true 면 텍스트 라벨, false 면 호버 툴팁 */
  expanded: boolean
}

/**
 * 레일의 개별 앱 항목.
 * 앱 이동은 단순 <a href> 전체 페이지 이동 — 서로 다른 도메인의 독립 SPA 간
 * 이동이므로 Keycloak SSO 가 각 사이트 세션을 자연스럽게 처리한다.
 */
export default function AppIcon({ app, active, expanded }: AppIconProps) {
  const Icon = resolveIcon(app.icon)

  return (
    <a
      href={app.url}
      aria-current={active ? 'page' : undefined}
      onClick={(e) => {
        // 현재 앱 클릭 시 이동하지 않음
        if (active) e.preventDefault()
      }}
      className={`wgnb-group wgnb-relative wgnb-flex wgnb-items-center wgnb-gap-2.5 wgnb-rounded-[10px] wgnb-p-2 wgnb-text-slate-200 wgnb-no-underline wgnb-transition-colors hover:wgnb-bg-slate-700 ${
        active ? 'wgnb-bg-slate-700 wgnb-text-white' : 'wgnb-opacity-60 hover:wgnb-opacity-100'
      }`}
    >
      {/* 활성 앱 좌측 인디케이터 바 */}
      {active && (
        <span
          data-testid="active-indicator"
          className="wgnb-absolute -wgnb-left-2 wgnb-top-1.5 wgnb-bottom-1.5 wgnb-w-[3px] wgnb-rounded-r wgnb-bg-blue-400"
        />
      )}
      <Icon className="wgnb-h-5 wgnb-w-5 wgnb-shrink-0" aria-hidden="true" />
      {expanded ? (
        // 펼침: 아이콘 옆 텍스트 라벨
        <span className="wgnb-whitespace-nowrap wgnb-text-[13px]">{app.name}</span>
      ) : (
        // 접힘: 호버 시에만 보이는 우측 툴팁
        <span
          role="tooltip"
          className="wgnb-pointer-events-none wgnb-absolute wgnb-left-12 wgnb-top-1/2 wgnb-z-10 -wgnb-translate-y-1/2 wgnb-whitespace-nowrap wgnb-rounded-md wgnb-bg-slate-950 wgnb-px-2.5 wgnb-py-1 wgnb-text-xs wgnb-text-white wgnb-opacity-0 wgnb-shadow-lg wgnb-transition-opacity group-hover:wgnb-opacity-100"
        >
          {app.name}
        </span>
      )}
    </a>
  )
}
