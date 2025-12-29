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

  setupNavigation();
  setupAnalytics();
  const form = doc.querySelector('[data-form]');
  const stickyCard = doc.querySelector('[data-sticky-card]');
  setupForm(form);
  setupMobileForm(form, stickyCard);
  setupDesktopContactToggle(stickyCard);
  setupFloatingCallCta();

  function setupNavigation() {
    const btn = doc.querySelector('.btn-ham');
    const drawer = doc.getElementById('site-menu');
    const backdrop = doc.querySelector('.drawer__backdrop');
    if (!btn || !drawer || !backdrop) return;

    const closeDelay = 280;
    let lastFocused = null;

    const focusFirst = () => {
      const link = drawer.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
      if (link instanceof HTMLElement) {
        link.focus();
      }
    };

    const openMenu = () => {
      lastFocused = doc.activeElement;
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Fermer le menu');
      drawer.hidden = false;
      backdrop.hidden = false;
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      doc.documentElement.style.overflow = 'hidden';
      focusFirst();
    };

    const closeMenu = () => {
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Ouvrir le menu');
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      doc.documentElement.style.overflow = '';
      win.setTimeout(() => {
        drawer.hidden = true;
        backdrop.hidden = true;
      }, closeDelay);
      if (lastFocused instanceof HTMLElement) {
        lastFocused.focus();
      } else {
        btn.focus();
      }
    };

    const toggleMenu = () => {
      if (btn.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    btn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && btn.classList.contains('is-open')) {
        closeMenu();
      }
    });

    const navLinks = drawer.querySelectorAll('a');
    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
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

  function setupFloatingCallCta() {
    const cta = doc.querySelector('.floating-call-cta');
    if (!cta) return;

    const SHOW_AFTER_PX = 200;
    let didScroll = false;

    const onScroll = () => {
      didScroll = true;
    };

    const rafTick = () => {
      if (didScroll) {
        didScroll = false;
        const y = win.scrollY || win.pageYOffset;
        if (y > SHOW_AFTER_PX) {
          cta.classList.add('is-visible');
        } else {
          cta.classList.remove('is-visible');
        }
      }
      win.requestAnimationFrame(rafTick);
    };

    win.addEventListener('scroll', onScroll, { passive: true });
    win.requestAnimationFrame(rafTick);

    const footer = doc.querySelector('footer');
    if (footer && 'IntersectionObserver' in win) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cta.style.opacity = '0';
            cta.style.pointerEvents = 'none';
          } else if (cta.classList.contains('is-visible')) {
            cta.style.opacity = '';
            cta.style.pointerEvents = '';
          }
        });
      }, { threshold: 0 });

      io.observe(footer);
    }

    cta.addEventListener('click', () => {
      if (win.gtag) {
        win.gtag('event', 'click', {
          event_category: 'CTA',
          event_label: 'Floating Call',
          value: 1
        });
      }

      if (win.plausible) {
        win.plausible('Floating Call Click');
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
