import { PiggoScene } from './scene.js';
import { INTERNALS, EXPLODE } from './internals.js';
import * as D from './data.js';
import { gameMenu, startGame } from './games.js';
import MODEL_B64 from './model.js';

const $ = s => document.querySelector(s);
const app = $('#app'), side = $('#side'), page = $('#page'), hot = $('#hot'), hero = $('#hero'), hint = $('#hint');
const modesEl = $('#modes');

/* ---------- progress store (per-viewer, local) ---------- */
const KEY = 'piggo-course-v1';
const S = { xp: 0, mods: {}, best: {} };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const level = () => { let L = D.LEVELS[0], i = 0; D.LEVELS.forEach((l, k) => { if (S.xp >= l.xp) { L = l; i = k; } }); const nx = D.LEVELS[i + 1]; return { L, i, nx, pct: nx ? (S.xp - L.xp) / (nx.xp - L.xp) : 1 }; };
function renderXP() { const v = level(); $('#xpNum').textContent = S.xp; $('#lvlName').textContent = v.L.name; $('#xpBar').style.width = Math.round(v.pct * 100) + '%'; }
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200); }
function addXP(n, why) { if (n <= 0) return; S.xp += n; save(); renderXP(); toast('+' + n + ' XP · ' + why); }
let banT;
function banner(t, kind) { const b = $('#banner'); b.textContent = t; b.className = 'banner on ' + (kind || ''); clearTimeout(banT); banT = setTimeout(() => b.classList.remove('on'), 1600); }
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const hidden = id => D.PARTS[id].group === 'hidden';

/* ---------- scene ---------- */
let scene = null, sel = null;
const dots = {};
function buildDots() {
  D.PART_ORDER.forEach(id => {
    const b = document.createElement('button'); b.className = 'dot' + (hidden(id) ? ' hid' : ''); b.dataset.id = id;
    b.setAttribute('aria-label', D.PARTS[id].name); b.innerHTML = '<span class="lbl">' + D.PARTS[id].name + '</span>';
    b.addEventListener('click', e => { e.stopPropagation(); if (route.k === 'explore') select(sel === id ? null : id); });
    hot.appendChild(b); dots[id] = b;
  });
}
function updateDots() {
  const show = route.k === 'explore';
  for (const id in dots) {
    const d = dots[id], p = D.PARTS[id];
    let on = show && scene && scene.parts[id];
    if (on && hidden(id) && scene.mode === 'solid') on = false;
    const pr = on ? scene.project(id) : null;
    if (!pr || pr.behind) { d.classList.remove('on'); d.style.pointerEvents = 'none'; continue; }
    d.classList.add('on'); d.style.pointerEvents = 'auto';
    d.style.transform = 'translate(' + pr.x.toFixed(1) + 'px,' + pr.y.toFixed(1) + 'px)';
    d.classList.toggle('sel', sel === id);
  }
}
function setMode(m) {
  scene && scene.setMode(m);
  modesEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
  if (m === 'explode') scene.flyTo([7.4, 3.0, 6.6], [0, 0.85, 0.2]);
}
modesEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; setMode(b.dataset.m); if (route.k === 'explore') { hero.classList.add('off'); scene.setShift(0); } });
$('#reset').addEventListener('click', () => { if (!scene) return; scene.home(); if (route.k === 'explore') { select(null); } });

