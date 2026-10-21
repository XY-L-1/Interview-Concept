window.mountFoundations = function(scope, D) {
  'use strict';
  const document = scope;
  const K = window.KIT;
  const { e, p } = K;
  const KEY = 'simple-ai-foundations-progress-v1';
  const root = document.querySelector('#workspace');
  const questions = Array.isArray(D.questions) ? D.questions : [];
  const modules = Array.isArray(D.modules) ? [...D.modules].sort((a, b) => a.order - b.order) : [];
  const byId = new Map(questions.map(q => [q.id, q]));
  const isResume = q => q.module.startsWith('resume-');
  const resumeModules = modules.filter(m => m.id.startsWith('resume-'));
  const eligible = q => Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4;
  const initialModule = modules.find(m => /voice/i.test(m.id)) || modules[0];
  const state = { view: resumeModules.length ? 'resume' : 'learn', module: resumeModules[0]?.id || initialModule?.id || '', question: '', query: '', priority: 'all', session: null };
  const ratingNames = ['需要练习', '基本理解', '能独立解释'];
  let storageWarning = false;
  let noteTimer;

  function normalize(input, importing = false) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('请选择进度 JSON 文件。');
    if (input.kind !== 'foundations-progress' || input.schemaVersion !== 1) throw new Error('文件不是兼容的 Foundations 进度文件。');
    if (!input.questions || typeof input.questions !== 'object' || Array.isArray(input.questions)) throw new Error('文件缺少有效的题目进度。');
    const out = { kind: 'foundations-progress', schemaVersion: 1, updatedAt: input.updatedAt || null, questions: {} };
    Object.entries(input.questions).forEach(([id, value]) => {
      const q = byId.get(id);
      if (!q || !value || typeof value !== 'object') return;
      const item = {};
      if (Number.isInteger(value.rating) && value.rating >= 0 && value.rating <= 2) item.rating = value.rating;
      if (typeof value.notes === 'string') item.notes = value.notes.slice(0, 30000);
      const last = value.latestQuiz;
      if (eligible(q) && last && Number.isInteger(last.selectedIndex) && last.selectedIndex >= 0 && last.selectedIndex < 4) {
        item.latestQuiz = { selectedIndex: last.selectedIndex, correct: last.selectedIndex === q.correctIndex, answeredAt: typeof last.answeredAt === 'string' ? last.answeredAt : null };
      }
      if (Object.keys(item).length) out.questions[id] = item;
    });
    if (importing && Object.keys(input.questions).length && !Object.keys(out.questions).length) throw new Error('文件中没有与当前题库匹配的有效进度。');
    return out;
  }

  let progress;
  try { progress = normalize(K.read(KEY, null)); }
  catch (_) { progress = { kind: 'foundations-progress', schemaVersion: 1, updatedAt: null, questions: {} }; }
  function entry(id) { return progress.questions[id] || {}; }
  function save() {
    progress.updatedAt = new Date().toISOString();
    const ok = K.write(KEY, progress);
    if (!ok && !storageWarning) { storageWarning = true; K.toast('浏览器无法保存进度。本次仍可练习，请导出进度文件保留记录。'); }
    return ok;
  }
  function patch(id, value) { progress.questions[id] = { ...entry(id), ...value }; return save(); }
  function moduleQuestions(id) { return questions.filter(q => q.module === id); }
  function weakQuestions() { return questions.filter(q => entry(q.id).rating === 0 || entry(q.id).latestQuiz?.correct === false); }
  function badge(q) {
    const item = entry(q.id);
    const text = item.rating === undefined ? '尚未自评' : `自评 · ${ratingNames[item.rating]}`;
    return `${text}${item.latestQuiz ? ` · 上次答${item.latestQuiz.correct ? '对' : '错'}` : ''}`;
  }
  function list(items) { return `<ul class="foundation-list">${(items || []).map(x => `<li>${e(x)}</li>`).join('')}</ul>`; }
  function sources(ids) { return K.sources(D, Array.isArray(ids) ? ids : []); }
  function moduleTabs() {
    const visible = modules.filter(m => m.id.startsWith('resume-') === (state.view === 'resume'));
    return `<div class="module-tabs" role="group" aria-label="选择学习模块">${visible.map(m => `<button class="tab ${m.id === state.module ? 'active' : ''}" data-action="module" data-id="${e(m.id)}" aria-pressed="${m.id === state.module}">${e(m.title)}</button>`).join('')}</div>`;
  }
  function importBox() {
    return `<div class="foundation-transfer"><div><strong>备份与迁移</strong><p class="muted">进度只保存在当前浏览器。导出后可以带到其他浏览器；导入会合并题目记录，同一道题以导入记录为准。</p></div><label class="btn btn-quiet foundation-import">导入进度<input type="file" id="progress-import" accept="application/json,.json"></label></div>`;
  }

  function renderLearn() {
    const resume = state.view === 'resume';
    if (!modules.some(m => m.id === state.module && m.id.startsWith('resume-') === resume)) {
      state.module = modules.find(m => m.id.startsWith('resume-') === resume)?.id || '';
      state.question = ''; state.query = '';
    }
    const m = modules.find(x => x.id === state.module);
    const all = moduleQuestions(state.module);
    const term = state.query.trim().toLowerCase();
    const items = all.filter(q => (!resume || state.priority === 'all' || q.priority === 'first') && `${q.title} ${q.lesson} ${q.englishAnswer} ${q.resumeConnection || ''}`.toLowerCase().includes(term));
    const q = items.find(x => x.id === state.question) || items[0];
    if (q) state.question = q.id;
    const rated = all.filter(x => entry(x.id).rating !== undefined).length;
    root.innerHTML = `${resume ? `<div class="resume-intro"><p>从简历上的技术名词，练到能解释用途、取舍和自己的实际工作。先用英文说清概念，再接一个真实项目例子。</p><div class="button-row"><button class="btn btn-small ${state.priority === 'all' ? 'btn-primary' : 'btn-quiet'}" data-action="priority" data-value="all" aria-pressed="${state.priority === 'all'}">全部问题</button><button class="btn btn-small ${state.priority === 'first' ? 'btn-primary' : 'btn-quiet'}" data-action="priority" data-value="first" aria-pressed="${state.priority === 'first'}">先练核心</button><button class="btn btn-small btn-quiet" data-action="quiz-resume-core">核心技术速测 →</button></div></div>` : ''}${moduleTabs()}<div class="foundation-module-heading"><p>${e(m?.subtitle || '')}</p><span class="muted">${rated} / ${all.length} 已自评</span></div><div class="split foundation-split"><aside class="rail"><label class="foundation-search-label" for="foundation-search">查找本模块</label><input id="foundation-search" class="search" type="search" placeholder="搜索概念或问题…" value="${e(state.query)}"><div class="foundation-rail-list">${items.map((x, i) => `<button class="rail-item ${x.id === q?.id ? 'active' : ''}" data-action="question" data-id="${e(x.id)}" ${x.id === q?.id ? 'aria-current="true"' : ''}><span class="foundation-rail-number">${i + 1}</span><span>${e(x.title)}<small class="rail-meta">${x.priority === 'first' ? '优先掌握 · ' : ''}${e(badge(x))}</small></span></button>`).join('') || '<p class="muted foundation-empty">没有匹配的问题。</p>'}</div></aside><section class="detail">${q ? `<label class="mobile-picker">本模块问题<select id="mobile-question">${items.map(x => `<option value="${e(x.id)}" ${x.id === q.id ? 'selected' : ''}>${e(x.title)}</option>`).join('')}</select></label>${learningDetail(q, items)}` : `<div class="foundation-empty"><h2>没有匹配的问题</h2><p>试试更短的关键词。</p><button class="btn btn-quiet" data-action="clear-search">清除搜索</button></div>`}</section></div>`;
  }

  function learningDetail(q, items) {
    const item = entry(q.id);
    const index = items.findIndex(x => x.id === q.id);
    return `<div class="foundation-detail-title"><div><p class="eyebrow">${e(q.level || 'FOUNDATION')} · ${index + 1} / ${items.length}</p><h2 id="question-heading" tabindex="-1">${e(q.title)}</h2></div><button class="btn btn-small btn-quiet" data-action="quiz-one" data-id="${e(q.id)}" ${eligible(q) ? '' : 'disabled'}>做一道检验</button></div>${q.needsDetails ? '<div class="callout callout-warn"><strong>待补真实工具定义</strong><p>这题提供准备框架。先确认工具在团队中的名称、用途、你的工作和验证证据，再整理成个人口述答案。</p></div>' : ''}<section class="section"><h3>概念解释 <span class="muted">中文</span></h3>${p(q.lesson || '')}</section><section class="section answer"><h3>Answer <span>English</span></h3>${p(q.englishAnswer || '')}</section>${q.resumeConnection ? `<section class="callout resume-connection"><h3>连接到你的简历</h3>${p(q.resumeConnection)}</section>` : ''}<section class="section"><h3>讲清楚这几个点</h3>${list(q.keyPoints)}</section>${q.followUpAnswers?.length ? `<section class="section resume-followups"><h3>Follow-up answers · 先自己答，再展开</h3>${q.followUpAnswers.map(f => `<details><summary>${e(f.q)}</summary>${p(f.answer)}</details>`).join('')}</section>` : q.followUps?.length ? `<section class="section"><h3>Possible follow-ups</h3>${list(q.followUps)}</section>` : ''}<section class="section foundation-recall"><h3>合上答案，自己说一遍</h3><p class="muted">自评只记录你的判断，不是 AI 评分。选择“需要练习”会加入 Weak areas。</p><div class="button-row foundation-ratings" role="group" aria-label="掌握程度自评">${ratingNames.map((name, i) => `<button class="btn btn-small ${item.rating === i ? 'btn-primary' : 'btn-quiet'}" data-action="rate" data-value="${i}" data-id="${e(q.id)}" aria-pressed="${item.rating === i}">${e(name)}</button>`).join('')}</div><label class="field" for="recall-note">My recall notes · 用自己的话记下理解与缺口</label><textarea class="textarea" id="recall-note" data-id="${e(q.id)}" rows="4" placeholder="例如：我能解释 tool calling，但还需要区分 host 与 client。">${e(item.notes || '')}</textarea><small class="muted" id="note-status">${storageWarning ? '当前仅保留在本页，请导出备份。' : '在当前浏览器自动保存；建议定期导出备份。'}</small></section><section class="section foundation-sources"><h3>Sources</h3>${sources(q.sourceIds)}</section><div class="button-row foundation-step-nav"><button class="btn btn-quiet" data-action="question" data-id="${e(items[index - 1]?.id || '')}" ${index === 0 ? 'disabled' : ''}>← 上一题</button><button class="btn btn-quiet" data-action="question" data-id="${e(items[index + 1]?.id || '')}" ${index === items.length - 1 ? 'disabled' : ''}>下一题 →</button></div>`;
  }

  function renderQuiz() {
    const s = state.session;
    if (!s) {
      const total = questions.filter(eligible).length;
      root.innerHTML = `<div class="foundation-quiz-home"><h2>先作答，再看解释。</h2><p class="foundation-intro">四选一，手动提交。每次作答后都会说明答案与误区；没有看过的题不会被标为薄弱项。</p><div class="foundation-session-all"><div><h3>全题库练习</h3><p class="muted">${total} 道题 · 可随时返回学习卡</p></div><button class="btn btn-primary" data-action="start-quiz" data-id="all" ${total ? '' : 'disabled'}>开始全部题目 →</button></div><div class="foundation-session-list">${modules.map(m => { const n = moduleQuestions(m.id).filter(eligible).length; return `<div class="foundation-session-row"><div><h3>${e(m.title)}</h3><p class="muted">${e(m.subtitle || '')}</p></div><span class="muted">${n} 题</span><button class="btn btn-quiet btn-small" data-action="start-quiz" data-id="${e(m.id)}" ${n ? '' : 'disabled'}>练习本模块</button></div>`; }).join('')}</div></div>`;
      return;
    }
    if (s.done) { renderResults(); return; }
    const q = byId.get(s.ids[s.index]);
    const answered = Object.entries(s.answers);
    const correct = answered.filter(([id, selected]) => byId.get(id)?.correctIndex === selected).length;
    const selected = s.selection;
    const right = selected === q.correctIndex;
    root.innerHTML = `<div class="foundation-quiz"><div class="foundation-quiz-bar"><span>${e(s.label)} · ${s.index + 1} / ${s.ids.length}</span><span>${answered.length ? `本轮已提交 ${answered.length} 题 · 答对 ${correct} 题` : '请选择答案后提交'}</span><button class="btn btn-small btn-quiet" data-action="end-quiz">结束本轮</button></div><div class="progress" role="progressbar" aria-label="本轮已提交进度" aria-valuemin="0" aria-valuemax="${s.ids.length}" aria-valuenow="${answered.length}"><span style="width:${answered.length / s.ids.length * 100}%"></span></div><p class="eyebrow">${e(modules.find(m => m.id === q.module)?.title || '')}</p><h2 id="question-heading" tabindex="-1">${e(q.title)}</h2><p class="muted">选择最准确的答案。</p><div class="foundation-options" role="group" aria-label="答案选项">${s.optionOrders[q.id].map((i, displayIndex) => `<button class="choice ${selected === i ? 'selected' : ''} ${s.checked && i === q.correctIndex ? 'is-correct' : ''} ${s.checked && selected === i && !right ? 'is-wrong' : ''}" data-action="select-option" data-value="${i}" aria-pressed="${selected === i}" ${s.checked ? 'disabled' : ''}><span class="foundation-option-letter">${String.fromCharCode(65 + displayIndex)}</span><span>${e(q.options[i])}</span>${s.checked && i === q.correctIndex ? '<strong class="foundation-option-result">正确答案</strong>' : s.checked && selected === i ? '<strong class="foundation-option-result">你的选择</strong>' : ''}</button>`).join('')}</div>${s.checked ? `<section class="callout ${right ? '' : 'callout-warn'} foundation-feedback" aria-live="polite"><h3>${right ? '答对了' : '这次答错了，可以回看概念'}</h3>${p(q.explanation || '')}${!right && q.wrongExplanations?.[selected] ? `<h4>为什么你选的答案不准确？</h4>${p(q.wrongExplanations[selected])}` : ''}${sources(q.sourceIds)}</section>` : '<div aria-live="polite" class="sr-only">尚未提交答案。</div>'}<div class="button-row foundation-quiz-actions">${s.checked ? `<button class="btn btn-primary" data-action="next-quiz">${s.index === s.ids.length - 1 ? '查看本轮结果' : '下一题 →'}</button><button class="btn btn-quiet" data-action="learn-from-quiz" data-id="${e(q.id)}">回看学习卡</button>` : `<button class="btn btn-primary" data-action="check-answer" ${selected === null ? 'disabled' : ''}>检查答案</button><span class="muted">提交前可修改选择</span>`}</div></div>`;
  }

  function renderResults() {
    const s = state.session;
    const answers = Object.entries(s.answers);
    const missed = answers.filter(([id, value]) => byId.get(id)?.correctIndex !== value).map(([id]) => id);
    const correct = answers.length - missed.length;
    root.innerHTML = `<div class="foundation-results"><h2>${answers.length ? '本轮练习已结束' : '本轮尚未提交答案'}</h2><p class="foundation-score">${answers.length ? `${Math.round(correct / answers.length * 100)}<span>%</span>` : '—'}</p><p class="muted">本轮正确率 · 答对 ${correct} / 已提交 ${answers.length} 题 · 计划 ${s.ids.length} 题</p><p>这个结果仅反映本轮选择题。能否脱离答案解释清楚，还需要口述练习。</p><div class="button-row"><button class="btn btn-primary" data-action="retry-missed" ${missed.length ? '' : 'disabled'}>重练本轮错题（${missed.length}）</button><button class="btn btn-quiet" data-action="new-quiz">选择新一轮</button></div>${missed.length ? `<section class="section"><h3>本轮错题</h3><div class="foundation-review-list">${missed.map(id => `<button class="rail-item" data-action="learn-from-quiz" data-id="${e(id)}">${e(byId.get(id).title)}<span aria-hidden="true">↗</span></button>`).join('')}</div></section>` : ''}</div>`;
  }

  function renderWeak() {
    const weak = weakQuestions();
    const self = questions.filter(q => entry(q.id).rating !== undefined).length;
    const answered = questions.filter(q => entry(q.id).latestQuiz).length;
    root.innerHTML = `<div class="foundation-weak"><h2>只把真实暴露的缺口放在这里。</h2><p class="foundation-intro">上次选择题答错，或自评“需要练习”的题会进入此处。尚未学习的题不会被当成薄弱项。</p><div class="foundation-weak-bar"><span>${weak.length} 个待强化概念 <span class="muted">· ${self} 题已自评 · ${answered} 题有作答记录</span></span><button class="btn btn-primary btn-small" data-action="quiz-weak" ${weak.some(eligible) ? '' : 'disabled'}>练习这些题</button></div>${weak.length ? `<div class="foundation-weak-list">${weak.map(q => { const item = entry(q.id); return `<div class="foundation-weak-row"><div><span class="eyebrow">${e(modules.find(m => m.id === q.module)?.title || '')}</span><h3>${e(q.title)}</h3><p class="muted">${item.latestQuiz?.correct === false ? '最近一次选择题答错' : ''}${item.latestQuiz?.correct === false && item.rating === 0 ? ' · ' : ''}${item.rating === 0 ? '自评：需要练习' : ''}</p></div><button class="btn btn-quiet btn-small" data-action="learn-from-quiz" data-id="${e(q.id)}">回看并练习 →</button></div>`; }).join('')}</div>` : '<div class="foundation-empty"><h3>目前没有记录到薄弱项</h3><p class="muted">这不代表已经掌握全部内容。先完成几道题，或在学习卡上如实自评。</p><button class="btn btn-quiet" data-action="new-quiz">开始一轮练习</button></div>'}${importBox()}</div>`;
  }

  function renderSources() {
    root.innerHTML = `<div class="foundation-source-page"><h2>理解概念，也保留核对入口。</h2><p class="foundation-intro">优先使用协议规范、官方文档与公司原始材料。这里是离线学习页，链接内容可能更新；学习笔记不代表你的项目已实现相关能力。</p><div class="foundation-source-index">${(D.sources || []).map(source => `<article><h3>${e(source.title)}</h3>${sources([source.id])}${source.checked ? `<p class="muted">整理时核对：${e(source.checked)}</p>` : ''}</article>`).join('')}</div>${importBox()}<div class="callout"><strong>数据说明</strong><p>自评、笔记和最近一次作答记录存储在当前浏览器。本轮正确率只计算当前练习已提交的答案；页面不录音，不调用 AI，也不上传练习记录。</p></div></div>`;
  }

  function render() {
    document.querySelector('#page-title').textContent = 'Foundations lab';
    document.querySelector('#page-subtitle').textContent = state.view === 'resume' ? 'Resume technology · 中文理解，英文表达' : 'Voice AI, MCP & agent workflows';
    document.querySelectorAll('#navigation [data-view]').forEach(button => {
      const active = button.dataset.view === state.view;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    ({ resume: renderLearn, learn: renderLearn, quiz: renderQuiz, weak: renderWeak, sources: renderSources }[state.view] || renderLearn)();
  }
  function startQuiz(ids, label) {
    const valid = ids.filter(id => eligible(byId.get(id) || {}));
    if (!valid.length) { K.toast('所选范围没有可练习的题目。'); return; }
    const optionOrders = Object.fromEntries(valid.map(id => {
      const order = [0, 1, 2, 3];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return [id, order];
    }));
    state.session = { ids: valid, optionOrders, label, index: 0, answers: {}, selection: null, checked: false, done: false };
    state.view = 'quiz';
    render();
  }
  function openQuestion(id) {
    const q = byId.get(id);
    if (!q) return;
    if (isResume(q) && q.priority !== 'first') state.priority = 'all';
    state.view = isResume(q) ? 'resume' : 'learn'; state.module = q.module; state.question = id; state.query = '';
    render();
  }

  document.querySelector('#navigation').addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    state.view = button.dataset.view;
    state.query = ''; state.question = '';
    render();
    window.scrollTo(0, 0);
  });
  document.querySelector('#export-button').addEventListener('click', () => {
    clearTimeout(noteTimer); save();
    K.download('foundations-progress.json', progress);
    K.toast('已导出进度文件。');
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const { action, id, value } = button.dataset;
    const s = state.session;
    if (action === 'priority') { state.priority = value; state.question = ''; render(); }
    else if (action === 'quiz-resume-core') startQuiz(questions.filter(q => isResume(q) && q.priority === 'first').map(q => q.id), '简历核心技术');
    else if (action === 'module') { state.module = id; state.query = ''; state.question = ''; render(); }
    else if (action === 'question' || action === 'learn-from-quiz') openQuestion(id);
    else if (action === 'clear-search') { state.query = ''; render(); }
    else if (action === 'rate') { patch(id, { rating: Number(value) }); render(); K.toast(`已记录自评：${ratingNames[Number(value)]}`); }
    else if (action === 'start-quiz') startQuiz((id === 'all' ? questions : moduleQuestions(id)).map(q => q.id), id === 'all' ? '全题库' : modules.find(m => m.id === id)?.title || '模块练习');
    else if (action === 'quiz-one') startQuiz([id], '单题检验');
    else if (action === 'quiz-weak') startQuiz(weakQuestions().map(q => q.id), '薄弱项练习');
    else if (action === 'new-quiz') { state.view = 'quiz'; state.session = null; render(); }
    else if (action === 'select-option' && s && !s.checked && !s.done) { s.selection = Number(value); render(); }
    else if (action === 'check-answer' && s && !s.checked && !s.done && Number.isInteger(s.selection)) {
      const q = byId.get(s.ids[s.index]);
      s.checked = true; s.answers[q.id] = s.selection;
      patch(q.id, { latestQuiz: { selectedIndex: s.selection, correct: s.selection === q.correctIndex, answeredAt: new Date().toISOString() } });
      render();
    } else if (action === 'next-quiz' && s?.checked) {
      if (s.index === s.ids.length - 1) s.done = true;
      else { s.index++; s.selection = null; s.checked = false; }
      render();
      document.querySelector('#question-heading')?.focus({ preventScroll: true });
    } else if (action === 'end-quiz' && s) { s.done = true; render(); }
    else if (action === 'retry-missed' && s) startQuiz(Object.entries(s.answers).filter(([qid, selected]) => byId.get(qid)?.correctIndex !== selected).map(([qid]) => qid), '本轮错题重练');
  });
  root.addEventListener('input', event => {
    const target = event.target;
    if (target.id === 'foundation-search') {
      const position = target.selectionStart;
      state.query = target.value; render();
      const next = document.querySelector('#foundation-search');
      next.focus();
      try { next.setSelectionRange(position, position); } catch (_) { /* Search inputs may not support selection ranges. */ }
    } else if (target.id === 'recall-note') {
      progress.questions[target.dataset.id] = { ...entry(target.dataset.id), notes: target.value };
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => { const ok = save(); const status = document.querySelector('#note-status'); if (status) status.textContent = ok ? '已保存在当前浏览器。' : '当前仅保留在本页，请导出备份。'; }, 250);
    }
  });
  root.addEventListener('change', async event => {
    const target = event.target;
    if (target.id === 'mobile-question') { openQuestion(target.value); return; }
    if (target.id !== 'progress-import') return;
    const file = target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('文件过大，请选择本页导出的进度 JSON。');
      const imported = normalize(JSON.parse(await file.text()), true);
      progress.questions = { ...progress.questions, ...imported.questions };
      save(); render(); K.toast('已合并导入的进度。');
    } catch (error) { K.toast(error instanceof SyntaxError ? '无法读取 JSON，请选择导出的进度文件。' : error.message || '导入失败，请检查文件。'); }
    target.value = '';
  });
  window.addEventListener('pagehide', () => { clearTimeout(noteTimer); save(); });
  render();
  return { suspend() { clearTimeout(noteTimer); save(); } };
};
