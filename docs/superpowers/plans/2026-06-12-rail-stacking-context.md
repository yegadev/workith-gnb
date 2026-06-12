# SuperGnbRail 스태킹 컨텍스트 기본 적용 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `SuperGnbRail`의 `<nav>`에 `wgnb-relative wgnb-z-10`을 기본 포함시켜, 낮은 z-index의 positioned 호스트 오버레이(예: ProLayout의 `.ant-pro-layout-bg-list`, fixed z-0)가 레일을 시각적으로 덮는 문제를 패키지 차원에서 방어한다.

**Architecture:** 정적 Tailwind 클래스 2개를 nav className에 추가하는 단일 변경. 런타임 분기 없음. 회귀 방지용 클래스 존재 테스트와 README 스태킹 보장 문서를 함께 추가한다. 릴리스는 하지 않는다(다음 버전 업에 동승).

**Tech Stack:** React + Tailwind(프리픽스 `wgnb-`), Vitest + @testing-library/react, tsup 빌드

**Spec:** `docs/superpowers/specs/2026-06-12-rail-stacking-context-design.md`

---

### Task 1: nav 스태킹 컨텍스트 클래스 추가 (TDD)

**Files:**
- Modify: `src/SuperGnbRail.tsx:77` (nav className)
- Test: `src/SuperGnbRail.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/SuperGnbRail.test.tsx`의 `describe('SuperGnbRail', ...)` 블록 마지막(기존 fail-open 테스트 뒤)에 추가:

```tsx
  it('레일 nav 가 스태킹 컨텍스트 클래스를 가진다 (positioned 호스트 오버레이 방어)', () => {
    render(<SuperGnbRail currentAppId="mail" appsSource={new StaticAppsSource(APPS)} />)
    // ProLayout 의 .ant-pro-layout-bg-list(fixed z-0) 같은 저층 오버레이가
    // static 레일을 덮는 회귀를 막는 가드 (스펙 2026-06-12 참조)
    const nav = screen.getByRole('navigation', { name: 'Workith 앱 전환' })
    expect(nav).toHaveClass('wgnb-relative', 'wgnb-z-10')
  })
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/SuperGnbRail.test.tsx -t '스태킹'`
Expected: FAIL — `expect(element).toHaveClass(...)` 에서 `wgnb-relative` 누락으로 실패

- [ ] **Step 3: 최소 구현 — className에 클래스 2개 추가**

`src/SuperGnbRail.tsx:77`의 nav className 템플릿 리터럴 시작 부분을 수정:

변경 전:

```tsx
      className={`wgnb-hidden wgnb-h-full wgnb-shrink-0 wgnb-flex-col wgnb-gap-1 wgnb-overflow-hidden wgnb-bg-slate-800 wgnb-px-2 wgnb-py-2.5 wgnb-transition-[width] wgnb-duration-200 wgnb-ease-out md:wgnb-flex ${
```

변경 후:

```tsx
      className={`wgnb-relative wgnb-z-10 wgnb-hidden wgnb-h-full wgnb-shrink-0 wgnb-flex-col wgnb-gap-1 wgnb-overflow-hidden wgnb-bg-slate-800 wgnb-px-2 wgnb-py-2.5 wgnb-transition-[width] wgnb-duration-200 wgnb-ease-out md:wgnb-flex ${
```

(나머지 — `expanded ? ...` 분기 포함 — 는 그대로 둔다. nav 위 JSDoc 주석에 스태킹 보장을 한 줄 추가해도 좋다:
`- positioned 저층 오버레이(예: ProLayout bg layer) 방어를 위해 relative z-10 스태킹 컨텍스트를 가짐`)

- [ ] **Step 4: 전체 테스트 통과 확인**

Run: `pnpm test`
Expected: PASS — 기존 테스트 전체 + 신규 테스트 1개 통과

- [ ] **Step 5: lint/format 검사**

Run: `pnpm check && pnpm type-check`
Expected: 오류 없음

- [ ] **Step 6: Commit**

```bash
git add src/SuperGnbRail.tsx src/SuperGnbRail.test.tsx
git commit -m "feat: 레일 nav 에 relative z-10 스태킹 컨텍스트 기본 적용

ProLayout 의 전체 화면 배경 레이어(.ant-pro-layout-bg-list, fixed z-0)처럼
낮은 z-index 의 positioned 호스트 오버레이가 static 레일을 시각적으로 덮는
문제를 패키지 차원에서 방어한다 (egov-template d6e70b5 에서 검증된 호스트
CSS 패치의 일반화)."
```

---

### Task 2: README 스태킹 보장 문서화

**Files:**
- Modify: `README.md` (사용법 섹션 끝, 39행 코드 블록 닫힘 뒤)

- [ ] **Step 1: 사용법 섹션에 안내 추가**

`README.md`의 `## 사용법` 섹션 코드 블록(```` ``` ```` 닫힘, 39행) 바로 뒤에 추가:

```markdown

레일 `<nav>`는 `position: relative; z-index: 10` 스태킹 컨텍스트를 기본으로 가진다.
ProLayout의 배경 레이어처럼 낮은 z-index의 positioned 오버레이가 레일을 덮는 문제를 패키지가 방어한다.
레일 위에 의도적으로 올릴 호스트 오버레이는 z-index를 10 초과로 두거나 portal을 사용한다.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: 레일 z-10 스태킹 컨텍스트 보장 안내 추가"
```

---

## 범위 외 (하지 않는 것)

- 릴리스/버전 범프 — 다음 버전 업에 동승 (스펙 결정 사항)
- `fixSiderbar={false}`, sticky sider 등 호스트(egov-template) 측 변경 — 호스트는 업그레이드 시
  `nav[aria-label='Workith 앱 전환']` CSS 규칙을 자체적으로 삭제
- nav `overflow-hidden`에 의한 툴팁 클리핑 — 별건
- z-index prop/CSS 변수 노출 — YAGNI
