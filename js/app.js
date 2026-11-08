import { Cart } from './cart.js';
import { PRODUCTS } from './catalog.js';
import { CartDrawer, initDrawer } from './drawer.js';
import { initComparison } from './comparison.js';

/**
 * Updates navigation badge counter with active count.
 * @param {HTMLElement} badgeEl
 * @param {number} count
 */
export function updateCartBadge(badgeEl, count) {
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
export function setupBoutique(cart, drawer, container = (typeof document !== 'undefined' ? document : null)) {
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
 * Initializes the 3D flippable stationery card in the ensemble section.
 * @param {ParentNode} [container=document]
 */
export function setupFlipCard(container = (typeof document !== 'undefined' ? document : null)) {
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
 * Main application initializer.
 * @param {ParentNode} [container=document]
 * @returns {{ cart: Cart, drawer: CartDrawer }}
 */
export function initApp(container = (typeof document !== 'undefined' ? document : null)) {
  if (!container) return { cart: null, drawer: null };

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

  // Set current year in footer
  const yearEl = container.querySelector('#current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  return { cart, drawer };
}

// Auto-run in browser environment
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp());
  } else {
    initApp();
  }
}
