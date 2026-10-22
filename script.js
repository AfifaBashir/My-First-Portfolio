/**
 * Afifa Syed Bashir — Personal Portfolio Script
 * Modern vanilla JavaScript for interactivity, accessibility, and theme management
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. DOM Elements Selection
  // ---------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const backToTopBtn = document.getElementById('backToTop');
  const copyToast = document.getElementById('copyToast');
  const toastMsg = document.getElementById('toastMsg');
  const copyButtons = document.querySelectorAll('.btn-copy');
  const currentYearSpan = document.getElementById('currentYear');
  const contactForm = document.getElementById('contactForm');

  // ---------------------------------------------------------------------------
  // 2. Dynamic Year Update
  // ---------------------------------------------------------------------------
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // ---------------------------------------------------------------------------
  // 3. Theme Management (Dark / Light Mode)
  // ---------------------------------------------------------------------------
  const THEME_STORAGE_KEY = 'asb_portfolio_theme';

  /**
   * Determine preferred initial theme:
   * 1. Check localStorage for user's explicit preference
   * 2. Fall back to system preference via media query
   */
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  /**
   * Apply theme to root and update aria attributes
   */
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to light theme');
        themeToggle.setAttribute('title', 'Switch to light theme');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        themeToggle.setAttribute('title', 'Switch to dark theme');
      }
    }
  }

  // Initialize theme on script execution
  let currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  // Toggle button handler
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      applyTheme(currentTheme);
    });
  }

  // Listen to OS theme change if user hasn't explicitly set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        currentTheme = e.matches ? 'dark' : 'light';
        applyTheme(currentTheme);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Mobile Navigation Drawer & Accessibility
  // ---------------------------------------------------------------------------
  function toggleMobileMenu(forceClose = false) {
    if (!navMenu || !navToggle) return;

    const isOpen = forceClose ? false : !navMenu.classList.contains('is-open');

    if (isOpen) {
      navMenu.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
    } else {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Close menu when clicking any nav link
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMobileMenu(true);
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (navMenu && navMenu.classList.contains('is-open')) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        toggleMobileMenu(true);
      }
    }
  });

  // Close menu with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
      toggleMobileMenu(true);
      navToggle.focus();
    }
  });

  // ---------------------------------------------------------------------------
  // 5. Scroll Spy & Header Shadow
  // ---------------------------------------------------------------------------
  function updateScrollSpy() {
    const scrollPosition = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(function (link) {
          const href = link.getAttribute('href');
          if (href === '#' + id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  // Back to top button visibility check
  function handleBackToTopVisibility() {
    if (!backToTopBtn) return;
    if (window.scrollY > 380) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', function () {
    updateScrollSpy();
    handleBackToTopVisibility();
  }, { passive: true });

  // Initial call
  updateScrollSpy();
  handleBackToTopVisibility();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Interactive Copy to Clipboard
  // ---------------------------------------------------------------------------
  let toastTimer = null;

  function showToast(message) {
    if (!copyToast || !toastMsg) return;

    toastMsg.textContent = message;
    copyToast.classList.add('show');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(function () {
      copyToast.classList.remove('show');
    }, 2800);
  }

  copyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const textToCopy = btn.getAttribute('data-copy');
      const copyTextSpan = btn.querySelector('.copy-text');
      const originalText = copyTextSpan ? copyTextSpan.textContent : 'Copy';

      if (!textToCopy) return;

      // Clipboard API with legacy fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
          .then(function () {
            handleCopySuccess(btn, copyTextSpan, originalText, textToCopy);
          })
          .catch(function () {
            fallbackCopy(textToCopy, btn, copyTextSpan, originalText);
          });
      } else {
        fallbackCopy(textToCopy, btn, copyTextSpan, originalText);
      }
    });
  });

  function fallbackCopy(text, btn, span, original) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        handleCopySuccess(btn, span, original, text);
      } else {
        showToast('Unable to copy. Please copy manually.');
      }
    } catch (err) {
      showToast('Unable to copy. Please copy manually.');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  function handleCopySuccess(btn, span, original, copiedText) {
    if (span) {
      span.textContent = 'Copied!';
    }
    btn.style.borderColor = 'var(--accent-secondary)';

    const label = copiedText.includes('@') ? 'Email copied to clipboard!' : 'Phone number copied to clipboard!';
    showToast(label);

    setTimeout(function () {
      if (span) {
        span.textContent = original;
      }
      btn.style.borderColor = '';
    }, 2000);
  }

  // ---------------------------------------------------------------------------
  // 7. Contact Email Assistant Form
  // ---------------------------------------------------------------------------
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('senderName');
      const subjectInput = document.getElementById('senderSubject');
      const messageInput = document.getElementById('senderMessage');

      const name = nameInput ? nameInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value.trim() : 'Portfolio Contact';
      const message = messageInput ? messageInput.value.trim() : '';

      const fullSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject}`);
      const fullBody = encodeURIComponent(
        `Hi Afifa,\n\n${message}\n\nBest regards,\n${name}`
      );

      // Open email client with pre-filled details
      window.location.href = `mailto:afifabashir2006@gmail.com?subject=${fullSubject}&body=${fullBody}`;

      showToast('Opening default email application...');
    });
  }

})();
