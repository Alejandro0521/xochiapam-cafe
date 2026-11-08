import { test } from 'node:test';
import assert from 'node:assert';
import { PRODUCTS, GRIND_OPTIONS, ORIGIN_FACTS } from '../js/catalog.js';

test('catalog contains the 250g and 500g official presentations', () => {
  assert.strictEqual(PRODUCTS.length, 2);
  const p250 = PRODUCTS.find(p => p.id === 'xochiapam-250');
  const p500 = PRODUCTS.find(p => p.id === 'xochiapam-500');
  assert.ok(p250, '250g product must exist');
  assert.ok(p500, '500g product must exist');
  assert.strictEqual(p250.price, 160);
  assert.strictEqual(p500.price, 290);
});

test('grind options include grano entero, molienda media and molienda fina', () => {
  assert.strictEqual(GRIND_OPTIONS.length, 3);
  const ids = GRIND_OPTIONS.map(g => g.id);
  assert.deepStrictEqual(ids, ['grano', 'medio', 'fino']);
});

test('origin facts contain San Pedro Sochiapam, Oaxaca data', () => {
  assert.strictEqual(ORIGIN_FACTS.municipality, 'San Pedro Sochiapam');
  assert.strictEqual(ORIGIN_FACTS.state, 'Oaxaca');
  assert.ok(ORIGIN_FACTS.altitude.includes('1,400'));
});
