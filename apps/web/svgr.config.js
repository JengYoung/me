/** @satisfies {import('@svgr/core').Config} */
const svgrOptions = {
  // Next.js, Storybook, Vitest가 같은 설정만 사용하도록 자동 탐색을 끕니다.
  runtimeConfig: false,
  jsxRuntime: 'automatic',
  dimensions: false,
  prettier: false,
  svgo: true,
  plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
  svgoConfig: {
    plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }, 'prefixIds'],
  },
};

export default svgrOptions;
