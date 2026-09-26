/* ============================================================
   SurviX — Mock Data Layer
   Structured to mirror future REST/GraphQL API payloads so the
   fetches in app.js can be swapped for real endpoints 1:1.
   Palette: muted terminal-grade data colors (amber = accent).
   ============================================================ */

const SURVIX = (window.SURVIX = {});

/* ---------- Platforms ---------- */
SURVIX.platforms = [
  { id:'x',        name:'X',         status:'connected', tier:'core',    ingest:'live',    latency:'120ms', rows:'2.4M', color:'#1E2A3B' },
  { id:'telegram', name:'Telegram',  status:'connected', tier:'core',    ingest:'live',    latency:'210ms', rows:'1.1M', color:'#7A8CD8' },
  { id:'instagram',name:'Instagram', status:'syncing',   tier:'good',    ingest:'syncing', latency:'640ms', rows:'890K', color:'#5B7FD4' },
  { id:'facebook', name:'Facebook',  status:'connected', tier:'good',    ingest:'live',    latency:'330ms', rows:'1.6M', color:'#4E9A6E' },
  { id:'reddit',   name:'Reddit',    status:'connected', tier:'good',    ingest:'live',    latency:'180ms', rows:'3.2M', color:'#CC5F52' },
  { id:'youtube',  name:'YouTube',   status:'connected', tier:'bonus',   ingest:'live',    latency:'290ms', rows:'760K', color:'#E09A4E' },
  { id:'linkedin', name:'LinkedIn',  status:'good',      tier:'good',    ingest:'idle',    latency:'—',     rows:'—',    color:'#8894A6' },
  { id:'tiktok',   name:'TikTok',    status:'bonus',     tier:'bonus',   ingest:'idle',    latency:'—',     rows:'—',    color:'#8B7FD6' },
];

/* ---------- Timeline helper: last 30 days ---------- */
function _dates(n){
  const out=[], now=new Date('2026-09-25T00:00:00Z');
  for(let i=n-1;i>=0;i--){
    const d=new Date(now); d.setUTCDate(d.getUTCDate()-i);
    out.push(d.toISOString().slice(0,10));
  }
  return out;
}
const D30 = _dates(30);

/* ---------- Overview KPIs ---------- */
SURVIX.overview = {
  kpis:{
    followers:{ value:1284900, delta:+6.8, label:'Total Followers Analyzed' },
    platforms:{ value:6, delta:0, label:'Active Platforms Connected' },
    sentiment:{ value:7.4, delta:+0.6, label:'Overall Sentiment Score /10', scale:10 },
    trend:{ value:'Agrarian policy backlash', delta:+164, label:'Top Trending Topic', unit:' mentions/day' },
  },
  /* daily: engagement volume + avg sentiment (per day, all platforms) */
  timeline:{
    dates:D30,
    mentions:[ 11800,12400,12100,13900,15200,14800,16100,15900,17400,18900,
               18600,20100,22800,21500,20900,23400,26100,25400,24100,27600,
               31200,29800,28400,35100,42300,38900,33400,30100,32600,34900 ],
    sentiment:[ 6.1,6.0,6.2,6.3,6.4,6.1,6.5,6.6,6.4,6.6,
                6.7,6.5,6.8,6.9,6.6,6.7,7.0,7.1,6.9,7.0,
                7.2,7.1,6.8,7.3,7.8,7.6,7.2,7.0,7.3,7.4 ],
    positive:[ 42,41,43,44,45,42,46,47,45,47,48,46,49,50,47,48,51,52,50,51,53,52,49,54,58,56,52,50,53,54 ],
    negative:[ 31,32,31,30,29,32,28,27,29,27,26,28,25,24,27,26,23,22,24,23,21,22,25,20,15,17,21,24,21,19 ],
    neutral:  [ 27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,26,26,27 ],
  },
};

