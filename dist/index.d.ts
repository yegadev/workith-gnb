import * as react from 'react';
import { ReactNode } from 'react';

/** GNB 에 표시되는 개별 앱 */
interface GnbApp {
    /** 앱 식별자: 'mail' | 'editor' | 'files' | 'groupware' | ... */
    id: string;
    /** 표시명 (예: '메일') */
    name: string;
    /** 이동할 절대 URL */
    url: string;
    /** 아이콘 키 — 패키지 내장 lucide 매핑에서 조회, 미지의 키는 기본 아이콘 폴백 */
    icon: string;
    /** 정렬 순서 (오름차순) */
    order: number;
}
/**
 * 앱 목록 공급자 인터페이스.
 * GNB 컴포넌트는 데이터 출처를 모른 채 Promise 로 앱 배열만 받는다.
 */
interface AppsSource {
    getApps(): Promise<GnbApp[]>;
}
/** 하드코딩된 mock JSON 을 즉시 resolve 하는 구현체 */
declare class StaticAppsSource implements AppsSource {
    private readonly apps;
    constructor(apps?: GnbApp[]);
    getApps(): Promise<GnbApp[]>;
}
/** primary 실패 시 fallback 공급자로 앱 목록을 다시 가져오는 구현체 */
declare class FallbackAppsSource implements AppsSource {
    private readonly primary;
    private readonly fallback;
    constructor(primary: AppsSource, fallback: AppsSource);
    getApps(): Promise<GnbApp[]>;
}
/** GnbShell 의 appsSource prop 생략 시 사용되는 기본 공급자 */
declare const defaultAppsSource: AppsSource;

declare const DEFAULT_GNB_APPS_ENDPOINT = "https://api.workith.com/api/gnb/apps";
interface ApiAppsSourceOptions {
    /** Called immediately before each request so hosts can provide a fresh access token. */
    getToken?: () => Promise<string | null> | string | null;
    /** Custom fetch for tests or non-browser hosts; defaults to globalThis.fetch. */
    fetch?: typeof fetch;
}
declare class ApiAppsSource implements AppsSource {
    private readonly endpoint;
    private readonly options;
    constructor(endpoint?: string, options?: ApiAppsSourceOptions);
    getApps(): Promise<GnbApp[]>;
}

interface GnbShellProps {
    /** 현재 앱 id (예: 'mail') — 강조 표시용 */
    currentAppId: string;
    /** 앱 목록 공급자 — 생략 시 API 우선, mock fallback 기본 공급자 사용 */
    appsSource?: AppsSource;
    /** 기존 호스트 앱 전체 */
    children: ReactNode;
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
declare function GnbShell({ currentAppId, appsSource, children }: GnbShellProps): react.JSX.Element;

interface SuperGnbRailProps {
    /** 현재 앱 id — 해당 앱을 강조 표시하고 클릭을 무시한다 */
    currentAppId: string;
    /**
     * 앱 목록 공급자 — 생략 시 API 우선, mock fallback 기본 공급자 사용.
     * 주의: useEffect 의존성이므로 매 렌더마다 새 인스턴스를 넘기면 무한 재조회가 발생한다.
     * 모듈 상수 또는 useMemo/useState 로 안정화된 참조를 전달할 것.
     */
    appsSource?: AppsSource;
}
/**
 * 좌측 아이콘 레일 본체.
 * - 접힘 56px ↔ 펼침 200px, 로고(W) 클릭으로 토글 (200ms transition)
 * - 모바일(<768px)에서는 숨김 — 1단계는 데스크톱 전용
 * - getApps 실패 시에도 레일은 렌더링하되 현재 앱만 표시 (fail-open)
 * - positioned 저층 오버레이(예: ProLayout bg layer) 방어를 위해 relative z-10 스태킹 컨텍스트를 가짐
 */
declare function SuperGnbRail({ currentAppId, appsSource, }: SuperGnbRailProps): react.JSX.Element;

export { ApiAppsSource, type ApiAppsSourceOptions, type AppsSource, DEFAULT_GNB_APPS_ENDPOINT, FallbackAppsSource, type GnbApp, GnbShell, type GnbShellProps, StaticAppsSource, SuperGnbRail, defaultAppsSource };
