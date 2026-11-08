import { test } from 'node:test';
import assert from 'node:assert';
import { Cart } from '../js/cart.js';
import { PRODUCTS } from '../js/catalog.js';
import { CartDrawer, copyOrderToClipboard } from '../js/drawer.js';

test('CartDrawer initializes and renders empty state correctly', () => {
  const mockStorage = { store: {}, getItem() { return null; }, setItem() {} };
  const cart = new Cart(mockStorage);

  const mockDialog = {
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; },
    addEventListener() {},
    removeEventListener() {},
    querySelector(sel) {
      if (sel === '#cart-items-container') return this._itemsContainer;
      if (sel === '#cart-subtotal') return this._subtotalEl;
      if (sel === '#btn-whatsapp-checkout') return this._btnCheckout;
      if (sel === '#btn-copy-order') return this._btnCopy;
      if (sel === '#cart-close-btn') return this._btnClose;
      if (sel === '#customer-name') return this._customerName;
      if (sel === '#customer-city') return this._customerCity;
      if (sel === '#customer-notes') return this._customerNotes;
      return null;
    },
    _itemsContainer: { innerHTML: '', querySelectorAll() { return []; } },
    _subtotalEl: { textContent: '' },
    _btnCheckout: { disabled: false, href: '' },
    _btnCopy: { disabled: false },
    _btnClose: { addEventListener() {} },
    _customerName: { value: '', addEventListener() {} },
    _customerCity: { value: '', addEventListener() {} },
    _customerNotes: { value: '', addEventListener() {} }
  };

  const drawer = new CartDrawer({ cart, dialogEl: mockDialog });
  assert.ok(drawer);
  assert.strictEqual(drawer.isOpen, false);
  assert.ok(mockDialog._itemsContainer.innerHTML.includes('Tu bolsa está vacía'));
  assert.strictEqual(mockDialog._subtotalEl.textContent, '$0 MXN');
  assert.strictEqual(mockDialog._btnCheckout.disabled, true);
});

test('CartDrawer renders items and calculates subtotal when products are added', () => {
  const mockStorage = { store: {}, getItem() { return null; }, setItem() {} };
  const cart = new Cart(mockStorage);
  cart.addItem(PRODUCTS[0], 'grano', 2); // 2x 160 = 320
  cart.addItem(PRODUCTS[1], 'medio', 1); // 1x 290 = 290 -> Total: 610

  const mockDialog = {
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; },
    addEventListener() {},
    removeEventListener() {},
    querySelector(sel) {
      if (sel === '#cart-items-container') return this._itemsContainer;
      if (sel === '#cart-subtotal') return this._subtotalEl;
      if (sel === '#btn-whatsapp-checkout') return this._btnCheckout;
      if (sel === '#btn-copy-order') return this._btnCopy;
      if (sel === '#cart-close-btn') return this._btnClose;
      if (sel === '#customer-name') return this._customerName;
      if (sel === '#customer-city') return this._customerCity;
      if (sel === '#customer-notes') return this._customerNotes;
      return null;
    },
    _itemsContainer: { innerHTML: '', querySelectorAll() { return []; } },
    _subtotalEl: { textContent: '' },
    _btnCheckout: { disabled: false, href: '' },
    _btnCopy: { disabled: false },
    _btnClose: { addEventListener() {} },
    _customerName: { value: 'Carlos', addEventListener() {} },
    _customerCity: { value: 'Puebla', addEventListener() {} },
    _customerNotes: { value: '', addEventListener() {} }
  };

  const drawer = new CartDrawer({ cart, dialogEl: mockDialog });
  assert.strictEqual(mockDialog._subtotalEl.textContent, '$610 MXN');
  assert.strictEqual(mockDialog._btnCheckout.disabled, false);
  assert.ok(mockDialog._itemsContainer.innerHTML.includes('250 g'));
  assert.ok(mockDialog._itemsContainer.innerHTML.includes('500 g'));
  assert.ok(mockDialog._itemsContainer.innerHTML.includes('En Grano Entero'));
  assert.ok(mockDialog._itemsContainer.innerHTML.includes('Molienda Media'));
});

test('copyOrderToClipboard returns text and handles clipboard copy', async () => {
  let copiedText = '';
  const mockClipboard = {
    writeText: async (txt) => {
      copiedText = txt;
    }
  };

  const mockStorage = { store: {}, getItem() { return null; }, setItem() {} };
  const cart = new Cart(mockStorage);
  cart.addItem(PRODUCTS[0], 'fino', 1);

  const res = await copyOrderToClipboard(cart, { name: 'Lucia', city: 'Oaxaca' }, mockClipboard);
  assert.ok(res.success);
  assert.strictEqual(copiedText, res.rawText);
  assert.ok(copiedText.includes('Café Xochiapam Casa 250 g'));
  assert.ok(copiedText.includes('Lucia'));
});
