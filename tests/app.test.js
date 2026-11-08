import { test } from 'node:test';
import assert from 'node:assert';
import { Cart } from '../js/cart.js';
import { PRODUCTS } from '../js/catalog.js';
import { setupBoutique, updateCartBadge } from '../js/app.js';

test('setupBoutique attaches listeners and adds items to cart on button click', () => {
  const mockStorage = { store: {}, getItem() { return null; }, setItem() {} };
  const cart = new Cart(mockStorage);
  let drawerOpened = false;
  const mockDrawer = {
    open: () => { drawerOpened = true; }
  };

  const listeners = {};
  const mockBtn = {
    dataset: { productId: 'xochiapam-250' },
    addEventListener(evt, fn) { listeners[evt] = fn; },
    textContent: 'Agregar a mi pedido'
  };

  const mockRadio = { value: 'fino' };
  const mockInput = { value: '3' };

  const mockCard = {
    querySelector(sel) {
      if (sel === 'input[type="radio"]:checked') return mockRadio;
      if (sel === '.qty-input') return mockInput;
      if (sel === '.btn-add-to-cart') return mockBtn;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.btn-qty-step') return [];
      return [];
    }
  };

  const mockContainer = {
    querySelectorAll(sel) {
      if (sel === '.boutique-card') return [mockCard];
      return [];
    }
  };

  setupBoutique(cart, mockDrawer, mockContainer);

  assert.ok(listeners['click'], 'Add to cart button should have click listener');
  // Trigger click
  listeners['click']({ preventDefault() {} });

  assert.strictEqual(cart.getItemCount(), 3);
  const item = cart.getItems()[0];
  assert.strictEqual(item.productId, 'xochiapam-250');
  assert.strictEqual(item.grindId, 'fino');
  assert.strictEqual(item.quantity, 3);
  assert.strictEqual(drawerOpened, true, 'Drawer should open when product is added');
});

test('updateCartBadge updates counter element text and classes', () => {
  const badgeEl = {
    textContent: '0',
    classList: {
      classes: new Set(),
      toggle(c, v) { if (v) this.classes.add(c); else this.classes.delete(c); }
    }
  };

  updateCartBadge(badgeEl, 0);
  assert.strictEqual(badgeEl.textContent, '0');
  assert.strictEqual(badgeEl.classList.classes.has('has-items'), false);

  updateCartBadge(badgeEl, 4);
  assert.strictEqual(badgeEl.textContent, '4');
  assert.strictEqual(badgeEl.classList.classes.has('has-items'), true);
});
