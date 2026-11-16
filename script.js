/* ============================================================
   UniBot v3.1 — ALPHA CORE
   تنقل • لغة AR/EN • حماية متقدمة • مستويات • تقديم • حفظ
============================================================ */
'use strict';

const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* ---------- تخزين ---------- */
const store = {
  get(k, d = null) {
    try { const v = localStorage.getItem('unibot-' + k); return v === null ? d : v; }
    catch (e) { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('unibot-' + k, v); } catch (e) {}
  }
};

/* ---------- شاشة التحميل ---------- */
window.addEventListener('load', () => {
  setTimeout(() => { const l = $('#loader'); if (l) l.classList.add('done'); }, 1600);
});

/* ---------- توست ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- التنقل ---------- */
const links = $$('.nav a');
const crumb = $('#crumb');

function goTo(page) {
  links.forEach(l => l.classList.toggle('active', l.dataset.page === page));
  $$('.page').forEach(p => p.classList.toggle('on', p.id === page));
  const active = links.find(l => l.dataset.page === page);
  if (active && crumb) {
    const sp = active.querySelector('span');
    crumb.textContent = sp ? sp.textContent : active.textContent.trim();
  }
  document.documentElement.style.setProperty('--x', '0');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  store.set('page', page);
  if (innerWidth <= 900) setNav(false);
}

links.forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  goTo(a.dataset.page);
}));

/* ---------- الشرطات (تشتغل في كل المقاسات) ---------- */
const burger  = $('#burger');
const sidebar = $('#sidebar');
const overlay = $('#overlay');

function setNav(open) {
  document.body.classList.toggle('nav-open', !!open);
  if (burger) burger.classList.toggle('open', !!open);
  if (overlay) overlay.classList.toggle('on', !!open && innerWidth <= 900);
}

if (burger) {
  burger.addEventListener('click', () =>
    setNav(!document.body.classList.contains('nav-open'))
  );
}
if (overlay) overlay.addEventListener('click', () => setNav(false));

addEventListener('resize', () => {
  if (innerWidth > 900) { setNav(true); if (overlay) overlay.classList.remove('on'); }
});

if (innerWidth <= 900) setNav(false);

/* ---------- الساعة ---------- */
const clock = $('#clock');
if (clock) {
  setInterval(() => {
    const d = new Date();
    clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => String(n).padStart(2, '0')).join(':');
  }, 1000);
}

/* ---------- مدة التشغيل ---------- */
const upEl = $('#uptime');
let upSec = 3 * 86400;
if (upEl) {
  setInterval(() => {
    upSec++;
    const d = Math.floor(upSec / 86400);
    const h = Math.floor((upSec % 86400) / 3600);
    const m = Math.floor((upSec % 3600) / 60);
    upEl.textContent = `${d}ي ${h}س ${m}د`;
  }, 60000);
}

/* ---------- مفاتيح الأنظمة ---------- */
$$('input[data-store]').forEach(inp => {
  const key = inp.dataset.store;
  const saved = store.get(key);
  if (saved !== null) inp.checked = saved === '1';
  inp.addEventListener('change', () => {
    store.set(key, inp.checked ? '1' : '0');
    toast(inp.checked ? '✅ تم تشغيل النظام' : '⛔ تم إيقاف النظام');
  });
});

/* ---------- أزرار الحفظ ---------- */
$$('[data-save]').forEach(b =>
  b.addEventListener('click', () => toast('✅ تم حفظ الإعدادات بنجاح!'))
);

/* ---------- عدادات ---------- */
$$('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  if (!target) return;
  let n = 0;
  const step = Math.max(1, Math.ceil(target / 50));
  const t = setInterval(() => {
    n += step;
    if (n >= target) { n = target; clearInterval(t); }
    el.textContent = n;
  }, 30);
});

/* ---------- شرائح المنصات ---------- */
$$('.chip.tog').forEach(c =>
  c.addEventListener('click', () => {
    c.classList.toggle('on');
    toast(c.classList.contains('on') ? '🔔 تم تفعيل المنصة' : 'تم إلغاء المنصة');
  })
);

/* ---------- معاينة الترحيب ---------- */
const wmsg = $('#wmsg');
const wptext = $('#wptext');
const wpreview = $('#wpreview');

