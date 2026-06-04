import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AppIcon from './AppIcon'
import type { GnbApp } from './apps'

const app: GnbApp = {
  id: 'editor',
  name: '에디터',
  url: 'https://editor.example.com',
  icon: 'editor',
  order: 2,
}

describe('AppIcon', () => {
  it('비활성 앱은 app.url 로 가는 링크로 렌더링된다', () => {
    render(<AppIcon app={app} active={false} expanded={false} />)
    const link = screen.getByRole('link', { name: '에디터' })
    expect(link).toHaveAttribute('href', 'https://editor.example.com')
    expect(link).not.toHaveAttribute('aria-current')
  })

  it('활성 앱은 aria-current=page 와 인디케이터를 가진다', () => {
    render(<AppIcon app={app} active expanded={false} />)
    expect(screen.getByRole('link', { name: '에디터' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByTestId('active-indicator')).toBeInTheDocument()
  })

  it('활성 앱 클릭은 기본 동작(페이지 이동)이 차단된다', () => {
    render(<AppIcon app={app} active expanded={false} />)
    // fireEvent 는 preventDefault 가 호출되면 false 를 반환한다
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: '에디터' }))
    expect(notPrevented).toBe(false)
  })

  it('비활성 앱 클릭은 기본 동작이 차단되지 않는다', () => {
    render(<AppIcon app={app} active={false} expanded={false} />)
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: '에디터' }))
    expect(notPrevented).toBe(true)
  })

  it('접힘 상태에서는 호버 툴팁 요소가 존재한다', () => {
    render(<AppIcon app={app} active={false} expanded={false} />)
    expect(screen.getByRole('tooltip')).toHaveTextContent('에디터')
  })

  it('펼침 상태에서는 텍스트 라벨이 보이고 툴팁이 없다', () => {
    render(<AppIcon app={app} active={false} expanded />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(screen.getByText('에디터')).toBeInTheDocument()
  })
})
