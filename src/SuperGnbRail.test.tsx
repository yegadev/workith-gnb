import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type AppsSource, type GnbApp, StaticAppsSource } from './apps'
import SuperGnbRail from './SuperGnbRail'

// order 가 뒤섞인 목록 — 정렬 검증용
const APPS: GnbApp[] = [
  { id: 'mail', name: '메일', url: 'https://mail.example.com', icon: 'mail', order: 2 },
  { id: 'editor', name: '에디터', url: 'https://editor.example.com', icon: 'editor', order: 1 },
]

describe('SuperGnbRail', () => {
  it('앱 목록을 order 오름차순으로 렌더링한다', async () => {
    render(<SuperGnbRail currentAppId="mail" appsSource={new StaticAppsSource(APPS)} />)
    const links = await screen.findAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['에디터', '메일'])
  })

  it('현재 앱에 aria-current=page 를 표시한다', async () => {
    render(<SuperGnbRail currentAppId="mail" appsSource={new StaticAppsSource(APPS)} />)
    const current = await screen.findByRole('link', { name: '메일' })
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '에디터' })).not.toHaveAttribute('aria-current')
  })

  it('로고 클릭으로 펼침/접힘이 토글되고 localStorage 에 저장된다', async () => {
    render(<SuperGnbRail currentAppId="mail" appsSource={new StaticAppsSource(APPS)} />)
    const toggle = screen.getByRole('button', { name: /메뉴/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(window.localStorage.getItem('wgnb.expanded')).toBe('1')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(window.localStorage.getItem('wgnb.expanded')).toBe('0')
  })

  it('localStorage 에 저장된 펼침 상태를 복원한다', () => {
    window.localStorage.setItem('wgnb.expanded', '1')
    render(<SuperGnbRail currentAppId="mail" appsSource={new StaticAppsSource(APPS)} />)
    expect(screen.getByRole('button', { name: /메뉴/ })).toHaveAttribute('aria-expanded', 'true')
  })

  it('getApps 실패 시 현재 앱 아이콘만 표시한다 (fail-open)', async () => {
    const failing: AppsSource = {
      getApps: () => Promise.reject(new Error('네트워크 오류')),
    }
    render(<SuperGnbRail currentAppId="mail" appsSource={failing} />)
    const links = await screen.findAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('aria-current', 'page')
  })
})
