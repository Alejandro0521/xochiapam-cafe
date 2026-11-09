/**
 * Xochiapam — Café de cada día (San Pedro Sochiapam, Oaxaca)
 * Zero-dependency browser bundle (works via file:// and http://)
 */
(function () {
  "use strict";

  // --- js/catalog.js ---
const ORIGIN_FACTS = {
  name: 'Xochiapam',
  tagline: 'Tu café de cada día',
  support: 'De Oaxaca a tu taza',
  municipality: 'San Pedro Sochiapam',
  state: 'Oaxaca',
  country: 'México'
};

const PRODUCTS = [
  {
    id: 'xochiapam-250',
    name: 'Café Xochiapam Casa',
    presentation: '250 g',
    weightGrams: 250,
    price: 160,
    tagline: 'Entrada y prueba — Bolsa Crema',
    servings: '~16 tazas',
    badge: 'Bolsa Crema',
    description: 'Para conocer el café o tomar una taza al día siempre recién abierta.',
    image: 'assets/empaque/frontal-250g.svg'
  },
  {
    id: 'xochiapam-500',
    name: 'Café Xochiapam Casa',
    presentation: '500 g',
    weightGrams: 500,
    price: 290,
    tagline: 'Recompra para casa — Bolsa Terracota',
    servings: '~32 tazas',
    badge: 'Bolsa Terracota',
    description: 'Pensado para quien ya lo hizo parte de su cocina o comparte cafetera todas las mañanas.',
    image: 'assets/empaque/frontal-500g.svg'
  }
];

const GRIND_OPTIONS = [
  {
    id: 'grano',
    label: 'En Grano Entero',
    shortDesc: 'Para moler en casa',
    recommendation: 'Ideal si tienes molino en casa y disfrutas moler justo antes de calentar el agua.',
    idealMethods: ['Molino manual o eléctrico', 'Prensa Francesa', 'Filtro o V60', 'Cafetera Moka'],
    tasteProfile: 'Conserva su aroma natural por más tiempo dentro de la alacena y te deja ajustar el grosor a tu gusto.',
    waterRatio: '1 g café : 15 ml agua'
  },
  {
    id: 'medio',
    label: 'Molienda Media',
    shortDesc: 'Cafetera de filtro, prensa o jarra',
    recommendation: 'Textura equilibrada como arena fina, lista para preparar tu café de cada mañana sin complicaciones.',
    idealMethods: ['Cafetera eléctrica de filtro', 'Prensa Francesa', 'Cafetera de goteo / V60', 'Café de olla'],
    tasteProfile: 'Taza limpia, amable y constante todos los días. El punto exacto para la mayoría de cafeteras de casa.',
    waterRatio: '1 g café : 14-16 ml agua'
  },
  {
    id: 'fino',
    label: 'Molienda Fina',
    shortDesc: 'Moka italiana o máquina de presión',
    recommendation: 'Molienda más cerrada y suave al tacto, pensada para cafeteras donde el agua pasa rápido con presión.',
    idealMethods: ['Cafetera Italiana Moka', 'Máquina de espresso casera', 'AeroPress corto'],
    tasteProfile: 'Taza concentrada y con más cuerpo, ideal para tomar corta o acompañar con leche caliente.',
    waterRatio: '1 g café : 10-12 ml agua'
  }
];

  // --- js/cart.js ---
class Cart {
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

function formatWhatsAppOrder(cart, customer = {}, phone = '5219511234567') {
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

  // --- js/comparison.js ---
/**
 * Retrieves a grind option by ID, falling back to the first option ('grano').
 * @param {string} id
 * @returns {object}
 */
function getGrindOption(id) {
  return GRIND_OPTIONS.find(opt => opt.id === id) || GRIND_OPTIONS[0];
}

const PRACTICAL_SPOONS = {
  grano: '2 cucharadas soperas de grano por taza (15 g)',
  medio: '1 ½ cucharadas soperas colmadas por taza (14 g)',
  fino: '1 cucharada sopera al ras para cafetera Moka (10 g)'
};

/**
 * Updates the grind description panel in the DOM.
 * @param {string} grindId
 * @param {ParentNode} [container=document]
 */
function updateGrindPanel(grindId, container = document) {
  if (!container) return;

  const option = getGrindOption(grindId);

  const panel = container.querySelector('#grind-panel');
  if (panel && typeof panel.setAttribute === 'function') {
    panel.setAttribute('aria-labelledby', `tab-${option.id}`);
  }

  const badgeEl = container.querySelector('#grind-badge');
  if (badgeEl) {
    badgeEl.textContent = option.shortDesc;
  }

  const titleEl = container.querySelector('#grind-title');
  if (titleEl) {
    titleEl.textContent = option.label;
  }

  const recEl = container.querySelector('#grind-recommendation');
  if (recEl) {
    recEl.textContent = option.recommendation;
  }

  const tasteEl = container.querySelector('#grind-taste');
  if (tasteEl) {
    tasteEl.textContent = option.tasteProfile;
  }

  const ratioEl = container.querySelector('#grind-ratio-text');
  if (ratioEl) {
    ratioEl.textContent = option.waterRatio;
  }

  const spoonsEl = container.querySelector('#grind-spoons-text');
  if (spoonsEl) {
    spoonsEl.textContent = PRACTICAL_SPOONS[option.id] || PRACTICAL_SPOONS.medio;
  }

  const photoStage = container.querySelector('#grind-photo-stage');
  if (photoStage && typeof photoStage.setAttribute === 'function') {
    photoStage.setAttribute('data-active-grind', option.id);
  }

  const methodsContainer = container.querySelector('#grind-methods');
  if (methodsContainer) {
    methodsContainer.innerHTML = '';
    if ( methodsContainer.children && Array.isArray(methodsContainer.children) ) {
      methodsContainer.children.length = 0;
    }

    const doc = container.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (doc && typeof doc.createElement === 'function') {
      option.idealMethods.forEach(method => {
        const li = doc.createElement('li');
        li.className = 'method-tag';
        li.textContent = method;
        methodsContainer.appendChild(li);
      });
    }
  }
}

/**
 * Sets the active grind tab and updates ARIA attributes and panel content.
 * @param {HTMLElement} tab
 * @param {HTMLElement[]} tabs
 * @param {ParentNode} [container=document]
 */
function setActiveTab(tab, tabs, container = document) {
  if (!tab || !Array.isArray(tabs)) return;

  tabs.forEach(t => {
    const isSelected = t === tab;
    t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    t.setAttribute('tabindex', isSelected ? '0' : '-1');
    if (t.classList) {
      t.classList.toggle('is-active', isSelected);
    }
  });

  const grindId = tab.dataset ? tab.dataset.grindId : null;
  if (grindId) {
    updateGrindPanel(grindId, container);
  }
}

/**
 * Initializes tab switching, keyboard navigation, and the household rhythm calculator.
 * @param {ParentNode} [container=document]
 */
function initComparison(container = document) {
  if (!container) return;

  const tablist = container.querySelector('[role="tablist"]');
  if (tablist) {
    if (!tablist.dataset || tablist.dataset.initialized !== 'true') {
      if (tablist.dataset) tablist.dataset.initialized = 'true';

      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
          setActiveTab(tab, tabs, container);
        });

        tab.addEventListener('keydown', (e) => {
          let nextIndex = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextIndex = (index + 1) % tabs.length;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (e.key === 'Home') {
            nextIndex = 0;
          } else if (e.key === 'End') {
            nextIndex = tabs.length - 1;
          }

          if (nextIndex !== null) {
            e.preventDefault();
            tabs[nextIndex].focus();
            setActiveTab(tabs[nextIndex], tabs, container);
          }
        });
      });
    }
  }

  // Calculadora Cotidiana de Ritmo en Casa
  const matcher = container.querySelector('.household-matcher');
  if (matcher && (!matcher.dataset || matcher.dataset.initialized !== 'true')) {
    if (matcher.dataset) matcher.dataset.initialized = 'true';

    const matcherPills = Array.from(matcher.querySelectorAll('.matcher-pill[data-ritmo]'));
    const verdictEl = container.querySelector('#matcher-verdict-text');
    const world250 = container.querySelector('#world-250');
    const world500 = container.querySelector('#world-500');

    const RITMO_DATA = {
      individual: {
        match: '250',
        text: 'Te recomendamos la bolsa de 250 g (Crema): te durará ~16 días con café recién abierto.'
      },
      pareja: {
        match: '500',
        text: 'Te recomendamos la bolsa de 500 g (Terracota): rinde ~14 días para dos tazas diarias y ahorras $30 MXN.'
      },
      familia: {
        match: '500',
        text: 'Tu mesa pide la bolsa de 500 g (Terracota): ideal para jarra familiar o cafetera de filtro todas las mañanas.'
      }
    };

    matcherPills.forEach(pill => {
      pill.addEventListener('click', () => {
        matcherPills.forEach(p => {
          p.classList.remove('is-active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('is-active');
        pill.setAttribute('aria-pressed', 'true');

        const key = pill.dataset.ritmo;
        const info = RITMO_DATA[key] || RITMO_DATA.individual;

        if (verdictEl) {
          verdictEl.textContent = info.text;
        }
        if (world250 && world500) {
          world250.classList.toggle('is-recommended-match', info.match === '250');
          world500.classList.toggle('is-recommended-match', info.match === '500');
        }
      });
    });
  }
}

  // --- js/drawer.js ---
/**
 * Copies the formatted WhatsApp order text to the clipboard.
 * Supports modern navigator.clipboard and legacy textarea fallback.
 * @param {import('./cart.js').Cart} cart
 * @param {object} customer
 * @param {object} [clipboardObj=navigator.clipboard]
 * @returns {Promise<{ success: boolean, rawText: string }>}
 */
async function copyOrderToClipboard(cart, customer = {}, clipboardObj = (typeof navigator !== 'undefined' ? navigator.clipboard : null)) {
  const { rawText } = formatWhatsAppOrder(cart, customer);
  if (!rawText) {
    return { success: false, rawText: '' };
  }

  try {
    if (clipboardObj && typeof clipboardObj.writeText === 'function') {
      await clipboardObj.writeText(rawText);
      return { success: true, rawText };
    }

    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = rawText;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand ? document.execCommand('copy') : false;
      document.body.removeChild(textarea);
      return { success: successful, rawText };
    }
  } catch (err) {
    console.warn('Could not copy to clipboard:', err);
  }

  return { success: false, rawText };
}

class CartDrawer {
  /**
   * @param {object} options
   * @param {import('./cart.js').Cart} options.cart
   * @param {HTMLElement} options.dialogEl
   * @param {HTMLElement} [options.toastEl]
   * @param {string} [options.phone='5219511234567']
   */
  constructor({ cart, dialogEl, toastEl = null, phone = '5219511234567' }) {
    this.cart = cart;
    this.dialog = dialogEl;
    this.toastEl = toastEl;
    this.phone = phone;
    this.isOpen = false;
    this.toastTimeout = null;
    this.closeTimeout = null;

    this.customerData = {
      name: '',
      city: '',
      notes: ''
    };

    this.initEvents();
    this.render();

    if (this.cart && typeof this.cart.subscribe === 'function') {
      this.cart.subscribe(() => this.render());
    }
  }

  getCustomerData() {
    if (!this.dialog) return this.customerData;

    const nameInput = this.dialog.querySelector('#customer-name');
    const cityInput = this.dialog.querySelector('#customer-city');
    const notesInput = this.dialog.querySelector('#customer-notes');

    return {
      name: nameInput ? nameInput.value.trim() : this.customerData.name,
      city: cityInput ? cityInput.value.trim() : this.customerData.city,
      notes: notesInput ? notesInput.value.trim() : this.customerData.notes
    };
  }

  open() {
    if (!this.dialog) return;

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    if (this.dialog.open) {
      this.isOpen = true;
      this.dialog.classList.add('is-open');
      return;
    }

    if (this.isOpen) return;

    this.isOpen = true;
    if (typeof this.dialog.showModal === 'function') {
      this.dialog.showModal();
    } else {
      this.dialog.open = true;
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        this.dialog.classList.add('is-open');
      });
    } else {
      this.dialog.classList.add('is-open');
    }

    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    if (!this.dialog || !this.isOpen) return;

    this.isOpen = false;
    this.dialog.classList.remove('is-open');

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }

    const handleClose = () => {
      this.closeTimeout = null;
      if (!this.isOpen && this.dialog.open && typeof this.dialog.close === 'function') {
        this.dialog.close();
      } else if (!this.isOpen) {
        this.dialog.open = false;
      }
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = '';
      }
    };

    // Wait for the slide-out transition to complete (300ms)
    this.closeTimeout = setTimeout(handleClose, 280);
  }

  showToast(message, duration = 3000) {
    const toast = this.toastEl || (this.dialog ? this.dialog.querySelector('#cart-toast') : null);
    if (!toast) return;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    toast.textContent = message;
    toast.removeAttribute('hidden');
    toast.classList.add('is-visible');

    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => {
        if (!toast.classList.contains('is-visible')) {
          toast.setAttribute('hidden', '');
        }
      }, 250);
    }, duration);
  }

  initEvents() {
    if (!this.dialog) return;

    // Close button
    const closeBtn = this.dialog.querySelector('#cart-close-btn');
    if (closeBtn && typeof closeBtn.addEventListener === 'function') {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Light dismiss (clicking on native dialog backdrop)
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog) {
        if (typeof this.dialog.getBoundingClientRect === 'function') {
          const rect = this.dialog.getBoundingClientRect();
          const isInside = (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
          );
          if (!isInside) {
            this.close();
          }
        } else {
          this.close();
        }
      }
    });

    // Native Esc key on <dialog> triggers 'cancel'
    this.dialog.addEventListener('cancel', (event) => {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      this.close();
    });

    // Keyboard navigation
    this.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        this.close();
      }
    });

    // Delegated actions for item list (quantity steppers, remove, browse)
    const itemsContainer = this.dialog.querySelector('#cart-items-container');
    if (itemsContainer && typeof itemsContainer.addEventListener === 'function') {
      itemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (!target) return;

        // Minus button
        const minusBtn = target.closest ? target.closest('.stepper-minus') : null;
        if (minusBtn && this.cart) {
          const itemId = minusBtn.dataset.id;
          const item = this.cart.getItems().find(i => i.id === itemId);
          if (item) {
            this.cart.updateQty(itemId, item.quantity - 1);
          }
          return;
        }

        // Plus button
        const plusBtn = target.closest ? target.closest('.stepper-plus') : null;
        if (plusBtn && this.cart) {
          const itemId = plusBtn.dataset.id;
          const item = this.cart.getItems().find(i => i.id === itemId);
          if (item) {
            this.cart.updateQty(itemId, item.quantity + 1);
          }
          return;
        }

        // Remove button
        const removeBtn = target.closest ? target.closest('.btn-remove-item') : null;
        if (removeBtn && this.cart) {
          const itemId = removeBtn.dataset.id;
          this.cart.removeItem(itemId);
          return;
        }

        // Browse store button from empty state
        const browseBtn = target.closest ? target.closest('#btn-browse-tienda') : null;
        if (browseBtn) {
          this.close();
          if (typeof document !== 'undefined') {
            const tienda = document.getElementById('tienda');
            if (tienda && typeof tienda.scrollIntoView === 'function') {
              tienda.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    }

    // Checkout via WhatsApp button
    const checkoutBtn = this.dialog.querySelector('#btn-whatsapp-checkout');
    if (checkoutBtn && typeof checkoutBtn.addEventListener === 'function') {
      checkoutBtn.addEventListener('click', (e) => {
        if (this.cart.getItemCount() === 0) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          this.showToast('Tu bolsa está vacía. Selecciona un café en la tienda.');
          return;
        }

        const customer = this.getCustomerData();
        const { url } = formatWhatsAppOrder(this.cart, customer, this.phone);
        if (url && typeof window !== 'undefined') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    }

    // Fallback copy order button
    const copyBtn = this.dialog.querySelector('#btn-copy-order');
    if (copyBtn && typeof copyBtn.addEventListener === 'function') {
      copyBtn.addEventListener('click', async () => {
        if (this.cart.getItemCount() === 0) {
          this.showToast('Tu bolsa está vacía.');
          return;
        }

        const customer = this.getCustomerData();
        const res = await copyOrderToClipboard(this.cart, customer);
        if (res.success) {
          this.showToast('¡Datos del pedido copiados al portapapeles!');
        } else {
          this.showToast('No se pudo copiar automáticamente. Intenta de nuevo.');
        }
      });
    }
  }

  render() {
    if (!this.dialog || !this.cart) return;

    const itemsContainer = this.dialog.querySelector('#cart-items-container');
    const subtotalEl = this.dialog.querySelector('#cart-subtotal');
    const checkoutBtn = this.dialog.querySelector('#btn-whatsapp-checkout');
    const copyBtn = this.dialog.querySelector('#btn-copy-order');

    const items = this.cart.getItems();
    const total = this.cart.getTotal();
    const count = this.cart.getItemCount();

    if (subtotalEl) {
      subtotalEl.textContent = `$${total} MXN`;
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = count === 0;
    }

    if (copyBtn) {
      copyBtn.disabled = count === 0;
    }

    if (!itemsContainer) return;

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <img src="assets/logos/simbolo-color.svg" alt="" class="empty-brand-symbol" width="52" height="52" aria-hidden="true">
          <p class="empty-title">Tu bolsa está vacía</p>
          <p class="empty-desc">Elige una bolsa de 250 g o 500 g y el punto de molienda para tu cafetera.</p>
          <button type="button" class="btn-secondary btn-sm" id="btn-browse-tienda">Elegir café</button>
        </div>
      `;
      return;
    }

    const itemsHtml = items.map(item => `
      <div class="cart-item" data-item-id="${item.id}" role="listitem">
        <img src="${item.image}" alt="${item.name} ${item.presentation}" class="cart-item-img" width="56" height="56" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-title-row">
            <strong class="cart-item-title">${item.presentation}</strong>
            <button type="button" class="btn-remove-item" data-id="${item.id}" aria-label="Eliminar ${item.presentation} (${item.grindLabel})">&times;</button>
          </div>
          <span class="cart-item-grind">${item.grindLabel}</span>
          <div class="cart-item-row-bottom">
            <div class="cart-item-stepper" role="group" aria-label="Cantidad para ${item.presentation}">
              <button type="button" class="stepper-btn stepper-minus" data-id="${item.id}" aria-label="Disminuir una unidad">-</button>
              <span class="stepper-qty" aria-live="polite">${item.quantity}</span>
              <button type="button" class="stepper-btn stepper-plus" data-id="${item.id}" aria-label="Aumentar una unidad">+</button>
            </div>
            <span class="cart-item-price">$${item.price * item.quantity} <small>MXN</small></span>
          </div>
        </div>
      </div>
    `).join('');

    itemsContainer.innerHTML = `
      <div class="cart-items-list" role="list">
        ${itemsHtml}
      </div>
    `;
  }
}

/**
 * Convenience initializer for CartDrawer.
 * @param {import('./cart.js').Cart} cart
 * @param {HTMLElement} [dialogEl=document.getElementById('cart-drawer')]
 * @param {object} [options={}]
 * @returns {CartDrawer}
 */
function initDrawer(cart, dialogEl = (typeof document !== 'undefined' ? document.getElementById('cart-drawer') : null), options = {}) {
  return new CartDrawer({ cart, dialogEl, ...options });
}

  // --- js/app.js ---
/**
 * Updates navigation badge counter with active count.
 * @param {HTMLElement} badgeEl
 * @param {number} count
 */
function updateCartBadge(badgeEl, count) {
  if (!badgeEl) return;
  badgeEl.textContent = String(count);
  if (badgeEl.classList && typeof badgeEl.classList.toggle === 'function') {
    badgeEl.classList.toggle('has-items', count > 0);
  }
}

/**
 * Initializes boutique product cards with grind selectors, steppers, and add-to-cart actions.
 * @param {Cart} cart
 * @param {CartDrawer} drawer
 * @param {ParentNode} [container=document]
 */
function setupBoutique(cart, drawer, container = (typeof document !== 'undefined' ? document : null)) {
  if (!container || !cart) return;

  const cards = container.querySelectorAll('.boutique-card');
  cards.forEach(card => {
    const qtyInput = card.querySelector('.qty-input');
    const stepBtns = card.querySelectorAll ? (card.querySelectorAll('.btn-qty-step').length ? card.querySelectorAll('.btn-qty-step') : card.querySelectorAll('.stepper-btn')) : [];
    const addBtn = card.querySelector('.btn-add-to-cart') || card.querySelector('.btn-add-cart');

    // Stepper buttons
    if (stepBtns && typeof stepBtns.forEach === 'function') {
      stepBtns.forEach(btn => {
        if (btn && typeof btn.addEventListener === 'function') {
          btn.addEventListener('click', () => {
            if (!qtyInput) return;
            const currentVal = parseInt(qtyInput.value, 10) || 1;
            const action = btn.dataset.action;
            if (action === 'increase' || action === 'increment') {
              qtyInput.value = Math.min(99, currentVal + 1);
            } else if (action === 'decrease' || action === 'decrement') {
              qtyInput.value = Math.max(1, currentVal - 1);
            }
          });
        }
      });
    }

    // Brewer quick buttons helper inside boutique card
    const brewerBtns = card.querySelectorAll ? card.querySelectorAll('.btn-brewer[data-grind]') : [];
    if (brewerBtns && typeof brewerBtns.forEach === 'function') {
      brewerBtns.forEach(bBtn => {
        if (bBtn && typeof bBtn.addEventListener === 'function') {
          bBtn.addEventListener('click', () => {
            const targetGrind = bBtn.dataset.grind;
            const targetRadio = card.querySelector(`input[type="radio"][value="${targetGrind}"]`);
            if (targetRadio) {
              targetRadio.checked = true;
              brewerBtns.forEach(b => b.classList.remove('is-active'));
              bBtn.classList.add('is-active');
            }
          });
        }
      });
    }

    // Input sanitization
    if (qtyInput && typeof qtyInput.addEventListener === 'function') {
      qtyInput.addEventListener('change', () => {
        const val = parseInt(qtyInput.value, 10);
        if (isNaN(val) || val < 1) {
          qtyInput.value = 1;
        } else if (val > 99) {
          qtyInput.value = 99;
        }
      });
    }

    // Add to cart button
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const productId = (addBtn.dataset && (addBtn.dataset.productId || addBtn.dataset.addToCart)) || (card.dataset ? card.dataset.product : null);
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const checkedRadio = card.querySelector('input[type="radio"]:checked');
        const grindId = checkedRadio ? checkedRadio.value : 'medio';
        const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

        cart.addItem(product, grindId, qty);

        const grindLabels = {
          medio: 'Molido Medio',
          fino: 'Molido Fino',
          grano: 'En Grano'
        };
        showPurchaseToast(product, grindLabels[grindId] || 'Molido Medio', qty, container);

        // Feedback animation on button with cached original text
        if (!addBtn.dataset.originalText) {
          addBtn.dataset.originalText = addBtn.innerHTML || addBtn.textContent || '';
        }
        addBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>¡Agregado!</span>
        `;
        clearTimeout(addBtn._feedbackTimer);
        addBtn._feedbackTimer = setTimeout(() => {
          if (addBtn.dataset.originalText) {
            addBtn.innerHTML = addBtn.dataset.originalText;
            delete addBtn.dataset.originalText;
          }
        }, 1200);

        // Open the cart drawer
        if (drawer && typeof drawer.open === 'function') {
          drawer.open();
        }
      });
    }
  });

  // Link comparison section action buttons to boutique cards
  const comparisonBtns = container.querySelectorAll('.btn-comparison[data-weight]');
  comparisonBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const weight = btn.dataset.weight;
      const targetCard = container.querySelector(`.boutique-card[data-product="xochiapam-${weight}"]`);
      if (targetCard) {
        if (typeof targetCard.scrollIntoView === 'function') {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        targetCard.classList.add('is-highlighted');
        setTimeout(() => {
          targetCard.classList.remove('is-highlighted');
        }, 1600);
      }
    });
  });
}

