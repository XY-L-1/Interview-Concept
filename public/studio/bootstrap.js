(() => {
  'use strict';
  const origin = window.location.origin;
  let received = false;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const nonempty = value => Array.isArray(value) && value.length > 0;

  window.addEventListener('message', event => {
    if (window.parent === window || event.source !== window.parent || event.origin !== origin || received) return;
    if (!object(event.data) || event.data.type !== 'interview-studio:load') return;
    const data = event.data.data;
    const status = document.querySelector('#load-status');
    if (!object(data) || !object(data.behavior) || !object(data.foundations)
      || !nonempty(data.behavior.questions) || !nonempty(data.behavior.stories)
      || !nonempty(data.foundations.questions) || !nonempty(data.foundations.modules)
      || typeof data.behavior.introLocked !== 'string'
      || (data.behavior.factNotes !== undefined && (!Array.isArray(data.behavior.factNotes)
        || !data.behavior.factNotes.every(note => Array.isArray(note) && note.length === 2 && note.every(value => typeof value === 'string'))))) {
      status.textContent = '资料格式不匹配。请在上层工作区检查后重新载入。';
      return;
    }
    received = true;
    document.querySelector('#behavior-count').textContent = `${data.behavior.questions.length} 题 · ${data.behavior.stories.length} 故事 · 口述`;
    document.querySelector('#foundations-count').textContent = `${data.foundations.questions.length} 题 · 基础练习`;
    document.querySelector('.studio-tabs').hidden = false;
    document.querySelector('.studio-skip').hidden = false;
    window.startStudio(data);
    status.hidden = true;
    window.parent.postMessage({ type: 'interview-studio:loaded' }, origin);
  });

  if (window.parent !== window && origin !== 'null') {
    window.parent.postMessage({ type: 'interview-studio:ready' }, origin);
  }
})();
