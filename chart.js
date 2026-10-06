// Graphique combiné : barres (vélocité) + courbe (lead time), en SVG pur.
(function () {
  const data = [
    { s: 1, v: 18, lt: 19 }, { s: 2, v: 17, lt: 18 }, { s: 3, v: 20, lt: 17 },
    { s: 4, v: 22, lt: 15 }, { s: 5, v: 21, lt: 14 }, { s: 6, v: 24, lt: 13 },
    { s: 7, v: 26, lt: 12 }, { s: 8, v: 27, lt: 11 }, { s: 9, v: 29, lt: 10 },
    { s: 10, v: 30, lt: 9 }, { s: 11, v: 32, lt: 9 }, { s: 12, v: 33, lt: 8 }
  ];

  const root = document.getElementById('chart');
  const tooltip = document.getElementById('tooltip');
  if (!root) return;

  const W = 640, H = 340, m = { t: 16, r: 44, b: 36, l: 40 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const vMax = 40, ltMax = 20;
  const band = iw / data.length;
  const bw = band * 0.56;

  const x = i => m.l + band * i + band / 2;
  const yV = v => m.t + ih - (v / vMax) * ih;
  const yL = v => m.t + ih - (v / ltMax) * ih;

  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });

  // Grille + axes
  const grid = el('g', { class: 'grid' }, svg);
  const axis = el('g', { class: 'axis' }, svg);
  for (let i = 0; i <= 4; i++) {
    const y = m.t + (ih / 4) * i;
    el('line', { x1: m.l, x2: W - m.r, y1: y, y2: y }, grid);
    el('text', { x: m.l - 8, y: y + 4, 'text-anchor': 'end' }, axis).textContent = vMax - (vMax / 4) * i;
    el('text', { x: W - m.r + 8, y: y + 4, 'text-anchor': 'start' }, axis).textContent = (ltMax - (ltMax / 4) * i) + ' j';
  }
  data.forEach((d, i) => {
    el('text', { x: x(i), y: H - m.b + 20, 'text-anchor': 'middle' }, axis).textContent = 'S' + d.s;
  });

  // Barres
  const bars = data.map((d, i) => {
    const b = el('rect', {
      class: 'bar bar-grow', x: x(i) - bw / 2, y: yV(d.v), width: bw,
      height: m.t + ih - yV(d.v), rx: 5
    }, svg);
    b.style.animationDelay = (i * 0.05) + 's';
    return b;
  });

  // Courbe lead time (lissée)
  const pts = data.map((d, i) => [x(i), yL(d.lt)]);
  const smooth = pts.reduce((acc, p, i, a) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const [px, py] = a[i - 1];
    const cx = (px + p[0]) / 2;
    return acc + ` C${cx},${py} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }, '');
  el('path', { class: 'area', d: `${smooth} L${pts[pts.length - 1][0]},${m.t + ih} L${pts[0][0]},${m.t + ih} Z` }, svg);
  el('path', { class: 'line line-draw', d: smooth }, svg);
  const dots = pts.map(p => el('circle', { class: 'dot', cx: p[0], cy: p[1], r: 4.5 }, svg));

  // Zones de survol
  data.forEach((d, i) => {
    const hit = el('rect', { class: 'hit', x: m.l + band * i, y: m.t, width: band, height: ih }, svg);
    const show = () => {
      bars.forEach((b, j) => b.classList.toggle('is-dim', j !== i));
      dots.forEach((c, j) => c.setAttribute('r', j === i ? 7 : 4.5));
      const rect = root.getBoundingClientRect();
      const fig = root.parentElement.getBoundingClientRect();
      const scale = rect.width / W;
      tooltip.innerHTML = `<strong>Sprint ${d.s}</strong><br>Vélocité : ${d.v} pts<br>Lead time : ${d.lt} j`;
      tooltip.style.left = (rect.left - fig.left + x(i) * scale) + 'px';
      tooltip.style.top = (rect.top - fig.top + Math.min(yV(d.v), yL(d.lt)) * scale - 6) + 'px';
      tooltip.hidden = false;
    };
    hit.addEventListener('mouseenter', show);
    hit.addEventListener('touchstart', show, { passive: true });
  });
  svg.addEventListener('mouseleave', () => {
    bars.forEach(b => b.classList.remove('is-dim'));
    dots.forEach(c => c.setAttribute('r', 4.5));
    tooltip.hidden = true;
  });

  root.appendChild(svg);
})();