/**
 * Shows the purchase toast with product and grind information.
 * @param {object} product
 * @param {string} grindName
 * @param {number} qty
 * @param {ParentNode} [container=document]
 */
function showPurchaseToast(product, grindName, qty, container = (typeof document !== 'undefined' ? document : null)) {
  if (!container || !product || typeof container.querySelector !== 'function') return;
  const toast = container.querySelector('#purchase-toast');
  if (!toast) return;

  const descEl = toast.querySelector('#toast-desc');
  if (descEl) {
    const qtyPrefix = qty > 1 ? `${qty}x ` : '';
    descEl.textContent = `${qtyPrefix}${product.name} (${grindName})`;
  }

  toast.hidden = false;
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => toast.classList.add('is-visible'));
  } else {
    toast.classList.add('is-visible');
  }

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.hidden = true;
    }, 320);
  }, 4000);
}

/**
 * Initializes the 3D flippable stationery card in the ensemble section.
 * @param {ParentNode} [container=document]
 */
function setupFlipCard(container = (typeof document !== 'undefined' ? document : null)) {
  if (!container) return;

  const card = container.querySelector('.ensemble-flip-card');
  const btn = container.querySelector('#btn-flip-card');

  const toggleFlip = () => {
    if (!card) return;
    const isFlipped = card.classList.toggle('is-flipped');
    if (btn) {
      btn.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
      const textSpan = btn.querySelector('span');
      if (textSpan) {
        textSpan.textContent = isFlipped ? 'Ver frente de la tarjeta' : 'Ver reverso de la tarjeta';
      }
    }
  };

  if (card && typeof card.addEventListener === 'function') {
    card.addEventListener('click', toggleFlip);
  }
  if (btn && typeof btn.addEventListener === 'function') {
    btn.addEventListener('click', (e) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      toggleFlip();
    });
  }
}

