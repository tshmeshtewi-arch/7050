/* ============================================
   UniBot v3.0 — ALPHA CORE SCRIPT
   كل المنطق: تنقل، حفظ، مخطط، جسيمات، نوافذ
============================================ */
'use strict';

/* ---------- أدوات مساعدة ---------- */
const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* ---------- شاشة التحميل ---------- */
window.addEventListener('load', () => {
  setTimeout(() => $('#loader').classList.add('done'), 1700);
});

/* ---------- التنقل بين الصفحات ---------- */
const links = $$('.nav a');
const crumb = $('#crumb');

function goTo(page) {
  links.forEach(l => l.classList.toggle('active', l.dataset.page === page));
  $$('.page').forEach(p => p.classList.toggle('on', p.id === page));
  const active = links.find(l => l.dataset.page === page);
  if (active) crumb.textContent = active.textContent.trim();
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  localStorage.setItem('unibot-page', page);
}

links.forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  goTo(a.dataset.page);
}));

/* استعادة آخر صفحة */
const savedPage = localStorage.getItem('unibot-page');
if (savedPage && $('#' + savedPage)) goTo(savedPage);

/* ---------- هامبرغر 3 شرطات ---------- */
const burger  = $('#burger');
const sidebar = $('#sidebar');
const overlay = $('#overlay');

function closeSidebar() {
  burger.classList.remove('open');
  sidebar.classList.remove('open');
  overlay.classList.remove('on');
}
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('on');
});
overlay.addEventListener('click', closeSidebar);

/* ---------- الساعة الحية ---------- */
const clock = $('#clock');
setInterval(() => {
  const d = new Date();
  clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0')).join(':');
}, 1000);

/* ---------- عداد التشغيل الحي ---------- */
const upEl = $('#uptime');
let upSec = 3 * 86400; // 3 أيام
setInterval(() => {
  upSec++;
  const d = Math.floor(upSec / 86400);
  const h = Math.floor((upSec % 86400) / 3600);
  const m = Math.floor((upSec % 3600) / 60);
  upEl.textContent = `${d}ي ${h}س ${m}د`;
}, 60000);

/* ---------- حفظ مفاتيح الأنظمة (localStorage) ---------- */
$$('input[data-store]').forEach(inp => {
  const key = 'unibot-' + inp.dataset.store;
  const saved = localStorage.getItem(key);
  if (saved !== null) inp.checked = saved === '1';
  inp.addEventListener('change', () => {
    localStorage.setItem(key, inp.checked ? '1' : '0');
    toast(inp.checked ? '✅ تم تشغيل النظام' : '⛔ تم إيقاف النظام');
  });
});

/* ---------- توست الإشعارات ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
$$('[data-save]').forEach(b =>
  b.addEventListener('click', () => toast('✅ تم حفظ الإعدادات بنجاح!'))
);

/* ---------- عدّادات متحركة ---------- */
$$('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 50));
    const timer = setInterval(() => {
      n += step;
      if (n >= target) { n = target; clearInterval(timer); }
      el.textContent = n;
    }, 30);
  }, { threshold: .3 });
  io.observe(el);
});

/* ---------- شرائح التبديل (chips) ---------- */
$$('.chip.tog').forEach(c =>
  c.addEventListener('click', () => {
    c.classList.toggle('on');
    toast(c.classList.contains('on') ? '🔔 تم تفعيل المنصة' : 'تم إلغاء المنصة');
  })
);

/* ---------- معاينة الترحيب الحية ---------- */
const wmsg = $('#wmsg'), wptext = $('#wptext'), wpreview = $('#wpreview');
if (wmsg) {
  wmsg.addEventListener('input', () => {
    wptext.textContent = wmsg.value
      .replaceAll('{member}', '@عضو')
      .replaceAll('{server}', 'Wolf Pack')
      .replaceAll('{count}', '1,240');
  });
  $$('.chip[data-var]').forEach(c =>
    c.addEventListener('click', () => {
      wmsg.value += c.dataset.var;
      wmsg.dispatchEvent(new Event('input'));
    })
  );
  $('.wcolor').addEventListener('input', e =>
    wpreview.style.setProperty('--pc', e.target.value)
  );
}

/* ---------- منشئ الرسائل (Embed) ---------- */
const eT = $('#eTitle'), eD = $('#eDesc'), eC = $('#eColor');
if (eT) {
  const upd = () => {
    $('#epT').textContent = eT.value || '...';
    $('#epD').textContent = eD.value || '...';
    $('#ePreview').style.setProperty('--pc', eC.value);
  };
  eT.addEventListener('input', upd);
  eD.addEventListener('input', upd);
  eC.addEventListener('input', upd);
}

/* ---------- السلايدر ---------- */
const xp = $('#xpslide'), xpVal = $('#xpval');
if (xp) xp.addEventListener('input', () => xpVal.textContent = xp.value);
const vol = $('#vol'), volVal = $('#volval');
if (vol) vol.addEventListener('input', () => volVal.textContent = vol.value + '%');

