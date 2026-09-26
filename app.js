/* ============================================================
   SurviX — App Shell
   Router · sidebar · topbar · platform filter · simulated async
   loading · pipeline ticker · toast
   ============================================================ */

(function(){
'use strict';
const SX = (window.SX = window.SX || {});
const D = window.SURVIX;

const ICONS = {
  logo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M4 15l5-6 4 4 6-8"/><path d="M14 5h5v5"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 15.2c2.6.3 4.6 1.9 5.3 4.8"/></svg>',
};

/* ---------- routing ---------- */
const ROUTES = [
  { id:'overview',     label:'Overview',       icon:'grid',   tag:null,   render:SX.panels.OverviewPanel,     mount:SX.panels.mountOverview },
  { id:'sentiment',    label:'Sentiment',      icon:'wave',   tag:'AI',   render:SX.panels.SentimentPanel,    mount:SX.panels.mountSentiment },
  { id:'demographics', label:'Demographics',   icon:'users',  tag:null,   render:SX.panels.DemographicsPanel, mount:SX.panels.mountDemographics },
  { id:'trends',       label:'Trends',         icon:'trend',  tag:'LIVE', render:SX.panels.TrendsPanel,       mount:SX.panels.mountTrends },
  { id:'network',      label:'Network',        icon:'net',    tag:'BETA', render:SX.panels.NetworkPanel,      mount:SX.panels.mountNetwork },
];
const NAV_ICONS = {
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h4l3-8 4 16 3-8h6"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 15.2c2.6.3 4.6 1.9 5.3 4.8"/></svg>',
  trend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  net:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="12" cy="13" r="2.6"/><circle cx="4.5" cy="18.5" r="2.2"/><circle cx="19.5" cy="18" r="2.2"/><path d="M6.8 7.4l3.4 4M17 6.4l-3.2 5M10.2 14.6l-4 3M13.8 14.8l4 2.4"/></svg>',
};

let currentRoute = 'overview';
let currentPlatform = 'all';

/* ---------- toast ---------- */
SX.toast = function(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>${msg}`;
  t.classList.add('show');
  clearTimeout(SX.toast._t);
  SX.toast._t = setTimeout(()=>t.classList.remove('show'), 2400);
};

/* ---------- shell ---------- */
function shell(){
  document.getElementById('app').innerHTML = `
  <aside class="sidebar" id="sidebar">
    <div class="brand">
      <span class="logo">${ICONS.logo}</span>
      <div><div class="brand-name">Survi<b>X</b></div><div class="brand-sub">Audience Intelligence</div></div>
    </div>
    <nav class="nav" id="nav">
      <div class="nav-label">Intelligence Modules</div>
      ${ROUTES.map((r,i)=>`
        <button class="nav-item" data-route="${r.id}">
          ${NAV_ICONS[r.icon]}<span>${r.label}</span>
          ${r.tag?`<span class="tag ${r.tag==='BETA'?'beta':''}">${r.tag}</span>`:`<span class="tag">0${i+1}</span>`}
        </button>`).join('')}
    </nav>
    <div class="pipeline-mini">
      <h5>Pipeline <span style="color:var(--accent)">● ${D.pipeline.throughput}</span></h5>
      <div class="pl-meter" title="aggregate ingestion load"><i></i></div>
      ${D.pipeline.rows.map(r=>`
        <div class="pl-row"><span class="dot ${r.state}"></span><span class="nm">${r.name}</span>
        <span class="lat">${r.latency}</span>
        <span class="st" style="color:${r.state==='live'?'var(--pos)':r.state==='syncing'?'var(--accent)':'var(--text3)'}">${r.state}</span></div>`).join('')}
      <div class="pl-row" style="margin-top:6px"><span class="st" style="margin:0;color:var(--text3)">updated ${D.pipeline.updated}</span></div>
      <div class="pl-row"><span class="st" style="margin:0;color:var(--text3)">window 30d · classifier v4.2</span></div>
</div>
    <div class="sidebar-foot">
      <span class="avatar">SM</span><b>MERAJ</b> · PRO
    </div>
  </aside>

  <main class="main" id="main">
    <header class="topbar">
      <button class="hamburger" id="hamburger">${ICONS.menu}</button>
      <div class="crumb" id="crumb">Survi<b>X</b> · Overview</div>
      <div class="topbar-right">
        <div class="live-chip"><span class="dot"></span><span class="txt">LIVE</span><span style="color:var(--text3)" id="clock"></span></div>
        <div class="range" id="platform-range">
          <button class="on" data-pf="all">ALL</button>
          ${['x','telegram','instagram','facebook','reddit','youtube'].map(p=>`<button data-pf="${p}">${D.platforms.find(x=>x.id===p).name.toUpperCase()}</button>`).join('')}
        </div>
      </div>
    </header>
    <div id="page-host" style="display:flex;flex-direction:column;flex:1"></div>
  </main>`;
}

/* ---------- loading / render pipeline ---------- */
function skeleton(){
  return `<div class="page">
    <div class="grid kpis">
      ${'<div class="card kpi"><div class="skeleton" style="height:12px;width:55%"></div><div class="skeleton" style="height:26px;width:40%;margin:10px 0"></div><div class="skeleton" style="height:9px;width:65%"></div></div>'.repeat(4)}
    </div>
    <div class="card" style="margin-top:16px"><div class="skeleton" style="height:290px"></div></div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><div class="skeleton" style="height:180px"></div></div>
      <div class="card"><div class="skeleton" style="height:180px"></div></div>
    </div>
  </div>`;
}

let pageToken = 0;
function navigate(routeId, opts={}){
  const route = ROUTES.find(r=>r.id===routeId) || ROUTES[0];
  currentRoute = route.id;
  const host = document.getElementById('page-host');
  const token = ++pageToken;

  /* nav state */
  document.querySelectorAll('#nav .nav-item[data-route]').forEach(b=>b.classList.toggle('active', b.dataset.route===route.id));
  document.getElementById('crumb').innerHTML = `Survi<b>X</b> · ${route.label}`;
  document.title = `SurviX — ${route.label} · Audience Intelligence`;
  closeMobileSidebar();

  /* simulated async data fetch */
  host.innerHTML = skeleton();
  const delay = opts.fast ? 60 : (420 + Math.random()*480);
  setTimeout(()=>{
    if(token!==pageToken) return; /* stale */
    host.innerHTML = route.render();
    if(location.hash.slice(1)!==route.id) history.replaceState(null,'','#'+route.id);
    try{ route.mount(); }catch(err){ console.error('[SurviX] mount error:', err); }
    /* re-trigger page animation */
    host.firstElementChild && (host.firstElementChild.style.animation='none', void host.firstElementChild.offsetWidth, host.firstElementChild.style.animation='');
  }, delay);
}

/* ---------- topbar platform filter (mock global filter) ---------- */
function bindPlatformFilter(){
  const wrap = document.getElementById('platform-range');
  wrap.addEventListener('click', e=>{
    const b = e.target.closest('button[data-pf]'); if(!b) return;
    wrap.querySelectorAll('button').forEach(x=>x.classList.toggle('on', x===b));
    currentPlatform = b.dataset.pf;
    const name = currentPlatform==='all' ? 'All platforms' : D.platforms.find(p=>p.id===currentPlatform).name;
    SX.toast(`Filtered to ${name} — charts refresh with mock data`);
    /* simulated data-dependency: re-render current page */
    navigate(currentRoute, { fast:true });
  });
}

/* ---------- mobile sidebar ---------- */
function closeMobileSidebar(){ document.getElementById('sidebar').classList.remove('open'); }

/* ---------- pipeline ticker (simulated live ingestion) ---------- */
function startPipelineTicker(){
  setInterval(()=>{
    const el = document.querySelector('.pipeline-mini h5 span');
    if(el) el.textContent = '● ' + (1800 + Math.floor(Math.random()*120)) + ' rec/s';
  }, 3000);
}
/* ---------- clock ---------- */
function startClock(){
  const tick = ()=>{ const el=document.getElementById('clock'); if(el) el.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}); };
  tick(); setInterval(tick, 1000);
}

/* ---------- boot ---------- */
function boot(){
  shell();
  document.getElementById('nav').addEventListener('click', e=>{
    const b = e.target.closest('.nav-item[data-route]');
    if(b) navigate(b.dataset.route);
  });
  document.getElementById('hamburger').addEventListener('click', ()=>document.getElementById('sidebar').classList.toggle('open'));
  bindPlatformFilter();
  startPipelineTicker();
  startClock();
  navigate(location.hash.replace('#','')||'overview');
  /* deep links + browser back/forward */
  window.addEventListener('hashchange', ()=>{
    const id = location.hash.replace('#','')||'overview';
    if(id!==currentRoute) navigate(id);
  });
}
document.addEventListener('DOMContentLoaded', boot);

})();
