# api.workith.com Menu Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change `@workith/gnb` so its default menu source loads apps from `http://api.workith.com/api/gnb/apps` first and falls back to the existing mock JSON when the API fails.

**Architecture:** Keep the existing `AppsSource` boundary. Add a small `FallbackAppsSource` composition class in `src/apps.ts`, export a default endpoint constant from `src/ApiAppsSource.ts`, and make `defaultAppsSource` API-first. Rendering components keep their current behavior and only receive comment updates.

**Tech Stack:** TypeScript, React 18, Vitest, Testing Library, tsup, Biome.

---

## File Structure

- Modify `src/ApiAppsSource.ts`: export `DEFAULT_GNB_APPS_ENDPOINT` and use it as the default constructor endpoint.
- Modify `src/apps.ts`: import `ApiAppsSource`, add `FallbackAppsSource`, and make `defaultAppsSource` API-first with `StaticAppsSource` fallback.
- Modify `src/apps.test.ts`: split static source tests from default source tests and mock `globalThis.fetch`.
- Modify `src/ApiAppsSource.test.ts`: add coverage for default endpoint behavior.
- Modify `src/GnbShell.test.tsx`: avoid relying on real default source by injecting `StaticAppsSource` where the test asserts mock labels.
- Modify `src/GnbShell.tsx` and `src/SuperGnbRail.tsx`: update comments that currently say the default is mock-only.
- Modify `README.md`: document API-first default behavior, endpoint, Bearer token injection, and explicit mock override.

## Task 1: Add Default API Endpoint to `ApiAppsSource`

**Files:**
- Modify: `src/ApiAppsSource.ts`
- Test: `src/ApiAppsSource.test.ts`

- [ ] **Step 1: Write the failing test**

Add this test near the top of `src/ApiAppsSource.test.ts`, after the imports:

```ts
import { ApiAppsSource, DEFAULT_GNB_APPS_ENDPOINT } from './ApiAppsSource'
```

Replace the existing import with the line above, then add:

```ts
it('uses api.workith.com as the default endpoint', async () => {
  const apps = [
    { id: 'mail', name: '메일', url: 'https://mail.workith.com', icon: 'mail', order: 1 },
  ]
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue(apps),
  })
  const source = new ApiAppsSource(undefined, { fetch: fetchMock as typeof fetch })

  await expect(source.getApps()).resolves.toEqual(apps)

  expect(DEFAULT_GNB_APPS_ENDPOINT).toBe('http://api.workith.com/api/gnb/apps')
  expect(fetchMock).toHaveBeenCalledWith('http://api.workith.com/api/gnb/apps', {
    headers: {
      Accept: 'application/json',
    },
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm vitest run src/ApiAppsSource.test.ts
```

Expected: FAIL because `DEFAULT_GNB_APPS_ENDPOINT` is not exported and `undefined` is not currently a valid endpoint argument.

- [ ] **Step 3: Implement the endpoint constant**

Change `src/ApiAppsSource.ts` to:

```ts
import type { AppsSource, GnbApp } from './apps'

export const DEFAULT_GNB_APPS_ENDPOINT = 'http://api.workith.com/api/gnb/apps'

export interface ApiAppsSourceOptions {
  /** Called immediately before each request so hosts can provide a fresh access token. */
  getToken?: () => Promise<string | null> | string | null
  /** Custom fetch for tests or non-browser hosts; defaults to globalThis.fetch. */
  fetch?: typeof fetch
}

export class ApiAppsSource implements AppsSource {
  constructor(
    private readonly endpoint: string = DEFAULT_GNB_APPS_ENDPOINT,
    private readonly options: ApiAppsSourceOptions = {},
  ) {}

  async getApps(): Promise<GnbApp[]> {
    const fetchImpl = this.options.fetch ?? globalThis.fetch
    if (!fetchImpl) {
      throw new Error('fetch is required to load GNB apps')
    }

    const token = await this.options.getToken?.()
    const headers: HeadersInit = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetchImpl(this.endpoint, { headers })
    if (!response.ok) {
      throw new Error(`gnb apps fetch failed: ${response.status}`)
    }

    return response.json() as Promise<GnbApp[]>
  }
}
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
pnpm vitest run src/ApiAppsSource.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ApiAppsSource.ts src/ApiAppsSource.test.ts
git commit -m "feat: add default gnb apps endpoint"
```

## Task 2: Add API-First Default Source with Mock Fallback

**Files:**
- Modify: `src/apps.ts`
- Test: `src/apps.test.ts`

- [ ] **Step 1: Write failing tests for fallback source and default source**

Replace `src/apps.test.ts` with:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_GNB_APPS_ENDPOINT } from './ApiAppsSource'
import {
  defaultAppsSource,
  FallbackAppsSource,
  type GnbApp,
  StaticAppsSource,
} from './apps'

