import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_GNB_APPS_ENDPOINT } from './ApiAppsSource'
import { defaultAppsSource, FallbackAppsSource, type GnbApp, StaticAppsSource } from './apps'

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