/**
 * Initializes the accessible legal modal dialog (<dialog id="legal-dialog">).
 * Handles switching between Aviso de Privacidad and Políticas de Envío,
 * opens to the selected tab when clicking footer triggers,
 * and handles close actions via close buttons or backdrop click.
 * @param {ParentNode} [container=document]
 * @returns {{ open: (tab?: string) => void, close: () => void, switchTab: (tab: string) => void } | null}
 */
function initLegalDialog(container = (typeof document !== 'undefined' ? document : null)) {
  if (!container || typeof container.querySelector !== 'function') return null;

  const dialog = container.querySelector('#legal-dialog');
  if (!dialog) return null;

  const closeBtn = dialog.querySelector('#legal-close-btn');
  const footerCloseBtn = dialog.querySelector('#legal-close-btn-footer');
  const tabBtns = dialog.querySelectorAll ? dialog.querySelectorAll('.legal-tab-btn') : [];
  const tabPanels = dialog.querySelectorAll ? dialog.querySelectorAll('.legal-tab-panel') : [];
  const triggers = container.querySelectorAll ? container.querySelectorAll('[data-legal-tab]') : [];

  const switchTab = (tabName) => {
    tabBtns.forEach(btn => {
      const isTarget = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    tabPanels.forEach(panel => {
      const isTarget = panel.dataset.tabPanel === tabName;
      panel.hidden = !isTarget;
      panel.classList.toggle('is-active', isTarget);
    });
  };

  const openDialog = (tabName = 'privacidad') => {
    switchTab(tabName);
    if (typeof dialog.showModal === 'function') {
      try {
        if (!dialog.open) {
          dialog.showModal();
        }
      } catch (err) {
        dialog.setAttribute('open', '');
      }
    } else {
      dialog.setAttribute('open', '');
    }
    dialog.classList.add('is-open');
  };

  const closeDialog = () => {
    dialog.classList.remove('is-open');
    if (typeof dialog.close === 'function') {
      try {
        if (dialog.open) {
          dialog.close();
        }
      } catch (err) {
        dialog.removeAttribute('open');
      }
    } else {
      dialog.removeAttribute('open');
    }
  };

  if (triggers && typeof triggers.forEach === 'function') {
    triggers.forEach(trigger => {
      if (trigger && typeof trigger.addEventListener === 'function') {
        trigger.addEventListener('click', () => {
          const tab = trigger.dataset.legalTab || 'privacidad';
          openDialog(tab);
        });
      }
    });
  }

  if (tabBtns && typeof tabBtns.forEach === 'function') {
    tabBtns.forEach(btn => {
      if (btn && typeof btn.addEventListener === 'function') {
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          if (tab) switchTab(tab);
        });
      }
    });
  }

  if (closeBtn && typeof closeBtn.addEventListener === 'function') {
    closeBtn.addEventListener('click', closeDialog);
  }

  if (footerCloseBtn && typeof footerCloseBtn.addEventListener === 'function') {
    footerCloseBtn.addEventListener('click', closeDialog);
  }

  if (typeof dialog.addEventListener === 'function') {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        closeDialog();
      }
    });
  }

  return { open: openDialog, close: closeDialog, switchTab };
}

