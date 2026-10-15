# Turborepo 작업 안내

{{PURPOSE}}

## 요청 해석

호출 인자: `$ARGUMENTS`

인자는 작업 설명으로 읽고 현재 대화와 함께 범위를 판단한다. 문자열을 그대로 `Bash`에 전달하지 않는다. 인자가 없으면 현재 요청을 사용한다.

{{TRIGGERS}}

입력: {{INPUTS}}

## 문서부터 확인하기

{{STEPS}}

- `Glob`·`Grep`으로 관련 workspace 정의, `package.json`, lockfile, `turbo.json` 또는 `turbo.jsonc`, 패키지별 설정을 찾고 `Read`로 확인한다.
- `Read`로 `node_modules/turbo/docs/README.md`의 작업 색인을 읽는다. 경로가 없거나 workspace 링크·비평탄 설치 구조라면 `Bash`에서 `node -p "require.resolve('turbo/package.json')"`으로 위치를 확인한 뒤, 그 패키지의 `package.json`과 `docs/README.md`를 읽는다. 셸 명령은 현재 환경의 실행 규칙을 따른다.
- 색인에서 현재 작업에 필요한 문서만 골라 읽는다. 설정·스크립트·CI 수정 전에 실제 설치 버전의 옵션과 제약을 확인한다.
- 패키지가 없거나 동봉 문서를 제공하지 않는 버전이면 기존 버전 제약을 확인하고 해당 릴리스의 [공식 문서](https://turborepo.dev/docs)를 찾는다. 정확한 근거가 없으면 한계를 보고한다. 설치가 요청 범위에 포함되어 진행한 경우에는 설치 후 동봉 문서를 우선한다.

## 변경과 결과 확인

수정 요청은 `Edit`로 필요한 파일만 바꾸고, `Bash`에서 해당 문서와 프로젝트 스크립트에 맞춰 작업 계획과 영향받는 명령을 검사한다. 현재 대화에서 작업하며, 권한은 세션의 정상 승인 흐름을 따른다. 스킬에서 `allowed-tools`로 미리 허용하거나 권한 설정을 수정하지 않는다.

{{CONSTRAINTS}}

{{STOP}}

{{VERIFICATION}}

{{OUTPUTS}}

{{NON_GOALS}}

## 실행 보류 확인

{{RUNTIME_STATUS}}
