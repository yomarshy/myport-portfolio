const GAMES = [
  { id: 'hunt', title: 'Part Hunt', blurb: 'A clue appears. Tap the right part on the 3D bike before time runs out. Play on the outer shell or in x-ray.', tag: '3D · up to 10 rounds', best: ['hunt', 'hunt-x'] },
  { id: 'rush', title: 'Quiz Rush', blurb: 'Sixty seconds, as many questions as you can answer. Streaks add bonus points.', tag: 'Timed · 60 s', best: ['rush'] },
  { id: 'match', title: 'Function Match', blurb: 'Pair six parts with what they do. Fewer mistakes and a faster time score higher.', tag: 'Matching · 6 pairs', best: ['match'] },
  { id: 'path', title: 'Power Path', blurb: 'Put the energy journey in order, from the charge port to the road.', tag: 'Sequence · 6 steps', best: ['path'] }
];
const $ = s => document.querySelector(s);
const GAME_FN = {};

export function gameMenu(c) {
  c.page.innerHTML = '<div class="wrap"><div class="page-head"><div class="eyebrow">Practice</div><h1>Games</h1><p class="lead">Four ways to test what you learned. Every game earns XP, and your best scores are saved on this device.</p></div><div class="cards">' +
    GAMES.map(g => '<a class="card" href="#game-' + g.id + '" style="text-decoration:none;color:inherit"><span class="no">' + g.tag + '</span><h3>' + g.title + '</h3><p>' + g.blurb + '</p><div class="meta"><span>Best ' + (g.best.map(k => c.S.best[k]).filter(v => v != null).join(' / ') || '–') + '</span><span class="go">Play →</span></div></a>').join('') + '</div></div>';
}

export function startGame(id, c) {
  (GAME_FN[id] || (() => { location.hash = '#games'; }))(c);
}

const wrap = (c, html) => { c.page.innerHTML = '<div class="gwrap">' + html + '</div>'; };
const fin = (c, key, title, score, xp, extra, again) => {
  const isBest = c.best(key, score); c.addXP(xp, title);
  wrap(c, '<a class="back" href="#games">← All games</a><div class="res"><div class="eyebrow">' + title + ' · result</div><div class="big">' + score + '</div>' +
    '<div class="stat"><div><span>XP earned</span><b>+' + xp + '</b></div>' + (extra || '') + '<div><span>Best</span><b>' + c.S.best[key] + (isBest ? ' · new' : '') + '</b></div></div>' +
    '<div class="row"><button class="btn pri sm" id="again">Play again</button><a class="btn sm" href="#games">Other games</a></div></div>');
  $('#again').onclick = again;
};

/* ================= Part Hunt (uses the 3D stage) ================= */
GAME_FN.hunt = function (c) {
  const side = c.side, sc = c.scene, D = c.D;
  let timer = null;
  c.setStop(() => { clearInterval(timer); timer = null; if (sc) { sc.onPick = () => {}; sc.setFocus(null); } });
  if (!sc) { side.innerHTML = '<div class="pad"><p class="lead">This game needs the 3D view, which could not start in this browser. Try the other games.</p><a class="btn sm" href="#games">All games</a></div>'; return; }
  function intro() {
    sc.setFocus(null); c.setMode('solid'); sc.autoRotate = true; sc.home();
    side.innerHTML = '<div class="pad"><a class="back" href="#games">← All games</a><div class="eyebrow">3D game</div><h2 class="sec-title">Part Hunt</h2><p class="lead">You get a clue and 20 seconds. Tap the matching part on the bike. A wrong tap costs 3 seconds. Rotate and zoom freely while you hunt.</p>' +
      '<div class="row"><button class="btn pri sm" id="g1">Outer parts · 6 rounds</button><button class="btn sm" id="g2">X-ray · 10 rounds</button></div><p class="lead" style="margin-top:22px">Best: outer ' + (c.S.best.hunt ?? '–') + ' · x-ray ' + (c.S.best['hunt-x'] ?? '–') + '</p></div>';
    $('#g1').onclick = () => play('shell'); $('#g2').onclick = () => play('xray');
  }
  function play(kind) {
    const pool = c.shuffle(kind === 'shell' ? D.HUNT_SHELL : D.HUNT_SHELL.concat(D.HUNT_XRAY)).slice(0, kind === 'shell' ? 6 : 10);
    let i = 0, score = 0, right = 0, tries = 0, left = 20, locked = false;
    c.setMode(kind === 'shell' ? 'solid' : 'xray'); sc.autoRotate = false; sc.home();
    const tick = () => { const t = $('#tm'), b = $('#tb'); if (t) t.textContent = Math.max(0, Math.ceil(left)); if (b) b.style.width = Math.max(0, left / 20 * 100) + '%'; };
    function round() {
      locked = false; tries = 0; left = 20; sc.setFocus(null);
      const id = pool[i];
      side.innerHTML = '<div class="pad"><div class="hud"><span>Round <b>' + (i + 1) + '/' + pool.length + '</b></span><span>Score <b id="sc">' + score + '</b></span><span>Time <b id="tm">20</b></span></div><div class="timer"><i id="tb"></i></div><div class="eyebrow">Clue</div><h2 class="sec-title" style="text-transform:none;letter-spacing:.02em;font-size:24px;line-height:1.35">' + D.HUNT_CLUES[id] + '</h2><p class="lead" style="margin-top:18px">' + (kind === 'xray' ? 'You are in x-ray view. Hidden parts glow inside the shell.' : 'Drag to rotate if the part is hidden from view.') + '</p></div>';
      clearInterval(timer);
      timer = setInterval(() => { left -= 0.1; tick(); if (left <= 0) { clearInterval(timer); reveal(id, false, 'Time up'); } }, 100);
    }
    function reveal(id, ok, msg) {
      locked = true; clearInterval(timer); sc.setFocus([id]);
      c.banner(msg + ' · ' + D.PARTS[id].name, ok ? 'ok' : 'bad');
      setTimeout(() => { i++; i < pool.length ? round() : end(); }, 1500);
    }
    function end() {
      sc.onPick = () => {}; sc.setFocus(null); sc.autoRotate = true; c.setMode('solid');
      const key = kind === 'xray' ? 'hunt-x' : 'hunt', xp = Math.round(score / 10), isBest = c.best(key, score);
      c.addXP(xp, 'Part Hunt');
      side.innerHTML = '<div class="pad res"><div class="eyebrow">Part Hunt · ' + (kind === 'xray' ? 'x-ray' : 'outer parts') + '</div><div class="big">' + score + '</div><div class="stat"><div><span>Found</span><b>' + right + '/' + pool.length + '</b></div><div><span>XP</span><b>+' + xp + '</b></div><div><span>Best</span><b>' + c.S.best[key] + (isBest ? ' · new' : '') + '</b></div></div><div class="row"><button class="btn pri sm" id="again">Play again</button><a class="btn sm" href="#games">Other games</a></div></div>';
      $('#again').onclick = intro;
    }
    sc.onPick = id => {
      if (locked || !id) return;
      const want = pool[i];
      if (id === want) { const pts = Math.max(20, 100 + Math.round(left * 5) - tries * 30); score += pts; right++; reveal(want, true, '+' + pts); }
      else { tries++; left -= 3; tick(); c.banner('That is the ' + D.PARTS[id].name, 'bad'); }
    };
    round();
  }
  intro();
};

