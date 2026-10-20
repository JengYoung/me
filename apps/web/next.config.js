import svgrOptions from './svgr.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        condition: { all: [{ not: 'foreign' }, { query: '?react' }] },
        // JSX 변환은 Next.js에 맡겨 공통 automatic runtime 설정을 유지합니다.
        loaders: [{ loader: '@svgr/webpack', options: { ...svgrOptions, babel: false } }],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
