'use strict';

const $  = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const API_URL = "https://ejhyovem0d.apps.bot-hosting.cloud";
const CLIENT_ID = "1523042577924886749"; 
const REDIRECT_URI = window.location.origin + window.location.pathname;

let currentGuildId = localStorage.getItem('unibot-selected-guild') || null;

window.addEventListener('load', () => {
  setTimeout(() => { const l = $('#loader'); if (l) l.classList.add('done'); }, 1200);
});

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

const links = $$('.nav a');
const crumb = $('#crumb');

function goTo(page) {
  links.forEach(l => l.classList.toggle('active', l.dataset.page === page));
  $$('.page').forEach(p => p.classList.toggle('on', p.id === page));
  const active = links.find(l => l.dataset.page === page);
  if (active && crumb) crumb.textContent = active.textContent.trim();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  localStorage.setItem('unibot-page', page);
  if (innerWidth <= 900) setNav(false);
}

links.forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  goTo(a.dataset.page);
}));

const burger  = $('#burger');
const sidebar = $('#sidebar');
const overlay = $('#overlay');

function setNav(open) {
  document.body.classList.toggle('nav-open', open);
  if (burger) burger.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('on', open);
}
if (burger) burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
if (overlay) overlay.addEventListener('click', () => setNav(false));

// أزرار الإضافة التفاعلية للردود والإيمبدات
const addAutoReplyBtn = $('#addAutoReplyBtn');
if (addAutoReplyBtn) {
  addAutoReplyBtn.addEventListener('click', () => {
    const container = $('#autoReplyContainer');
    if (container) {
      const div = document.createElement('div');
      div.className = 'field';
      div.style.position = 'relative';
      div.innerHTML = `
        <button type="button" style="position:absolute; left:0; top:0; background:none; border:none; color:var(--r); font-weight:bold; cursor:pointer;" onclick="this.parentElement.remove()">✕ إزالة</button>
        <label>كلمة جديدة</label><input placeholder="الكلمة...">
        <label style="margin-top:6px;">الرد</label><textarea placeholder="الرد..."></textarea>
      `;
      container.appendChild(div);
      toast('➕ تمت إضافة حقل رد جديد');
    }
  });
}

const loginBtn = document.getElementById('discordLoginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
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
      if (r.ok && data.token) {
        localStorage.setItem('unibot-session', data.token);
        toast(`✅ أهلاً بك ${data.user.username}!`);
        loadUserGuilds();
      } else {
        toast(`❌ فشل تسجيل الدخول`);
      }
    } catch {
      toast('❌ خطأ في الاتصال بالبوت');
    }
  } else if (localStorage.getItem('unibot-session')) {
    loadUserGuilds();
  }
}

async function loadUserGuilds() {
  const session = localStorage.getItem('unibot-session');
  if (!session) return;

  try {
    const r = await fetch(`${API_URL}/api/my-guilds`, { headers: { 'x-session': session } });
    if (r.status === 401) { localStorage.removeItem('unibot-session'); return; }
    const data = await r.json();
    
    if (loginBtn && data.user) {
      const avatarUrl = data.user.avatar 
        ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png` 
        : `https://cdn.discordapp.com/embed/avatars/0.png`;

      loginBtn.innerHTML = `<img src="${avatarUrl}" style="width:24px; height:24px; border-radius:50%; vertical-align:middle; margin-left:6px;"> 👤 ${data.user.username} (خروج)`;
      loginBtn.onclick = () => { localStorage.clear(); location.reload(); };
    }

    const box = document.getElementById('guildSelectorBox');
    const select = document.getElementById('guildSelect');
    if (box && select && data.guilds) {
      box.style.display = 'block';
      select.innerHTML = `<option value="">اختر السيرفر للتحكم...</option>` + data.guilds.map(g => `<option value="${g.id}">🛡️ ${g.name}</option>`).join('');

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
  } catch (e) {}
}

async function loadGuildRealData(guildId) {
  const session = localStorage.getItem('unibot-session');
  if (!session || !guildId) return;

  toast('🔄 جاري تحميل بيانات السيرفر والمحفظة...');
  try {
    const r = await fetch(`${API_URL}/api/guild/${guildId}/data`, { headers: { 'x-session': session } });
    const data = await r.json();

    if (data.wallet) {
      const walletEl = $('#userWalletLy');
      if (walletEl) walletEl.textContent = `${data.wallet.balance} Ly`;
    }

    const chanHtml = data.channels.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const roleHtml = data.roles.map(r => `<option value="${r.id}">@${r.name}</option>`).join('');

    $$('select').forEach(sel => {
      if (sel.id === 'guildSelect') return;
      const curVal = sel.value;
      if (sel.id.includes('Channel') || sel.id.includes('Room') || sel.id.includes('Category')) {
        sel.innerHTML = `<option value="">اختر القناة...</option>` + chanHtml;
      } else if (sel.id.includes('Role') || sel.id.includes('role')) {
        sel.innerHTML = `<option value="">اختر الرتبة...</option>` + roleHtml;
      }
      if (curVal) sel.value = curVal;
    });

    if (data.settings) {
      Object.keys(data.settings).forEach(sysKey => {
        const sysData = data.settings[sysKey];
        if (sysData && typeof sysData === 'object') {
          Object.keys(sysData).forEach(fieldKey => {
            const el = document.getElementById(fieldKey);
            if (el) {
              if (el.type === 'checkbox') el.checked = sysData[fieldKey];
              else el.value = sysData[fieldKey];
            }
          });
        }
      });
    }

    toast('✅ تم التحميل بنجاح!');
  } catch (e) {
    toast('⚠️ تعذر جلب تفاصيل السيرفر');
  }
}

document.querySelectorAll('[data-save]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const session = localStorage.getItem('unibot-session');
    if (!session || !currentGuildId) {
      toast('⚠️ سجل الدخول واختر سيرفراً أولاً!');
      return;
    }

    const activePage = document.querySelector('.page.on')?.id || 'settings';
    const payload = { updatedAt: Date.now() };

    document.querySelectorAll(`#${activePage} input, #${activePage} select, #${activePage} textarea`).forEach((el) => {
      if (el.id) {
        payload[el.id] = el.type === 'checkbox' ? el.checked : el.value;
      }
    });

    try {
      const res = await fetch(`${API_URL}/api/settings/${currentGuildId}/${activePage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session': session },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.ok) toast('💾 تم الحفظ بنجاح في قاعدة البيانات!');
      else toast('❌ فشل الحفظ');
    } catch {
      toast('❌ خطأ في الاتصال بالبوت');
    }
  });
});

const savedPage = localStorage.getItem('unibot-page');
if (savedPage && $('#' + savedPage)) goTo(savedPage);

handleAuthCallback();
