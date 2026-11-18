/* Head & Tail Asia — shared interactions (no dependencies, works offline) */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* respect reduced motion: show the still frame instead of looping clips */
  if (reduce) document.querySelectorAll('video[autoplay]').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });

  function toast(msg) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 3600);
  }

  /* sticky header shadow */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* demo-1: keep header visible — pin it with a solid background after scrolling */
  const hdr1 = $('header.hdr');
  if (hdr1) {
    const ph = document.createElement('div'); ph.className = 'hdr-ph'; hdr1.after(ph);
    const dark = hdr1.classList.contains('hdr-dark');
    const pin = () => {
      const ann = $('.announce'); const lim = (ann ? ann.offsetHeight : 0) + (dark && innerWidth > 900 ? 320 : 0);
      const stuck = hdr1.classList.contains('is-stuck');
      if (scrollY > lim && !stuck) { if (!dark || innerWidth <= 900) ph.style.height = hdr1.offsetHeight + 'px'; hdr1.classList.add('is-stuck'); }
      else if (scrollY <= lim && stuck) { hdr1.classList.remove('is-stuck'); ph.style.height = '0'; }
    };
    pin(); addEventListener('scroll', pin, { passive: true }); addEventListener('resize', pin);
  }

  /* mobile nav */
  const tog = $('[data-nav-toggle]'), nav = $('[data-nav]');
  if (tog && nav) {
    tog.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      tog.setAttribute('aria-expanded', open);
      tog.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', e => { if (e.target.closest('a') && !e.target.closest('.dd-btn')) document.body.classList.remove('nav-open'); });
  }
  /* dropdown buttons */
  $$('.has-dd > button').forEach(b => b.addEventListener('click', () => {
    const li = b.parentElement, open = !li.classList.contains('open');
    $$('.has-dd.open').forEach(x => { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); });
    li.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
  }));
  document.addEventListener('click', e => { if (!e.target.closest('.has-dd')) $$('.has-dd.open').forEach(x => x.classList.remove('open')); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.has-dd.open').forEach(x => x.classList.remove('open')); document.body.classList.remove('nav-open'); } });

  /* pillar list: hovered item swaps the image */
  $$('[data-pillars]').forEach(l => {
    const imgs = $$('.pimg', l.closest('.pillars'));
    $$('[data-pillar]', l).forEach(a => a.addEventListener('mouseenter', () => imgs.forEach((im, j) => im.classList.toggle('is-active', j === +a.dataset.pillar + 1))));
    l.addEventListener('mouseleave', () => imgs.forEach((im, j) => im.classList.toggle('is-active', j === 0)));
  });

  /* rails + carousels with prev/next */
  $$('[data-rail], [data-carousel]').forEach(r => {
    const t = $('[data-track]', r) || $('.car-track', r); if (!t) return;
    const step = () => { const c = t.firstElementChild; return c ? c.getBoundingClientRect().width + 22 : 300; };
    const pv = $('[data-prev]', r), nx = $('[data-next]', r);
    if (pv) pv.addEventListener('click', () => t.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    if (nx) nx.addEventListener('click', () => t.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
  });

  /* reveal on scroll */
  const els = [];  /* the reference sites do not animate sections in */
  if ('IntersectionObserver' in window && !reduce) {
    els.forEach(el => el.classList.add('pre'));
    const io = new IntersectionObserver(ents => ents.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(el => io.observe(el));
  }

  /* count-up stats */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, t0 = performance.now();
      const step = now => { const k = Math.min(1, (now - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); co.unobserve(el);
    }), { threshold: 0.6 });
    counters.forEach(c => co.observe(c));
  }

  /* press logos switch the quote (demo 1) */
  $$('[data-press]').forEach(pr => {
    const bs = $$('[data-press-btn]', pr), qs = $$('[data-press-q]', pr);
    let k = 0, tm;
    const go = n => { k = (n + bs.length) % bs.length; bs.forEach((b, j) => b.classList.toggle('is-active', j === k)); qs.forEach((q, j) => q.classList.toggle('is-active', j === k)); };
    bs.forEach(b => b.addEventListener('click', () => { go(+b.dataset.pressBtn); clearInterval(tm); }));
    if (!reduce) tm = setInterval(() => go(k + 1), 6000);
  });

  /* testimonial slider (demo 2) */
  const slider = $('[data-slider]');
  if (slider) {
    const slides = $$('[data-slide]', slider), dots = $$('[data-dot]', slider);
    let i = 0, timer;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      $$('[data-slide-bg]', slider).forEach((b, k) => b.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    };
    dots.forEach(d => d.addEventListener('click', () => { go(+d.dataset.dot); restart(); }));
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 7000); };
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', restart);
    restart();
  }

  /* horizontal drag scrolling */
  $$('[data-scroller], [data-track], .car-track').forEach(sc => {
    let down = false, x0 = 0, s0 = 0, moved = false;
    sc.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = sc.scrollLeft; });
    window.addEventListener('pointerup', () => { down = false; sc.classList.remove('dragging'); });
    sc.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 5) { moved = true; sc.classList.add('dragging'); } sc.scrollLeft = s0 - dx; });
    sc.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* insights filter + search */
  const posts = $('[data-posts]');
  if (posts) {
    const cards = Array.from(posts.children).filter(c => c.dataset.cat), chips = $$('[data-filter]'), search = $('[data-search]');
    const label = $('[data-count-label]'), empty = $('[data-empty]');
    let cat = 'all';
    const params = new URLSearchParams(location.search);
    if (params.get('q') && search) search.value = params.get('q');
    const apply = () => {
      const q = (search && search.value || '').trim().toLowerCase();
      let n = 0;
      cards.forEach(c => {
        const ok = (cat === 'all' || c.dataset.cat === cat) && (!q || c.dataset.text.includes(q));
        c.hidden = !ok; if (ok) n++;
      });
      if (label) label.textContent = n + (n === 1 ? ' insight' : ' insights');
      if (empty) empty.hidden = n > 0;
    };
    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(c => c.classList.toggle('is-active', c === ch)); cat = ch.dataset.filter; apply();
    }));
    if (search) search.addEventListener('input', apply);
    apply();
  }

  /* health check */
  $$('[data-health]').forEach(form => {
    const svc = JSON.parse(form.dataset.health);
    const out = $('[data-health-result]', form);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const rows = $$('.hc-row', form);
      const missing = rows.filter(r => !$('input:checked', r));
      if (missing.length) {
        missing.forEach(r => r.classList.add('need'));
        toast('Please rate all ' + rows.length + ' statements.');
        missing[0].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      rows.forEach(r => r.classList.remove('need'));
      const dims = {};
      let total = 0;
      rows.forEach(r => { const v = +$('input:checked', r).value; total += v; (dims[r.dataset.dim] = dims[r.dataset.dim] || []).push(v); });
      const avg = Object.entries(dims).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length]).sort((a, b) => a[1] - b[1]);
      const pct = Math.round(total / (rows.length * 5) * 100);
      const band = pct >= 80 ? ['Strong foundations', 'Your business, sales and people systems look well connected. The opportunity is to sustain and scale what works.']
        : pct >= 60 ? ['Gaps are slowing you down', 'Several areas are working, but one or two gaps are likely holding back execution and growth.']
        : ['Execution is under pressure', 'Issues across strategy, sales and people are probably reinforcing one another. A focused diagnosis is the right first step.'];
      const focus = avg.slice(0, 2).map(([k]) => svc[k]).filter(Boolean);
      out.innerHTML = '<div class="hc-score"><b>' + pct + '%</b><span>' + band[0] + '</span></div><p>' + band[1] + '</p>' +
        '<p class="hc-focus-k">Where to look first:</p><ul class="hc-focus">' +
        focus.map(f => '<li><a href="' + f.url + '">' + f.name + ' →</a></li>').join('') + '</ul>' +
        '<p class="tiny">Want to talk it through? Mention your score when you get in touch.</p>';
      out.hidden = false;
      out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
    form.addEventListener('change', e => { const r = e.target.closest('.hc-row'); if (r) r.classList.remove('need'); });
  });

  /* newsletter (offline demo) */
  $$('[data-newsletter]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); f.reset(); toast('Thanks — you are on the list for Field Notes. (Demo: connect your email tool to go live.)');
  }));

  /* contact form → opens email app with details (offline demo) */
  const cf = $('[data-contact]');
  if (cf) cf.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', cf).filter(i => (i.type === 'checkbox' ? !i.checked : !i.value.trim()) || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
    $$('.invalid', cf).forEach(i => i.classList.remove('invalid'));
    if (bad.length) { bad.forEach(i => i.classList.add('invalid')); bad[0].focus(); toast('Please complete the highlighted fields.'); return; }
    const v = n => (cf.elements[n] && cf.elements[n].value || '').trim();
    const body = ['Name: ' + v('name'), 'Organisation: ' + v('organisation'), 'Role: ' + v('role'), 'Email: ' + v('email'),
      'Area: ' + (v('area') || 'Not sure yet'), '', 'Challenge:', v('challenge'), '', 'Preferred way/time: ' + v('when')].join('\n');
    location.href = 'mailto:ajit.jain.gsti@gmail.com?subject=' + encodeURIComponent('Business challenge — ' + v('organisation')) + '&body=' + encodeURIComponent(body);
    toast('Opening your email app with your message…');
  });
})();
