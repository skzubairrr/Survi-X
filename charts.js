/* ============================================================
   SurviX — Chart Engine (dependency-free canvas renderers)
   Exports: SX.charts.{line, donut, hbars, cloud, sparks}, SX.Network
   ============================================================ */

(function(){
'use strict';

const SX = (window.SX = window.SX || {});
SX.charts = {};
const charts = SX.charts;
const registry = [];

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

/* Auto-refresh all charts on resize (debounced) */
window.addEventListener('resize', ()=>{
  clearTimeout(charts._rt);
  charts._rt = setTimeout(()=>registry.forEach(c=>{ if(c&&c._redraw) c._redraw(); }), 160);
});

/* ---------- shared helpers ---------- */
function hexA(hex, a){
  const h = hex.replace('#','');
  const n = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}
function roundRect(ctx,x,y,w,h,r){
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);     ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function fitCanvas(canvas, wrap, wantH){
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max((wrap||canvas.parentElement).clientWidth, 240);
  const h = wantH || canvas._h || 260;
  canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
  canvas.style.height = h+'px';
  canvas._h = h;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return { ctx, w, h };
}
function tipEl(){ return document.getElementById('tip'); }
function showTip(html, x, y){
  const t = tipEl(); if(!t) return;
  t.innerHTML = html; t.style.opacity = 1;
  const r = t.getBoundingClientRect();
  let left = x+14, top = y+14;
  if(left + r.width > window.innerWidth-10)  left = x - r.width - 14;
  if(top  + r.height > window.innerHeight-10) top = y - r.height - 14;
  t.style.left = left+'px'; t.style.top = top+'px';
}
function hideTip(){ const t = tipEl(); if(t) t.style.opacity = 0; }

function niceTicks(min, max, n){
  const span = max-min || 1;
  const step0 = span/Math.max(n,1);
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0/mag;
  const step = (norm>=5?10:norm>=2?5:norm>=1?2:1)*mag;
  const start = Math.ceil(min/step)*step;
  const out = [];
  for(let v=start; v<=max+1e-9; v+=step) out.push(v);
  return out;
}
const fmtNum = v => v>=1e6 ? (v/1e6).toFixed(1).replace(/\.0$/,'')+'M' : v>=1e3 ? (v/1e3).toFixed(1).replace(/\.0$/,'')+'K' : String(Math.round(v));
function drawGridY(ctx, x0, x1, y0, y1, maxV){
  const ticks = niceTicks(0, maxV, 4);
  ctx.font = '10px IBM Plex Mono, monospace';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ticks.forEach(v=>{
    const y = y1 - (v/maxV)*(y1-y0);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(43,33,27,.08)';
    ctx.beginPath(); ctx.moveTo(x0, y+.5); ctx.lineTo(x1, y+.5); ctx.stroke();
    ctx.fillStyle = '#6B7686';
    ctx.fillText(fmtNum(v), x0-7, y);
  });
  return maxV;
}

/* ============================================================
   LINE / AREA CHART — multi-series with hover crosshair
   ============================================================ */
charts.line = function(opts){
  const { canvas, dates, series, height=260, yMax, area=true, yFormat='pct' } = opts;
  const wrap = canvas.parentElement;
  let geo = null;

  function draw(){
    const { ctx, w, h } = fitCanvas(canvas, wrap, height);
    const padL = yFormat==='none' ? 10 : 38, padR = 12, padT = 12, padB = 22;
    const x0=padL, x1=w-padR, y0=padT, y1=h-padB;
    const n = dates.length;
    const allVals = series.flatMap(s=>s.data);
    const maxV = yMax != null ? yMax : Math.max(...allVals)*1.12;

    if(yFormat!=='none') drawGridY(ctx, x0, x1, y0, y1, maxV);

    /* x labels: first, mid, last, event markers */
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillStyle='#6B7686'; ctx.font='10px IBM Plex Mono, monospace';
    [0, Math.floor((n-1)/2), n-1].forEach(i=>{
      const x = x0 + (i/(n-1))*(x1-x0);
      ctx.fillText(dates[i].slice(5), x, y1+7);
    });

    const X = i => x0 + (n===1?0:(i/(n-1))*(x1-x0));
    const Y = v => y1 - clamp(v/maxV,0,1)*(y1-y0);

    series.forEach(s=>{
      const pts = s.data.map((v,i)=>[X(i), Y(v)]);
      if(area && s.fill!==false){
        ctx.beginPath();
        pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
        ctx.lineTo(pts[pts.length-1][0], y1); ctx.lineTo(pts[0][0], y1); ctx.closePath();
        ctx.fillStyle = hexA(s.color,.07); ctx.fill();
      }
      ctx.beginPath();
      pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width||1.6;
      ctx.lineJoin='round'; ctx.lineCap='round';
      if(s.dash) ctx.setLineDash(s.dash); 
      ctx.stroke();
      ctx.setLineDash([]);
    });

    geo = { x0, x1, y0, y1, X, Y, n, maxV };
  }

  canvas.addEventListener('mousemove', e=>{
    if(!geo) return;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const i = clamp(Math.round(((mx-geo.x0)/(geo.x1-geo.x0))*(geo.n-1)), 0, geo.n-1);
    const cx = geo.X(i);
    const ctx = canvas.getContext('2d');
    draw();
    /* crosshair */
    ctx.strokeStyle='rgba(91,127,212,.45)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx, geo.y0); ctx.lineTo(cx, geo.y1); ctx.stroke();
    series.forEach(s=>{
      const v = s.data[i]; if(v==null) return;
      ctx.beginPath(); ctx.arc(cx, geo.Y(v), 3.5, 0, Math.PI*2);
      ctx.fillStyle = s.color; ctx.fill();
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.stroke();
    });
    const rows = series.map(s=>`<div class="row"><i style="background:${s.color}"></i>${s.name}: <b>${yFormat==='pct'?s.data[i]+'%':fmtNum(s.data[i])}</b></div>`).join('');
    showTip(`<b>${dates[i]}</b>${rows}`, e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseleave', ()=>{ hideTip(); draw(); });

  draw();
  const h = { _redraw: draw, _type:'line' };
  registry.push(h);
  return h;
};

/* ============================================================
   DONUT CHART — with center label & hover
   ============================================================ */
charts.donut = function(opts){
  const { canvas, data, height=240, centerLabel } = opts;
  const wrap = canvas.parentElement;
  let arcs = [];

  function draw(hoverIdx=-1){
    const { ctx, w, h } = fitCanvas(canvas, wrap, height);
    const total = data.reduce((a,d)=>a+d.pct,0);
    const cx=w/2, cy=h/2, R=Math.min(w,h)/2-6, r=R*0.62;
    arcs = [];
    let a0 = -Math.PI/2;
    data.forEach((d,i)=>{
      const a1 = a0 + (d.pct/total)*Math.PI*2;
      const hov = i===hoverIdx;
      const mid = (a0+a1)/2, off = hov?5:0;
      const ccx = cx+Math.cos(mid)*off, ccy = cy+Math.sin(mid)*off;
      ctx.beginPath();
      ctx.arc(ccx,ccy,R,a0+0.008,a1-0.008);
      ctx.arc(ccx,ccy,r,a1-0.008,a0+0.008,true);
      ctx.closePath();
      ctx.fillStyle = hexA(d.color, hov?1:.88);
      ctx.fill();
      if(hov){ ctx.strokeStyle='#1E2A3B'; ctx.lineWidth=1.6; ctx.stroke(); }
      arcs.push({ a0, a1, i });
      a0 = a1;
    });
    /* center */
    ctx.textAlign='center';
    ctx.fillStyle='#1E2A3B'; ctx.font='500 19px IBM Plex Mono, monospace';
    ctx.textBaseline='middle';
    const sel = hoverIdx>=0 ? data[hoverIdx] : null;
    ctx.fillText(sel ? sel.pct+'%' : (centerLabel||total+'%'), cx, cy-6);
    ctx.fillStyle='#6B7686'; ctx.font='500 8.5px IBM Plex Mono, monospace';
    ctx.fillText(sel ? sel.name.toUpperCase() : (centerSub||'ALL SIGNALS'), cx, cy+12);
  }
  let centerSub = opts.centerSub || '';

  canvas.addEventListener('mousemove', e=>{
    const r = canvas.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const ang = Math.atan2(e.clientY-cy, e.clientX-cx);
    let idx=-1;
    arcs.forEach(a=>{ 
      let d = ang - a.a0;
      const span = a.a1-a.a0;
      d = ((d%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
      if(d<=span) idx=a.i;
    });
    if(idx!==-1){
      draw(idx);
      const d = data[idx];
      showTip(`<b>${d.name}</b><div class="row"><i style="background:${d.color}"></i>Share: <b>${d.pct}%</b></div>`, e.clientX, e.clientY);
    } else { draw(); hideTip(); }
  });
  canvas.addEventListener('mouseleave', ()=>{ draw(); hideTip(); });

  draw();
  const h = { _redraw: draw, _type:'donut' };
  registry.push(h);
  return h;
};

/* ============================================================
   HORIZONTAL BARS — animated, with value labels
   ============================================================ */
charts.hbars = function(opts){
  const { canvas, data, height, color='#5B7FD4', suffix='%', mono=true } = opts;
  const wrap = canvas.parentElement;
  const H = height || data.length*30+8;
  let progress = 0;

  function draw(){
    const { ctx, w, h } = fitCanvas(canvas, wrap, H);
    progress = Math.min(1, progress+0.08);
    const p = 1-Math.pow(1-progress,3);
    const rowH = h/data.length;
    const maxV = Math.max(...data.map(d=>d.pct));
    const maxW = w-56;
    data.forEach((d,i)=>{
      const top = i*rowH;
      /* label above bar (any length) */
      ctx.fillStyle='#3E4C61'; ctx.font='500 10px Inter, sans-serif';
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      ctx.fillText(d.label, 0, top+11, maxW-40);
      const by = top+16, bh = rowH-22;
      const bw = (d.pct/maxV)*maxW*p;
      ctx.fillStyle='#EDF0F5';
      roundRect(ctx, 0, by, maxW, bh, 1); ctx.fill();
      ctx.strokeStyle='#D8DDE6'; ctx.lineWidth=1; ctx.stroke(); /* hairline track border, matches .track/.bar */
      ctx.fillStyle = hexA(color,.9);
      roundRect(ctx, 0, by, Math.max(bw,2), bh, 1); ctx.fill();
      ctx.fillStyle='#1E2A3B'; ctx.font=(mono?'500 10px IBM Plex Mono, monospace':'500 10px Inter');
      ctx.textAlign='right'; ctx.textBaseline='alphabetic';
      ctx.fillText(d.pct+suffix, w-2, by+bh-1);
    });
  }
  let frames=0;
  const tick=()=>{ draw(); frames++; if(frames<18) requestAnimationFrame(tick); };
  tick();
  const h = { _redraw: draw, _type:'hbars' };
  registry.push(h);
  return h;
};

/* ============================================================
   SPARKLINE (tiny, no axes)
   ============================================================ */
charts.spark = function(canvas, data, color, area=true){
  const w = canvas.parentElement.clientWidth||110, h = canvas.height||34;
  const dpr = window.devicePixelRatio||1;
  canvas.width=w*dpr; canvas.height=h*dpr; canvas.style.width=w+'px'; canvas.style.height=h+'px';
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  const max=Math.max(...data), min=Math.min(...data), span=(max-min)||1;
  const X=i=>(i/(data.length-1))*(w-4)+2, Y=v=>h-3-((v-min)/span)*(h-8);
  if(area){
    ctx.beginPath();
    data.forEach((v,i)=>i?ctx.lineTo(X(i),Y(v)):ctx.moveTo(X(i),Y(v)));
    ctx.lineTo(w-2,h); ctx.lineTo(2,h); ctx.closePath(); ctx.fillStyle=hexA(color,.08); ctx.fill();
  }
  ctx.beginPath();
  data.forEach((v,i)=>i?ctx.lineTo(X(i),Y(v)):ctx.moveTo(X(i),Y(v)));
  ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.lineJoin='round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(X(data.length-1), Y(data[data.length-1]), 2, 0, Math.PI*2);
  ctx.fillStyle=color; ctx.fill();
};

/* ============================================================
   WORD CLOUD — spiral placement, weight-scaled, two-tone
   ============================================================ */
charts.cloud = function(container, words, opts={}){
  const H = opts.height || 240;
  container.innerHTML='';
  const c = document.createElement('canvas');
  container.appendChild(c);
  function draw(){
    const dpr = window.devicePixelRatio||1;
    const W = Math.max(container.clientWidth, 260);
    c.width=W*dpr; c.height=H*dpr; c.style.width=W+'px'; c.style.height=H+'px';
    const ctx=c.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);
    const maxS = Math.max(...words.map(w=>w.s)), minS = Math.min(...words.map(w=>w.s));
    const placed = [];
    const palette = opts.colors || ['#5B7FD4','#A9B4C9','#7A8CD8','#4E9A6E','#5B7FD4','#E09A4E'];
    words.forEach((word, idx)=>{
      const t = (word.s-minS)/(maxS-minS||1);
      const size = Math.round(11 + t*24);
      ctx.font = `${t>0.55?600:500} ${size}px Inter, sans-serif`;
      const tw = ctx.measureText(word.w).width;
      let x=W/2, y=H/2, angle = (idx*0.9)%(Math.PI*2);
      let ok=false;
      for(let step=0; step<420 && !ok; step++){
        const rx=(W/2-30)*Math.sqrt(step/420), ry=(H/2-24)*Math.sqrt(step/420);
        x = W/2 + Math.cos(angle)*rx*1.4; y = H/2 + Math.sin(angle)*ry*1.6;
        angle += 0.35;
        ok = placed.every(p=>{
          const px=Math.abs(p.x-x)<(p.w+tw)/2+8, py=Math.abs(p.y-y)<Math.max(p.s,size)*0.72+6;
          return !(px&&py);
        });
        x = clamp(x, tw/2+6, W-tw/2-6); y = clamp(y, size*0.7, H-6);
      }
      if(!ok) return;
      placed.push({x,y,w:tw,s:size});
      const col = t>0.72 ? '#5B7FD4' : palette[idx%palette.length];
      ctx.save();
      ctx.translate(x,y);
      ctx.globalAlpha = 0.55+t*0.45;
      ctx.fillStyle = col;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(word.w, 0, 0);
      ctx.restore();
    });
  }
  draw();
  const h={_redraw:draw,_type:'cloud'};
  registry.push(h);
  return h;
};

/* ============================================================
   COMBO CHART — bars (volume) + overlaid line (sentiment)
   ============================================================ */
charts.combo = function(opts){
  const { canvas, dates, bars, line, height=280, lineMax=10 } = opts;
  const wrap = canvas.parentElement;
  let geo = null;

  function draw(){
    const { ctx, w, h } = fitCanvas(canvas, wrap, height);
    const padL=40, padR=40, padT=12, padB=22;
    const x0=padL, x1=w-padR, y0=padT, y1=h-padB;
    const n = dates.length;
    const maxB = Math.max(...bars)*1.15;

    /* left axis = volume */
    drawGridY(ctx, x0, x1, y0, y1, maxB);
    /* right axis = sentiment 0..10 */
    ctx.font='10px IBM Plex Mono, monospace'; ctx.textAlign='left'; ctx.textBaseline='middle';
    [0,2.5,5,7.5,10].forEach(v=>{
      const y = y1-(v/10)*(y1-y0);
      ctx.fillStyle='#6B7686';
      ctx.fillText(v.toFixed(1), x1+6, y);
    });

    /* x labels */
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillStyle='#6B7686';
    [0, Math.floor((n-1)/2), n-1].forEach(i=>{
      const x = x0+(i/(n-1))*(x1-x0);
      ctx.fillText(dates[i].slice(5), x, y1+7);
    });

    const X = i => x0+(i/(n-1))*(x1-x0);
    const slot = (x1-x0)/n;

    /* bars */
    bars.forEach((v,i)=>{
      const bh = (v/maxB)*(y1-y0);
      const bw = Math.min(slot*0.56, 18);
      const bx = X(i)-bw/2;
      ctx.fillStyle='rgba(91,127,212,.34)'; /* muted blue bars */
      roundRect(ctx, bx, y1-bh, bw, bh, 1); ctx.fill();
    });

    /* line */
    const LY = v => y1-(clamp(v/lineMax,0,1))*(y1-y0);
    const pts = line.map((v,i)=>[X(i), LY(v)]);
    ctx.beginPath();
    pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
    ctx.lineTo(pts[n-1][0],y1); ctx.lineTo(pts[0][0],y1); ctx.closePath();
    ctx.fillStyle=hexA('#5B7FD4',.06); ctx.fill();
    ctx.beginPath();
    pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
    ctx.strokeStyle='#5B7FD4'; ctx.lineWidth=1.6; ctx.lineJoin='round'; ctx.stroke();
    /* end dot */
    ctx.beginPath(); ctx.arc(pts[n-1][0],pts[n-1][1],3.4,0,Math.PI*2);
    ctx.fillStyle='#5B7FD4'; ctx.fill();

    geo = { x0,x1,y0,y1,X,n,bars,line,dates,LY };
  }

  canvas.addEventListener('mousemove', e=>{
    if(!geo) return;
    const r=canvas.getBoundingClientRect();
    const mx=e.clientX-r.left;
    const i=clamp(Math.round(((mx-geo.x0)/(geo.x1-geo.x0))*(geo.n-1)),0,geo.n-1);
    const cx=geo.X(i);
    const ctx=canvas.getContext('2d');
    draw();
    ctx.strokeStyle='rgba(91,127,212,.45)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx,geo.y0); ctx.lineTo(cx,geo.y1); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, geo.LY(geo.line[i]), 3.5, 0, Math.PI*2);
    ctx.fillStyle='#5B7FD4'; ctx.fill(); ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=1.5; ctx.stroke();
    showTip(`<b>${geo.dates[i]}</b><div class="row"><i style="background:#7A8CD8"></i>Engagement: <b>${fmtNum(geo.bars[i])}</b></div><div class="row"><i style="background:#5B7FD4"></i>Sentiment: <b>${geo.line[i].toFixed(1)}/10</b></div>`, e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseleave', ()=>{ hideTip(); draw(); });

  draw();
  const hnd={_redraw:draw,_type:'combo'}; registry.push(hnd); return hnd;
};

/* ============================================================
   SCRUBBER CHART — sentiment area + draggable playhead + events
   ============================================================ */
charts.scrubber = function(opts){
  const { canvas, dates, series, events=[], height=230, yMax=100 } = opts;
  const wrap = canvas.parentElement;
  let geo=null, pos=null; /* pos = selected day index */

  function draw(){
    const { ctx, w, h } = fitCanvas(canvas, wrap, height);
    const padL=34, padR=12, padT=10, padB=26;
    const x0=padL,x1=w-padR,y0=padT,y1=h-padB-8;
    const n=dates.length;
    const X=i=>x0+(i/(n-1))*(x1-x0);
    const Y=v=>y1-clamp(v/yMax,0,1)*(y1-y0);

    drawGridY(ctx,x0,x1,y0,y1,yMax);
    ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillStyle='#6B7686'; ctx.font='10px IBM Plex Mono, monospace';
    [0,Math.floor((n-1)/2),n-1].forEach(i=>ctx.fillText(dates[i].slice(5),X(i),y1+14));

    /* stacked areas: positive / neutral / negative */
    const P = opts.colors || { positive:'#4E9A6E', neutral:'#8894A6', negative:'#CC5F52' };
    const stack = [
      { key:'positive', color:P.positive },
      { key:'neutral',  color:P.neutral },
      { key:'negative', color:P.negative },
    ];
    let base = new Array(n).fill(0);
    stack.forEach(s=>{
      const d = series[s.key];
      const top = d.map((v,i)=>base[i]+v);
      ctx.beginPath();
      top.forEach((v,i)=>i?ctx.lineTo(X(i),Y(v)):ctx.moveTo(X(i),Y(v)));
      for(let i=n-1;i>=0;i--) ctx.lineTo(X(i),Y(base[i]));
      ctx.closePath();
      ctx.fillStyle = hexA(s.color,.28); ctx.fill();
      ctx.beginPath();
      top.forEach((v,i)=>i?ctx.lineTo(X(i),Y(v)):ctx.moveTo(X(i),Y(v)));
      ctx.strokeStyle = hexA(s.color,.85); ctx.lineWidth=1.4; ctx.stroke();
      base = top;
    });

    /* event pins */
    events.forEach(ev=>{
      const i = dates.indexOf(ev.date);
      if(i<0) return;
      const x=X(i), on = pos===i;
      ctx.beginPath(); ctx.moveTo(x,y0+2); ctx.lineTo(x,y1); ctx.setLineDash([3,3]);
      ctx.strokeStyle = on ? 'rgba(91,127,212,.9)' : 'rgba(91,127,212,.35)';
      ctx.lineWidth=1; ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(x,y0+2,on?5:3.6,0,Math.PI*2);
      ctx.fillStyle = on ? '#5B7FD4' : 'rgba(91,127,212,.7)';
      ctx.fill();
    });

    /* playhead */
    if(pos!=null){
      const x=X(pos);
      ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(x,y1+6);
      ctx.strokeStyle='#1E2A3B'; ctx.lineWidth=1.4; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x-5,y1+6); ctx.lineTo(x+5,y1+6); ctx.lineTo(x,y1+13); ctx.closePath();
      ctx.fillStyle='#1E2A3B'; ctx.fill();
    }
    geo={x0,x1,y0,y1,X,n};
  }

  function pickDay(e){
    if(!geo) return null;
    const r=canvas.getBoundingClientRect();
    const mx=e.clientX-r.left;
    return clamp(Math.round(((mx-geo.x0)/(geo.x1-geo.x0))*(geo.n-1)),0,geo.n-1);
  }
  canvas.addEventListener('mousemove', e=>{
    if(!geo) return;
    const i=pickDay(e);
    const ctx=canvas.getContext('2d');
    draw();
    const x=geo.X(i);
    ctx.strokeStyle='rgba(43,33,27,.28)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x,geo.y0); ctx.lineTo(x,geo.y1); ctx.stroke();
    const ev = events.find(ev=>ev.date===dates[i]);
    showTip(`<b>${dates[i]}${ev?' · EVT: '+ev.title:''}</b>`+
      `<div class="row"><i style="background:#4E9A6E"></i>Positive: <b>${series.positive[i]}%</b></div>`+
      `<div class="row"><i style="background:#7A8CD8"></i>Neutral: <b>${series.neutral[i]}%</b></div>`+
      `<div class="row"><i style="background:#CC5F52"></i>Negative: <b>${series.negative[i]}%</b></div>`, e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseleave', ()=>{ hideTip(); draw(); if(onPick) onPick(pos); });
  canvas.addEventListener('click', e=>{
    const i=pickDay(e);
    pos=i; draw();
    if(onPick) onPick(i);
  });
  let onPick=null;

  draw();
  const hnd={
    _redraw:draw,_type:'scrub',
    setDay(i){ pos=i; draw(); },
    onPick(fn){ onPick=fn; },
    clear(){ pos=null; draw(); },
  };
  registry.push(hnd); return hnd;
};

/* ============================================================
   NETWORK GRAPH — force-directed, interactive, spread animation
   ============================================================ */
SX.Network = function(opts){
  const { canvas, nodes, edges, clusters, onNodeSelect } = opts;
  canvas._h = opts.height || 480;
  const clusterMap = {}; clusters.forEach(c=>clusterMap[c.id]=c);
  const N = nodes.map(n=>({
    ...n,
    x: 0, y: 0, vx: 0, vy: 0,
    r: 8 + (n.influence/100)*16,
    color: clusterMap[n.cluster] ? clusterMap[n.cluster].color : '#3E4C61',
    cls: clusterMap[n.cluster] ? clusterMap[n.cluster].name : 'Other',
  }));
  const E = edges.map(e=>({ a:N.find(n=>n.id===e[0]), b:N.find(n=>n.id===e[1]), w:e[2] })).filter(e=>e.a&&e.b);
  const W = ()=>canvas.parentElement.clientWidth;
  const H = ()=>canvas._h;

  /* size canvas to its container (dpr-aware) */
  function sizeCanvas(){
    const dpr = window.devicePixelRatio||1;
    const w = Math.max(W(), 240);
    canvas.width = Math.round(w*dpr);
    canvas.height = Math.round(H()*dpr);
    canvas.style.width = w+'px';
    canvas.style.height = H()+'px';
  }
  sizeCanvas();
  canvas.style.cursor='default';
  window.addEventListener('resize', ()=>{
    sizeCanvas();
    N.forEach(n=>{ n.x=clamp(n.x, n.r+6, W()-n.r-6); n.y=clamp(n.y, n.r+6, H()-n.r-6); });
  });

  /* init positions in a circle */
  N.forEach((n,i)=>{
    const a = (i/N.length)*Math.PI*2;
    n.x = W()/2 + Math.cos(a)*(W()*0.30);
    n.y = H()/2 + Math.sin(a)*(H()*0.32);
  });

  /* adjacency for spread BFS */
  const adj = {};
  E.forEach(e=>{
    (adj[e.a.id]=adj[e.a.id]||[]).push(e.b.id);
    (adj[e.b.id]=adj[e.b.id]||[]).push(e.a.id);
  });

  let alpha = 1, running = true, hover = null, selected = null;
  let drag = null, dragging = false, moved = 0;
  const spread = { active:false, phase:0, reached:new Set(), front:[] };
  /* per-node diffusion burst rings (1 → 0), fired as each spread wave lands */

  /* ---------- simulation ---------- */
  function step(){
    if(!running) return;
    alpha = Math.max(alpha*0.996, 0.03);
    /* repulsion */
    for(let i=0;i<N.length;i++){
      const a=N[i];
      for(let j=i+1;j<N.length;j++){
        const b=N[j];
        let dx=b.x-a.x, dy=b.y-a.y;
        let d2=dx*dx+dy*dy; if(d2<1) d2=1;
        const f = 2600/d2;
        const d = Math.sqrt(d2);
        dx/=d; dy/=d;
        a.vx-=dx*f; a.vy-=dy*f;
        b.vx+=dx*f; b.vy+=dy*f;
      }
      /* centering */
      a.vx += (W()/2-a.x)*0.0016;
      a.vy += (H()/2-a.y)*0.0018;
    }
    /* spring attraction */
    E.forEach(e=>{
      let dx=e.b.x-e.a.x, dy=e.b.y-e.a.y;
      const d=Math.sqrt(dx*dx+dy*dy)||1;
      const target = 130 - e.w*6;
      const f = (d-target)*0.0035*(e.w/9);
      dx/=d; dy/=d;
      e.a.vx+=dx*f*d*0.05; e.a.vy+=dy*f*d*0.05;
      e.b.vx-=dx*f*d*0.05; e.b.vy-=dy*f*d*0.05;
    });
    N.forEach(n=>{
      if(n===drag) return;
      n.vx*=0.86; n.vy*=0.86;
      n.x+=n.vx; n.y+=n.vy;
      n.x = clamp(n.x, n.r+6, W()-n.r-6);
      n.y = clamp(n.y, n.r+6, H()-n.r-6);
    });
  }

  /* ---------- render ---------- */
  function render(){
    const dpr = window.devicePixelRatio||1;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W(),H());

    const dim = n => (selected && selected!==n && !adj[selected.id]?.includes(n.id)) ? 0.13 : 1;

    /* edges */
    E.forEach(e=>{
      const focus = selected && (e.a===selected||e.b===selected);
      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y);
      const g = ctx.createLinearGradient(e.a.x,e.a.y,e.b.x,e.b.y);
      const aCol = hexA(e.a.color, 0.5*dim(e.a)), bCol = hexA(e.b.color, 0.5*dim(e.b));
      g.addColorStop(0,aCol); g.addColorStop(1,bCol);
      ctx.strokeStyle = focus ? 'rgba(91,127,212,.75)' : g;
      ctx.lineWidth = focus ? 2 : 0.6+e.w*0.16;
      ctx.stroke();
      /* spread pulse travelling along edges */
      if(spread.active && spread.reached.has(e.a.id) && !spread.reached.has(e.b.id) ||
         spread.active && spread.reached.has(e.b.id) && !spread.reached.has(e.a.id)){
        const t = (spread.phase%1);
        const reached = spread.reached.has(e.a.id) ? e.a : e.b;
        const other = reached===e.a ? e.b : e.a;
        const px = lerp(reached.x, other.x, t), py = lerp(reached.y, other.y, t);
        ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI*2);
        ctx.fillStyle='#5B7FD4';
        ctx.fill();
      }
    });

    /* nodes */
    N.forEach(n=>{
      const isSel = n===selected, isHov = n===hover;
      const reach = spread.reached.has(n.id);
      ctx.globalAlpha = reach?1:dim(n);
      if(reach){
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+6,0,Math.PI*2);
        ctx.fillStyle = hexA('#5B7FD4',.18); ctx.fill();
      }
      /* diffusion burst ring — pulses on the frame the node is newly reached */
      if(n._burst>0){
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+4+(1-n._burst)*16,0,Math.PI*2);
        ctx.strokeStyle = hexA('#5B7FD4', n._burst*.85);
        ctx.lineWidth = 1.6;
        ctx.stroke();
        n._burst = Math.max(0, n._burst-0.02);
      }
      /* influence halo */
      if(n.influence>=80){
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+4,0,Math.PI*2);
        ctx.strokeStyle = hexA(n.color,.5); ctx.lineWidth=1.4; ctx.stroke();
      }
      if(n.bridge){
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+8,0,Math.PI*2);
        ctx.strokeStyle = hexA(n.color,.22); ctx.setLineDash([2,4]); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle=hexA(n.color, .88); ctx.fill();
      if(isSel||isHov){
        ctx.strokeStyle = isSel?'#1E2A3B':'rgba(43,33,27,.5)';
        ctx.lineWidth=1.6; ctx.stroke();
      }
      /* label */
      if(n.influence>=55 || isSel || isHov || reach){
        ctx.globalAlpha = 1;
        ctx.font = (isSel?'700 ':'600 ')+'10.5px Inter, sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='top';
        ctx.fillStyle = isSel?'#1E2A3B':'rgba(118,104,93,.95)';
        ctx.fillText(n.label, n.x, n.y+n.r+4);
      }
      ctx.globalAlpha=1;
    });
  }

  /* one frame of sim + paint (factored out so it can be driven manually too) */
  function frame(){
    step(); render();
    if(spread.active){
      spread.phase += 0.025;
      /* expand frontier */
      if(spread.phase>=1){
        spread.phase = 0;
        const add = [];
        spread.reached.forEach(id=>{
          (adj[id]||[]).forEach(nb=>{ if(!spread.reached.has(nb)) add.push(nb); });
        });
        add.forEach(id=>spread.reached.add(id));
        add.forEach(id=>{ const n=N.find(x=>x.id===id); if(n) n._burst=1; });
        if(spread.opts && spread.opts.onWave) spread.opts.onWave(spread.reached);
        if(spread.reached.size>=N.length){ spread.active=false; if(spread.opts&&spread.opts.onDone) spread.opts.onDone(); }
      }
    }
  }

  function loop(){
    if(running){
      frame();
    }
    requestAnimationFrame(loop);
  }

  /* ---------- interaction ---------- */
  function pick(mx,my){
    for(let i=N.length-1;i>=0;i--){
      const n=N[i];
      const dx=mx-n.x, dy=my-n.y;
      if(dx*dx+dy*dy < (n.r+6)*(n.r+6)) return n;
    }
    return null;
  }
  canvas.addEventListener('mousemove', e=>{
    const r=canvas.getBoundingClientRect();
    const mx=e.clientX-r.left, my=e.clientY-r.top;
    if(drag){
      drag.x=mx; drag.y=my; drag.vx=0; drag.vy=0; moved++;
      return;
    }
    hover = pick(mx,my);
    canvas.style.cursor = hover ? 'pointer' : 'grab';
    if(hover){
      showTip(`<b>${hover.label}</b><div class="row"><i style="background:${hover.color}"></i>${hover.cls}</div><div class="row">Influence: <b>${hover.influence}/100</b></div><div class="row">Followers: <b>${fmtNum(hover.followers)}</b></div>${hover.bridge?'<div class="row">Cluster bridge</div>':''}`, e.clientX, e.clientY);
    } else hideTip();
  });
  canvas.addEventListener('mousedown', e=>{
    const r=canvas.getBoundingClientRect();
    const n=pick(e.clientX-r.left, e.clientY-r.top);
    if(n){ drag=n; moved=0; alpha=Math.max(alpha,0.25); canvas.style.cursor='grabbing'; }
  });
  window.addEventListener('mouseup', ()=>{
    if(drag && moved<3){ /* click without drag = select node */
      selected = (selected===drag)?null:drag;
      onNodeSelect && onNodeSelect(selected);
    }
    drag=null;
    canvas.style.cursor='grab';
  });
  canvas.addEventListener('mouseleave', ()=>{ hover=null; hideTip(); canvas.style.cursor='default'; });

  /* ---------- public API ---------- */
  function relayout(){
    alpha=1;
    N.forEach((n,i)=>{
      const a=(i/N.length)*Math.PI*2 + Math.random()*0.6;
      n.x=W()/2+Math.cos(a)*(W()*0.3);
      n.y=H()/2+Math.sin(a)*(H()*0.32);
      n.vx=n.vy=0;
    });
  }
  function startSpread(o){
    const origin = N.find(n=>n.id===(o.origin||'dr_aris'));
    spread.reached = new Set([origin.id]);
    spread.active = true; spread.phase = 0; spread.opts = o;
    origin._burst = 1; /* pulse the patient-zero node */
    if(o.onWave) o.onWave(spread.reached);
  }
  function stopSpread(){ spread.active=false; spread.reached=new Set(); N.forEach(n=>{ n._burst=0; }); }
  function select(id){ selected = id?N.find(n=>n.id===id):null; onNodeSelect && onNodeSelect(selected); }
  function setRunning(v){ running=v; }

  loop();
  const api = { relayout, startSpread, stopSpread, select, setRunning, frame, nodes:N, edges:E };
  canvas._net = api;
  return api;
};

})();
