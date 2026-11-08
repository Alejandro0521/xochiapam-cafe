import { test } from 'node:test';
import assert from 'node:assert';
import { Cart, formatWhatsAppOrder } from '../js/cart.js';
import { PRODUCTS, GRIND_OPTIONS } from '../js/catalog.js';

test('Cart manages items, quantities and totals accurately', () => {
  const mockStorage = {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = v; },
    removeItem(k) { delete this.store[k]; }
  };

  const cart = new Cart(mockStorage);
  assert.strictEqual(cart.getItemCount(), 0);
  assert.strictEqual(cart.getTotal(), 0);

  // Add 1x 250g en grano
  cart.addItem(PRODUCTS[0], 'grano', 1);
  assert.strictEqual(cart.getItemCount(), 1);
  assert.strictEqual(cart.getTotal(), 160);

  // Add 1x 500g molienda media
  cart.addItem(PRODUCTS[1], 'medio', 2);
  assert.strictEqual(cart.getItemCount(), 3);
  assert.strictEqual(cart.getTotal(), 160 + (290 * 2)); // 740

  // Update quantity
  const items = cart.getItems();
  cart.updateQty(items[0].id, 2);
  assert.strictEqual(cart.getTotal(), (160 * 2) + (290 * 2)); // 900

  // Remove item
  cart.removeItem(items[0].id);
  assert.strictEqual(cart.getItems().length, 1);
  assert.strictEqual(cart.getTotal(), 580);
});

test('formatWhatsAppOrder creates structured readable WhatsApp message', () => {
  const mockStorage = { store: {}, getItem() { return null; }, setItem() {} };
  const cart = new Cart(mockStorage);
  cart.addItem(PRODUCTS[0], 'medio', 1);

  const customer = { name: 'Alejandro', city: 'Oaxaca, Centro', notes: 'Por favor entregar por la tarde' };
  const { url, rawText } = formatWhatsAppOrder(cart, customer, '5219510000000');

  assert.ok(url.startsWith('https://wa.me/5219510000000?text='), 'Must point to WhatsApp wa.me');
  assert.ok(rawText.includes('Café Xochiapam Casa 250 g'), 'Must contain product name');
  assert.ok(rawText.includes('Molienda Media'), 'Must contain grind');
  assert.ok(rawText.includes('Alejandro'), 'Must contain customer name');
  assert.ok(rawText.includes('$160 MXN'), 'Must contain total');
});
