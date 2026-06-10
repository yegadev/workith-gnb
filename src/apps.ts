import { ApiAppsSource } from './ApiAppsSource'
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
 * GNB 컴포넌트는 데이터 출처를 모른 채 Promise 로 앱 배열만 받는다.
 */
export interface AppsSource {
  getApps(): Promise<GnbApp[]>
}

/** 하드코딩된 mock JSON 을 즉시 resolve 하는 구현체 */
export class StaticAppsSource implements AppsSource {
  private readonly apps: GnbApp[]

  constructor(apps: GnbApp[] = mockApps) {
    this.apps = apps
  }

  getApps(): Promise<GnbApp[]> {
    // 내부 배열 참조 공유로 인한 외부 변형(정렬 등) 전파를 차단 — 호출자마다 복사본 반환
    return Promise.resolve([...this.apps])
  }
}

/** primary 실패 시 fallback 공급자로 앱 목록을 다시 가져오는 구현체 */
export class FallbackAppsSource implements AppsSource {
  constructor(
    private readonly primary: AppsSource,
    private readonly fallback: AppsSource,
  ) {}

  async getApps(): Promise<GnbApp[]> {
    try {
      return await this.primary.getApps()
    } catch {
      return this.fallback.getApps()
    }
  }
}

/** GnbShell 의 appsSource prop 생략 시 사용되는 기본 공급자 */
export const defaultAppsSource: AppsSource = new FallbackAppsSource(
  new ApiAppsSource(),
  new StaticAppsSource(),
)
