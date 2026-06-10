import { describe, expect, it } from 'vitest'
import { defaultAppsSource, StaticAppsSource } from './apps'

describe('StaticAppsSource', () => {
  it('주입된 앱 목록을 그대로 resolve 한다', async () => {
    const apps = [
      { id: 'mail', name: '메일', url: 'https://mail.example.com', icon: 'mail', order: 1 },
    ]
    const source = new StaticAppsSource(apps)
    await expect(source.getApps()).resolves.toEqual(apps)
  })

  it('기본 생성 시 mock JSON 앱 목록을 반환한다', async () => {
    const apps = await defaultAppsSource.getApps()
    expect(apps.length).toBeGreaterThan(0)
    // 1단계 mock 에는 최소한 메일 앱이 포함되어야 한다
    expect(apps.map((a) => a.id)).toContain('mail')
  })

  it('mock 앱 목록에 op(예가비즈 OP)가 포함된다', async () => {
    const apps = await defaultAppsSource.getApps()
    const op = apps.find((a) => a.id === 'op')
    expect(op).toMatchObject({
      name: '예가비즈 OP',
      url: 'https://yega-op.workith.com',
      icon: 'op',
      order: 5,
    })
  })

  it('mail/editor 앱은 실제 운영 도메인을 가리킨다', async () => {
    const apps = await defaultAppsSource.getApps()
    expect(apps.find((a) => a.id === 'mail')?.url).toBe('https://mail.workith.com')
    expect(apps.find((a) => a.id === 'editor')?.url).toBe('https://editor.wrkth.in')
  })
})
