# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## 개발 환경

[mise](https://mise.jdx.dev/)로 Node.js 24 LTS와 pnpm 12를 사용합니다. 정확한 버전은 [mise.toml](mise.toml)에 고정하며, `package.json`의 `packageManager`도 같은 pnpm 버전을 사용합니다.

```sh
mise trust
mise install
mise exec -- node --version
mise exec -- pnpm --version
```

셸에 mise가 활성화되어 있으면 이 프로젝트에서 해당 버전이 자동 선택됩니다. 그 외에는 `mise exec -- pnpm <명령>`으로 실행합니다. 버전을 갱신할 때는 `mise.toml`과 `package.json`을 함께 수정합니다.

## 블로그 작성

저장소 루트에서 실행합니다.

```sh
pnpm post:new                       # 새 글: ID·제목·요약·태그·시리즈를 대화형으로 입력
pnpm post:edit                      # 기존 초안 또는 최신 공개 글의 수정 초안
pnpm --filter web dev               # localhost:3000/posts에서 실제 초안 미리보기
pnpm content:validate --drafts      # 원고·MDX·이미지 검사
pnpm post:publish                  # 버전 분류·발행 시각을 확인하고 새 공개 파일 준비
```

`post:new --local`은 Git에서 제외하는 `0.0.0.local.mdx`를 만듭니다. `post:publish --dry-run`으로 파일 생성 전 결과를 확인할 수 있습니다. 각 명령은 `--help`를 지원합니다. 발행 준비는 기존 원고와 이미지를 보존하며, 커밋·배포는 작성자가 별도로 진행합니다. 상세 규칙은 [작성·발행 계약](.agent-source/project/content/publishing.md)을 참고합니다.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: shared Iris headless React component library
- `@repo/eslint-config`: legacy ESLint presets retained from the scaffold
- `@repo/lint-config`: shared Oxlint React and Next.js configurations, including the FSD plugin
- `@repo/format-config`: shared Oxfmt React configuration used by `@repo/ui`
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Applications and UI components use [TypeScript](https://www.typescriptlang.org/). Shared lint and format presets are exported as JavaScript modules.

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) for Next.js application and shared UI linting
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) for shared UI formatting

루트에서 `pnpm lint`, `pnpm format`, `pnpm format:check`를 실행합니다. 포맷 명령은 해당 스크립트가 있는 패키지에 적용되며, 현재 대상은 `@repo/ui`입니다. Next.js·React·FSD 린트 설정은 [lint-config](packages/lint-config/README.md), React 포맷 설정은 [format-config](packages/format-config/README.md)를 참고합니다.

### Versioning

Changesets로 앱·패키지별 독립 버전을 관리합니다. `pnpm changeset`으로 변경을 기록하고, `pnpm changeset:status`로 다음 버전을 확인한 뒤, 릴리즈 준비 시 `pnpm release:version`으로 버전·changelog·lockfile을 갱신합니다.

설정과 상세 절차는 [버전 관리 안내](.changeset/README.md)를 참고합니다. AI 작업에는 Codex의 `$changesets-version` 또는 Claude Code의 `/changesets-version`을 사용합니다.

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo build
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo build
pnpm exec turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
pnpm exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
pnpm exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
pnpm exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
pnpm exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