/* ---------- نافذة إضافة رتبة ---------- */
const modal = $('#modal');
$('#addRank').addEventListener('click', () => modal.classList.add('on'));
$('#mCancel').addEventListener('click', () => modal.classList.remove('on'));
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.remove('on');
});
$('#mAdd').addEventListener('click', () => {
  const name = $('#mName').value.trim();
  const req  = $('#mReq').value.trim() || 'بدون شرط';
  if (!name) { toast('⚠️ اكتب اسم الرتبة أولاً'); return; }
  const colors = ['rb2', 'rb3', 'rb4'];
  const row = document.createElement('div');
  row.className = 'rank-row';
  row.innerHTML = `
    <span class="rb ${colors[$('#ranklist').children.length % 3]}">⭐</span>
    <div><b>${name}</b><small>${req}</small></div>
    <label class="switch"><input type="checkbox" checked><i></i></label>`;
  $('#ranklist').appendChild(row);
  $('#mName').value = ''; $('#mReq').value = '';
  modal.classList.remove('on');
  toast('🏆 تمت إضافة الرتبة: ' + name);
});

/* ---------- بحث سريع ---------- */
$('#search').addEventListener('input', e => {
  const q = e.target.value.trim();
  if (!q) return;
  const hit = links.find(l => l.textContent.includes(q));
  if (hit) { goTo(hit.dataset.page); toast('🔍 تم الانتقال إلى: ' + hit.textContent.trim()); }
});

/* ---------- جسيمات الخلفية ---------- */
const cv = $('#fx'), ctx = cv.getContext('2d');
function sizeCanvas() { cv.width = innerWidth; cv.height = innerHeight; }
sizeCanvas();
addEventListener('resize', sizeCanvas);

const palette = ['#a855f7', '#3b82f6', '#ef4444'];
const dots = Array.from({ length: 55 }, () => ({
  x: Math.random() * cv.width,
  y: Math.random() * cv.height,
  r: Math.random() * 2.2 + .6,
  vx: (Math.random() - .5) * .35,
  vy: (Math.random() - .5) * .35,
  c: palette[Math.floor(Math.random() * 3)]
}));

(function loop() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  for (const d of dots) {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > cv.width) d.vx *= -1;
    if (d.y < 0 || d.y > cv.height) d.vy *= -1;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, 7);
    ctx.fillStyle = d.c;
    ctx.shadowColor = d.c;
    ctx.shadowBlur = 10;
    ctx.fill();
  }
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      if (dx * dx + dy * dy < 8000) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = 'rgba(168,85,247,.1)';
        ctx.shadowBlur = 0;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(loop);
})();

/* ---------- مخطط الأداء (Canvas Chart) ---------- */
const chart = $('#chart');
if (chart) {
  chart.width = chart.offsetWidth || 600;
  const cctx = chart.getContext('2d');
  const data = [40, 65, 30, 80, 55, 70, 45, 85, 60, 75, 50, 90];
  let shift = 0;
  function drawChart() {
    const w = chart.width, h = 180;
    cctx.clearRect(0, 0, w, h);
    const grad = cctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#a855f7');
    grad.addColorStop(.5, '#3b82f6');
    grad.addColorStop(1, '#ef4444');
    cctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * (w - 20) + 10;
      const y = h - (v / 100) * (h - 30) - 15;
      i ? cctx.lineTo(x, y) : cctx.moveTo(x, y);
    });
    cctx.strokeStyle = grad;
    cctx.lineWidth = 3;
    cctx.shadowColor = '#a855f7';
    cctx.shadowBlur = 14;
    cctx.stroke();
    cctx.shadowBlur = 0;
    // تعبئة تحت الخط
    cctx.lineTo(w - 10, h); cctx.lineTo(10, h); cctx.closePath();
    const fill = cctx.createLinearGradient(0, 0, 0, h);
    fill.addColorStop(0, 'rgba(168,85,247,.25)');
    fill.addColorStop(1, 'rgba(168,85,247,0)');
    cctx.fillStyle = fill;
    cctx.fill();
    shift = (shift + 1) % 100;
    requestAnimationFrame(drawChart);
  }
  drawChart();
}

/* ---------- ظهور تدريجي عند السكرول ---------- */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = 1;
      e.target.style.transform = 'none';
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: .12 });
$$('.card, .stat-card, .game-card').forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .6s, transform .6s';
  revealIO.observe(el);
});

/* ---------- حدث أحداث وهمية كل فترة ---------- */
const feedMsgs = [
  'فحص دوري للأنظمة — كل شيء سليم',
  'تم تحسين سرعة الاستجابة',
  'أرشيف التذاكر يعمل بنجاح',
  'وحدة الحماية في حالة تأهب',
  'تم تحديث الإحصائيات'
];
const feedEl = $('#feed');
setInterval(() => {
  if (!feedEl) return;
  const item = document.createElement('div');
  item.className = 'feed-item';
  const c = palette[Math.floor(Math.random() * 3)];
  item.innerHTML = `<i style="--c:${c}"></i><div>
    <b>${feedMsgs[Math.floor(Math.random() * feedMsgs.length)]}</b>
    <small>الآن</small></div>`;
  feedEl.prepend(item);
  while (feedEl.children.length > 5) feedEl.lastChild.remove();
}, 30000);

/* ---------- رسالة ترحيب في الكونسول ---------- */
console.log('%c🐺 UniBot ALPHA v3.0 — القطيع يتبع الألفا',
  'color:#a855f7;font-size:16px;font-weight:bold');
