window.startStudio = function(data) {
  'use strict';
  const instances = {};
  const panels = {};
  const positions = { behavior: 0, foundations: 0 };
  const tabs = [...document.querySelectorAll('[role="tab"][data-section]')];
  const mounts = { behavior: window.mountBehavior, foundations: window.mountFoundations };
  const key = 'simple-ai-studio-navigation-v1';
  let active = null;

  window.disposeStudio = function() {
    window.KIT.disablePersistence();
    Object.values(instances).forEach(instance => instance.suspend());
  };

  ['behavior', 'foundations'].forEach(section => {
    panels[section] = document.querySelector('#panel-' + section);
    const root = document.querySelector('#app-' + section).attachShadow({ mode: 'open' });
    root.innerHTML = document.querySelector('#template-' + section).innerHTML;
    instances[section] = mounts[section](root, data[section]);
  });

  function select(section, updateHash = true) {
    if (!panels[section] || section === active) return;
    if (active) {
      positions[active] = window.scrollY;
      instances[active].suspend();
    }
    active = section;
    tabs.forEach(tab => {
      const selected = tab.dataset.section === section;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    Object.entries(panels).forEach(([name, panel]) => { panel.hidden = name !== section; });
    document.title = (section === 'behavior' ? 'Behavioral practice' : 'Foundations lab') + ' · Interview Studio';
    window.KIT.write(key, { section });
    if (updateHash) history.replaceState(null, '', '#' + section);
    requestAnimationFrame(() => { window.scrollTo(0, positions[section]); });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.section));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next].dataset.section);
      tabs[next].focus();
    });
  });

  document.querySelector('.studio-skip').addEventListener('click', event => {
    event.preventDefault();
    const main = document.querySelector('#app-' + active).shadowRoot.querySelector('main');
    main.focus();
    main.scrollIntoView({ block: 'start' });
  });
  const header = document.querySelector('.studio-header');
  const sizeHeader = () => document.documentElement.style.setProperty('--studio-header-height', header.offsetHeight + 'px');
  new ResizeObserver(sizeHeader).observe(header);
  sizeHeader();

  const fromHash = () => location.hash.slice(1);
  const saved = window.KIT.read(key, {});
  const filename = location.pathname.split('/').pop();
  const initial = panels[fromHash()] ? fromHash() : filename === 'foundations.html' ? 'foundations' : filename === 'behavior.html' ? 'behavior' : panels[saved?.section] ? saved.section : 'behavior';
  select(initial);
  window.addEventListener('hashchange', () => { if (panels[fromHash()]) select(fromHash(), false); });
};
