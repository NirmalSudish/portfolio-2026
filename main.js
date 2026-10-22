/**
 * NIRMAL SUDISH — MASTER PORTFOLIO LOGIC
 * Real-time Location/Time Engine, Interactive 3D Parallax & Micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const liveDateEl = document.getElementById('liveDate');
  const liveTimeEl = document.getElementById('liveTime');
  const contactClockEl = document.getElementById('contactLiveClock');
  const heroSection = document.getElementById('hero');
  const heroFrame = document.getElementById('heroFrame');
  const heroBgImg = document.getElementById('heroBgImg');
  const heroBgVideo = document.getElementById('heroBgVideo');
  const emailCopyBtn = document.getElementById('emailCopyBtn');
  const copyToast = document.getElementById('copyToast');

  // Contact lives only as the works stack's morph panel — anything outside
  // that scope (the logo flyout's Contact link) opens it through this hook,
  // which the works-stack block below fills in once it builds the panel.
  document.querySelectorAll('[data-open-contact]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('works-stack')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        if (typeof window.nsOpenContact === 'function') window.nsOpenContact();
      }, 620);
    });
  });

  /* ==========================================================================
     1. Live Brooklyn, NY Real-time Time & Date Engine
     ========================================================================== */
  function updateBrooklynTime() {
    try {
      const now = new Date();

      // Format Date: "SEP 7, 2026"
      const dateOptions = {
        timeZone: 'Asia/Dubai',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };
      const dateParts = new Intl.DateTimeFormat('en-US', dateOptions).formatToParts(now);
      const month = dateParts.find(p => p.type === 'month')?.value.toUpperCase() || 'SEP';
      const day = dateParts.find(p => p.type === 'day')?.value || '7';
      const year = dateParts.find(p => p.type === 'year')?.value || '2026';
      const formattedDate = `${month} ${day}, ${year}`;

      if (liveDateEl) {
        liveDateEl.textContent = formattedDate;
      }

      // Format Time: "9:34 AM"
      const timeOptions = {
        timeZone: 'Asia/Dubai',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(now).toUpperCase();

      if (liveTimeEl) {
        liveTimeEl.textContent = formattedTime;
      }
      if (contactClockEl) {
        contactClockEl.textContent = `${formattedTime} EDT`;
      }
    } catch (err) {
      console.warn('Timezone calculation error:', err);
    }
  }

  // Run immediately and update every second
  updateBrooklynTime();
  setInterval(updateBrooklynTime, 1000);

  /* ==========================================================================
     2. Hero Layer Composition — cut-out gate + multi-rate parallax
     ========================================================================== */

  // Background video: reveal only once it is actually playing. If the file is
  // absent, fails to decode, or the viewer has asked for less motion, the
  // poster image simply stays put.
  // Note on reduced motion: the parallax drift and the letter-rise below are
  // decorative and stay gated on it. The hero video is not — it is the artwork
  // itself, so gating it left anyone with OS animations disabled looking at a
  // still and no way to know why. It plays regardless.
  if (heroBgVideo) {
    {
      const revealVideo = () => {
        if (heroBgVideo.readyState >= 3) heroBgVideo.classList.add('is-ready');
      };

      ['playing', 'canplay', 'canplaythrough', 'loadeddata', 'timeupdate']
        .forEach(ev => heroBgVideo.addEventListener(ev, revealVideo));
      heroBgVideo.addEventListener('error', () => heroBgVideo.classList.remove('is-ready'), true);

      // The element can already be buffered and running by the time this script
      // executes, in which case those events have been and gone.
      revealVideo();

      // Autoplay can still be refused — a browser-level "block autoplay" setting,
      // battery saver, iOS low-power mode. Retry on the first real interaction,
      // and again if the tab was hidden when the page loaded.
      const tryPlay = () => {
        const attempt = heroBgVideo.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(() => {});
        }
      };

      const kickOnGesture = () => {
        if (heroBgVideo.paused) tryPlay();
        if (!heroBgVideo.paused) {
          ['pointerdown', 'keydown', 'scroll', 'touchstart']
            .forEach(ev => window.removeEventListener(ev, kickOnGesture));
        }
      };

      ['pointerdown', 'keydown', 'scroll', 'touchstart']
        .forEach(ev => window.addEventListener(ev, kickOnGesture, { passive: true }));

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && heroBgVideo.paused) tryPlay();
      });

      tryPlay();
    }
  }

  // The hero name was drawn in Haettenschweiler, which only Windows ships. Macs
  // fall back to Impact (23% wider at the same capital height) and phones to
  // Oswald (wider still, with 15% taller capitals, so the two lines collided).
  // So the face that actually renders is measured, and matched to the one the
  // composition was drawn in: line spacing from its real capital height, and a
  // horizontal scale so the name keeps Haettenschweiler's proportions. Where
  // Haettenschweiler itself renders, every correction is exactly zero.
  //
  // The stacked layout (phones, portrait tablets) also fits the name to the
  // screen width; the CSS places everything else from that one size.
  const heroCanvas = document.getElementById('heroCanvas');
  const stackedHero = window.matchMedia('(max-aspect-ratio: 9 / 10)');
  const DRAWN = { perEm: 2.387, cap: 0.71, lh: 0.7495 };   // Haettenschweiler, as measured
  let capCtx = null;
  function capRatio(el) {
    const cs = getComputedStyle(el);
    capCtx = capCtx || document.createElement('canvas').getContext('2d');
    capCtx.font = `${cs.fontWeight} 100px ${cs.fontFamily}`;
    return capCtx.measureText('NIRMALSUDISH').actualBoundingBoxAscent / 100 || DRAWN.cap;
  }
  function fitHeroName() {
    if (!heroCanvas) return;
    const hl = heroCanvas.querySelector('.hero-headline');
    if (!hl) return;
    ['--display-size', '--hl-w', '--hl-lh', '--hl-sx', '--meta-w', '--hx-logo', '--hx-eb', '--hx-r1', '--hx-name', '--hx-r2', '--hx-meta']
      .forEach(v => heroCanvas.style.removeProperty(v));
    const base = parseFloat(getComputedStyle(hl).fontSize);   // the stylesheet's own size
    hl.style.fontSize = '100px';
    const perEm = Math.max(...Array.from(hl.querySelectorAll('.hl-line'))
      .map(l => l.getBoundingClientRect().width)) / 100;
    hl.style.fontSize = '';
    if (!perEm) return;
    const cap = capRatio(hl);
    const sx = Math.min(1, (DRAWN.perEm / DRAWN.cap) / (perEm / cap));   // width per unit of capital height
    const lh = DRAWN.lh * cap / DRAWN.cap;
    const same = Math.abs(cap - DRAWN.cap) < 0.02 && sx > 0.97;

    if (stackedHero.matches) {
      const W = heroCanvas.clientWidth, H = heroCanvas.clientHeight;
      const shownPerEm = perEm * (same ? 1 : sx);
      // What sits above the name: logo, eyebrow and rule (style.css --name-y).
      const eyebrow = heroCanvas.querySelector('.hero-eyebrow');
      const above = 126 + 4.79 * (eyebrow ? parseFloat(getComputedStyle(eyebrow).fontSize) : 11);
      // as wide as the margins allow, but never so tall that the photograph
      // below it drops under about 40% of the screen
      const size = Math.max(40, Math.min(0.865 * W / shownPerEm, 0.2 * H, (0.6 * H - above - 14) / (2 * lh)));
      heroCanvas.style.setProperty('--display-size', `${size.toFixed(1)}px`);
      heroCanvas.style.setProperty('--hl-w', `${(size * shownPerEm).toFixed(1)}px`);
      heroCanvas.style.setProperty('--hl-lh', lh.toFixed(4));
      if (!same) heroCanvas.style.setProperty('--hl-sx', sx.toFixed(4));
      // The notch at the photo's foot is as wide as the place and time need.
      const meta = heroCanvas.querySelector('.hero-meta');
      if (meta) {
        const m = meta.getBoundingClientRect(), c = heroCanvas.getBoundingClientRect();
        heroCanvas.style.setProperty('--meta-w', `${Math.ceil(Math.max(0.3 * W, m.right - c.left + 18))}px`);
      }
    } else {
      if (!same) {
        // desktop composition in a stand-in face: same capital height, same width
        heroCanvas.style.setProperty('--display-size', `${(base * DRAWN.cap / cap).toFixed(2)}px`);
        heroCanvas.style.setProperty('--hl-lh', lh.toFixed(4));
        heroCanvas.style.setProperty('--hl-sx', sx.toFixed(4));
      }
      placeDesktopHero(same ? DRAWN.lh : lh, same ? DRAWN.cap : cap);
    }
  }

  // The desktop composition is set in percentages of the artwork, and two
  // window shapes break it. One much wider than the artwork crops its top and
  // bottom, taking the logo or the place and time with them; a short one
  // shrinks the small rows, which the stylesheet then holds at a readable
  // floor, so they outgrow their slots. Where either happens the rows are
  // re-placed inside what is visible and the name gives up just enough size
  // to keep its gaps. At ordinary sizes every value lands on its default and
  // nothing is set.
  function placeDesktopHero(lhRatio, capRatio) {
    const c = heroCanvas.getBoundingClientRect();
    const view = heroCanvas.parentElement.getBoundingClientRect();
    const H = c.height, crop = Math.max(0, (H - view.height) / 2);
    const at = pc => H * pc / 100;
    const q = sel => heroCanvas.querySelector(sel);
    const ebH = q('.hero-eyebrow').getBoundingClientRect().height;
    const metaH = q('.hero-meta').getBoundingClientRect().height;
    const size = parseFloat(getComputedStyle(q('.hero-headline')).fontSize);

    const logo = Math.max(at(2.237), crop + 14);
    // the logo is a 44px tap target on touch screens, so on a short one it
    // reaches the eyebrow's first row; the rows then start under it
    const lr = q('.hero-logo-wrap').getBoundingClientRect(), er = q('.hero-eyebrow').getBoundingClientRect();
    const underLogo = lr.right + 8 > er.left ? logo + lr.height + 12 : 0;
    const eb = Math.max(at(12.78), crop + 24, underLogo);
    const r1 = Math.max(at(23.154), eb + ebH + 14);
    const name = Math.max(at(29.754), r1 + 18);
    const meta = Math.min(at(84.72), H - crop - metaH - 22);
    const r2 = Math.min(at(80.537), meta - 16);
    // the name's ink runs from its cap-top to the second line's baseline
    const fit = (r2 - 12 - name) / (lhRatio + capRatio);

    const put = (k, v, d) => { if (Math.abs(v - d) > 0.5) heroCanvas.style.setProperty(k, `${v.toFixed(1)}px`); };
    put('--hx-logo', logo, at(2.237));
    put('--hx-eb', eb, at(12.78));
    put('--hx-r1', r1, at(23.154));
    put('--hx-name', name, at(29.754));
    put('--hx-r2', r2, at(80.537));
    put('--hx-meta', meta, at(84.72));
    if (fit < size - 0.5) heroCanvas.style.setProperty('--display-size', `${Math.max(40, fit).toFixed(1)}px`);
  }
  fitHeroName();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroName);
  window.addEventListener('resize', fitHeroName);
  if (stackedHero.addEventListener) stackedHero.addEventListener('change', fitHeroName);

  // The still plate drifts under the pointer; the video does not.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (hasFinePointer && !prefersReducedMotion && heroSection && heroFrame) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;  // -1 .. 1
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function renderParallax() {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;

      // Only the still plate drifts. The video carries the mask's step and notch
      // baked in, so it has to stay pinned to the frame or those blocks slide
      // out from under the clip-path.
      if (heroBgImg) {
        heroBgImg.style.transform =
          `scale(1.06) translate3d(${currentX * -10}px, ${currentY * -7}px, 0)`;
      }

      requestAnimationFrame(renderParallax);
    }

    renderParallax();
  }

  /* ==========================================================================
     3. Per-letter Heading Reveal
     ========================================================================== */

  // Wrap at runtime so the markup keeps a plain text node — the heading stays
  // readable to screen readers and to anyone editing the HTML. Masking is done
  // per word so a letter can never escape sideways past its neighbour.
  document.querySelectorAll('[data-reveal]').forEach(heading => {
    const text = heading.textContent.trim();
    heading.textContent = '';
    heading.setAttribute('aria-label', text);

    let i = 0;
    text.split(' ').forEach((word, w) => {
      if (w > 0) heading.appendChild(document.createTextNode(' '));

      const mask = document.createElement('span');
      mask.className = 'rv-word';
      mask.setAttribute('aria-hidden', 'true');

      [...word].forEach(ch => {
        const glyph = document.createElement('span');
        glyph.className = 'rv-glyph';
        glyph.textContent = ch;
        glyph.style.transitionDelay = `${i++ * 38}ms`;
        mask.appendChild(glyph);
      });

      heading.appendChild(mask);
    });
  });

  // Headings rise, hairlines draw across — both play once on entry.
  const revealTargets = [
    ...document.querySelectorAll('[data-reveal]'),
    ...document.querySelectorAll('[data-rule]')
  ];

  if (revealTargets.length) {
    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(el => el.classList.add('is-in'));
    } else {
      const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });

      revealTargets.forEach(el => revealObserver.observe(el));
    }
  }

  /* ==========================================================================
     5. Email Quick Copy & Toast Feedback
     ========================================================================== */
  if (emailCopyBtn) {
    emailCopyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'hello@nirmalsudish.com';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showToast();
        }).catch(() => {
          window.location.href = `mailto:${email}`;
        });
      } else {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  function showToast() {
    if (!copyToast) return;
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 2500);
  }

  /* ==========================================================================
     6. Works card stack

     Ported from the supplied reference. The one substantial change is input:
     that file is a full-page app and calls preventDefault on every wheel event,
     which inside a scrolling document would trap the page. Here the wheel is
     only swallowed while the section is roughly centred AND there is another
     card in that direction; at either end it falls through and the page scrolls
     on. Touch keeps vertical panning for the same reason — the stack is driven
     by horizontal drags instead.
     ========================================================================== */

  const wsStage = document.getElementById('wsStage');

  if (wsStage && !window.gsap) {
    // Cards, contact panel and project case studies all build below this
    // point, and every one of them needs GSAP — so if it never loaded (CDN
    // blocked, offline, script error) this logs why the section is empty
    // instead of just silently leaving it blank.
    console.error('GSAP failed to load — the works stack will not render. ' +
      'Check that vendor/gsap.min.js (or its CDN fallback) actually loaded.');
  }

  if (wsStage && window.gsap) {
    // Real work, carried over from the previous site. `images` are the frames
    // the card cycles through; `gallery` is the case study, in its own order.
    // `group` drives the category pills: ux = UI/UX & branding, print = print & packaging.
    const WS_PROJECTS = [
      {
        name: "Kaapi District",
        group: "ux",
        kicker: "Brand Identity & Web Design",
        year: "2022",
        role: "Art direction, Design, Web design",
        tags: ["Brand identity & web design", "2022"],
        description: "Kaapi District's branding evokes South India's traditional roasting houses with a vintage wordmark. The carefully designed merchandise, like T-shirts, cups, and coffee bags, captures the brand's essence, telling a story that celebrates the rich heritage of South Indian coffee culture with a blend of tradition and modernity.",
        link: null,
        images: ["assets/work/kaapi-district/kaapi_homepage.webp", "assets/work/kaapi-district/kaapi-district-brand-guidelines.gif", "assets/work/kaapi-district/kaapi-district-website.webp"],
        ratios: [1.574, 2.588, 0.661],
        gallery: [
          {"src": "assets/work/kaapi-district/kaapi-district-brand-guidelines.gif", "kind": "image", "w": 2500, "h": 966},
          {"src": "assets/work/kaapi-district/kaapi-district-website.webp", "kind": "image", "w": 1162, "h": 1759}
        ]
      },
      {
        name: "Northern Escape",
        group: "ux",
        kicker: "UX Case Study",
        year: "2023",
        role: "Art direction, Design, Web design",
        tags: ["UX case study", "2023"],
        description: "Northern Xscape Rentals is a jet ski and snowmobile rental company based in Ontario. Its specialty focuses on offering power sport equipment rentals. They provide their services in 3 different locations across Ontario.",
        link: {"href": "https://xd.adobe.com/view/f4577603-d9c1-4f9a-9b50-ffd8f1ceec70-a104/", "label": "View the prototype"},
        images: ["assets/work/northern-escape/northern-escape.webp", "assets/work/northern-escape/northern-escape1.webp", "assets/work/northern-escape/northern-escape2.webp"],
        ratios: [1.314, 1.418, 0.7],
        gallery: [
          {"src": "assets/work/northern-escape/northern-escape1.webp", "kind": "image", "w": 2400, "h": 1692},
          {"src": "assets/work/northern-escape/northern-escape2.webp", "kind": "image", "w": 1681, "h": 2400},
          {"src": "assets/work/northern-escape/northern-escape3.webp", "kind": "image", "w": 1393, "h": 2400},
          {"src": "assets/work/northern-escape/northern-escape4.webp", "kind": "image", "w": 1847, "h": 2400},
          {"src": "assets/work/northern-escape/northern-escape5.webp", "kind": "image", "w": 2400, "h": 2303}
        ]
      },
      {
        name: "Wisebot",
        group: "ux",
        kicker: "AI Chat Interface",
        year: "2023",
        role: "Product Design, UI/UX Case Study",
        tags: ["AI chat interface", "2023"],
        description: "WiseBot, an AI-powered help-line app that goes beyond the ordinary. Designed to be your trusty companion, WiseBot brings hope, guidance, and a wealth of valuable resources to those seeking support.",
        link: {"href": "https://xd.adobe.com/view/ee3a5e9d-cb06-4df8-849e-a3718a8313e1-bb69/", "label": "View the prototype"},
        images: ["assets/work/wisebot/wisebot-main.webp", "assets/work/wisebot/wisebot2.webp", "assets/work/wisebot/wisebot3.webp"],
        ratios: [1.486, 0.815, 0.933],
        gallery: [
          {"src": "assets/work/wisebot/wisebot2.webp", "kind": "image", "w": 1957, "h": 2400},
          {"src": "assets/work/wisebot/wisebot3.webp", "kind": "image", "w": 2239, "h": 2400},
          {"src": "assets/work/wisebot/wisebot4.webp", "kind": "image", "w": 2400, "h": 2337},
          {"src": "assets/work/wisebot/wisebot5.webp", "kind": "image", "w": 1774, "h": 2400},
          {"src": "assets/work/wisebot/wisebot6.webp", "kind": "image", "w": 2400, "h": 2337},
          {"src": "assets/work/wisebot/wisebot7.webp", "kind": "image", "w": 1506, "h": 2400},
          {"src": "assets/work/wisebot/wisebot8.webp", "kind": "image", "w": 1894, "h": 2400}
        ]
      },
      {
        name: "Goldie Bun",
        group: "ux",
        kicker: "Branding",
        year: "2025",
        role: "Branding, UI/UX",
        tags: ["Branding", "2025"],
        description: "Goldie Bun is a boutique burger concept that bridges the gap between fast-casual dining and premium craft quality.",
        link: null,
        images: ["assets/work/goldie-bun/goldiebun-main.webp", "assets/work/goldie-bun/goldiebun-2.webp", "assets/work/goldie-bun/goldiebun-1.webp"],
        ratios: [1.6, 1.499, 1.775],
        gallery: [
          {"src": "assets/work/goldie-bun/goldiebun-2.webp", "kind": "image", "w": 2400, "h": 1601},
          {"src": "assets/work/goldie-bun/goldiebun-1.webp", "kind": "image", "w": 2400, "h": 1352},
          {"src": "assets/work/goldie-bun/goldiebun-3.webp", "kind": "image", "w": 1450, "h": 1862}
        ]
      },
      {
        name: "Icons of Kerala",
        group: "ux",
        kicker: "Digital Art Collection",
        year: "2023",
        role: "Collaboration with Ashley Abraham",
        tags: ["Digital art collection", "2023"],
        description: "The concept behind this project was to pay homage to the place from which both of us draw our roots, Kerala.",
        link: null,
        images: ["assets/work/icons-of-kerala/iconsofkerala.webp", "assets/work/icons-of-kerala/iconsofkerala1.webp", "assets/work/icons-of-kerala/iconsofkerala2.webp"],
        ratios: [1.294, 1.294, 1.294],
        gallery: [
          {"src": "assets/work/icons-of-kerala/iconsofkerala1.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala2.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala3.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala4.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala5.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala6.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala7.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala8.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala9.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala10.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala11.webp", "kind": "image", "w": 2400, "h": 1855},
          {"src": "assets/work/icons-of-kerala/iconsofkerala12.webp", "kind": "image", "w": 2400, "h": 1855}
        ]
      },
      {
        name: "Magazine Layout",
        group: "print",
        kicker: "Magazine Layout & Design",
        year: "2024",
        role: "Editorial Design, Layout",
        tags: ["Magazine layout & design", "2024"],
        description: "A contemporary approach to fashion editorial design focusing on typography and whitespace.",
        link: null,
        images: ["assets/work/magazine-layout/magazine-1.webp", "assets/work/magazine-layout/magazine-main.webp", "assets/work/magazine-layout/magazine-2.webp"],
        ratios: [1.333, 1.0, 1.333],
        gallery: [
          {"src": "assets/work/magazine-layout/magazine-main.webp", "kind": "image", "w": 2400, "h": 2400},
          {"src": "assets/work/magazine-layout/magazine-2.webp", "kind": "image", "w": 2000, "h": 1500},
          {"src": "assets/work/magazine-layout/magazine-3.webp", "kind": "image", "w": 2000, "h": 1500}
        ]
      },
      {
        name: "Abu Crispy",
        group: "ux",
        kicker: "Brand Identity & Documentation",
        year: "2025",
        role: "Graphic Design, Branding",
        tags: ["Brand identity & documentation", "2025"],
        description: "Abu Crispy is a Dubai-based food truck serving up crispy, crave-worthy bites with a personality to match. The brief called for a full brand identity that could hold its own on the streets of Dubai and across social media simultaneously.",
        link: {"href": "assets/docs/abu-crispy-brand-guidelines.pdf", "label": "Read the brand guidelines"},
        images: ["assets/work/abu-crispy/abucrispy1.webp", "assets/work/abu-crispy/abucrispy2.webp", "assets/work/abu-crispy/abucrispy3.webp"],
        ratios: [1.6, 1.6, 1.6],
        gallery: [
          {"src": "assets/work/abu-crispy/abucrispy2.webp", "kind": "image", "w": 2400, "h": 1500},
          {"src": "assets/work/abu-crispy/abucrispy3.webp", "kind": "image", "w": 2400, "h": 1500},
          {"src": "assets/work/abu-crispy/abucrispy4.webp", "kind": "image", "w": 2400, "h": 1500},
          {"src": "assets/work/abu-crispy/abucrispy5.webp", "kind": "image", "w": 2400, "h": 1500},
          {"src": "assets/work/abu-crispy/abucrispy6.webp", "kind": "image", "w": 2400, "h": 1500},
          {"src": "assets/work/abu-crispy/abucrispy8.webp", "kind": "image", "w": 2400, "h": 1500},
          {"src": "assets/work/abu-crispy/abucrispy9.webp", "kind": "image", "w": 1600, "h": 1200},
          {"src": "assets/work/abu-crispy/abucrispy10.webp", "kind": "image", "w": 1340, "h": 800}
        ]
      },
      {
        name: "Novel Cafe",
        group: "ux",
        kicker: "Brand Identity & Documentation",
        year: "2025",
        role: "Graphic Design, Branding",
        tags: ["Brand identity & documentation", "2025"],
        description: "A full brand identity for Novel Cafe, a specialty café based in Sharjah. The direction was warm and refined built around a rich terracotta palette, a custom logo mark, and clean typography that feels both inviting and considered.",
        link: null,
        images: ["assets/work/novel-cafe/novelimg6.webp", "assets/work/novel-cafe/novelimg1.webp", "assets/work/novel-cafe/novelimg2.webp"],
        ratios: [1.778, 1.778, 1.778],
        gallery: [
          {"src": "assets/work/novel-cafe/novelimg1.webp", "kind": "image", "w": 1920, "h": 1080},
          {"src": "assets/work/novel-cafe/novelimg2.webp", "kind": "image", "w": 2400, "h": 1350},
          {"src": "assets/work/novel-cafe/novelimg3.webp", "kind": "image", "w": 2400, "h": 1350},
          {"src": "assets/work/novel-cafe/novelimg4.webp", "kind": "image", "w": 1920, "h": 1080},
          {"src": "assets/work/novel-cafe/novelimg7.webp", "kind": "image", "w": 960, "h": 1080}
        ]
      },
      {
        name: "Yamanote Cake Box",
        group: "print",
        kicker: "Packaging Design",
        year: "2025",
        role: "Graphic Design, Branding",
        tags: ["Packaging design", "2025"],
        description: "A specialty cake box packaging project for Yamanote Atelier, created in collaboration with Chef Nouel Catis. The design combines a vibrant orange and mint palette with fluid, drip-inspired shapes and intricate topographic patterns.",
        link: null,
        images: ["assets/work/yamanote-cake-box/cakeboxmain.webp", "assets/work/yamanote-cake-box/cakebox1.webp", "assets/work/yamanote-cake-box/cakebox2.webp"],
        ratios: [1.0, 1.2, 0.75],
        gallery: [
          {"src": "assets/work/yamanote-cake-box/cakebox1.webp", "kind": "image", "w": 2400, "h": 2000},
          {"src": "assets/work/yamanote-cake-box/cakebox2.webp", "kind": "image", "w": 1200, "h": 1600},
          {"src": "assets/work/yamanote-cake-box/cakebox3.webp", "kind": "image", "w": 1920, "h": 2400},
          {"src": "assets/work/yamanote-cake-box/cakebox4.webp", "kind": "image", "w": 1920, "h": 2400}
        ]
      },
      {
        name: "Yamanote Sharing Box",
        group: "print",
        kicker: "Packaging Design",
        year: "2025",
        role: "Graphic Design, Branding",
        tags: ["Packaging design", "2025"],
        description: "A packaging design project for Yamanote Atelier's sharing box range. The direction was soft and elegant — warm neutrals, a refined logo mark, and a scalloped seal that adds a handcrafted, artisanal touch.",
        link: null,
        images: ["assets/work/yamanote-sharing-box/sharingboxmain.webp", "assets/work/yamanote-sharing-box/sharingbox1.webp", "assets/work/yamanote-sharing-box/sharingbox2.webp"],
        ratios: [0.8, 0.8, 0.8],
        gallery: [
          {"src": "assets/work/yamanote-sharing-box/sharingbox1.webp", "kind": "image", "w": 1920, "h": 2400},
          {"src": "assets/work/yamanote-sharing-box/sharingbox2.webp", "kind": "image", "w": 1920, "h": 2400},
          {"src": "assets/work/yamanote-sharing-box/sharingbox3.webp", "kind": "image", "w": 1920, "h": 2400},
          {"src": "assets/work/yamanote-sharing-box/sharingbox4.webp", "kind": "image", "w": 1920, "h": 2400}
        ]
      },
      {
        name: "Osawa Biriyani in Dubai",
        group: "print",
        kicker: "Brand Identity & Menu Design",
        year: "2025",
        role: "Graphic Design, Branding",
        tags: ["Brand identity & menu design", "2025"],
        description: "A branding project for the Dubai pop-up of Biriyani Osawa, the Michelin Bib Gourmand biryani counter by Tokyo-based Chef Takamasa Osawa. The visual identity bridges South Asian culinary heritage with Japanese precision — rich crimson and gold, Japanese calligraphy, and editorial-style menu design that reflects the chef's meticulous craft.",
        link: null,
        images: ["assets/work/osawa-biriyani/osawamain.webp", "assets/work/osawa-biriyani/osawa4.webp", "assets/work/osawa-biriyani/osawa5.webp"],
        ratios: [1.164, 0.707, 0.705],
        gallery: [
          {"src": "assets/work/osawa-biriyani/osawa3.mp4", "kind": "video", "w": 640, "h": 1138, "poster": "assets/work/osawa-biriyani/osawa3_thumb.webp"},
          {"src": "assets/work/osawa-biriyani/osawa4.webp", "kind": "image", "w": 1697, "h": 2400},
          {"src": "assets/work/osawa-biriyani/osawa5.webp", "kind": "image", "w": 1692, "h": 2400},
          {"src": "assets/work/osawa-biriyani/osawa1.webp", "kind": "image", "w": 1692, "h": 2400}
        ]
      }
    ];

    const el = (tag, cls) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      return n;
    };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    /* ---- build ---- */

    // The card is a 3:2 rectangle. A frame near that shape fills it; one well
    // off it (a portrait, a square box, a very wide screen) is shown whole on
    // a dark mat instead of being cropped down to its middle.
    const CARD_RATIO = 3 / 2;
    const fitsCard = (r) => !r || (r / CARD_RATIO >= 0.8 && r / CARD_RATIO <= 1.25);

    function buildProject(project, index) {
      const card = el('article', 'ws-card');
      card.dataset.index = String(index);
      card.dataset.group = project.group;
      card.dataset.count = String(project.images.length);
      card._images = project.images;
      card._ratios = project.ratios || [];
      card._front = 0;
      card._shown = 0;

      const a = el('div', 'ws-photo is-front');
      a.style.backgroundImage = `url(${project.images[0]})`;
      a.classList.toggle('is-whole', !fitsCard(card._ratios[0]));
      const b = el('div', 'ws-photo');
      card.append(a, b, el('div', 'ws-veil'));

      const segs = el('div', 'ws-segs');
      project.images.forEach((_, i) =>
        segs.appendChild(el('span', 'ws-seg' + (i === 0 ? ' is-filled' : ''))));
      card.appendChild(segs);

      const title = el('h3', 'ws-title');
      title.textContent = project.name;
      card.appendChild(title);

      const prev = el('button', 'ws-arrow prev');
      prev.setAttribute('aria-label', 'Previous image');
      prev.innerHTML = '&#8249;';
      const next = el('button', 'ws-arrow next');
      next.setAttribute('aria-label', 'Next image');
      next.innerHTML = '&#8250;';
      card.append(prev, next);

      const bottom = el('div', 'ws-bottom');
      const tags = el('div', 'ws-tags');
      project.tags.forEach(t => {
        const s = el('span', 'ws-tag');
        s.textContent = t;
        tags.appendChild(s);
      });
      const open = el('button', 'ws-open');
      open.type = 'button';
      open.textContent = 'View project';
      open.addEventListener('click', e => { e.stopPropagation(); openProject(index, card); });
      bottom.append(open, tags);
      card.appendChild(bottom);

      // Desktop: the arrows step through this project's pictures. Phones and
      // tablets: they move to the previous or next project, the way a swipe does.
      prev.addEventListener('click', e => { e.stopPropagation(); if (stackedUI.matches) step(-1); else shiftImage(card, -1); });
      next.addEventListener('click', e => { e.stopPropagation(); if (stackedUI.matches) step(1); else shiftImage(card, 1); });

      // The whole card is the target; a drag that happened to end on it is not.
      card.addEventListener('click', () => {
        if (suppressClick) return;
        openProject(index, card);
      });

      return card;
    }

    function buildCta(index) {
      const card = el('article', 'ws-card is-cta');
      card.dataset.index = String(index);
      const h = el('h3');
      h.innerHTML = 'Let&rsquo;s work<br>together';
      const btn = el('button', 'ws-explore');
      btn.textContent = 'Get in touch';
      btn.addEventListener('click', e => { e.stopPropagation(); openMorph(true); });
      card.append(h, btn);
      return card;
    }

    // Every project gets its card once; the category pills then choose which of
    // them make up the live stack. projCards[i] is always WS_PROJECTS[i]'s own
    // card, whatever position it holds in the stack the visitor is looking at.
    const projCards = WS_PROJECTS.map((p, i) => wsStage.appendChild(buildProject(p, i)));
    const ctaCard = wsStage.appendChild(buildCta(WS_PROJECTS.length));
    const allCards = [...projCards, ctaCard];

    let cards = allCards.slice();
    let LAST = cards.length - 1;
    let activeGroup = 'all';
    const inGroup = (i) => activeGroup === 'all' || WS_PROJECTS[i].group === activeGroup;

    // Project dots + label are optional — degrades cleanly if #wsDots isn't
    // in the markup (navigation still works via the swipe/wheel/keys/arrows).
    const dotsWrap = document.getElementById('wsDots');
    if (dotsWrap) {
      WS_PROJECTS.forEach((p, i) => {
        const d = el('button', 'ws-dot');
        d.dataset.index = String(i);
        d.setAttribute('aria-label', p.name);
        d.addEventListener('click', () => goTo(i, i > current ? 1 : -1));
        dotsWrap.appendChild(d);
      });
    }
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.ws-dot')) : [];

    /* ---- per-card image cycling ---- */

    function shiftImage(card, delta) {
      const count = Number(card.dataset.count);
      if (!count) return;
      const target = clamp(card._shown + delta, 0, count - 1);
      if (target === card._shown) return;
      card._shown = target;

      const layers = card.querySelectorAll('.ws-photo');
      const visible = card._front;
      const hidden = visible === 0 ? 1 : 0;
      layers[hidden].style.backgroundImage = `url(${card._images[target]})`;
      layers[hidden].classList.toggle('is-whole', !fitsCard(card._ratios[target]));
      requestAnimationFrame(() => {
        layers[visible].classList.remove('is-front');
        layers[hidden].classList.add('is-front');
        card._front = hidden;
      });
      card.querySelectorAll('.ws-seg')
        .forEach((s, i) => s.classList.toggle('is-filled', i <= target));
    }

    // Every size: the card on top plays through its own pictures, one every
    // few seconds, back to the first after the last. (On desktop the arrows
    // are gone; on phones they move between projects.)
    let slideTimer = null;
    function restartSlides() {
      clearInterval(slideTimer);
      slideTimer = setInterval(() => {
        if (pjOpen || morphed || animating || document.hidden) return;
        const card = cards[current];
        if (!card || !card._images || card._images.length < 2) return;
        const r = wsStage.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const delta = card._shown >= card._images.length - 1 ? -card._shown : 1;
        // the next picture is loaded before the fade starts, so it never pops in
        const pre = new Image();
        pre.onload = pre.onerror = () => { if (cards[current] === card && !pjOpen) shiftImage(card, delta); };
        pre.src = card._images[card._shown + delta];
      }, 6500);
    }

    /* ---- stack state ---- */

    let current = 0;
    let animating = false;

    function paintChrome(idx) {
      allCards.forEach(c => c.classList.toggle('is-active', c === cards[idx] && !!c.dataset.count));
      dots.forEach(d => d.classList.toggle('is-active', Number(d.dataset.index) === idx));
      // a tick later: the first paint runs before the words below are defined
      queueMicrotask(() => paintHeading(idx));
    }

    // The heading and the line under it name the project on top and change
    // with it; on the closing card they invite contact instead.
    const wsHeadEl = document.getElementById('wsHeadline');
    const wsLedeEl = document.querySelector('.ws-lede');
    let headingKey = null, headingTimer = null;
    function paintHeading(idx) {
      if (!wsHeadEl || !wsLedeEl) return;
      const pi = projCards.indexOf(cards[idx]);
      const p = pi >= 0 ? WS_PROJECTS[pi] : null;
      const key = p ? p.name : 'cta';
      if (key === headingKey) return;
      const first = headingKey === null;
      headingKey = key;
      const title = p ? esc(p.name) : 'Let\u2019s work<br>together';
      const line = p ? esc((PJ_COPY[p.name] || {}).summary || p.description)
                     : 'Brand identities, packaging and interfaces for caf\u00e9s, hotels and brands. Tell me about yours.';
      const swap = () => {
        wsHeadEl.innerHTML = title;
        wsLedeEl.innerHTML = line;
        if (typeof fitWorks === 'function') fitWorks();
      };
      clearTimeout(headingTimer);
      if (first) { swap(); return; }
      [wsHeadEl, wsLedeEl].forEach(el => { el.style.transition = 'opacity 0.22s ease'; el.style.opacity = '0'; });
      headingTimer = setTimeout(() => {
        swap();
        [wsHeadEl, wsLedeEl].forEach(el => { el.style.opacity = ''; });
      }, 230);
    }

    gsap.set(cards[0], { autoAlpha: 1, x: 0, scale: 1, zIndex: 2 });
    cards.slice(1).forEach(c => gsap.set(c, { autoAlpha: 0, zIndex: 1 }));
    paintChrome(0);

    function goTo(next, dir) {
      next = clamp(next, 0, LAST);
      if (animating || next === current) return;
      animating = true;

      const from = cards[current];
      const to = cards[next];
      gsap.killTweensOf([from, to]);
      gsap.set(to, { zIndex: 3, x: dir > 0 ? '100%' : '-100%', scale: 0.96, autoAlpha: 1 });
      gsap.set(from, { zIndex: 2, opacity: 1, scale: 1 });

      gsap.timeline({
        onComplete() {
          gsap.set(from, { autoAlpha: 0, opacity: 1, scale: 1 });
          current = next;
          paintChrome(current);
          animating = false;
          restartSlides();       // a fresh project gets its full first beat
        }
      })
        .to(to, { x: '0%', scale: 1, duration: 0.6, ease: 'power3.out' }, 0)
        .to(from, { opacity: 0.0001, scale: 0.93, duration: 0.55, ease: 'power2.in' }, 0.05);
    }

    // Back to the first project, as a cross-fade in place rather than a slide
    // back through every card.
    function restartStack() {
      if (galleryMode || current === 0) return;
      const from = cards[current], to = cards[0];
      animating = true;
      gsap.set(to, { autoAlpha: 0, x: 0, scale: 1, zIndex: 3 });
      gsap.timeline({ onComplete() {
        gsap.set(from, { autoAlpha: 0, opacity: 1, scale: 1, x: 0, zIndex: 1 });
        gsap.set(to, { zIndex: 2 });
        current = 0;
        paintChrome(current);
        animating = false;
      } })
        .to(to, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .to(from, { opacity: 0.0001, duration: 0.4, ease: 'power1.in' }, 0);
    }

    const step = (dir) => {
      if (animating || pjOpen) return;
      if (dir > 0) {
        if (current < LAST) goTo(current + 1, 1);
        else if (!morphed) openMorph(true);      // past the last card -> contact
      } else {
        if (morphed) closeMorph();               // back out of contact first
        else if (current > 0) goTo(current - 1, -1);
      }
    };

    /* ---- contact morph ---- */

    const morph = document.getElementById('wsMorph');
    const morphLine = document.getElementById('wsMorphLine');
    const morphContact = document.getElementById('wsMorphContact');
    const morphClose = document.getElementById('wsMorphClose');
    let morphTl = null;
    let morphed = false;

    // Built fresh each time rather than once up front: it is seeded from the
    // CTA card's live rect, which moves with scroll position and resize.
    function buildMorphTl() {
      const rect = cards[LAST].getBoundingClientRect();
      gsap.set(morph, {
        visibility: 'visible',
        left: rect.left, top: rect.top,
        width: rect.width, height: rect.height,
        borderRadius: 20
      });
      gsap.set(morphLine, { opacity: 0, y: 0 });
      gsap.set(morphContact, { opacity: 0, y: 18 });
      gsap.set(morphClose, { opacity: 0 });

      return gsap.timeline({ paused: true })
        .to(morph, {
          left: 0, top: 0, width: () => innerWidth, height: () => innerHeight,
          borderRadius: 0, duration: 0.72, ease: 'power3.inOut'
        }, 0)
        .to(morphLine, { opacity: 1, y: -6, duration: 0.4, ease: 'power2.out' }, 0.34)
        .to(morphLine, { opacity: 0, duration: 0.25, ease: 'power1.in' }, 0.96)
        .to(morphContact, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 1.02)
        .to(morphClose, { opacity: 1, duration: 0.3 }, 1.15);
    }

    // fromEnd: reached by running past the last card (or its button), so closing
    // it starts the stack over from the first project.
    let morphFromEnd = false;
    function openMorph(fromEnd) {
      if (animating || morphed) return;
      animating = true;
      morphFromEnd = fromEnd === true;
      morphTl = buildMorphTl();
      morphTl.eventCallback('onComplete', () => {
        animating = false;
        morphed = true;
        morph.setAttribute('aria-hidden', 'false');
        morph.style.pointerEvents = 'auto';
        // the panel owns the screen, so stop the page scrolling behind it
        document.body.style.overflow = 'hidden';
        morphClose.focus();
      });
      morphTl.play(0);
    }

    function closeMorph() {
      if (animating || !morphed || !morphTl) return;
      animating = true;
      morph.style.pointerEvents = 'none';
      document.body.style.overflow = '';
      morphTl.eventCallback('onReverseComplete', () => {
        morph.style.visibility = 'hidden';
        morph.setAttribute('aria-hidden', 'true');
        morphed = false;
        animating = false;
        if (morphFromEnd) restartStack();
      });
      morphTl.reverse();
    }

    // The logo flyout's Contact link lives outside this scope, so it needs a
    // way in — same hook the old drawer used for the same link.
    window.nsOpenContact = () => openMorph(false);

    morphClose.addEventListener('click', closeMorph);
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const viewer = document.getElementById('lbx');
      if (viewer && !viewer.hidden) return;      // the viewer takes this one
      if (pjOpen) leaveProject();
      else if (morphed) closeMorph();
    });

    // Once open the panel covers the stage, so wheel events land here rather
    // than on the stage's handler — scrolling back has to be caught on the
    // panel itself or there would be no way out but the close button.
    let morphWheelLocked = false, morphWheelIdle = null;
    morph.addEventListener('wheel', (e) => {
      if (!morphed) return;
      e.preventDefault();
      clearTimeout(morphWheelIdle);
      if (!morphWheelLocked && Math.sign(e.deltaY) < 0) {
        morphWheelLocked = true;
        closeMorph();
      }
      morphWheelIdle = setTimeout(() => { morphWheelLocked = false; }, 260);
    }, { passive: false });

    /* ---- project case study -------------------------------------------------

       Clicking a card opens its case study. The panel is fixed and seeded with
       that card's live rect, so the open reads as the card itself growing into
       a page — the same move the contact morph makes, one layer up in z.
       Closing animates back to whichever card is currently on top, which is why
       the "next up" jump also advances the stack behind the panel.
       ------------------------------------------------------------------------ */

    const pjView = document.getElementById('pjView');
    const pjBody = document.getElementById('pjBody');
    const pjClose = document.getElementById('pjClose');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let pjOpen = false;
    let pjIndex = -1;
    let pjRect = null;

    const esc = (s) => String(s).replace(/&(?![a-z#0-9]+;)/gi, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Wrap each glyph in its own clipped box so the title can ride up per letter.
    function splitLetters(text) {
      return text.split(' ').map(word =>
        `<span class="pj-word">${
          word.split('').map(ch => `<span class="pj-lw"><span class="pj-l">${esc(ch)}</span></span>`).join('')
        }</span>`
      ).join(' ');
    }

    const ARROW = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
      '<path d="M1 11L11 1M11 1H3M11 1v8" stroke="currentColor" stroke-width="1.6"/></svg>';

    // Pictures carry their own shape (--r), so the stylesheet can fit each to
    // the screen. Images start on a blank and the panel loads them as they near
    // the screen (loadPjMedia): Safari's native lazy loading doesn't always
    // fire inside a scrolling panel, and left them showing their alt text.
    const BLANK = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E';
    const shape = (mm) => mm.w && mm.h ? ` width="${mm.w}" height="${mm.h}" style="--r:${(mm.w / mm.h).toFixed(4)}"` : '';
    const mediaHtml = (mm, alt) => mm.kind === 'video'
      ? `<video src="${mm.src}"${mm.poster ? ` poster="${mm.poster}"` : ''} muted loop playsinline autoplay preload="metadata"${shape(mm)}></video>`
      : `<img src="${BLANK}" data-src="${mm.src}" alt="${esc(alt)}" decoding="async"${shape(mm)}>`;

    let pjLoader = null;
    function loadPjMedia() {
      if (pjLoader) pjLoader.disconnect();
      const waiting = Array.from(pjBody.querySelectorAll('img[data-src]'));
      const show = (img) => { img.src = img.dataset.src; img.removeAttribute('data-src'); };
      if (!('IntersectionObserver' in window)) { waiting.forEach(show); return; }
      pjLoader = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        pjLoader.unobserve(en.target);
        show(en.target);
      }), { root: pjView, rootMargin: '150% 0px' });
      waiting.forEach((img) => pjLoader.observe(img));
    }

    const isPortrait = (mm) => mm.w && mm.h && mm.h > mm.w * 1.05;

    // The gallery is laid out from the pictures' own shapes: a landscape frame
    // runs wide (the first one edge to edge), and consecutive portraits sit in
    // rows that share one height: pairs, with a closing row of three when the
    // run is odd, so none is left on its own beside an empty half. A portrait
    // with no neighbour is held to the screen height.
    function galleryHtml(items, alt) {
      let html = '';
      const row = (list) => {
        const sum = list.reduce((t, m) => t + m.w / m.h, 0).toFixed(4);
        return `<figure class="pj-figure"><div class="pj-duo" style="--sum:${sum};--gaps:${list.length - 1}">${list.map(m => mediaHtml(m, alt)).join('')}</div></figure>`;
      };
      for (let i = 0; i < items.length; i++) {
        if (isPortrait(items[i])) {
          let j = i;
          while (j < items.length && isPortrait(items[j])) j++;
          const run = items.slice(i, j);
          if (run.length === 1) html += `<figure class="pj-figure is-portrait">${mediaHtml(run[0], alt)}</figure>`;
          else for (let k = 0; k < run.length;) {
            const take = run.length - k === 3 ? 3 : 2;
            html += row(run.slice(k, k + take));
            k += take;
          }
          i = j - 1;
        } else {
          html += `<figure class="pj-figure${i === 0 ? ' is-bleed' : ''}">${mediaHtml(items[i], alt)}</figure>`;
        }
      }
      return html;
    }

    // Words for each project: a one-line summary for the works panel's heading
    // and fuller case-study text, written from what the pictures show.
    const PJ_COPY = {
      'Kaapi District': {
        summary: 'A heritage coffee brand from South India: a roasting-house wordmark, brand guidelines and an online store.',
        more: ['The work runs from the mark itself, a roasting house drawn in line under an ESTD 2022 seal, to a brand standards manual set against the hills the coffee grows on.',
               'The identity then carries into the shop: an online store selling the brand\u2019s T-shirts, cups, mugs, paper bags and coffee packs, every product shot in the same warm palette.']
      },
      'Northern Escape': {
        summary: 'A booking app for jet ski and snowmobile rentals in Ontario, from user research to finished screens.',
        more: ['It starts with the problem: booking power-sport rentals online was slow, unclear and hard to trust. A persona, a young graphic designer chasing his next adrenaline rush, maps the goals and pain points the app has to answer.',
               'From there the work moves through low-fidelity wireframes and a type and colour system, built on the XIROD display face and a deep navy palette, to the final interface: browsing the machines, comparing prices and reserving in a few steps.']
      },
      'Wisebot': {
        summary: 'An AI help-line app offering support and guidance, designed from research and persona to high-fidelity screens.',
        more: ['Research came first: a competitive analysis of existing support apps, and a persona, Alex Joe, who struggled to find help that felt safe and approachable. A storyboard turned his day into the moments where the app should step in.',
               'The interface grew from low-fidelity wireframes into high-fidelity screens, set in Nunito with a calm palette of sky blues, around a friendly robot character that makes the conversation feel less clinical.']
      },
      'Goldie Bun': {
        summary: 'Branding for a boutique burger concept: a bottle-green script wordmark on kraft, from bags to the counter.',
        more: ['The identity pairs a hand-lettered Goldie Bun script with a bold, simple burger drawing, printed in one bottle green on natural kraft.',
               'It runs across takeaway bags, business cards, a poster with the line \u201cBite into happiness, one bun at a time\u201d and a green-tiled counter where the wordmark sits above the kitchen.']
      },
      'Icons of Kerala': {
        summary: 'A digital art collection of flat icons for everyday Kerala: the bus, the houseboat, the auto-rickshaw and chai.',
        more: ['It began with a mind map of what makes Kerala, its colours, tourism, everyday life, wildlife, food and history, and a concept board of the photographs behind each idea.',
               'Every icon follows the same rules: bold strokes, flat colour and a white offset border, drawn over a construction grid. The set includes the red-and-yellow KSRTC bus, the houseboat on the backwaters, the green auto-rickshaw and the steel tea pot with its glass of chai, each with a short story of its place in Kerala life.']
      },
      'Magazine Layout': {
        summary: 'An editorial feature on Eminem: bold type, black-and-white photography and plenty of white space.',
        more: ['The cover splits a black-and-white portrait with a stacked EM / IN / EM headline, and a darker alternative runs it as The Rap God.',
               'Inside, the spreads balance dense columns of text with large cut-out photographs, pull quotes in heavy type and generous margins, so the pages read like print rather than screen.']
      },
      'Abu Crispy': {
        summary: 'A full identity for a Dubai fried-chicken food truck, built around a cheeky chicken mascot in red and blue.',
        more: ['The mark is a chicken in sunglasses and a red cap, drumstick in hand, under an arched ABU CRISPY wordmark, drawn to work on the brand\u2019s blue and on its red.',
               'A brand guide sets out the fonts and the palette of red, orange, white, blue and yellow, and the identity is shown where it lives: wrapped around the red food truck and on the team\u2019s uniforms.']
      },
      'Novel Cafe': {
        summary: 'A warm, refined identity for a specialty caf\u00e9 in Sharjah, in terracotta and cream with a custom \u00d8 mark.',
        more: ['The logo replaces the O of NOVEL with a slashed circle, which also works alone as a stamp on coasters and cups.',
               'The terracotta runs through the caf\u00e9 itself, from the glass storefront to the bright counter and the staff aprons, and through the printed pieces: business cards, paper bags and takeaway cups.']
      },
      'Yamanote Cake Box': {
        summary: 'Packaging for a specialty cake by Yamanote Atelier and Chef Nouel Catis, in orange and mint with drip shapes.',
        more: ['The lid drips mint over orange like icing, and the sides carry a fine topographic pattern of the chef\u2019s monogram.',
               'The same language wraps a matching bottle, so the cake and its drink sit together as a set, finished on the cake itself with a chocolate seal pressed with the Yamanote mark.']
      },
      'Yamanote Sharing Box': {
        summary: 'A range of sharing boxes for Yamanote Atelier: natural board, a refined logo and a scalloped seal.',
        more: ['The boxes are built for a spread of croissants, mini burgers, sandwiches and wraps, divided into neat compartments and closed with a band and a scalloped Yamanote seal.',
               'Kept deliberately soft and warm, the board and cream tones let the food carry the colour.']
      },
      'Osawa Biriyani in Dubai': {
        summary: 'Branding and menus for Chef Takamasa Osawa\u2019s biryani pop-up in Dubai, Japanese calligraphy meeting South Asian heritage.',
        more: ['Chef Osawa runs a Michelin Bib Gourmand biryani counter in Tokyo. For his Dubai pop-up at Yamanote Atelier the identity sets his name in brush calligraphy, \u5927\u6fa4, beside crimson and gold.',
               'The work covers a lit wall sign, a launch poster with a QR code to book, an easel display, an editorial-style menu of the biryanis and sides, and a page telling the founder\u2019s story.']
      }
    };

    // Each case study is set in colours taken from its own pictures: ground,
    // ink, tint, and how much ink the secondary text keeps (mixed into the
    // ground). Every pair checked at 4.5:1 or better.
    const PJ_THEMES = {
      'Kaapi District':          ['#1f2b18', '#f3ead6', '#2b3a22', 0.75],   // the forest behind the roastery
      'Northern Escape':         ['#101b38', '#eaf0ff', '#1b2a52', 0.75],   // the app's navy
      'Wisebot':                 ['#e3f0fb', '#12304d', '#cde2f4', 0.75],   // its pale sky blue
      'Goldie Bun':              ['#dcc39d', '#1d3a32', '#cdb08a', 0.80],   // kraft bag, bottle-green print
      'Icons of Kerala':         ['#2c650a', '#f4f8e8', '#377a10', 0.80],   // Kerala green
      'Magazine Layout':         ['#1b1b1b', '#ededed', '#2a2a2a', 0.75],   // black and white editorial
      'Abu Crispy':              ['#0b4d92', '#fff4e6', '#0a5aa8', 0.75],   // the truck's blue
      'Novel Cafe':              ['#5a1d12', '#f4e9dd', '#6c2a1c', 0.75],   // terracotta
      'Yamanote Cake Box':       ['#ec8a2c', '#2a1406', '#df7a1f', 0.80],   // the box's orange
      'Yamanote Sharing Box':    ['#e8dcd2', '#2b2523', '#dacbbd', 0.75],   // warm neutral board
      'Osawa Biriyani in Dubai': ['#141310', '#e4c66e', '#24221b', 0.75]    // black lacquer and gold
    };
    const hexRgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    function themeProject(p) {
      ['--pj-ground', '--pj-ink', '--pj-tint', '--pj-muted', '--pj-rule'].forEach(v => pjView.style.removeProperty(v));
      const t = PJ_THEMES[p.name];
      if (!t) return;
      const [g, ink, tint, k] = t, G = hexRgb(g), I = hexRgb(ink);
      pjView.style.setProperty('--pj-ground', g);
      pjView.style.setProperty('--pj-ink', ink);
      pjView.style.setProperty('--pj-tint', tint);
      pjView.style.setProperty('--pj-muted', `rgb(${I.map((c, i) => Math.round(c * k + G[i] * (1 - k))).join(', ')})`);
      pjView.style.setProperty('--pj-rule', `rgba(${I.join(', ')}, 0.22)`);
    }

    function renderProject(index) {
      const p = WS_PROJECTS[index];
      themeProject(p);
      // "Next up" follows the stack the visitor is in, so a filtered view
      // never jumps to a project the pills have hidden.
      const order = WS_PROJECTS.map((_, i) => i).filter(inGroup);
      const nextIndex = order[(order.indexOf(index) + 1) % order.length];
      const nx = WS_PROJECTS[nextIndex];
      // Open on whichever frame the card was showing, so the seam is invisible.
      const card = projCards[index];
      const heroSrc = (card && card._images[card._shown]) || p.images[0];
      // That frame's own shape: upright screens size the hero from it (style.css)
      // so the artwork shows whole rather than cropped to a tall box.
      const heroRatio = Math.min(1.9, Math.max(0.8, p.ratios[(card && card._shown) || 0] || 1.5));
      const credits = [['Client', p.name], ['Project', p.kicker], ['Role', p.role], ['Year', p.year]];

      pjBody.innerHTML = `
        <div class="pj-hero" style="background-image:url(${heroSrc}); --pj-hero-ratio:${heroRatio}">
          <p class="pj-hero-tag">${esc(p.kicker)} &nbsp;/&nbsp; ${esc(p.year)}</p>
        </div>

        <div class="pj-doc">
          <h1 class="pj-title">${splitLetters(p.name)}</h1>

          <div class="pj-meta">
            <div>
              <p class="pj-label">${esc(p.kicker)}</p>
              <p class="pj-lede">${esc(p.description)}</p>
              ${((PJ_COPY[p.name] || {}).more || []).map(t => `<p class="pj-lede">${esc(t)}</p>`).join('')}
              ${p.link ? `<a class="pj-link" href="${p.link.href}" target="_blank" rel="noopener">
                ${esc(p.link.label)}${ARROW}</a>` : ''}
            </div>
            <div>
              <p class="pj-label">Credits</p>
              <div class="pj-credits">
                ${credits.map(([role, who]) =>
                  `<div class="pj-credit"><b>${esc(role)}</b><span>${esc(who)}</span></div>`).join('')}
              </div>
            </div>
          </div>

          <div class="pj-gallery">${galleryHtml(p.gallery, `${p.name}, ${p.kicker.toLowerCase()}`)}</div>

          ${nextIndex !== index ? `
          <div class="pj-next">
            <p class="pj-next-label">Next up</p>
            <button class="pj-next-btn" type="button" data-next="${nextIndex}">
              <h2 class="pj-next-title">${esc(nx.name)}</h2>
              <div class="pj-next-shot" style="background-image:url(${nx.images[0]})"></div>
            </button>
          </div>` : ''}
        </div>`;

      const nextBtn = pjBody.querySelector('.pj-next-btn');
      if (nextBtn) nextBtn.addEventListener('click', () => swapProject(nextIndex));
      loadPjMedia();

      pjIndex = index;
    }

    function openProject(index, fromCard) {
      if (!pjView || animating || pjOpen || morphed) return;
      animating = true;
      renderProject(index);
      // An entry of its own, so the phone's back gesture closes the case study
      // instead of leaving the site.
      history.pushState({ nsPj: true }, '');

      const card = fromCard || projCards[index];
      pjRect = card.getBoundingClientRect();
      const doc = pjBody.querySelector('.pj-doc');
      const letters = pjBody.querySelectorAll('.pj-l');

      gsap.set(pjView, {
        visibility: 'visible', pointerEvents: 'auto',
        left: pjRect.left, top: pjRect.top,
        width: pjRect.width, height: pjRect.height,
        borderRadius: 20
      });
      gsap.set(doc, { opacity: 0 });
      gsap.set(letters, { yPercent: reduceMotion ? 0 : 110 });

      const d = reduceMotion ? 0.01 : 1;
      gsap.timeline({
        onComplete() {
          pjOpen = true;
          animating = false;
          // Fluid from here, so a rotated phone or resized window keeps it full screen.
          gsap.set(pjView, { width: '100%', height: '100%' });
          pjView.classList.add('is-open');      // hands scrolling to the panel
          pjView.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          pjClose.classList.add('is-shown');
          pjClose.focus();
        }
      })
        .to(pjView, {
          left: 0, top: 0, width: () => innerWidth, height: () => innerHeight,
          borderRadius: 0, duration: 0.72 * d, ease: 'power3.inOut'
        }, 0)
        .to(doc, { opacity: 1, duration: 0.45 * d, ease: 'power2.out' }, 0.5 * d)
        .to(letters, { yPercent: 0, duration: 0.55 * d, ease: 'power3.out', stagger: 0.018 * d }, 0.56 * d)
        .to(pjClose, { opacity: 1, duration: 0.3 * d }, 0.72 * d);
    }

    function closeProject() {
      if (!pjView || !pjOpen || animating || !pjRect) return;
      animating = true;
      pjView.classList.remove('is-open');       // freeze the scroll during the shrink
      pjView.scrollTop = 0;
      pjClose.classList.remove('is-shown');
      document.body.style.overflow = '';
      // Shrink onto wherever the card is now; the screen may have turned since.
      if (cards[current]) pjRect = cards[current].getBoundingClientRect();

      gsap.timeline({
        onComplete() {
          pjView.style.visibility = 'hidden';
          pjView.style.pointerEvents = 'none';
          pjView.setAttribute('aria-hidden', 'true');
          pjBody.innerHTML = '';
          pjOpen = false;
          pjIndex = -1;
          animating = false;
          wsStage.focus({ preventScroll: true });
        }
      })
        .to(pjClose, { opacity: 0, duration: 0.2 }, 0)
        .to(pjBody.querySelector('.pj-doc'), { opacity: 0, duration: 0.25 }, 0)
        .to(pjView, {
          left: pjRect.left, top: pjRect.top,
          width: pjRect.width, height: pjRect.height,
          borderRadius: 20, duration: (reduceMotion ? 0.01 : 0.62), ease: 'power3.inOut'
        }, 0.06);
    }

    // "Next up" swaps the case study in place and moves the stack behind it, so
    // closing still drops back onto the card you are actually looking at.
    function swapProject(index) {
      if (!pjOpen || animating) return;
      animating = true;

      gsap.to(pjBody, {
        opacity: 0, duration: reduceMotion ? 0.01 : 0.28, ease: 'power1.in',
        onComplete() {
          renderProject(index);
          pjView.scrollTop = 0;

          const pos = cards.indexOf(projCards[index]);
          if (pos !== -1 && pos !== current) {
            gsap.set(cards[current], { autoAlpha: 0, opacity: 1, scale: 1, x: 0 });
            current = pos;
            gsap.set(cards[current], { autoAlpha: 1, opacity: 1, scale: 1, x: 0, zIndex: 2 });
            paintChrome(current);
          }
          pjRect = cards[current].getBoundingClientRect();

          const letters = pjBody.querySelectorAll('.pj-l');
          gsap.set(pjBody.querySelector('.pj-doc'), { opacity: 1 });
          gsap.set(letters, { yPercent: reduceMotion ? 0 : 110 });
          gsap.to(pjBody, { opacity: 1, duration: reduceMotion ? 0.01 : 0.34 });
          gsap.to(letters, {
            yPercent: 0, duration: reduceMotion ? 0.01 : 0.55, ease: 'power3.out',
            stagger: reduceMotion ? 0 : 0.018,
            onComplete() { animating = false; }
          });
        }
      });
    }

    // The close button and Escape step back through the entry the open pushed,
    // so closing and the back gesture are one path.
    function leaveProject() {
      if (history.state && history.state.nsPj) history.back();
      else closeProject();
    }
    window.addEventListener('popstate', () => { if (pjOpen) closeProject(); });

    if (pjClose) pjClose.addEventListener('click', leaveProject);

    // Any picture in a case study, the hero included, opens full screen in the
    // viewer, which then steps through that project's pictures in page order.
    if (pjBody) pjBody.addEventListener('click', (e) => {
      const hit = e.target.closest('.pj-hero, .pj-figure img, .pj-figure video');
      if (!hit || !window.nsLibrary || !pjOpen) return;
      const name = WS_PROJECTS[pjIndex].name;
      const media = Array.from(pjBody.querySelectorAll('.pj-hero, .pj-figure img, .pj-figure video'));
      const items = media.map(el => el.classList.contains('pj-hero')
        ? { src: (el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1], kind: 'image', label: name }
        : { src: el.getAttribute('data-src') || el.getAttribute('src'), kind: el.tagName === 'VIDEO' ? 'video' : 'image', poster: el.getAttribute('poster'), label: name });
      window.nsLibrary.openList(items, media.indexOf(hit), hit);
    });

    /* ---- input ---- */

    // The section docks to the middle of the viewport before the wheel is
    // handed to the cards. Capturing the wheel as soon as the stage was roughly
    // in view used to freeze the page wherever it happened to be, so where the
    // section came to rest depended on the window size and the scroll speed.
    //
    // What gets centred is the content (.ws-inner) when it fits the viewport;
    // on short or stacked layouts where it doesn't, it's the stage, since the
    // cards are what the wheel is about to drive. The listener sits on the
    // window, so the pointer doesn't have to be over the cards.
    const wsSection = document.getElementById('works-stack') || wsStage;
    const wsInner = wsSection.querySelector('.ws-inner') || wsStage;
    const DOCK_TOL = 3;

    const singleColumn = () => getComputedStyle(wsInner).gridTemplateColumns.trim().split(/\s+/).length < 2;

    // Where the section comes to rest. When it all fits it is centred. When it
    // doesn't (one column on phones and tablets, the copy above the cards),
    // the cards rest at the foot of the screen with as much of the copy above
    // them as fits, instead of centred over a band of empty page below.
    function dockPlan() {
      const vh = innerHeight, m = Math.max(14, Math.min(32, vh * 0.035));
      const inner = wsInner.getBoundingClientRect();
      if (inner.height <= vh) return { el: wsInner, at: (vh - inner.height) / 2 };
      if (!singleColumn()) return { el: wsInner, at: m };        // two columns, still too tall
      const st = wsStage.getBoundingClientRect();
      if (st.height > vh - 2 * m) return { el: wsStage, at: (vh - st.height) / 2 };
      return { el: wsStage, at: vh - m - st.height };
    }
    const dockTarget = () => dockPlan().el;

    // Signed px the page has to scroll to bring the target to its place,
    // clamped to what the document can actually scroll.
    function dockOffset() {
      const p = dockPlan(), r = p.el.getBoundingClientRect();
      const want = scrollY + r.top - p.at;
      const max = document.documentElement.scrollHeight - innerHeight;
      return Math.max(0, Math.min(max, want)) - scrollY;
    }

    // In play once at least half the target is on screen.
    function engaged() {
      const r = dockTarget().getBoundingClientRect();
      const visible = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      return visible >= Math.min(r.height, innerHeight) * 0.5;
    }

    // The section is the last thing on the page, so the page can only bring the
    // target to its place if there's enough page left below it. Wherever there
    // isn't, the section's bottom padding is topped up by exactly the shortfall.
    function fitDockRoom() {
      wsSection.style.paddingBottom = '';
      const base = parseFloat(getComputedStyle(wsSection).paddingBottom) || 0;
      const p = dockPlan(), t = p.el.getBoundingClientRect();
      const below = wsSection.getBoundingClientRect().bottom - t.bottom;
      const need = innerHeight - p.at - t.height;
      if (below < need) wsSection.style.paddingBottom = `${base + need - below}px`;
    }

    // Two columns: the heading is sized by the window's width, so on a short
    // screen (a laptop, under the browser's own bars) the copy beside the cards
    // ran taller than the window and docking cut its top and bottom. It is
    // scaled down just enough for the column to fit.
    const wsHead = wsSection.querySelector('.ws-headline');
    const wsPanel = wsSection.querySelector('.ws-panel');
    // One column (phones, tablets): the whole block, heading to card, is fitted
    // to one screen the same way, so it can be seen at once. Measured against
    // the screen with the browser's bars showing (100svh), so the fit holds
    // still while Safari's toolbar slides in and out.
    const svhProbe = document.createElement('div');
    svhProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(svhProbe);
    function fitWorksHead() {
      if (!wsHead || !wsPanel) return;
      wsHead.style.fontSize = '';
      wsStage.style.width = '';
      wsStage.style.marginInline = '';
      const vh = svhProbe.offsetHeight || innerHeight;
      const single = singleColumn();
      const room = vh - 2 * (single ? 14 : Math.max(16, Math.min(40, vh * 0.045)));
      const block = () => (single ? wsInner : wsPanel).getBoundingClientRect().height;
      let over = block() - room;
      if (over <= 0) return;
      // the heading gives first, down to a floor that keeps it a display size
      const fs = parseFloat(getComputedStyle(wsHead).fontSize);
      const hh = wsHead.getBoundingClientRect().height;
      const floor = single ? Math.max(40, Math.min(64, vh * 0.075)) : 56;
      wsHead.style.fontSize = `${Math.max(floor, fs * (hh - over) / hh).toFixed(1)}px`;
      over = block() - room;
      if (over <= 0 || !single) return;
      // then, one column only, the card narrows (keeping its shape) for the rest
      const st = wsStage.getBoundingClientRect();
      wsStage.style.width = `${Math.max(st.width * 0.55, st.width * (st.height - over) / st.height).toFixed(1)}px`;
      wsStage.style.marginInline = 'auto';
    }
    function fitWorks() { fitWorksHead(); fitDockRoom(); }
    fitWorks();
    window.addEventListener('resize', fitWorks);
    if (document.fonts) document.fonts.ready.then(fitWorks);
    window.addEventListener('load', fitWorks);

    let docking = false, dockTimer = null;
    function dock() {
      const off = dockOffset();
      if (Math.abs(off) <= DOCK_TOL) return;
      docking = true;
      window.scrollTo({ top: scrollY + off, behavior: 'smooth' });
      clearTimeout(dockTimer);
      dockTimer = setTimeout(() => { docking = false; }, 900);  // if scrollend never comes
    }
    window.nsWorks = { dock };   // lets the layout checks dock it as a visitor would

    // Holds the cards still while a burst of wheel events (trackpad momentum)
    // is still arriving, so one flick moves one card and the glide into place
    // doesn't spill over into an advance.
    let wheelLocked = false, wheelIdle = null;
    const holdWheel = () => {
      wheelLocked = true;
      clearTimeout(wheelIdle);
      wheelIdle = setTimeout(() => { wheelLocked = false; }, 260);
    };

    // Desktops and laptops only: a mouse or trackpad on a wide screen. Anywhere
    // else the wheel (a tablet's trackpad, a small window) just scrolls the page.
    const desktopUI = window.matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)');
    const stackedUI = window.matchMedia('(max-width: 1024px)');
    restartSlides();
    window.addEventListener('wheel', (e) => {
      if (!desktopUI.matches) return;
      if (pjOpen || morphed) return;         // those panels handle their own wheel
      if (docking) { e.preventDefault(); holdWheel(); return; }
      if (!engaged()) return;                // page scrolls normally
      const dir = Math.sign(e.deltaY);
      if (!dir) return;

      const off = dockOffset();
      if (Math.abs(off) > DOCK_TOL) {
        // Off-centre: scrolling toward the middle docks it; scrolling away is
        // left alone, so the section never traps you on the way out.
        if (Math.sign(off) === dir) { e.preventDefault(); dock(); holdWheel(); }
        return;
      }

      // Docked, gallery showing: the wheel scrolls it sideways. Back at the
      // start lets the page go; carrying on past the end, after a pause,
      // opens contact the same way the last card does.
      if (galleryMode) {
        if (dir < 0) return;
        e.preventDefault();
        if (dir > 0 && gAtEnd()) { if (!wheelLocked) openMorph(true); holdWheel(); return; }
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        gMove(-delta * (e.deltaMode === 1 ? 40 : 1.15), 0.7);
        holdWheel();
        return;
      }

      // Docked: scrolling down moves through the projects (and on to contact);
      // scrolling up always gives the page back. The arrow keys go both ways.
      if (dir < 0) return;
      e.preventDefault();
      if (!wheelLocked) step(dir);
      holdWheel();
    }, { passive: false });

    // Touch, keys and the scrollbar don't come through the wheel, so the same
    // docking also runs when any scroll comes to rest — but only if it was
    // heading toward the section, never pulling someone back who is leaving.
    let lastY = scrollY, lastDir = 0;
    window.addEventListener('scroll', () => {
      const d = Math.sign(scrollY - lastY);
      if (d) lastDir = d;
      lastY = scrollY;
    }, { passive: true });

    const settle = () => {
      docking = false;
      // Phones and tablets settle only when the whole block fits the screen
      // (it is fitted to), so the jump never slices the heading.
      if (!desktopUI.matches && wsInner.getBoundingClientRect().height > innerHeight) return;
      if (pjOpen || morphed || !engaged()) return;
      const off = dockOffset();
      if (Math.abs(off) > DOCK_TOL && Math.sign(off) === lastDir) dock();
    };
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', settle);
    } else {
      let settleT = null;
      window.addEventListener('scroll', () => {
        clearTimeout(settleT);
        settleT = setTimeout(settle, 150);
      }, { passive: true });
    }

    // Horizontal drag, so vertical touch panning still scrolls the page.
    let dragX = null, dragging = false, suppressClick = false;
    wsStage.addEventListener('pointerdown', (e) => {
      if (galleryMode || e.target.closest('button')) return;
      dragging = true;
      suppressClick = false;
      dragX = e.clientX;
    });
    // Capture only once it is really a drag: capturing on press retargets the
    // click to the stage, and the card under the pointer never hears it.
    wsStage.addEventListener('pointermove', (e) => {
      if (!dragging || wsStage.hasPointerCapture(e.pointerId)) return;
      if (Math.abs(e.clientX - dragX) > 8) wsStage.setPointerCapture(e.pointerId);
    });
    wsStage.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = dragX - e.clientX;
      suppressClick = Math.abs(dx) > 8;      // a drag, not a click on the card
      if (Math.abs(dx) > 55) step(dx > 0 ? 1 : -1);
    });
    wsStage.addEventListener('pointercancel', () => { dragging = false; });

    // A "View project" pill rides with the mouse over a project card, in the
    // site's brown and yellow. Desktops and laptops only; it steps aside over the card's own
    // buttons, while dragging, and once a case study or contact is open.
    {
      const pill = document.createElement('div');
      pill.className = 'ws-cursor';
      pill.setAttribute('aria-hidden', 'true');
      pill.innerHTML = '<span>View project</span>';
      document.body.appendChild(pill);
      gsap.set(pill, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
      const ease = reduceMotion ? 0.01 : 0.35;
      const toX = gsap.quickTo(pill, 'x', { duration: ease, ease: 'power3' });
      const toY = gsap.quickTo(pill, 'y', { duration: ease, ease: 'power3' });
      let shown = false;
      const show = (on) => {
        if (on === shown) return;
        shown = on;
        gsap.to(pill, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 0.6, duration: reduceMotion ? 0.01 : 0.3, ease: on ? 'back.out(1.6)' : 'power2.in', overwrite: 'auto' });
        wsStage.classList.toggle('has-cursor', on);
      };
      wsStage.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (!shown) gsap.set(pill, { x: e.clientX, y: e.clientY });
        toX(e.clientX); toY(e.clientY);
        const card = e.target.closest('.ws-card.is-active[data-count]');
        show(desktopUI.matches && !!card && !e.target.closest('button') && !wsStage.hasPointerCapture(e.pointerId) && !pjOpen && !morphed && !galleryMode);
      });
      wsStage.addEventListener('pointerleave', () => show(false));
      wsStage.addEventListener('pointerdown', () => show(false));
      window.addEventListener('scroll', () => { if (shown && !wsStage.matches(':hover')) show(false); }, { passive: true });
    }

    wsStage.setAttribute('tabindex', '0');
    wsStage.addEventListener('keydown', (e) => {
      const fwd = e.key === 'PageDown', back = e.key === 'PageUp';
      if (!fwd && !back) return;
      e.preventDefault();
      if (galleryMode) gMove((fwd ? -1 : 1) * gallery.clientWidth * 0.8);
      else step(fwd ? 1 : -1);
    });
    // ← → step through the projects whenever the works are on screen, no click
    // into the stage needed first.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (pjOpen || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, [contenteditable]')) return;
      const viewer = document.getElementById('lbx');
      if (viewer && !viewer.hidden) return;
      const r = wsStage.getBoundingClientRect();
      if (!morphed && (r.bottom < innerHeight * 0.25 || r.top > innerHeight * 0.75)) return;
      const fwd = e.key === 'ArrowRight';
      if (morphed && fwd) return;             // contact is the end; ← backs out of it
      e.preventDefault();
      if (galleryMode) gMove((fwd ? -1 : 1) * gallery.clientWidth * 0.8);
      else step(fwd ? 1 : -1);
    });

    /* ---- gallery mode ---- */

    // The library's categories sit in the same rows as the project filters.
    // Choosing one swaps the card stack for a horizontal gallery of that
    // category, in the card's own box; choosing a project filter swaps back.
    // Once the section is docked the wheel scrolls the gallery sideways.
    const gallery = el('div', 'ws-gallery');
    gallery.setAttribute('aria-hidden', 'true');
    const gTrack = el('div', 'ws-gtrack');
    const gPrev = el('button', 'ws-arrow prev ws-garrow');
    gPrev.type = 'button'; gPrev.setAttribute('aria-label', 'Scroll gallery back'); gPrev.innerHTML = '&#8249;';
    const gNext = el('button', 'ws-arrow next ws-garrow');
    gNext.type = 'button'; gNext.setAttribute('aria-label', 'Scroll gallery on'); gNext.innerHTML = '&#8250;';
    gallery.append(gTrack, gPrev, gNext);
    wsStage.appendChild(gallery);
    gsap.set(gallery, { autoAlpha: 0 });

    let galleryMode = null;            // null = the card stack; else a library key
    let gx = 0, gMin = 0;
    const gClamp = (v) => Math.max(gMin, Math.min(0, v));
    const gAtStart = () => gx >= -1;
    const gAtEnd = () => gx <= gMin + 1;

    function gMeasure() {
      gMin = Math.min(0, gallery.clientWidth - gTrack.scrollWidth);
      gx = gClamp(gx);
      gsap.set(gTrack, { x: gx });
      gPaint();
    }
    function gPaint() {
      gPrev.disabled = gAtStart();
      gNext.disabled = gAtEnd();
    }
    function gMove(dx, duration = 0.9) {
      gx = gClamp(gx + dx);
      gsap.to(gTrack, { x: gx, duration: reduceMotion ? 0.01 : duration, ease: 'power3.out', overwrite: true });
      gPaint();
    }

    // Clips play only while they're inside the gallery's window.
    const gClips = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => entries.forEach(en => {
          const vid = en.target;
          if (en.isIntersecting) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
          else vid.pause();
        }), { root: gallery, threshold: 0.4 })
      : null;

    function buildGallery(key) {
      const items = (window.nsLibrary && window.nsLibrary.items[key]) || [];
      if (gClips) gTrack.querySelectorAll('video').forEach(vd => gClips.unobserve(vd));
      gTrack.innerHTML = items.map((it, i) => {
        const media = it.kind === 'video'
          ? `<video src="${it.src}"${it.poster ? ` poster="${it.poster}"` : ''} muted loop playsinline preload="none"></video>`
          : `<img src="${it.src}" alt="${it.label}" loading="lazy" decoding="async" draggable="false">`;
        return `<button class="ws-gitem" type="button" data-i="${i}" style="aspect-ratio:${it.w || 4}/${it.h || 5}" aria-label="Open ${it.label}">${media}</button>`;
      }).join('');
      if (gClips) gTrack.querySelectorAll('video').forEach(vd => gClips.observe(vd));
      gx = 0;
      gsap.set(gTrack, { x: 0 });
      gMeasure();
    }

    // key = a library category to show the gallery, or null for the cards.
    // On phones the card's 3:2 box leaves portrait pieces tiny, so the stage
    // grows to 4:5 while the gallery is up and settles back for the cards.
    const phoneGallery = window.matchMedia('(max-width: 571px)');
    function sizeStage(tall, done) {
      const h0 = wsStage.offsetHeight;
      wsStage.classList.toggle('is-gallery', tall);
      const h1 = wsStage.offsetHeight;
      if (!phoneGallery.matches || Math.abs(h1 - h0) < 2) { done(); return; }
      gsap.fromTo(wsStage, { height: h0 }, {
        height: h1, duration: reduceMotion ? 0.01 : 0.45, ease: 'power3.inOut', clearProps: 'height',
        onComplete() { done(); fitDockRoom(); }
      });
    }

    function setMode(key) {
      if (animating || pjOpen || morphed || key === galleryMode) return false;
      const d = reduceMotion ? 0.01 : 1;
      const fromStack = galleryMode === null;
      animating = true;

      if (key) {
        const leaving = fromStack ? [cards[current]] : Array.from(gTrack.children).slice(0, 6);
        // stays busy until the stage has finished resizing and the pieces are in
        gsap.timeline()
          .to(leaving, { autoAlpha: 0, x: fromStack ? 0 : -40, scale: fromStack ? 0.94 : 1,
                         duration: 0.32 * d, stagger: fromStack ? 0 : 0.03 * d, ease: 'power2.in' })
          .add(() => sizeStage(true, () => {
            galleryMode = key;
            buildGallery(key);
            gallery.setAttribute('aria-hidden', 'false');
            gsap.set(gallery, { autoAlpha: 1 });
            const all = Array.from(gTrack.children);
            gsap.set(all.slice(6), { autoAlpha: 1 });
            gsap.fromTo(all.slice(0, 6), { autoAlpha: 0, x: 90 },
              { autoAlpha: 1, x: 0, duration: 0.7 * d, stagger: 0.07 * d, ease: 'power3.out' });
            animating = false;
          }));
      } else {
        galleryMode = null;
        gsap.timeline({
          onComplete() {
            gallery.setAttribute('aria-hidden', 'true');
            gTrack.innerHTML = '';
          }
        })
          .to(Array.from(gTrack.children).slice(0, 6), { autoAlpha: 0, x: -50, duration: 0.3 * d, stagger: 0.03 * d, ease: 'power2.in' })
          .set(gallery, { autoAlpha: 0 })
          .add(() => sizeStage(false, () => {
            gsap.fromTo(cards[current], { autoAlpha: 0, scale: 0.94, x: 0 },
              { autoAlpha: 1, scale: 1, zIndex: 2, duration: 0.5 * d, ease: 'power3.out',
                onComplete() { animating = false; } });
          }));
      }
      return true;
    }

    gPrev.addEventListener('click', (e) => { e.stopPropagation(); gMove(gallery.clientWidth * 0.8); });
    gNext.addEventListener('click', (e) => { e.stopPropagation(); gMove(-gallery.clientWidth * 0.8); });

    // Drag (mouse or thumb). A press that doesn't travel is a click: it opens
    // the piece in the viewer.
    let gDrag = null;
    gallery.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.ws-garrow')) return;
      gDrag = { x: e.clientX, from: gx, moved: false };
      gallery.setPointerCapture(e.pointerId);
    });
    gallery.addEventListener('pointermove', (e) => {
      if (!gDrag) return;
      const dx = e.clientX - gDrag.x;
      if (Math.abs(dx) > 6) gDrag.moved = true;
      if (!gDrag.moved) return;
      gx = gClamp(gDrag.from + dx);
      gsap.set(gTrack, { x: gx, overwrite: true });
    });
    const gRelease = (e) => {
      if (!gDrag) return;
      const moved = gDrag.moved;
      gDrag = null;
      gPaint();
      if (moved || !e) return;
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const item = hit && hit.closest('.ws-gitem');
      if (item && window.nsLibrary) window.nsLibrary.open(galleryMode, Number(item.dataset.i), item);
    };
    gallery.addEventListener('pointerup', gRelease);
    gallery.addEventListener('pointercancel', () => gRelease(null));
    gallery.addEventListener('keydown', (e) => {
      const item = e.target.closest && e.target.closest('.ws-gitem');
      if (item && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        window.nsLibrary.open(galleryMode, Number(item.dataset.i), item);
      }
    });
    window.addEventListener('resize', () => { if (galleryMode) gMeasure(); });

    /* ---- category pills ---- */

    // "More works" and the nav's GRID land on this section in gallery mode.
    document.querySelectorAll('[data-ws-mode]').forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(() => {
          const pill = document.querySelector(`.ws-pill[data-lib="${link.dataset.wsMode}"]`);
          if (pill) pill.click();
        }, 650);
      });
    });

    // Rebuilds the live stack from the chosen group and brings its first card
    // to the front; the closing contact card always stays last.
    function applyFilter(group, quiet = false) {
      if (group === activeGroup || animating || pjOpen || morphed) return false;
      activeGroup = group;
      const front = cards[current];
      cards = [...projCards.filter((_, i) => inGroup(i)), ctaCard];
      LAST = cards.length - 1;
      current = 0;
      allCards.forEach(c => {
        if (c !== cards[0]) gsap.set(c, { autoAlpha: 0, zIndex: 1, x: 0, scale: 1, opacity: 1 });
      });
      if (quiet) {
        gsap.set(cards[0], { autoAlpha: 0, zIndex: 2, x: 0 });   // setMode brings it in
      } else if (front !== cards[0]) {
        gsap.fromTo(cards[0], { autoAlpha: 0, scale: 0.96, x: 0, zIndex: 2 },
          { autoAlpha: 1, scale: 1, duration: reduceMotion ? 0.01 : 0.45, ease: 'power3.out' });
      }
      paintChrome(0);
      return true;
    }

    const pills = Array.from(document.querySelectorAll('.ws-pill'));
    const headline = document.getElementById('wsHeadline');
    const lede = document.querySelector('.ws-lede');
    const LEDE = {
      projects: lede ? lede.innerHTML : '',
      gallery: 'Key visuals, social content and motion for hotels, restaurants and brands across Dubai, among them Four Seasons, Raffles and Hardee&rsquo;s.'
    };
    function swapLede(toGallery) {
      if (!lede) return;
      const next = toGallery ? LEDE.gallery : LEDE.projects;
      if (lede.innerHTML === next) return;
      lede.style.opacity = '0';
      setTimeout(() => {
        lede.innerHTML = next;
        lede.style.opacity = '';
        fitWorks();      // the lede changed length
      }, 220);
    }
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (pill.classList.contains('is-active')) return;
        if (animating || pjOpen || morphed) return;
        if (pill.dataset.lib) {
          // each library category is its own page now
          window.location.href = `grid.html?cat=${encodeURIComponent(pill.dataset.lib)}`;
          return;
        } else {
          const group = pill.dataset.group || 'all';
          if (galleryMode) {
            applyFilter(group, true);
            setMode(null);
          } else if (!applyFilter(group)) return;
        }
        pills.forEach(p => {
          p.classList.remove('is-active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('is-active');
        pill.setAttribute('aria-selected', 'true');
        pill.blur();

      });
    });
  }


  /* ==========================================================================
     7. Library data + viewer
     The work outside the case studies. It is shown as the works panel's
     gallery (section 6); the viewer here opens any piece full screen.
     ========================================================================== */

  const LIBRARY = {"visual": [{"src": "assets/library/visual/fourseasonimg1.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Four Seasons"},
    {"src": "assets/library/visual/rafflesimg5.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/social_media2.webp", "kind": "image", "w": 2000, "h": 1333, "label": "Social media"},
    {"src": "assets/library/visual/maison2.webp", "kind": "image", "w": 1414, "h": 2000, "label": "Maison"},
    {"src": "assets/library/visual/bluevelvetimg1.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Blue Velvet"},
    {"src": "assets/library/visual/streeteryimg2.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Streetery"},
    {"src": "assets/library/visual/hardeesimg1.webp", "kind": "image", "w": 1000, "h": 2000, "label": "Hardee's"},
    {"src": "assets/library/visual/fourseasonimg8.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Four Seasons"},
    {"src": "assets/library/visual/tomoimg1.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Tomo"},
    {"src": "assets/library/visual/maison1.webp", "kind": "image", "w": 1080, "h": 1350, "label": "Maison"},
    {"src": "assets/library/visual/rafflesimg1.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/jungleimg1.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Jungle"},
    {"src": "assets/library/visual/fourseasonimg3.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Four Seasons"},
    {"src": "assets/library/visual/maison4.webp", "kind": "image", "w": 1500, "h": 2000, "label": "Maison"},
    {"src": "assets/library/visual/studentinv1.webp", "kind": "image", "w": 1414, "h": 2000, "label": "Student invitation"},
    {"src": "assets/library/visual/rafflesimg9.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/fourseasonimg10.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Four Seasons"},
    {"src": "assets/library/visual/rafflesimg2.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/maison3.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Maison"},
    {"src": "assets/library/visual/tomoimg3.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Tomo"},
    {"src": "assets/library/visual/ivanaaro--album-art-light.webp", "kind": "image", "w": 2000, "h": 1500, "label": "Ivan Aaro, album art"},
    {"src": "assets/library/visual/fourseasonimg5.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Four Seasons"},
    {"src": "assets/library/visual/rafflesimg6.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/manipulation-work.webp", "kind": "image", "w": 2000, "h": 1400, "label": "Photo manipulation"},
    {"src": "assets/library/visual/hardeesimg2.webp", "kind": "image", "w": 2000, "h": 1500, "label": "Hardee's"},
    {"src": "assets/library/visual/matagiimg1.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Matagi"},
    {"src": "assets/library/visual/rafflesimg10.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/fourseasonimg2.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Four Seasons"},
    {"src": "assets/library/visual/rafflesimg4.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/jungleimg2.webp", "kind": "image", "w": 1080, "h": 1920, "label": "Jungle"},
    {"src": "assets/library/visual/tomoimg2.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Tomo"},
    {"src": "assets/library/visual/rafflesimg7.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/streeteryimg3.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Streetery"},
    {"src": "assets/library/visual/fourseasonimg6.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Four Seasons"},
    {"src": "assets/library/visual/rafflesimg3.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/fourseasonimg4.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Four Seasons"},
    {"src": "assets/library/visual/rafflesimg8.webp", "kind": "image", "w": 1125, "h": 2000, "label": "Raffles The Palm"},
    {"src": "assets/library/visual/packaging1.webp", "kind": "image", "w": 2000, "h": 1500, "label": "Packaging"},
    {"src": "assets/library/visual/packaging2.webp", "kind": "image", "w": 2000, "h": 1500, "label": "Packaging"}], "3d": [{"src": "assets/library/3d/3d-1.webp", "kind": "image", "w": 2000, "h": 1116, "label": "3D render"},
    {"src": "assets/library/3d/3d-2.webp", "kind": "image", "w": 1800, "h": 1800, "label": "3D render"},
    {"src": "assets/library/3d/3d-3.webp", "kind": "image", "w": 1600, "h": 2000, "label": "3D render"}], "experimental": [{"src": "assets/library/experimental/photomanip1.webp", "kind": "image", "w": 2000, "h": 1600, "label": "Photo manipulation"},
    {"src": "assets/library/experimental/photomanip2.webp", "kind": "image", "w": 1333, "h": 2000, "label": "Photo manipulation"},
    {"src": "assets/library/experimental/photomanip3.webp", "kind": "image", "w": 2000, "h": 1333, "label": "Photo manipulation"},
    {"src": "assets/library/experimental/photomanip4.webp", "kind": "image", "w": 2000, "h": 1333, "label": "Photo manipulation"},
    {"src": "assets/library/experimental/photomanip6.webp", "kind": "image", "w": 1773, "h": 2000, "label": "Photo manipulation"},
    {"src": "assets/library/experimental/photomanip7.webp", "kind": "image", "w": 1251, "h": 2000, "label": "Photo manipulation"}], "motion": [{"src": "assets/library/motion/spaces1.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/spaces1_thumb.webp", "label": "Spaces"},
    {"src": "assets/library/motion/spaces2.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/spaces2_thumb.webp", "label": "Spaces"},
    {"src": "assets/library/motion/raffles4.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/raffles4_thumb.webp", "label": "Raffles The Palm"},
    {"src": "assets/library/motion/raffles5.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/raffles5_thumb.webp", "label": "Raffles The Palm"},
    {"src": "assets/library/motion/raffles6.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/raffles6_thumb.webp", "label": "Raffles The Palm"},
    {"src": "assets/library/motion/raffles7.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/raffles7_thumb.webp", "label": "Raffles The Palm"},
    {"src": "assets/library/motion/hardees1.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/hardees1_thumb.webp", "label": "Hardee's"},
    {"src": "assets/library/motion/hardees2.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/hardees2_thumb.webp", "label": "Hardee's"},
    {"src": "assets/library/motion/crossing1.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/crossing1_thumb.webp", "label": "Crossing"},
    {"src": "assets/library/motion/crossing2.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/crossing2_thumb.webp", "label": "Crossing"},
    {"src": "assets/library/motion/crossing3.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/crossing3_thumb.webp", "label": "Crossing"},
    {"src": "assets/library/motion/fourseason2.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/fourseason2_thumb.webp", "label": "Four Seasons"},
    {"src": "assets/library/motion/fourseason3.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/fourseason3_thumb.webp", "label": "Four Seasons"},
    {"src": "assets/library/motion/motiondesignvid_2.mp4", "kind": "video", "w": 1080, "h": 720, "poster": "assets/library/motion/motiondesignvid_2_thumb.webp", "label": "Motion design"},
    {"src": "assets/library/motion/a5_motiondesign_nirmalsudish.mp4", "kind": "video", "w": 1600, "h": 900, "poster": "assets/library/motion/a5_motiondesign_nirmalsudish_thumb.webp", "label": "A5 motion design"},
    {"src": "assets/library/motion/animatedposter_nirmalsudish.mp4", "kind": "video", "w": 900, "h": 1600, "poster": "assets/library/motion/animatedposter_nirmalsudish_thumb.webp", "label": "Animated poster"}]};

  const lbx = document.getElementById('lbx');
  const lbxStage = document.getElementById('lbxStage');
  let lbxKey = 'visual', lbxIndex = 0, lbxReturn = null, lbxOverflow = '';

  function showLbx(i) {
    const items = LIBRARY[lbxKey];
    lbxIndex = (i + items.length) % items.length;
    const it = items[lbxIndex];
    lbxStage.innerHTML = (it.kind === 'video'
      ? `<video src="${it.src}"${it.poster ? ` poster="${it.poster}"` : ''} muted loop playsinline autoplay controls></video>`
      : `<img src="${it.src}" alt="${it.label}">`)
      + `<figcaption class="lbx-cap">${it.label}<span>${lbxIndex + 1} / ${items.length}</span></figcaption>`;
  }

  function openLbx(key, i, from) {
    if (!lbx) return;
    lbxKey = key;
    lbxReturn = from || null;
    showLbx(i);
    lbx.hidden = false;
    lbxOverflow = document.body.style.overflow;   // a case study underneath has its own lock
    document.body.style.overflow = 'hidden';
    document.getElementById('lbxClose').focus();
  }

  function closeLbx() {
    if (!lbx || lbx.hidden) return;
    lbx.hidden = true;
    lbxStage.innerHTML = '';
    document.body.style.overflow = lbxOverflow;
    if (lbxReturn) lbxReturn.focus({ preventScroll: true });
  }

  if (lbx) {
    document.getElementById('lbxPrev').addEventListener('click', () => showLbx(lbxIndex - 1));
    document.getElementById('lbxNext').addEventListener('click', () => showLbx(lbxIndex + 1));
    document.getElementById('lbxClose').addEventListener('click', closeLbx);
    lbx.addEventListener('click', (e) => { if (e.target === lbx) closeLbx(); });
    document.addEventListener('keydown', (e) => {
      if (lbx.hidden) return;
      if (e.key === 'Escape') closeLbx();
      else if (e.key === 'ArrowLeft') showLbx(lbxIndex - 1);
      else if (e.key === 'ArrowRight') showLbx(lbxIndex + 1);
    });
    let tx = null;
    lbx.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    lbx.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) showLbx(lbxIndex + (dx < 0 ? 1 : -1));
      tx = null;
    });
  }

  // The works panel (section 6) builds its gallery from this.
  window.nsLibrary = {
    items: LIBRARY, open: openLbx,
    // any list of pictures, e.g. one case study's
    openList(list, i, from) { LIBRARY.__list = list; openLbx('__list', Math.max(0, i), from); }
  };

  console.log('Nirmal Sudish Editorial Portfolio initialized successfully.');
});
