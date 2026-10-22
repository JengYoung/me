# 일기

`/diary`와 `/diary/{entryId}`는 `docs/diary/{year}/{entryId}.mdx`를 읽습니다. 연도 폴더 하나에 여러 일기를 두고, 일기마다 파일 하나를 직접 수정합니다. 목록·본문 헤더·페이지 틀과 MDX 렌더러는 포스트와 공유합니다. 일기에는 시리즈·버전 파일·수정 이력·과거 본문 로더가 없습니다.

일기 영역은 공통 아티클의 `typography="serif"` 옵션으로 [고운바탕](https://noonnu.cc/font_page/733)을 사용합니다. 목록·제목·본문·인용문에 적용하며 Regular(400)·Bold(700) 웹폰트를 로컬에서 제공합니다. 기본 본문·요약은 `body-3` 토큰의 14px·행간 24px이며 제목의 크기 계층은 유지합니다. 포스트의 기본 서체·크기, 전역 메뉴와 코드의 고정폭 글꼴에는 영향을 주지 않습니다.

```text
docs/diary/
└── 2026/
    ├── daily-note.mdx
    ├── evening-walk.mdx
    └── evening-walk.사진.png
```

```sh
pnpm diary:new daily-note --title "하루의 기록" --entry-date 2026-10-22
pnpm diary:edit daily-note
pnpm diary:publish daily-note --published-at "2026-10-22T15:00:00+09:00" --dry-run
pnpm diary:publish daily-note --published-at "2026-10-22T15:00:00+09:00"
```

필수 인자를 생략하면 대화형으로 입력합니다. 위 명령은 `docs/diary/2026/daily-note.mdx`를 만듭니다. 새 일기는 `publishedAt`이 비어 있는 초안입니다. `--local`은 Git에서 제외되는 `{entryId}.local.mdx`를 만들며 발행할 때 같은 연도의 `{entryId}.mdx`로 전환합니다. 다른 연도에도 같은 ID의 원고를 둘 수 없습니다. 공개 후에는 같은 파일을 직접 수정하고 최초 발행 시각을 유지합니다. 실제 공개는 Git 반영과 별도 배포 이후입니다.

`entryDate`는 기록 대상 날짜이고 `publishedAt`은 실제 최초 발행 시각입니다. 연도 폴더는 `entryDate`의 연도와 일치해야 하며 목록은 기록 날짜 내림차순입니다. URL은 연도 없이 `/diary/daily-note`로 유지합니다. 이미지는 같은 연도 폴더의 `./evening-walk.사진.png`처럼 참조하며 버전 접두어나 사본을 만들지 않습니다. 기록 날짜의 연도를 정정할 때는 원고와 필요한 이미지를 해당 연도로 옮기고 ID는 유지합니다.

`pnpm --filter web dev`로 `/diary`에서 초안까지 미리 봅니다. 공개 빌드는 발행 시각 없는 초안과 `.local.mdx`를 목록·상세·사이트맵·MDX import에서 제외합니다. 기존 날짜형 `.md`는 별도 이관 요청 전까지 그대로 둡니다.

저장·시리즈·히스토리 경계의 정본은 [콘텐츠 저장 계약](../../../../.agent-source/project/content/storage.md)의 0절, 작성·발행 절차는 [발행 계약](../../../../.agent-source/project/content/publishing.md)입니다.
