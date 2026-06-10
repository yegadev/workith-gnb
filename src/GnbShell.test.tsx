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
