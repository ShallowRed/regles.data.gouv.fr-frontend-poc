import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  vue: true,
}, {
  // French typography needs U+00A0 before ; : ! ? - the templates used &nbsp; before
  // the strings moved to JSON, where an entity would be rendered literally.
  files: ['i18n/locales/*.json'],
  rules: {
    'no-irregular-whitespace': 'off',
  },
}, {
  files: ['**/*.vue'],
  rules: {
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
  },
})
