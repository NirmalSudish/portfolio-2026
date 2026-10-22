/**
 * Grid page: category filters, the full-screen viewer, clips that only play
 * while on screen, and entrances as cards arrive. The cards themselves are in
 * the HTML, so the page reads without this script.
 */
document.addEventListener('DOMContentLoaded', () => {
  const wall = document.getElementById('gridWall');
  if (!wall) return;
  const cards = Array.from(wall.querySelectorAll('.gcard'));
  const tabs = Array.from(document.querySelectorAll('.grid-tab'));
  const hasGsap = !!window.gsap;

  /* ---- category and brand: grid.html?cat=motion&brand=Four%20Seasons ---- */
  const CATS = {
    visual: { name: 'Visual design', intro: 'Key visuals, social content, posters and packaging for hotels, restaurants and brands across Dubai.' },
    motion: { name: 'Motion', intro: 'Reels, animated posters and motion pieces, made to move on screens and in feeds.' },
    '3d': { name: '3D', intro: 'Renders and studies built in three dimensions.' },
    experimental: { name: 'Experimental', intro: 'Photo manipulation and experiments, made off brief.' }
  };
  // The card names are mostly the client; these few are kinds of work, and
  // gather under one chip of their own.
  const BRAND = { 'Ivan Aaro, album art': 'Ivan Aaro', 'Crossing': 'The Crossing', 'Maison': 'Maison Matcha',
    'Student invitation': 'Yamanote Atelier', 'Jungle': 'The Jungle' };
  const OTHER = 'Other work';
  const KINDS = new Set(['Social media', 'Photo manipulation', '3D render', 'Packaging', 'Motion design', 'A5 motion design', 'Animated poster']);
  cards.forEach(c => {
    const name = c.querySelector('.gcard-title').textContent.trim();
    c.dataset.brand = KINDS.has(name) ? OTHER : (BRAND[name] || name);
  });
  const CAT_WORD = { visual: 'visual design', motion: 'motion', '3d': '3D', experimental: 'experiments' };

  const title = document.querySelector('.grid-title');
  const intro = document.querySelector('.grid-intro');
  const brandRow = document.getElementById('gridBrands');
  const ALL = { name: title.textContent, intro: intro.textContent.trim().replace(/\s+/g, ' ') };
  const params = new URLSearchParams(location.search);
  let cat = CATS[params.get('cat')] ? params.get('cat') : 'all';
  let brand = params.get('brand') && params.get('brand') !== OTHER ? params.get('brand') : null;
  // brand: null = no brand filter, '*' = every brand (client work only), else one brand
  const visible = c => (cat === 'all' || c.dataset.cat === cat)
    && (!brand || (brand === '*' ? c.dataset.brand !== OTHER : c.dataset.brand === brand));

  // The heading and its line follow the choice; the pills stay under it.
  function heading() {
    const c = CATS[cat] || ALL;
    let name = c.name, line = c.intro;
    if (brand) {
      const mine = cards.filter(visible), kinds = [...new Set(mine.map(x => CAT_WORD[x.dataset.cat]))];
      const list = kinds.join(', ').replace(/, ([^,]*)$/, ' and $1');
      name = brand === '*' ? 'Brands' : brand;
      line = brand === '*'
        ? `Work made for clients, in ${list}.`
        : `Everything made for ${brand}, in ${list}.`;
    }
    document.body.classList.toggle('is-cat', !!CATS[cat] || !!brand);
    title.textContent = name;
    intro.textContent = line;
    document.title = `${brand ? name : (CATS[cat] ? c.name : 'Grid')} — Nirmal Sudish`;
    const q = new URLSearchParams();
    if (CATS[cat]) q.set('cat', cat);
    if (brand) q.set('brand', brand);
    history.replaceState(null, '', 'grid.html' + (q.toString() ? '?' + q : ''));
  }

  // One chip per brand with work in the current category, most work first.
  // Only real brands: the self-initiated pieces, 3D and the experiments live
  // in their own categories, so on those tabs the row steps aside.
  function buildBrands() {
    if (!brandRow) return;
    const pool = cards.filter(c => (cat === 'all' || c.dataset.cat === cat) && c.dataset.brand !== OTHER);
    const counts = new Map();
    pool.forEach(c => counts.set(c.dataset.brand, (counts.get(c.dataset.brand) || 0) + 1));
    if (brand && brand !== '*' && !counts.has(brand)) brand = null;   // nothing of it in this category
    if (!counts.size) brand = null;
    brandRow.hidden = counts.size === 0;
    const list = [...counts].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
    const chip = (key, label, n) => `<button class="grid-brand${key === brand ? ' is-active' : ''}" type="button" data-brand="${key}" aria-pressed="${key === brand}">${label}</button>`;
    brandRow.innerHTML = `<span class="grid-brands-label">Brands</span>` + chip('*', 'All brands', pool.length) + list.map(([k, n]) => chip(k, k, n)).join('');
  }

  function syncTabs() {
    tabs.forEach(t => {
      const on = t.dataset.cat === cat;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  // Few pieces (one brand, a small category): the masonry would stack them
  // into one or two columns and leave the rest of the row empty. Laid out as
  // a single row instead, each card the width of a full-grid column, centred.
  function fitWall() {
    wall.classList.remove('is-few');
    wall.style.removeProperty('--col-w');
    const cols = parseInt(getComputedStyle(wall).columnCount, 10) || 1;
    const shown = cards.filter(c => !c.hidden).length;
    if (shown > cols) return;
    const cs = getComputedStyle(wall);
    const inner = wall.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const gap = parseFloat(cs.columnGap) || 0;
    wall.style.setProperty('--col-w', `${(inner - gap * (cols - 1)) / cols}px`);
    wall.classList.add('is-few');
  }
  addEventListener('resize', fitWall);

  buildBrands();
  cards.forEach(c => { c.hidden = !visible(c); });
  fitWall();
  syncTabs();
  if (CATS[cat] || brand) heading();

  // Escape goes back to the work, once the viewer is out of the way
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('lbx').hidden) location.href = 'index.html#works-stack';
  });

  /* ---- entrances: each card rises in as it reaches the screen ---- */
  // Not gated on reduce-motion, as on the homepage: the machine this was built
  // for reports it from a Windows visual-effects setting, not a preference.
  const rise = hasGsap && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => {
        const arriving = entries.filter(en => en.isIntersecting).map(en => en.target);
        if (!arriving.length) return;
        arriving.forEach(c => obs.unobserve(c));
        gsap.fromTo(arriving, { y: 48, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07, overwrite: true });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;
  if (rise) {
    const live = cards.filter(c => !c.hidden);
    gsap.set(live, { autoAlpha: 0 });
    live.forEach(c => rise.observe(c));
    // fromTo with an explicit end, not from(): the pills carry a CSS transition
    // on transform (their hover lift), and from() would read their resting
    // position mid-transition and settle them ~35px low, over the cards.
    // clearProps hands transform back to the stylesheet once they land.
    gsap.fromTo(['.grid-close', '.grid-title', '.grid-intro', '.grid-tab', '.grid-brands'], { y: 40, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.06, clearProps: 'transform'
    });
  }

  /* ---- clips play only while on screen ---- */
  const clips = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(en => {
        const v = en.target;
        if (en.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else v.pause();
      }), { threshold: 0.3 })
    : null;
  if (clips) wall.querySelectorAll('video').forEach(v => clips.observe(v));

  /* ---- filters ---- */
  function refilter() {
    heading();
    const leaving = cards.filter(c => !c.hidden && !visible(c));
    const done = () => {
      cards.forEach(c => { c.hidden = !visible(c); });
      fitWall();
      const shown = cards.filter(c => !c.hidden);
      if (hasGsap) {
        // everything now in the first screenful comes up together, in order
        const first = shown.filter(c => c.getBoundingClientRect().top < innerHeight * 1.2);
        gsap.fromTo(first, { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, overwrite: true });
        gsap.set(shown.filter(c => !first.includes(c)), { autoAlpha: 1, y: 0 });
      }
    };
    if (hasGsap && leaving.length) {
      gsap.to(leaving, { autoAlpha: 0, y: -20, duration: 0.25, ease: 'power2.in', stagger: 0.01, onComplete: done });
    } else done();
  }
  tabs.forEach(tab => tab.addEventListener('click', () => {
    if (tab.dataset.cat === cat) return;
    cat = tab.dataset.cat;
    syncTabs();
    buildBrands();          // keeps the brand if it has work here, else back to all
    refilter();
  }));
  if (brandRow) brandRow.addEventListener('click', e => {
    const b = e.target.closest('.grid-brand');
    if (!b) return;
    // pressing the lit chip again turns the brand filter off
    brand = b.dataset.brand === brand ? null : b.dataset.brand;
    brandRow.querySelectorAll('.grid-brand').forEach(x => {
      const on = x.dataset.brand === brand;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    refilter();
  });

  /* ---- viewer ---- */
  const lbx = document.getElementById('lbx');
  const stage = document.getElementById('lbxStage');
  let list = [], at = 0, back = null;

  function show(i) {
    at = (i + list.length) % list.length;
    const { key, i: k } = list[at];
    const it = GRID_LIBRARY[key][k];
    stage.innerHTML = (it.kind === 'video'
      ? `<video src="${it.src}"${it.poster ? ` poster="${it.poster}"` : ''} muted loop playsinline autoplay controls></video>`
      : `<img src="${it.src}" alt="${it.label}: ${it.desc || ''}">`)
      + `<figcaption class="lbx-cap">${it.label}${it.desc ? ` <em>${it.desc}</em>` : ''}<span>${at + 1} / ${list.length}</span></figcaption>`;
  }
  function open(btn) {
    // steps through what the current filter shows, in wall order
    list = cards.filter(c => !c.hidden).map(c => {
      const b = c.querySelector('.gcard-media');
      return { key: b.dataset.key, i: Number(b.dataset.i), btn: b };
    });
    back = btn;
    show(list.findIndex(x => x.btn === btn));
    lbx.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lbxClose').focus();
  }
  function close() {
    if (lbx.hidden) return;
    lbx.hidden = true;
    stage.innerHTML = '';
    document.body.style.overflow = '';
    if (back) back.focus({ preventScroll: true });
  }
  wall.addEventListener('click', e => { const b = e.target.closest('.gcard-media'); if (b) open(b); });
  document.getElementById('lbxPrev').addEventListener('click', () => show(at - 1));
  document.getElementById('lbxNext').addEventListener('click', () => show(at + 1));
  document.getElementById('lbxClose').addEventListener('click', close);
  lbx.addEventListener('click', e => { if (e.target === lbx) close(); });
  document.addEventListener('keydown', e => {
    if (lbx.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(at - 1);
    else if (e.key === 'ArrowRight') show(at + 1);
  });
  let tx = null;
  lbx.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lbx.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
    tx = null;
  });
});
