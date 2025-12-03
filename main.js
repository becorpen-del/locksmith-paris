(function () {
  const doc = document;
  const win = window;
  const html = doc.documentElement;
  html.classList.remove('no-js');

  const body = doc.body;
  const dataLayer = win.dataLayer || (win.dataLayer = []);

  const yearEl = doc.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  setupMobileNavigation();
  setupAnalytics();
  const form = doc.querySelector('[data-form]');
  const stickyCard = doc.querySelector('[data-sticky-card]');
  setupForm(form);
  setupMobileForm(form, stickyCard);
  setupDesktopContactToggle(stickyCard);

  function setupMobileNavigation() {
    const navToggle = doc.querySelector('.mobile-header .nav-toggle');
    const mobileNav = doc.getElementById('mobile-nav');
    if (!navToggle || !mobileNav) return;

    const openMenu = () => {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Fermer le menu');
      mobileNav.classList.add('active');
      body.classList.add('nav-open');
    };

    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Ouvrir le menu');
      mobileNav.classList.remove('active');
      body.classList.remove('nav-open');
    };

    const toggleMenu = () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    // Toggle on click
    navToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking a nav link
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape key
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        navToggle.focus();
      }
    });

    // Close menu when clicking outside
    doc.addEventListener('click', (event) => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen && !mobileNav.contains(event.target) && !navToggle.contains(event.target)) {
        closeMenu();
      }
    });

    // Reset on desktop
    const desktopMedia = win.matchMedia('(min-width: 769px)');
    desktopMedia.addEventListener('change', () => {
      if (desktopMedia.matches) {
        closeMenu();
      }
    });
  }

  function setupAnalytics() {
    const elements = doc.querySelectorAll('[data-analytics]');
    elements.forEach((el) => {
      el.addEventListener('click', () => {
        dataLayer.push({
          event: 'cta_click',
          id: el.getAttribute('data-analytics'),
          page: 'locksmith_paris'
        });
      });
    });
  }

  function setupForm(formEl) {
    if (!formEl) return;

    const successMessage = doc.createElement('p');
    successMessage.className = 'form-success';
    successMessage.hidden = true;
    successMessage.textContent = 'Request received! A locksmith expert will reply within minutes.';
    const note = formEl.querySelector('.form-note');
    if (note) {
      formEl.insertBefore(successMessage, note);
    } else {
      formEl.append(successMessage);
    }

    const toast = doc.querySelector('.toast');
    const toastClose = toast?.querySelector('.toast__close');
    let toastTimer;

    const fields = [
      {
        control: formEl.querySelector('#first-name'),
        error: formEl.querySelector('#first-name-error'),
        message: 'Please enter your first name.'
      },
      {
        control: formEl.querySelector('#last-name'),
        error: formEl.querySelector('#last-name-error'),
        message: 'Please enter your last name.'
      },
      {
        control: formEl.querySelector('#email'),
        error: formEl.querySelector('#email-error'),
        message: 'Please enter a valid email address.',
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      },
      {
        control: formEl.querySelector('#subject'),
        error: formEl.querySelector('#subject-error'),
        message: 'Tell us how we can help you in Paris.'
      },
      {
        control: formEl.querySelector('#consent'),
        error: formEl.querySelector('#consent-error'),
        message: 'Please confirm we can contact you.',
        validator: (_, control) => control.checked
      }
    ];

    fields.forEach(({ control, error, validator }) => {
      if (!control) return;
      const eventName = control.type === 'checkbox' ? 'change' : 'input';
      control.addEventListener(eventName, () => {
        validateField(control, error, validator);
      });
    });

    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      const errors = fields
        .map((entry) => {
          if (!entry.control) return null;
          const isValid = validateField(entry.control, entry.error, entry.validator);
          return isValid ? null : entry.control;
        })
        .filter(Boolean);

      if (errors.length > 0) {
        errors[0].focus();
        return;
      }

      dataLayer.push({ event: 'lead_submit', page: 'locksmith_paris' });
      successMessage.hidden = false;
      formEl.reset();
      fields.forEach(({ control, error }) => {
        control?.removeAttribute('aria-invalid');
        if (error) error.textContent = '';
      });

      showToast();
    });

    formEl.addEventListener('input', () => {
      if (!successMessage.hidden) {
        successMessage.hidden = true;
      }
    });

    toastClose?.addEventListener('click', hideToast);

    function validateField(control, errorEl, validator = (value) => value.trim().length > 0) {
      if (!control || !errorEl) return true;
      const value = control.type === 'checkbox' ? control.checked : control.value;
      const isValid = validator.length === 2 ? validator(value, control) : validator(value);
      if (!isValid) {
        control.setAttribute('aria-invalid', 'true');
        errorEl.textContent = errorEl.dataset.message || control.dataset.error || getMessage(control.id);
        return false;
      }
      control.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      return true;
    }

    function getMessage(id) {
      const entry = fields.find((item) => item.control?.id === id);
      return entry?.message || 'Please fill out this field.';
    }

    function showToast() {
      if (!toast) return;
      toast.hidden = false;
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = win.setTimeout(hideToast, 6000);
    }

    function hideToast() {
      if (!toast) return;
      toast.classList.remove('is-visible');
      toast.hidden = true;
    }
  }

  function setupMobileForm(formEl, stickyCard) {
    const mobileCta = doc.querySelector('[data-mobile-cta]');
    const mobileForm = doc.querySelector('[data-mobile-form]');
    const mobileOpen = doc.querySelector('[data-mobile-form-open]');
    const mobileClose = doc.querySelector('[data-mobile-form-close]');
    const mobileOverlay = doc.querySelector('[data-mobile-form-overlay]');
    const mobileBody = doc.querySelector('[data-mobile-form-body]');
    if (!formEl || !mobileForm || !mobileBody) return;

    const mediaQuery = win.matchMedia('(max-width: 1023px)');
    let previousFocus = null;
    let lastScrollY = 0;
    let trapCleanup = null;

    if (mediaQuery.matches) {
      mobileBody.appendChild(formEl);
    }

    mediaQuery.addEventListener('change', (event) => {
      if (event.matches) {
        mobileBody.appendChild(formEl);
      } else if (stickyCard) {
        stickyCard.querySelector('.contact-card')?.appendChild(formEl);
        closeSheet();
      }
      updateStickyAvailability(event.matches, mobileCta);
    });

    updateStickyAvailability(mediaQuery.matches, mobileCta);

    mobileOpen?.addEventListener('click', () => {
      if (mobileForm.getAttribute('aria-hidden') === 'false') return;
      previousFocus = doc.activeElement;
      lastScrollY = win.scrollY;
      body.classList.add('modal-open');
      mobileForm.setAttribute('aria-hidden', 'false');
      if (!mobileBody.contains(formEl)) {
        mobileBody.appendChild(formEl);
      }
      trapCleanup = trapFocus(mobileForm);
      trapCleanup.focusFirst();
      dataLayer.push({ event: 'cta_click', id: 'cta-mobile-form-open', page: 'locksmith_paris' });
    });

    const closeTargets = [mobileClose, mobileOverlay];
    closeTargets.forEach((target) => {
      target?.addEventListener('click', closeSheet);
    });

    mobileForm.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeSheet();
      }
    });

    function closeSheet() {
      if (mobileForm.getAttribute('aria-hidden') === 'true') return;
      mobileForm.setAttribute('aria-hidden', 'true');
      body.classList.remove('modal-open');
      if (typeof lastScrollY === 'number') {
        win.scrollTo({ top: lastScrollY, behavior: 'auto' });
      }
      trapCleanup?.release();
      trapCleanup = null;
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    }
  }

  function updateStickyAvailability(isMobile, mobileCta) {
    if (!mobileCta) return;
    mobileCta.style.display = isMobile ? 'flex' : '';
  }

  function trapFocus(container) {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    const focusable = Array.from(container.querySelectorAll(selectors.join(','))).filter((el) => !el.hasAttribute('hidden'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKey(event) {
      if (event.key !== 'Tab') return;
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey) {
        if (doc.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      } else if (doc.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    container.addEventListener('keydown', handleKey);

    return {
      focusFirst() {
        if (first instanceof HTMLElement) {
          first.focus();
        }
      },
      release() {
        container.removeEventListener('keydown', handleKey);
      }
    };
  }

  function setupDesktopContactToggle(stickyCard) {
    const fab = doc.querySelector('[data-contact-fab]');
    if (!stickyCard || !fab) return;
    const heroContainer = stickyCard.closest('.hero__container');
    const heroSection = doc.querySelector('.hero');
    if (!heroContainer || !heroSection) return;

    const mediaQuery = win.matchMedia('(min-width: 1024px)');
    let heroBottom = 0;

    const updateMeasurements = () => {
      const rect = heroSection.getBoundingClientRect();
      heroBottom = rect.top + win.scrollY + rect.height;
    };

    const showForm = () => {
      heroContainer.classList.remove('hero__container--compact');
      fab.classList.remove('contact-fab--visible');
      win.requestAnimationFrame(updateMeasurements);
    };

    const hideForm = () => {
      heroContainer.classList.add('hero__container--compact');
      fab.classList.add('contact-fab--visible');
      win.requestAnimationFrame(updateMeasurements);
    };

    const evaluate = () => {
      if (!mediaQuery.matches) {
        showForm();
        return;
      }
      const buffer = 200;
      if (win.scrollY > heroBottom - buffer) {
        hideForm();
      } else {
        showForm();
      }
    };

    updateMeasurements();
    evaluate();

    const throttledEvaluate = throttle(evaluate, 50);

    win.addEventListener('scroll', throttledEvaluate, { passive: true });

    win.addEventListener('resize', () => {
      updateMeasurements();
      evaluate();
    });

    mediaQuery.addEventListener('change', () => {
      updateMeasurements();
      evaluate();
    });

    fab.addEventListener('click', () => {
      showForm();
      stickyCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstField = stickyCard.querySelector('input, textarea, select');
      if (firstField instanceof HTMLElement) {
        win.setTimeout(() => firstField.focus({ preventScroll: true }), 400);
      }
    });
  }

  function throttle(fn, wait) {
    let last = 0;
    let timeout;
    return function throttled(...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = undefined;
        last = now;
        fn.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          last = Date.now();
          timeout = undefined;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }
})();
