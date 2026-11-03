import { afterEach } from 'vitest';
import { cleanup, configure } from 'vitest-browser-react/pure';
import './app/globals.css';

configure({ reactStrictMode: true });

// /pure의 수동 정리: 실패한 테스트도 DOM·portal·effect를 해제한다.
// 각 테스트의 onTestFinished 전역 복원보다 먼저 실행된다.
afterEach(async () => {
  await cleanup();
});