/* ---------- Named events (scrubber) ---------- */
SURVIX.events = [
  { date:'2026-09-13', title:'Product Beta Launch', desc:'Beta invite wave shipped. Engagement volume jumped 38% in 24h; excitement dominated mention tone across X and Reddit.',
    stats:{ 'Mentions':'+38%','Sentiment':'6.9 → 7.2','Reach':'1.9M','Posts':'8,412' } },
  { date:'2026-09-18', title:'Influencer Collab — @dr_aris', desc:'A 2.1M-follower KOL posted a first-look reel. Sarcasm spike detected (14%) but net sentiment stayed positive.',
    stats:{ 'Mentions':'41.2K peak','Sentiment':'7.0 → 7.6','Reach':'3.4M','Posts':'12,077' } },
  { date:'2026-09-24', title:'Pricing Page Incident', desc:'A transient pricing-page bug triggered an anxiety spike (19%) and a sharp negative cluster on X; resolved in 6h.',
    stats:{ 'Mentions':'-9% dip','Sentiment':'7.4 → 6.9','Escalations':'214','Resolved':'98%' } },
];

/* ---------- Sentiment module ---------- */
SURVIX.sentiment = {
  /* per-day series */
  series:{
    dates:D30,
    positive:[ 42,41,43,44,45,42,46,47,45,47,48,46,49,50,47,48,51,52,50,51,53,52,49,54,58,56,52,50,53,54 ],
    negative:[ 31,32,31,30,29,32,28,27,29,27,26,28,25,24,27,26,23,22,24,23,21,22,25,20,15,17,21,24,21,19 ],
    neutral:  [ 27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,26,26,27 ],
    sarcasm:   [ 4.2,4.5,4.1,3.9,4.4,5.1,4.8,4.6,5.0,5.3,5.6,6.1,6.4,6.0,5.7,5.9,6.3,6.8,7.1,6.6,5.8,5.4,5.9,6.2,7.4,7.8,7.1,6.5,6.2,5.9 ],
    anxiety:   [ 8.1,7.8,8.4,8.0,7.6,8.2,7.9,7.4,7.7,7.2,7.0,7.5,6.8,6.5,7.1,6.9,6.2,6.0,6.4,6.1,5.7,5.5,6.1,5.2,4.8,6.1,9.4,10.8,8.2,7.1 ],
    excitement:[ 9.2,9.0,9.4,9.8,10.2,9.6,10.4,10.8,10.1,10.6,11.0,10.4,11.8,12.4,11.2,11.6,12.8,13.4,12.6,13.0,13.8,13.2,12.4,14.1,17.6,16.2,14.0,12.8,13.6,14.2 ],
    supportive:[ 6.4,6.6,6.3,6.8,7.0,6.5,7.2,7.4,7.0,7.3,7.6,7.1,7.9,8.2,7.5,7.8,8.4,8.8,8.1,8.5,9.0,8.6,8.0,9.2,10.8,10.2,9.0,8.4,9.1,9.4 ],
    against:   [ 5.1,5.3,5.0,4.8,4.6,5.2,4.7,4.5,4.9,4.6,4.4,4.9,4.2,4.0,4.6,4.3,3.8,3.6,4.1,3.9,3.5,3.7,4.2,3.2,2.6,3.1,3.9,4.4,3.8,3.4 ],
  },
  emotions:[
    { name:'Excitement', pct:21, color:'#4E9A6E' },
    { name:'Supportive', pct:17, color:'#7A8CD8' },
    { name:'Neutral',    pct:16, color:'#8894A6' },
    { name:'Positive',   pct:14, color:'#A9B4C9' },
    { name:'Anxiety',    pct:11, color:'#E09A4E' },
    { name:'Sarcasm',    pct:9,  color:'#5B7FD4' },
    { name:'Against',    pct:7,  color:'#CC5F52' },
    { name:'Negative',   pct:5,  color:'#B04A3E' },
  ],
  /* sample tagged posts */
  posts:[
    { user:'nova_dev',        handle:'@nova_dev',        platform:'x',        emotion:'Excitement', conf:0.97, text:'Just got into the SurviX beta and the network graph view is unreal. Spent 40 minutes just exploring audience clusters.', time:'2h ago',    likes:4821, av:'#4E9A6E' },
    { user:'Marisol Vega',    handle:'r/growthhacking',  platform:'reddit',   emotion:'Supportive', conf:0.94, text:'Their sentiment engine caught a sarcasm spike in our launch thread that GPT-based tools completely missed. Legit impressed.', time:'4h ago',   likes:1932, av:'#CC5F52' },
    { user:'crypto_owl',      handle:'@crypto_owl',      platform:'x',        emotion:'Sarcasm',    conf:0.91, text:'Oh great, another "AI-powered audience intelligence" dashboard. Because we definitely didn\'t have 50 of those already.', time:'5h ago', likes:2870, av:'#5B7FD4' },
    { user:'ByteTheory',      handle:'ByteTheory',       platform:'youtube',  emotion:'Excitement', conf:0.95, text:'The influence scoring in the link analysis module is the coolest thing I\'ve seen in analytics all year. Full breakdown soon.', time:'7h ago',  likes:15230, av:'#E09A4E' },
    { user:'anna.builds',     handle:'@anna.builds',     platform:'instagram',emotion:'Anxiety',    conf:0.88, text:'Okay the new pricing page is stressing me out?? Did the team plan go away or am I just not seeing it in the menu.', time:'9h ago', likes:640, av:'#5B7FD4' },
    { user:'Telegram Deep Dive',handle:'@survix_chat',   platform:'telegram', emotion:'Supportive', conf:0.92, text:'Community poll: 78% of members say the emotion timeline is their favorite feature. Thanks for shipping what we asked for.', time:'11h ago',likes:918,  av:'#7A8CD8' },
    { user:'growth_henry',    handle:'@growth_henry',    platform:'x',        emotion:'Positive',   conf:0.93, text:'Audience intelligence done right: SurviX flagged two civic topics in my region a week before they popped. Wild.', time:'13h ago', likes:3311, av:'#A9B4C9' },
    { user:'Delta Foxes',     handle:'Delta Foxes',      platform:'facebook', emotion:'Against',    conf:0.86, text:'Not convinced the demographic inference is accurate. My age band is way off, and I never stated it anywhere publicly.', time:'15h ago',likes:204,  av:'#4E9A6E' },
    { user:'quietpines',      handle:'r/analytics',      platform:'reddit',   emotion:'Anxiety',    conf:0.90, text:'Serious question: if these tools can infer so much from public posts, what stops misuse at scale? The disclaimer feels thin.', time:'17h ago',likes:878,  av:'#CC5F52' },
    { user:'kofi.streams',    handle:'@kofi.streams',    platform:'x',        emotion:'Excitement', conf:0.96, text:'Clicked one node in the network graph and got the full influence breakdown — followers, reach factor, connected KOLs. Watch it. Now.', time:'18h ago', likes:5102, av:'#4E9A6E' },
    { user:'Ines Duarte',     handle:'@ines_duarte',     platform:'instagram',emotion:'Supportive', conf:0.89, text:'As a community manager, the per-platform sentiment tabs save me hours every week. More platforms please.', time:'20h ago',likes:421,  av:'#5B7FD4' },
    { user:'normcore_pete',   handle:'@normcore_pete',   platform:'facebook', emotion:'Neutral',    conf:0.95, text:'Saw the demo at the meetup. It\'s a dashboard. It has charts. It seemed fast. That\'s all I\'ve got.', time:'22h ago',likes:89,   av:'#8894A6' },
    { user:'QuantBot9000',    handle:'@quantbot9000',    platform:'x',        emotion:'Sarcasm',    conf:0.84, text:'Breaking: local man discovers his audience skews "25-34, tech-adjacent". Groundbreaking. Never seen that before.', time:'1d ago', likes:1204, av:'#5B7FD4' },
    { user:'Lucia Marín',     handle:'@lucia_marin',     platform:'youtube',  emotion:'Positive',   conf:0.92, text:'Compared three audience tools this month. SurviX\'s influence scoring is the only one that didn\'t feel like follower counts in a trench coat.', time:'1d ago',likes:2870, av:'#E09A4E' },
  ],
  /* per-platform sentiment snapshot */
  byPlatform:[
    { id:'x',        pos:51, neg:22, score:7.1 },
    { id:'telegram', pos:57, neg:15, score:7.8 },
    { id:'instagram',pos:49, neg:24, score:6.9 },
    { id:'facebook', pos:44, neg:29, score:6.4 },
    { id:'reddit',   pos:46, neg:26, score:6.6 },
    { id:'youtube',  pos:55, neg:18, score:7.5 },
  ],
};

