// A small robot cleaner. The page starts with a little dust on its empty areas. The robot
// leaves its dock by itself and vacuums the dust in view. A click on empty space drops a bug,
// which it fetches first. The robot and bugs use viewport coordinates; dust uses page
// coordinates so it scrolls with the content.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const roams = matchMedia('(hover: hover) and (pointer: fine)').matches && innerWidth >= 760;
const bot = document.querySelector<HTMLElement>('.bot');
const dock = document.querySelector<HTMLElement>('.dock');
const layer = document.querySelector<HTMLElement>('.bot-layer');
const dustLayer = document.querySelector<HTMLElement>('.dust-layer');

if (bot && dock && layer && dustLayer && !reduce) {
  const statusEl = dock.querySelector<HTMLElement>('#bot-status')!;
  const countEl = dock.querySelector<HTMLElement>('#bot-count')!;
  const pad = dock.querySelector<HTMLElement>('.dock-pad')!;
  type Mode = 'docked' | 'seek' | 'dust' | 'clean' | 'return' | 'drag' | 'parked';
  type Bug = { x: number; y: number; el: HTMLElement };
  type Dust = { px: number; py: number; el: HTMLElement; done: boolean };
  const UP = -Math.PI / 2;
  const REACH = 24;
  let mode: Mode = 'docked';
  let x = 0, y = 0, a = UP;
  let bug: Bug | null = null;
  let speck: Dust | null = null;
  let bugs: Bug[] = [];
  let dust: Dust[] = [];
  let dustDone = 0;
  let tripCleaned = 0;
  let timer = 0;
  let raf = 0;
  let last = 0;
  let streakT = 0;
  let hinted = false;

  const home = () => {
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
    if (m === 'seek') say('bug spotted…');
    if (m === 'dust') say('vacuuming…');
    if (m === 'clean') say('cleaning…');
    if (m === 'return') say(tripCleaned ? 'clean here ✓' : 'returning…');
    if (m === 'drag') say('hey!');
    if (m === 'parked') say('parked');
    if (m === 'docked') say(roams ? 'docked' : 'tap me');
  };
  const place = () => { const h = home(); x = h.x; y = h.y; a = UP; paint(); };

  // ---- Dust -------------------------------------------------------------------------
  const inView = (d: Dust) => {
    const vy = d.py - scrollY;
    return !d.done && vy > 76 && vy < innerHeight - 22 && d.px > 12 && d.px < innerWidth - 12;
  };
  const showPercent = () => {
    countEl.textContent = dust.length ? Math.round((dustDone / dust.length) * 100) + '%' : '';
  };
  const collect = () => {
    for (const d of dust) {
      if (d.done) continue;
      const dy = d.py - scrollY - y;
      if (Math.abs(dy) > REACH) continue;
      const dx = d.px - x;
      if (dx * dx + dy * dy > REACH * REACH) continue;
      d.done = true;
      dustDone++;
      tripCleaned++;
      // Pull the speck into the robot before it disappears.
      d.el.style.translate = `${(-dx * 0.8).toFixed(1)}px ${(-dy * 0.8).toFixed(1)}px`;
      d.el.classList.add('gone');
      const el = d.el;
      setTimeout(() => el.remove(), 450);
      showPercent();
    }
  };
  const scatter = () => {
    dust.forEach((d) => !d.done && d.el.remove());
    const kept = dust.filter((d) => d.done);
    const docH = document.documentElement.scrollHeight;
    const docW = document.documentElement.clientWidth;
    // Keep dust off anything a visitor reads or clicks.
    const blocked = [...document.querySelectorAll('h1, h2, h3, p, li, figure, .card, .repo, .quote, .btn, .chips, .stat, .pipe, .link, .status, .marquee, .skill-row, .meta, .foot, .rot, .cta')].map((el) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - 10, r: r.right + 10, t: r.top + scrollY - 10, b: r.bottom + scrollY + 10 };
    });
    const total = Math.round(Math.min(230, Math.max(40, (docH / innerHeight) * 20)));
    const fresh: Dust[] = [];
    for (let tries = 0; fresh.length < total - kept.length && tries < total * 12; tries++) {
      const px = 14 + Math.random() * (docW - 28);
      const py = 90 + Math.random() * (docH - 130);
      if (blocked.some((b) => px > b.l && px < b.r && py > b.t && py < b.b)) continue;
      const el = document.createElement('i');
      el.className = 'speck' + (Math.random() < 0.3 ? ' lint' : '');
      el.style.left = px + 'px';
      el.style.top = py + 'px';
      el.style.setProperty('--s', (2 + Math.random() * 3).toFixed(1) + 'px');
      el.style.setProperty('--r', ((Math.random() * 180) | 0) + 'deg');
      el.style.setProperty('--o', (0.35 + Math.random() * 0.4).toFixed(2));
      dustLayer.appendChild(el);
      fresh.push({ px, py, el, done: false });
    }
    dust = kept.concat(fresh);
    showPercent();
  };

  // ---- Driving ----------------------------------------------------------------------
  const nearest = <T,>(items: T[], pos: (t: T) => { x: number; y: number }) => {
    let best: T | null = null, bd = Infinity;
    for (const it of items) {
      const p = pos(it);
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  };
  const next = () => {
    if (mode === 'parked' || mode === 'drag') return;
    bug = null; speck = null;
    if (bugs.length) {
      bug = nearest(bugs, (b) => b)!;
      bugs = bugs.filter((b) => b !== bug);
      setMode('seek');
    } else {
      speck = nearest(dust.filter(inView), (d) => ({ x: d.px, y: d.py - scrollY }));
      setMode(speck ? 'dust' : 'return');
    }
    run();
  };
  const dockNow = () => {
    place();
    setMode('docked');
    if (tripCleaned) {
      dock.classList.remove('sparkle');
      void dock.offsetWidth;
      dock.classList.add('sparkle');
    }
    tripCleaned = 0;
  };

  const step = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    if (mode === 'clean') {
      a += dt * 9;
      timer -= dt;
      paint();
      if (timer <= 0) next();
    } else if (mode === 'seek' || mode === 'dust' || mode === 'return') {
      if (mode === 'dust' && (!speck || !inView(speck))) { next(); raf = requestAnimationFrame(step); return; }
      const tp = mode === 'seek' ? bug! : mode === 'dust' ? { x: speck!.px, y: speck!.py - scrollY } : home();
      const dx = tp.x - x, dy = tp.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 5) {
        if (mode === 'seek') {
          setMode('clean');
          timer = 0.75;
          tripCleaned++;
          const el = bug!.el;
          el.classList.add('gone');
          setTimeout(() => el.remove(), 700);
        } else if (mode === 'return') dockNow();
        else next();
      } else {
        let diff = Math.atan2(dy, dx) - a;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        a += Math.sign(diff) * Math.min(Math.abs(diff), 9 * dt);
        if (Math.abs(diff) < 0.6) {
          const top = mode === 'dust' ? 175 : 340;
          const speed = mode === 'return' ? Math.min(top, dist * 5 + 50) : top;
          const move = Math.min(dist, speed * dt);
          x += Math.cos(a) * move;
          y += Math.sin(a) * move;
          streakT += dt;
          if (streakT > 0.045 && mode !== 'return') { streakT = 0; streak(); }
        }
        collect();
        paint();
      }
    }
    raf = mode === 'docked' || mode === 'parked' || mode === 'drag' ? 0 : requestAnimationFrame(step);
  };
  const run = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };

  // A short glossy mark where the robot has just passed.
  const streak = () => {
    const el = document.createElement('i');
    el.className = 'streak';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  };

  const wake = () => {
    if (mode === 'docked' && !document.hidden && dust.some(inView)) next();
  };

  const dropBug = (cx: number, cy: number) => {
    if (bugs.length >= 8) return;
    const el = document.createElement('i');
    el.className = 'bug';
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.setProperty('--r', ((Math.random() * 360) | 0) + 'deg');
    layer.appendChild(el);
    bugs.push({ x: cx, y: cy, el });
    if (mode === 'docked' || mode === 'return' || mode === 'dust') next();
  };

  // ---- Start ------------------------------------------------------------------------
  bot.classList.add('on');
  dock.classList.add('on');
  place();
  setMode('docked');
  // Show the dock's text for a few seconds, then fold it down to its pad.
  dock.classList.add('open');
  setTimeout(() => { hinted = true; if (mode === 'docked') dock.classList.remove('open'); }, 7000);
  // The dock changes width when it folds or opens; keep a resting robot on its pad.
  const rest = () => { if (mode === 'docked' || mode === 'parked') place(); };
  dock.addEventListener('transitionend', rest);
  dock.addEventListener('pointerenter', () => requestAnimationFrame(function follow() { rest(); if (dock.matches(':hover')) requestAnimationFrame(follow); }));

  dock.addEventListener('click', () => {
    if (mode === 'parked') { setMode('docked'); wake(); return; }
    bugs.forEach((b) => b.el.remove());
    bugs = []; bug = null; speck = null;
    cancelAnimationFrame(raf); raf = 0;
    place();
    setMode('parked');
  });

  if (roams) {
    const ready = () => { scatter(); setTimeout(wake, 2200); };
    if (document.readyState === 'complete') ready(); else addEventListener('load', ready);

    let scrollT = 0;
    addEventListener('scroll', () => { clearTimeout(scrollT); scrollT = window.setTimeout(wake, 450); }, { passive: true });
    let lastW = innerWidth, resizeT = 0;
    addEventListener('resize', () => {
      rest();
      if (innerWidth === lastW) return;
      lastW = innerWidth;
      clearTimeout(resizeT);
      resizeT = window.setTimeout(() => { scatter(); wake(); }, 400);
    });
    document.addEventListener('visibilitychange', () => !document.hidden && wake());

    document.addEventListener('click', (e) => {
      if (mode === 'parked' || mode === 'drag') return;
      const el = e.target as HTMLElement;
      if (el.closest('a, button, input, textarea, select, label, summary, .card, .repo, .quote, .bot, .dock, .nav, .portrait, .pipe, .ch')) return;
      if (getSelection()?.toString()) return;
      dropBug(e.clientX, e.clientY);
    });

    // Pick the robot up and move it. It vacuums whatever it is dragged over.
    bot.addEventListener('pointerdown', (e) => {
      if (mode === 'parked') return;
      bot.setPointerCapture(e.pointerId);
      cancelAnimationFrame(raf); raf = 0;
      if (mode === 'seek' && bug) bugs.push(bug);
      setMode('drag');
      e.preventDefault();
    });
    bot.addEventListener('pointermove', (e) => {
      if (mode !== 'drag') return;
      a += (e.movementX + e.movementY) * 0.01;
      x = e.clientX; y = e.clientY;
      collect();
      paint();
    });
    const release = () => { if (mode === 'drag') { mode = 'docked'; next(); } };
    bot.addEventListener('pointerup', release);
    bot.addEventListener('pointercancel', release);
  } else {
    // Phones: no room to roam, so there is no dust. The robot only reacts to a tap.
    addEventListener('resize', rest);
    bot.addEventListener('click', () => {
      bot.classList.remove('wiggle');
      void bot.offsetWidth;
      bot.classList.add('wiggle');
      say('beep');
    });
  }
}
