import fs from 'node:fs';
import theme from './profile-theme.cjs';
const {themes,motion}=theme;
const user='tamir39',today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'});
const first=new Date(`${today}T00:00:00Z`);first.setUTCFullYear(first.getUTCFullYear()-1);const since=first.toISOString().slice(0,10);
const headers={Accept:'application/vnd.github+json','User-Agent':'tamir39-profile','X-GitHub-Api-Version':'2022-11-28'};
if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
async function api(path){const r=await fetch(`https://api.github.com/${path}`,{headers});if(!r.ok)throw new Error(`GitHub API ${r.status} at ${path.split('?')[0]}`);const json=await r.json();if(json.incomplete_results)throw new Error('Incomplete search results; previous charts retained.');return json;}
const profile=await api(`users/${user}`),repos=[];
for(let page=1;;page++){const list=await api(`users/${user}/repos?per_page=100&page=${page}`);repos.push(...list);if(list.length<100)break;}
const q=encodeURIComponent(`author:${user} is:public committer-date:>=${since}`);
const found=await api(`search/commits?q=${q}&per_page=100&page=1`);
if(found.total_count>1000)throw new Error('Public commit search exceeds 1000 results; narrow the query before refreshing charts.');
const commits=[...found.items];for(let page=2;commits.length<found.total_count;page++){const more=await api(`search/commits?q=${q}&per_page=100&page=${page}`);if(!more.items.length)throw new Error('Missing commit search page');commits.push(...more.items);}
const prs=await api(`search/issues?q=${encodeURIComponent(`author:${user} is:pr is:public created:>=${since}`)}&per_page=1`);
const daily={};for(const commit of commits){const date=new Date(commit.commit.committer.date).toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'});if(date>=since&&date<=today)daily[date]=(daily[date]||0)+1;}
function render(c,suffix){
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const t=(x,y,s,v,color=c.ink,w=400,anchor='start')=>`<text x="${x}" y="${y}" font-size="${s}" fill="${color}" font-weight="${w}" text-anchor="${anchor}">${esc(v)}</text>`;
const svg=(h,title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${h}" viewBox="0 0 1000 ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>${motion}</style><rect x=".5" y=".5" width="999" height="${h-1}" rx="10" fill="${c.paper}" stroke="${c.line}"/>${body}</svg>`;
const nfmt=n=>n.toLocaleString('en-US');
const values=[['Public repositories',profile.public_repos],['Public commits',found.total_count],['Public pull requests',prs.total_count],['Active commit days',Object.keys(daily).length]];
const stats=svg(146,values.map(([k,v])=>`${k}: ${v}`).join('. '),values.map(([label,value],i)=>{const x=30+i*244;return `<g class="reveal" style="--delay:${i*100}ms">`+(i?`<path d="M${x-20} 26V103" stroke="${c.line}"/>`:'')+t(x,67,38,nfmt(value),c.accent,700)+t(x,95,15,label,c.muted)+`<rect class="bar" x="${x}" y="108" width="40" height="3" rx="1.5" fill="${c.accent}" style="--delay:${i*100+180}ms"/></g>`}).join('')+t(30,131,12,`Activity: ${since} → ${today} · Updated ${today}`,c.muted));
const levels=c.levels,zero=levels[0];const maxDay=Math.max(1,...Object.values(daily));
const level=n=>n===0?0:Math.min(4,Math.ceil(n/maxDay*4));
const sunday=new Date(first);sunday.setUTCDate(sunday.getUTCDate()-sunday.getUTCDay());const end=new Date(`${today}T00:00:00Z`),months=[];let cells='';let count=0;
for(let d=new Date(sunday);d<=end;d.setUTCDate(d.getUTCDate()+1)){const key=d.toISOString().slice(0,10),week=Math.floor(count/7),row=count%7,x=62+week*17,y=98+row*17,n=daily[key]||0;if(key>=since){cells+=`<rect class="reveal" style="--delay:${week*24}ms" x="${x}" y="${y}" width="14" height="14" rx="3" fill="${levels[level(n)]}"><title>${key}: ${n} public commits</title></rect>`;}if(d.getUTCDate()===1)months.push({label:d.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'}),x});count++;}
const heatmap=svg(276,`Public commit calendar: ${found.total_count} indexed commits from ${since} to ${today}.`,t(30,38,25,'A year of building.',c.ink,700)+t(30,64,14,'Public commit activity · each square is one day',c.muted)+months.map(m=>t(m.x,86,11,m.label,c.muted)).join('')+t(21,129,10,'Mon',c.muted)+t(21,163,10,'Wed',c.muted)+t(21,197,10,'Fri',c.muted)+cells+t(30,251,12,`Updated ${today} · UTC+7`,c.muted)+t(770,251,11,'Less',c.muted)+levels.map((color,i)=>`<rect x="${805+i*19}" y="238" width="14" height="14" rx="3" fill="${color}"/>`).join('')+t(905,251,11,'More',c.muted));
const monthCounts={};for(let d=new Date(first.getUTCFullYear(),first.getUTCMonth(),1);d.getFullYear()*12+d.getMonth()<=end.getUTCFullYear()*12+end.getUTCMonth();d.setMonth(d.getMonth()+1)){monthCounts[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`]=0;}
for(const [day,n]of Object.entries(daily))monthCounts[day.slice(0,7)]+=n;
const series=Object.entries(monthCounts),max=Math.max(40,Math.ceil(Math.max(...series.map(([,v])=>v))/40)*40);const left=62,right=952,top=102,bottom=266;
if(series.reduce((sum,[,value])=>sum+value,0)!==Object.values(daily).reduce((sum,value)=>sum+value,0))throw new Error('Monthly totals do not match daily activity');
const points=series.map(([month,value],i)=>({month,value,x:left+i*(right-left)/(series.length-1||1),y:bottom-value/max*(bottom-top)}));
const path=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
const trend=svg(347,'Monthly public commits: '+series.map(([m,n])=>`${m}: ${n}`).join(', '),t(30,39,25,'The rhythm behind the work.',c.ink,700)+t(30,66,14,'Monthly public commits · first and current months are partial',c.muted)+[0,1,2,3,4].map(i=>{const y=bottom-i*(bottom-top)/4;return`<path d="M${left} ${y}H${right}" stroke="${c.line}" stroke-dasharray="3 5"/>`+t(47,y+4,11,Math.round(max*i/4),c.muted,400,'end');}).join('')+`<path class="reveal" d="${path} L${right} ${bottom} L${left} ${bottom}Z" fill="${c.surface}" opacity=".6"/><path class="draw" pathLength="1" d="${path}" fill="none" stroke="${c.accent}" stroke-width="3" stroke-linejoin="round"/>`+points.map((p,i)=>`<circle class="reveal" style="--delay:${i*90}ms" cx="${p.x}" cy="${p.y}" r="4" fill="${c.green}" stroke="${c.accent}" stroke-width="1.5"/>`+t(p.x,p.y-11,11,p.value,c.accent,700,'middle')+t(p.x,290,11,new Date(`${p.month}-01T00:00:00Z`).toLocaleDateString('en-US',{month:'short',timeZone:'UTC'}),c.muted,400,'middle')).join('')+t(30,327,12,`${since} → ${today} · Not a measure of code quality`,c.muted));
const languages={};for(const r of repos)if(!r.fork&&r.language)languages[r.language]=(languages[r.language]||0)+1;
const sorted=Object.entries(languages).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),total=sorted.reduce((n,[,v])=>n+v,0),languageColors={Python:'#3572a5',TypeScript:'#3178c6','C#':'#178600',JavaScript:'#f1e05a',PHP:'#4f5d95'},colors=sorted.map(([name])=>languageColors[name]||c.accent);
let angle=-Math.PI/2;const cx=235,cy=203,r=88;
const ring=sorted.map(([name,value],i)=>{const next=angle+value/total*Math.PI*2;const ax=cx+r*Math.cos(angle),ay=cy+r*Math.sin(angle),bx=cx+r*Math.cos(next),by=cy+r*Math.sin(next);const arc=`<path class="draw" pathLength="1" style="--delay:${i*130}ms" d="M${ax} ${ay} A${r} ${r} 0 ${value/total>.5?1:0} 1 ${bx} ${by}" fill="none" stroke="${colors[i%colors.length]}" stroke-width="27"><title>${esc(name)}: ${value} repositories</title></path>`;angle=next;return arc;}).join('');
const languageSvg=svg(348,'Primary languages by original public repository: '+sorted.map(([name,n])=>`${name}: ${n}`).join(', '),t(30,39,25,'Languages across my public work.',c.ink,700)+t(30,66,14,'Primary language per original repository',c.muted)+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${zero}" stroke-width="27"/>`+ring+t(cx,202,37,total,c.accent,700,'middle')+t(cx,229,13,'repositories',c.muted,400,'middle')+sorted.map(([name,n],i)=>{const y=116+i*35;return`<circle cx="454" cy="${y-4}" r="6" fill="${colors[i%colors.length]}"/>`+t(475,y,17,name,c.ink,700)+t(765,y,15,`${n} ${n===1?'repo':'repos'} · ${Math.round(n/total*100)}%`,c.muted);}).join('')+t(30,328,12,`Forks and repositories without a detected language excluded · Updated ${today}`,c.muted));
for(const [name,art]of Object.entries({'github-stats':stats,'github-activity':heatmap,'github-trend':trend,'github-languages':languageSvg}))fs.writeFileSync(`assets/${name}${suffix}.svg`,art);
return {monthlyBuckets:series.length,languages:sorted.length};
}
let rendered;
for(const [name,c] of Object.entries(themes))rendered=render(c,name==='dark'?'-dark':'');
console.log(`Rendered light and dark charts: ${commits.length} indexed public commits, ${Object.keys(daily).length} active days, ${rendered.monthlyBuckets} monthly buckets, ${rendered.languages} languages.`);
