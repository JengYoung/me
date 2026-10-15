import { defineRule } from '@oxlint/plugins';
import { createImportListener } from '../import-listener.ts';
import { optionSchema } from '../options.ts';

const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce FSD layer direction and slice isolation',
      url: 'https://github.com/no-k/hermes/tree/main/packages/lib/lint/fsd#fsd-layer-imports',
    },
    schema: [optionSchema],
    messages: {
      invalidDirection: "FSD layer '{{fromLayer}}' cannot import upper layer '{{toLayer}}'.",
      crossSliceSameLayer:
        "FSD same-layer imports must stay inside the same slice. '{{fromLayer}}/{{fromSlice}}' cannot import '{{toLayer}}/{{toSlice}}'.",
    },
  },
  createOnce: (context) => createImportListener(context, 'checkLayers'),
});

export default rule;