const originalFetch = globalThis.fetch

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: originalFetch,
  })
})

describe('StaticAppsSource', () => {
  it('주입된 앱 목록을 그대로 resolve 한다', async () => {
    const apps = [
      { id: 'mail', name: '메일', url: 'https://mail.example.com', icon: 'mail', order: 1 },
    ]
    const source = new StaticAppsSource(apps)
    await expect(source.getApps()).resolves.toEqual(apps)
  })

  it('기본 생성 시 mock JSON 앱 목록을 반환한다', async () => {
    const apps = await new StaticAppsSource().getApps()
    expect(apps.length).toBeGreaterThan(0)
    expect(apps.map((a) => a.id)).toContain('mail')
  })

  it('mock 앱 목록에 op(예가비즈 OP)가 포함된다', async () => {
    const apps = await new StaticAppsSource().getApps()
    const op = apps.find((a) => a.id === 'op')
    expect(op).toMatchObject({
      name: '예가비즈 OP',
      url: 'https://yega-op.workith.com',
      icon: 'op',
      order: 5,
    })
  })

  it('mail/editor 앱은 실제 운영 도메인을 가리킨다', async () => {
    const apps = await new StaticAppsSource().getApps()
    expect(apps.find((a) => a.id === 'mail')?.url).toBe('https://mail.workith.com')
    expect(apps.find((a) => a.id === 'editor')?.url).toBe('https://editor.wrkth.in')
  })
})

describe('FallbackAppsSource', () => {
  it('primary 앱 목록을 우선 반환한다', async () => {
    const primaryApps: GnbApp[] = [
      { id: 'api', name: 'API 앱', url: 'https://api.example.com', icon: 'app', order: 1 },
    ]
    const fallbackApps: GnbApp[] = [
      { id: 'mock', name: 'Mock 앱', url: 'https://mock.example.com', icon: 'app', order: 2 },
    ]
    const source = new FallbackAppsSource(
      new StaticAppsSource(primaryApps),
      new StaticAppsSource(fallbackApps),
    )

    await expect(source.getApps()).resolves.toEqual(primaryApps)
  })

  it('primary 실패 시 fallback 앱 목록을 반환한다', async () => {
    const fallbackApps: GnbApp[] = [
      { id: 'mock', name: 'Mock 앱', url: 'https://mock.example.com', icon: 'app', order: 2 },
    ]
    const source = new FallbackAppsSource(
      { getApps: () => Promise.reject(new Error('api down')) },
      new StaticAppsSource(fallbackApps),
    )

    await expect(source.getApps()).resolves.toEqual(fallbackApps)
  })
})

describe('defaultAppsSource', () => {
  it('기본 엔드포인트에서 앱 목록을 가져온다', async () => {
    const apps = [
      { id: 'mail', name: '메일 API', url: 'https://mail.workith.com', icon: 'mail', order: 1 },
    ]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(apps),
    })
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    })

    await expect(defaultAppsSource.getApps()).resolves.toEqual(apps)

    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_GNB_APPS_ENDPOINT, {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('API 실패 시 mock JSON 앱 목록으로 fallback 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    })

    const apps = await defaultAppsSource.getApps()

    expect(apps.length).toBeGreaterThan(0)
    expect(apps.map((a) => a.id)).toContain('mail')
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_GNB_APPS_ENDPOINT, {
      headers: {
        Accept: 'application/json',
      },
    })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
pnpm vitest run src/apps.test.ts
```

Expected: FAIL because `FallbackAppsSource` does not exist and `defaultAppsSource` still points directly at `StaticAppsSource`.

- [ ] **Step 3: Implement `FallbackAppsSource` and update the default**

Change `src/apps.ts` to:

```ts
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
```

- [ ] **Step 4: Run the focused tests**

Run:

```bash
pnpm vitest run src/apps.test.ts src/ApiAppsSource.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/apps.ts src/apps.test.ts
git commit -m "feat: use api-first gnb apps source"
```

## Task 3: Update Component Tests and Comments for the New Default

**Files:**
- Modify: `src/GnbShell.tsx`
- Modify: `src/SuperGnbRail.tsx`
- Modify: `src/GnbShell.test.tsx`

- [ ] **Step 1: Update the GnbShell test to avoid real default network behavior**

Replace `src/GnbShell.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StaticAppsSource } from './apps'
import GnbShell from './GnbShell'

