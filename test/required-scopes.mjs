// test/required-scopes.mjs — 資料。每個 scope 都必須被某條規則覆蓋（前綴比對，與 TextMate 一致）。
// 這份清單是「我們預期會遇到的 scope」；Task 12 目視時發現漏的，先加在這裡（先紅），再補規則。
export const REQUIRED_SCOPES = {
  generic: [
    'comment', 'comment.block.documentation', 'string', 'constant.numeric', 'constant.language.boolean',
    'constant.character.escape', 'string.regexp', 'keyword.control', 'keyword.operator', 'storage.type',
    'storage.modifier', 'entity.name.function', 'entity.name.type', 'entity.name.class',
    'variable.parameter', 'variable.language', 'variable.other.property', 'meta.decorator',
    'punctuation.definition.string', 'invalid',
  ],
};
