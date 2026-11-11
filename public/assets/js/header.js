/* Header: dropdowns, theme shortcut, Ctrl/Cmd+K search, table filter demo. */
(() => {
  const dds = [...document.querySelectorAll('.dd')];
  const closeAll = except => dds.forEach(d => { if (d !== except) { d.classList.remove('open'); d.querySelector('[aria-haspopup]')?.setAttribute('aria-expanded', 'false'); } });
  const items = d => [...d.querySelectorAll('.dd-menu a, .dd-menu button')];
  document.addEventListener('click', e => {
    const dd = e.target.closest('.dd'), trigger = e.target.closest('.dd > [aria-haspopup]');
    if (trigger) {
      const open = !dd.classList.contains('open');
      closeAll(dd); dd.classList.toggle('open', open); trigger.setAttribute('aria-expanded', String(open));
      if (open && e.detail === 0) items(dd)[0]?.focus();
    } else if (!dd) closeAll();
    if (e.target.closest('#mark-read')) {
      document.querySelectorAll('.ntf.unread').forEach(n => n.classList.remove('unread'));
      document.getElementById('ntf-dot')?.remove();
    }
    if (e.target.closest('#theme-shortcut')) {
      const order = ['light', 'dark', 'system'];
      AdminPrefs.set('theme', order[(order.indexOf(AdminPrefs.get('theme')) + 1) % 3]);
    }
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.getElementById('global-search')?.focus(); }
    const open = dds.find(d => d.classList.contains('open'));
    if (!open) return;
    if (e.key === 'Escape') { closeAll(); open.querySelector('[aria-haspopup]').focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const list = items(open), i = list.indexOf(document.activeElement);
      list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
    }
  });
  document.addEventListener('input', e => {
    const input = e.target.closest('[data-filter-table]');
    if (!input) return;
    const q = input.value.toLowerCase();
    document.querySelectorAll(`#${input.dataset.filterTable} tbody tr`).forEach(r => { r.hidden = !r.textContent.toLowerCase().includes(q); });
  });
})();