/* ---------- Demographics module ---------- */
SURVIX.demographics = {
  ages:[
    { label:'18–24', pct:22 },{ label:'25–34', pct:38 },{ label:'35–44', pct:21 },
    { label:'45–54', pct:11 },{ label:'55–64', pct:5 },{ label:'65+',  pct:3 },
  ],
  regions:[
    { name:'United States', code:'US', pct:34.2 },{ name:'India', code:'IN', pct:22.1 },
    { name:'Germany', code:'DE', pct:7.9 },{ name:'United Kingdom', code:'GB', pct:6.8 },
    { name:'Brazil', code:'BR', pct:5.7 },{ name:'Nigeria', code:'NG', pct:4.3 },
    { name:'Japan', code:'JP', pct:3.7 },{ name:'Canada', code:'CA', pct:3.3 },
    { name:'Australia', code:'AU', pct:2.7 },{ name:'Mexico', code:'MX', pct:2.4 },
    { name:'France', code:'FR', pct:2.2 },{ name:'Rest of World', code:'ROW', pct:4.7 },
  ],
  languages:[
    { name:'English',  pct:46, color:'#A9B4C9' },
    { name:'Hindi',    pct:12, color:'#7A8CD8' },
    { name:'Spanish',  pct:11, color:'#4E9A6E' },
    { name:'Portuguese',pct:9, color:'#5B7FD4' },
    { name:'German',   pct:8,  color:'#E09A4E' },
    { name:'French',   pct:6,  color:'#CC5F52' },
    { name:'Japanese', pct:5,  color:'#8B7FD6' },
    { name:'Other',    pct:3,  color:'#8894A6' },
  ],
  /* broad, reader-friendly interest categories (share of profiles) */
  interestCats:[
    { name:'Technology & Gadgets',        pct:31 },
    { name:'Politics & Current Affairs',  pct:26 },
    { name:'Business & Finance',          pct:21 },
    { name:'Entertainment & Media',       pct:17 },
    { name:'Education & Careers',         pct:13 },
    { name:'Sports & Fitness',            pct:9  },
  ],
  interests:[
    { w:'AI / ML',           s:44 },{ w:'Startups',        s:36 },{ w:'Data Science',  s:33 },
    { w:'Crypto',            s:29 },{ w:'SaaS',            s:27 },{ w:'Design',        s:24 },
    { w:'Dev Tools',         s:23 },{ w:'Marketing',       s:21 },{ w:'Productivity',  s:18 },
    { w:'Privacy',           s:16 },{ w:'Gaming',          s:15 },{ w:'Fintech',       s:13 },
    { w:'Cloud',             s:12 },{ w:'No-code',         s:11 },{ w:'Cybersecurity', s:10 },
    { w:'Robotics',          s:8  },{ w:'EdTech',          s:7  },{ w:'Climate Tech',  s:6  },
  ],
};

