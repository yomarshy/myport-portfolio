// CodeLearn: lessons and progress live here; coding requests go to AgentCity's developer through the shared queue
// (stored on the server when node server.js is running, otherwise in this browser).
const tasksQueue = Shared.queues.tasks;
const PROGRESS_KEY = "codelearn-progress";
const QUIZ_KEY = "codelearn-quiz";
const courses = [
  { id: "html", title: "HTML Basics", lessons: ["Tags and elements", "Links and images", "Forms"], quiz: [
    { q: "Which tag creates a link?", options: ["<a>", "<link>", "<href>", "<url>"], answer: 0 },
    { q: "Which attribute gives an image its alternative text?", options: ["title", "alt", "src", "name"], answer: 1 },
    { q: "Which element wraps inputs so they can be submitted together?", options: ["<fieldset>", "<section>", "<form>", "<label>"], answer: 2 }
  ] },
  { id: "css", title: "CSS Layout", lessons: ["The box model", "Flexbox", "Grid"], quiz: [
    { q: "From the inside out, what is the order of the box model?", options: ["margin, border, padding, content", "content, padding, border, margin", "content, margin, padding, border", "padding, content, margin, border"], answer: 1 },
    { q: "Which declaration turns an element into a flex container?", options: ["display: flex;", "flex: container;", "position: flex;", "layout: flex;"], answer: 0 },
    { q: "Which rule creates three equal grid columns?", options: ["grid-columns: 3;", "grid-template-columns: repeat(3, 1fr);", "columns: grid 3;", "display: grid-3;"], answer: 1 }
  ] },
  { id: "js", title: "JavaScript Fundamentals", lessons: ["Variables and types", "Functions", "DOM events"], quiz: [
    { q: "Which keyword declares a block-scoped variable you can reassign?", options: ["var", "const", "let", "static"], answer: 2 },
    { q: "What does a function return if it has no return statement?", options: ["null", "0", "undefined", "an empty string"], answer: 2 },
    { q: "Which method attaches a click handler to an element?", options: ["onClickAdd()", "addEventListener()", "attachEvent()", "listen()"], answer: 1 }
  ] }
];
let openQuizId = null;
const aiQuizzes = {}; // courseId -> { quiz, loading, error }
let lastCompleted = new Set();
const $ = id => document.getElementById(id);

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (error) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; }
}

