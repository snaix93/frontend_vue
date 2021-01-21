const eslintrcBase = require('./.eslintrc');

/**
 * Does a SHALLOW merge with .eslintrc file...
 */
module.exports = {
  ...eslintrcBase, ...{
    extends: [
      'plugin:vue/essential',
      'plugin:vue/recommended',
      // 'airbnb-base',
    ],
    rules: {
      ...eslintrcBase.rules,
      ...{
        'vue/no-unused-components': 1,
        'template-curly-spacing': 0,
      },
    },
  },
};
