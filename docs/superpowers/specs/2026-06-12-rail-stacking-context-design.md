# SuperGnbRail 스태킹 컨텍스트 기본 적용 설계

작성일: 2026-06-12
대상 저장소: `@workith/gnb`
상태: 설계 승인됨 (A안)

## 배경

`SuperGnbRail`의 `<nav>`는 현재 position 미지정(static)이다. static 요소는 paint 순서에서
positioned 요소에게 항상 밀리므로, 호스트 앱이 낮은 z-index의 positioned 오버레이를 깔면
레일이 시각적으로 덮인다.

실제 사례: egov-template admin-web(ProLayout 호스트)에서 ProLayout의 전체 화면 배경 레이어
`.ant-pro-layout-bg-list`(`position: fixed; z-index: 0; pointer-events: none`)가 레일을 덮어
"hover는 동작하지만 레일이 보이지 않는" 증상이 발생했다. 호스트 CSS에서
`nav[aria-label='Workith 앱 전환'] { position: relative; z-index: 1 }` 패치로 해결했고,
vite preview + playwright 스크린샷으로 재현·검증됐다
(egov-template 커밋 d6e70b5).

이 부류의 문제는 호스트가 예측하기 어렵고 증상이 비직관적이므로, 패키지가 기본으로
방어하는 것이 맞다.

## 결정 사항

- `SuperGnbRail.tsx`의 `<nav>` className에 `wgnb-relative wgnb-z-10`을 추가한다.
- z 값은 10으로 한다. 검증된 최솟값은 1이지만, z-10은 Tailwind 기본 스케일이고
  z-0~9대 저층 오버레이를 모두 방어하면서 호스트 모달류(통상 z-1000+)와는 충돌하지 않는다.
- z-index를 prop/CSS 변수로 노출하지 않는다(현재 필요 근거 없음, YAGNI).
- 즉시 릴리스하지 않고 다음 버전 업에 포함한다.

## 효과와 한계

적용 시:

- positioned이지만 z-index가 10 미만(또는 auto)인 호스트 오버레이가 레일을 덮는 문제를
  패키지 차원에서 방어한다.
- egov-template admin-web은 업그레이드 시 호스트 CSS 패치 중
  `nav[aria-label=...]` 규칙을 삭제할 수 있다.

해결하지 않는 것:

- ProLayout fixed 모드(`fixSiderbar=true`)의 viewport 앵커링 문제. fixed 요소의 기하학은
  z-index로 해결할 수 없으므로 `fixSiderbar={false}` 등 호스트 측 통합 방식은 그대로 유지된다.
- sticky sider 등 호스트별 레이아웃 CSS.
- nav의 `overflow-hidden`에 의한 AppIcon hover 툴팁 클리핑 가능성 — 별건으로 분리(범위 외).

## 변경 범위

1. `src/SuperGnbRail.tsx` — `<nav>` className에 `wgnb-relative wgnb-z-10` 추가 (클래스 2개).
2. `src/SuperGnbRail.test.tsx` — nav가 `wgnb-relative`, `wgnb-z-10` 클래스를 갖는지 단언 추가.
   (스태킹 보장이 회귀로 빠지는 것을 막는 가드 목적의 클래스 존재 검사.)
3. `README` — 레일이 `position: relative; z-index: 10` 스태킹 컨텍스트를 가진다는 점과,
   레일 위에 의도적으로 올릴 호스트 오버레이는 z-index 10 초과 또는 portal을 사용하라는
   안내 한 줄 추가.

렌더링 구조, API, 빌드 설정 변경 없음.

## 에러 처리 / 테스트

런타임 분기가 없는 정적 클래스 추가이므로 에러 경로는 없다. 기존 테스트 전체 통과 +
위 클래스 단언 추가로 충분하다.
