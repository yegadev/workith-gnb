import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Node 26+ 는 globalThis 에 실험적 localStorage 키를 노출해 jsdom 의
    // window.localStorage 를 가린다 — 워커에서 해당 기능을 꺼서 jsdom 것을 사용
    poolOptions: {
      forks: { execArgv: ['--no-experimental-webstorage'] },
      threads: { execArgv: ['--no-experimental-webstorage'] }
    }
  }
})
