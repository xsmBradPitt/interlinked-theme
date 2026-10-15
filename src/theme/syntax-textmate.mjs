// src/theme/syntax-textmate.mjs
const rule = (name, scope, foreground, fontStyle) => ({
  name,
  scope,
  settings: fontStyle ? { foreground, fontStyle } : { foreground },
});

export function textmateRules(p) {
  return [
    // 註解（D2：不用 Reference 的 #05F283）
    rule('comment', ['comment', 'punctuation.definition.comment'], p.fgMuted),
    rule('comment.doc', ['comment.block.documentation', 'comment.block.javadoc', 'string.quoted.docstring'], p.teal),

    // 關鍵字與運算子
    rule('keyword', ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier'], p.teal),
    rule('operator', ['keyword.operator'], p.teal),
    rule('preproc', ['meta.preprocessor', 'punctuation.definition.directive'], p.fgMuted),

    // 函式與型別（D6：weight ≥600 → bold）
    rule('function', ['entity.name.function', 'support.function', 'meta.function-call.generic', 'variable.function'],
      p.springGreen, 'bold'),
    rule('constructor', ['entity.name.function.constructor'], p.teal),
    rule('type', ['entity.name.type', 'entity.name.class', 'entity.name.namespace',
      'entity.other.inherited-class', 'support.type', 'support.class'], p.aquamarine),
    rule('enum', ['entity.name.type.enum', 'variable.other.enummember'], p.mint),

    // 變數
    rule('variable', ['variable', 'variable.other', 'variable.parameter', 'entity.name.variable'], p.fg),
    rule('variable.special', ['variable.language'], p.mint, 'italic'),
    rule('property', ['variable.other.property', 'variable.other.object.property', 'support.type.property-name',
      'meta.object-literal.key', 'entity.name.variable.property', 'entity.name.variable.field'],
      p.aquamarine, 'bold'),
    rule('label', ['entity.name.label'], p.fg),

    // 常數與字面值
    rule('constant', ['constant', 'constant.language', 'support.constant', 'variable.other.constant'], p.mint),
    rule('boolean', ['constant.language.boolean'], p.teal),
    rule('number', ['constant.numeric'], p.mint),
    rule('string', ['string'], p.peach),
    rule('string.escape', ['constant.character.escape'], p.teal),
    rule('string.regex', ['string.regexp', 'constant.regexp'], p.gold),
    rule('string.special', ['string.other', 'punctuation.definition.template-expression',
      'punctuation.section.embedded'], p.teal),
    rule('string.special.symbol', ['constant.other.symbol'], p.mint),

    // 標點
    rule('punctuation', ['punctuation'], p.teal),
    rule('punctuation.bracket', ['meta.brace', 'punctuation.section', 'punctuation.definition.block',
      'punctuation.definition.parameters', 'punctuation.definition.arguments'], p.fg),
    rule('punctuation.delimiter', ['punctuation.separator', 'punctuation.terminator', 'punctuation.accessor'], p.teal),
    rule('punctuation.list_marker', ['punctuation.definition.list'], p.aquamarine),

    // 標記與註記
    rule('tag', ['entity.name.tag', 'punctuation.definition.tag'], p.teal),
    rule('attribute', ['entity.other.attribute-name'], p.aquamarine),            // D5
    rule('annotation', ['meta.decorator', 'storage.type.annotation', 'punctuation.definition.annotation',
      'entity.name.function.decorator'], p.teal),
    rule('title', ['markup.heading', 'entity.name.section'], p.mint, 'bold'),
    rule('emphasis', ['markup.italic'], p.peach, 'italic'),
    rule('emphasis.strong', ['markup.bold'], p.amber, 'bold'),
    rule('link_text', ['string.other.link.title', 'markup.underline.link.image'], p.teal),
    rule('link_uri', ['markup.underline.link', 'string.other.link'], p.aquamarine),
    rule('text.literal', ['markup.inline.raw', 'markup.fenced_code', 'markup.raw'], p.springGreen),
    rule('embedded', ['meta.embedded', 'source.embedded'], p.fg),
    rule('invalid', ['invalid'], p.coral),
  ];
}
