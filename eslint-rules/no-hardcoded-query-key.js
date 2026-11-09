/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hard-coded query keys in queryKey options; use the queryKeys factory from @/api/queryKeys',
    },
    messages: {
      noHardcodedQueryKey:
        'Use the queryKeys factory from @/api/queryKeys instead of a hard-coded query key array.',
    },
    schema: [],
  },
  create(context) {
    const isQueryKeyProperty = prop =>
      prop.type === 'Property' &&
      !prop.computed &&
      ((prop.key.type === 'Identifier' && prop.key.name === 'queryKey') ||
        (prop.key.type === 'Literal' && prop.key.value === 'queryKey'))

    const startsWithStringLiteral = node => {
      if (node.type !== 'ArrayExpression' || node.elements.length === 0) return false
      const first = node.elements[0]
      if (!first || first.type === 'SpreadElement') return false
      return (
        (first.type === 'Literal' && typeof first.value === 'string') ||
        first.type === 'TemplateLiteral'
      )
    }

    return {
      Property(node) {
        // The factory itself (src/api/queryKeys.ts) is the one place allowed to spell keys out.
        if (context.filename.endsWith('queryKeys.ts')) return
        if (isQueryKeyProperty(node) && startsWithStringLiteral(node.value)) {
          context.report({ node: node.value, messageId: 'noHardcodedQueryKey' })
        }
      },
    }
  },
}
