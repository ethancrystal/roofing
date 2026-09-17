/* =========================================================================
   NEXGEN EXTERIORS — interaction layer
   Vanilla JS, no dependencies. Every module fails soft: if its markup
   isn't on the page, it simply doesn't run.
   ========================================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const CALM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- preloader ------------------------------------------------ */
  const preloader = $('[data-preloader]');
  if (preloader) {
    const dismiss = () => preloader.classList.add('is-gone');
    if (CALM) dismiss();
    else window.addEventListener('load', () => setTimeout(dismiss, 900), { once: true });
    // never trap the page if `load` is slow
    setTimeout(dismiss, 4200);
  }

  /* ---------- the hero bird: settle it immediately when motion is off --- */
  const birdSvg = $('[data-birdsvg]');
  if (birdSvg && CALM && typeof birdSvg.pauseAnimations === 'function') {
    // jump past the flight so it's already perched, then hold
    try { birdSvg.setCurrentTime(6.2); birdSvg.pauseAnimations(); } catch (e) {}
  }

  /* ---------- header: stick, auto-hide, scroll progress ----------------- */
  const hdr  = $('[data-hdr]');
  const bar  = $('[data-progress] i');
  let lastY = 0, ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const doc = document.documentElement.scrollHeight - window.innerHeight;

    if (bar) bar.style.width = (doc > 0 ? (y / doc) * 100 : 0) + '%';

    if (hdr) {
      hdr.classList.toggle('is-stuck', y > 40);
      // only auto-hide well down the page, and never while the menu is open
      const menuOpen = $('[data-mnav]')?.classList.contains('is-open');
      hdr.classList.toggle('is-hidden', y > 620 && y > lastY && !menuOpen);
    }
    lastY = y;
    ticking = false;
  };
  const queueScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', queueScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------------------------------------------- */
  const burger = $('[data-burger]');
  const mnav   = $('[data-mnav]');
  if (burger && mnav) {
    const setMenu = (open) => {
      mnav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('is-locked', open);
    };
    burger.addEventListener('click', () => setMenu(!mnav.classList.contains('is-open')));
    $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- scroll reveal -------------------------------------------- */
  const rises = $$('[data-rise]');
  if (rises.length) {
    if (CALM || !('IntersectionObserver' in window)) {
      rises.forEach(el => el.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      rises.forEach(el => io.observe(el));
    }
  }

  /* ---------- scrollspy ------------------------------------------------- */
  const navLinks = $$('.nav a');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const targets = navLinks
      .map(a => ({ a, sec: $(a.getAttribute('href')) }))
      .filter(t => t.sec);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => a.classList.remove('is-on'));
        targets.find(t => t.sec === en.target)?.a.classList.add('is-on');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t.sec));
  }

  /* ---------- custom cursor + magnetic buttons -------------------------- */
  const cursor = $('[data-cursor]');
  if (cursor && FINE && !CALM) {
    const dot = $('.cursor__dot', cursor), ring = $('.cursor__ring', cursor);
    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-on');
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });

    (function ride() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(ride);
    })();

    $$('a, button, [data-tilt], summary, input[type=range]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hot'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hot'));
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
  }

  if (FINE && !CALM) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    /* card tilt — very restrained; this is a roofer, not a games studio */
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `translateY(-8px) rotateX(${-py * 3}deg) rotateY(${px * 3}deg)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- parallax -------------------------------------------------- */
  const paras = $$('[data-parallax]');
  if (paras.length && !CALM) {
    let pTick = false;
    const runPara = () => {
      const vh = window.innerHeight;
      paras.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-mid * speed).toFixed(2)}px, 0)`;
      });
      pTick = false;
    };
    window.addEventListener('scroll', () => { if (!pTick) { pTick = true; requestAnimationFrame(runPara); } }, { passive: true });
    window.addEventListener('resize', runPara);
    runPara();
  }

  /* ---------- service tabs ---------------------------------------------- */
  const svcTabs = $$('.svc__tab');
  if (svcTabs.length) {
    const imgs   = $$('[data-svc-imgs] img');
    const panels = $$('.svc__panel');

    const pick = (i) => {
      svcTabs.forEach((t, n) => {
        const on = n === i;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      imgs.forEach((im, n) => im.classList.toggle('is-on', n === i));
      panels.forEach((p, n) => { p.classList.toggle('is-on', n === i); p.hidden = n !== i; });
    };

    svcTabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(i));
      t.addEventListener('keydown', e => {
        const k = e.key;
        if (k !== 'ArrowDown' && k !== 'ArrowUp' && k !== 'Home' && k !== 'End') return;
        e.preventDefault();
        let n = i;
        if (k === 'ArrowDown') n = (i + 1) % svcTabs.length;
        if (k === 'ArrowUp')   n = (i - 1 + svcTabs.length) % svcTabs.length;
        if (k === 'Home')      n = 0;
        if (k === 'End')       n = svcTabs.length - 1;
        pick(n); svcTabs[n].focus();
      });
    });
  }

  /* ---------- before / after slider ------------------------------------- */
  const ba = $('[data-ba]');
  if (ba) {
    const clip   = $('[data-ba-clip]', ba);
    const handle = $('[data-ba-handle]', ba);
    let dragging = false;

    const sizeInner = () => ba.style.setProperty('--ba-w', ba.clientWidth + 'px');
    const place = (pct) => {
      pct = clamp(pct, 0, 100);
      clip.style.width  = pct + '%';
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', String(Math.round(pct)));
    };
    const fromEvent = (e) => {
      const r = ba.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      place((x / r.width) * 100);
    };

    sizeInner(); place(50);
    window.addEventListener('resize', sizeInner);

    const start = (e) => { dragging = true; fromEvent(e); };
    const move  = (e) => { if (dragging) { fromEvent(e); if (e.cancelable) e.preventDefault(); } };
    const end   = () => { dragging = false; };

    ba.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    ba.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
    // a hover scrub feels alive without needing a click
    ba.addEventListener('mousemove', e => { if (!dragging && FINE) fromEvent(e); });

    handle.addEventListener('keydown', e => {
      const now = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
      const step = e.shiftKey ? 10 : 3;
      if (e.key === 'ArrowLeft')  { place(now - step); e.preventDefault(); }
      if (e.key === 'ArrowRight') { place(now + step); e.preventDefault(); }
      if (e.key === 'Home')       { place(0);   e.preventDefault(); }
      if (e.key === 'End')        { place(100); e.preventDefault(); }
    });
  }

  /* ---------- process: sticky steps ------------------------------------- */
  const steps = $$('[data-proc-steps] .proc__step');
  if (steps.length && 'IntersectionObserver' in window) {
    const pImgs = $$('[data-proc-imgs] img');
    const badge = $('[data-proc-badge]');
    const labels = steps.map(s => $('h3', s)?.textContent.trim() || '');

    const show = (i) => {
      steps.forEach((s, n) => s.classList.toggle('is-on', n === i));
      pImgs.forEach((im, n) => im.classList.toggle('is-on', n === i));
      if (badge) {
        $('b', badge).textContent = String(i + 1).padStart(2, '0');
        $('span', badge).textContent = labels[i];
      }
    };

    const pio = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) show(+en.target.dataset.step); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => pio.observe(s));
  }

  /* ---------- counters --------------------------------------------------- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const render = (el, v) => {
      const dp = +(el.dataset.decimals || 0);
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })
                     + (el.dataset.suffix || '');
    };
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      if (CALM) { render(el, target); return; }
      const dur = 1700, t0 = performance.now();
      const tick = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);      // ease-out cubic, never linear
        render(el, target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else render(el, target);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => { if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(c => cio.observe(c));
    } else counters.forEach(run);
  }

  /* ---------- work: filter + lightbox ------------------------------------ */
  const grid = $('[data-work]');
  if (grid) {
    const cards = $$('.wk', grid);

    $$('.work__filters .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.work__filters .chip').forEach(c => {
          c.classList.remove('is-on');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('is-on');
        chip.setAttribute('aria-pressed', 'true');
        const f = chip.dataset.filter;
        cards.forEach(card => {
          const hit = f === 'all' || card.dataset.cat === f;
          card.classList.toggle('is-out', !hit);
          clearTimeout(card._t);
          if (!hit) card._t = setTimeout(() => card.classList.add('is-gone'), 380);
          else { card.classList.remove('is-gone'); }
        });
      });
    });

    const lb    = $('[data-lb]');
    const lbImg = $('[data-lb-img]');
    const lbCap = $('[data-lb-cap]');
    if (lb) {
      let opener = null;
      const open = (card) => {
        opener = card;
        const im = $('img', card);
        lbImg.src = im.src.replace(/w=\d+/, 'w=1800');
        lbImg.alt = im.alt;
        lbCap.textContent = $('figcaption b', card)?.textContent + ' — ' + $('figcaption span', card)?.textContent;
        lb.hidden = false;
        document.body.classList.add('is-locked');
        $('[data-lb-close]', lb).focus();
      };
      const close = () => {
        lb.hidden = true;
        document.body.classList.remove('is-locked');
        // send focus back where it came from, unless that card got filtered away
        const back = opener;
        opener = null;
        if (back?.isConnected && !back.classList.contains('is-gone')) back.focus();
      };

      cards.forEach(card => {
        card.addEventListener('click', () => open(card));
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
        });
      });
      $('[data-lb-close]', lb).addEventListener('click', close);
      lb.addEventListener('click', e => { if (e.target === lb) close(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
    }
  }

  /* ---------- estimate calculator ---------------------------------------- */
  const calc = $('[data-calc]');
  if (calc) {
    const state = { size: 2000, material: 5.6, storeys: 1, pitch: 1, tearoff: true };
    const sizeIn  = $('[data-c="size"]', calc);
    const tearIn  = $('[data-c="tearoff"]', calc);
    const outSize = $('[data-out="size"]', calc);
    const outVal  = $('[data-out="range"]', calc);
    const outSub  = $('[data-out="sub"]', calc);

    const fmt = (n) => '$' + (Math.round(n / 100) * 100).toLocaleString('en-US');

    const paint = () => {
      // slider fill
      const pct = ((state.size - +sizeIn.min) / (+sizeIn.max - +sizeIn.min)) * 100;
      sizeIn.style.setProperty('--fill', pct + '%');
      outSize.textContent = state.size.toLocaleString('en-US') + ' sq ft';

      const perSqFt = state.material + (state.tearoff ? 1.15 : 0);
      const base = state.size * perSqFt * state.storeys * state.pitch;
      const lo = base * 0.92, hi = base * 1.13;
      outVal.textContent = fmt(lo) + ' – ' + fmt(hi);
      outSub.textContent = state.tearoff
        ? 'Includes tear-off, disposal, underlayment, flashing and the 25-year warranty.'
        : 'Overlay on the existing roof. Includes underlayment, flashing and the 25-year warranty.';
    };

    sizeIn.addEventListener('input', () => { state.size = +sizeIn.value; paint(); });
    tearIn.addEventListener('change', () => { state.tearoff = tearIn.checked; paint(); });

    $$('[data-c-group]', calc).forEach(group => {
      const key = group.dataset.cGroup;
      $$('button', group).forEach(b => {
        b.addEventListener('click', () => {
          $$('button', group).forEach(x => x.classList.remove('is-on'));
          b.classList.add('is-on');
          state[key] = parseFloat(b.dataset.v);
          paint();
        });
      });
    });

    calc.addEventListener('submit', e => e.preventDefault());
    paint();
  }

  /* ---------- reviews carousel -------------------------------------------- */
  const rev = $('[data-rev]');
  if (rev) {
    const items = $$('.rev__i', rev);
    const dots  = $$('[data-rev-dots] button', rev);
    let i = 0, timer = null;

    const go = (n) => {
      i = (n + items.length) % items.length;
      items.forEach((it, k) => it.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    };
    const play = () => { if (!CALM) { stop(); timer = setInterval(() => go(i + 1), 7000); } };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };

    $('[data-rev-next]', rev)?.addEventListener('click', () => { go(i + 1); play(); });
    $('[data-rev-prev]', rev)?.addEventListener('click', () => { go(i - 1); play(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); play(); }));
    rev.addEventListener('mouseenter', stop);
    rev.addEventListener('mouseleave', play);
    rev.addEventListener('focusin', stop);
    play();
  }

  /* ---------- estimate form --------------------------------------------- */
  const form = $('[data-form]');
  if (form) {
    const done = $('[data-done]', form);

    const checkOne = (field) => {
      const wrap = field.closest('.inp');
      const err  = $('[data-err]', wrap || form);
      let msg = '';

      if (field.required && !field.value.trim()) {
        msg = 'This one we do need.';
      } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value)) {
        msg = 'That email looks off — mind checking it?';
      } else if (field.type === 'tel' && field.value && field.value.replace(/\D/g, '').length < 7) {
        msg = 'We need enough digits to call you back.';
      }

      if (wrap) wrap.classList.toggle('is-bad', !!msg);
      // the form is novalidate, so the invalid state and its reason have to be
      // exposed by hand or a screen reader never hears either
      field.setAttribute('aria-invalid', String(Boolean(msg)));
      if (err) {
        err.textContent = msg;
        if (msg) {
          if (!err.id) err.id = (field.id || field.name || 'field') + '-err';
          field.setAttribute('aria-describedby', err.id);
        } else {
          field.removeAttribute('aria-describedby');
        }
      }
      return !msg;
    };

    $$('input, select, textarea', form).forEach(f => {
      f.addEventListener('blur', () => checkOne(f));
      f.addEventListener('input', () => {
        if (f.closest('.inp')?.classList.contains('is-bad')) checkOne(f);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields = $$('input[required], select[required], textarea[required]', form);
      const ok = fields.map(checkOne).every(Boolean);
      if (!ok) {
        const bad = $('.inp.is-bad', form);
        bad?.scrollIntoView({ behavior: CALM ? 'auto' : 'smooth', block: 'center' });
        $('input, select, textarea', bad)?.focus();
        return;
      }
      if (done) { done.hidden = false; done.scrollIntoView({ behavior: CALM ? 'auto' : 'smooth', block: 'center' }); }
    });
  }

  /* ---------- smooth anchors (respects reduced motion) ------------------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - 86;
      window.scrollTo({ top, behavior: CALM ? 'auto' : 'smooth' });
    });
  });
})();
