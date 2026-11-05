'use strict';

/**
 * DAYS official website — shared JavaScript
 *
 * 1. Mobile navigation
 * 2. Scroll reveal and year display
 * 3. Photo lightbox
 * 4. ODM/OEM and rental-space inquiry form
 *
 * No framework or build tools required. This file works on GitHub Pages.
 */

document.documentElement.classList.add('js');

// -----------------------------------------------------------------------------
// 1. MOBILE NAVIGATION
// -----------------------------------------------------------------------------
(function initMobileNavigation() {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.mobile-nav');

  if (!menuButton || !navigation) return;

  function setMenuOpen(isOpen) {
    document.body.classList.toggle('menu-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute(
      'aria-label',
      isOpen ? 'メニューを閉じる' : 'メニューを開く'
    );
    navigation.inert = !isOpen;
  }

  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) setMenuOpen(false);
  });
})();

// -----------------------------------------------------------------------------
// 2. SMALL VISUAL EFFECTS
// -----------------------------------------------------------------------------
(function initScrollEffects() {
  const elements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.09,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach((element) => observer.observe(element));
})();

document.querySelectorAll('.current-year').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

// -----------------------------------------------------------------------------
// 3. RENTAL / SCARPETTA PHOTO GALLERY
// -----------------------------------------------------------------------------
(function initLightbox() {
  const dialog = document.getElementById('lightbox');
  if (!dialog) return;

  const image = dialog.querySelector('img');
  const counter = dialog.querySelector('.lightbox-counter');
  const closeButton = dialog.querySelector('.lightbox-close');
  const previousButton = dialog.querySelector('.lightbox-prev');
  const nextButton = dialog.querySelector('.lightbox-next');

  let galleryItems = [];
  let currentIndex = 0;
  let previouslyFocused = null;

  function displayImage(index) {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];

    image.src = item.dataset.src;
    image.alt = item.dataset.alt || '';
    counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
  }

  function openGallery(selectedItem) {
    const galleryId = selectedItem.dataset.gallery;
    galleryItems = Array.from(document.querySelectorAll('[data-gallery]'))
      .filter((item) => item.dataset.gallery === galleryId);

    if (!galleryItems.length) return;

    previouslyFocused = document.activeElement;
    displayImage(galleryItems.indexOf(selectedItem));
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  function closeGallery() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.style.overflow = '';
    image.removeAttribute('src');
    if (previouslyFocused) previouslyFocused.focus();
  }

  document.querySelectorAll('[data-gallery]').forEach((item) => {
    item.addEventListener('click', () => openGallery(item));
  });

  closeButton.addEventListener('click', closeGallery);
  previousButton.addEventListener('click', () => displayImage(currentIndex - 1));
  nextButton.addEventListener('click', () => displayImage(currentIndex + 1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeGallery();
  });

  document.addEventListener('keydown', (event) => {
    if (dialog.hidden) return;

    if (event.key === 'Escape') closeGallery();
    if (event.key === 'ArrowLeft') displayImage(currentIndex - 1);
    if (event.key === 'ArrowRight') displayImage(currentIndex + 1);

    // Keep keyboard focus inside the open image dialog.
    if (event.key === 'Tab') {
      const buttons = [closeButton, previousButton, nextButton];
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault();
        buttons[buttons.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
        event.preventDefault();
        buttons[0].focus();
      }
    }
  });
})();

// -----------------------------------------------------------------------------
// 4. INQUIRY FORM — ODM/OEM + RENTAL SPACE
// -----------------------------------------------------------------------------
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const category = document.getElementById('inquiry-type');
  const rentalDateRow = document.getElementById('rental-date-row');
  const submitButton = document.getElementById('submitBtn');
  const feedback = document.getElementById('inquiry-feedback');

  /**
   * This is the pre-existing DAYS Google Apps Script web app URL.
   * IMPORTANT: The recipient's email address is configured in Apps Script,
   * NOT in this website's HTML/JS. Please check the account and do an end-to-end
   * delivery test before accepting real inquiries.
   *
   * A standalone GitHub Pages site cannot send email by itself.
   */
  const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx_lr73FTrLOPkwvwB4dFfGmsDIRZ0Aq04xXOjQoGlxp9gvCAE-kRr9sXrSDCMWn2_F/exec';

  // Choose the category automatically when arriving from an inquiry link.
  const preselectedType = new URLSearchParams(window.location.search).get('type');
  if (preselectedType === 'odm') category.value = 'ODM・OEM';
  if (preselectedType === 'rental') category.value = 'レンタルスペース';

  function updateCategoryFields() {
    rentalDateRow.hidden = category.value !== 'レンタルスペース';
  }

  category.addEventListener('change', updateCategoryFields);
  updateCategoryFields();

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const rawMessage = document.getElementById('inquiry-message').value.trim();
    const companyName = document.getElementById('inquiry-company').value.trim();
    const preferredDate = document.getElementById('inquiry-date').value.trim();
    const phone = document.getElementById('inquiry-tel').value.trim();

    // Preserve the field names (name / email / message) required by the old GAS.
    // Include the new fields inside "message" so an older GAS implementation
    // can still pass these details along without changing its parameter names.
    const payload = new FormData(form);
    payload.set('message', [
      `【お問い合わせ種別】${category.value}`,
      companyName ? `【会社名・ブランド名】${companyName}` : '',
      phone ? `【電話番号】${phone}` : '',
      preferredDate && category.value === 'レンタルスペース'
        ? `【ご希望の日程】${preferredDate}` : '',
      '',
      '【お問い合わせ内容】',
      rawMessage
    ].filter((line) => line !== null).join('\n'));

    submitButton.disabled = true;
    submitButton.textContent = '送信中…';
    setFeedback('送信処理中です。', 'pending');

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: payload,
        redirect: 'follow'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // An existing GAS may use "success", "result", or "status" in JSON.
      // Require a positive acknowledgement rather than assuming HTTP 200 = sent.
      const result = await response.json();
      const accepted = result && (
        result.success === true ||
        result.result === 'success' ||
        result.status === 'success'
      );

      if (!accepted) throw new Error('No positive confirmation from GAS');

      form.reset();
      updateCategoryFields();
      setFeedback('送信を受け付けました。お問い合わせありがとうございます。', 'success');
    } catch (error) {
      // Some GAS deployments accept a POST but block browsers from reading
      // the cross-origin response. Don't claim a confirmed delivery in that case.
      setFeedback(
        '送信完了を確認できませんでした。重複送信を避けるため、再送する前に少し時間をおいてご確認ください。',
        'error'
      );
      console.error('DAYS contact form: delivery could not be confirmed', error);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = '送信する <span aria-hidden="true">↗</span>';
    }
  });
})();
