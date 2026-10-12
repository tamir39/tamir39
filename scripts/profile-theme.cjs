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

// Short sequences: SVG images cannot offer a pause control. Static base
// styles stay visible, and reduced-motion users get the completed artwork.
const motion = `
text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.reveal,.bar,.pulse,.draw{opacity:1}
@media(prefers-reduced-motion:no-preference){
  .reveal{animation:reveal 650ms cubic-bezier(.2,0,0,1) both;animation-delay:var(--delay,0ms)}
  .bar{transform-box:fill-box;transform-origin:left center;animation:bar 900ms cubic-bezier(.2,0,0,1) both;animation-delay:var(--delay,0ms)}
  .draw{stroke-dasharray:1;stroke-dashoffset:0;animation:draw 2100ms cubic-bezier(.2,0,0,1) both;animation-delay:var(--delay,0ms)}
  .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 1100ms ease-in-out 3}
  @keyframes reveal{from{opacity:.2;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bar{from{transform:scaleX(.15);opacity:.35}to{transform:scaleX(1);opacity:1}}
  @keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
}`;

module.exports = { themes, motion };
