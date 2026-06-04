import mockApps from './apps.mock.json'

/** GNB 에 표시되는 개별 앱 */
export interface GnbApp {
  /** 앱 식별자: 'mail' | 'editor' | 'files' | 'groupware' | ... */
  id: string
  /** 표시명 (예: '메일') */
  name: string
  /** 이동할 절대 URL */
  url: string
  /** 아이콘 키 — 패키지 내장 lucide 매핑에서 조회, 미지의 키는 기본 아이콘 폴백 */
  icon: string
  /** 정렬 순서 (오름차순) */
  order: number
}

/**
 * 앱 목록 공급자 인터페이스.
 * 1단계는 StaticAppsSource(mock JSON), 2단계에 공통 API 기반 ApiAppsSource 를
 * 추가해 props 한 줄로 교체한다 — GNB 컴포넌트 코드는 변경 없음.
 */
export interface AppsSource {
  getApps(): Promise<GnbApp[]>
}

/** 1단계: 하드코딩된 mock JSON 을 즉시 resolve 하는 구현체 */
export class StaticAppsSource implements AppsSource {
  private readonly apps: GnbApp[]

  constructor(apps: GnbApp[] = mockApps) {
    this.apps = apps
  }

  getApps(): Promise<GnbApp[]> {
    return Promise.resolve(this.apps)
  }
}

/** GnbShell 의 appsSource prop 생략 시 사용되는 기본 공급자 */
export const defaultAppsSource: AppsSource = new StaticAppsSource()
