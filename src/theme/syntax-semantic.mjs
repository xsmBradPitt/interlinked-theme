// src/theme/syntax-semantic.mjs
export function semanticColors(p) {
  return {
    namespace: p.aquamarine,
    type: p.aquamarine,
    class: p.aquamarine,
    struct: p.aquamarine,
    interface: p.aquamarine,
    typeParameter: p.aquamarine,
    enum: p.mint,
    enumMember: p.mint,
    function: { foreground: p.springGreen, bold: true },
    method: { foreground: p.springGreen, bold: true },
    property: { foreground: p.aquamarine, bold: true },
    variable: p.fg,
    parameter: p.fg,
    decorator: p.teal,
    macro: p.teal,
    // spec 故事 53：readonly / 預設函式庫符號「微妙地」區分，對應 Reference 的 variable.special
    'variable.readonly': p.mint,
    'variable.defaultLibrary': { foreground: p.mint, italic: true },
  };
}