function renderWelcome() {
  if (!wmsg || !wptext) return;
  wptext.textContent = wmsg.value
    .replaceAll('{member}', '@عضو')
    .replaceAll('{server}', 'Wolf Pack')
    .replaceAll('{count}', '1,240');
}
if (wmsg) {
  wmsg.addEventListener('input', renderWelcome);
  renderWelcome();
  $$('.chip[data-var]').forEach(c =>
    c.addEventListener('click', () => {
      wmsg.value += c.dataset.var;
      renderWelcome();
    })
  );
}
const wcolor = $('.wcolor');
if (wcolor && wpreview) {
  wpreview.style.setProperty('--pc', wcolor.value);
  wcolor.addEventListener('input', e =>
    wpreview.style.setProperty('--pc', e.target.value)
  );
}

/* ---------- منشئ الرسائل ---------- */
const eT = $('#eTitle'), eD = $('#eDesc'), eC = $('#eColor');
if (eT && eD && eC) {
  const upd = () => {
    $('#epT').textContent = eT.value || '...';
    $('#epD').textContent = eD.value || '...';
    $('#ePreview').style.setProperty('--pc', eC.value);
  };
  eT.addEventListener('input', upd);
  eD.addEventListener('input', upd);
  eC.addEventListener('input', upd);
}

/* ---------- السلايدرات ---------- */
const xp1 = $('#xpslide'), xpVal1 = $('#xpval');
if (xp1 && xpVal1) xp1.addEventListener('input', () => xpVal1.textContent = xp1.value);

const xp2 = $('#xpslide2'), xpVal2 = $('#xpval2');
if (xp2 && xpVal2) xp2.addEventListener('input', () => xpVal2.textContent = xp2.value);

const vol = $('#vol'), volVal = $('#volval');
if (vol && volVal) vol.addEventListener('input', () => volVal.textContent = vol.value + '%');

/* ---------- نافذة إضافة الرتب ---------- */
const modal = $('#modal');
const addRank = $('#addRank');
const ranklist = $('#ranklist');

if (addRank) $('#addRank').addEventListener('click', () => modal.classList.add('on'));
if ($('#mCancel')) $('#mCancel').addEventListener('click', () => modal.classList.remove('on'));
if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('on'); });

if ($('#mAdd')) {
  $('#mAdd').addEventListener('click', () => {
    const name = $('#mName').value.trim();
    const req = $('#mReq').value.trim() || 'بدون شرط';
    if (!name) { toast('⚠️ اكتب اسم الرتبة أولاً'); return; }
    const cls = ['rb2', 'rb3', 'rb4'][ranklist.children.length % 3];
    const row = document.createElement('div');
    row.className = 'rank-row';
    row.innerHTML = `<span class="rb ${cls}">⭐</span>
      <div><b>${name}</b><small>${req}</small></div>
      <label class="switch"><input type="checkbox" checked><i></i></label>`;
    ranklist.appendChild(row);
    $('#mName').value = '';
    $('#mReq').value = '';
    modal.classList.remove('on');
    toast('🏆 تمت إضافة الرتبة: ' + name);
  });
}

/* ---------- بحث ---------- */
const search = $('#search');
if (search) {
  search.addEventListener('input', e => {
    const q = e.target.value.trim();
    if (!q) return;
    const hit = links.find(l => l.textContent.includes(q));
    if (hit) { goTo(hit.dataset.page); }
  });
}

/* ---------- جسيمات ---------- */
const cv = $('#fx');
if (cv) {
  const ctx = cv.getContext('2d');
  const sizeCanvas = () => { cv.width = innerWidth; cv.height = innerHeight; };
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
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  })();
}

/* ---------- مخطط الأداء ---------- */
const chart = $('#chart');
if (chart) {
  const cctx = chart.getContext('2d');
  const data = [40, 65, 30, 80, 55, 70, 45, 85, 60, 75, 50, 90];

  function drawChart() {
    const w = chart.clientWidth || 600;
    const h = 180;
    if (chart.width !== w) chart.width = w;
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

    cctx.lineTo(w - 10, h);
    cctx.lineTo(10, h);
    cctx.closePath();
    const fill = cctx.createLinearGradient(0, 0, 0, h);
    fill.addColorStop(0, 'rgba(168,85,247,.25)');
    fill.addColorStop(1, 'rgba(168,85,247,0)');
    cctx.fillStyle = fill;
    cctx.fill();

    requestAnimationFrame(drawChart);
  }
  drawChart();
}

