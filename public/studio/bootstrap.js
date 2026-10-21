(() => {
  'use strict';
  const origin = window.location.origin;
  let received = false;
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const nonempty = value => Array.isArray(value) && value.length > 0;

  window.addEventListener('message', event => {
    if (window.parent === window || event.source !== window.parent || event.origin !== origin) return;
    if (received && object(event.data) && event.data.type === 'interview-studio:select') {
      if (['behavior', 'foundations'].includes(event.data.section)) window.selectStudioSection?.(event.data.section);
      return;
    }
    if (received) return;
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
    if (event.data.progress !== undefined) {
      const progress = event.data.progress;
      const keys = ['simple-ai-behavior-progress-v1', 'simple-ai-foundations-progress-v1', 'simple-ai-studio-navigation-v1'];
      if (!object(progress) || Object.entries(progress).some(([key, value]) => !keys.includes(key) || !object(value))) {
        status.textContent = '练习进度格式不匹配。原记录未被覆盖。';
        return;
      }
      window.KIT.configureProgress(progress, (key, value) => {
        if (keys.includes(key)) window.parent.postMessage({ type: 'interview-studio:progress', key, value }, origin);
      });
    }
    received = true;
    document.querySelector('#behavior-count').textContent = `${data.behavior.questions.length} 题 · ${data.behavior.stories.length} 故事 · 口述`;
    document.querySelector('#foundations-count').textContent = `${data.foundations.questions.length} 题 · 基础练习`;
    document.querySelector('.studio-tabs').hidden = false;
    document.querySelector('.studio-skip').hidden = false;
    if (['behavior', 'foundations'].includes(event.data.section)) history.replaceState(null, '', '#' + event.data.section);
    window.startStudio(data);
    status.hidden = true;
    window.parent.postMessage({ type: 'interview-studio:loaded' }, origin);
  });

  if (window.parent !== window && origin !== 'null') {
    window.parent.postMessage({ type: 'interview-studio:ready' }, origin);
  }
})();
