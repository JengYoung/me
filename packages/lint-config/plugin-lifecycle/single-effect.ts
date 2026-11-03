import { defineRule, type Context, type ESTree, type Variable } from '@oxlint/plugins';

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression;
type Binding = { name: string; source?: string; namespace?: boolean };
type Component = { node: FunctionNode; name: string; effects: ESTree.CallExpression[] };

function isFunction(node: ESTree.Node): node is FunctionNode {
  return ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type);
}

function unwrap(node: ESTree.Node): ESTree.Node {
  while (
    node.type === 'TSAsExpression' ||
    node.type === 'TSSatisfiesExpression' ||
    node.type === 'TSNonNullExpression' ||
    node.type === 'TSTypeAssertion' ||
    node.type === 'ParenthesizedExpression' ||
    node.type === 'ChainExpression'
  ) {
    node = node.expression;
  }
  return node;
}

function findVariable(context: Context, node: Extract<ESTree.Node, { type: 'Identifier' }>): Variable | undefined {
  let scope: ReturnType<Context['sourceCode']['getScope']> | null = context.sourceCode.getScope(node);
  while (scope) {
    const variable = scope.set.get(node.name);
    if (variable) return variable;
    scope = scope.upper;
  }
}

function propertyName(node: ESTree.MemberExpression): string | undefined {
  if (!node.computed && node.property.type === 'Identifier') return node.property.name;
  if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
    return node.property.value;
  }
}

/** import 원본과 const 별칭을 추적하며, 같은 이름의 지역 변수는 React Hook으로 세지 않습니다. */
function resolveBinding(context: Context, expression: ESTree.Node, seen = new Set<Variable>()): Binding | undefined {
  const node = unwrap(expression);
  if (node.type === 'MemberExpression') {
    const object = resolveBinding(context, node.object, seen);
    const name = propertyName(node);
    if (object?.namespace && name) return { name, source: object.source };
    return name ? { name } : undefined;
  }
  if (node.type !== 'Identifier') return;
  const variable = findVariable(context, node);
  if (!variable || seen.has(variable)) return { name: node.name };
  seen.add(variable);
  const definition = variable.defs[0];
  if (!definition) return { name: node.name };
  const declaration = definition.node;
  if (definition.type === 'ImportBinding' && declaration.parent?.type === 'ImportDeclaration') {
    const source = declaration.parent.source.value;
    if (declaration.type === 'ImportSpecifier') {
      const imported = declaration.imported;
      return { name: imported.type === 'Identifier' ? imported.name : imported.value, source };
    }
    return {
      name: node.name,
      source,
      namespace: declaration.type === 'ImportNamespaceSpecifier' || source === 'react',
    };
  }
  if (
    declaration.type === 'VariableDeclarator' &&
    declaration.init &&
    declaration.parent.type === 'VariableDeclaration' &&
    declaration.parent.kind === 'const'
  ) {
    if (declaration.id.type === 'Identifier' && !isFunction(unwrap(declaration.init))) {
      return resolveBinding(context, declaration.init, seen);
    }
    if (declaration.id.type === 'ObjectPattern') {
      const object = resolveBinding(context, declaration.init, seen);
      const property = declaration.id.properties.find(
        (entry) => entry.type === 'Property' && entry.value.type === 'Identifier' && entry.value.name === node.name,
      );
      if (object?.namespace && property?.type === 'Property') {
        const key = property.key;
        const name = key.type === 'Identifier' && !property.computed ? key.name : undefined;
        if (name) return { name, source: object.source };
      }
    }
  }
  return { name: node.name };
}

function ownerFunction(node: ESTree.Node): FunctionNode | undefined {
  let parent = node.parent;
  while (parent) {
    if (isFunction(parent)) return parent;
    parent = parent.parent;
  }
}

function componentName(context: Context, node: FunctionNode): string | undefined {
  const matches = (name: string) => /^[A-Z]/.test(name) && name.endsWith('Plugin');
  if (node.id && matches(node.id.name)) return node.id.name;

  let current: ESTree.Node = node;
  while (current.parent) {
    const parent: ESTree.Node = current.parent;
    if (unwrap(parent) === current) {
      current = parent;
      continue;
    }
    if (parent.type === 'CallExpression' && parent.arguments[0] === current) {
      const binding = resolveBinding(context, parent.callee);
      if (binding?.source === 'react' && ['memo', 'forwardRef'].includes(binding.name)) {
        current = parent;
        continue;
      }
    }
    if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
      if (matches(parent.id.name)) return parent.id.name;
    }
    break;
  }
}