/* ================= Quiz Rush ================= */
GAME_FN.rush = function (c) {
  let timer = null; c.setStop(() => clearInterval(timer));
  const D = c.D;
  function intro() {
    wrap(c, '<a class="back" href="#games">← All games</a><div class="eyebrow">Timed quiz</div><h2 class="sec-title">Quiz Rush</h2><p class="lead">Answer as many questions as you can in 60 seconds. Each right answer scores 10 points, plus 2 for every answer in your streak (up to 10 extra). A wrong answer resets the streak.</p><div class="row"><button class="btn pri sm" id="go">Start</button></div><p class="lead" style="margin-top:22px">Best: ' + (c.S.best.rush ?? '–') + '</p>');
    $('#go').onclick = play;
  }
  function play() {
    const qs = c.shuffle(D.RUSH); let qi = 0, score = 0, streak = 0, right = 0, left = 60, lock = false;
    function show() {
      const q = qs[qi % qs.length], order = c.shuffle(q.o.map((t, i) => ({ t, i }))); lock = false;
      wrap(c, '<div class="hud"><span>Score <b>' + score + '</b></span><span>Streak <b>' + streak + '</b></span><span>Time <b id="tm">' + Math.ceil(left) + '</b></span></div><div class="timer"><i id="tb" style="width:' + left / 60 * 100 + '%"></i></div><div class="qwrap"><div class="q">' + q.q + '</div><div class="opts">' +
        order.map((o, k) => '<button class="opt" data-i="' + o.i + '"><span class="k">' + 'ABCD'[k] + '</span><span>' + o.t + '</span></button>').join('') + '</div><p class="why" id="why"></p></div>');
      c.page.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        if (lock) return; lock = true; const ok = +b.dataset.i === q.a;
        c.page.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.i === q.a) x.classList.add('right'); });
        if (ok) { score += 10 + Math.min(streak, 5) * 2; streak++; right++; } else { b.classList.add('wrong', 'shake'); streak = 0; $('#why').textContent = q.why; }
        setTimeout(() => { qi++; if (left > 0) show(); }, ok ? 450 : 1300);
      });
    }
    show();
    timer = setInterval(() => {
      left -= 0.1; const t = $('#tm'), b = $('#tb'); if (t) t.textContent = Math.max(0, Math.ceil(left)); if (b) b.style.width = Math.max(0, left / 60 * 100) + '%';
      if (left <= 0) { clearInterval(timer); fin(c, 'rush', 'Quiz Rush', score, Math.round(score / 6), '<div><span>Correct</span><b>' + right + '</b></div>', intro); }
    }, 100);
  }
  intro();
};

