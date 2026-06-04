import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import GnbErrorBoundary from './GnbErrorBoundary'

/** 렌더링 중 무조건 throw 하는 컴포넌트 */
function Boom(): never {
  throw new Error('boom')
}

describe('GnbErrorBoundary', () => {
  it('에러가 없으면 자식을 그대로 렌더링한다', () => {
    render(
      <GnbErrorBoundary>
        <div>정상 콘텐츠</div>
      </GnbErrorBoundary>,
    )
    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument()
  })

  it('자식 렌더링 에러 시 아무것도 렌더링하지 않는다 (fail-open)', () => {
    // React 가 에러를 console.error 로 출력하므로 테스트 출력 소음 억제
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(
      <GnbErrorBoundary>
        <Boom />
      </GnbErrorBoundary>,
    )
    expect(container).toBeEmptyDOMElement()
    spy.mockRestore()
  })
})
