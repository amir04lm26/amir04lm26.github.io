const site = (window as any).__site as { rotating: string[]; timezone: string };
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends HTMLElement>(s: string, p: ParentNode = document) => p.querySelector<T>(s);
const $$ = <T extends HTMLElement>(s: string, p: ParentNode = document) => [...p.querySelectorAll<T>(s)];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Hero entrance. Letters turn interactive once the entrance has played.
requestAnimationFrame(() => document.body.classList.add('ready'));
setTimeout(() => $$('.ch').forEach((c) => c.classList.add('live')), 1700);

// Reveal on view
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(count);
      io.unobserve(e.target);
    }
  },
  { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
);
$$('.rv, [data-in]').forEach((el) => io.observe(el));

function count(el: HTMLElement) {
  const to = Number(el.dataset.count);
  if (reduce || !to) return;
  const t0 = performance.now();
  const dur = 1400;
  const tick = (t: number) => {
    const k = clamp((t - t0) / dur, 0, 1);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 4))));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Scroll: progress bar, nav hide, timeline fill, active section
const progress = $('.progress')!;
const navEl = $('.nav')!;
const xp = $('.xp');
const jobs = $$('.job');
let lastY = scrollY;
let ticking = false;
function onScroll() {
  const y = scrollY;
  const max = root.scrollHeight - innerHeight;
  progress.style.setProperty('--p', String(max > 0 ? y / max : 0));
  navEl.classList.toggle('stuck', y > innerHeight * 0.6);
  lastY = y;
  if (xp) {
    const r = xp.getBoundingClientRect();
    const mark = innerHeight * 0.55;
    xp.style.setProperty('--tl', String(clamp((mark - r.top) / r.height, 0, 1)));
    jobs.forEach((j) => j.classList.toggle('passed', j.getBoundingClientRect().top + 40 < mark));
  }
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

// Nav pill follows the active section
const links = $$<HTMLAnchorElement>('.nav-links a');
const pill = $('.nav-pill')!;
function movePill(a?: HTMLAnchorElement) {
  links.forEach((l) => l.classList.toggle('on', l === a));
  if (!a || !a.offsetWidth) { pill.style.opacity = '0'; return; }
  pill.style.opacity = '1';
  pill.style.width = a.offsetWidth + 'px';
  pill.style.transform = `translateX(${a.offsetLeft}px)`;
}
const spy = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) movePill(links.find((l) => l.dataset.nav === e.target.id));
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
links.forEach((l) => { const s = document.getElementById(l.dataset.nav!); if (s) spy.observe(s); });
addEventListener('resize', () => movePill(links.find((l) => l.classList.contains('on'))));

// Theme toggle with a circular reveal from the button
$('.theme')!.addEventListener('click', (ev) => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  const apply = () => {
    if (next === 'light') root.dataset.theme = 'light'; else delete root.dataset.theme;
    try { localStorage.setItem('theme', next); } catch {}
    paintField?.();
  };
  const e = ev as MouseEvent;
  root.style.setProperty('--tx', e.clientX + 'px');
  root.style.setProperty('--ty', e.clientY + 'px');
  const doc = document as any;
  if (!reduce && doc.startViewTransition) doc.startViewTransition(apply); else apply();
});

// Rotating focus line: scramble into the next phrase
const rot = $('#rot');
if (rot && !reduce) {
  const glyphs = 'abcdefghijklmnopqrstuvwxyz/_-<>';
  let idx = 0;
  const scramble = (to: string) => {
    let f = 0;
    const total = 22;
    const step = () => {
      const settled = Math.floor((f / total) * to.length);
      rot.textContent = to.slice(0, settled) + [...to.slice(settled)].map((c) => (c === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0])).join('');
      if (f++ < total) setTimeout(step, 32); else rot.textContent = to;
    };
    step();
  };
  setInterval(() => { idx = (idx + 1) % site.rotating.length; scramble(site.rotating[idx]); }, 2600);
}