/* ================= Function Match ================= */
GAME_FN.match = function (c) {
  let timer = null; c.setStop(() => clearInterval(timer));
  const D = c.D;
  function intro() {
    wrap(c, '<a class="back" href="#games">← All games</a><div class="eyebrow">Matching</div><h2 class="sec-title">Function Match</h2><p class="lead">Tap a part on the left, then the job it does on the right. Start at 500 points. You lose 4 per second and 25 per mistake.</p><div class="row"><button class="btn pri sm" id="go">Start</button></div><p class="lead" style="margin-top:22px">Best: ' + (c.S.best.match ?? '–') + '</p>');
    $('#go').onclick = play;
  }
  function play() {
    const pairs = c.shuffle(D.MATCH).slice(0, 6), L = c.shuffle(pairs), R = c.shuffle(pairs);
    let pick = null, miss = 0, done = 0, t0 = performance.now();
    wrap(c, '<div class="hud"><span>Matched <b id="mc">0/6</b></span><span>Mistakes <b id="ms">0</b></span><span>Time <b id="tm">0</b>s</span></div><div class="mgrid"><div class="col" id="cl">' +
      L.map(p => '<button class="tile" data-k="' + p[0] + '">' + D.PARTS[p[0]].name + '</button>').join('') + '</div><div class="col" id="cr">' + R.map(p => '<button class="tile" data-k="' + p[0] + '">' + p[1] + '</button>').join('') + '</div></div>');
    const el = s => c.page.querySelector(s);
    clearInterval(timer); timer = setInterval(() => { const t = $('#tm'); if (t) t.textContent = Math.floor((performance.now() - t0) / 1000); }, 250);
    el('#cl').onclick = e => { const b = e.target.closest('.tile'); if (!b) return; el('#cl').querySelectorAll('.tile').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); pick = b; };
    el('#cr').onclick = e => {
      const b = e.target.closest('.tile'); if (!b || !pick) { if (b && !pick) c.toast('Pick a part on the left first'); return; }
      if (b.dataset.k === pick.dataset.k) { b.classList.add('done'); pick.classList.remove('sel'); pick.classList.add('done'); pick = null; done++; el('#mc').textContent = done + '/6';
        if (done === 6) { clearInterval(timer); const sec = Math.round((performance.now() - t0) / 1000), score = Math.max(50, 500 - sec * 4 - miss * 25); setTimeout(() => fin(c, 'match', 'Function Match', score, Math.round(score / 8), '<div><span>Time</span><b>' + sec + 's</b></div><div><span>Mistakes</span><b>' + miss + '</b></div>', intro), 500); } }
      else { miss++; el('#ms').textContent = miss; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); pick.classList.remove('sel'); pick = null; }
    };
  }
  intro();
};

/* ================= Power Path ================= */
GAME_FN.path = function (c) {
  c.setStop(() => {});
  const D = c.D;
  function intro() {
    wrap(c, '<a class="back" href="#games">← All games</a><div class="eyebrow">Sequence</div><h2 class="sec-title">Power Path</h2><p class="lead">Energy goes from the wall to the road through six stages. Tap the cards in the order the energy travels. Start at 300 points and lose 40 per mistake.</p><div class="row"><button class="btn pri sm" id="go">Start</button></div><p class="lead" style="margin-top:22px">Best: ' + (c.S.best.path ?? '–') + '</p>');
    $('#go').onclick = play;
  }
  function play() {
    const items = c.shuffle(D.POWER_PATH); let n = 0, miss = 0;
    wrap(c, '<div class="hud"><span>Placed <b id="pc">0/6</b></span><span>Mistakes <b id="pm">0</b></span></div><div class="eyebrow">Tap the cards, wall socket first</div><div class="mgrid" style="margin-top:14px"><div class="col" id="pool">' +
      items.map(it => '<button class="tile" data-id="' + it.id + '">' + it.label + '</button>').join('') + '</div><div class="col" id="slots">' + D.POWER_PATH.map((_, i) => '<div class="slot" data-i="' + i + '"><span>' + (i + 1) + '</span><span>' + (i === 0 ? 'Wall socket' : i === 5 ? 'Road' : '') + '</span></div>').join('') + '</div></div>');
    c.page.querySelector('#pool').onclick = e => {
      const b = e.target.closest('.tile'); if (!b || b.disabled) return;
      if (b.dataset.id === D.POWER_PATH[n].id) {
        const it = D.POWER_PATH[n], s = c.page.querySelector('.slot[data-i="' + n + '"]');
        s.className = 'slot filled'; s.innerHTML = '<span>' + (n + 1) + '</span><div><b>' + it.label + '</b><span>' + it.note + '</span></div>';
        b.classList.add('done'); b.disabled = true; n++; $('#pc').textContent = n + '/6';
        if (n === 6) { const score = Math.max(60, 300 - miss * 40); setTimeout(() => fin(c, 'path', 'Power Path', score, Math.round(score / 6), '<div><span>Mistakes</span><b>' + miss + '</b></div>', intro), 700); }
      } else { miss++; $('#pm').textContent = miss; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }
    };
  }
  intro();
};
