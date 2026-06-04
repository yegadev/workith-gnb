import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 각 테스트 후 DOM 정리 + localStorage 초기화 (펼침 상태 테스트 간 오염 방지)
// node 환경(@vitest-environment node)에서는 window 가 없으므로 guard 처리
afterEach(() => {
  cleanup()
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
  }
})
