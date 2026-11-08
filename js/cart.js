import { GRIND_OPTIONS } from './catalog.js';

export class Cart {
  constructor(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    this.storage = storage;
    this.storageKey = 'xochiapam_cart_v1';
    this.items = this.load();
    this.listeners = [];
  }

  load() {
    if (!this.storage) return [];
    try {
      const data = this.storage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  save() {
    if (this.storage) {
      try {
        this.storage.setItem(this.storageKey, JSON.stringify(this.items));
      } catch (err) {
        console.warn('Could not save cart to storage', err);
      }
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  addItem(product, grindId = 'medio', quantity = 1) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const grindObj = GRIND_OPTIONS.find(g => g.id === grindId) || GRIND_OPTIONS[1];
    const itemId = `${product.id}_${grindId}`;

    const existingIndex = this.items.findIndex(item => item.id === itemId);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += qty;
    } else {
      this.items.push({
        id: itemId,
        productId: product.id,
        name: product.name,
        presentation: product.presentation,
        grindId: grindObj.id,
        grindLabel: grindObj.label,
        price: product.price,
        image: product.image,
        quantity: qty
      });
    }
    this.save();
  }

  updateQty(itemId, newQty) {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      this.removeItem(itemId);
      return;
    }
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = qty;
      this.save();
    }
  }

  removeItem(itemId) {
    this.items = this.items.filter(i => i.id !== itemId);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  getItems() {
    return [...this.items];
  }

  getItemCount() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotal() {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
}

export function formatWhatsAppOrder(cart, customer = {}, phone = '5219511234567') {
  const items = cart.getItems();
  const total = cart.getTotal();

  if (items.length === 0) {
    return { url: '', rawText: '' };
  }

  let text = `*Nuevo Pedido — Café Xochiapam Casa*\n`;
  text += `──────────────────────────\n`;

  items.forEach(item => {
    text += `- ${item.quantity}x ${item.name} ${item.presentation} (${item.grindLabel}) — $${item.price * item.quantity} MXN\n`;
  });

  text += `──────────────────────────\n`;
  text += `*Total estimado:* $${total} MXN\n\n`;

  if (customer.name && customer.name.trim()) {
    text += `*Cliente:* ${customer.name.trim()}\n`;
  }
  if (customer.city && customer.city.trim()) {
    text += `*Entrega:* ${customer.city.trim()}\n`;
  }
  if (customer.notes && customer.notes.trim()) {
    text += `*Notas:* ${customer.notes.trim()}\n`;
  }

  text += `*Origen:* Pedido web oficial Xochiapam Casa`;

  const encoded = encodeURIComponent(text);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return { url, rawText: text };
}
