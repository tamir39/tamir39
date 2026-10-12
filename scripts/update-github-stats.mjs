import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import theme from './profile-theme.cjs';
const { themes, motion, adaptiveSvg } = theme;
const user = 'tamir39';
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

const headers = {
  Accept: 'application/vnd.github+json', 'User-Agent': 'tamir39-profile',
  'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json',
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
async function api(path) {
  const response = await fetch(`https://api.github.com/${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status} at ${path.split('?')[0]}`);
  const json = await response.json();
  if (json.incomplete_results) throw new Error('Incomplete search results; previous dashboard retained.');
  return json;
}
const profile = await api(`users/${user}`), repos = [];
for (let page = 1; ; page++) {
  const list = await api(`users/${user}/repos?per_page=100&page=${page}`);
  repos.push(...list);
  if (list.length < 100) break;
}
// Query aggregate calendar data only; no private repository names or contents.
const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;
const payload = {query, variables:{login:user}};
let graph, scopes;
if (process.env.GITHUB_TOKEN) {
  const response = await fetch('https://api.github.com/graphql', {method:'POST',headers,body:JSON.stringify(payload)});
  if (!response.ok) throw new Error(`GitHub GraphQL API ${response.status}; prior dashboard retained.`);
  scopes = response.headers.get('x-oauth-scopes');
  graph = await response.json();
} else {
  const raw = execFileSync('gh',['api','graphql','--include','--input','-'], {input:JSON.stringify(payload),encoding:'utf8',maxBuffer:1024*1024});
  scopes = raw.match(/^x-oauth-scopes:\s*(.*)$/mi)?.[1]?.trim();
  graph = JSON.parse(raw.split(/\r?\n\r?\n/).slice(1).join('\n\n'));
}
if (graph.errors || !graph.data?.user) throw new Error('Contribution calendar unavailable; prior dashboard retained.');
if (scopes && !scopes.split(',').map(s=>s.trim()).some(s=>s==='read:user'||s==='user')) {
  throw new Error('GitHub login needs read:user for private contribution counts. Run gh auth refresh -h github.com -s read:user. Prior dashboard retained.');
}
const collection = graph.data.user.contributionsCollection;
const calendarDays = collection.contributionCalendar.weeks.flatMap(week=>week.contributionDays).sort((a,b)=>a.date.localeCompare(b.date));
if (!calendarDays.length) throw new Error('Empty contribution calendar; prior dashboard retained.');
const since = calendarDays[0].date, until = calendarDays.at(-1).date;
const first = new Date(`${since}T00:00:00Z`), end = new Date(`${until}T00:00:00Z`);
const daily = Object.fromEntries(calendarDays.filter(day=>day.contributionCount>0).map(day=>[day.date,day.contributionCount]));
const calendarLevels = Object.fromEntries(calendarDays.map(day=>[day.date,day.contributionLevel]));
const totalContributions = collection.contributionCalendar.totalContributions;
const sum = Object.values(daily).reduce((sum,n)=>sum+n,0);
if (sum!==totalContributions) throw new Error('Calendar day counts do not match GitHub total; prior dashboard retained.');
const monthCounts = {}, weekdayCounts = Array(7).fill(0);
for (let date = new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),1));date<=end;date.setUTCMonth(date.getUTCMonth()+1)) monthCounts[date.toISOString().slice(0,7)]=0;
for (const [day,count] of Object.entries(daily)) {
  monthCounts[day.slice(0,7)]+=count;
  weekdayCounts[(new Date(`${day}T00:00:00Z`).getUTCDay()+6)%7]+=count;
}
const series=Object.entries(monthCounts);
if (series.reduce((sum,[,n])=>sum+n,0)!==totalContributions || weekdayCounts.reduce((sum,n)=>sum+n,0)!==totalContributions) throw new Error('Monthly or weekday totals do not match GitHub calendar');

const languages = {};
for (const repo of repos) if (!repo.fork && repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
const languageTotal = sorted.reduce((sum, [, n]) => sum + n, 0);
const originalCount = repos.filter(repo => !repo.fork).length, forkCount = repos.length - originalCount;
const languageColors = { Python: '#3572a5', TypeScript: '#3178c6', 'C#': '#178600', JavaScript: '#f1e05a', PHP: '#4f5d95' };
const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));
const monthLabel = month => new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });

