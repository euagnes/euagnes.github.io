// ===== Ano no rodapé =====
document.getElementById('year').textContent = new Date().getFullYear();

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Navbar: fundo ao rolar e menu no celular =====
const nav = document.querySelector('.nav');
const toTop = document.querySelector('.to-top');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  toTop.classList.toggle('show', window.scrollY > 600);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// ===== Texto digitando =====
const typed = document.querySelector('.typed');
const words = JSON.parse(typed.dataset.words);
if (reduce) {
  typed.textContent = words[0];
} else {
  let w = 0, i = 0, deleting = false;
  const type = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    typed.textContent = word.slice(0, i);
    let delay = deleting ? 40 : 85;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
    setTimeout(type, delay);
  };
  type();
}

// ===== Animação ao rolar =====
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ===== Cursor customizado (só com mouse) =====
if (window.matchMedia('(pointer: fine)').matches && !reduce) {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    document.body.classList.add('has-cursor');
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
  const follow = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.querySelectorAll('a, button, .tag, .project, .card').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}

// ===== Partículas no topo =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let pts = [];
const mouse = { x: -999, y: -999 };

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.min(90, Math.floor(canvas.offsetWidth * canvas.offsetHeight / 14000));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * canvas.offsetWidth,
    y: Math.random() * canvas.offsetHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
  }));
}

function draw() {
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  ctx.clearRect(0, 0, W, H);
  pts.forEach((p) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(216, 180, 254, .7)';
    ctx.fill();
  });
  for (let a = 0; a < pts.length; a++) {
    for (let b = a + 1; b < pts.length; b++) {
      const d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
      if (d < 120) {
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.25 * (1 - d / 120)})`;
        ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke();
      }
    }
    const dm = Math.hypot(pts[a].x - mouse.x, pts[a].y - mouse.y);
    if (dm < 160) {
      ctx.strokeStyle = `rgba(236, 72, 153, ${0.4 * (1 - dm / 160)})`;
      ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }
  if (!reduce) requestAnimationFrame(draw);
}

canvas.parentElement.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
});
canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
window.addEventListener('resize', resize);
resize();
draw();
