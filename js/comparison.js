import { GRIND_OPTIONS, PRODUCTS } from './catalog.js';

/**
 * Retrieves grind option by id, with fallback to first available option.
 * @param {string} id
 * @returns {object}
 */
export function getGrindOption(id) {
  return GRIND_OPTIONS.find(opt => opt.id === id) || GRIND_OPTIONS[0];
}

/**
 * Updates DOM nodes with selected grind data.
 * @param {string} grindId
 * @param {ParentNode} [container=document]
 */
export function updateGrindPanel(grindId, container = document) {
  const option = getGrindOption(grindId);
  if (!option || !container) return;

  const titleEl = container.querySelector('#grind-title');
  const recoEl = container.querySelector('#grind-recommendation');
  const ratioTextEl = container.querySelector('#grind-ratio-text');
  const methodsEl = container.querySelector('#grind-methods');
  const tasteEl = container.querySelector('#grind-taste');
  const granulometryEl = container.querySelector('#grind-granulometry');
  const panel = container.querySelector('#grind-panel');

  if (titleEl) {
    titleEl.textContent = `${option.label} — ${option.shortDesc}`;
  }

  if (recoEl) {
    recoEl.textContent = option.recommendation;
  }

  if (ratioTextEl) {
    ratioTextEl.textContent = `Ratio: ${option.waterRatio}`;
  }

  if (granulometryEl) {
    granulometryEl.textContent = `Granulometría: ${option.label}`;
  }

  if (tasteEl) {
    tasteEl.textContent = option.tasteProfile;
  }

  if (methodsEl) {
    methodsEl.innerHTML = '';
    const doc = container.ownerDocument || (typeof document !== 'undefined' ? document : null);
    option.idealMethods.forEach(method => {
      if (doc && doc.createElement) {
        const tag = doc.createElement('span');
        tag.className = 'method-tag';
        tag.textContent = method;
        methodsEl.appendChild(tag);
      }
    });
  }

  if (panel) {
    panel.setAttribute('aria-labelledby', `tab-${option.id}`);
  }
}

/**
 * Activates the given tab and synchronizes aria attributes and panel content.
 * @param {HTMLElement} tab
 * @param {HTMLElement[]} tabs
 * @param {ParentNode} [container=document]
 */
export function setActiveTab(tab, tabs, container = document) {
  tabs.forEach(t => {
    const isSelected = t === tab;
    t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    t.setAttribute('tabindex', isSelected ? '0' : '-1');
    t.classList.toggle('is-active', isSelected);
  });

  const grindId = tab.dataset.grindId;
  updateGrindPanel(grindId, container);
}

/**
 * Initializes tab switching and accessible keyboard navigation.
 * @param {ParentNode} [container=document]
 */
export function initComparison(container = document) {
  if (!container) return;

  const tablist = container.querySelector('[role="tablist"]');
  if (!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) return;

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

// Auto-initialize when executing in the browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initComparison());
  } else {
    initComparison();
  }
}
