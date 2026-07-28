(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ---------- Mood toggle (Outside / Inside) ---------- */
  var toggleBtn = document.getElementById('themeToggle');
  var themeLabel = document.getElementById('themeLabel');
  var outsideParticles = document.getElementById('particlesOutside');
  var insideParticles = document.getElementById('particlesInside');

  function spawnParticles(container, markup, count, animName, minDur, maxDur) {
    if (!container) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      el.className = 'particle';
      el.innerHTML = markup;
      var dur = (Math.random() * (maxDur - minDur) + minDur).toFixed(2) + 's';
      var delay = (-Math.random() * maxDur).toFixed(2) + 's';
      var drift = Math.round(Math.random() * 60 - 30) + 'px';
      var left = (Math.random() * 100).toFixed(1) + '%';
      el.style.left = left;
      el.style.animationName = animName;
      el.style.animationDuration = dur;
      el.style.animationDelay = delay;
      el.style.setProperty('--drift', drift);
      frag.appendChild(el);
    }
    container.appendChild(frag);
  }

  var snowflakeSVG = '<svg viewBox="0 0 24 24" width="14" height="14"><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="20" y1="7" x2="4" y2="17"/></g></svg>';
  var emberSVG = '<svg viewBox="0 0 24 24" width="10" height="10"><path d="M12 2C8 8 6 12 6 15a6 6 0 0 0 12 0c0-3-2-7-6-13z" fill="currentColor"/></svg>';

  if (!prefersReducedMotion) {
    spawnParticles(outsideParticles, snowflakeSVG, 18, 'snowfall', 9, 20);
    spawnParticles(insideParticles, emberSVG, 14, 'emberrise', 6, 13);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var isOutside = root.getAttribute('data-theme') !== 'inside';
      var next = isOutside ? 'inside' : 'outside';
      root.setAttribute('data-theme', next);
      if (themeLabel) themeLabel.textContent = next === 'outside' ? 'Outside' : 'Inside';
      if (outsideParticles) outsideParticles.hidden = next !== 'outside';
      if (insideParticles) insideParticles.hidden = next !== 'inside';
    });
  }

  /* ---------- Background music ---------- */
  var bgAudio = document.getElementById('bgAudio');
  var audioToggle = document.getElementById('audioToggle');

  if (bgAudio && audioToggle) {
    bgAudio.volume = 0.5;

    bgAudio.addEventListener('error', function () {
      audioToggle.hidden = true;
    }, true);

    audioToggle.addEventListener('click', function () {
      if (bgAudio.paused) {
        var playPromise = bgAudio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () { /* blocked or missing file -- stay paused */ });
        }
      } else {
        bgAudio.pause();
      }
    });
    bgAudio.addEventListener('play', function () {
      audioToggle.classList.add('playing');
      audioToggle.setAttribute('aria-pressed', 'true');
    });
    bgAudio.addEventListener('pause', function () {
      audioToggle.classList.remove('playing');
      audioToggle.setAttribute('aria-pressed', 'false');
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
  }
  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.hidden = true;
    lightboxImg.src = '';
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---------- Gallery (built lazily, on first visit to the view) ---------- */
  var galleryGrid = document.getElementById('galleryGrid');
  var galleryEmpty = document.getElementById('galleryEmpty');
  var TOTAL_PHOTOS = 30;
  var EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
  var loadedCount = 0;
  var settledCount = 0;
  var galleryInitialized = false;

  function settleCheck() {
    settledCount++;
    if (settledCount === TOTAL_PHOTOS && galleryEmpty) {
      galleryEmpty.hidden = loadedCount > 0;
    }
  }

  function tryLoadImage(fig, index, extIndex) {
    if (extIndex >= EXTENSIONS.length) {
      fig.remove();
      settleCheck();
      return;
    }
    var img = new Image();
    img.loading = 'lazy';
    img.alt = 'Photo ' + index;
    img.onload = function () {
      fig.innerHTML = '';
      fig.appendChild(img);
      fig.classList.add('loaded');
      loadedCount++;
      settleCheck();
    };
    img.onerror = function () {
      tryLoadImage(fig, index, extIndex + 1);
    };
    img.src = 'photos/' + index + '.' + EXTENSIONS[extIndex];
  }

  function initGalleryIfNeeded() {
    if (galleryInitialized || !galleryGrid) return;
    galleryInitialized = true;
    for (var n = 1; n <= TOTAL_PHOTOS; n++) {
      (function (index) {
        var fig = document.createElement('figure');
        fig.className = 'gallery-item';
        fig.addEventListener('click', function () {
          if (!fig.classList.contains('loaded')) return;
          var currentImg = fig.querySelector('img');
          if (currentImg) openLightbox(currentImg.src, currentImg.alt);
        });
        galleryGrid.appendChild(fig);
        tryLoadImage(fig, index, 0);
      })(n);
    }
  }

  /* ---------- View switching ---------- */
  var views = document.querySelectorAll('.view');
  var navLinks = document.querySelectorAll('.nav-link');
  var brandBtn = document.querySelector('.brand');

  function showView(id) {
    views.forEach(function (v) {
      if (v.id === id) {
        v.classList.add('active');
        v.classList.remove('view-anim');
        void v.offsetWidth;
        v.classList.add('view-anim');
      } else {
        v.classList.remove('active', 'view-anim');
      }
    });
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('data-view') === id;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (id === 'gallery') initGalleryIfNeeded();
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      showView(link.getAttribute('data-view'));
    });
  });

  document.querySelectorAll('[data-view-link]').forEach(function (el) {
    el.addEventListener('click', function () {
      showView(el.getAttribute('data-view-link'));
    });
  });

  if (brandBtn) {
    brandBtn.addEventListener('click', function () { showView('home'); });
  }

  /* ---------- Scroll-to-top ---------- */
  var scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 320);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });
  }

  /* ---------- Init ---------- */
  showView('home');
})();
