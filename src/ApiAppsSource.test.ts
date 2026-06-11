import { describe, expect, it, vi } from 'vitest'
import { ApiAppsSource, DEFAULT_GNB_APPS_ENDPOINT } from './ApiAppsSource'

describe('ApiAppsSource', () => {
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

    expect(DEFAULT_GNB_APPS_ENDPOINT).toBe('https://api.workith.com/api/gnb/apps')
    expect(fetchMock).toHaveBeenCalledWith('https://api.workith.com/api/gnb/apps', {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('fetches apps with Accept and bearer token headers when getToken returns a token', async () => {
    const apps = [
      { id: 'mail', name: '메일', url: 'https://mail.example.com', icon: 'mail', order: 1 },
    ]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(apps),
    })
    const source = new ApiAppsSource('https://api.wrkth.in/api/gnb/apps', {
      getToken: () => 'token-1',
      fetch: fetchMock as typeof fetch,
    })

    await expect(source.getApps()).resolves.toEqual(apps)

    expect(fetchMock).toHaveBeenCalledWith('https://api.wrkth.in/api/gnb/apps', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer token-1',
      },
    })
  })

  it('supports async getToken', async () => {
    const apps = [
      { id: 'files', name: '파일', url: 'https://files.example.com', icon: 'files', order: 2 },
    ]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(apps),
    })
    const source = new ApiAppsSource('/api/gnb/apps', {
      getToken: async () => 'async-token',
      fetch: fetchMock as typeof fetch,
    })

    await expect(source.getApps()).resolves.toEqual(apps)

    expect(fetchMock).toHaveBeenCalledWith('/api/gnb/apps', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer async-token',
      },
    })
  })

  it('omits Authorization when getToken returns null', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    })
    const source = new ApiAppsSource('/api/gnb/apps', {
      getToken: () => null,
      fetch: fetchMock as typeof fetch,
    })

    await expect(source.getApps()).resolves.toEqual([])

    expect(fetchMock).toHaveBeenCalledWith('/api/gnb/apps', {
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('throws status when the apps response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 })
    const source = new ApiAppsSource('/api/gnb/apps', { fetch: fetchMock as typeof fetch })

    await expect(source.getApps()).rejects.toThrow('gnb apps fetch failed: 401')
  })

  it('propagates network errors', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network down'))
    const source = new ApiAppsSource('/api/gnb/apps', { fetch: fetchMock as typeof fetch })

    await expect(source.getApps()).rejects.toThrow('network down')
  })

  it('throws a clear error when no fetch implementation is available', async () => {
    const originalFetch = globalThis.fetch
    try {
      Object.defineProperty(globalThis, 'fetch', {
        configurable: true,
        value: undefined,
      })
      const source = new ApiAppsSource('/api/gnb/apps')

      await expect(source.getApps()).rejects.toThrow('fetch is required to load GNB apps')
    } finally {
      Object.defineProperty(globalThis, 'fetch', {
        configurable: true,
        value: originalFetch,
      })
    }
  })
})
