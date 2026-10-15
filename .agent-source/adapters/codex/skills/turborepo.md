# Turborepo 구성과 진단

{{PURPOSE}}

## 적용 범위

{{TRIGGERS}}

입력: {{INPUTS}}

`$turborepo` 뒤의 요청과 현재 대화에서 설명·진단·수정 범위를 판단한다. 별도의 고정 작업 모드를 가정하지 않는다.

## 문서 확인과 작업

{{STEPS}}

1. 파일 검색과 셸 도구로 관련 `package.json`, workspace 정의, lockfile, `turbo.json` 또는 `turbo.jsonc`, 패키지별 설정과 실패 로그를 확인한다. 셸 명령은 현재 환경의 실행 규칙을 따른다.
2. 설치되어 있으면 `node_modules/turbo/docs/README.md`를 작업 색인으로 읽는다. 경로가 없거나 비평탄 설치 구조라면 `node -p "require.resolve('turbo/package.json')"`으로 패키지 위치를 찾고, 그 디렉터리의 `docs/README.md`를 읽는다. 실제 버전은 찾은 `package.json`에서 확인한다.
3. 색인이 가리키는 관련 문서를 먼저 읽고 구성·패키지 스크립트·CI를 수정한다. 버전에 따라 달라지는 옵션과 실험 기능은 기억으로 추가하지 않는다.
4. 미설치 또는 동봉 문서가 없는 버전이면 기존 버전 제약을 확인하고 해당 릴리스의 [공식 문서](https://turborepo.dev/docs)를 찾는다. 일치하는 근거를 찾지 못하면 그 한계를 밝힌다. 설치가 요청 범위에 포함되어 진행한 경우에는 설치 후 동봉 문서를 다시 우선한다.
5. 수정 요청은 파일 편집 도구로 필요한 범위만 바꾸고, 해당 문서와 프로젝트 스크립트에 맞춰 작업 계획 및 영향받는 명령을 검사한다. 쓰기·실행이 샌드박스에 막히면 지원되는 승인 절차를 사용하며 설정으로 우회하지 않는다.

## 범위와 검증

{{CONSTRAINTS}}

{{STOP}}

{{VERIFICATION}}

{{OUTPUTS}}

{{NON_GOALS}}

## 도구 실행 상태

{{RUNTIME_STATUS}}
