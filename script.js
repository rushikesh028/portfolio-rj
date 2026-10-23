(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var hdr = $('.hdr')[0], menu = $('.menu')[0], nav = document.getElementById('nav');
  var links = $('a', nav), motion = document.getElementById('motion');

  // Motion toggle (defaults to off when the system asks for reduced motion)
  var KEY = 'ra-motion';
  var off = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { if (localStorage.getItem(KEY)) off = localStorage.getItem(KEY) === 'off'; } catch (e) {}
  function setMotion(isOff) {
    root.classList.toggle('still', isOff);
    motion.textContent = isOff ? 'Motion off' : 'Motion on';
    try { localStorage.setItem(KEY, isOff ? 'off' : 'on'); } catch (e) {}
  }
  setMotion(off);
  motion.addEventListener('click', function () { setMotion(!root.classList.contains('still')); });

  // Mobile menu
  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  }
  menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
  links.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 760) setMenu(false); });

  // Header background on scroll
  function onScroll() { hdr.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Section fade-in
  var rv = $('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });

    // Highlight the nav link for the section in view
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean).forEach(function (s) { spy.observe(s); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  // "How I work" tabs
  var tabs = $('[role=tab]'), panels = $('[role=tabpanel]');
  function pick(i) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = (i + d + tabs.length) % tabs.length;
      pick(n);
      tabs[n].focus();
    });
  });

  // Hero spotlight follows the pointer (fine pointers only)
  var hero = $('.hero')[0];
  if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      if (root.classList.contains('still')) return;
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }
})();
