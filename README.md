# @workith/gnb

Workith super-GNB 좌측 앱 전환 레일 컴포넌트 패키지.

현재 Phase 1 — 앱 목록은 패키지에 내장된 mock JSON(`src/apps.mock.json`)을 기본값으로 사용하며,
`StaticAppsSource`를 통해 런타임 주입도 지원한다.

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

저장소를 새로 clone 한 뒤 `pnpm install` 만 실행하면 `dist/` 가 없어
호스트 `file:` 설치가 빈 패키지를 참조하게 된다.

```bash
# fresh clone 후 필수 순서
pnpm install
pnpm build
```

원격 git 태그(`git+https://...#v0.1.0`)로 배포 방식을 전환할 경우,
`package.json` 에 `"prepare": "pnpm build"` 스크립트를 추가해야
git 설치 시 자동으로 빌드가 실행된다.
