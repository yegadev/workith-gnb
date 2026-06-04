import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 각 테스트 후 DOM 정리 + localStorage 초기화 (펼침 상태 테스트 간 오염 방지)
afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
