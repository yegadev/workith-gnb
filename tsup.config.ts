import { defineConfig } from 'tsup'

// 라이브러리 번들 설정
// - react/react-dom 은 호스트 것을 사용 (peerDependency → external)
// - lucide-react 는 호스트 버전과 무관하도록 번들에 포함 (noExternal)
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  noExternal: ['lucide-react']
})
