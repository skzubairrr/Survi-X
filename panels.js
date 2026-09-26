/* ============================================================
   SurviX — Panels (module renderers)
   OverviewPanel · SentimentPanel · DemographicsPanel ·
   TrendsPanel · NetworkPanel
   ============================================================ */

(function(){
'use strict';
const SX = window.SX; const charts = SX.charts; const D = window.SURVIX;
const fmt = v => v>=1e6 ? (v/1e6).toFixed(1).replace(/\.0$/,'')+'M' : v>=1e3 ? (v/1e3).toFixed(1).replace(/\.0$/,'')+'K' : String(v);

/* ---------- shared bits ---------- */
const ICONS = {
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h4l3-8 4 16 3-8h6"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 15.2c2.6.3 4.6 1.9 5.3 4.8"/></svg>',
  trend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  net:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="12" cy="13" r="2.6"/><circle cx="4.5" cy="18.5" r="2.2"/><circle cx="19.5" cy="18" r="2.2"/><path d="M6.8 7.4l3.4 4M17 6.4l-3.2 5M10.2 14.6l-4 3M13.8 14.8l4 2.4"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
  msg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 01-8 8H4l2.2-3.1A8 8 0 1121 12z"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20.5C7 16.5 3 13.3 3 9.4 3 6.9 5 5 7.4 5c1.8 0 3.4 1 4.6 2.7C13.2 6 14.8 5 16.6 5 19 5 21 6.9 21 9.4c0 3.9-4 7.1-9 11.1z"/></svg>',
  smile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8"/><path d="M9 10h.01M15 10h.01"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2.5 20h19L12 3z"/><path d="M12 10v4.5M12 17.5h.01"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l8 3.5v5.7c0 5-3.4 8.6-8 10.8-4.6-2.2-8-5.8-8-10.8V5.5L12 2z"/><path d="M9 11.8l2.2 2.2L15.5 9.5"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 2.6 4.2 5.6 4.2 9S14.8 18.4 12 21c-2.8-2.6-4.2-5.6-4.2-9S9.2 5.6 12 3z"/></svg>',
  cpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"/></svg>',
  x:'<path d="M17.2 3H20l-6.6 7.6L21 21h-6.1l-4.8-6.3L4.6 21H1.8l7.1-8.1L1 3h6.3l4.3 5.7L17.2 3zm-1.1 16.2h1.7L6.9 4.7H5.1l11 14.5z" fill="currentColor" stroke="none"/>',
  telegram:'<path d="M21.9 4.6l-3.1 14.7c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.2.3-.5.4-.9.4l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.9 13.2 2.3 11.8c-1-.3-1-1 .2-1.5l18-6.9c.8-.3 1.5.2 1.4 1.2z" fill="currentColor" stroke="none"/>',
  instagram:'<rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none"/>',
  facebook:'<path d="M13.5 21v-7h2.4l.4-2.9h-2.8V9.2c0-.8.3-1.4 1.5-1.4h1.4V5.2c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2.5H8.5V14H11v7h2.5z" fill="currentColor" stroke="none"/>',
  reddit:'<circle cx="12" cy="13.5" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none"/><path d="M9 16.5c1.8 1.3 4.2 1.3 6 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 6.2l.8-3 3.2.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="16.8" cy="4.6" r="1.3" fill="currentColor" stroke="none"/>',
  youtube:'<rect x="2" y="5.5" width="20" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9.3l5.2 2.7L10 14.7V9.3z" fill="currentColor" stroke="none"/>',
};

const PL_ICON = p => `<span class="plogo"><svg viewBox="0 0 24 24" style="color:${p.color}">${ICONS[p.id]}</svg></span>`;
const STATUS_BADGE = { connected:'<span class="badge connected">Connected</span>', good:'<span class="badge good">Good-to-have</span>', bonus:'<span class="badge bonus">Bonus</span>', syncing:'<span class="badge syncing">Syncing</span>' };
const STATUS_DOT = { live:['live','Live'], syncing:['sync','Syncing'], idle:['off','Idle'] };
/* [color, tag] — muted data palette, no emoji */
const EMO_STYLE = {
  Excitement:['#4E9A6E','EXCT'], Supportive:['#7A8CD8','SUPP'],
  Neutral:['#8894A6','NEUT'], Positive:['#A9B4C9','POSI'],
  Anxiety:['#E09A4E','ANXI'], Sarcasm:['#5B7FD4','SARC'],
  Against:['#CC5F52','AGAI'], Negative:['#B04A3E','NEGA'],
};

function kpi(o){ const isTextVal = String(o.value).length > 8 && !o.value.includes('<small');
  return `<div class="card kpi ${o.cls||''} ${isTextVal?'with-text-val':''}">
  <div class="top"><span class="ico-circle ${o.circle||'blue'}">${o.icon}</span>${o.label}</div>
  <div class="val">${o.value}</div>
  <div class="delta ${o.dir}">${o.delta}</div>
  ${o.spark?`<canvas class="spark" width="110" height="34" data-spk="${o.spark.join(',')}" data-color="${o.color||'#5B7FD4'}"></canvas>`:''}
</div>`; }
function cardHead(icon, title, right=''){ return `<div class="card-head"><span class="ico">${icon}</span><h3>${title}</h3><div class="right">${right}</div></div>`; }
const UP='\u2191', DN='\u2193', FL='\u2192';
function mom(m){ return m>15?`<span class="momentum up">${UP} +${m}%</span>`:m<-15?`<span class="momentum down">${DN} ${m}%</span>`:`<span class="momentum flat">${FL} ${Math.abs(m)}%</span>`; }

/* ============================================================
   1 · OVERVIEW PANEL
   ============================================================ */
function OverviewPanel(){
  const k = D.overview.kpis, t = D.overview.timeline;
  return `
  <div class="page">
    <div class="page-head">
      <div><h1>Overview — Audience Command</h1>
      <p>${k.platforms.value} platforms connected · ${fmt(k.followers.value)} analyzed profiles · 30-day window · model v4.2<span class="why">One unified view combining all four intelligence vectors — sentiment, demographics, trends, and network — the way real audience intelligence requires.</span></p></div>
      <div class="right"><button class="btn primary" data-toast="Snapshot exported (mock)">${ICONS.eye} Export</button></div>
    </div>

    <div class="ps-strip" id="ps-strip" title="Prototype scope coverage — modules fully addressed in this build">
      ${[
        ['A','Data Pipeline'],['B','Sentiment Inference'],['C','Demographic Profiling'],
        ['D','Trend Detection'],['E','Network Topology'],
      ].map(([n,l])=>`<span class="ps-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg><b>${n}</b>· ${l}</span>`).join('')}
    </div>

    <div class="grid kpis">
      ${kpi({label:'Followers Analyzed', value:fmt(k.followers.value), delta:`${UP} ${k.followers.delta}% vs last mo`, dir:'up', sparkColor:'#4E9A6E', circle:'green', icon:ICONS.users, spark:[9,10,10,11,12,12,13,14,15,16,17,18]})}
      ${kpi({label:'Platforms Connected', value:`${k.platforms.value}<small> /8</small>`, delta:'6 live · 1 syncing · 1 idle', dir:'flat', circle:'blue', icon:ICONS.net})}
      ${kpi({label:'Overall Sentiment', value:`${k.sentiment.value}<small>/10</small>`, delta:`${UP} ${k.sentiment.delta} pts this week`, dir:'up', sparkColor:'#8B7FD6', circle:'purple', icon:ICONS.smile, spark:[61,60,62,63,64,61,65,66,64,66,68,74]})}
      ${kpi({label:'Top Trending Topic', value:k.trend.value, delta:`${UP} +${k.trend.delta}% peak velocity`, dir:'up', sparkColor:'#E09A4E', circle:'orange', icon:ICONS.bolt, spark:[6,8,11,16,22,30,41,55,74,96]})}
    </div>

    <div class="card" style="margin-top:16px">
      ${cardHead(ICONS.wave, 'Engagement & Sentiment — last 30 days', `<span class="sub">Mentions volume (bars) · Sentiment score (line)</span>`)}
      <div class="chart-wrap"><canvas id="ov-timeline"></canvas></div>
    </div>

    <div class="card" style="margin-top:16px">
      ${cardHead(ICONS.net, 'Platform Connections', `<span class="sub">tiering per workspace plan</span>`)}
      <div class="ptabs" id="ov-ptabs">
        ${D.platforms.filter(p=>['x','telegram','instagram','facebook','reddit','youtube'].includes(p.id)).map(p=>`
          <button class="ptab" data-plat="${p.id}" title="${p.name} — ${p.rows} rows indexed">
            ${PL_ICON(p)} ${p.name} ${STATUS_BADGE[p.status]}
          </button>`).join('')}
      </div>
      <div class="axis-note" style="margin-top:12px"><span>Filter every module via topbar</span><span>Indexed rows: ${D.platforms.reduce((a,p)=>a+(p.rows.endsWith('M')?parseFloat(p.rows)*1e6:parseFloat(p.rows)*1e3||0),0).toLocaleString()}</span></div>
    </div>

    <div class="tiers">
      ${[
        ['core','Essential (Must-Have)'],['good','Desirable (Good-to-Have)'],['bonus','Appreciable Addition'],
      ].map(([tier,title])=>{
        const list = D.platforms.filter(p=>p.tier===tier);
        return `<div class="tier-col card">
          ${cardHead(ICONS.net, title, `<span class="sub">${list.length} platform${list.length===1?'':'s'}</span>`)}
          <div class="tier-list">
            ${list.map(p=>{
              const st = STATUS_DOT[p.ingest]||['ok','Linked'];
              return `<div class="tier-row">
                <span class="dot ${st[0]}" title="${p.status}"></span>
                <span class="nm">${p.name}</span>
                <span class="st">${st[1]}</span>
              </div>`;}).join('')}
          </div>
        </div>`;}).join('')}
    </div>

    <div class="grid g32" style="margin-top:16px">
      <div class="card">
        ${cardHead(ICONS.bolt, 'Key Events This Month')}
        ${D.events.map(ev=>`
          <div class="region-row"><span class="evt-circle">${ICONS.clock}</span>
            <div style="flex:1;min-width:0"><b style="font-size:12px">${ev.title}</b>
            <div style="font-family:var(--mono);font-size:9.5px;color:var(--text3)">${ev.date} · ${Object.entries(ev.stats)[0][1]} ${Object.keys(ev.stats)[0].toLowerCase()}</div>
            <div style="font-size:10.5px;color:var(--text2);margin-top:2px;line-height:1.45">${ev.desc}</div></div>
          </div>`).join('')}
      </div>
      <div class="card">
        ${cardHead(ICONS.cpu, 'Data Pipeline Status', `<span class="badge connected">${D.pipeline.throughput}</span>`)}
        <div class="status-grid">
          ${D.pipeline.rows.map(r=>`
            <div class="status-row">
              <span class="nm"><svg viewBox="0 0 24 24" style="color:${(D.platforms.find(p=>p.id===r.id)||{}).color}">${ICONS[r.id]}</svg>${r.name}</span>
              <span class="bar"><i style="width:${r.state==='live'?94:r.state==='syncing'?58:12}%;background:${r.state==='live'?'var(--pos)':r.state==='syncing'?'var(--accent)':'var(--neu)'}"></i></span>
              <span class="st" style="color:${r.state==='live'?'var(--pos)':r.state==='syncing'?'var(--accent)':'var(--text3)'}">${r.state==='live'?'Live':r.state==='syncing'?'Syncing':'Idle'}</span>
              <span class="lat">${r.latency}</span>
            </div>`).join('')}
        </div>
        <div class="axis-note"><span>Mock ingestion — backend AI pipeline assumed complete</span><span>Updated ${D.pipeline.updated}</span></div>
      </div>
    </div>
  </div>`;
}

function mountOverview(){
  charts.combo({ canvas:document.getElementById('ov-timeline'), dates:D.overview.timeline.dates, bars:D.overview.timeline.mentions, line:D.overview.timeline.sentiment, height:290 });
  document.querySelectorAll('.kpi canvas.spark[data-spk]').forEach(c=>charts.spark(c, c.dataset.spk.split(',').map(Number), c.dataset.color));
  document.querySelectorAll('#ov-ptabs .ptab').forEach(b=>{
    b.addEventListener('click',()=>window.SXApp.setPlatform(b.dataset.plat));
  });
  document.querySelectorAll('[data-toast]').forEach(b=>b.addEventListener('click',()=>SX.toast(b.dataset.toast)));
}

/* ============================================================
   2 · SENTIMENT PANEL
   ============================================================ */
function SentimentPanel(){
  const S = D.sentiment;
  return `
  <div class="page">
    <div class="page-head">
      <div><h1>Sentiment Analysis</h1>
      <p>classifier v4.2 · ${fmt(S.posts.length*4872)} posts & comments · 8 emotion classes · 92.4% median confidence<span class="why">Surfaces nuanced emotion shifts — not just positive/negative — so teams catch sarcasm, anxiety, or backlash before it escalates.</span></p></div>
      <div class="right">
        <div class="range" id="sent-range"><button class="on">30d</button><button disabled>90d</button><button disabled>12m</button></div>
      </div>
    </div>

    <div class="card">
      ${cardHead(ICONS.wave, 'Emotion Timeline', `<span class="scrub-legend" style="margin:0">
        <span><i style="background:#4E9A6E"></i>Positive</span><span><i style="background:#8894A6"></i>Neutral</span>
        <span><i style="background:#CC5F52"></i>Negative</span><span><i style="background:#5B7FD4"></i>Sarcasm</span>
        <span><i style="background:#E09A4E"></i>Anxiety</span><span><i style="background:#7A8CD8"></i>Excitement</span></span>`)}
      <div class="chart-wrap"><canvas id="sen-line"></canvas></div>
    </div>    <div class="card" style="margin-top:16px">
      ${cardHead(ICONS.msg, 'Classified Feed', `<span class="sub">live sample — mock classifier output</span>
        <select id="sen-filter" class="net-toolbar" style="font-size:11px;padding:4px 9px">
          <option value="all">All emotions</option>
          ${Object.keys(EMO_STYLE).map(e=>`<option>${e}</option>`).join('')}
        </select>`)}
      <div class="feed" id="sen-feed"></div>
    </div>
  </div>`;
}

function postCard(p){
  const [col,tag] = EMO_STYLE[p.emotion]||EMO_STYLE.Neutral;
  const pl = D.platforms.find(x=>x.id===p.platform);
  return `<div class="post" data-emo="${p.emotion}">
    <div class="p-head">
      <span class="pav" style="background:${p.av}">${p.user[0].toUpperCase()}</span>
      <span class="u">${p.user}</span><span class="h">${p.handle}</span>
      <span class="plat"><svg viewBox="0 0 24 24" style="color:${pl.color}">${ICONS[pl.id]}</svg>${pl.name} · ${p.time}</span>
    </div>
    <div class="txt">${p.text}</div>
    <div class="p-foot">
      <span class="emo-chip" style="color:${col};border-color:${col}66">${tag}</span>
      <span class="conf">conf ${Math.round(p.conf*100)}%<span class="bar"><i style="width:${Math.round(p.conf*100)}%"></i></span></span>
      <span class="conf" style="margin-left:0">${ICONS.heart.replace('<svg','<svg width="11" height="11"')} ${fmt(p.likes)}</span>
    </div>
  </div>`;
}

function mountSentiment(){
  const S = D.sentiment;
  charts.line({
    canvas:document.getElementById('sen-line'), dates:S.series.dates, height:300,
    series:[
      { name:'Positive',   data:S.series.positive,   color:'#4E9A6E' },
      { name:'Neutral',    data:S.series.neutral,    color:'#8894A6' },
      { name:'Negative',   data:S.series.negative,   color:'#CC5F52' },
      { name:'Sarcasm',    data:S.series.sarcasm,    color:'#5B7FD4', width:1.4, fill:false },
      { name:'Anxiety',    data:S.series.anxiety,    color:'#E09A4E', width:1.4, fill:false },
      { name:'Excitement', data:S.series.excitement, color:'#7A8CD8', width:1.4, fill:false },
      { name:'Supportive', data:S.series.supportive, color:'#A9B4C9', width:1.4, fill:false },
      { name:'Against',    data:S.series.against,    color:'#B04A3E', width:1.4, fill:false },
    ],
  });

  const feed = document.getElementById('sen-feed');
  const renderFeed = f => { feed.innerHTML = S.posts.filter(p=>f==='all'||p.emotion===f).map(postCard).join('') || emptyState('No posts match this filter','Try another emotion class or widen the date range.','archive'); };
  renderFeed('all');
  document.getElementById('sen-filter').addEventListener('change', e=>renderFeed(e.target.value));
}

function emptyState(title, sub, icon='archive'){
  return `<div class="empty"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a4 4 0 018 0v2"/></svg></span><b>${title}</b><p>${sub}</p><button class="btn" onclick="SX.toast('Filter reset (mock)')">Reset filters</button></div>`;
}

/* ============================================================
   3 · DEMOGRAPHICS PANEL
   ============================================================ */
function DemographicsPanel(){
  const G = D.demographics;
  return `
  <div class="page">
    <div class="page-head">
      <div><h1>Demographic Profiling</h1>
      <p>inference run 2026-09-25T06:00Z · ${fmt(1284900)} profiles · 6 signal classes<span class="why">Informs where to launch campaigns, which languages to prioritize, and who your actual audience is — not who you assume it is.</span></p></div>
    </div>

    <div class="disclaimer">${ICONS.warn}<span><b>Privacy-first:</b> Aggregated &amp; anonymized — inferred from public indicators only (language, bio signals, posting patterns, public interactions). No private data is accessed, and no individual profiles are ever re-identified.</span></div>

    <div class="grid g2">
      <div class="card">
        ${cardHead(ICONS.users, 'Age Brackets', `<span class="sub">modal band: 25–34</span>`)}
        <div class="chart-wrap"><canvas id="dem-age"></canvas></div>
      </div>
      <div class="card">
        ${cardHead(ICONS.smile, 'Language Breakdown', `<span class="sub">detected from post text</span>`)}
        <div class="chart-wrap" style="max-width:280px;margin:0 auto"><canvas id="dem-lang"></canvas></div>
      </div>
    </div>

    <div class="grid g32" style="margin-top:16px">
      <div class="card">
        ${cardHead(ICONS.globe, 'Geographic Distribution', `<span class="sub">top regions by audience share</span>`)}
        ${G.regions.map(r=>`
          <div class="region-row"><span class="flag">${r.code}</span><span class="nm">${r.name}</span>
            <span class="track"><i style="width:${r.pct/32*100}%"></i></span><span class="pct">${r.pct}%</span>
          </div>`).join('')}
      </div>
      <div class="card">
        ${cardHead(ICONS.spark, 'Top Interest Categories', `<span class="sub">share of profiles</span>`)}
        ${G.interestCats.map((c,i)=>`
          <div class="region-row"><span class="flag">${String(i+1).padStart(2,'0')}</span><span class="nm">${c.name}</span>
            <span class="track"><i style="width:${c.pct/31*100}%"></i></span><span class="pct">${c.pct}%</span>
          </div>`).join('')}
        <div class="axis-note"><span>inferred from public bio & engagement signals</span><span>top ${G.interestCats.length} of 24 tracked</span></div>
      </div>
    </div>
  </div>`;
}

function mountDemographics(){
  charts.hbars({ canvas:document.getElementById('dem-age'), data:D.demographics.ages, color:'#5B7FD4', height:250 });
  charts.donut({ canvas:document.getElementById('dem-lang'), data:D.demographics.languages, height:250, centerLabel:'8', centerSub:'LANGUAGES' });
}

/* ============================================================
   4 · TRENDS PANEL
   ============================================================ */
function TrendsPanel(){
  const T = D.trends;
  return `
  <div class="page">
    <div class="page-head">
      <div><h1>Trend & Topic Detection</h1>
      <p>velocity-scored across all connected platforms · rescored every 15 min<span class="why">Predicts what's about to break out, giving teams lead time instead of reacting after the fact.</span></p></div>
      <div class="right"><span class="badge connected">live scoring</span></div>
    </div>

    ${RiskSignals()}

    <div class="grid g23" style="margin-top:10px">
      <div class="card">
        ${cardHead(ICONS.trend, 'Trend Spikes — 30 day timeline', `<span class="scrub-legend" style="margin:0"><span><i style="background:#5B7FD4"></i>Agrarian policy backlash</span><span><i style="background:#7A8CD8"></i>Judicial reform debate</span><span><i style="background:#7A8CD8"></i>Fuel price discontent</span><span><i style="background:#4E9A6E"></i>Free speech debate</span></span>`)}
        <div class="chart-wrap"><canvas id="tr-spikes"></canvas></div>
      </div>
      <div class="card">
        ${cardHead(ICONS.trend, 'Top Trends Leaderboard', `<span class="sub">7-day momentum</span>`)}
        ${T.ranked.map((r,i)=>`
          <div class="trend-row">
            <span class="rank">${i+1}</span>
            <div class="tt"><b>${r.kw}</b><span>${(r.vol.replace('K','00').replace('.',''))+''} mentions</span></div>
            ${mom(r.mom)}
            <div class="vol"><canvas class="spark" width="86" height="26" data-spark="${r.spark}" data-color="${r.mom>0?'#4E9A6E':r.mom<-15?'#CC5F52':'#8894A6'}"></canvas><small>${r.vol}</small></div>
          </div>`).join('')}
      </div>
    </div>

    <div class="grid g2" style="margin-top:16px">
      <div class="card">
        <div class="predict">
          <h4>${ICONS.spark} Predicted Next Trends <span class="badge" style="margin-left:auto">model forecast</span></h4>
          ${T.predicted.map(p=>`
            <div class="pred-row">
              <span class="kw" title="${p.basis}">${p.kw}</span>
              <span class="track"><i style="width:${p.conf}%"></i></span>
              <span class="pc">${p.conf}%</span><span class="eta">${p.eta}</span>
            </div>`).join('')}
          <p style="font-size:11px;color:var(--text3);margin-top:10px">Hover a keyword for the model's reasoning. Confidence = blended velocity, cluster-adoption and KOL-signal score.</p>
        </div>
      </div>
      <div class="card">
        ${cardHead(ICONS.spark, 'Trending Terms — Word Cloud', `<span class="sub">sized by mention velocity</span>`)}
        <div id="tr-cloud" style="min-height:250px"></div>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   4a · EMERGING RISK SIGNALS (early-warning demo)
   ============================================================ */
const RISK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3L2.5 20h19L12 3z"/><path d="M12 10v4.5M12 17.5h.01"/></svg>';
function probBand(p){ return p>60?'r':p>=30?'a':'g'; }
function RiskSignals(){
  const R = D.trends.risks;
  return `
  <div class="card">
    ${cardHead(RISK_ICON, 'Emerging Risk Signals', `<span class="badge syncing">early warning</span>`)}
    <div class="risk-note">${R.note}</div>
    ${R.entries.map(e=>{
      const band = probBand(e.prob);
      return `
      <div class="risk-row ${band==='r'?'crit':band==='a'?'high':'mid'}" data-risk="${e.id}">
        <div class="risk-main" title="Click to inspect flagged posts">
          <div>
            <div class="rname">${e.name}</div>
            <div class="rvel">${e.velocity}</div>
          </div>
          <div class="prob ${band}">
            <div class="pv"><small>breakout</small><b>${e.prob}%</b></div>
            <div class="track"><i style="width:${e.prob}%"></i></div>
          </div>
          ${e.regions?`<div class="rregions">${e.regions.join('<span class="sep"> · </span>')}</div>`:''}
          <div class="rsent">${e.sentiment.replace(/Against\/Grievance|Against/g,'<em>Against</em>').replace('Negative','<em>Negative</em>')}</div>
          <div class="rspark"><canvas class="spark" width="72" height="22" data-spark="${e.spark}" data-color="${band==='r'?'#CC5F52':band==='a'?'#5B7FD4':'#8894A6'}"></canvas></div>
          <span class="caret">&#9656;</span>
        </div>
        <div class="risk-detail">
          <div class="sig-label">Key signals detected</div>
          <div class="sig-tags">
            ${e.signals.map(s=>`<span class="sig-tag${/coordination|encrypted/.test(s)?' coord':''}">${s}</span>`).join('')}
          </div>
          <div class="sig-label">Sample flagged posts — classifier output (${e.sentiment})</div>
          <div class="risk-posts">
            ${e.posts.map(p=>{
              const pl = D.platforms.find(x=>x.id===p.platform);
              const [col,tag] = EMO_STYLE[p.emotion]||EMO_STYLE.Neutral;
              return `
              <div class="risk-post">
                <div class="rp-head">
                  <span class="rp-handle">${p.handle}</span>
                  <span class="rp-meta">${pl.name} · ${p.time}</span>
                  <span class="rp-emo emo-chip" style="color:${col};border-color:${col}66">${tag}</span>
                  <span class="rp-emo conf">conf ${Math.round(p.conf*100)}%</span>
                </div>
                <div class="rp-text">${p.text}</div>
              </div>`;}).join('')}
          </div>
          <div class="risk-foot">synthetic classifier output · no live tracking · category-level aggregation only</div>
        </div>
      </div>`;}).join('')}
  </div>`;
}

function mountTrends(){
  const T = D.trends;
  charts.line({
    canvas:document.getElementById('tr-spikes'), dates:T.spikes.dates, height:300, yFormat:'none',
    series:[
      { name:'Agrarian policy backlash', data:T.spikes['Agrarian policy backlash'], color:'#5B7FD4' },
      { name:'Judicial reform debate',   data:T.spikes['Judicial reform debate'],   color:'#7A8CD8' },
      { name:'Fuel price discontent',    data:T.spikes['Fuel price discontent'],    color:'#7A8CD8' },
      { name:'Free speech debate',       data:T.spikes['Free speech debate'],       color:'#4E9A6E' },
    ],
  });
  document.querySelectorAll('canvas[data-spark]').forEach(c=>{
    charts.spark(c, c.dataset.spark.split(',').map(Number), c.dataset.color);
  });
  charts.cloud(document.getElementById('tr-cloud'), T.cloud, { height:250 });
  /* trend leaderboard rows are static; tooltip on keywords */
  document.querySelectorAll('.pred-row .kw').forEach(k=>{
    k.title = T.predicted.find(p=>p.kw===k.textContent)?.basis || '';
  });

  /* risk rows: sparklines + expand/collapse for flagged posts */
  document.querySelectorAll('.risk-main .spark[data-spark]').forEach(c=>{
    charts.spark(c, c.dataset.spark.split(',').map(Number), c.dataset.color);
  });
  document.querySelectorAll('.risk-main').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const row = btn.closest('.risk-row');
      const wasOpen = row.classList.contains('open');
      document.querySelectorAll('.risk-row.open').forEach(r=>r.classList.remove('open'));
      if(!wasOpen) row.classList.add('open');
    });
  });
}

/* ============================================================
   5 · NETWORK PANEL
   ============================================================ */
function NetworkPanel(){
  const N = D.network;
  return `
  <div class="page">
    <div class="page-head">
      <div><h1>Link Analysis & Network Topology</h1>
      <p>${N.nodes.length} seed accounts · ${N.edges.length} weighted interaction edges · 5 detected communities<span class="why">Identifies who actually drives conversation — critical for partnership targeting and early-warning monitoring.</span></p></div>
      <div class="right">
        <select id="net-layout" class="net-toolbar">
          <option value="all">All clusters</option>
          ${N.clusters.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        <button class="btn" id="net-relayout">${ICONS.net} Re-layout</button>
      </div>
    </div>

    <div class="card net-card">
      ${cardHead(ICONS.net, 'Interaction Graph', `<span class="sub">force-directed · 5 communities</span>`)}
      <div class="net-wrap">
        <canvas id="net-canvas"></canvas>
        <div class="net-legend">
          ${N.clusters.map(c=>`<span><i style="background:${c.color}"></i>${c.name}</span>`).join('')}
          <span><i style="background:none;border:1.4px solid rgba(43,33,27,.6);border-radius:50%"></i>KOL (influence ≥80)</span>
        </div>
        <div class="net-hint">drag nodes · click for profile</div>
      </div>
      <div class="detail" id="net-detail"></div>
    </div>

    <div class="card" style="margin-top:16px">
      ${cardHead(ICONS.eye, 'Key Opinion Leaders', `<span class="sub">top 5 by influence score</span>`)}
      ${N.nodes.filter(n=>n.influence>=80).sort((a,b)=>b.influence-a.influence).slice(0,5).map(n=>{
          const c = N.clusters.find(c=>c.id===n.cluster);
          return `<div class="trend-row" data-goto="${n.id}" style="cursor:pointer">
            <span class="rank" style="background:${c.color}22;color:${c.color}">${n.influence}</span>
            <div class="tt"><b>${n.label}</b><span>${c.name}${n.bridge?' · cluster bridge':''}</span></div>
            <div class="vol"><small>followers</small>${fmt(n.followers)}</div>
          </div>`;}).join('')}
      </div>
    </div>
  </div>`;
}

function mountNetwork(){
  const N = D.network;
  const canvas = document.getElementById('net-canvas');
  const detail = document.getElementById('net-detail');

  const net = SX.Network({
    canvas, nodes:N.nodes, edges:N.edges, clusters:N.clusters, height:500,
    onNodeSelect(n){ renderDetail(n); },
  });

  function renderDetail(n){
    if(!n){ detail.classList.remove('show'); return; }
    const c = N.clusters.find(c=>c.id===n.cluster);
    const conn = net.edges.filter(e=>e.a===n||e.b===n)
      .map(e=> e.a===n?e.b:e.a)
      .sort((a,b)=>b.influence-a.influence);
    detail.innerHTML = `
      <div class="d-head">
        <span class="dav" style="background:${c.color}">${n.label.replace('@','')[0].toUpperCase()}</span>
        <div><h4>${n.label}</h4><span class="d-sub">${c.name}${n.bridge?' · bridge node':''}</span></div>
        <button class="close" id="nd-close" aria-label="Close">✕</button>
      </div>
      <div class="d-stats">
        <div class="d-stat"><b>${n.influence}</b><span>Influence score</span></div>
        <div class="d-stat"><b>${fmt(n.followers)}</b><span>Followers</span></div>
        <div class="d-stat"><b>${conn.length}</b><span>Direct links</span></div>
        <div class="d-stat"><b>${(n.influence*0.83+conn.length*1.4).toFixed(1)}%</b><span>Est. reach factor</span></div>
      </div>
      <div class="influence-bar">
        <div class="lbl"><span>Influence percentile (vs all analyzed accounts)</span><b>Top ${(100-n.influence)}%</b></div>
        <div class="track"><i style="width:${n.influence}%"></i></div>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:12px;letter-spacing:.5px">CONNECTED ACCOUNTS</div>
      <div class="follower-chips">
        ${conn.map(m=>`<span class="fchip" data-goto="${m.id}"><i style="background:${N.clusters.find(x=>x.id===m.cluster).color}">${m.label.replace('@','')[0].toUpperCase()}</i>${m.label}<b style="color:var(--text3);font-family:var(--mono);font-size:10px">${m.influence}</b></span>`).join('')||'<span style="color:var(--text3);font-size:12px">Isolated node</span>'}
      </div>`;
    detail.classList.add('show');
    document.getElementById('nd-close').addEventListener('click',()=>{ net.select(null); });
    detail.querySelectorAll('[data-goto]').forEach(ch=>ch.addEventListener('click',()=>net.select(ch.dataset.goto)));
  }

  /* KOL list → select in graph */
  document.querySelectorAll('[data-goto]').forEach(el=>{
    el.addEventListener('click',()=>net.select(el.dataset.goto));
  });

  document.getElementById('net-relayout').addEventListener('click',()=>{ net.relayout(); SX.toast('Force layout re-computed'); });
  document.getElementById('net-layout').addEventListener('change', e=>{
    const v = e.target.value;
    net.nodes.forEach(n=>{ n._hide = v!=='all' && n.cluster!==v; });
    SX.toast(v==='all'?'Showing all clusters':'Filtered view (mock highlight)');
  });
}

/* ---------- exports ---------- */
SX.panels = { OverviewPanel, SentimentPanel, DemographicsPanel, TrendsPanel, NetworkPanel, mountOverview, mountSentiment, mountDemographics, mountTrends, mountNetwork };
})();
