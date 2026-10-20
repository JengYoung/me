# 버전 관리

Changesets로 `apps/*`와 `packages/*`의 버전을 독립적으로 관리한다. 루트에는 제품 버전을 두지 않는다. 기존 버전은 유지하며, 이 설정 추가만으로 릴리즈하지 않는다.

## 명령

프로젝트 루트에서 실행한다. 환경에 별도 셸 실행 규칙이 있으면 함께 따른다.

| 명령                    | 동작                                                 |
| ----------------------- | ---------------------------------------------------- |
| `pnpm changeset`        | 패키지·bump·요약을 선택해 changeset 작성             |
| `pnpm changeset:status` | 대기 changeset과 의존성 전파를 포함한 다음 버전 조회 |
| `pnpm release:version`  | 전체 대기 changeset 적용 후 lockfile 갱신            |

대화형 입력 없이 작성할 수도 있다.

```sh
pnpm changeset --patch web --message "실제 변경에 근거한 수정 요약"
```

버전 적용은 각 패키지의 `package.json`, `CHANGELOG.md`, 필요한 내부 의존성을 갱신하고 적용한 changeset을 소비한다. 이어서 `pnpm install --lockfile-only --no-frozen-lockfile --ignore-scripts`로 lockfile을 맞춘다. 이 명령에는 커밋·태그·npm 게시·배포가 포함되지 않는다.

## 독립 버전 정책

- 실제 변경 대상만 changeset에 적는다. `fixed`·`linked`가 비어 있으므로 앱과 패키지의 버전을 동일하게 맞추지 않는다.
- 패키지명을 frontmatter에 쓰고 `major`·`minor`·`patch`와 한국어 요약을 기록한다. 호환성 파괴는 major, 하위 호환 기능 추가는 minor, 호환되는 수정은 patch를 기준으로 판단한다.
- `privatePackages.version: true`로 private 앱·패키지도 버전과 changelog를 관리한다. `private: true`, `commit: false`, `privatePackages.tag: false`를 유지한다.
- 내부 의존성은 `workspace:` 프로토콜을 유지한다. 현재 `@repo/ui`를 올리면 `workspace:*`로 의존하는 `web`·`docs`도 각자의 버전에서 patch 상승한다. 독립 버전에서도 의존성 전파가 있으므로 전체 계획을 확인한다. 제품 변경으로 앱 릴리즈를 의도했다면 앱도 changeset에 명시한다.
- 기본 버전은 SemVer `N.N.N`이다. prerelease·snapshot은 명시적 요청이 있을 때만 별도 범위를 확인한다.
- 일반 구현·커밋·배포 중 버전을 자동 적용하지 않는다. 문서·테스트·개발 도구만 바뀌었다면 제품 bump를 만들지 않는다.

예를 들어 `web` 수정만 릴리즈하려면 다음 changeset을 작성한다.

```md
---
'web': patch
---

실제 변경에 근거한 사용자 관점의 수정 내용을 작성한다.
```

## 적용과 검증

1. Git diff와 현재 패키지별 버전, `.changeset/*.md`를 읽는다.
2. `pnpm changeset:status`에서 다음 버전을 확인한다. `release:version`은 전체 대기 changeset을 적용하므로 무관한 릴리즈가 섞여 있으면 실행 범위를 먼저 정한다.
3. 버전 적용 요청이 있을 때 `pnpm release:version`을 실행한다.
4. 실제 버전·changelog·소비된 changeset·lockfile을 사전 계획과 대조하고, `pnpm install --lockfile-only --frozen-lockfile --ignore-scripts`로 lockfile 정합성을 확인한다.

`baseBranch`는 현재 개발 통합 브랜치인 `develop`이다. 다른 기준의 조회에는 `pnpm changeset:status --since main`처럼 ref를 지정한다. 기준 브랜치 대비 패키지 변경이 있는데 changeset이 없으면 `status`는 종료 코드 1을 반환할 수 있다. 이 결과를 설치 실패나 버전 적용 성공으로 해석하지 않는다.

대기 changeset이 없으면 버전 적용을 실행하지 않는다. Changesets 3에서 이 상태로 `pnpm release:version`을 실행하면 파일을 변경하지 않고 `No unreleased changesets found`와 종료 코드 1을 반환한다.

버전 적용 후 lockfile 갱신만 실패하면 현재 변경을 보존하고 적용 결과를 먼저 확인한다. 필요한 설치 단계부터 재개하며, 버전 명령을 반복 실행하거나 changeset을 다시 만들지 않는다.

Changesets의 자동 포맷은 `format: false`로 끈다. 포맷이 필요한 파일은 프로젝트의 Oxfmt 정책을 따른다.

AI 작업은 Codex에서 `$changesets-version`, Claude Code에서 `/changesets-version`을 사용한다. `check`, `add`, `version` 또는 자연어로 범위를 전달할 수 있다.

설정과 CLI 동작은 [Changesets 설정 문서](https://changesets.dev/guide/config)와 [CLI 문서](https://changesets.dev/guide/cli)를 참고한다.