// Local clock
const clock = $('#clock');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: site.timezone });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 20000);
}

// Copy email
const toast = $('.toast')!;
let toastT = 0;
$$('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    const v = b.dataset.copy!;
    try { await navigator.clipboard.writeText(v); toast.textContent = 'Email copied ✓'; } catch { location.href = 'mailto:' + v; return; }
    const arr = $('.arr', b)!;
    arr.textContent = '✓';
    b.classList.add('copied');
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = window.setTimeout(() => { toast.classList.remove('show'); b.classList.remove('copied'); arr.textContent = '⧉'; }, 1800);
  }),
);

// Agent pipeline demo
const pipe = $('#pipe');
if (pipe) {
  const steps = $$('.step', pipe);
  const log = $('.pipe-log', pipe)!;
  const lines = [
    'reading the ticket and the code it touches…',
    'writing a plan · <b>waiting for approval</b>',
    'building on an isolated worktree, tests first…',
    'second agent reviews the diff with evidence…',
    'walking each verification step on a preview…',
  ];
  const set = (i: number) => {
    steps.forEach((s, k) => { s.classList.toggle('done', k < i); s.classList.toggle('now', k === i); });
    log.innerHTML = i < steps.length ? `<b>${steps[i].textContent!.toLowerCase()}</b> · ${lines[i]}` : '<b>done</b> · handed back to a human with a report';
  };
  if (reduce) set(steps.length);
  else {
    let i = 0;
    let timer = 0;
    const run = () => { set(i); i = i > steps.length ? 0 : i + 1; };
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) { run(); timer = window.setInterval(run, 1500); }
    }, { threshold: 0.4 }).observe(pipe);
  }
}

// Pointer effects
if (fine && !reduce) {
  // Magnetic buttons
  $$('[data-magnet]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px');
      b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.4).toFixed(1) + 'px');
    });
    b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
  });
  // Card spotlight and tilt
  $$('[data-tilt]').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--x', x * 100 + '%');
      c.style.setProperty('--y', y * 100 + '%');
      c.style.setProperty('--ry', ((x - 0.5) * 5).toFixed(2) + 'deg');
      c.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg');
    });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  });
  // Soft glow that trails the cursor
  const glow = $('.glow')!;
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowOn = false;
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!glowOn) { glowOn = true; glow.classList.add('on'); loop(); }
  }, { passive: true });
  const loop = () => {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx.toFixed(1)}px, ${gy.toFixed(1)}px)`;
    if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop); else glowOn = false;
  };
}

// Hero dot field: a grid of dots that swells and shifts near the pointer
let paintField: (() => void) | undefined;
const canvas = $<HTMLCanvasElement>('#field' as any);
if (canvas && !reduce) {
  const ctx = canvas.getContext('2d')!;
  const hero = canvas.parentElement!;
  let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
  let px = -999, py = -999, sx = -999, sy = -999;
  let colour = '';
  const gap = 30;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  paintField = () => { colour = getComputedStyle(root).getPropertyValue('--accent').trim(); };
  const draw = (t: number) => {
    sx += (px - sx) * 0.08; sy += (py - sy) * 0.08;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = colour;
    const time = t / 1000;
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        const dx = x - sx, dy = y - sy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const near = Math.max(0, 1 - d / 240);
        const wave = Math.sin(x * 0.012 + y * 0.018 + time * 0.9) * 0.5 + 0.5;
        const r = 0.7 + wave * 0.5 + near * near * 3.2;
        const push = near * near * 14;
        ctx.globalAlpha = 0.1 + wave * 0.12 + near * 0.75;
        ctx.beginPath();
        ctx.arc(x + (d ? (dx / d) * push : 0), y + (d ? (dy / d) * push : 0), r, 0, 6.2832);
        ctx.fill();
      }
    }
    if (visible) raf = requestAnimationFrame(draw);
  };
  size(); paintField();
  addEventListener('resize', size);
  hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { px = -999; py = -999; });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(draw);
  }).observe(hero);
}
