# 품질과 검증

- JavaScript·TypeScript lint는 Oxlint, 코드 포맷팅은 Oxfmt, 타입 검사는 TypeScript compiler가 담당한다. 상세 정책은 `.agent-source/conventions/code-quality/source.md`에서 관리하고 각 도구의 코드 품질 지침으로 생성한다.
- Iris 코어 `packages/ui/src/base/**`는 스타일·구조 컨벤션과 포맷 적용에서 제외한다. correctness·타입·실제 동작 검증은 유지한다.
- 제품의 함수·Hook·컴포넌트 단위 검증은 Vitest, 실제 앱을 실행하는 앱 단위 통합 테스트는 Playwright E2E로 작성한다. 테스트 작성·수정·리뷰와 fixture·테스트 환경 변경에는 `.agent-source/conventions/test-writing/source.md`의 독립성·실패 시 정리·공개 동작 검증 계약을 적용하고 현재 실행 범위와 절차를 확인한다.
- React·Next.js 작성·수정·리뷰에는 `.agent-source/conventions/react-best-practices/source.md`의 Vercel 기반 지침을 적용한다. 불필요한 비동기 직렬 대기·초기 번들을 우선 확인하며, 성능 최적화에서도 FSD 공개 API·Hook 호출 규칙·요청 격리·기존 디자인 토큰 계약을 보존한다.
- 실행 명령과 의존성은 현재 파일에서 확인한다. 코드 변경은 영향받는 동작을, 문서 변경은 내용과 참조를 검증한다.
- 결과에는 바뀐 내용, 실제 실행한 검사, 미검증 항목을 구분해 적는다. 파일 일치 검사만으로 도구의 실행까지 검증됐다고 보고하지 않는다.
