# 포스트 상세 페이지

`app/posts/[postId]/page.tsx`는 `apps/web/docs/posts/{postId}/{version}.mdx` 중 숫자로 가장 큰 공개 버전을 정적으로 렌더링합니다. 폴더 이름이 고정된 글 식별자이며, 라우트·컴포넌트에서는 `postId`, 글 데이터에서는 `post.id`로 전달합니다. `?version=1.0.0`은 최신 HTML로 시작하고 hydration 후 해당 과거 MDX 모듈만 불러옵니다. canonical은 항상 `https://jengyoung.co.kr/posts/{postId}`입니다.

`build`는 `content:validate`·`content:generate` 후 Next.js를 빌드하고, `check-types`는 `content:generate` 후 타입을 검사합니다. `dev`는 같은 생성기로 초안까지 포함한 로컬 미리보기를 준비합니다. `scripts/generate-posts.ts`는 이 앱의 실제 `docs/posts`를 읽습니다. 생성된 최신 MDX의 정적 import와 과거 MDX의 `next/dynamic` 목록은 공개용 `generated/`, 개발용 `generated-preview/`에 있으며 Git에 포함하지 않습니다. 개발 서버는 원고 변경과 새 파일을 감지해 목록을 갱신합니다.

작성자는 저장소 루트의 `pnpm post:new`, `pnpm post:edit`, `pnpm post:publish`를 사용합니다. 사용법과 발행 계약은 [로컬 콘텐츠 발행 절차](../../../../.agent-source/project/content/publishing.md)를 참고합니다.

`0.x.x.mdx`, `.local.*`, 기존 `.md`는 공개 대상으로 읽지 않습니다. 작성 중인 원고는 자동으로 이동·승격하지 않습니다. 공개 글이 없으면 `/posts`는 빈 목록, 상세 URL은 404입니다.

일반 개발 서버에서 실제 초안까지 미리 봅니다.

```sh
pnpm --filter web dev
```

`http://localhost:3000/posts`에서 실제 `docs/posts`의 원고를 확인합니다. `content:preview`도 같은 `dev` 명령을 실행하며 별도 서버로 구분하지 않습니다. 포트 변경은 `dev --port 3102`처럼 지정합니다. 개발 서버에서는 `0.x.x.md`, `0.x.x.mdx`, `0.x.x.local.md`, `0.x.x.local.mdx`를 읽고, 글마다 숫자로 가장 큰 초안을 우선 표시합니다. 기존 원고의 빈 날짜와 시리즈 순서를 임의로 채우거나 바꾸지 않습니다. 본문·메타데이터·파일 추가 변경을 감지해 목록을 다시 생성합니다.

초안에는 미리보기 표시와 `noindex`를 적용하고 sitemap·canonical·공개 아티클 구조화 데이터에서 제외합니다. 개발 서버는 로컬 주소에만 바인딩하며 프로덕션 모드로 실행할 수 없습니다. 개발용 생성 모듈은 `generated-preview/`, 빌드는 `.next-preview/`를 사용합니다. 공개 빌드의 `generated/`와 분리되어, 개발 서버 실행 중에도 `build`는 공개 버전만 읽습니다. 화면의 `@post-content/*` import는 실행 모드에 맞는 생성 모듈로 연결됩니다.

메타데이터는 `title`, 시간대를 포함한 `publishedAt`을 읽고, 생략된 `summary`·`tags`는 빈 값으로 표시합니다. `reason`·`series`는 선택적이며 제공된 값의 타입은 검증합니다. 콘텐츠 계약의 정본은 `.agent-source/project/content/`입니다.

`@next/mdx`의 remark 단계에서 frontmatter·GFM·중복 없는 앵커·목차를 처리하고, Markdown 이미지와 `ArticleImage`의 로컬 참조를 정적 이미지 import로 연결합니다. 이미지는 같은 글 폴더의 `./1.0.0.이미지.png` 형태이며, 이전 공개 이미지를 그대로 재사용합니다. 초안·누락·다른 디렉터리의 자산은 빌드 오류입니다. 문서 전체를 public으로 복사하지 않습니다. rehype 단계에서는 기존 아티클 코드 강조를 재사용합니다.

초안 미리보기에서만 같은 글 폴더의 기존 비버전 이미지도 참조할 수 있습니다. 실제 원고의 이미지를 복사하거나 이름을 바꾸지 않습니다. 공개 원고의 자산 계약은 미리보기에서도 동일하게 검증합니다.

MDX와 콘텐츠 이미지는 `docs`에서 관리하며 `app` 아래에 별도의 콘텐츠 트리를 만들지 않습니다. 개발·빌드·E2E 모두 같은 실제 `docs/posts`를 읽습니다. 공개 E2E는 실제 공개 파일에 맞춰 목록·사이트맵·상세 주소와 초안만 있는 글의 404를 검사합니다. 미리보기 E2E는 별도 개발 서버에서 실제 초안의 본문·이미지·모바일 넘침과 검색 제외를 검사합니다. 공개 원고가 없으면 공개 본문·과거 버전 전환의 앱 검증은 수행할 수 없습니다. 테스트용 원고를 추가하거나 실제 원고를 공개 버전으로 바꾸지 않습니다. `BLOG_NEXT_DIST_DIR`는 공개 E2E의 빌드 경로를 `.next-e2e`로 분리하는 데 사용합니다.

검증 명령:

```sh
pnpm --filter web test --project node entities/post scripts/generate-posts.test.ts scripts/mdx
pnpm --filter web test shared/article
pnpm --filter web check-types
pnpm --filter web test:e2e
pnpm --filter web test:e2e:preview
```
