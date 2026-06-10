# api.workith.com 메뉴 API 연동 설계

작성일: 2026-06-10
대상 저장소: `@workith/gnb`
상태: 설계 승인됨

## 목표

현재 기본 메뉴 구성이 패키지 내장 mock JSON(`src/apps.mock.json`)을 사용하고 있다.
이를 `http://api.workith.com/api/gnb/apps`에서 받아오는 구조로 전환한다.

전환 후 기본 동작은 API 우선이다. API 호출이 실패하면 기존 mock 목록으로 fallback한다.
호스트 앱 본문은 GNB API 장애와 무관하게 계속 렌더링되어야 한다.

## 결정 사항

- 기본 엔드포인트: `http://api.workith.com/api/gnb/apps`
- 인증 방식: Bearer token
- 기본 공급자: API 우선, mock fallback
- 렌더링 컴포넌트 변경: 최소화
- `StaticAppsSource`: 테스트, 로컬, 강제 mock 용도로 유지

## 현재 구조

현재 `src/apps.ts`는 메뉴 데이터를 가져오는 추상화인 `AppsSource`를 제공한다.

```ts
export interface AppsSource {
  getApps(): Promise<GnbApp[]>
}
```

`StaticAppsSource`는 내장 mock JSON을 반환한다. `defaultAppsSource`도 현재는
`StaticAppsSource` 인스턴스라서, `GnbShell`에서 `appsSource`를 생략하면 mock 메뉴가 표시된다.

`src/ApiAppsSource.ts`에는 이미 API 기반 공급자가 있다. 이 공급자는 요청 직전에
`getToken()`을 호출하고, 토큰이 있으면 `Authorization: Bearer <token>` 헤더를 붙인다.

## 제안 구조

`AppsSource` 계층만 바꾼다. `GnbShell`, `SuperGnbRail`, `AppIcon`의 렌더링 구조는 유지한다.

`defaultAppsSource`를 다음 구조로 전환한다.

```ts
new FallbackAppsSource(
  new ApiAppsSource('http://api.workith.com/api/gnb/apps'),
  new StaticAppsSource(),
)
```

`FallbackAppsSource`는 primary 공급자에서 앱 목록을 먼저 가져온다. primary가 reject하면 fallback
공급자를 호출한다. 이 fallback도 실패하면 에러를 그대로 throw한다. 마지막 실패 처리는 기존처럼
`SuperGnbRail`이 담당한다.

## 데이터 흐름

기본 사용 시 데이터 흐름은 다음과 같다.

```text
GnbShell
  -> SuperGnbRail
    -> defaultAppsSource.getApps()
      -> ApiAppsSource.getApps()
        -> GET http://api.workith.com/api/gnb/apps
```

API 응답은 기존 `GnbApp[]` 계약을 그대로 사용한다.

```ts
interface GnbApp {
  id: string
  name: string
  url: string
  icon: string
  order: number
}
```

`SuperGnbRail`은 현재처럼 `order` 오름차순으로 정렬해 렌더링한다. 사용자가 접근 가능한 앱만
내려주는 권한 필터링은 서버 책임이다. 프론트는 받은 목록을 그대로 표시한다.

## 인증

기본 공급자는 패키지 내부에서 호스트 앱의 access token을 알 수 없다. 따라서 기본 API 호출은
토큰 없이 `Accept: application/json`만 전송한다.

Bearer token이 필요한 운영 호스트는 `appsSource`를 명시 주입한다.

```tsx
const appsSource = new ApiAppsSource('http://api.workith.com/api/gnb/apps', {
  getToken: () => keycloak.token ?? null,
})

<GnbShell currentAppId="mail" appsSource={appsSource}>
  <App />
</GnbShell>
```

`appsSource` 인스턴스는 모듈 상수 또는 `useMemo`로 안정화해야 한다. 렌더마다 새 인스턴스를 만들면
`SuperGnbRail`의 effect 의존성이 바뀌어 API를 반복 호출할 수 있다.

## 오류 처리

오류 처리는 두 단계로 나눈다.

1. `FallbackAppsSource`: API 호출 실패 시 mock JSON 목록을 반환한다.
2. `SuperGnbRail`: 공급자 전체가 실패하면 현재 앱 하나를 합성해 표시한다.

이 구조로 API 장애, 네트워크 오류, 인증 오류가 있어도 호스트 앱 본문은 계속 렌더링된다.

## 변경 범위

수정 대상은 다음이다.

- `src/apps.ts`: `FallbackAppsSource` 추가, `defaultAppsSource`를 API 우선 공급자로 변경
- `src/ApiAppsSource.ts`: 기본 엔드포인트 상수 `DEFAULT_GNB_APPS_ENDPOINT` 추가 및 export
- `src/GnbShell.tsx`, `src/SuperGnbRail.tsx`: 기본값 설명 주석 갱신
- 테스트: 기본 API 호출, API 성공, API 실패 fallback, 기존 static source 보장
- `README.md`: 기본 동작과 Bearer token 주입 예시 갱신

렌더링 UI와 아이콘 매핑은 이번 범위에서 변경하지 않는다.

## 테스트 계획

- `ApiAppsSource`가 Bearer token을 계속 지원하는지 확인한다.
- `defaultAppsSource`가 기본 엔드포인트 `http://api.workith.com/api/gnb/apps`를 호출하는지 확인한다.
- API 성공 시 API 응답이 반환되는지 확인한다.
- API 실패 시 mock 목록으로 fallback하는지 확인한다.
- `StaticAppsSource`가 주입된 앱 목록과 기본 mock 목록을 계속 반환하는지 확인한다.
- `GnbShell` 기본 동작 테스트는 fetch mock 기반으로 갱신하거나 명시적인 `StaticAppsSource` 주입으로
  테스트 의도를 분리한다.

## 배포 및 호스트 적용

패키지 배포 후 기존 호스트는 `appsSource`를 생략하면 API 우선 기본 동작을 사용한다.

Bearer token이 필요한 호스트는 `ApiAppsSource`를 명시 생성해서 `GnbShell`에 넘긴다. 이 경우에도
패키지가 제공하는 `StaticAppsSource`는 로컬 개발이나 테스트에서 사용할 수 있다.