function render(c, animated = true) {
  const text = (x, y, size, value, color = c.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
  const panel = (x, width) => `<rect x="${x}" y="333" width="${width}" height="238" rx="7" fill="${c.surface}" stroke="${c.line}"/>`;
  const metrics = [
    ['Contributions', totalContributions], ['Commit contributions', collection.totalCommitContributions],
    ['Pull requests', collection.totalPullRequestContributions], ['Active days', Object.keys(daily).length],
  ];
  let body = text(24, 33, 21, 'GitHub / the work in numbers', c.ink, 600) +
    `<circle class="pulse" cx="754" cy="26" r="4" fill="${c.green}"/>` + text(765, 31, 12, `Updated ${today}`, c.muted) +
    text(24, 55, 12, `GITHUB CONTRIBUTIONS · ${since} → ${until}`, c.muted);
  body += metrics.map(([label, value], i) => {
    const x = 24 + i * 245;
    return (i ? `<path d="M${x - 18} 77V124" stroke="${c.line}"/>` : '') +
      text(x, 103, 32, value.toLocaleString('en-US'), c.accent, 600) + text(x, 125, 13, label, c.muted);
  }).join('') + `<path d="M24 140H976" stroke="${c.line}"/>`;

  // Compact contribution strip across the entire dashboard width.
  body += text(24, 165, 15, 'Contribution calendar', c.ink, 600) + text(976, 165, 12, 'One square = one day', c.muted, 400, 'end');
  const sunday = new Date(first); sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
  const levelIndex = {NONE:0,FIRST_QUARTILE:1,SECOND_QUARTILE:2,THIRD_QUARTILE:3,FOURTH_QUARTILE:4};
  let index = 0, cells = '', labels = '';
  for (let day = new Date(sunday); day <= end; day.setUTCDate(day.getUTCDate() + 1)) {
    const key = day.toISOString().slice(0, 10), week = Math.floor(index / 7), row = index % 7;
    const x = 62 + week * 17, y = 191 + row * 17, count = daily[key] || 0;
    const level = levelIndex[calendarLevels[key]] || 0;
    if (key >= since) cells += `<rect ${count ? `class="cell" style="--delay:-${week * 91}ms"` : ''} x="${x}" y="${y}" width="14" height="14" rx="3" fill="${c.levels[level]}"><title>${key}: ${count} contributions</title></rect>`;
    if (day.getUTCDate() === 1) labels += text(x, 183, 11, day.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }), c.muted);
    index++;
  }
  body += labels + text(24, 221, 10, 'Mon', c.muted) + text(24, 255, 10, 'Wed', c.muted) + text(24, 289, 10, 'Fri', c.muted) + cells;
  body += text(24, 317, 11, 'Counts and levels from GitHub', c.muted) + text(796, 317, 10, 'Less', c.muted) +
    c.levels.map((color, i) => `<rect x="${827 + i * 19}" y="306" width="13" height="13" rx="2" fill="${color}"/>`).join('') + text(930, 317, 10, 'More', c.muted);

  // Area + line chart; a moving highlight traces the stationary series.
  body += panel(18, 360) + text(32, 357, 16, 'Monthly rhythm', c.ink, 600) + text(32, 378, 11, 'Contributions · edge months are partial', c.muted);
  const left = 54, right = 361, top = 405, bottom = 536;
  const maximum = Math.max(40, Math.ceil(Math.max(...series.map(([, n]) => n)) / 40) * 40);
  body += [0, 1, 2, 3, 4].map(i => {
    const y = bottom - (bottom - top) * i / 4;
    return `<path d="M${left} ${y}H${right}" stroke="${c.line}" stroke-dasharray="2 4"/>` + text(46, y + 4, 10, maximum * i / 4, c.muted, 400, 'end');
  }).join('');
  const points = series.map(([month, count], i) => ({ month, count, x: left + i * (right - left) / (series.length - 1 || 1), y: bottom - count / maximum * (bottom - top) }));
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  body += `<path d="${path} L${right} ${bottom} L${left} ${bottom}Z" fill="${c.accentSurface}"/>
    <path d="${path}" fill="none" stroke="${c.accent}" stroke-width="2.5" stroke-linejoin="round"/>
    <path class="trace" pathLength="1" d="${path}" fill="none" stroke="${c.green}" stroke-width="3" stroke-linecap="round"/>`;
  body += points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="2.8" fill="${c.accent}"><title>${p.month}: ${p.count} contributions</title></circle>` +
    (p.count ? text(p.x, p.y - 8, 10, p.count, c.accent, 600, 'middle') : '') + text(p.x, 557, 10, monthLabel(p.month), c.muted, 400, 'middle')).join('');

  // Language donut and compact legend with counts and percentages.
  body += panel(390, 284) + text(404, 357, 16, 'Language mix', c.ink, 600) + text(404, 378, 11, 'Primary language per original public repo', c.muted);
  const cx = 452, cy = 451, radius = 43;
  body += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${c.line}" stroke-width="15"/>`;
  let angle = -Math.PI / 2;
  body += sorted.map(([name, count]) => {
    const next = angle + count / languageTotal * Math.PI * 2;
    const start = `${cx + radius * Math.cos(angle)} ${cy + radius * Math.sin(angle)}`;
    const stop = `${cx + radius * Math.cos(next)} ${cy + radius * Math.sin(next)}`;
    const path = count === languageTotal ? `<circle cx="${cx}" cy="${cy}" r="${radius}"` : `<path d="M${start} A${radius} ${radius} 0 ${count / languageTotal > .5 ? 1 : 0} 1 ${stop}"`;
    angle = next;
    return `${path} fill="none" stroke="${languageColors[name] || c.accent}" stroke-width="15"><title>${esc(name)}: ${count} repositories</title></${count === languageTotal ? 'circle' : 'path'}>`;
  }).join('');
  body += text(cx, cy + 1, 25, languageTotal, c.ink, 600, 'middle') + text(cx, cy + 18, 10, 'repos', c.muted, 400, 'middle');
  body += `<circle class="orbit" style="--center:${cx}px ${cy}px" cx="${cx}" cy="${cy - 57}" r="3" fill="${c.accent}"/>`;
  // Keep the dashboard bounded if additional languages appear later.
  const displayed = sorted.length > 5 ? [...sorted.slice(0, 4), ['Other', sorted.slice(4).reduce((sum, [, n]) => sum + n, 0)]] : sorted;
  body += displayed.map(([name, count], i) => {
    const y = 414 + i * 28;
    return `<circle cx="520" cy="${y - 4}" r="4" fill="${languageColors[name] || c.accent}"/>` +
      text(531, y, 12, `${name} · ${count}`, c.ink, 500) + text(658, y, 11, `${Math.round(count / (languageTotal || 1) * 100)}%`, c.muted, 400, 'end');
  }).join('') + text(404, 553, 10, 'Forks / undetected languages excluded', c.muted);

  // Weekday histogram is summed from the same dated calendar.
  body += panel(686, 296) + text(700, 357, 16, 'Weekday pulse', c.ink, 600) + text(700, 378, 11, 'Contributions by GitHub calendar date', c.muted);
  const dayMaximum = Math.max(20, Math.ceil(Math.max(...weekdayCounts) / 20) * 20);
  body += [0, 1, 2, 3, 4].map(i => {
    const y = bottom - i * (bottom - top) / 4;
    return `<path d="M724 ${y}H968" stroke="${c.line}" stroke-dasharray="2 4"/>` + text(716, y + 4, 10, dayMaximum * i / 4, c.muted, 400, 'end');
  }).join('');
  body += weekdayCounts.map((count, i) => {
    const x = 729 + i * 34, height = count / dayMaximum * (bottom - top), y = bottom - height;
    const name = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
    return `<rect x="${x}" y="${y}" width="20" height="${height}" rx="3" fill="${c.green}"><title>${name}: ${count} contributions</title></rect>` +
      `<path class="pulse" style="--delay:-${i * 400}ms" d="M${x + 3} ${y + 1}H${x + 17}" stroke="${c.accent}" stroke-width="2"/>` +
      text(x + 10, y - 8, 10, count, c.ink, 500, 'middle') + text(x + 10, 557, 10, name, c.muted, 400, 'middle');
  }).join('');

  // Repository composition: proportional split rather than another tall card.
  body += text(24, 597, 12, 'Repository split', c.ink, 600) +
    text(976, 597, 12, `${profile.public_repos} public repos · ${originalCount} original · ${forkCount} forked`, c.muted, 400, 'end');
  const originalWidth = repos.length ? 952 * originalCount / repos.length : 0;
  body += `<clipPath id="repo-track"><rect x="24" y="607" width="952" height="9" rx="4"/></clipPath><g clip-path="url(#repo-track)"><rect x="24" y="607" width="952" height="9" fill="${c.line}"/><rect x="24" y="607" width="${originalWidth}" height="9" fill="${c.accent}"/></g>`;
  body += text(24, 640, 11, 'GitHub calendar snapshot · includes private activity counts · public repositories for language mix', c.muted);
  const title = `GitHub contribution calendar: ${totalContributions} contributions, ${collection.totalCommitContributions} commit contributions, ${collection.totalPullRequestContributions} PRs, ${Object.keys(daily).length} active days. Calendar, monthly area chart, language donut, weekday bars, and repository split.`;
  const css = animated ? motion : motion.slice(0, motion.indexOf('@media'));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="658" viewBox="0 0 1000 658" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>${css}</style><rect x=".5" y=".5" width="999" height="657" rx="10" fill="${c.paper}" stroke="${c.line}"/>${body}</svg>`;
}
// Build every variant before writing, so failed data/geometry checks retain prior art.
const outputs = {
  'github-dashboard': render(themes.light),
  'github-dashboard-dark': render(themes.dark),
  'github-dashboard-static': render(themes.light, false),
  'github-dashboard-adaptive': adaptiveSvg(render(themes.light)),
  'github-dashboard-static-adaptive': adaptiveSvg(render(themes.light, false)),
};
for (const [name, art] of Object.entries(outputs)) fs.writeFileSync(`assets/${name}.svg`, art);
console.log(`Rendered GitHub calendar: ${totalContributions} contributions; monthly and weekday totals match; ${sorted.length} languages; ${originalCount} originals / ${forkCount} forks.`);