/* ---------- routing ---------- */
const route = { k: 'explore', id: null };
function parse() {
  const h = (location.hash || '#explore').slice(1);
  if (h.startsWith('lesson-')) return { k: 'lesson', id: h.slice(7) };
  if (h.startsWith('game-')) return { k: 'game', id: h.slice(5) };
  return { k: ['explore', 'course', 'games', 'progress'].includes(h) ? h : 'explore', id: null };
}
function go() {
  stopGame();
  const r = parse(); route.k = r.k; route.id = r.id;
  const navK = { explore: 'explore', course: 'course', lesson: 'course', games: 'games', game: 'games', progress: 'progress' }[r.k];
  document.querySelectorAll('#nav a').forEach(a => { if (a.dataset.k === navK) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const staged = ['explore', 'lesson'].includes(r.k) || (r.k === 'game' && r.id === 'hunt');
  app.dataset.view = staged ? 'stage' : 'page';
  hero.classList.toggle('off', r.k !== 'explore'); scene && scene.setShift(r.k === 'explore' ? 0.17 : 0);
  hint.hidden = r.k !== 'explore';
  document.querySelector('.modes').style.display = (r.k === 'game') ? 'none' : '';
  if (scene) { scene.onPick = () => {}; scene.setFocus(null); scene.pickable = null; sel = null; scene.resize(); }
  page.scrollTop = 0; app.scrollTop = 0;
  if (r.k === 'explore') { setMode('solid'); scene && (scene.autoRotate = true); scene && scene.home(); scene && (scene.onPick = id => select(id === sel ? null : id)); renderExplore(); }
  else if (r.k === 'lesson') { lesson(r.id, 0); }
  else if (r.k === 'course') renderCourse();
  else if (r.k === 'games') gameMenu(ctx);
  else if (r.k === 'game') startGame(r.id, ctx);
  else if (r.k === 'progress') renderProgress();
}
let stopFn = null;
function stopGame() { if (stopFn) { stopFn(); stopFn = null; } }
addEventListener('hashchange', go);

/* ---------- explore ---------- */
function partItem(id, i) { const p = D.PARTS[id]; return '<li><button data-id="' + id + '"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><span class="t">' + p.name + '</span><span class="s">' + p.system + '</span></button></li>'; }
function renderExplore() {
  if (!sel) {
    let i = 0;
    const g = k => D.PART_ORDER.filter(id => D.PARTS[id].group === k).map(id => partItem(id, i++)).join('');
    side.innerHTML = '<div class="pad"><div class="eyebrow">Parts library</div><h2 class="sec-title">Know every part</h2><p class="lead">Tap a part on the bike or pick one below. Hidden systems switch the view to x-ray for you.</p>' +
      '<div class="group"><h3><span>' + D.GROUPS.shell + '</span><span>6</span></h3><ul class="plist">' + g('shell') + '</ul></div>' +
      '<div class="group"><h3><span>' + D.GROUPS.hidden + '</span><span>7</span></h3><ul class="plist">' + g('hidden') + '</ul></div></div>';
    side.querySelectorAll('.plist button').forEach(b => { b.onclick = () => select(b.dataset.id); b.onmouseenter = () => scene && (scene.hiSet = [b.dataset.id]); b.onmouseleave = () => scene && (scene.hiSet = null); });
  } else {
    const p = D.PARTS[sel], hid = hidden(sel);
    const mod = D.MODULES.find(m => m.steps.some(s => s.parts[0] === sel) ) || D.MODULES.find(m => m.steps.some(s => s.parts.includes(sel)));
    side.innerHTML = '<div class="pad detail"><button class="back" id="bk">← All parts</button><span class="sys ' + (hid ? 'hid' : '') + '">' + p.system + (hid ? ' · x-ray' : '') + '</span><h2>' + p.name + '</h2><p class="short">' + p.short + '</p>' +
      '<h4>What it is</h4><p>' + p.what + '</p><h4>How it works</h4><ul>' + p.how.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
      '<h4>Key facts</h4><dl class="facts">' + p.facts.map(f => '<dt>' + f[0] + '</dt><dd>' + f[1] + '</dd>').join('') + '</dl>' +
      '<div class="watch"><b>Watch for</b>' + p.watch + '</div>' +
      '<div class="row">' + (mod ? '<a class="btn sm pri" href="#lesson-' + mod.id + '">Learn in: ' + mod.title + '</a>' : '') + '<a class="btn sm" href="#game-hunt">Play Part Hunt</a></div></div>';
    $('#bk').onclick = () => select(null);
  }
  side.scrollTop = 0;
}
function select(id) {
  sel = id; scene.setFocus(id ? [id] : null);
  if (id) {
    hero.classList.add('off'); scene.setShift(0); scene.autoRotate = false;
    if (hidden(id) && scene.mode === 'solid') setMode('xray');
    if (scene.mode === 'explode') scene.flyToPart(id); else scene.flyTo(...D.PARTS[id].cam);
  } else if (scene.mode !== 'explode') { scene.home(); }
  renderExplore();
}

/* ---------- course ---------- */
const modState = id => S.mods[id] || null;
function renderCourse() {
  const done = D.MODULES.filter(m => modState(m.id)).length;
  page.innerHTML = '<div class="wrap"><div class="page-head"><div class="eyebrow">' + done + ' of ' + D.MODULES.length + ' modules complete</div><h1>Course</h1><p class="lead">Eight short modules. Each one moves the 3D bike to the part being taught, then ends with a quick quiz.</p></div><div class="cards">' +
    D.MODULES.map((m, i) => { const st = modState(m.id); return '<a class="card" href="#lesson-' + m.id + '" style="text-decoration:none;color:inherit"><span class="no">Module ' + (i + 1) + '</span><h3>' + m.title + '</h3><p>' + m.blurb + '</p><div class="meta"><span>' + m.steps.length + ' steps · ' + m.quiz.length + ' questions</span>' + (st ? '<span class="ok">Done ' + st.score + '/' + m.quiz.length + '</span>' : '<span class="go">Start →</span>') + '</div></a>'; }).join('') + '</div></div>';
}

function lesson(mid, si) {
  const m = D.MODULES.find(x => x.id === mid); if (!m) { location.hash = '#course'; return; }
  const n = D.MODULES.indexOf(m), st = m.steps[si];
  scene.autoRotate = false;
  scene.setFocus(st.parts.length > 5 ? null : st.parts);
  setMode(st.view);
  if (st.parts.length > 3) scene.home(); else scene.flyTo(...D.PARTS[st.parts[0]].cam);
  const last = si === m.steps.length - 1;
  side.innerHTML = '<div class="pad lesson"><div class="eyebrow">Module ' + (n + 1) + ' · ' + m.title + '</div><div class="steps" style="margin-top:14px">' + m.steps.map((_, i) => '<i class="' + (i < si ? 'done' : i === si ? 'on' : '') + '"></i>').join('') + '</div>' +
    '<h2>' + st.title + '</h2>' + st.text.map(t => '<p>' + t + '</p>').join('') +
    '<div class="chips">' + st.parts.map(id => '<span class="chip ' + (hidden(id) ? 'hid' : '') + '">' + D.PARTS[id].name + '</span>').join('') + '</div>' +
    '<div class="nav2"><button class="btn sm" id="pv" ' + (si ? '' : 'disabled') + '>Back</button><button class="btn sm pri" id="nx">' + (last ? 'Take the quiz' : 'Next') + '</button></div>' +
    '<div class="row"><a class="back" href="#course">← All modules</a></div></div>';
  $('#pv').onclick = () => lesson(mid, si - 1);
  $('#nx').onclick = () => last ? quiz(m, 0, 0) : lesson(mid, si + 1);
  scene.onPick = id => { if (id) banner(D.PARTS[id].name, ''); };
  side.scrollTop = 0;
}
function quiz(m, qi, score) {
  scene.setFocus(null); scene.home();
  const q = m.quiz[qi], n = D.MODULES.indexOf(m);
  const order = shuffle(q.o.map((t, i) => ({ t, i })));
  side.innerHTML = '<div class="pad qwrap"><div class="eyebrow">Module ' + (n + 1) + ' quiz · ' + (qi + 1) + ' of ' + m.quiz.length + '</div><div class="q">' + q.q + '</div><div class="opts">' +
    order.map((o, k) => '<button class="opt" data-i="' + o.i + '"><span class="k">' + 'ABCD'[k] + '</span><span>' + o.t + '</span></button>').join('') + '</div><p class="why" id="why"></p><div class="nav2"><span></span><button class="btn sm pri" id="nq" hidden>' + (qi === m.quiz.length - 1 ? 'See result' : 'Next question') + '</button></div></div>';
  let answered = false;
  side.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (answered) return; answered = true; const ok = +b.dataset.i === q.a;
    side.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.i === q.a) x.classList.add('right'); });
    if (!ok) { b.classList.add('wrong', 'shake'); }
    $('#why').textContent = (ok ? 'Correct. ' : 'Not quite. ') + q.why; if (ok) score++;
    $('#nq').hidden = false; $('#nq').focus();
  });
  $('#nq').onclick = () => qi === m.quiz.length - 1 ? result(m, score) : quiz(m, qi + 1, score);
  side.scrollTop = 0;
}
function result(m, score) {
  const first = !S.mods[m.id], prev = S.mods[m.id] ? S.mods[m.id].score : -1;
  const gain = score * 15 + (first ? 25 : 0);
  S.mods[m.id] = { score: Math.max(score, prev) }; save(); addXP(gain, 'Module ' + (D.MODULES.indexOf(m) + 1));
  const i = D.MODULES.indexOf(m), nx = D.MODULES[i + 1];
  side.innerHTML = '<div class="pad res"><div class="eyebrow">Module ' + (i + 1) + ' complete</div><div class="big">' + score + '/' + m.quiz.length + '</div><p class="lead">' + (score === m.quiz.length ? 'Perfect score. You know this system.' : score >= 2 ? 'Solid. Review the steps once more to lock it in.' : 'Worth another pass through the lesson steps.') + '</p><div class="row">' + (nx ? '<a class="btn pri sm" href="#lesson-' + nx.id + '">Next: ' + nx.title + '</a>' : '<a class="btn pri sm" href="#games">Play the games</a>') + '<button class="btn sm" id="rt">Retake quiz</button><a class="btn sm" href="#course">All modules</a></div></div>';
  $('#rt').onclick = () => quiz(m, 0, 0);
}

