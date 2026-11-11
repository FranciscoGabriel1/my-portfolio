/* Base de movimento do protótipo B (adaptada de montar-site-mangue/assets/proto-base/base.js).
   Lenis (único smooth-scroll) + GSAP ScrollTrigger. Mudança em relação à base da skill:
   - ?nativo na URL desliga o Lenis, pra comparar com a rolagem nativa do navegador.
   Atributos: [data-split], [data-reveal], [data-parallax], [data-stack] > [data-card], .progress > i, [data-tilt].
   Expõe window.MT = { gsap, ScrollTrigger, lenis, reduceMotion }. */
(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  var params = new URLSearchParams(window.location.search);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) { console.warn('GSAP não carregou; página fica estática.'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.clearScrollMemory('manual');
  document.documentElement.classList.add('js');

  var lenis = null;
  if (!reduceMotion && window.Lenis && !params.has('nativo')) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  window.MT = { gsap: gsap, ScrollTrigger: ScrollTrigger, lenis: lenis, reduceMotion: reduceMotion };

  function splitWords(el) {
    if (el.dataset.splitReady === 'true') return;
    var text = el.textContent || '';
    el.setAttribute('aria-label', text.trim());
    var parts = text.split(/(\s+)/);
    el.textContent = '';
    parts.forEach(function (part) {
      if (!part.trim()) { el.appendChild(document.createTextNode(part)); return; }
      var mask = document.createElement('span'); mask.className = 'split-word-mask'; mask.setAttribute('aria-hidden', 'true');
      var word = document.createElement('span'); word.className = 'split-word'; word.textContent = part;
      mask.appendChild(word); el.appendChild(mask);
    });
    el.dataset.splitReady = 'true';
  }

  function initSplit() {
    gsap.utils.toArray('[data-split]').forEach(function (el) {
      if (reduceMotion) return;
      splitWords(el);
      var words = el.querySelectorAll('.split-word');
      var immediate = el.dataset.split === 'load';
      gsap.fromTo(words, { yPercent: 110, autoAlpha: 0 },
        Object.assign({ yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out', stagger: 0.05 },
          immediate ? { delay: 0.15 } : { scrollTrigger: { trigger: el, start: 'top 98%', once: true, refreshPriority: -1 } }));
    });
  }

  function initReveal() {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      if (reduceMotion) return;
      var targets = el.dataset.reveal === 'children' ? el.children : el;
      var immediate = el.dataset.revealOn === 'load';
      gsap.fromTo(targets, { y: 24, autoAlpha: 0 },
        Object.assign({ y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 },
          immediate ? { delay: 0.35 } : { scrollTrigger: { trigger: el, start: 'top 98%', once: true, refreshPriority: -1 } }));
    });
  }

  function initParallax() {
    if (reduceMotion) return;
    gsap.utils.toArray('[data-parallax]').forEach(function (layer) {
      var speed = Number(layer.dataset.speed || -0.12);
      var section = layer.closest('[data-parallax-section]') || layer;
      gsap.to(layer, { y: function () { return window.innerHeight * speed; }, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true, refreshPriority: -1 } });
    });
  }

  function initStack() {
    if (reduceMotion) return;
    gsap.utils.toArray('[data-stack]').forEach(function (stack) {
      var cards = gsap.utils.toArray(stack.querySelectorAll('[data-card]'));
      cards.forEach(function (card, i) {
        var next = cards[i + 1]; if (!next) return;
        gsap.to(card, { scale: 0.93 + i * 0.015, autoAlpha: 0.55, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 80%', end: 'top 20%', scrub: true, invalidateOnRefresh: true, refreshPriority: -1 } });
      });
    });
  }

  function initProgress() {
    var bar = document.querySelector('.progress > i'); if (!bar) return;
    if (reduceMotion) { bar.style.transform = 'none'; return; }
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3, refreshPriority: -1 } });
  }

  function initTilt() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    var els = gsap.utils.toArray('[data-tilt]'); if (!els.length) return;
    var setters = els.map(function (el) { return { x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }), k: Number(el.dataset.tilt || 10) }; });
    function reset() { setters.forEach(function (s) { s.x(0); s.y(0); }); }
    window.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      setters.forEach(function (s) { s.x(nx * s.k); s.y(ny * s.k); });
    }, { passive: true });
    window.addEventListener('blur', reset); document.addEventListener('visibilitychange', function () { if (document.hidden) reset(); });
  }

  // Âncoras internas passam pelo Lenis quando ele está ligado (senão, rolagem nativa).
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]:not([data-goto])').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var target = document.querySelector(id); if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -16 }); else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
      });
    });
  }

  function initStory() {
    var story = document.body.dataset.story;
    if (story && !document.querySelector('.story-chip')) {
      var chip = document.createElement('div');
      chip.className = 'story-chip';
      chip.innerHTML = '<b>História:</b> ';
      chip.appendChild(document.createTextNode(story));
      document.body.appendChild(chip);
    }
  }

  function toTop() {
    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  }

  function start() {
    toTop();
    initStory(); initSplit(); initReveal(); initParallax(); initStack(); initProgress(); initTilt(); initAnchors();
    if (typeof window.protoInit === 'function') window.protoInit(window.MT);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    ScrollTrigger.clearScrollMemory('manual');
    toTop();
    setTimeout(toTop, 60);
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
  window.addEventListener('pageshow', function (e) { if (e.persisted) { ScrollTrigger.refresh(); toTop(); requestAnimationFrame(toTop); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