async function sendTask(title) {
  const saved = await tasksQueue.add({ id: `elearn-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, title, status: "New", sentAt: new Date().toISOString() });
  if (!saved) return;
  Shared.toast("💻 Sent to the developer in AgentCity.");
  window.open("../AgentCity/index.html", "agentcity-tab");
}

const toast = Shared.toast;

function renderQuiz(course, quizScores) {
  const form = el("form", "quiz");
  form.append(el("h3", "", `${course.title} quiz`));
  course.quiz.forEach((item, qi) => {
    const fieldset = el("fieldset");
    fieldset.append(el("legend", "", `${qi + 1}. ${item.q}`));
    item.options.forEach((option, oi) => {
      const label = el("label", "quiz-option");
      const radio = document.createElement("input");
      radio.type = "radio"; radio.name = `q${qi}`; radio.value = String(oi);
      label.append(radio, el("span", "", option));
      fieldset.append(label);
    });
    fieldset.append(el("p", "quiz-feedback"));
    form.append(fieldset);
  });
  const submit = el("button", "", "Check answers");
  submit.type = "submit";
  const result = el("p", "quiz-result");
  result.setAttribute("aria-live", "polite");
  form.append(submit, result);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    let score = 0, unanswered = 0;
    course.quiz.forEach((item, qi) => {
      const picked = data.get(`q${qi}`);
      const feedback = form.querySelectorAll(".quiz-feedback")[qi];
      if (picked === null) { unanswered++; feedback.textContent = "Pick an answer."; feedback.className = "quiz-feedback bad"; return; }
      if (Number(picked) === item.answer) { score++; feedback.textContent = "✅ Correct"; feedback.className = "quiz-feedback good"; }
      else { feedback.textContent = `❌ The answer is: ${item.options[item.answer]}`; feedback.className = "quiz-feedback bad"; }
    });
    if (unanswered) { result.textContent = `Answer all ${course.quiz.length} questions to see your score.`; return; }
    result.textContent = `You scored ${score} out of ${course.quiz.length}.`;
    const scores = load(QUIZ_KEY, {});
    const best = Math.max(score, Number(scores[course.id]) || 0);
    scores[course.id] = best; save(QUIZ_KEY, scores);
    if (score === course.quiz.length) toast(`🏅 Perfect score on the ${course.title} quiz!`);
    $("progress-text").textContent = progressText();
    updateBadges();
  });
  return form;
}

async function generateQuiz(course) {
  aiQuizzes[course.id] = { loading: true };
  renderCourses();
  try {
    const data = await Shared.ai("/api/quiz", { course: course.title, lessons: course.lessons, count: 5, avoid: course.quiz.map(q => q.q) });
    aiQuizzes[course.id] = { quiz: data.quiz };
  } catch (error) {
    aiQuizzes[course.id] = { error: error.message };
  }
  renderCourses();
}

function progressText() {
  const progress = load(PROGRESS_KEY, {});
  let total = 0, done = 0;
  courses.forEach(c => c.lessons.forEach((_, i) => { total++; if (progress[c.id + i]) done++; }));
  return `${done} of ${total} lessons complete`;
}

function updateBadges() {
  const progress = load(PROGRESS_KEY, {});
  const scores = load(QUIZ_KEY, {});
  let badges = 0;
  courses.forEach((c) => {
    if (c.lessons.every((_, i) => progress[c.id + i])) badges++;
    if ((Number(scores[c.id]) || 0) === c.quiz.length) badges++;
  });
  $("badges").textContent = badges ? `🏅 ${badges} badge${badges === 1 ? "" : "s"} earned (course complete + perfect quiz)` : "🏅 No badges yet: finish a course or ace a quiz.";
}

function renderCourses(first) {
  const progress = load(PROGRESS_KEY, {});
  const scores = load(QUIZ_KEY, {});
  const box = $("courses");
  box.innerHTML = "";
  let total = 0, done = 0;
  const completedNow = new Set();
  courses.forEach((course) => {
    const card = el("article", "course");
    card.append(el("h2", "", course.title));
    let courseDone = 0;
    course.lessons.forEach((lesson, i) => {
      const id = course.id + i;
      total++; if (progress[id]) { done++; courseDone++; }
      const row = el("div", "lesson");
      const label = el("label");
      const box2 = document.createElement("input");
      box2.type = "checkbox"; box2.checked = !!progress[id];
      box2.addEventListener("change", () => {
        const p = load(PROGRESS_KEY, {}); p[id] = box2.checked; save(PROGRESS_KEY, p); renderCourses();
      });
      label.append(box2, el("span", "", lesson));
      const ask = el("button", "ask", "💻 Ask dev for practice");
      ask.type = "button";
      ask.addEventListener("click", () => sendTask(`Practice exercise: ${course.title} – ${lesson}`));
      row.append(label, ask);
      card.append(row);
    });

    if (courseDone === course.lessons.length) {
      completedNow.add(course.id);
      card.classList.add("is-complete");
      card.append(el("p", "course-complete", "🎉 Course complete!"));
    }

    const best = Number(scores[course.id]) || 0;
    const quizButton = el("button", "ask quiz-toggle", openQuizId === course.id ? "Hide quiz"
      : best ? `📝 Retake quiz (best ${best}/${course.quiz.length})` : "📝 Take the quiz");
    quizButton.type = "button";
    quizButton.addEventListener("click", () => { openQuizId = openQuizId === course.id ? null : course.id; renderCourses(); });
    card.append(quizButton);
    if (openQuizId === course.id) card.append(renderQuiz(course, scores));
    const ai = aiQuizzes[course.id];
    const aiButton = el("button", "ask", ai && ai.loading ? "✨ Writing questions…" : ai && ai.quiz ? "✨ New AI quiz" : "✨ AI quiz (new questions)");
    aiButton.type = "button"; aiButton.disabled = !!(ai && ai.loading);
    aiButton.addEventListener("click", () => generateQuiz(course));
    card.append(aiButton);
    if (ai && ai.error) card.append(el("p", "quiz-feedback bad", ai.error));
    if (ai && ai.quiz) {
      const aiBest = Number(scores[course.id + "-ai"]) || 0;
      card.append(el("p", "quiz-ai-note", `Written by Claude just now${aiBest ? ` · best on an AI quiz: ${aiBest}` : ""}. Not counted toward badges.`));
      card.append(renderQuiz({ id: course.id + "-ai", title: course.title + " (AI)", quiz: ai.quiz }, scores));
    }
    box.append(card);
  });
  // celebrate a course that just became complete (not on first page load)
  if (!first) completedNow.forEach(id => { if (!lastCompleted.has(id)) toast(`🎉 ${courses.find(c => c.id === id).title} complete!`); });
  lastCompleted = completedNow;
  $("progress-text").textContent = `${done} of ${total} lessons complete`;
  $("progress-fill").style.width = (total ? (done / total) * 100 : 0) + "%";
  updateBadges();
}

function renderTasks(tasks) {
  const box = $("tasks");
  box.innerHTML = "";
  if (!tasks || tasks.length === 0) { box.append(el("p", "hint", "No requests yet.")); return; }
  const ordered = [...tasks.filter(t => t.status !== "Done"), ...tasks.filter(t => t.status === "Done").reverse()];
  ordered.slice(0, 8).forEach((t) => {
    const row = el("div", "task" + (t.status === "Done" ? " is-done" : ""));
    row.append(el("span", "", t.title), el("span", "status status-" + String(t.status).toLowerCase(), t.status));
    if (t.result) {
      const view = el("button", "ask", "▶ View code result");
      view.type = "button";
      // Sandboxed iframe without allow-same-origin: AI-written code cannot touch this site's data.
      view.addEventListener("click", () => { $("preview").srcdoc = t.result; $("preview-box").hidden = false; $("preview-box").scrollIntoView({ behavior: "smooth", block: "nearest" }); });
      row.append(view);
    }
    box.append(row);
  });
}

$("preview-close").addEventListener("click", () => { $("preview-box").hidden = true; $("preview").srcdoc = ""; });

$("req-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = $("req-input").value.trim();
  if (!text) return;
  sendTask(text);
  $("req-input").value = "";
});

$("origin").textContent = location.protocol === "file:"
  ? "Opened as a file: use node server.js (or VS Code Live Server) so AgentCity can receive requests."
  : "Checking where requests are saved…";
tasksQueue.ready.then(() => {
  if (location.protocol === "file:") return;
  $("origin").textContent = tasksQueue.mode === "server"
    ? "📡 Saved on the server: any device on this address sees these requests."
    : `💾 Saved in this browser only (${location.host}). Start node server.js to share between devices.`;
});

renderCourses(true);
tasksQueue.subscribe(renderTasks);


/* ---------- Live code editor ---------- */
const EDITOR_KEY = "codelearn-editor";
const TEMPLATES = {
  "HTML basics": `<h1>Hello CodeLearn</h1>\n<p>Edit me, then press Run.</p>\n<a href="https://example.com">A link</a>\n<img alt="Placeholder" width="120" height="60" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60'%3E%3Crect width='120' height='60' fill='%23176B45'/%3E%3C/svg%3E">`,
  "CSS flexbox": `<style>\n  .row { display: flex; gap: 10px; justify-content: space-between; align-items: center; }\n  .box { padding: 20px; background: #176B45; color: white; border-radius: 8px; }\n</style>\n<div class="row">\n  <div class="box">One</div>\n  <div class="box">Two</div>\n  <div class="box">Three</div>\n</div>`,
  "CSS grid": `<style>\n  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }\n  .grid div { padding: 24px; background: #E7F1E8; text-align: center; border-radius: 8px; }\n</style>\n<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>`,
  "JavaScript DOM": `<button id="btn">Click me</button>\n<p id="out">Clicks: 0</p>\n<script>\n  let n = 0;\n  document.getElementById("btn").addEventListener("click", () => {\n    n++;\n    document.getElementById("out").textContent = "Clicks: " + n;\n    console.log("clicked", n);\n  });\n<\/script>`
};
(function setupEditor() {
  const code = $("ed-code"), frame = $("ed-frame"), out = $("ed-console"), pick = $("ed-template");
  pick.innerHTML = Object.keys(TEMPLATES).map(k => `<option>${k}</option>`).join("");
  const saved = load(EDITOR_KEY, null);
  if (saved && typeof saved.code === "string") { code.value = saved.code; if (TEMPLATES[saved.template]) pick.value = saved.template; }
  else code.value = TEMPLATES[pick.value];
  const store = () => save(EDITOR_KEY, { code: code.value, template: pick.value });

  // Runs inside the sandboxed iframe (no access to this site's data) and reports console output and errors back.
  const bridge = `<script>(function(){var s=function(t,a){try{parent.postMessage({codelearn:1,type:t,text:Array.prototype.map.call(a,function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(" ")},"*")}catch(e){}};` +
    `["log","info","warn","error"].forEach(function(k){var o=console[k];console[k]=function(){s(k==="error"?"err":"log",arguments);o.apply(console,arguments)}});` +
    `window.addEventListener("error",function(e){s("err",[e.message+" (line "+e.lineno+")"])});window.addEventListener("unhandledrejection",function(e){s("err",["Unhandled: "+e.reason])});})();<\/script>`;
  function run() {
    out.textContent = ""; store();
    frame.srcdoc = bridge + code.value;
  }
  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow || !event.data || event.data.codelearn !== 1) return;
    const line = el("div", event.data.type === "err" ? "err" : "", String(event.data.text).slice(0, 500));
    if (out.childElementCount > 200) out.firstChild.remove();
    out.append(line); out.scrollTop = out.scrollHeight;
  });
  $("ed-run").addEventListener("click", run);
  $("ed-reset").addEventListener("click", () => { code.value = TEMPLATES[pick.value]; run(); });
  pick.addEventListener("change", () => { code.value = TEMPLATES[pick.value]; run(); });
  code.addEventListener("input", store);
  code.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); run(); return; }
    if (event.key === "Tab" && !event.shiftKey) {
      if (code.dataset.esc === "1") { delete code.dataset.esc; return; } // Tab inserts spaces; Esc then Tab leaves the box (keyboard users)
      event.preventDefault();
      const { selectionStart: a, selectionEnd: b } = code;
      code.setRangeText("  ", a, b, "end");
      store();
    }
  });
  code.addEventListener("keydown", (event) => { if (event.key === "Escape") code.dataset.esc = "1"; });
  run();
})();
