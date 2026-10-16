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