function effectCallback(
  context: Context,
  expression: ESTree.Node,
  seen = new Set<Variable>(),
): FunctionNode | undefined {
  const node = unwrap(expression);
  if (isFunction(node)) return node;
  if (node.type !== 'Identifier') return;
  const variable = findVariable(context, node);
  if (!variable || seen.has(variable)) return;
  seen.add(variable);
  const declaration = variable.defs[0]?.node;
  if (!declaration) return;
  if (isFunction(declaration)) return declaration;
  if (
    declaration.type === 'VariableDeclarator' &&
    declaration.init &&
    declaration.parent.type === 'VariableDeclaration' &&
    declaration.parent.kind === 'const'
  ) {
    return effectCallback(context, declaration.init, seen);
  }
}

/** 반환 구조를 확인합니다. 호출 대상의 실제 반환값과 모든 실행 경로까지 보장하지는 않습니다. */
function canReturnCleanup(expression: ESTree.Node): boolean {
  const node = unwrap(expression);
  if (isFunction(node)) return !node.async && !node.generator;
  if (node.type === 'Identifier') return node.name !== 'undefined';
  if (node.type === 'CallExpression' || node.type === 'MemberExpression') return true;
  if (node.type === 'ConditionalExpression') {
    return canReturnCleanup(node.consequent) || canReturnCleanup(node.alternate);
  }
  if (node.type === 'LogicalExpression') return canReturnCleanup(node.left) || canReturnCleanup(node.right);
  return false;
}

export default defineRule({
  meta: {
    type: 'suggestion',
    docs: { description: 'Plugin의 설치와 정리를 하나의 명시적인 React useEffect로 관리합니다.' },
    schema: [],
    messages: {
      effectCount: '{{name}}은 React useEffect를 정확히 하나 직접 호출해야 합니다. 현재 {{count}}개입니다.',
      otherEffect: '{{hook}} 대신 Plugin의 단일 useEffect에서 설치와 정리를 조율하세요.',
      customHook: '{{hook}} 내부의 effect 수는 확인할 수 없습니다. 공통 처리는 일반 함수로 분리해 호출하세요.',
      topLevel: 'Plugin의 useEffect는 컴포넌트 본문의 최상위 문장으로 호출하세요.',
      cleanup: 'useEffect에서 cleanup을 반환하세요. 설치 함수로 분리했다면 return install(...) 형태로 반환하세요.',
      callback:
        'effect의 설치·정리를 확인할 수 있도록 동기 콜백을 작성하세요. 외부 함수는 콜백에서 호출하고 반환하세요.',
    },
  },
  createOnce(context) {
    let components: Map<FunctionNode, Component>;
    let returns: Map<FunctionNode, ESTree.Node[]>;

    function visitFunction(node: FunctionNode) {
      const name = componentName(context, node);
      if (name) components.set(node, { node, name, effects: [] });
    }

    return {
      before() {
        // Git ignore나 CLI 대상 지정과 무관하게 외부 패키지 구현은 검사하지 않습니다.
        if (context.filename.replaceAll('\\', '/').split('/').includes('node_modules')) return false;
        components = new Map();
        returns = new Map();
      },
      FunctionDeclaration: visitFunction,
      FunctionExpression: visitFunction,
      ArrowFunctionExpression: visitFunction,
      ReturnStatement(node) {
        const owner = ownerFunction(node);
        if (!owner || !node.argument) return;
        const values = returns.get(owner) ?? [];
        values.push(node.argument);
        returns.set(owner, values);
      },
      CallExpression(node) {
        const owner = ownerFunction(node);
        const component = owner && components.get(owner);
        if (!component) return;
        const binding = resolveBinding(context, node.callee);
        if (!binding) return;
        const { name: hook, source } = binding;
        if (source === 'react') {
          if (hook === 'useEffect') {
            component.effects.push(node);
            if (node.parent.type !== 'ExpressionStatement' || node.parent.parent !== component.node.body) {
              context.report({ node, messageId: 'topLevel' });
            }
          } else if (['useLayoutEffect', 'useInsertionEffect', 'useSyncExternalStore'].includes(hook)) {
            context.report({ node, messageId: 'otherEffect', data: { hook } });
          }
        } else if (/^use[A-Z0-9]/.test(hook)) {
          context.report({ node, messageId: 'customHook', data: { hook } });
        }
      },
      'Program:exit'() {
        for (const component of components.values()) {
          if (component.effects.length !== 1) {
            context.report({
              node: component.node,
              messageId: 'effectCount',
              data: { name: component.name, count: component.effects.length },
            });
          }
          for (const effect of component.effects) {
            const argument = effect.arguments[0];
            const callback = argument && effectCallback(context, argument);
            if (!callback || callback.async || callback.generator) {
              context.report({ node: effect, messageId: 'callback' });
              continue;
            }
            const values =
              callback.body && callback.body.type !== 'BlockStatement'
                ? [callback.body]
                : (returns.get(callback) ?? []);
            if (!values.some(canReturnCleanup)) context.report({ node: effect, messageId: 'cleanup' });
          }
        }
      },
    };
  },
});
