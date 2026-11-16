/* ============================================================
   UniBot v3.1 — ALPHA CORE & LIVE API INTEGRATION
============================================================ */
'use strict';

const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const API_URL = "https://ejhyovem0d.apps.bot-hosting.cloud";
const CLIENT_ID = "1523042577924886749"; 
const REDIRECT_URI = window.location.origin + window.location.pathname;

let currentGuildId = localStorage.getItem('unibot-selected-guild') || null;

/* ---------- شاشة التحميل ---------- */
window.addEventListener('load', () => {
  setTimeout(() => { const l = $('#loader'); if (l) l.classList.add('done'); }, 1200);
});

/* ---------- توست الإشعارات ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- التنقل بين الأقسام ---------- */
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
  localStorage.setItem('unibot-page', page);
  if (innerWidth <= 900) setNav(false);
}

links.forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  goTo(a.dataset.page);
}));

/* ---------- القائمة المنسدلة (البرغر) ---------- */
const burger  = $('#burger');
const sidebar = $('#sidebar');
const overlay = $('#overlay');

function setNav(open) {
  document.body.classList.toggle('nav-open', open);
  if (burger) burger.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('on', open);
}

if (burger) {
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = document.body.classList.contains('nav-open');
    setNav(!isOpen);
  });
}

if (overlay) {
  overlay.addEventListener('click', () => setNav(false));
}

/* ---------- جلب الإحصائيات الحية من البوت ---------- */
async function loadLiveStats() {
  try {
    const res = await fetch(`${API_URL}/api/stats`);
    const data = await res.json();
    
    const srvEl = document.querySelector('.stat-card.v .s-num');
    if (srvEl && data.servers !== undefined) srvEl.textContent = data.servers;

    const pingEl = document.querySelector('.stat-card.b .s-num');
    if (pingEl && data.ping !== undefined) pingEl.innerHTML = `${data.ping}<small>ms</small>`;
    
    const pillEl = document.querySelector('.status-pill');
    if (pillEl) pillEl.innerHTML = `<i class="dot"></i> ${data.ping}ms`;

    const upEl = $('#uptime');
    if (data.uptime && upEl) {
      const d = Math.floor(data.uptime / 86400);
      const h = Math.floor((data.uptime % 86400) / 3600);
      const m = Math.floor((data.uptime % 3600) / 60);
      upEl.textContent = `${d}ي ${h}س ${m}د`;
    }
  } catch (e) {
    console.warn("تعذر جلب إحصائيات البوت الحية");
  }
}
loadLiveStats();
setInterval(loadLiveStats, 15000);

/* ---------- نظام تسجيل الدخول OAuth2 ---------- */
const loginBtn = document.getElementById('discordLoginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    window.location.href = authUrl;
  });
}

async function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    window.history.replaceState({}, document.title, REDIRECT_URI);
    toast('⏳ جاري تسجيل الدخول...');
    try {
      const r = await fetch(`${API_URL}/api/auth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: REDIRECT_URI })
      });
      const data = await r.json();
      if (data.token) {
        localStorage.setItem('unibot-session', data.token);
        toast(`✅ أهلاً بك ${data.user.username}!`);
        loadUserGuilds();
      } else {
        toast('❌ فشل تسجيل الدخول');
      }
    } catch (e) {
      toast('❌ خطأ في الاتصال بالبوت');
    }
  } else if (localStorage.getItem('unibot-session')) {
    loadUserGuilds();
  }
}

/* ---------- جلب سيرفرات المستخدم وإخفاء زر الدخول وإظهار القائمة ---------- */
async function loadUserGuilds() {
  const session = localStorage.getItem('unibot-session');
  if (!session) return;

  try {
    const r = await fetch(`${API_URL}/api/my-guilds`, {
      headers: { 'x-session': session }
    });
    if (r.status === 401) {
      localStorage.removeItem('unibot-session');
      return;
    }
    const data = await r.json();
    
    // إخفاء زر تسجيل الدخول وإظهار اسم المستخدم بدلاً منه أو تدويره لخروج
    if (loginBtn && data.user) {
      loginBtn.innerHTML = `👤 ${data.user.username} (تسجيل خروج)`;
      loginBtn.onclick = () => {
        localStorage.removeItem('unibot-session');
        localStorage.removeItem('unibot-selected-guild');
        location.reload();
      };
    }

    const box = document.getElementById('guildSelectorBox');
    const select = document.getElementById('guildSelect');
    if (box && select && data.guilds) {
      box.style.display = 'block'; // إظهار قائمة السيرفرات المنسدلة
      select.innerHTML = data.guilds.length 
        ? `<option value="">اختر السيرفر للتحكم...</option>` + data.guilds.map(g => `<option value="${g.id}">${g.name}</option>`).join('')
        : '<option value="">البوت غير موجود في سيرفراتك</option>';

      if (currentGuildId && data.guilds.some(g => g.id === currentGuildId)) {
        select.value = currentGuildId;
      }

      select.addEventListener('change', () => {
        currentGuildId = select.value;
        localStorage.setItem('unibot-selected-guild', currentGuildId);
        if (currentGuildId) loadGuildRealData(currentGuildId);
      });

      if (currentGuildId) loadGuildRealData(currentGuildId);
    }
  } catch (e) {
    console.error(e);
  }
}

/* ---------- جلب بيانات الرومات والرتب الحقيقية ---------- */
async function loadGuildRealData(guildId) {
  const session = localStorage.getItem('unibot-session');
  if (!session || !guildId) return;

  toast('🔄 جاري تحميل بيانات السيرفر...');
  try {
    const r = await fetch(`${API_URL}/api/guild/${guildId}/data`, {
      headers: { 'x-session': session }
    });
    const data = await r.json();

    const chanHtml = data.channels.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    document.querySelectorAll('select').forEach(sel => {
      if (sel.id !== 'guildSelect' && sel.id !== 'botLang') {
        sel.innerHTML = chanHtml;
      }
    });

    const roleHtml = data.roles.map(r => `<option value="${r.id}">@${r.name}</option>`).join('');
    const joinRole = document.getElementById('joinRole');
    if (joinRole) joinRole.innerHTML = roleHtml;

    toast('✅ تم تحميل بيانات السيرفر بنجاح!');
  } catch (e) {
    toast('⚠️ تعذر جلب تفاصيل السيرفر');
  }
}

/* ---------- حفظ الإعدادات ---------- */
document.querySelectorAll('[data-save]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const session = localStorage.getItem('unibot-session');
    if (!session || !currentGuildId) {
      toast('⚠️ سجل الدخول واختر سيرفراً أولاً!');
      return;
    }

    const activePage = document.querySelector('.page.on')?.id || 'system';
    const payload = { updatedAt: Date.now() };
    document.querySelectorAll(`#${activePage} input, #${activePage} select, #${activePage} textarea`).forEach((el, idx) => {
      const key = el.id || el.dataset.k || `field_${idx}`;
      payload[key] = el.type === 'checkbox' ? el.checked : el.value;
    });

    try {
      const res = await fetch(`${API_URL}/api/settings/${currentGuildId}/${activePage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session': session },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.ok) toast('💾 تم الحفظ في قاعدة بيانات البوت!');
      else toast('❌ فشل الحفظ');
    } catch {
      toast('❌ خطأ في الاتصال بالبوت');
    }
  });
});

const savedPage = localStorage.getItem('unibot-page');
if (savedPage && $('#' + savedPage)) goTo(savedPage);

handleAuthCallback();
