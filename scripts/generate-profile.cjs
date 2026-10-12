const fs = require('node:fs');
const { themes, motion } = require('./profile-theme.cjs');

for (const [theme, c] of Object.entries(themes)) {
  const t = (x,y,s,v,color=c.ink,w=400,extra='') => `<text x="${x}" y="${y}" font-size="${s}" fill="${color}" font-weight="${w}" ${extra}>${v}</text>`;
  const svg = (w,h,title,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${title}</title><style>${motion}</style><rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="10" fill="${c.paper}" stroke="${c.line}"/>${body}</svg>`;

  const hero = svg(1200,365,'Tamir — Phí Vương Tường Tâm. Frontend developer and UI/UX designer.',
    `<path d="M1 43H1199" stroke="${c.line}"/>` +
    t(28,28,13,'tamir39 / README.md',c.muted,400,'class="mono"') +
    `<circle class="pulse" cx="1116" cy="23" r="4" fill="${c.green}"/>` + t(1127,28,12,'building',c.muted) +
    t(36,145,82,'Tamir',c.ink,700) + t(39,184,21,'Phí Vương Tường Tâm',c.muted) +
    t(39,237,29,'Frontend developer &amp; UI/UX designer',c.accent,600) +
    t(39,275,19,'Visual detail. Clear interactions. Complete flows.',c.muted) +
    t(39,330,13,'TWOHEARTS TECHNOLOGY · TON DUC THANG UNIVERSITY',c.muted) +
    `<g transform="translate(820 69)">
      <rect width="342" height="266" rx="8" fill="${c.surface}" stroke="${c.line}"/>
      ${t(18,29,12,'interface.tsx',c.muted,400,'class="mono"')}
      <path d="M0 44H342" stroke="${c.line}"/>
      <g class="reveal" style="--delay:100ms">
        ${t(18,72,13,'design → build → refine',c.accent,500,'class="mono"')}
        <rect x="18" y="87" width="306" height="109" rx="6" fill="${c.paper}" stroke="${c.line}"/>
        <rect x="32" y="102" width="43" height="80" rx="4" fill="${c.surface}"/>
        <path class="draw" pathLength="1" d="M41 118H65M41 132H60M41 146H65" stroke="${c.muted}" stroke-width="3" style="--delay:250ms"/>
        <rect class="bar" x="89" y="103" width="218" height="12" rx="3" fill="${c.accentSurface}" style="--delay:250ms"/>
        <rect class="bar" x="89" y="124" width="146" height="7" rx="3" fill="${c.line}" style="--delay:350ms"/>
        <path class="draw" pathLength="1" d="M94 166L125 155L158 164L197 143L236 155L275 139L300 147" fill="none" stroke="${c.green}" stroke-width="2.5" stroke-linejoin="round" style="--delay:450ms"/><path class="trace" pathLength="1" d="M94 166L125 155L158 164L197 143L236 155L275 139L300 147" fill="none" stroke="${c.accent}" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g class="reveal" style="--delay:400ms"><path d="M21 225L26 230L35 219" fill="none" stroke="${c.green}" stroke-width="2"/>${t(45,230,13,'Thoughtful by design.',c.muted)}</g>
    </g>`);

  const award = svg(1000,128,'Team Twohearts — F&amp;B Track winner at Agentic AI Build Week 2026.',
    `<rect x="24" y="24" width="70" height="80" rx="8" fill="${c.surface}" stroke="${c.line}"/>
    <g class="float"><path class="draw" pathLength="1" d="M46 44H72V58Q72 76 59 76Q46 76 46 58ZM46 49H39V56Q39 64 47 64M72 49H79V56Q79 64 71 64M59 77V88M49 88H69" fill="none" stroke="${c.green}" stroke-width="2.5" stroke-linejoin="round"/></g>` +
    t(119,43,12,'TEAM ACHIEVEMENT / 2026',c.green,600,'class="mono"') +
    t(117,80,29,'F&amp;B Track winner',c.ink,600) +
    t(119,107,14,'Agentic AI Build Week · GenAI Fund · Sponsored by KFC Vietnam',c.muted));

  const zuno = svg(1000,167,'Zuno — Private spaces. Shared moments.',
    t(28,32,12,'PERSONAL APPLICATION / FULL-STACK PWA',c.accent,600,'class="mono"') +
    t(26,78,37,'Zuno',c.ink,600) + t(28,111,20,'Private spaces. Shared moments.',c.ink) +
    t(28,143,14,'Zones · Timelines · Posts · Votes',c.muted) +
    `<g transform="translate(708 24)"><rect width="264" height="118" rx="8" fill="${c.surface}" stroke="${c.line}"/><path d="M30 24V95" stroke="${c.line}"/>` +
    [0,1,2].map(i => `<g class="reveal" style="--delay:${i*160}ms"><circle class="pulse" style="--delay:${i*600}ms" cx="30" cy="${28+i*32}" r="5" fill="${i===1?c.green:c.accent}"/><path class="draw" pathLength="1" d="M50 ${28+i*32}H${i===1?204:234}" stroke="${c.muted}" stroke-width="4" style="--delay:${i*160}ms"/></g>`).join('') + '</g>');

  const focus = [
    {x:24,title:'Visual craft',lines:['Layout, type, color, and the','details that make a UI feel right.'],icon:'M0 0H26V24H0ZM0 7H26M8 7V24'},
    {x:346,title:'Thoughtful flows',lines:['Clear navigation and interactions,','from first click to final step.'],icon:'M0 12H8M18 12H26M10 2H17V9H10ZM10 16H17V23H10ZM14 9V16'},
    {x:668,title:'Connected interfaces',lines:['Visual design connected to','working application logic.'],icon:'M8 4L0 12L8 20M18 4L26 12L18 20M15 2L11 22'},
  ];
  const about = svg(1000,324,'About Tamir. Frontend developer and UI/UX designer at Twohearts Technology; computer science student at Ton Duc Thang University. Visual craft, thoughtful flows, connected interfaces. Exploring UI/UX and full-stack development through Zuno.',
    t(24,39,23,'Design sense. Engineering mind.',c.ink,600) +
    t(24,71,17,'Frontend Developer &amp; UI/UX Designer',c.accent,600) +
    t(24,98,15,'at Twohearts Technology',c.muted) +
    t(600,35,12,'STUDYING + BUILDING',c.green,600,'class="mono"') +
    t(600,63,16,'Computer science · Ton Duc Thang University',c.ink,500) +
    t(600,89,14,'Exploring deeper UI/UX practice + full-stack development.',c.muted) +
    t(600,113,14,'Putting it into practice through my own product, Zuno.',c.muted) +
    '<path d="M24 134H976" stroke="'+c.line+'"/>' +
    focus.map((item,i)=>'<g><rect x="'+item.x+'" y="153" width="306" height="147" rx="7" fill="'+c.surface+'" stroke="'+c.line+'"/>'+
      '<g transform="translate('+(item.x+20)+' 174)"><path class="draw" style="--delay:-'+i*750+'ms" d="'+item.icon+'" stroke="'+c.accent+'" stroke-width="1.7" fill="none" stroke-linejoin="round"/></g>'+
      t(item.x+63,194,17,item.title,c.ink,600)+t(item.x+20,229,14,item.lines[0],c.muted)+t(item.x+20,251,14,item.lines[1],c.muted)+
      '<path d="M'+(item.x+20)+' 279H'+(item.x+286)+'" stroke="'+c.line+'"/>'+
      '<path class="trace" pathLength="1" style="--delay:-'+i*1200+'ms" d="M'+(item.x+20)+' 279H'+(item.x+286)+'" stroke="'+c.accent+'" stroke-width="2" stroke-linecap="round"/></g>').join(''));

  const chip = (x,y,width,label) => '<rect x="'+x+'" y="'+y+'" width="'+width+'" height="29" rx="6" fill="'+c.paper+'" stroke="'+c.line+'"/>'+t(x+12,y+20,14,label,c.ink,500);
  const toolPanel = (x,y,title,number) => '<rect x="'+x+'" y="'+y+'" width="464" height="143" rx="7" fill="'+c.surface+'" stroke="'+c.line+'"/>'+t(x+18,y+31,12,number,c.accent,600,'class="mono"')+t(x+49,y+31,17,title,c.ink,600);
  const toolTrace = (x,y,width,delay) => '<path d="M'+x+' '+y+'H'+(x+width)+'" stroke="'+c.line+'" stroke-width="2"/><path class="trace" pathLength="1" style="--delay:-'+delay+'ms" d="M'+x+' '+y+'H'+(x+width)+'" stroke="'+c.accent+'" stroke-width="2" stroke-linecap="round"/>';
  const tools = svg(1000,338,'Toolkit. Core frontend: React, TypeScript, Tailwind CSS, Next.js, Vite. Components and motion: shadcn/ui, Radix UI, Motion / Framer Motion. State and data: Zustand, TanStack Query. Growing full-stack experience through Zuno: PostgreSQL and Drizzle ORM.',
    toolPanel(24,18,'Core frontend','01') + chip(42,65,73,'React') + chip(123,65,110,'TypeScript') + chip(241,65,125,'Tailwind CSS') +
    chip(42,106,85,'Next.js') + chip(135,106,61,'Vite') + toolTrace(211,121,254,0) +
    toolPanel(512,18,'Components &amp; motion','02') + chip(530,65,101,'shadcn/ui') + chip(639,65,98,'Radix UI') +
    chip(530,106,220,'Motion / Framer Motion') + toolTrace(766,121,187,1000) +
    toolPanel(24,177,'State &amp; data','03') + chip(42,224,92,'Zustand') + chip(142,224,153,'TanStack Query') +
    t(42,290,13,'Interface → state → data',c.muted,400,'class="mono"') + toolTrace(317,285,147,2000) +
    toolPanel(512,177,'Growing full stack','04') + chip(530,224,121,'PostgreSQL') + chip(659,224,128,'Drizzle ORM') +
    '<circle class="pulse" cx="535" cy="284" r="4" fill="'+c.green+'"/>'+t(549,289,13,'Learning through Zuno',c.muted) + toolTrace(746,284,207,3000));

  for (const [name,art] of Object.entries({'profile-hero':hero,achievement:award,'zuno-card':zuno,'about-card':about,'tools-card':tools})) {
    fs.writeFileSync(`assets/${name}${theme==='dark'?'-dark':''}.svg`,art);
  }
}
