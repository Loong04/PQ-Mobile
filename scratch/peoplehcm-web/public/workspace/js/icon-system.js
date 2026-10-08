(function installPeopleHcmIcons(global) {
  'use strict';

  if (!global || !global.document || global.PeopleHcmIcons) return;

  const document = global.document;
  const descriptors = new Map();
  const defaultStyle = 'fa-solid';

  function normalizeKey(value) {
    return String(value || '').replace(/[\uFE0E\uFE0F]|\p{Emoji_Modifier}/gu, '');
  }

  function register(glyph, icon, style, color) {
    descriptors.set(normalizeKey(glyph), {
      icon,
      style: style || defaultStyle,
      color: color || ''
    });
  }

  [
    ['\u{1F319}', 'fa-moon'],
    ['\u2600', 'fa-sun'],
    ['\u2728', 'fa-wand-magic-sparkles'],
    ['\u{1F48E}', 'fa-gem'],
    ['\u{1F464}', 'fa-user'],
    ['\u{1F465}', 'fa-users'],
    ['\u{1F468}', 'fa-user'],
    ['\u{1F469}', 'fa-user'],
    ['\u{1F467}', 'fa-child'],
    ['\u{1F466}', 'fa-child'],
    ['\u{1F468}\u200D\u{1F4BC}', 'fa-user-tie'],
    ['\u{1F454}', 'fa-user-tie'],
    ['\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', 'fa-people-roof'],
    ['\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}', 'fa-people-roof'],
    ['\u{1F393}', 'fa-graduation-cap'],
    ['\u{1F4B3}', 'fa-credit-card'],
    ['\u{1F4CD}', 'fa-location-dot'],
    ['\u{1F3E2}', 'fa-building'],
    ['\u{1F3E0}', 'fa-house'],
    ['\u{1F4C5}', 'fa-calendar-days'],
    ['\u{1F4C6}', 'fa-calendar-days'],
    ['\u{1F5D3}', 'fa-calendar-days'],
    ['\u{1F334}', 'fa-umbrella-beach'],
    ['\u{1F3D6}', 'fa-umbrella-beach'],
    ['\u{1F4CA}', 'fa-chart-column'],
    ['\u{1F4C8}', 'fa-chart-line'],
    ['\u{1F4C9}', 'fa-chart-line'],
    ['\u23F0', 'fa-clock'],
    ['\u23F1', 'fa-stopwatch'],
    ['\u{1F4DC}', 'fa-scroll'],
    ['\u{1F4C4}', 'fa-file-lines'],
    ['\u{1F9FE}', 'fa-receipt'],
    ['\u{1F4DD}', 'fa-pen-to-square'],
    ['\u{1F4E9}', 'fa-envelope'],
    ['\u{1F4E5}', 'fa-download'],
    ['\u{1F4ED}', 'fa-inbox'],
    ['\u{1F4CE}', 'fa-paperclip'],
    ['\u{1F4F7}', 'fa-camera'],
    ['\u{1F4CB}', 'fa-clipboard-list'],
    ['\u{1F4D1}', 'fa-file-lines'],
    ['\u{1F4D6}', 'fa-book-open'],
    ['\u{1F4E2}', 'fa-bullhorn'],
    ['\u{1F4E3}', 'fa-bullhorn'],
    ['\u{1F3C6}', 'fa-trophy'],
    ['\u{1F381}', 'fa-gift'],
    ['\u{1F4B0}', 'fa-money-bill-wave'],
    ['\u{1F4B5}', 'fa-money-bill'],
    ['\u{1F697}', 'fa-car'],
    ['\u2708', 'fa-plane'],
    ['\u{1F4BB}', 'fa-laptop'],
    ['\u{1F4F1}', 'fa-mobile-screen-button'],
    ['\u{1F512}', 'fa-lock'],
    ['\u{1F510}', 'fa-lock'],
    ['\u{1F4DE}', 'fa-phone'],
    ['\u{1F324}', 'fa-cloud-sun'],
    ['\u{1F441}', 'fa-eye'],
    ['\u{1F50D}', 'fa-magnifying-glass'],
    ['\u{1F50E}', 'fa-magnifying-glass'],
    ['\u{1F517}', 'fa-link'],
    ['\u{1F504}', 'fa-arrows-rotate'],
    ['\u{1F500}', 'fa-shuffle'],
    ['\u{1F3AF}', 'fa-bullseye'],
    ['\u{1F4AC}', 'fa-comment-dots'],
    ['\u{1F91D}', 'fa-handshake'],
    ['\u{1F3E5}', 'fa-hospital'],
    ['\u{1F3ED}', 'fa-industry'],
    ['\u{1F48A}', 'fa-pills'],
    ['\u{1F6CF}', 'fa-bed'],
    ['\u{1F37C}', 'fa-baby'],
    ['\u{1F6A8}', 'fa-triangle-exclamation'],
    ['\u26A0', 'fa-triangle-exclamation'],
    ['\u23F3', 'fa-hourglass-half'],
    ['\u2705', 'fa-circle-check'],
    ['\u2611', 'fa-square-check', 'fa-regular'],
    ['\u274C', 'fa-circle-xmark'],
    ['\u274E', 'fa-circle-xmark'],
    ['\u2795', 'fa-plus'],
    ['\u270F', 'fa-pen'],
    ['\u{1F5D1}', 'fa-trash-can'],
    ['\u2B50', 'fa-star'],
    ['\u2605', 'fa-star'],
    ['\u2606', 'fa-star', 'fa-regular']
  ].forEach(entry => register(entry[0], entry[1], entry[2], entry[3]));

  [
    ['\u2139', 'fa-circle-info'],
    ['\u0B83', 'fa-filter'],
    ['\u{1F44D}', 'fa-thumbs-up'],
    ['\u{1F44E}', 'fa-thumbs-down'],
    ['\u{1F534}', 'fa-circle', defaultStyle, '#ef4444'],
    ['\u{1F7E0}', 'fa-circle', defaultStyle, '#f97316'],
    ['\u{1F7E1}', 'fa-circle', defaultStyle, '#eab308'],
    ['\u{1F7E2}', 'fa-circle', defaultStyle, '#22c55e'],
    ['\u{1F535}', 'fa-circle', defaultStyle, '#3b82f6'],
    ['\u{1F7E3}', 'fa-circle', defaultStyle, '#a855f7'],
    ['\u{1F7E4}', 'fa-circle', defaultStyle, '#92400e'],
    ['\u26AB', 'fa-circle', defaultStyle, '#111827'],
    ['\u26AA', 'fa-circle', defaultStyle, '#f8fafc'],
    ['\u{1F54C}', 'fa-mosque'],
    ['\u{1F310}', 'fa-globe'],
    ['\u{1F39B}', 'fa-sliders'],
    ['\u2630', 'fa-bars'],
    ['\u260E', 'fa-phone'],
    ['\u2709', 'fa-envelope'],
    ['\u2699', 'fa-gear'],
    ['\u{1F511}', 'fa-key'],
    ['\u{1F514}', 'fa-bell'],
    ['\u2764', 'fa-heart'],
    ['\u{1F525}', 'fa-fire'],
    ['\u{1F680}', 'fa-rocket'],
    ['\u{1F527}', 'fa-wrench'],
    ['\u{1F4C1}', 'fa-folder'],
    ['\u{1F4C2}', 'fa-folder-open'],
    ['\u{1F389}', 'fa-champagne-glasses'],
    ['\u{1F4BE}', 'fa-floppy-disk'],
    ['\u{1F4BC}', 'fa-briefcase'],
    ['\u{1F382}', 'fa-cake-candles'],
    ['\u{1F6E1}', 'fa-shield-halved'],
    ['\u26A1', 'fa-bolt'],
    ['\u{1F4DA}', 'fa-book-open'],
    ['\u{1F6AB}', 'fa-ban'],
    ['\u{1F4CC}', 'fa-thumbtack'],
    ['\u{1F48D}', 'fa-ring'],
    ['\u{1F56F}', 'fa-fire'],
    ['\u{1F396}', 'fa-medal'],
    ['\u{1F37D}', 'fa-utensils'],
    ['\u{1F371}', 'fa-box'],
    ['\u270D', 'fa-signature'],
    ['\u{1F453}', 'fa-glasses'],
    ['\u{1F967}', 'fa-chart-pie'],
    ['\u2753', 'fa-circle-question'],
    ['\u2757', 'fa-circle-exclamation'],
    ['\u2713', 'fa-check'],
    ['\u2714', 'fa-check'],
    ['\u2715', 'fa-xmark'],
    ['\u2716', 'fa-xmark'],
    ['\u2717', 'fa-xmark'],
    ['\u2718', 'fa-xmark'],
    ['\u00D7', 'fa-xmark'],
    ['\u2039', 'fa-chevron-left'],
    ['\u203A', 'fa-chevron-right'],
    ['\u2190', 'fa-arrow-left'],
    ['\u2191', 'fa-arrow-up'],
    ['\u2192', 'fa-arrow-right'],
    ['\u2193', 'fa-arrow-down'],
    ['\u2197', 'fa-arrow-up-right-from-square'],
    ['\u21A9', 'fa-reply'],
    ['\u21BB', 'fa-rotate-right'],
    ['\u2794', 'fa-arrow-right'],
    ['\u27A1', 'fa-arrow-right'],
    ['\u25B2', 'fa-caret-up'],
    ['\u25B3', 'fa-caret-up'],
    ['\u25BC', 'fa-caret-down'],
    ['\u25BD', 'fa-caret-down'],
    ['\u25C0', 'fa-caret-left'],
    ['\u25B6', 'fa-caret-right']
  ].forEach(entry => register(entry[0], entry[1], entry[2], entry[3]));

  for (let codePoint = 0x1F550; codePoint <= 0x1F567; codePoint += 1) {
    register(String.fromCodePoint(codePoint), 'fa-clock');
  }

  const extendedPictographic = /\p{Extended_Pictographic}/u;
  const genericArrow = /[\u2190-\u21FF]/u;
  const skippedSelector = [
    'script',
    'style',
    'svg',
    'canvas',
    'template',
    'noscript',
    'textarea',
    'pre',
    'code',
    '[data-icon-system-ignore]',
    '[data-chart]',
    '.chart',
    '.chart-container',
    '.chart-wrapper',
    '.chart-canvas',
    '.apexcharts-canvas',
    '.highcharts-container',
    '[data-logo]',
    '.logo',
    '.logo-icon',
    '.app-logo',
    '.brand-logo',
    '.company-logo'
  ].join(',');
  const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;
  const decoratedSelectSelector = [
    '.cal-filter-select',
    'html[data-peoplehcm-fa-selects] select'
  ].join(',');
  const iconClassAliases = new Map([
    ['fa-grid-2', 'fa-table-cells-large']
  ]);

  function splitGraphemes(value) {
    if (!value) return [];
    if (segmenter) return Array.from(segmenter.segment(value), item => item.segment);
    return Array.from(value);
  }

  function descriptorFor(value) {
    const key = normalizeKey(value);
    if (descriptors.has(key)) return descriptors.get(key);
    if (genericArrow.test(key)) return { icon: 'fa-arrow-right', style: defaultStyle };
    if (extendedPictographic.test(key)) return { icon: 'fa-icons', style: defaultStyle };
    return null;
  }

  function createIconFromDescriptor(descriptor, options) {
    const settings = options || {};
    const icon = document.createElement('i');
    icon.classList.add(descriptor.style, descriptor.icon, 'peoplehcm-normalized-icon');
    if (descriptor.color) {
      icon.style.color = descriptor.color;
      icon.dataset.peoplehcmSemanticColor = descriptor.color;
    }
    if (settings.className) {
      String(settings.className).split(/\s+/).filter(Boolean).forEach(name => icon.classList.add(name));
    }
    if (settings.label) {
      icon.setAttribute('role', 'img');
      icon.setAttribute('aria-label', settings.label);
    } else {
      icon.setAttribute('aria-hidden', 'true');
    }
    return icon;
  }

  function createIcon(value, options) {
    const requested = String(value || '');
    const descriptor = requested.indexOf('fa-') === 0
      ? { icon: requested, style: options && options.style ? options.style : defaultStyle }
      : descriptorFor(requested) || { icon: 'fa-icons', style: defaultStyle };
    return createIconFromDescriptor(descriptor, options);
  }

  function ensureSupportStyle() {
    if (document.getElementById('peoplehcm-icon-system-style')) return;
    const style = document.createElement('style');
    style.id = 'peoplehcm-icon-system-style';
    style.textContent = [
      '.peoplehcm-replaced-before::before{content:none!important}',
      '.peoplehcm-replaced-after::after{content:none!important}',
      '.peoplehcm-pseudo-icon{pointer-events:none}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }

  function isSkippedElement(element) {
    return Boolean(element && element.closest && element.closest(skippedSelector));
  }

  function stripDecorativeGlyphs(value) {
    const original = String(value || '');
    let changed = false;
    const clean = splitGraphemes(original).map(segment => {
      if (!descriptorFor(segment)) return segment;
      changed = true;
      return '';
    }).join('');
    if (!changed) return original;
    return clean.replace(/\s{2,}/g, ' ').trim();
  }

  function normalizeOption(option) {
    if (!option || isSkippedElement(option)) return;
    const clean = stripDecorativeGlyphs(option.textContent);
    if (clean !== option.textContent) option.textContent = clean;
  }

  function normalizePlaceholder(element) {
    if (!element || isSkippedElement(element) || !element.hasAttribute('placeholder')) return;
    const original = element.getAttribute('placeholder') || '';
    const clean = stripDecorativeGlyphs(original);
    if (clean !== original) element.setAttribute('placeholder', clean);
  }

  function decorateSelect(select) {
    if (
      !select
      || !select.matches(decoratedSelectSelector)
      || select.parentElement?.classList.contains('peoplehcm-select-wrap')
    ) {
      return;
    }
    const hasChevron = element => Boolean(
      element
      && (
        element.matches?.('i.fa-chevron-down, .fa-chevron-down')
        || element.querySelector?.('i.fa-chevron-down, .fa-chevron-down')
      )
    );
    const parent = select.parentElement;
    const parentHasSingleSelectChevron = parent
      && parent.querySelectorAll(':scope > select').length === 1
      && Array.from(parent.children).some(child => child !== select && hasChevron(child));
    if (
      hasChevron(select.previousElementSibling)
      || hasChevron(select.nextElementSibling)
      || parentHasSingleSelectChevron
    ) {
      return;
    }
    const wrapper = document.createElement('span');
    wrapper.className = 'peoplehcm-select-wrap';
    select.before(wrapper);
    wrapper.appendChild(select);
    wrapper.appendChild(createIcon('fa-chevron-down', {
      className: 'peoplehcm-select-chevron'
    }));
  }

  function normalizeFontAwesomeElement(icon) {
    if (!icon || icon.tagName !== 'I') return;
    if (icon.classList.contains('fas')) {
      icon.classList.remove('fas');
      icon.classList.add('fa-solid');
    }
    if (icon.classList.contains('far')) {
      icon.classList.remove('far');
      icon.classList.add('fa-regular');
    }
    if (icon.classList.contains('fab')) {
      icon.classList.remove('fab');
      icon.classList.add('fa-brands');
    }
    iconClassAliases.forEach((replacement, legacy) => {
      if (icon.classList.contains(legacy)) {
        icon.classList.remove(legacy);
        icon.classList.add(replacement);
      }
    });
  }

  function pseudoDescriptor(element, pseudo) {
    const content = global.getComputedStyle(element, pseudo).content;
    if (!content || content === 'none' || content === 'normal') return null;
    let value = content;
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    const meaningful = splitGraphemes(value)
      .filter(segment => segment.trim())
      .map(segment => descriptorFor(segment));
    return meaningful.length === 1 && meaningful[0] ? meaningful[0] : null;
  }

  function normalizePseudoElement(element) {
    if (!element || isSkippedElement(element)) return;
    [
      ['::before', 'peoplehcm-replaced-before', 'peoplehcm-pseudo-before'],
      ['::after', 'peoplehcm-replaced-after', 'peoplehcm-pseudo-after']
    ].forEach(item => {
      const descriptor = pseudoDescriptor(element, item[0]);
      if (!descriptor) return;
      element.classList.add(item[1]);
      if (element.querySelector(':scope > .' + descriptor.icon)) return;
      const icon = createIconFromDescriptor(descriptor, {
        className: 'peoplehcm-pseudo-icon ' + item[2]
      });
      if (item[0] === '::before') element.prepend(icon);
      else element.append(icon);
    });
  }

  function normalizePseudoIcons(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.nodeType === global.Node.ELEMENT_NODE) normalizePseudoElement(root);
    root.querySelectorAll('*').forEach(normalizePseudoElement);
  }

  function upgradeLegacyIcon(element, descriptor) {
    element.textContent = '';
    element.classList.add(descriptor.style, descriptor.icon, 'peoplehcm-normalized-icon');
    if (!element.hasAttribute('aria-label')) element.setAttribute('aria-hidden', 'true');
  }

  function normalizeTextNode(node) {
    if (!node || node.nodeType !== global.Node.TEXT_NODE || !node.parentElement) return;
    const parent = node.parentElement;
    const option = parent.closest('option');
    if (option) {
      normalizeOption(option);
      return;
    }
    if (isSkippedElement(parent)) return;

    const segments = splitGraphemes(node.nodeValue || '');
    const converted = segments.map(segment => ({
      segment,
      descriptor: descriptorFor(segment)
    }));
    if (!converted.some(item => item.descriptor)) return;

    const significant = converted.filter(item => item.segment.trim());
    if (parent.tagName === 'I' && significant.some(item => item.descriptor)) {
      const descriptor = significant.find(item => item.descriptor).descriptor;
      const remainingText = converted
        .filter(item => !item.descriptor)
        .map(item => item.segment)
        .join('');
      upgradeLegacyIcon(parent, descriptor);
      if (remainingText) parent.appendChild(document.createTextNode(remainingText));
      return;
    }

    const fragment = document.createDocumentFragment();
    converted.forEach(item => {
      if (item.descriptor) {
        fragment.appendChild(createIconFromDescriptor(item.descriptor));
      } else {
        fragment.appendChild(document.createTextNode(item.segment));
      }
    });
    node.replaceWith(fragment);
  }

  function normalizeAttributes(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.nodeType === global.Node.ELEMENT_NODE) {
      if (root.matches('option')) normalizeOption(root);
      if (root.matches(decoratedSelectSelector)) decorateSelect(root);
      if (root.matches('i')) normalizeFontAwesomeElement(root);
      normalizePlaceholder(root);
    }
    root.querySelectorAll('option').forEach(normalizeOption);
    root.querySelectorAll(decoratedSelectSelector).forEach(decorateSelect);
    root.querySelectorAll('i').forEach(normalizeFontAwesomeElement);
    root.querySelectorAll('[placeholder]').forEach(normalizePlaceholder);
  }

  function normalize(root) {
    const target = root || document;
    if (target.nodeType === global.Node.TEXT_NODE) {
      normalizeTextNode(target);
      return target;
    }
    if (
      target.nodeType === global.Node.ELEMENT_NODE
      && isSkippedElement(target)
    ) {
      return target;
    }

    normalizeAttributes(target);
    const textNodes = [];
    const walker = document.createTreeWalker(
      target,
      global.NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return isSkippedElement(node.parentElement)
            ? global.NodeFilter.FILTER_REJECT
            : global.NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(normalizeTextNode);
    normalizePseudoIcons(target);
    return target;
  }

  let observer = null;

  function observe(root) {
    const target = root || document.documentElement;
    if (!target) return null;
    if (observer) observer.disconnect();
    observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'attributes') {
          normalizePlaceholder(record.target);
          normalizeFontAwesomeElement(record.target);
          normalizePseudoElement(record.target);
          return;
        }
        if (record.type === 'characterData') {
          normalizeTextNode(record.target);
          return;
        }
        record.addedNodes.forEach(normalize);
      });
    });
    observer.observe(target, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'placeholder']
    });
    return observer;
  }

  function disconnect() {
    if (observer) observer.disconnect();
    observer = null;
  }

  function lookup(value) {
    const descriptor = descriptorFor(value);
    return descriptor
      ? { icon: descriptor.icon, style: descriptor.style, color: descriptor.color || '' }
      : null;
  }

  function init() {
    ensureSupportStyle();
    normalize(document);
    observe(document.documentElement);
  }

  global.PeopleHcmIcons = Object.freeze({
    create: createIcon,
    disconnect,
    init,
    lookup,
    normalize,
    observe,
    strip: stripDecorativeGlyphs
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window);