/* ---------- سجل الأحداث ---------- */
const feedMsgs = [
  'فحص دوري للأنظمة — كل شيء سليم',
  'تم تحسين سرعة الاستجابة',
  'أرشيف التذاكر يعمل بنجاح',
  'وحدة الحماية في حالة تأهب',
  'تم تحديث الإحصائيات'
];
const feedEl = $('#feed');
if (feedEl) {
  const palette = ['#a855f7', '#3b82f6', '#ef4444'];
  setInterval(() => {
    const c = palette[Math.floor(Math.random() * 3)];
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `<i style="--c:${c}"></i><div>
      <b>${feedMsgs[Math.floor(Math.random() * feedMsgs.length)]}</b>
      <small>الآن</small></div>`;
    feedEl.prepend(item);
    while (feedEl.children.length > 5) feedEl.lastChild.remove();
  }, 30000);
}

/* ============================================================
   نظام الحماية المتقدم
============================================================ */
const ROLE_OPTS = [
  '👑 Alpha — ألفا', '🛡️ Admin — إداري', '⚔️ Moderator — مشرف',
  '💜 Support — دعم', '🤖 Bots — بوتات', '🐺 Pup — شبل'
];
const CHAN_OPTS = [
  '#security-alerts', '#تنبيهات-الحماية', '#mod-log', '#alerts', '#guard-log'
];

const PROTECTIONS = [
  { id: 'botAdd', icon: '🤖',
    ar: 'حماية دخول البوتات', en: 'Bot Add Protection',
    desc: 'منع أي عضو من إضافة بوت للسيرفر' },
  { id: 'botUnverified', icon: '⚠️',
    ar: 'حماية دخول البوتات غير الموثوقة', en: 'Unverified Bots Protection',
    desc: 'منع إضافة أي بوت غير موثّق من ديسكورد' },
  { id: 'banMembers', icon: '🔨',
    ar: 'حماية حظر الأعضاء', en: 'Anti-Ban Protection',
    desc: 'منع حظر الأعضاء من غير رتب الدعم' },
  { id: 'kickMembers', icon: '👢',
    ar: 'حماية طرد الأعضاء', en: 'Anti-Kick Protection',
    desc: 'منع طرد الأعضاء من غير رتب الدعم' },
  { id: 'renameChannels', icon: '✏️',
    ar: 'حماية تغيير أسماء الشاتات', en: 'Channel Rename Protection',
    desc: 'منع تعديل أسماء الرومات' },
  { id: 'deleteChannels', icon: '🗑️',
    ar: 'حماية مسح الشاتات', en: 'Channel Delete Protection',
    desc: 'منع حذف الرومات نهائياً' },
  { id: 'roleAdd', icon: '🏷️',
    ar: 'حماية إضافة رتب', en: 'Role Add Protection',
    desc: 'منع إنشاء أو منح الرتب الخطرة' },
  { id: 'serverInfo', icon: '⚙️',
    ar: 'حماية تغيير معلومات السيرفر', en: 'Server Info Protection',
    desc: 'منع تغيير اسم أو أيقونة أو إعدادات السيرفر' }
];

const pList = $('#protectList');

function roleOptionsHtml() {
  return ROLE_OPTS.map(r => `<option>${r}</option>`).join('');
}
function chanOptionsHtml() {
  return CHAN_OPTS.map(c => `<option>${c}</option>`).join('');
}