/* ---------- Trends module ---------- */
SURVIX.trends = {
  ranked:[
    { kw:'Agrarian policy backlash', vol:'48.6K', mom:+186, spark:'6,8,11,16,22,30,41,55,74,96' },
    { kw:'Judicial reform debate',   vol:'36.2K', mom:+94,  spark:'14,15,17,19,21,24,26,29,33,38' },
    { kw:'Fuel price discontent',    vol:'29.4K', mom:+58,  spark:'9,11,12,14,16,17,20,22,25,29' },
    { kw:'Labor rights movement',    vol:'22.8K', mom:+37,  spark:'7,8,8,9,10,11,12,13,14,16' },
    { kw:'Free speech debate',       vol:'17.5K', mom:-14,  spark:'13,14,14,15,15,14,14,13,13,12' },
    { kw:'Election reform chatter',  vol:'13.1K', mom:+8,   spark:'6,6,7,7,7,8,8,8,8,9' },
    { kw:'Minimum wage debate',      vol:'10.7K', mom:-42,  spark:'15,15,14,13,12,11,10,8,7,6' },
    { kw:'Housing affordability',    vol:'8.9K',  mom:+12,  spark:'4,4,5,5,5,6,6,6,7,7' },
    { kw:'Digital privacy bills',    vol:'7.3K',  mom:-9,   spark:'6,6,6,7,6,6,6,5,6,6' },
    { kw:'Transit strike watch',     vol:'5.6K',  mom:+3,   spark:'3,3,4,4,4,4,4,5,5,5' },
  ],
  spikes:{
    dates:D30,
    'Agrarian policy backlash': [3,3,4,4,5,5,6,7,8,9,11,13,12,16,20,25,31,39,48,62,79,101,128,162,205,258,214,168,146,138],
    'Judicial reform debate':   [10,11,11,12,14,15,16,18,20,21,24,26,28,31,34,33,37,41,45,50,55,60,66,72,79,87,80,72,66,61],
    'Fuel price discontent':    [6,7,7,8,9,10,11,12,14,15,17,19,21,24,26,28,26,23,20,18,21,26,33,41,52,64,58,49,44,41],
    'Free speech debate':       [4,4,5,5,6,7,9,12,16,22,30,41,55,72,91,108,94,76,61,49,39,31,25,20,16,14,12,11,10,10],
  },
  /* ---------- Emerging risk signals (predictive demo) ----------
     Capability demo: synthetic scenario data, generic category names only.
     Breakout bands: <30 low (green) · 30-60 elevated (amber) · >60 critical (red) */
  risks:{
    note:'capability demo · synthetic scenario data · generic categories only',
    entries:[
      {
        id:'farmer-mobilization',
        name:'Farmer union mobilization',
        prob:74, velocity:'Rising 3.2x in 48h', regions:['Punjab','Haryana'],
        sentiment:'68% Against / Grievance',
        spark:'12,14,18,26,38,55,78',
        signals:['coordination language','rally logistics keywords','cross-platform coordination (Telegram + X)'],
        posts:[
          { handle:'@fieldwatch_22', platform:'x', emotion:'Against', conf:0.91, time:'3h ago', text:'District unions confirming assembly points for Thursday. Carpool lists are circulating in the district groups.' },
          { handle:'tg-logistics-delta', platform:'telegram', emotion:'Neutral', conf:0.84, time:'5h ago', text:'Route map v3 uploaded. Volunteers report to the market gate between 5-7 AM. Bring water, banners ready.' },
          { handle:'ruralvoices', platform:'facebook', emotion:'Anxiety', conf:0.79, time:'8h ago', text:'Prices at the market are unsustainable this season. Families are stretched thin; patience in the villages is wearing out.' },
        ],
      },
      {
        id:'fuel-price-discontent',
        name:'Fuel price discontent',
        prob:58, velocity:'Steady rise over 5 days', regions:['Multiple metros'],
        sentiment:'74% Negative / Grievance',
        spark:'9,11,13,16,19,23,28',
        signals:['grievance phrasing cluster','local news echo','petition growth velocity'],
        posts:[
          { handle:'@commuterdaily', platform:'x', emotion:'Sarcasm', conf:0.87, time:'1h ago', text:'Great, another hike. Bus fare up, fuel up, wages flat. Brilliant math, truly.' },
          { handle:'r/metro-riders-forum', platform:'reddit', emotion:'Against', conf:0.85, time:'7h ago', text:'Petition crosses 40k signatures as auto unions threaten a two-day stoppage across the metro corridors.' },
        ],
      },
      {
        id:'judicial-reform-backlash',
        name:'Judicial reform backlash',
        prob:41, velocity:'Rising 1.8x in 24h', regions:null,
        sentiment:'Mixed: 52% Against, 30% Supportive',
        spark:'20,22,25,23,28,34,41',
        signals:['hashtag swarm formation','association walkout chatter','amplified quote-cascade'],
        posts:[
          { handle:'@courthousebeat', platform:'x', emotion:'Against', conf:0.88, time:'2h ago', text:'Third reading passed with zero public consultation. Bar associations announcing walkouts; this will not stay quiet.' },
          { handle:'@legalmind_ks', platform:'x', emotion:'Supportive', conf:0.82, time:'6h ago', text:'Dockets have been paralyzed for a decade. If the reform unclogs case backlogs, I support the attempt.' },
        ],
      },
      {
        id:'labor-strike-chatter',
        name:'Labor strike coordination chatter',
        prob:33, velocity:'New signal · 36h window', regions:null,
        sentiment:'Coordination-language density 8.2x baseline',
        spark:'3,4,4,7,12,19,31',
        signals:['coordination language','shift-timing keywords','encrypted-channel referrals'],
        posts:[
          { handle:'unit_steward_w2', platform:'telegram', emotion:'Neutral', conf:0.80, time:'4h ago', text:'Night-shift reps meeting after second shift Wednesday. Attendance sheet doing the rounds. Keep it internal.' },
          { handle:'@plantworker_n', platform:'x', emotion:'Anxiety', conf:0.76, time:'9h ago', text:'Rumor of a one-day token strike next week. Nothing official yet, but stewards are polling members quietly.' },
        ],
      },
    ],
  },
  predicted:[
    { kw:'Ballot measure chatter',   conf:84, eta:'~4 days',  basis:'Cross-platform mention velocity +2.9σ for 6 consecutive days' },
    { kw:'Utility price hearings',   conf:71, eta:'~8 days',  basis:'Co-occurrence with 4 rising clusters; regional news echo widening' },
    { kw:'Campus protest season',    conf:62, eta:'~2 weeks', basis:'Coordination-language density up 130%; early-adopter clusters engaging' },
    { kw:'Transit union action',     conf:51, eta:'~3 weeks', basis:'Petition-velocity signal detected; historically 60% fizzle rate' },
  ],
  cloud:[
    { w:'agrarian', s:40 },{ w:'reform', s:33 },{ w:'petition', s:30 },{ w:'strike', s:26 },
    { w:'hearings', s:22 },{ w:'ballot', s:20 },{ w:'coalition', s:19 },{ w:'rally', s:17 },
    { w:'union', s:16 },{ w:'mandate', s:15 },{ w:'town hall', s:14 },{ w:'grievance', s:13 },
    { w:'wages', s:12 },{ w:'subsidy', s:11 },{ w:'curfew', s:10 },{ w:'bill', s:9 },
    { w:'sit-in', s:9 },{ w:'caucus', s:8 },{ w:'referendum', s:8 },{ w:'walkout', s:7 },
  ],
};

