import { describe, it } from 'node:test';
import { RuleTester } from 'oxlint/plugins-dev';
import layerImports from './rules/fsd-layer-imports.ts';
import publicApi from './rules/fsd-public-api.ts';
import sliceSegments from './rules/fsd-slice-segments.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const cwd = '/fsd-project';
const filename = (path: string) => `${cwd}/src/${path}`;
const tester = new RuleTester({ cwd, languageOptions: { parserOptions: { lang: 'ts' } } });

tester.run('fsd-layer-imports', layerImports, {
  valid: [
    { filename: filename('features/auth/model/session.ts'), code: "import '@/entities/user';" },
    { filename: filename('features/auth/model/session.ts'), code: "import '../api/login';" },
    { filename: filename('entities/cart/model/cart.ts'), code: "import '@/entities/user/@x/cart';" },
    { filename: filename('shared/lib/date/index.ts'), code: "import '@/shared/lib/format';" },
    { filename: filename('features/auth/index.ts'), code: "import '@repo/ui';" },
    { filename: filename('shared/lib/load.ts'), code: 'export const load = (name: string) => import(name);' },
    { filename: `${cwd}/tools/build.ts`, code: "import '@/app/providers';" },
    {
      filename: filename('widgets/header/ui/header.ts'),
      code: "import '@/widgets/footer';",
      options: [{ allowCrossSliceLayers: ['widgets'] }],
    },
    {
      filename: filename('features/generated/model/item.ts'),
      code: "import '@/app/providers';",
      options: [{ ignore: ['features/generated'] }],
    },
    {
      filename: filename('entities/user/model/user.ts'),
      code: "import '@/features/generated';",
      options: [{ ignore: ['features/generated'] }],
    },
    {
      filename: `${cwd}/client/features/auth/model/session.ts`,
      code: "import '@entities/user';",
      options: [{ roots: [{ path: 'client', aliases: { '@entities': 'entities' } }] }],
    },
  ],
  invalid: [
    ...[
      "import '@/features/auth';",
      "export { login } from '@/features/auth';",
      "export * from '@/features/auth';",
      "export const load = () => import('@/features/auth');",
      "export type Session = import('@/features/auth').Session;",
    ].map((code) => ({
      filename: filename('entities/user/model/user.ts'),
      code,
      errors: [{ messageId: 'invalidDirection', data: { fromLayer: 'entities', toLayer: 'features' } }],
    })),
    {
      filename: filename('features/auth/model/session.ts'),
      code: "import '@/features/cart';",
      errors: [{ messageId: 'crossSliceSameLayer' }],
    },
    {
      filename: filename('entities/cart/model/cart.ts'),
      code: "import '@/entities/user/@x/order';",
      errors: [{ messageId: 'crossSliceSameLayer' }],
    },
    {
      filename: filename('entities/cart/model/cart.ts'),
      code: "import '@/entities/user/@x/cart';",
      options: [{ allowEntityCrossImports: false }],
      errors: [{ messageId: 'crossSliceSameLayer' }],
    },
    {
      filename: filename('features/auth/model/session.ts'),
      code: "import '../../../app/providers';",
      options: [{ publicApiIgnoreLayers: ['app'] }],
      errors: [{ messageId: 'invalidDirection' }],
    },
    {
      filename: `${cwd}/client/shared/lib/date.ts`,
      code: "import '@features/auth';",
      options: [{ roots: [{ path: 'client', aliases: { '@features': 'features' } }] }],
      errors: [{ messageId: 'invalidDirection' }],
    },
  ],
});

tester.run('fsd-public-api', publicApi, {
  valid: [
    { filename: filename('features/auth/model/session.ts'), code: "import '@/entities/user';" },
    { filename: filename('features/auth/model/session.ts'), code: "import '@/entities/user/index.ts';" },
    { filename: filename('features/auth/model/session.ts'), code: "import '../api/login';" },
    { filename: filename('features/auth/ui/login.ts'), code: "import '@/shared/ui/button';" },
    { filename: filename('shared/ui/button/button.ts'), code: "import './styles';" },
    { filename: filename('entities/cart/model/cart.ts'), code: "import '@/entities/user/@x/cart';" },
    { filename: filename('features/auth/index.ts'), code: "export { default } from 'react';" },
    {
      filename: filename('app/layout.tsx'),
      code: "import './globals.css';",
      options: [{ publicApiIgnoreLayers: ['app'] }],
    },
    {
      filename: filename('features/auth/model/session.ts'),
      code: "import '@/entities/user/public';",
      options: [{ publicApiFiles: ['public'] }],
    },
  ],
  invalid: [
    ...[
      "import '@/entities/user/model/user';",
      "export { user } from '@/entities/user/model/user';",
      "export * from '@/entities/user/model/user';",
      "export const load = () => import('@/entities/user/model/user');",
      "export type User = import('@/entities/user/model/user').User;",
    ].map((code) => ({
      filename: filename('features/auth/model/session.ts'),
      code,
      errors: [{ messageId: 'usePublicApi', data: { layer: 'entities', publicName: 'user' } }],
    })),
    {
      filename: filename('features/auth/ui/login.ts'),
      code: "import '@/shared/ui/button/button';",
      errors: [{ messageId: 'usePublicApi' }],
    },
    {
      filename: `${cwd}/app/page.tsx`,
      code: "import '@/features/auth/model/session';",
      options: [{ roots: ['src', { path: '.', aliases: { '@': 'src' } }], publicApiIgnoreLayers: ['app'] }],
      errors: [{ messageId: 'usePublicApi' }],
    },
  ],
});

tester.run('fsd-slice-segments', sliceSegments, {
  valid: [
    { filename: filename('features/auth/index.ts'), code: 'export {};' },
    { filename: filename('features/auth/model/session.mts'), code: 'export {};' },
    { filename: filename('entities/cart/@x/order.ts'), code: 'export {};' },
    { filename: filename('shared/lib/date.ts'), code: 'export {};' },
    { filename: filename('app/providers/index.ts'), code: 'export {};' },
    { filename: filename('app/page.tsx'), code: 'export {};', options: [{ ignoreLayers: ['app'] }] },
    { filename: `${cwd}/next.config.ts`, code: 'export {};' },
  ],
  invalid: [
    { filename: filename('features/auth.ts'), code: 'export {};', errors: [{ messageId: 'missingSlice' }] },
    { filename: filename('features/auth/login.tsx'), code: 'export {};', errors: [{ messageId: 'missingSegment' }] },
    { filename: filename('shared/date.ts'), code: 'export {};', errors: [{ messageId: 'missingSegment' }] },
    { filename: filename('app/bootstrap.ts'), code: 'export {};', errors: [{ messageId: 'missingSegment' }] },
  ],
});
