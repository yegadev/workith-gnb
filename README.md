# @workith/gnb

Workith super-GNB 좌측 앱 전환 레일 컴포넌트 패키지.

앱 목록은 기본적으로 `http://api.workith.com/api/gnb/apps`에서 가져온다.
API 호출이 실패하면 패키지에 내장된 mock JSON(`src/apps.mock.json`)으로 fallback한다.
`StaticAppsSource`, `FallbackAppsSource`, 공통 API 기반 `ApiAppsSource`를 통해 런타임 주입도 지원한다.

---

## 설치

```bash
# API-first 기본 공급자 변경이 포함된 커밋 설치 (prepare 스크립트가 설치 시 자동 빌드)
pnpm add git+ssh://git@github.com/yegadev/workith-gnb.git#fa680c8

# 같은 머신에 clone 되어 있는 경우 로컬 경로 설치도 가능 (개발용)
pnpm add file:../../workith-gnb
```

---

## 사용법

```tsx
// 1) 스타일 임포트 (Tailwind wgnb-* 유틸리티 포함)
import '@workith/gnb/style.css'

// 2) 셸 컴포넌트 렌더링
import { GnbShell } from '@workith/gnb'

function App() {
  return (
    <GnbShell currentAppId="mail">
      <main>앱 본문</main>
    </GnbShell>
  )
}
```

---

## API apps source

`GnbShell`의 `appsSource`를 생략하면 기본 공급자가 `http://api.workith.com/api/gnb/apps`를
먼저 호출하고, 실패 시 내장 mock 목록으로 fallback한다.

Bearer token이 필요한 호스트 앱은 `ApiAppsSource`를 명시 주입한다.

```tsx
import { ApiAppsSource, GnbShell } from '@workith/gnb'

const appsSource = new ApiAppsSource('http://api.workith.com/api/gnb/apps', {
  getToken: () => keycloak.token ?? null,
})

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GnbShell currentAppId="mail" appsSource={appsSource}>
      {children}
    </GnbShell>
  )
}
```

`getToken`은 요청 직전에 호출되며, 반환된 값은 `Authorization: Bearer <token>` 헤더로 전송된다.
토큰이 없으면 Authorization 헤더를 생략한다.

로컬 개발이나 테스트에서 mock 목록을 강제로 쓰려면 `StaticAppsSource`를 주입한다.

```tsx
import { GnbShell, StaticAppsSource } from '@workith/gnb'

const appsSource = new StaticAppsSource()
```

`appsSource`는 모듈 상수나 `useMemo`로 안정적인 참조를 유지한다. `SuperGnbRail`은 source 참조에
의존하는 effect에서 `getApps()`를 호출한다.

---

## 개발 명령

| 명령 | 설명 |
|------|------|
| `pnpm test` | Vitest 단위 테스트 실행 |
| `pnpm dev` | 데모 앱 개발 서버 실행 (Vite, `demo/` 디렉터리) |
| `pnpm build` | tsup 으로 `dist/` 빌드 |
| `pnpm check` | Biome lint + format 검사 |
| `pnpm type-check` | TypeScript 타입 검사 |

---

## 개발 워크플로 주의

### 1. `file:` 의존성은 하드카피 — 재빌드 후 호스트에서 재설치 필요

호스트 프로젝트(예: `workith-mail`)가 `"@workith/gnb": "file:../workith-gnb"` 형태로 참조하는 경우,
pnpm 은 최초 설치 시점의 `dist/` 를 **복사**해 둔다.

workith-gnb 소스를 수정하고 `pnpm build` 로 재빌드해도 호스트 `node_modules` 는 **자동으로 갱신되지 않는다.**

변경사항을 호스트에 반영하려면:

```bash
# workith-gnb 재빌드
cd /path/to/workith-gnb
pnpm build

# 호스트에서 강제 재설치
cd /path/to/workith-mail/frontend
pnpm install --force   # 또는 node_modules/@workith/gnb 삭제 후 pnpm install
```

반복적인 UI 개발 시에는 `pnpm dev` 데모 앱을 이용하면 핫리로드가 동작한다.

### 2. `dist/` 는 git 미추적 — fresh clone 후 반드시 빌드 선행

`.gitignore` 에 의해 `dist/` 는 저장소에 포함되지 않는다.

- **원격 git 태그 설치**: `package.json` 의 `"prepare": "pnpm build"` 가 설치 시 자동으로
  빌드를 실행하므로 별도 조치가 필요 없다.
- **로컬 `file:` 설치 / 직접 개발**: clone 직후에는 `dist/` 가 없으므로 반드시 빌드를 선행한다.
  (`pnpm install` 이 prepare 훅으로 빌드를 자동 실행하지만, 실패 시 수동으로 `pnpm build`)

```bash
# fresh clone 후 필수 순서
pnpm install   # prepare 훅이 pnpm build 를 자동 실행
pnpm build     # (prepare 가 실패했을 때만 수동 실행)
```
