module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: 'koa',
  rules: {
    "no-tabs": 0,
    "indent": ["error", 'tab'],
    'arrow-parens': [2, 'as-needed'],
    eqeqeq: 0,
    'no-return-assign': 0, // fails for arrow functions
    'no-var': 2,
    semi: [0, 'always'],
    'space-before-function-paren': [2, 'always'],
    yoda: 0,
    'arrow-spacing': 2,
    'dot-location': [2, 'property'],
    'prefer-arrow-callback': 2,
    "prefer-promise-reject-errors": 0
  },
  globals: {}
}
