# 앱·패키지 버전 관리

- `apps/*`와 `packages/*`는 Changesets로 각각 독립 버전을 관리한다. 루트 `package.json`에는 제품 버전을 두지 않으며, `.changeset/config.json`의 `fixed`·`linked`는 빈 배열로 유지한다.
- 버전 변경은 `.changeset/*.md`의 패키지명·SemVer bump·변경 요약을 근거로 한다. 패키지 버전을 수동으로 올리거나 모든 패키지를 같은 버전으로 맞추지 않는다.
- 사용자에게 영향을 주는 변경을 릴리즈에 포함할 때 해당 패키지의 changeset을 작성한다. 문서·테스트·개발 도구 변경만으로 제품 버전을 올리지 않으며, changeset 작성과 버전 적용을 구분한다.
- 버전 조회·changeset 작성·릴리즈 버전 적용에는 프로젝트의 `changesets-version` 스킬을 사용한다. 일반 구현·커밋·배포 요청에 `release:version` 실행을 자동으로 포함하지 않는다.
- 버전 적용은 `pnpm changeset:status`로 전체 대기 changeset과 의존성 전파를 확인한 뒤, 요청 범위가 맞으면 `pnpm release:version`으로 실행한다. `package.json`·패키지별 `CHANGELOG.md`·소비된 changeset·`pnpm-lock.yaml`을 함께 검증한다.
- 내부 의존성은 `workspace:` 프로토콜을 유지한다. 독립 버전이어도 Changesets의 의존성 전파로 소비 패키지가 함께 bump될 수 있으므로 전체 계획을 확인한다. 제품 변경으로 특정 앱 릴리즈가 필요하면 해당 앱을 changeset에 명시한다.
- `private: true`를 유지하며 private 패키지도 버전 관리한다. 자동 커밋·태그·npm 게시·외부 배포는 버전 적용에 포함하지 않는다. prerelease·snapshot은 명시적으로 요청한 경우에만 별도 범위를 확인한다.
