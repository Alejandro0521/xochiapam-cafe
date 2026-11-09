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
export function showPurchaseToast(product, grindName, qty, container = (typeof document !== 'undefined' ? document : null)) {
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
 * Initializes the accessible legal modal dialog (<dialog id="legal-dialog">).
 * Handles switching between Aviso de Privacidad and Políticas de Envío,
 * opens to the selected tab when clicking footer triggers,
 * and handles close actions via close buttons or backdrop click.
 * @param {ParentNode} [container=document]
 * @returns {{ open: (tab?: string) => void, close: () => void, switchTab: (tab: string) => void } | null}
 */
export function initLegalDialog(container = (typeof document !== 'undefined' ? document : null)) {
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
export function initApp(container = (typeof document !== 'undefined' ? document : null)) {
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
