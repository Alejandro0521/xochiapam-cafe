import { test } from 'node:test';
import assert from 'node:assert';
import { GRIND_OPTIONS, PRODUCTS } from '../js/catalog.js';
import { getGrindOption } from '../js/comparison.js';

test('every grind option has valid idealMethods and tasteProfile', () => {
  GRIND_OPTIONS.forEach(opt => {
    assert.ok(opt.idealMethods.length > 0, `${opt.id} must have ideal methods`);
    assert.ok(opt.tasteProfile.length > 10, `${opt.id} must have detailed taste profile`);
    assert.ok(opt.waterRatio.length > 0, `${opt.id} must have water ratio`);
  });
});

test('products comparison metrics contain 250g and 500g presentations', () => {
  assert.strictEqual(PRODUCTS.length, 2);
  const [p250, p500] = PRODUCTS;
  assert.strictEqual(p250.weightGrams, 250);
  assert.strictEqual(p500.weightGrams, 500);
  assert.ok(p250.servings.includes('16'), '250g has ~16 servings');
  assert.ok(p500.servings.includes('32'), '500g has ~32 servings');
  assert.ok(p500.price < p250.price * 2, '500g offers better value per gram than 2x 250g');
});

test('getGrindOption retrieves correct options and handles fallback', () => {
  assert.strictEqual(getGrindOption('grano').label, 'En Grano Entero');
  assert.strictEqual(getGrindOption('medio').id, 'medio');
  assert.strictEqual(getGrindOption('fino').id, 'fino');
  assert.strictEqual(getGrindOption('unknown').id, 'grano');
});

test('updateGrindPanel updates mock DOM container elements accurately', async () => {
  const { updateGrindPanel } = await import('../js/comparison.js');
  const store = {};
  const mockContainer = {
    ownerDocument: {
      createElement: (tag) => ({ tagName: tag, className: '', textContent: '' })
    },
    querySelector: (sel) => {
      if (!store[sel]) {
        store[sel] = {
          textContent: '',
          innerHTML: '',
          children: [],
          attrs: {},
          appendChild(child) { this.children.push(child); },
          setAttribute(k, v) { this.attrs[k] = v; }
        };
      }
      return store[sel];
    }
  };

  updateGrindPanel('medio', mockContainer);

  assert.ok(store['#grind-title'].textContent.includes('Molienda Media'));
  assert.ok(store['#grind-ratio-text'].textContent.includes('1 g café : 14-16 ml agua'));
  assert.strictEqual(store['#grind-panel'].attrs['aria-labelledby'], 'tab-medio');
  assert.ok(store['#grind-methods'].children.length > 0);
  assert.ok(store['#grind-methods'].children.some(c => c.textContent === 'Prensa Francesa'));
});

