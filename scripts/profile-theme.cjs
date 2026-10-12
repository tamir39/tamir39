// GitHub / Primer surfaces and accents, shared by every profile image.
const themes = {
  light: {
    paper: '#ffffff', ink: '#1f2328', muted: '#59636e', accent: '#0969da',
    line: '#d1d9e0', surface: '#f6f8fa', green: '#1a7f37', accentSurface: '#ddf4ff',
    levels: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  },
  dark: {
    paper: '#0d1117', ink: '#f0f6fc', muted: '#9198a1', accent: '#4493f8',
    line: '#3d444d', surface: '#151b23', green: '#3fb950', accentSurface: '#121d2f',
    levels: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
};

// User-requested ambient loops: data geometry and labels stay fixed.
// Reduced-motion users get the complete, stationary artwork.
const motion = `
text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.trace{opacity:0}
@media(prefers-reduced-motion:no-preference){
  .bar,.draw{animation:highlight 5s ease-in-out infinite;animation-delay:var(--delay,0ms)}
  .pulse{animation:highlight 3.2s ease-in-out infinite;animation-delay:var(--delay,0ms)}
  .trace{opacity:1;stroke-dasharray:.12 .88;animation:trace 7s linear infinite;animation-delay:var(--delay,0ms)}
  .orbit{transform-origin:var(--center);animation:orbit 12s linear infinite}
  .float{transform-box:fill-box;transform-origin:center;animation:float 6s ease-in-out infinite}
  .cell{animation:highlight 5.6s ease-in-out infinite;animation-delay:var(--delay,0ms)}
  @keyframes highlight{0%,100%{opacity:1}50%{opacity:.65}}
  @keyframes trace{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
  @keyframes orbit{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-2px) rotate(2deg)}}
}
`;

// Embedded SVG media queries inherit the image element's used color scheme.
// Keep theme selection inside the art, rather than relying on README URL flags.
function adaptiveSvg(art) {
  const tokens = Object.entries(themes.light).flatMap(([role, value]) =>
    Array.isArray(value) ? value.map((color, i) => [`level-${i}`, color, themes.dark[role][i]]) : [[role, value, themes.dark[role]]]);
  for (const [role, light] of tokens) art = art.replaceAll(light, `var(--${role})`);
  const variables = index => tokens.map(([role, ...colors]) => `--${role}:${colors[index]}`).join(';');
  const css = `:root{${variables(0)}}@media(prefers-color-scheme:dark){:root{${variables(1)}}}`;
  return art.replace('<style>', `<style>${css}`);
}

module.exports = { themes, motion, adaptiveSvg };
