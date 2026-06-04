import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 데모 전용 Vite 설정 — `pnpm dev` (vite serve demo) 로 실행
export default defineConfig({
  plugins: [react()]
})
