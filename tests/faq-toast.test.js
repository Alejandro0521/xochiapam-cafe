import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { showPurchaseToast } from '../js/app.js';

test('index.html contains FAQ section with native exclusive details accordion', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('id="faq"'), 'Must have #faq section');
  assert.ok(html.includes('class="section-faq"'), 'Must have .section-faq class');
  assert.ok(html.includes('<details class="faq-item" name="faq-group"'), 'Must use native exclusive details');
  assert.ok(html.includes('<summary class="faq-summary">'), 'Must have accessible summary');
  assert.ok(html.includes('id="purchase-toast"'), 'Must have purchase toast element');
  assert.ok(html.includes('role="status"'), 'Toast must have role="status"');
});

test('showPurchaseToast updates toast description and displays element', () => {
  const mockDesc = { textContent: '' };
  const mockToast = {
    hidden: true,
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    querySelector(sel) {
      if (sel === '#toast-desc') return mockDesc;
      return null;
    }
  };

  const mockContainer = {
    querySelector(sel) {
      if (sel === '#purchase-toast') return mockToast;
      return null;
    }
  };

  const product = { name: 'Xochiapam 250 g' };
  showPurchaseToast(product, 'Molido Medio', 2, mockContainer);

  assert.strictEqual(mockToast.hidden, false);
  assert.ok(mockToast.classList.contains('is-visible'));
  assert.strictEqual(mockDesc.textContent, '2x Xochiapam 250 g (Molido Medio)');
});
