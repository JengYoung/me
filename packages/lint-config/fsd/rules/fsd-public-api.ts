import { defineRule } from '@oxlint/plugins';
import { createImportListener } from '../import-listener.ts';
import { optionSchema } from '../options.ts';

const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce public API imports across FSD scopes',
      url: 'https://github.com/no-k/hermes/tree/main/packages/lib/lint/fsd#fsd-public-api',
    },
    schema: [optionSchema],
    messages: {
      usePublicApi: "FSD cross-scope import must use the public API of '{{layer}}/{{publicName}}'.",
    },
  },
  createOnce: (context) => createImportListener(context, 'checkPublicApi'),
});

export default rule;
