import type { Context, ESTree, VisitorWithHooks } from '@oxlint/plugins';
import { createFsdPolicy, type FsdLocation } from './fsd.ts';
import type { FsdOptions } from './options.ts';

type ImportNode =
  | ESTree.ImportDeclaration
  | ESTree.ExportNamedDeclaration
  | ESTree.ExportAllDeclaration
  | ESTree.ImportExpression
  | ESTree.TSImportType;

export function createImportListener(context: Context, check: 'checkLayers' | 'checkPublicApi'): VisitorWithHooks {
  let filename: string;
  let policy: ReturnType<typeof createFsdPolicy>;
  let from: FsdLocation | undefined;

  const visit = (node: ImportNode): void => {
    const source = node.source;
    if (!from || source?.type !== 'Literal' || typeof source.value !== 'string') return;
    const to = policy.resolveImport(source.value, from, filename);
    if (!to) return;
    const isReexport = node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration';
    const violation =
      check === 'checkPublicApi' ? policy.checkPublicApi(from, to, isReexport) : policy.checkLayers(from, to);
    if (violation) context.report({ node: source, ...violation });
  };
  return {
    before() {
      // createOnce reuses visitors; every file must reset its context and options.
      from = undefined;
      filename = context.filename;
      if (!filename || filename.startsWith('<')) return false;
      policy = createFsdPolicy(context.cwd, context.options[0] as FsdOptions | undefined);
      from = policy.locate(filename);
      if (!from) return false;
    },
    ImportDeclaration: visit,
    ExportNamedDeclaration: visit,
    ExportAllDeclaration: visit,
    ImportExpression: visit,
    TSImportType: visit,
  };
}
