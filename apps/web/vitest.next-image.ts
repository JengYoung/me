import ImageModule from 'next/image.js';

// Next.js의 CommonJS default를 Vite Browser Mode의 ESM 경계에서 풀어준다.
// 실제 Image 컴포넌트·props·렌더링은 유지하며 Node/Next.js 앱 빌드에는 적용하지 않는다.
const Image = 'default' in ImageModule ? (ImageModule.default as typeof ImageModule) : ImageModule;

export default Image;
