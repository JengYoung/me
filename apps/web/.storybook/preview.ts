import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview, ReactRenderer } from '@storybook/nextjs-vite';
import '../app/globals.css';
import './preview.css';

const preview: Preview = {
  tags: ['autodocs'],
  beforeAll: () => {
    document.documentElement.lang = 'ko';
  },
  decorators: [
    withThemeByDataAttribute<ReactRenderer>({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
    backgrounds: { disable: true },
    controls: { expanded: true },
    // 고정 헤더와 body portal을 각 스토리의 iframe 안에 격리합니다.
    docs: { story: { inline: false, height: '400px' } },
    viewport: {
      options: {
        mobile: { name: 'Mobile · 390px', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        mobileBoundary: {
          name: 'Mobile 경계 · 1199px',
          styles: { width: '1199px', height: '900px' },
          type: 'desktop',
        },
        desktop: { name: 'Desktop · 1200px', styles: { width: '1200px', height: '900px' }, type: 'desktop' },
        wide: { name: 'Desktop · 1440px', styles: { width: '1440px', height: '900px' }, type: 'desktop' },
      },
    },
  },
};

export default preview;
