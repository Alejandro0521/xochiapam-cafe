import { formatWhatsAppOrder } from './cart.js';

/**
 * Copies the formatted WhatsApp order text to the clipboard.
 * Supports modern navigator.clipboard and legacy textarea fallback.
 * @param {import('./cart.js').Cart} cart
 * @param {object} customer
 * @param {object} [clipboardObj=navigator.clipboard]
 * @returns {Promise<{ success: boolean, rawText: string }>}
 */
export async function copyOrderToClipboard(cart, customer = {}, clipboardObj = (typeof navigator !== 'undefined' ? navigator.clipboard : null)) {
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

export class CartDrawer {
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
    if (!this.dialog || this.isOpen) return;

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

    const handleClose = () => {
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
    setTimeout(handleClose, 280);
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
          <div class="empty-icon" aria-hidden="true">☕</div>
          <p class="empty-title">Tu bolsa está vacía</p>
          <p class="empty-desc">Descubre la frescura y calidez de San Pedro Sochiapam, Oaxaca. Elige tu presentación para comenzar tu pedido.</p>
          <button type="button" class="btn-secondary btn-sm" id="btn-browse-tienda">Explorar la Tienda</button>
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
export function initDrawer(cart, dialogEl = (typeof document !== 'undefined' ? document.getElementById('cart-drawer') : null), options = {}) {
  return new CartDrawer({ cart, dialogEl, ...options });
}