/* ---------- progress ---------- */
function renderProgress() {
  const v = level(), done = D.MODULES.filter(m => S.mods[m.id]).length;
  const bestRows = [['hunt', 'Part Hunt (shell)'], ['hunt-x', 'Part Hunt (x-ray)'], ['rush', 'Quiz Rush'], ['match', 'Function Match'], ['path', 'Power Path']];
  page.innerHTML = '<div class="wrap"><div class="page-head"><div class="eyebrow">Your progress</div><h1>' + v.L.name + '</h1></div>' +
    '<div class="lvl"><div class="eyebrow">' + S.xp + ' XP' + (v.nx ? ' · ' + (v.nx.xp - S.xp) + ' to ' + v.nx.name : ' · top level') + '</div><div class="bigbar"><i style="width:' + Math.round(v.pct * 100) + '%"></i></div></div>' +
    '<div class="tscroll"><table class="t"><thead><tr><th>Module</th><th>Status</th><th>Quiz</th></tr></thead><tbody>' +
    D.MODULES.map((m, i) => { const s = S.mods[m.id]; return '<tr><td><a href="#lesson-' + m.id + '" style="color:inherit">' + (i + 1) + '. ' + m.title + '</a></td><td>' + (s ? 'Complete' : 'Not started') + '</td><td>' + (s ? s.score + '/' + m.quiz.length : '–') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    '<div class="tscroll" style="margin-top:44px"><table class="t"><thead><tr><th>Game</th><th>Best score</th></tr></thead><tbody>' + bestRows.map(r => '<tr><td>' + r[1] + '</td><td>' + (S.best[r[0]] ?? '–') + '</td></tr>').join('') + '</tbody></table></div>' +
    '<div class="row"><span class="eyebrow" style="align-self:center">' + done + ' of ' + D.MODULES.length + ' modules done</span><button class="btn sm" id="rs">Reset progress</button></div></div>';
  $('#rs').onclick = function () { if (this.dataset.armed) { S.xp = 0; S.mods = {}; S.best = {}; save(); renderXP(); renderProgress(); } else { this.dataset.armed = 1; this.textContent = 'Tap again to erase'; } };
}

/* ---------- context for games ---------- */
const ctx = {
  D, S, save, addXP, toast, banner, shuffle, hidden, page, side,
  get scene() { return scene; }, setMode,
  setStop(fn) { stopFn = fn; }, best(k, v) { if (!(S.best[k] >= v)) { S.best[k] = v; save(); return true; } return false; }
};

/* ---------- boot ---------- */
renderXP();
buildDots();
(async function boot() {
  try {
    scene = new PiggoScene($('#cv'), { internals: INTERNALS, explode: EXPLODE, onPick: id => select(id === sel ? null : id), onHover: id => { dots[id] && 0; document.querySelectorAll('.dot').forEach(d => d.classList.toggle('tip', d.dataset.id === id)); }, onFrame: updateDots });
    await scene.load(MODEL_B64, './tex/');
    $('#loading').classList.add('off');
  } catch (e) {
    console.error(e);
    $('#loading').innerHTML = '<span style="letter-spacing:.1em;text-transform:none;max-width:34ch;text-align:center;line-height:1.6">The 3D view could not start in this browser. The lessons and games still work.</span>';
  }
  go();
})();
