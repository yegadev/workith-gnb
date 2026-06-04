import type { Config } from 'tailwindcss'

// 호스트 앱과의 스타일 충돌 방지가 최우선:
// - prefix 'wgnb-' 로 클래스 이름 격리
// - preflight(전역 reset) 비활성화 — 호스트의 글로벌 스타일을 건드리지 않음
export default {
  prefix: 'wgnb-',
  corePlugins: {
    preflight: false
  },
  content: ['./src/**/*.tsx', './demo/**/*.{ts,tsx,html}'],
  theme: {
    extend: {}
  }
} satisfies Config