/**
 * Main application initializer.
 * @param {ParentNode} [container=document]
 * @returns {{ cart: Cart, drawer: CartDrawer, legal: ReturnType<typeof initLegalDialog> }}
 */
function initApp(container = (typeof document !== 'undefined' ? document : null)) {
  if (!container) return { cart: null, drawer: null, legal: null };

  const cart = new Cart();
  const drawerEl = container.querySelector('#cart-drawer');
  const drawer = initDrawer(cart, drawerEl);

  // Wire header cart button trigger
  const openBtn = container.querySelector('#cart-open-btn');
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (drawer) drawer.open();
    });
  }

  // Subscribe cart counter badge
  const counterEl = container.querySelector('#cart-counter');
  const onCartChange = () => {
    updateCartBadge(counterEl, cart.getItemCount());
  };
  cart.subscribe(onCartChange);
  onCartChange();

  // Setup Boutique
  setupBoutique(cart, drawer, container);

  // Initialize Comparison Guide
  initComparison(container);

  // Setup 3D Flip Card in Mesa section
  setupFlipCard(container);

  // Initialize Legal & Privacy Dialog
  const legal = initLegalDialog(container);

  // Wire purchase toast action buttons
  const toastEl = container.querySelector('#purchase-toast');
  if (toastEl) {
    const viewBtn = toastEl.querySelector('#toast-view-btn');
    const closeBtn = toastEl.querySelector('#toast-close-btn');

    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        toastEl.classList.remove('is-visible');
        toastEl.hidden = true;
        if (drawer) drawer.open();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toastEl.classList.remove('is-visible');
        toastEl.hidden = true;
      });
    }
  }

  // Set current year in footer
  const yearEl = container.querySelector('#current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  return { cart, drawer, legal };
}

// Auto-run in browser environment
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp());
  } else {
    initApp();
  }
}

})();
