module.exports = {
  processors: [],
  plugins: ['stylelint-order'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules'
  ],
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less'
    }
  ],
  rules: {
    'selector-class-pattern': null,
    'string-quotes': ['single', { severity: 'warning' }],
    'at-rule-empty-line-before': null,
    'at-rule-no-unknown': null,
    'at-rule-name-case': 'lower',
    'length-zero-no-unit': true,
    'shorthand-property-no-redundant-values': true,
    'number-leading-zero': [true, { severity: 'warning' }],
    'declaration-block-no-duplicate-properties': null,
    'no-descending-specificity': null,
    'selector-max-id': 3,
    'max-nesting-depth': null,
    'indentation': [2, {
      severity: 'warning'
    }],

    // Vue 2 deep selectors (::v-deep / /deep/ / >>>) — 非 CSS 标准
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep', 'deep', 'v-global', 'v-slotted'] }],
    // Vue scoped selectors
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global', 'slotted'] }],
    // 允许单行声明块（紧凑写法）
    'declaration-block-single-line-max-declarations': null,
    // 关闭长行限制
    'max-line-length': null,
    // 允许重复选择器（ scoped + global 混用 ）
    'no-duplicate-selectors': null,
    // 空行规则放宽
    'rule-empty-line-before': null,
    'declaration-block-semicolon-newline-after': null,
    // 闭合括号格式
    'block-closing-brace-newline-before': null,
    'block-opening-brace-newline-after': null,
    'block-no-empty': null,
    // keyframes
    'keyframes-name-pattern': null,
    // id 选择器命名
    'selector-id-pattern': null,
    // 数字格式
    'number-no-trailing-zeros': null,
    // shorthand 覆盖
    'declaration-block-no-shorthand-property-overrides': null,
    // 简写
    'declaration-block-no-redundant-longhand-properties': null,
    // 空 source
    'no-empty-source': null,
    // 未知单位/函数/属性（兼容 ant-design）
    'unit-no-unknown': [true, { ignoreUnits: ['rpx', 'upx', 'vh', 'vw', 'vmin', 'vmax', 'x'] }],
    'function-no-unknown': null,
    'property-no-unknown': null,
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'float',
      'width',
      'height',
      'max-width',
      'max-height',
      'min-width',
      'min-height',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'margin-collapse',
      'margin-top-collapse',
      'margin-right-collapse',
      'margin-bottom-collapse',
      'margin-left-collapse',
      'overflow',
      'overflow-x',
      'overflow-y',
      'clip',
      'clear',
      'font',
      'font-family',
      'font-size',
      'font-smoothing',
      'osx-font-smoothing',
      'font-style',
      'font-weight',
      'line-height',
      'letter-spacing',
      'word-spacing',
      'color',
      'text-align',
      'text-decoration',
      'text-indent',
      'text-overflow',
      'text-rendering',
      'text-size-adjust',
      'text-shadow',
      'text-transform',
      'word-break',
      'word-wrap',
      'white-space',
      'vertical-align',
      'list-style',
      'list-style-type',
      'list-style-position',
      'list-style-image',
      'pointer-events',
      'cursor',
      'background',
      'background-color',
      'border',
      'border-radius',
      'content',
      'outline',
      'outline-offset',
      'opacity',
      'filter',
      'visibility',
      'size',
      'transform'
    ]
  }
}