/* ---------- Network module ---------- */
SURVIX.network = {
  clusters:[
    { id:'dev',      name:'Builders & Devs',   color:'#3B5BDB' },
    { id:'crypto',   name:'Crypto & Web3',     color:'#8B7FD6' },
    { id:'growth',   name:'Growth & Marketing',color:'#E09A4E' },
    { id:'creators', name:'Creators',          color:'#CC5F52' },
    { id:'fintech',  name:'Fintech Analysts',  color:'#4E9A6E' },
  ],
  nodes:[
    { id:'dr_aris',      label:'@dr_aris',      cluster:'dev',      influence:98, followers:2100000, bridge:true  },
    { id:'miraquant',    label:'@miraquant',    cluster:'crypto',   influence:93, followers:1450000, bridge:true  },
    { id:'ByteTheory',   label:'ByteTheory',    cluster:'creators', influence:90, followers:980000,  bridge:false },
    { id:'growth_henry', label:'@growth_henry', cluster:'growth',   influence:86, followers:640000,  bridge:true  },
    { id:'fintwit_elle', label:'@fintwit_elle', cluster:'fintech',  influence:82, followers:520000,  bridge:true  },
    { id:'nova_dev',     label:'@nova_dev',     cluster:'dev',      influence:74, followers:310000,  bridge:false },
    { id:'chainfox',     label:'@chainfox',     cluster:'crypto',   influence:71, followers:280000,  bridge:false },
    { id:'mktg_sana',    label:'@mktg_sana',    cluster:'growth',   influence:68, followers:245000,  bridge:false },
    { id:'lucia_marin',  label:'@lucia_marin',  cluster:'creators', influence:64, followers:198000,  bridge:false },
    { id:'vault_alpha',  label:'@vault_alpha',  cluster:'fintech',  influence:59, followers:176000,  bridge:false },
    { id:'anna.builds',  label:'@anna.builds',  cluster:'dev',      influence:55, followers:154000,  bridge:false },
    { id:'coinlore_daily',label:'@coinlore_dly',cluster:'crypto',   influence:52, followers:141000,  bridge:false },
    { id:'funnelphil',   label:'@funnelphil',   cluster:'growth',   influence:48, followers:128000,  bridge:false },
    { id:'reelroom',     label:'@reelroom',     cluster:'creators', influence:45, followers:119000,  bridge:false },
    { id:'yieldwatch',   label:'@yieldwatch',   cluster:'fintech',  influence:41, followers:96000,   bridge:false },
    { id:'kernelpanic',  label:'@kernelpanic',  cluster:'dev',      influence:38, followers:88000,   bridge:false },
    { id:'hashrabbit',   label:'@hashrabbit',   cluster:'crypto',   influence:34, followers:76000,   bridge:false },
    { id:'leadsleuth',   label:'@leadsleuth',   cluster:'growth',   influence:31, followers:67000,   bridge:false },
    { id:'loopster',     label:'@loopster',     cluster:'creators', influence:27, followers:58000,   bridge:false },
    { id:'candlewick',   label:'@candlewick',   cluster:'fintech',  influence:23, followers:49000,   bridge:false },
  ],
  /* undirected edges: [a, b, weight] */
  edges:[
    ['dr_aris','nova_dev',9],['dr_aris','anna.builds',7],['dr_aris','kernelpanic',6],
    ['dr_aris','growth_henry',5],['dr_aris','ByteTheory',6],['nova_dev','anna.builds',8],
    ['nova_dev','kernelpanic',7],['anna.builds','kernelpanic',5],['nova_dev','ByteTheory',4],
    ['miraquant','chainfox',9],['miraquant','coinlore_daily',7],['miraquant','hashrabbit',6],
    ['miraquant','fintwit_elle',5],['miraquant','vault_alpha',4],['chainfox','coinlore_daily',8],
    ['chainfox','hashrabbit',6],['coinlore_daily','hashrabbit',5],['chainfox','vault_alpha',3],
    ['growth_henry','mktg_sana',8],['growth_henry','funnelphil',6],['growth_henry','leadsleuth',5],
    ['growth_henry','dr_aris',5],['growth_henry','ByteTheory',4],['mktg_sana','funnelphil',7],
    ['mktg_sana','leadsleuth',5],['funnelphil','leadsleuth',6],
    ['ByteTheory','lucia_marin',8],['ByteTheory','reelroom',6],['ByteTheory','loopster',5],
    ['lucia_marin','reelroom',7],['lucia_marin','loopster',4],['reelroom','loopster',5],
    ['fintwit_elle','vault_alpha',7],['fintwit_elle','yieldwatch',6],['fintwit_elle','candlewick',4],
    ['vault_alpha','yieldwatch',6],['vault_alpha','candlewick',4],['yieldwatch','candlewick',5],
    ['fintwit_elle','miraquant',5],['dr_aris','miraquant',3],['growth_henry','miraquant',3],
    ['ByteTheory','dr_aris',6],['kernelpanic','chainfox',2],['loopster','anna.builds',2],
    ['candlewick','coinlore_daily',3],['leadsleuth','reelroom',2],['funnelphil','growth_henry',6],
  ],
};

/* ---------- Pipeline widget ---------- */
SURVIX.pipeline = {
  throughput:'1,842 rec/s',
  updated:'just now',
  rows:SURVIX.platforms.filter(p=>p.ingest!=='idle').map(p=>({ id:p.id, name:p.name, state:p.ingest, latency:p.latency, volume:p.rows })),
};