function buildProtections() {
  if (!pList) return;

  pList.innerHTML = PROTECTIONS.map(p => `
    <div class="p-card" data-pid="${p.id}">
      <div class="p-head">
        <div class="p-title">
          <span class="p-ico">${p.icon}</span>
          <div>
            <b data-ar="${p.ar}" data-en="${p.en}">${p.ar}</b>
            <small>${p.desc}</small>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" data-k="on"><i></i>
        </label>
      </div>
      <div class="p-body">
        <div class="field">
          <label data-ar="🎖️ رتب الدعم (لا يلمسها البوت)" data-en="🎖️ Support Roles">🎖️ رتب الدعم (لا يلمسها البوت)</label>
          <select data-k="roles" multiple size="4">${roleOptionsHtml()}</select>
        </div>
        <div class="field">
          <label data-ar="⚖️ العقوبة" data-en="⚖️ Punishment">⚖️ العقوبة</label>
          <select data-k="punish">
            <option value="ban" data-ar="حظر العضو" data-en="Ban member">حظر العضو</option>
            <option value="strip" data-ar="سحب جميع الرتب" data-en="Strip all roles">سحب جميع الرتب</option>
          </select>
        </div>
        <div class="field">
          <label data-ar="📍 روم تنبيهات الحماية" data-en="📍 Alert Channel">📍 روم تنبيهات الحماية</label>
          <select data-k="alerts">${chanOptionsHtml()}</select>
        </div>
      </div>
    </div>
  `).join('');

  $$('.p-card', pList).forEach(card => {
    const pid = card.dataset.pid;
    const on = card.querySelector('[data-k="on"]');
    const roles = card.querySelector('[data-k="roles"]');
    const punish = card.querySelector('[data-k="punish"]');
    const alerts = card.querySelector('[data-k="alerts"]');

    /* استعادة القيم المحفوظة */
    const savedOn = store.get('prot-' + pid + '-on');
    if (savedOn !== null) on.checked = savedOn === '1';
    card.classList.toggle('on', on.checked);

    const savedRoles = store.get('prot-' + pid + '-roles');
    if (savedRoles) {
      const list = savedRoles.split('|');
      [...roles.options].forEach(o => o.selected = list.includes(o.value));
    }

    const savedPunish = store.get('prot-' + pid + '-punish');
    if (savedPunish) punish.value = savedPunish;

    const savedAlerts = store.get('prot-' + pid + '-alerts');
    if (savedAlerts) alerts.value = savedAlerts;

    /* الحفظ الفوري */
    on.addEventListener('change', () => {
      card.classList.toggle('on', on.checked);
      store.set('prot-' + pid + '-on', on.checked ? '1' : '0');
      toast(on.checked ? '🛡️ تم تفعيل الحماية' : '⛔ تم تعطيل الحماية');
    });

    roles.addEventListener('change', () => {
      const vals = [...roles.selectedOptions].map(o => o.value).join('|');
      store.set('prot-' + pid + '-roles', vals);
    });

    punish.addEventListener('change', () => {
      store.set('prot-' + pid + '-punish', punish.value);
      toast(punish.value === 'ban' ? '⚖️ العقوبة: حظر' : '⚖️ العقوبة: سحب الرتب');
    });

    alerts.addEventListener('change', () => {
      store.set('prot-' + pid + '-alerts', alerts.value);
      toast('📍 روم التنبيهات: ' + alerts.value);
    });
  });
}
buildProtections();

/* الماستر سويتش */
const pMaster = $('#protectMaster');
if (pMaster) {
  pMaster.addEventListener('change', () => {
    $$('.p-card [data-k="on"]').forEach(inp => {
      inp.checked = pMaster.checked;
      inp.dispatchEvent(new Event('change'));
    });
    toast(pMaster.checked ? '🛡️ تم تفعيل كل الحمايات' : '⛔ تم إيقاف كل الحمايات');
  });
}

/* روم التنبيهات العام + رتب الدعم العامة */
const gAlert = $('#globalAlert');
if (gAlert) {
  const v = store.get('global-alert');
  if (v) gAlert.value = v;
  gAlert.addEventListener('change', () => { store.set('global-alert', gAlert.value); });
}
const gRoles = $('#globalRoles');
if (gRoles) {
  const v = store.get('global-roles');
  if (v) {
    const list = v.split('|');
    [...gRoles.options].forEach(o => o.selected = list.includes(o.value));
  }
  gRoles.addEventListener('change', () => {
    store.set('global-roles', [...gRoles.selectedOptions].map(o => o.value).join('|'));
  });
}

/* ---------- رتبة الدخول ---------- */
const joinRole = $('#joinRole');
if (joinRole) {
  const v = store.get('join-role');
  if (v) joinRole.value = v;
  joinRole.addEventListener('change', () => {
    store.set('join-role', joinRole.value);
    toast('🚪 رتبة الدخول: ' + joinRole.value);
  });
}
const joinOn = $('#joinRoleOn');
if (joinOn) {
  const v = store.get('join-role-on');
  if (v !== null) joinRoleOn.checked = v === '1';
  joinOn.addEventListener('change', () => {
    store.set('join-role-on', joinOn.checked ? '1' : '0');
    toast(joinOn.checked ? '🚪 رتبة الدخول مفعّلة' : '⛔ رتبة الدخول متوقفة');
  });
}

