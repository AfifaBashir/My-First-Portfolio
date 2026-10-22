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

  // ---------------------------------------------------------------------------
  // 8. Interactive Portfolio Chatbot Assistant
  // ---------------------------------------------------------------------------
  const chatbotWrapper = document.getElementById('chatbotWrapper');
  const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
  const chatbotResetBtn = document.getElementById('chatbotResetBtn');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotSuggestions = document.getElementById('chatbotSuggestions');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSendBtn = document.getElementById('chatbotSendBtn');

  // Quick Suggestion Chips Configuration
  const INITIAL_SUGGESTIONS = [
    { label: '🎓 Education & CGPA', query: 'Tell me about your education and CGPA' },
    { label: '💻 Technical Skills', query: 'What are your technical skills?' },
    { label: '🚀 Featured Projects', query: 'Showcase your engineering projects' },
    { label: '📬 Contact Info', query: 'How can I contact Afifa?' },
    { label: '📜 Certifications', query: 'What certifications do you have?' },
    { label: '🌐 Languages', query: 'What languages do you speak?' }
  ];

  // Verified Knowledge Base Response Logic (Strictly Grounded in Resume)
  function generateBotResponse(rawQuery) {
    const query = rawQuery.toLowerCase().trim();

    // 1. Greetings
    if (/\b(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|hola|sup)\b/i.test(query)) {
      return "Hello! 👋 I'm Afifa's Portfolio Assistant. I can answer questions about her academic performance, technical skills, IoT and Web projects, or how to contact her. What would you like to explore?";
    }

    // 2. Thank you / Farewell
    if (/\b(thanks|thank\s*you|thx|bye|goodbye|see\s*you)\b/i.test(query)) {
      return "You're very welcome! Feel free to reach out to Afifa directly at <a href='mailto:afifabashir2006@gmail.com'>afifabashir2006@gmail.com</a> if you'd like to discuss internships or collaborations. Have a wonderful day! 😊";
    }

    // 3. Who is Afifa / About / Objective
    if (/\b(who\s*is|about|bio|background|objective|career|introduction|profile|summary)\b/i.test(query)) {
      return "<strong>Afifa Syed Bashir</strong> is an undergraduate student pursuing a <strong>BE in Computer Science & Engineering (Artificial Intelligence & Machine Learning)</strong> at AJ Institute of Engineering & Technology, Mangalore (Class of 2027).<br><br>Her career objective is to apply programming and analytical problem-solving skills to real-world AI, Machine Learning, and IoT systems through adaptability, reliable work, and collaborative engineering.";
    }

    // 4. Education, CGPA, SGPA, PUC & SSLC Scores
    if (/\b(education|college|degree|cgpa|sgpa|marks|score|percentage|pu|puc|sslc|school|academics|grades|ajiet)\b/i.test(query)) {
      if (/\b(sgpa|semester|sem)\b/i.test(query)) {
        return "Afifa's semester-wise SGPA record at AJIET (CGPA: <strong>8.0 / 10</strong>):<br>• Sem 1: <strong>8.15</strong><br>• Sem 2: <strong>8.05</strong><br>• Sem 3: <strong>7.80</strong><br>• Sem 4: <strong>7.90</strong><br>• Sem 5: <strong>8.00</strong><br>• Sem 6: <strong>8.10</strong>";
      }
      if (/\b(pu|puc|12th)\b/i.test(query)) {
        return "Afifa completed her Pre-University Course (PUC) at <strong>Karkala Jnanasudha PU College</strong>, scoring a distinction of <strong>95.16%</strong>.";
      }
      if (/\b(sslc|10th|high\s*school)\b/i.test(query)) {
        return "Afifa completed her SSLC at <strong>Karkala Jnanasudha English Medium High School</strong> with an outstanding score of <strong>95.68%</strong>.";
      }
      return "Here is Afifa's verified academic record:<br><br>• <strong>BE in CSE (AI & ML)</strong> (2023–2027 Expected)<br>  AJ Institute of Engineering & Technology, Mangalore<br>  Overall CGPA: <strong>8.0 / 10</strong><br><br>• <strong>Pre-University Course (PUC)</strong><br>  Karkala Jnanasudha PU College &mdash; <strong>95.16%</strong><br><br>• <strong>SSLC (High School)</strong><br>  Karkala Jnanasudha English Medium High School &mdash; <strong>95.68%</strong>";
    }

    // 5. Specific Project Queries
    if (/\b(curainfo|healthcare|medicine|symptom|nutrient|first[\s-]?aid)\b/i.test(query)) {
      return "<strong>CuraInfo &mdash; Healthcare Information Web Application</strong><br>A healthcare portal designed to provide organized and accessible information on medicines, symptom indices, essential dietary nutrients, and emergency first-aid workflows.<br><br><em>Category: Web Development & Healthcare Information Architecture.</em>";
    }

    if (/\b(clothes|smart\s*clothes|rain|dht11|buzzer|humidity)\b/i.test(query)) {
      return "<strong>Smart Clothes Protection System</strong><br>An IoT-based automated system that uses a rain sensor and a DHT11 temperature/humidity sensor to detect weather changes in real time and immediately alert users via an integrated buzzer to protect outdoor laundry.<br><br><em>Category: IoT & Embedded Hardware Automation.</em>";
    }

    if (/\b(swasth|fitness|coach|esp32|servo|movement|workout)\b/i.test(query)) {
      return "<strong>Swasth-AI &mdash; An IoT & AI Based Smart Fitness Coach</strong><br>An intelligent fitness monitoring system integrating an ESP32 microcontroller with Wi-Fi, a servo motor, and LED visual feedback to track routines and respond interactively to movement commands.<br><br><em>Category: IoT & AI Fitness Technology.</em>";
    }

    // 6. General Projects Query
    if (/\b(projects?|works?|portfolio|built|creations?|hardware|iot)\b/i.test(query)) {
      return "Afifa has engineered three featured academic projects:<br><br>1. <strong>CuraInfo</strong>: Healthcare information web application covering medicines, symptoms, nutrients, and first-aid.<br>2. <strong>Smart Clothes Protection System</strong>: IoT weather-detection system with rain sensor, DHT11, and buzzer alert.<br>3. <strong>Swasth-AI</strong>: IoT & AI smart fitness coach using ESP32, Wi-Fi, servo motor, and LED indicators.<br><br><a href='#projects'>Click here to inspect the Projects section</a>.";
    }

    // 7. Technical Skills & Soft Skills
    if (/\b(skills?|tech|stack|technologies|coding|programming|tools?)\b/i.test(query)) {
      if (/\b(soft|interpersonal|team|communication|time)\b/i.test(query)) {
        return "Afifa's core soft skills include:<br>• <strong>Communication</strong> (Clear technical articulation & listening)<br>• <strong>Problem Solving</strong> (Structured analytical breakdown)<br>• <strong>Adaptability</strong> (Eager to learn new tools & paradigms)<br>• <strong>Teamwork & Collaboration</strong> (Reliable team coordination)<br>• <strong>Time Management</strong> (Prioritizing coursework & milestones)";
      }
      return "Afifa's verified competencies include:<br><br><strong>Technical Skills:</strong><br>• <strong>Java</strong> (Object-Oriented Programming, Core APIs)<br>• <strong>Python</strong> (Algorithmic problem-solving & AI/ML workflows)<br>• <strong>C Programming</strong> (Procedural design, pointers & memory concepts)<br>• <strong>Object-Oriented Programming (OOP)</strong><br>• <strong>Basic Data Structures</strong> (Arrays, linked lists, stacks, queues)<br><br><strong>Soft Skills:</strong><br>Communication, Problem Solving, Adaptability, Teamwork, and Time Management.";
    }

    // 8. Specific Programming Languages
    if (/\b(java)\b/i.test(query)) {
      return "Afifa has a solid foundation in <strong>Java</strong>, with hands-on practice in Object-Oriented Programming (OOP), class modularity, inheritance, polymorphism, and standard data structures.";
    }

    if (/\b(python)\b/i.test(query)) {
      return "Afifa utilizes <strong>Python</strong> for algorithmic problem solving, scripting, and foundational AI & Machine Learning coursework.";
    }

    if (/\b(c\b|c\s*programming)\b/i.test(query)) {
      return "Afifa is proficient in <strong>C Programming</strong>, covering procedural development, memory addressing, pointers, and foundational algorithms.";
    }

    if (/\b(data\s*structures?|dsa|oop)\b/i.test(query)) {
      return "Afifa is grounded in <strong>Basic Data Structures</strong> (arrays, linked lists, stacks, queues, searching & sorting) and <strong>Object-Oriented Programming</strong> design principles.";
    }

    // 9. Certifications
    if (/\b(certif(icate|ication)s?|courses?|infosys|simplilearn|springboard|excel)\b/i.test(query)) {
      return "Afifa holds three verified certifications:<br><br>1. <strong>Basics of Electronics and Programming</strong> &mdash; <em>Infosys Springboard</em><br>2. <strong>Introduction to MS Excel</strong> &mdash; <em>Microsoft Simplilearn</em><br>3. <strong>Digital Electronics</strong> &mdash; <em>Infosys Springboard</em>";
    }

    // 10. Languages Spoken
    if (/\b(languages?|speak|mother\s*tongue|kannada|urdu|hindi|english)\b/i.test(query)) {
      return "Afifa is multilingual and proficient in four languages:<br>• <strong>English</strong> (Fluent)<br>• <strong>Kannada</strong> (Regional)<br>• <strong>Hindi</strong> (Conversational)<br>• <strong>Urdu</strong> (Native)";
    }

    // 11. Extracurricular Activities
    if (/\b(extracurricular|activities|spell\s*bee|compet(ition|itive)|achieve|awards?)\b/i.test(query)) {
      return "Afifa represented her institution and participated in the prestigious <strong>State-Level Spell Bee Competition</strong>, reflecting dedicated vocabulary mastery, focus, and performance under competitive pressure.";
    }

    // 12. Contact / Hiring / Opportunities
    if (/\b(contact|email|phone|call|reach|message|hire|hiring|intern(ship)?|collaborat(e|ion)|opportunity|location)\b/i.test(query)) {
      return "You can get in touch with Afifa directly:<br><br>• <strong>Email</strong>: <a href='mailto:afifabashir2006@gmail.com'>afifabashir2006@gmail.com</a><br>• <strong>Phone</strong>: <a href='tel:9986045728'>+91 9986045728</a><br>• <strong>Location</strong>: Karnataka, India<br>• <strong>College</strong>: AJ Institute of Engineering & Technology, Mangalore<br><br>She is actively open to AI/ML and software engineering internships!";
    }

    // 13. Resume
    if (/\b(resume|cv|biodata)\b/i.test(query)) {
      return "All details shown on this website reflect Afifa's verified academic resume (BE CGPA: 8.0, PUC: 95.16%, SSLC: 95.68%, plus 3 IoT & web projects). You can contact her at <a href='mailto:afifabashir2006@gmail.com'>afifabashir2006@gmail.com</a> to request a complete PDF resume.";
    }

    // 14. Fallback Default
    return "I don't have that specific detail in Afifa's resume yet, but I would be glad to help with information on her <strong>education</strong>, <strong>technical skills</strong>, <strong>projects</strong>, or <strong>certifications</strong>.<br><br>You can also reach Afifa directly at <a href='mailto:afifabashir2006@gmail.com'>afifabashir2006@gmail.com</a>!";
  }

  // Format timestamp (e.g. 10:45 AM)
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Escape HTML helper for user input
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Append a chat bubble
  function appendMessage(sender, htmlContent) {
    if (!chatbotMessages) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = htmlContent;
    bubble.appendChild(contentDiv);

    const meta = document.createElement('div');
    meta.className = 'chat-meta';
    meta.textContent = getCurrentTime();
    bubble.appendChild(meta);

    chatbotMessages.appendChild(bubble);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Typing indicator
  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'chatbotTypingIndicator';
    indicator.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    chatbotMessages.appendChild(indicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return indicator;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('chatbotTypingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Render suggestion chips
  function renderSuggestions() {
    if (!chatbotSuggestions) return;
    chatbotSuggestions.innerHTML = '';

    INITIAL_SUGGESTIONS.forEach(function (item) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'suggestion-chip';
      chip.textContent = item.label;
      chip.setAttribute('aria-label', `Ask: ${item.query}`);
      chip.addEventListener('click', function () {
        handleUserQuery(item.query);
      });
      chatbotSuggestions.appendChild(chip);
    });
  }

  // Process user question
  function handleUserQuery(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Append user message
    appendMessage('user', escapeHtml(cleanText));

    if (chatbotInput) {
      chatbotInput.value = '';
    }

    // Disable send button while answering
    if (chatbotSendBtn) chatbotSendBtn.disabled = true;

    // Show typing animation
    showTypingIndicator();

    // Natural conversation delay (350ms - 550ms)
    setTimeout(function () {
      removeTypingIndicator();
      const responseHtml = generateBotResponse(cleanText);
      appendMessage('bot', responseHtml);

      if (chatbotSendBtn) chatbotSendBtn.disabled = false;
      if (chatbotInput) chatbotInput.focus();
    }, 450);
  }

  // Open / Close Chatbot Window
  function toggleChatbot(forceState) {
    if (!chatbotWindow || !chatbotToggleBtn) return;

    const isCurrentlyOpen = chatbotWindow.classList.contains('is-open');
    const newState = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (newState) {
      chatbotWindow.hidden = false;
      chatbotWindow.classList.add('is-open');
      chatbotToggleBtn.setAttribute('aria-expanded', 'true');
      chatbotToggleBtn.setAttribute('aria-label', 'Close portfolio chatbot');

      // If opening for first time, initialize greeting
      if (!chatbotMessages.querySelector('.chat-bubble')) {
        initChatbotGreeting();
      }

      if (chatbotInput) {
        setTimeout(function () {
          chatbotInput.focus();
        }, 200);
      }
    } else {
      chatbotWindow.classList.remove('is-open');
      chatbotToggleBtn.setAttribute('aria-expanded', 'false');
      chatbotToggleBtn.setAttribute('aria-label', 'Open portfolio chatbot');
      setTimeout(function () {
        if (!chatbotWindow.classList.contains('is-open')) {
          chatbotWindow.hidden = true;
        }
      }, 250);
    }
  }

  // Initialize Welcome Message
  function initChatbotGreeting() {
    if (!chatbotMessages) return;
    chatbotMessages.innerHTML = '';
    appendMessage(
      'bot',
      "Hi! I'm <strong>Afifa's Portfolio Assistant</strong> 👋<br><br>I can answer questions about Afifa's academic record, programming skills, engineering projects, or help you connect with her. Select a quick topic below or type any question!"
    );
    renderSuggestions();
  }

  // Event Listeners for Chatbot
  if (chatbotToggleBtn) {
    chatbotToggleBtn.addEventListener('click', function () {
      toggleChatbot();
    });
  }

  if (chatbotCloseBtn) {
    chatbotCloseBtn.addEventListener('click', function () {
      toggleChatbot(false);
    });
  }

  if (chatbotResetBtn) {
    chatbotResetBtn.addEventListener('click', function () {
      initChatbotGreeting();
    });
  }

  if (chatbotForm) {
    chatbotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (chatbotInput && chatbotInput.value) {
        handleUserQuery(chatbotInput.value);
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chatbotWindow && chatbotWindow.classList.contains('is-open')) {
      toggleChatbot(false);
      chatbotToggleBtn.focus();
    }
  });

  // Initialize suggestions on page load
  renderSuggestions();

})();
