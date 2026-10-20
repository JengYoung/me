---
name: "changesets-version"
description: "Changesets로 앱·패키지의 독립 버전, changelog와 lockfile을 동기화한다. 버전 현황·릴리즈 계획 조회, changeset 작성, 버전 적용 요청에 사용하며 일반 구현·커밋·배포만으로 버전을 올리지 않는다."
argument-hint: "[check | add | version 또는 작업 요청]"
disable-model-invocation: false
user-invocable: true
---

<!-- AUTO-GENERATED from .agent-source/skills/changesets-version/source.md by scripts/sync-instructions.mjs. Do not edit; run node scripts/sync-instructions.mjs --write. -->

# Changesets 버전 동기화

앱·패키지별 독립 버전을 유지하면서 Changesets의 릴리즈 계획에 따라 버전·내부 의존성·changelog·lockfile을 일관되게 갱신한다.

## 요청 해석

호출 인자: `$ARGUMENTS`

인자를 현재 대화와 함께 읽는다. `check`는 조회, `add`는 changeset 작성, `version`은 버전 적용의 예시다. 인자를 그대로 `Bash`에 전달하지 않는다.

버전 현황이나 릴리즈 계획 확인, changeset 작성·검토, 버전 업데이트·동기화 요청에 사용한다. 조회, changeset 작성, 버전 적용 중 요청된 범위를 구분한다.

입력: 사용자 요청과 기존 작업 범위, Git 변경, 루트·워크스페이스의 `package.json`, `pnpm-workspace.yaml`, `.changeset/config.json`, 대기 changeset, 패키지 changelog, `pnpm-lock.yaml`.

## 작업

`Glob`·`Grep`·`Read`로 패키지·설정·changeset·changelog를 확인한다. 프로젝트 루트의 `.changeset/README.md`에서 상세 사용법과 설정 근거를 확인한다. `Bash`는 현재 환경의 명령 실행 규칙을 따르고 changeset을 직접 작성해야 할 때는 `Write`·`Edit`를 사용한다.

1. 현재 변경과 패키지별 버전을 읽고 요청을 조회·changeset 작성·버전 적용으로 해석한다. 인자가 없으면 현황을 확인한다.
2. 루트는 버전 대상에서 제외하고 `apps/*`·`packages/*`의 실제 패키지명을 사용한다. `fixed`·`linked`는 빈 배열이며 private 패키지도 버전 관리한다.
3. 조회는 `pnpm changeset:status`로 대기 changeset과 의존 패키지를 포함한 계획을 확인하고 파일을 쓰지 않는다. 비교 기준이 필요하면 설정의 `baseBranch`를 확인하고 `--since <ref>`를 사용한다.
4. changeset 작성은 변경 근거, 대상 패키지, `major`·`minor`·`patch`, 한국어 변경 요약을 정한다. 호환성 파괴는 major, 하위 호환 기능 추가는 minor, 호환되는 수정은 patch를 기준으로 판단한다. 판단에 필요한 영향이 불명확할 때만 질문한다.
5. 작성 요청에는 `pnpm changeset` 또는 `.changeset/<고유한-이름>.md` 편집으로 changeset을 만든다. CLI가 대화형이면 같은 YAML frontmatter 형식으로 파일을 작성할 수 있다. 기존 changeset과 겹치는 변경을 중복 등록하지 않는다.
6. 적용 요청에는 전체 대기 계획이 요청 범위에 포함되는지 확인한 후 `pnpm release:version`을 실행한다. 이 명령은 모든 대기 changeset을 적용하고 lockfile을 갱신한다. 특정 패키지만 요청했는데 무관한 대기 릴리즈가 있으면 임의 삭제·무시하지 않고 범위를 확인한다.
7. 실제 버전·changelog·의존성·소비된 changeset·lockfile을 실행 전 계획과 대조한다. 실패가 있으면 성공한 단계와 남은 단계를 구분하고, 부분 적용을 되돌리거나 재실행하기 전에 현재 파일을 확인한다.

changeset 파일의 형식은 다음과 같으며 실제 대상·bump·요약으로 바꾼다.

```md
---
'web': patch
---

실제 변경에 근거한 사용자 관점의 수정 내용을 작성한다.
```

## 범위와 실패 처리

- 버전의 정본은 각 패키지의 `package.json`이다. 루트 버전을 추가하거나 앱·패키지를 같은 버전으로 맞추지 않는다.
- 내부 의존성 전파로 소비 패키지가 함께 bump될 수 있다. 현재 `@repo/ui`의 버전 변경은 `workspace:*`로 의존하는 `web`·`docs`의 patch 릴리즈도 만든다. 실제 전파는 의존성 종류·범위와 현재 계획에서 확인하고, 제품 변경으로 앱 릴리즈를 의도했다면 앱을 changeset에 명시한다.
- 기존 사용자 변경과 대기 changeset을 보존한다. 명시한 쓰기·적용 요청은 그 범위의 권한으로 해석하며 같은 승인을 반복 요청하지 않는다.
- changeset 작성은 릴리즈 예약이며 버전 적용과 별개다. 일반 구현·커밋·배포만으로 버전을 올리지 않는다.
- 기본 버전 형식은 SemVer `N.N.N`이다. prerelease·snapshot은 명시적 요청이 있을 때만 해당 모드와 범위를 확인한다.

유효하지 않은 changeset, 실제 패키지명과의 불일치, 요청 범위 밖의 대기 릴리즈, 예상하지 않은 prerelease 상태, 실행 실패 또는 권한 거절이 있으면 해당 쓰기 단계를 멈추고 이유와 현재 상태를 보고한다. 대기 changeset이 없으면 버전 적용을 실행하지 않는다. 이 상태에서 Changesets 3의 version 명령이 반환하는 `No unreleased changesets found`·종료 코드 1은 버전 변경이 없다는 뜻이다. 버전 적용 뒤 lockfile 갱신만 실패했다면 적용 결과를 검토하고 해당 설치 단계부터 재개한다.

## 확인과 보고

- 조회와 changeset 작성만 요청했다면 패키지 버전이 그대로인지 확인한다.
- 버전 적용 후 계획에 포함된 패키지의 버전과 changelog, changeset 소비를 확인한다. 계획에 없는 패키지를 일괄 변경하지 않았는지도 확인한다.
- `pnpm install --lockfile-only --frozen-lockfile --ignore-scripts`로 manifest와 lockfile 정합성을 확인한다. 내부 의존성의 `workspace:` 프로토콜과 각 패키지의 `private: true`를 보존한다.
- 의존성 범위나 제품 코드가 달라지면 영향받는 패키지의 실제 품질 검사도 실행한다. 버전 메타데이터 검사를 제품 빌드·배포 검증으로 보고하지 않는다.

패키지별 이전·다음 버전과 bump 근거, 작성·소비한 changeset, 변경된 changelog·lockfile, 실행한 검사와 실패·미검증 범위를 보고한다. 조회나 작성 단계라면 버전이 아직 적용되지 않았음을 표시한다.

이 스킬은 커밋·태그·npm 게시·외부 배포를 자동 실행하거나 CI를 추가하지 않는다. 관련 작업은 사용자에게 맡겨진 범위에서 별도로 처리한다.

## 실행 보류 확인

- Claude Code: **로그인 만료 = 잠정 보류**. 지침·스킬 생성과 정적 검사는 계속한다. 사용자가 재개를 요청할 때까지 해당 도구의 CLI 실행·모델 호출·인증 복구·결제 변경을 시도하지 않는다. `.agent-source/targets.json`의 `runtime.status`를 임의로 해제하지 않는다.
