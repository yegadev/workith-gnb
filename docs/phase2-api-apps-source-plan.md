# super-GNB Phase 2 계획 — 공통 메뉴 API 연동 (ApiAppsSource)

> 작성일: 2026-06-05
> 기준 버전: `@workith/gnb` v0.1.1 (`bf1c041`)
> 상태: 계획 (미착수)

## 목표

Phase 1 의 mock JSON(`StaticAppsSource`) 기반 앱 목록을 **공통 메뉴 API** 호출로 교체한다.
컴포넌트 코드는 무변경 — `AppsSource` 구현체 1개 추가 + 호스트 prop 1줄 교체가 전부.

---

## 1. 현재 구조 (Phase 1)

데이터 계약은 `src/apps.ts` 에 정의:

```ts
export interface AppsSource {
  getApps(): Promise<GnbApp[]>
}
```

- `GnbApp` = `{ id, name, url, icon, order }` — 와이어 포맷이자 렌더링 모델
- 현재 기본값은 `StaticAppsSource` (mock JSON 즉시 resolve, `defaultAppsSource`)
- `GnbShell` → `SuperGnbRail` 로 `appsSource` prop 전달, 레일이 마운트 시
  `useEffect` 에서 `getApps()` 1회 호출 (`SuperGnbRail.tsx:41-60`)

**컴포넌트는 데이터 출처를 전혀 모른다** — Promise 로 앱 배열만 받는다.

---

## 2. Phase 2 호출 흐름

```
호스트 앱 (mail/editor/files)
  └─ <GnbShell appsSource={apiAppsSource}>     ← 교체 지점은 이 한 줄
       └─ SuperGnbRail (마운트 시 getApps() 1회 호출)
            └─ ApiAppsSource.getApps()
                 └─ GET https://api.workith.com/api/v1/gnb/apps  (공통 메뉴 API)
                      ├─ 200: GnbApp[] 정렬·렌더
                      └─ 실패: fail-open → 현재 앱 아이콘만 합성 표시
```

### 패키지 측 구현 (신규: `src/ApiAppsSource.ts`)

```ts
export class ApiAppsSource implements AppsSource {
  constructor(private readonly endpoint: string) {}

  async getApps(): Promise<GnbApp[]> {
    const res = await fetch(this.endpoint, {
      credentials: 'include',          // 세션/SSO 쿠키 동봉
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`gnb apps fetch failed: ${res.status}`)
    return res.json()                  // GnbApp[] 와이어 계약 그대로
  }
}
```

### 호스트 측 변경 (workith-mail `App.tsx`)

```tsx
// 모듈 상수로 선언 — 참조 안정성 필수 (§4-1 참조)
const appsSource = new ApiAppsSource('/api/v1/gnb/apps')

<GnbShell currentAppId="mail" appsSource={appsSource}>
```

---

## 3. 백엔드(공통 메뉴 API) 계약

| 항목 | 내용 |
|------|------|
| 엔드포인트 | `GET /api/v1/gnb/apps` (공통 게이트웨이) |
| 응답 | `GnbApp[]` 그대로 — 클라이언트 매핑 로직 0줄 |
| 권한 필터링 | **서버 책임.** 사용자가 접근 가능한 앱만 내려주면 레일은 받은 것만 그림 |
| `icon` 필드 | 키 문자열. 패키지 내장 lucide 매핑(`icons.ts`)에서 조회, 미지의 키는 기본 아이콘 폴백 — 서버가 새 앱을 추가해도 구버전 패키지가 깨지지 않음 |
| 인증 | Same-Origin(nginx 프록시 경유)이면 세션 쿠키로 충분. 도메인이 다르면 공통 API 도메인에 CORS + `credentials: 'include'` 허용 필요 |

응답 예시:

```json
[
  { "id": "mail",   "name": "메일",   "url": "https://mail.workith.com",   "icon": "mail",        "order": 0 },
  { "id": "editor", "name": "에디터", "url": "https://editor.workith.com", "icon": "file-text",   "order": 1 },
  { "id": "files",  "name": "파일",   "url": "https://files.workith.com",  "icon": "folder",      "order": 2 }
]
```

---

## 4. 설계상 주의점 (코드에 이미 박혀 있는 것들)

1. **참조 안정성** — `appsSource` 는 `SuperGnbRail` 의 `useEffect` 의존성이다
   (`SuperGnbRail.tsx:21-24` 주석 참조). 렌더마다 `new ApiAppsSource(...)` 를
   만들면 **API 무한 재호출**이 된다. 모듈 상수 또는 `useMemo` 필수.
2. **fail-open** — API 가 죽어도 레일 자체는 뜨고 현재 앱 아이콘만 합성 표시
   (`SuperGnbRail.tsx:47-55`). 공통 API 장애가 각 서비스 UI 를 끌어내리지 않는 게
   핵심 설계. `ApiAppsSource` 는 실패 시 그냥 throw 하면 됨 — 폴백은 레일 책임.
3. **에러 경계** — `GnbShell` 이 레일만 `GnbErrorBoundary` 로 감싸므로
   (`GnbShell.tsx:29-31`) 렌더링 예외가 나도 호스트 콘텐츠는 무사.
4. **캐싱 여지 (옵션)** — 메뉴는 거의 안 바뀌므로 `ApiAppsSource` 안에
   메모리 캐시 + `sessionStorage` 캐시를 넣어 탭 이동 시 재호출을 줄일 수 있다.

---

## 5. 배포 절차

1. workith-gnb 에서 `ApiAppsSource` 구현 + 테스트 → `v0.2.0` 태그 푸시
2. 각 호스트에서 재설치:

   ```bash
   pnpm add 'git+https://github.com/yegadev/workith-gnb.git#v0.2.0'
   ```

   ⚠️ 반드시 **git+https** 로 설치 — git+ssh 는 lockfile 에 SSH 해석이 남아
   CI(Vercel)에서 `Host key verification failed` 로 실패한다.
3. 호스트는 `appsSource` prop 한 줄 교체

---

## 6. 작업 체크리스트

- [ ] 공통 메뉴 API 스펙 확정 (엔드포인트 경로, 게이트웨이 위치, 인증 방식)
- [ ] 백엔드: `GET /api/v1/gnb/apps` 구현 + 권한 필터링
- [ ] 패키지: `src/ApiAppsSource.ts` 구현 (fetch + credentials)
- [ ] 패키지: vitest 단위 테스트 (성공/HTTP 에러/네트워크 에러/계약 검증)
- [ ] 패키지: `index.ts` export 추가, README 사용법 갱신
- [ ] 패키지: `v0.2.0` 태그 발행
- [ ] 호스트(workith-mail): git+https 재설치 + `appsSource` prop 교체
- [ ] (옵션) sessionStorage 캐싱
- [ ] (Phase 2 잔여) 펼침 상태 크로스 도메인 공유 / 알림 / 배지
