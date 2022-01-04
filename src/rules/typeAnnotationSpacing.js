Object.defineProperty(exports, '__esModule', {
  value: true,
});

const utilities = require('../utilities');

const schema = [
  {
    enum: [
      'always',
      'never',
    ],
    type: 'string',
  },
];

const create = (context) => {
  const sourceCode = context.getSourceCode();
  const never = (context.options[0] || 'never') === 'never';
  return {
    TypeParameterInstantiation (node) {
      const isNullable = node.params[0].type === 'NullableTypeAnnotation';
      const [
        opener,
        firstInnerToken,
        secondInnerToken,
      ] = sourceCode.getFirstTokens(node, 3);
      const [
        lastInnerToken,
        closer,
      ] = sourceCode.getLastTokens(node, 2);

      const spacesBefore = firstInnerToken.range[0] - opener.range[1];
      const spaceBetweenNullToken = secondInnerToken.range[0] - firstInnerToken.range[1];
      const spacesAfter = closer.range[0] - lastInnerToken.range[1];

      if (never) {
        if (spacesBefore) {
          const whiteSpaceBefore = sourceCode.text[opener.range[1]];

          if (whiteSpaceBefore !== '\n' && whiteSpaceBefore !== '\r') {
            context.report({
              fix: utilities.spacingFixers.stripSpacesAfter(opener, spacesBefore),
              message: 'There must be no space at start of type annotations',
              node,
            });
          }
        }

        if (isNullable && spaceBetweenNullToken) {
          context.report({
            fix: utilities.spacingFixers.stripSpacesAfter(firstInnerToken, spaceBetweenNullToken),
            message: 'There must be no space at start of type annotations',
            node,
          });
        }

        if (spacesAfter) {
          const whiteSpaceAfter = sourceCode.text[closer.range[0] - 1];

          if (whiteSpaceAfter !== '\n' && whiteSpaceAfter !== '\r') {
            context.report({
              data: {},
              fix: utilities.spacingFixers.stripSpacesAfter(lastInnerToken, spacesAfter),
              message: 'There must be no space at end of type annotations',
              node,
            });
          }
        }
      }

      const parent = node.parent;
      if (parent.type !== 'CallExpression') {
        return;
      }

      const spaceBefore = node.range[0] - parent.callee.range[1];

      const hasArguments = parent.arguments.length > 0;
      const argumentOffset = hasArguments ? parent.arguments[0].range[0] - 1 : parent.range[1] - 2;

      const spaceAfter = argumentOffset - node.range[1];

      if (never) {
        if (spaceBefore) {
          context.report({
            fix: utilities.spacingFixers.stripSpacesBefore(node, spaceBefore),
            message: 'There must be no space before type annotation bracket',
            node,
          });
        }

        if (spaceAfter) {
          context.report({
            fix: utilities.spacingFixers.stripSpacesAfter(node, spaceBefore),
            message: 'There must be no space after type annotation bracket',
            node,
          });
        }
      }
    },
  };
};

const meta = {
  fixable: 'whitespace',
};
exports.default = {
  create,
  meta,
  schema,
};
module.exports = exports.default;