/* ---------- محاكي المستويات ---------- */
const lvlTarget = $('#lvlTarget');
const lvlPreview = $('#lvlPreview');
const lvlTotal = $('#lvlTotal');

function xpForLevel(l) { return 5 * l * l + 50 * l + 100; }

function calcLevels() {
  if (!lvlTarget || !lvlPreview) return;
  const lv = Math.max(1, Math.min(200, +lvlTarget.value || 1));
  const need = xpForLevel(lv);
  let total = 0;
  for (let i = 1; i <= lv; i++) total += xpForLevel(i);

  lvlPreview.innerHTML =
    `XP المطلوب للمستوى <b>${lv}</b> : <b>${need.toLocaleString('en-US')}</b>`;
  if (lvlTotal) {
    lvlTotal.innerHTML =
      `إجمالي XP من المستوى 1 حتى <b>${lv}</b> : <b>${total.toLocaleString('en-US')}</b>`;
  }
}
if (lvlTarget) {
  lvlTarget.addEventListener('input', calcLevels);
  calcLevels();
}

/* ---------- أسئلة التقديم ---------- */
const qList = $('#qList');
const addQuestion = $('#addQuestion');

function renumber() {
  if (!qList) return;
  $$('.q-row', qList).forEach((r, i) => {
    const sp = r.querySelector('span');
    if (sp) sp.textContent = i + 1;
  });
}

if (addQuestion && qList) {
  addQuestion.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'q-row';
    row.innerHTML = `<span>0</span><input placeholder="اكتب السؤال..."><button class="del-q">✕</button>`;
    qList.appendChild(row);
    renumber();
    row.querySelector('input').focus();
    toast('➕ تمت إضافة سؤال');
  });

  qList.addEventListener('click', e => {
    if (!e.target.classList.contains('del-q')) return;
    if ($$('.q-row', qList).length === 1) { toast('⚠️ لازم يبقى سؤال واحد على الأقل'); return; }
    e.target.closest('.q-row').remove();
    renumber();
  });

  renumber();
}

/* ============================================================
   نظام اللغة AR / EN
============================================================ */
const LANG_KEY = 'lang';

function applyLang(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  $$('[data-ar]').forEach(el => {
    const txt = el.dataset[lang];
    if (txt) el.textContent = txt;
  });

  /* عنوان الصفحة */
  const h1 = $('.top h1');
  if (h1) {
    h1.textContent = lang === 'ar' ? 'لوحة تحكم ' : 'Dashboard ';
    const em = document.createElement('em');
    em.textContent = 'UniBot';
    h1.appendChild(em);
  }

  /* شريط المسار */
  const active = $('.nav a.active');
  if (active && crumb) {
    const sp = active.querySelector('span');
    if (sp) crumb.textContent = sp.textContent;
  }

  /* الزر النشط */
  $$('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));

  /* لغة البوت في الإعدادات */
  const bl = $('#botLang');
  if (bl) bl.value = lang;

  store.set(LANG_KEY, lang);
}

$$('.lang-btn').forEach(b => {
  b.addEventListener('click', () => {
    applyLang(b.dataset.lang);
    toast(b.dataset.lang === 'ar' ? '🇸🇦 تم التحويل للعربية' : '🇬🇧 Switched to English');
  });
});

const botLang = $('#botLang');
if (botLang) {
  botLang.addEventListener('change', () => {
    applyLang(botLang.value);
    toast('🌐 لغة البوت: ' + (botLang.value === 'ar' ? 'العربية' : 'English'));
  });
}

/* ---------- تشغيل أولي ---------- */
applyLang(store.get(LANG_KEY, 'ar'));

const savedPage = store.get('page');
if (savedPage && $('#' + savedPage)) goTo(savedPage);

console.log('%c🐺 UniBot ALPHA v3.1 — القطيع يتبع الألفا',
  'color:#a855f7;font-size:16px;font-weight:bold');
