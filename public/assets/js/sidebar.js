/* Sidebar: active state (navigation), accordion groups, collapse, mobile drawer, floating submenu. */
(() => {
  const root = document.documentElement;
  const sb = document.getElementById('sidebar'), fly = document.getElementById('flyout');
  if (!sb || !fly) return;
  const CONFIG = { closeDelay: 200 };
  const isMobile = () => matchMedia('(max-width:1024px)').matches;
  const isCollapsed = () => !isMobile() && root.dataset.sidebar === 'collapsed';
  const links = [...sb.querySelectorAll('a.nl')];
  const setOpen = (li, on) => { li.classList.toggle('open', on); li.querySelector(':scope>.nl').setAttribute('aria-expanded', String(on)); };

  function markActive() {
    const page = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => a.removeAttribute('aria-current'));
    sb.querySelectorAll('li.group').forEach(li => { li.classList.remove('has-active'); setOpen(li, false); });
    const here = links.filter(a => a.getAttribute('href').split('#')[0] === page);
    const cur = here.find(a => a.hash && a.hash === location.hash) || here[0];
    if (!cur) return;
    cur.setAttribute('aria-current', 'page');
    for (let g = cur.closest('li.group'); g; g = g.parentElement.closest('li.group')) { g.classList.add('has-active'); setOpen(g, true); }
  }

  let timer;
  const closeFly = () => { fly.hidden = true; fly.replaceChildren(); delete fly.dataset.for; };
  const closeLater = () => { clearTimeout(timer); timer = setTimeout(closeFly, CONFIG.closeDelay); };
  function openFly(btn, focus) {
    clearTimeout(timer);
    if (!fly.hidden && fly.dataset.for === btn.title) return;
    const title = document.createElement('div');
    title.className = 'fly-title';
    title.textContent = btn.title;
    fly.replaceChildren(title, btn.closest('li').querySelector(':scope>.sub').cloneNode(true));
    fly.dataset.for = btn.title;
    fly.hidden = false;
    fly.style.top = Math.max(8, Math.min(btn.getBoundingClientRect().top, innerHeight - fly.offsetHeight - 8)) + 'px';
    if (focus) fly.querySelector('a')?.focus();
  }

  sb.addEventListener('click', e => {
    if (isMobile() && e.target.closest('a.nl')) root.dataset.drawer = '';
    const btn = e.target.closest('button.nl[aria-expanded]');
    if (btn) {
      if (isCollapsed()) return openFly(btn, e.detail === 0);
      const li = btn.closest('li'), on = !li.classList.contains('open');
      li.parentElement.querySelectorAll(':scope>li.group.open').forEach(s => setOpen(s, false));
      setOpen(li, on);
    } else if (e.target.closest('[data-dashboard]')) {
      sb.querySelectorAll('li.group.open').forEach(g => setOpen(g, false)); closeFly();
    }
  });
  sb.addEventListener('mouseover', e => {
    if (!isCollapsed() || matchMedia('(hover:none)').matches) return;
    const btn = e.target.closest('button.nl[aria-expanded]');
    if (btn) openFly(btn); else if (e.target.closest('.nl')) closeLater();
  });
  sb.addEventListener('mouseleave', closeLater);
  fly.addEventListener('mouseenter', () => clearTimeout(timer));
  fly.addEventListener('mouseleave', closeLater);

  document.addEventListener('click', e => {
    const toggle = e.target.closest('[data-sidebar-toggle]');
    if (toggle) {
      if (isMobile()) root.dataset.drawer = root.dataset.drawer === 'open' ? '' : 'open';
      else { AdminPrefs.set('sidebar', root.dataset.sidebar === 'collapsed' ? 'expanded' : 'collapsed'); closeFly(); }
      return;
    }
    if (!e.target.closest('#flyout, .sb')) { closeFly(); root.dataset.drawer = ''; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeFly(); root.dataset.drawer = ''; } });
  const search = document.getElementById('nav-search');
  const ownLabel = li => li.querySelector(':scope>.nl .label').textContent.toLowerCase();
  // Recursive filter: an item stays visible if it, an ancestor or a descendant matches; matches get .hit and their branch opens.
  function filterItem(li, q, ancestorHit) {
    const hit = ownLabel(li).includes(q), kids = [...li.querySelectorAll(':scope>.sub>li')];
    const anyKid = kids.map(k => filterItem(k, q, ancestorHit || hit)).includes(true);
    li.hidden = !(ancestorHit || hit || anyKid);
    li.querySelector(':scope>.nl').classList.toggle('hit', hit);
    if (kids.length) setOpen(li, anyKid || hit);
    return !li.hidden;
  }
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    sb.querySelectorAll('.hit').forEach(n => n.classList.remove('hit'));
    if (!q) { sb.querySelectorAll('.sb-nav li, .sb-nav .sec, .sb-nav>ul').forEach(n => { n.hidden = false; }); return markActive(); }
    sb.querySelectorAll('.sb-nav>ul').forEach(ul => {
      const any = [...ul.children].map(li => filterItem(li, q, false)).includes(true);
      ul.hidden = !any;
      if (ul.previousElementSibling?.classList.contains('sec')) ul.previousElementSibling.hidden = !any;
    });
  });
  addEventListener('hashchange', markActive);
  markActive();
})();
