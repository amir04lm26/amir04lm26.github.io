// A small robot cleaner. A click on empty page space drops a bug; the robot drives to it,
// cleans it and returns to its dock. All positions are viewport coordinates.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const roams = matchMedia('(hover: hover) and (pointer: fine)').matches && innerWidth >= 760;
const bot = document.querySelector<HTMLElement>('.bot');
const dock = document.querySelector<HTMLElement>('.dock');
const layer = document.querySelector<HTMLElement>('.bot-layer');

if (bot && dock && layer && !reduce) {
  const statusEl = dock.querySelector<HTMLElement>('#bot-status')!;
  const countEl = dock.querySelector<HTMLElement>('#bot-count')!;
  const pad = dock.querySelector<HTMLElement>('.dock-pad')!;
  type Mode = 'docked' | 'seek' | 'clean' | 'return' | 'sweep' | 'drag' | 'parked';
  type Pt = { x: number; y: number; el?: HTMLElement };
  const UP = -Math.PI / 2;
  let mode: Mode = 'docked';
  let x = 0, y = 0, a = UP;
  let target: Pt | null = null;
  let queue: Pt[] = [];
  let route: Pt[] = [];
  let cleaned = 0;
  let timer = 0;
  let raf = 0;
  let last = 0;
  let idleT = 0;
  let hinted = false;

  const home = (): Pt => {
    const r = pad.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const paint = () => {
    bot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(a - UP).toFixed(3)}rad)`;
  };
  const say = (text: string) => { statusEl.textContent = text; };
  const setMode = (m: Mode) => {
    mode = m;
    bot.dataset.mode = m;
    dock.dataset.mode = m;
    if (hinted) dock.classList.toggle('open', m !== 'docked');
    if (m === 'docked') say(cleaned ? 'docked' : roams ? 'click empty space' : 'tap me');
    if (m === 'seek') say('scanning…');
    if (m === 'clean') say('cleaning…');
    if (m === 'return') say('returning…');
    if (m === 'sweep') say('sweeping…');
    if (m === 'drag') say('hey!');
    if (m === 'parked') say('parked');
  };
  const place = () => { const h = home(); x = h.x; y = h.y; a = UP; paint(); };

  const next = () => {
    if (mode === 'parked' || mode === 'drag') return;
    if (queue.length) {
      // Nearest bug first.
      queue.sort((p, q) => Math.hypot(p.x - x, p.y - y) - Math.hypot(q.x - x, q.y - y));
      target = queue.shift()!;
      setMode('seek');
    } else if (route.length) {
      target = route.shift()!;
      setMode('sweep');
    } else {
      target = home();
      setMode('return');
    }
    run();
  };

  const arrive = () => {
    if (mode === 'seek' && target?.el) {
      setMode('clean');
      timer = 0.75;
      target.el.classList.add('gone');
      const el = target.el;
      setTimeout(() => el.remove(), 700);
    } else if (mode === 'return') {
      target = null;
      a = UP;
      const h = home(); x = h.x; y = h.y;
      paint();
      setMode('docked');
      idleT = 0;
    } else next();
  };

  const step = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    if (mode === 'clean') {
      a += dt * 9;
      timer -= dt;
      paint();
      if (timer <= 0) {
        cleaned++;
        countEl.textContent = String(cleaned);
        countEl.classList.remove('bump');
        void countEl.offsetWidth;
        countEl.classList.add('bump');
        next();
      }
    } else if (target && (mode === 'seek' || mode === 'return' || mode === 'sweep')) {
      if (mode === 'return') target = home();
      const dx = target.x - x, dy = target.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 5) arrive();
      else {
        let diff = Math.atan2(dy, dx) - a;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        a += Math.sign(diff) * Math.min(Math.abs(diff), 7 * dt);
        if (Math.abs(diff) < 0.5) {
          const speed = Math.min(mode === 'sweep' ? 170 : 330, dist * 5 + 50);
          const move = Math.min(dist, speed * dt);
          x += Math.cos(a) * move;
          y += Math.sin(a) * move;
        }
        paint();
      }
    }
    raf = mode === 'docked' || mode === 'parked' || mode === 'drag' ? 0 : requestAnimationFrame(step);
  };
  const run = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };

  const dropBug = (cx: number, cy: number) => {
    if (queue.length >= 8) return;
    const el = document.createElement('i');
    el.className = 'bug';
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.setProperty('--r', ((Math.random() * 360) | 0) + 'deg');
    layer.appendChild(el);
    queue.push({ x: cx, y: cy, el });
    route = [];
    if (mode === 'docked' || mode === 'return' || mode === 'sweep') next();
  };

  bot.classList.add('on');
  dock.classList.add('on');
  place();
  setMode('docked');
  // Show the hint for a few seconds, then fold the dock down to its pad.
  dock.classList.add('open');
  setTimeout(() => { hinted = true; if (mode === 'docked') { dock.classList.remove('open'); place(); } }, 7000);
  addEventListener('resize', () => { if (mode === 'docked' || mode === 'parked') place(); });
  // The dock changes width when it folds or opens; keep a resting robot on its pad.
  dock.addEventListener('transitionend', () => { if (mode === 'docked' || mode === 'parked') place(); });
  dock.addEventListener('pointerenter', () => { if (mode === 'docked' || mode === 'parked') requestAnimationFrame(function follow() { place(); if (dock.matches(':hover')) requestAnimationFrame(follow); }); });

  // Park or release from the dock.
  dock.addEventListener('click', () => {
    if (mode === 'parked') { setMode('docked'); return; }
    queue.forEach((b) => b.el?.remove());
    queue = []; route = []; target = null;
    cancelAnimationFrame(raf); raf = 0;
    place();
    setMode('parked');
  });

  if (roams) {
    document.addEventListener('click', (e) => {
      if (mode === 'parked' || mode === 'drag') return;
      const el = e.target as HTMLElement;
      if (el.closest('a, button, input, textarea, select, label, summary, .card, .repo, .quote, .bot, .dock, .nav, .portrait, .pipe, .ch')) return;
      if (getSelection()?.toString()) return;
      dropBug(e.clientX, e.clientY);
    });

    // Pick the robot up and drop it somewhere else.
    let before: Mode = 'docked';
    bot.addEventListener('pointerdown', (e) => {
      if (mode === 'parked') return;
      before = mode;
      bot.setPointerCapture(e.pointerId);
      cancelAnimationFrame(raf); raf = 0;
      if (before === 'seek' && target?.el) queue.push(target);
      setMode('drag');
      e.preventDefault();
    });
    bot.addEventListener('pointermove', (e) => {
      if (mode !== 'drag') return;
      a += (e.movementX + e.movementY) * 0.01;
      x = e.clientX; y = e.clientY;
      paint();
    });
    const release = () => { if (mode === 'drag') { mode = 'docked'; next(); } };
    bot.addEventListener('pointerup', release);
    bot.addEventListener('pointercancel', release);

    // Now and then, sweep along the bottom edge when nothing else is going on.
    setInterval(() => {
      if (document.hidden || mode !== 'docked') return;
      idleT += 1;
      if (idleT < 28) return;
      idleT = 0;
      const yy = innerHeight - 34;
      route = [{ x: innerWidth * 0.55, y: yy }, { x: 60, y: yy }, { x: innerWidth * 0.3, y: yy - 46 }];
      next();
    }, 1000);
  } else {
    // Phones: the robot stays in its dock and only reacts to a tap.
    bot.addEventListener('click', () => {
      bot.classList.remove('wiggle');
      void bot.offsetWidth;
      bot.classList.add('wiggle');
      say('beep');
      setTimeout(() => mode === 'docked' && say('docked'), 1200);
    });
  }
}
