import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('tokens.css contains official brand colors and font-face declarations', () => {
  const css = fs.readFileSync('css/tokens.css', 'utf8');
  assert.ok(css.includes('--color-terracota: #B54325;'), 'Must have terracota #B54325');
  assert.ok(css.includes('--color-crema: #F3E3CA;'), 'Must have crema #F3E3CA');
  assert.ok(css.includes('--color-cacao: #4A2113;'), 'Must have cacao #4A2113');
  assert.ok(css.includes('--color-marfil: #FFFAF3;'), 'Must have marfil #FFFAF3');
  assert.ok(css.includes('font-family: "Fredoka";'), 'Must declare Fredoka font-face');
  assert.ok(css.includes('font-family: "Nunito";'), 'Must declare Nunito font-face');
});
