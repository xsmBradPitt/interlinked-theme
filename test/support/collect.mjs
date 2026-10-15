// test/support/collect.mjs
export function collectColors(theme) {
  const out = [];
  for (const [k, v] of Object.entries(theme.colors ?? {})) out.push({ path: `colors.${k}`, value: v });
  (theme.tokenColors ?? []).forEach((r, i) => {
    for (const f of ['foreground', 'background']) {
      if (r.settings?.[f] !== undefined) out.push({ path: `tokenColors[${i}].${f}`, value: r.settings[f] });
    }
  });
  for (const [k, v] of Object.entries(theme.semanticTokenColors ?? {})) {
    const value = typeof v === 'string' ? v : v.foreground;
    if (value !== undefined) out.push({ path: `semanticTokenColors.${k}`, value });
  }
  return out;
}

// ['color', 'editor.foreground'] 或 ['token', 'comment']（取第一條 scope 含該字串的規則）
export function resolveRef(theme, [kind, id]) {
  if (kind === 'color') return theme.colors[id];
  const rule = (theme.tokenColors ?? []).find(r => [].concat(r.scope ?? []).includes(id));
  return rule?.settings?.foreground;
}
