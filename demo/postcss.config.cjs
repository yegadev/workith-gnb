// 데모는 src 의 Tailwind 클래스를 루트 설정으로 직접 컴파일한다
module.exports = {
  plugins: {
    tailwindcss: { config: require('path').resolve(__dirname, '../tailwind.config.ts') },
    autoprefixer: {}
  }
}
