import { HomePage } from '../screens/home';
import { SITE_DEFAULT_TITLE } from '../shared/config';
import { pageMetadata } from '../shared/lib/seo';

export const metadata = {
  ...pageMetadata({
    title: 'Blog',
    description:
      '개발자 황재영의 블로그입니다. 개발 과정에서의 불편함, 이를 해결할 인사이트들을 발견하고, 개선하는 과정을 기록합니다.',
    pathname: '/',
  }),
  title: { absolute: SITE_DEFAULT_TITLE },
};

export default HomePage;
