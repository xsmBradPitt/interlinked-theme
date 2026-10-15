// src/theme/syntax-languages.mjs
const rule = (name, scope, foreground, fontStyle) => ({
  name,
  scope,
  settings: fontStyle ? { foreground, fontStyle } : { foreground },
});

// 只放 Task 10 的通用規則涵蓋不到的語言專屬 scope。
// C# / Java / Kotlin 目前完全由通用規則覆蓋；Task 12 目視後有落差才補在這裡。
export function languageRules(p) {
  return [
    // HTML
    rule('html.tag-punctuation', ['punctuation.definition.tag.begin.html', 'punctuation.definition.tag.end.html'],
      p.fgMuted),

    // CSS
    rule('css.selector.class-id', ['entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css',
      'entity.other.attribute-name.pseudo-class.css', 'entity.other.attribute-name.pseudo-element.css'],
      p.springGreen),
    rule('css.property', ['support.type.property-name.css'], p.aquamarine),
    rule('css.value', ['support.constant.property-value.css', 'meta.property-value.css'], p.fg),
    rule('css.unit', ['keyword.other.unit.css', 'constant.numeric.css'], p.mint),
    rule('css.colour', ['constant.other.color.rgb-value.hex.css', 'support.constant.color.css'], p.amber),

    // SQL
    rule('sql.function', ['support.function.aggregate.sql', 'support.function.sql'], p.springGreen),

    // Bash
    rule('shell.variable', ['variable.other.normal.shell', 'punctuation.definition.variable.shell',
      'variable.other.special.shell', 'variable.other.positional.shell'], p.mint),
    rule('shell.command', ['entity.name.command.shell', 'support.function.builtin.shell'], p.springGreen),

    // JSON：鍵與值可區分
    rule('json.key', ['support.type.property-name.json'], p.aquamarine),

    // YAML
    rule('yaml.key', ['entity.name.tag.yaml'], p.aquamarine),
    rule('yaml.anchor', ['entity.name.type.anchor.yaml', 'punctuation.definition.anchor.yaml',
      'variable.other.alias.yaml'], p.amber),

    // Markdown
    rule('markdown.quote', ['markup.quote'], p.fgMuted),
  ];
}
