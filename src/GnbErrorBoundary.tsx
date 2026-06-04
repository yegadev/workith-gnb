import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * GNB 내부 렌더링 에러를 흡수하는 경계.
 * 원칙: GNB 장애가 호스트 앱을 절대 깨뜨리지 않는다 — 에러 시 레일 없이
 * 호스트 콘텐츠만 보이도록 null 을 렌더링한다 (fail-open).
 */
export default class GnbErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}
