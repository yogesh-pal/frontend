module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {
    'no-unused-expressions': ['error', {
      allowTernary: true
    }],
    'no-mixed-spaces-and-tabs': 0,
    'no-tabs': 0,
    'no-param-reassign': 0,
    'consistent-return': 'off',
    'comma-dangle': 'off',
    'no-prototype-builtins': 'off',
    'react/prop-types': 'off',
    'import/prefer-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [1, {
      extensions: ['.js']
    }],
    'jsx-quotes': ['error', 'prefer-single'],
    'react/jsx-props-no-spreading': 'off',
    'linebreak-style': 0,
    // 'no-tabs': 0,
    'no-console': 'off',
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'react/function-component-definition': [2, {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function'
    }]
  }
};
