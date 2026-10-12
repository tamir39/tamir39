import fs from 'node:fs';
const user='tamir39';
const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Bangkok'});
const start=new Date(`${today}T00:00:00Z`);start.setUTCFullYear(start.getUTCFullYear()-1);
const since=start.toISOString().slice(0,10);
const headers={Accept:'application/vnd.github+json','User-Agent':'tamir39-profile','X-GitHub-Api-Version':'2022-11-28'};
if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
async function api(path){const r=await fetch(`https://api.github.com/${path}`,{headers});if(!r.ok)throw new Error(`GitHub API ${r.status} for ${path.split('?')[0]}`);return r.json();}
const profile=await api(`users/${user}`);
const repos=[];for(let page=1;;page++){const list=await api(`users/${user}/repos?per_page=100&page=${page}`);repos.push(...list);if(list.length<100)break;}
const commits=await api(`search/commits?q=${encodeURIComponent(`author:${user} is:public committer-date:>=${since}`)}&per_page=1`);
const prs=await api(`search/issues?q=${encodeURIComponent(`author:${user} is:pr is:public created:>=${since}`)}&per_page=1`);
if(commits.incomplete_results||prs.incomplete_results)throw new Error('Incomplete GitHub search results; retaining previous statistics.');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const c={bg:'#fff9e9',ink:'#2b203d',muted:'#665572',accent:'#6331a7',line:'#c4abc9'};
const text=(x,y,size,value,color=c.ink,weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${esc(value)}</text>`;
const svg=(h,title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${h}" viewBox="0 0 1000 ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>text{font-family:Arial,Helvetica,sans-serif}</style><rect x="1" y="1" width="998" height="${h-2}" rx="26" fill="${c.bg}" stroke="${c.line}"/>${body}</svg>`;
const stars=repos.reduce((n,r)=>n+r.stargazers_count,0);
const values=[['Public repositories',profile.public_repos],['Public commits · 1 year',commits.total_count],['Pull requests · 1 year',prs.total_count],['Repository stars',stars]];
const stats=svg(240,values.map(([k,v])=>`${k}: ${v}`).join('. ')+`. Updated ${today}.`,text(30,35,12,'GITHUB / PUBLIC ACTIVITY',c.accent)+text(30,77,28,'A little code, in numbers.',c.ink,700)+values.map(([label,value],i)=>{const x=30+i*242;return (i?`<path d="M${x-16} 106V183" stroke="${c.line}"/>`:'')+text(x,147,38,value,c.accent,700)+text(x,180,14,label,c.muted)}).join('')+text(30,217,12,`Public activity since ${since} · Updated ${today} (UTC+7)`,c.muted));
const languages={};for(const r of repos){if(!r.fork&&r.language)languages[r.language]=(languages[r.language]||0)+1;}
const sorted=Object.entries(languages).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
const total=sorted.reduce((n,[,count])=>n+count,0),colors=['#6331a7','#a879c7','#e5b62f','#53795a','#cc7a5b','#6573a6'];
let x=30;const bar=sorted.map(([language,count],i)=>{const width=count/total*940;const rect=`<rect x="${x}" y="96" width="${width}" height="19" fill="${colors[i%colors.length]}"/>`;x+=width;return rect;}).join('');
const height=150+Math.ceil(sorted.length/3)*35;
const lang=svg(height,'Primary languages by original public repository: '+sorted.map(([name,count])=>`${name}: ${count}`).join(', '),text(30,35,12,'LANGUAGES / BY REPOSITORY',c.accent)+text(30,74,26,'Different tools. Different ideas.',c.ink,700)+bar+sorted.map(([language,count],i)=>{const col=i%3,row=Math.floor(i/3),lx=30+col*315,ly=149+row*35;return `<circle cx="${lx+5}" cy="${ly-5}" r="5" fill="${colors[i%colors.length]}"/>`+text(lx+20,ly,14,`${language} · ${count} ${count===1?'repo':'repos'} (${Math.round(count/total*100)}%)`,c.muted)}).join('')+text(30,height-16,11,`Original public repos with a detected language · Updated ${today}`,c.muted));
fs.writeFileSync('assets/github-stats.svg',stats);fs.writeFileSync('assets/github-languages.svg',lang);
console.log(`Updated public stats: ${profile.public_repos} repositories, ${commits.total_count} commits, ${prs.total_count} PRs, ${stars} stars; ${sorted.length} languages.`);
