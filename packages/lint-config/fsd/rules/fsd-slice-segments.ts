import { defineRule } from '@oxlint/plugins';
import { createFsdPolicy } from '../fsd.ts';
import { type FsdOptions, optionSchema } from '../options.ts';

const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce FSD slice/segment structure, including segment-only App and Shared',
      url: 'https://github.com/no-k/hermes/tree/main/packages/lib/lint/fsd#fsd-slice-segments',
    },
    schema: [optionSchema],
    messages: {
      missingSlice: "FSD layer '{{layer}}' must contain slice directories before implementation files.",
      missingSegment:
        "FSD implementation in '{{layer}}/{{slice}}' must live in a segment or be an allowed public API entrypoint.",
    },
  },
  createOnce(context) {
    return {
      Program(node) {
        if (!context.filename || context.filename.startsWith('<')) return;
        const policy = createFsdPolicy(context.cwd, context.options[0] as FsdOptions | undefined);
        const location = policy.locate(context.filename);
        if (!location) return;
        const violation = policy.checkStructure(location);
        if (violation) context.report({ node, ...violation });
      },
    };
  },
});

export default rule;
