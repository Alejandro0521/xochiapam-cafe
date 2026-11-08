import { GRIND_OPTIONS } from './catalog.js';

/**
 * Retrieves a grind option by ID, falling back to the first option ('grano').
 * @param {string} id
 * @returns {object}
 */
export function getGrindOption(id) {
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
export function updateGrindPanel(grindId, container = document) {
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
export function setActiveTab(tab, tabs, container = document) {
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
export function initComparison(container = document) {
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
