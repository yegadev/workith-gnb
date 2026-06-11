import type { AppsSource, GnbApp } from './apps'

export const DEFAULT_GNB_APPS_ENDPOINT = 'https://api.workith.com/api/gnb/apps'

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