describe('GnbShell', () => {
  it('children 과 레일을 함께 렌더링한다', async () => {
    render(
      <GnbShell currentAppId="mail" appsSource={new StaticAppsSource()}>
        <div>호스트 앱</div>
      </GnbShell>,
    )
    expect(screen.getByText('호스트 앱')).toBeInTheDocument()
    expect(await screen.findByRole('navigation', { name: 'Workith 앱 전환' })).toBeInTheDocument()
  })

  it('주입된 appsSource 로 메일 앱을 현재 앱으로 강조한다', async () => {
    render(
      <GnbShell currentAppId="mail" appsSource={new StaticAppsSource()}>
        <div>호스트 앱</div>
      </GnbShell>,
    )
    const current = await screen.findByRole('link', { name: '메일' })
    expect(current).toHaveAttribute('aria-current', 'page')
  })
})
```

- [ ] **Step 2: Update comments in `GnbShell.tsx`**

Change the `appsSource` prop comment to:

```ts
  /** 앱 목록 공급자 — 생략 시 API 우선, mock fallback 기본 공급자 사용 */
  appsSource?: AppsSource
```

- [ ] **Step 3: Update comments in `SuperGnbRail.tsx`**

Change the `appsSource` prop comment to:

```ts
  /**
   * 앱 목록 공급자 — 생략 시 API 우선, mock fallback 기본 공급자 사용.
   * 주의: useEffect 의존성이므로 매 렌더마다 새 인스턴스를 넘기면 무한 재조회가 발생한다.
   * 모듈 상수 또는 useMemo/useState 로 안정화된 참조를 전달할 것.
   */
  appsSource?: AppsSource
```

- [ ] **Step 4: Run focused component tests**

Run:

```bash
pnpm vitest run src/GnbShell.test.tsx src/SuperGnbRail.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/GnbShell.tsx src/SuperGnbRail.tsx src/GnbShell.test.tsx
git commit -m "test: isolate gnb shell apps source"
```

## Task 4: Update Public Exports and README

**Files:**
- Modify: `src/index.ts`
- Modify: `README.md`

- [ ] **Step 1: Export the endpoint constant and fallback class**

Change `src/index.ts` to:

```ts
// @workith/gnb public API

export {
  ApiAppsSource,
  DEFAULT_GNB_APPS_ENDPOINT,
  type ApiAppsSourceOptions,
} from './ApiAppsSource'
export type { AppsSource, GnbApp } from './apps'
export { defaultAppsSource, FallbackAppsSource, StaticAppsSource } from './apps'
export { default as GnbShell, type GnbShellProps } from './GnbShell'
export { default as SuperGnbRail } from './SuperGnbRail'
```

- [ ] **Step 2: Run type check for export errors**

Run:

```bash
pnpm type-check
```

Expected: PASS.

- [ ] **Step 3: Update README introduction**

Replace the opening description in `README.md`:

```md
앱 목록은 기본적으로 `http://api.workith.com/api/gnb/apps`에서 가져온다.
API 호출이 실패하면 패키지에 내장된 mock JSON(`src/apps.mock.json`)으로 fallback한다.
`StaticAppsSource`, `FallbackAppsSource`, 공통 API 기반 `ApiAppsSource`를 통해 런타임 주입도 지원한다.
```

- [ ] **Step 4: Update README API apps source example**

Replace the `## API apps source` example with:

````md
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
````

- [ ] **Step 5: Run docs-adjacent validation**

Run:

```bash
pnpm type-check
pnpm check
```

Expected: both commands PASS.

- [ ] **Step 6: Commit**

```bash
git add src/index.ts README.md
git commit -m "docs: document api-first gnb source"
```

## Task 5: Full Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run the full test suite**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 2: Run type checking**

Run:

```bash
pnpm type-check
```

Expected: PASS.

- [ ] **Step 3: Run lint/format check**

Run:

```bash
pnpm check
```

Expected: PASS.

- [ ] **Step 4: Build the package**

Run:

```bash
pnpm build
```

Expected: PASS and `dist/` is regenerated.

- [ ] **Step 5: Inspect git status**

Run:

```bash
git status --short
```

Expected: only intended generated or source files are present. Do not commit `dist/` unless project policy has changed; the current README says `dist/` is git-ignored.

- [ ] **Step 6: Commit any verification-driven fixes**

If Task 5 required fixes, commit them:

```bash
git add <fixed-files>
git commit -m "fix: stabilize api-first gnb source"
```

If no fixes were needed, do not create an empty commit.

## Self-Review Notes

- Spec coverage: endpoint, Bearer token support, API-first default, mock fallback, static source retention, component comment updates, README updates, and verification are all covered.
- Red-flag scan: no placeholder or open-ended implementation instructions remain.
- Type consistency: `DEFAULT_GNB_APPS_ENDPOINT`, `ApiAppsSource`, `FallbackAppsSource`, `StaticAppsSource`, `AppsSource`, and `GnbApp` names match the planned exports and imports.
