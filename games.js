/* ====== UNIBOT 2030 — ALPHA CORE ====== */

// شاشة التحميل
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 2000);
});

// ===== جسيمات متحركة =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth; canvas.height = innerHeight;
const colors = ['#a855f7', '#3b82f6', '#ef4444'];
const parts = Array.from({ length: 70 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 2.5 + .5,
  vx: (Math.random() - .5) * .4,
  vy: (Math.random() - .5) * .4,
  c: colors[Math.floor(Math.random() * 3)]
}));

function anim() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of parts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 7);
    ctx.fillStyle = p.c;
    ctx.shadowColor = p.c; ctx.shadowBlur = 12;
    ctx.fill();
  }
  // خطوط بين الجسيمات القريبة
  for (let i = 0; i < parts.length; i++)
    for (let j = i + 1; j < parts.length; j++) {
      const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
      if (dx * dx + dy * dy < 9000) {
        ctx.beginPath();
        ctx.moveTo(parts[i].x, parts[i].y);
        ctx.lineTo(parts[j].x, parts[j].y);
        ctx.strokeStyle = 'rgba(168,85,247,.12)';
        ctx.shadowBlur = 0; ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  requestAnimationFrame(anim);
}
anim();
addEventListener('resize', () => { canvas.width = innerWidth; canvas.height = innerHeight; });

// ===== مؤشر الماوس =====
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
});
(function follow() {
  rx += (mx - rx) * .15; ry += (my - ry) * .15;
  ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(follow);
})();
document.querySelectorAll('a, .cmd-card, .stat-card, .game-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

// ===== ظهور تدريجي عند السكرول =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add('show'));
}, { threshold: .15 });
document.querySelectorAll('.section, .stat-card, .cmd-card, .game-card, .throne')
  .forEach(el => { el.classList.add('reveal'); io.observe(el); });

// ===== عدّاد متحرك للأرقام =====
document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  const io2 = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const t = setInterval(() => {
      n += step;
      if (n >= target) { n = target; clearInterval(t); }
      el.textContent = n;
    }, 25);
    io2.disconnect();
  });
  io2.observe(el);
});

// ===== تأثير 3D Tilt =====
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});
