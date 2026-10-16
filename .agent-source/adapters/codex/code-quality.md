{{CODE_QUALITY}}

## Codex 실행 방식

- 루트 `AGENTS.md`가 코드 작성·수정·리뷰 및 품질 설정 작업 전에 이 문서를 읽도록 연결한다. `.codex/code-quality.md`라는 파일명 자체의 자동 로딩에 의존하지 않는다.
- 셸 도구로 작업 대상의 `package.json`, 공유 프리셋, 패키지별 `oxlint.config.mts`·`oxfmt.config.mts`·`tsconfig.json`을 확인하고 필요한 검사를 실행한다.
- 기존 사용자 변경과 Iris 코어를 보존하고 자동 수정 뒤 diff를 확인한다. 쓰기나 실행이 샌드박스에 막히면 현재 실행 도구의 권한 절차를 사용하며 전역 설정을 바꾸지 않는다.
- 최종 보고에는 실제 검사한 패키지·파일 범위와 실패·미검증 항목을 구분한다.
