'use strict';

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const API_URL = "https://ejhyovem0d.apps.bot-hosting.cloud";
const CLIENT_ID = "1523042577924886749";
const REDIRECT_URI = window.location.origin + window.location.pathname;

let currentGuildId = localStorage.getItem('unibot-selected-guild') || null;

window.addEventListener('load', () => {
  setTimeout(() => { const l = $('#loader'); if (l) l.classList.add('done'); }, 1000);
});

function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// القائمة الجانبية
const burger = $('#burger'), sidebar = $('#sidebar'), overlay = $('#overlay');
function setNav(open) {
  document.body.classList.toggle('nav-open', open);
  if (burger) burger.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('on', open);
}
if (burger) burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
if (overlay) overlay.addEventListener('click', () => setNav(false));

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
links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); goTo(a.dataset.page); }));

// تسجيل الدخول
const loginBtn = document.getElementById('discordLoginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    if (localStorage.getItem('unibot-session')) { localStorage.clear(); location.reload(); return; }
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
        toast('❌ فشل تسجيل الدخول');
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
      loginBtn.innerHTML = `<img src="${avatarUrl}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-left:6px;"> 👤 ${data.user.username} (خروج)`;
    }

    const box = document.getElementById('guildSelectorBox');
    const select = document.getElementById('guildSelect');
    if (box && select && data.guilds) {
      box.style.display = 'block';
      select.innerHTML = `<option value="">اختر السيرفر للتحكم...</option>` +
        data.guilds.map(g => `<option value="${g.id}">🛡️ ${g.name}</option>`).join('');
      if (currentGuildId && data.guilds.some(g => g.id === currentGuildId)) select.value = currentGuildId;

      // ⚠️ نستخدم onchange مرة واحدة (بدون listener مكرر)
      select.onchange = () => {
        currentGuildId = select.value;
        localStorage.setItem('unibot-selected-guild', currentGuildId);
        if (currentGuildId) loadGuildRealData(currentGuildId);
      };
      if (currentGuildId) loadGuildRealData(currentGuildId);
    }
  } catch (e) {}
}

let guildMembersCache = [];

async function loadGuildRealData(guildId) {
  const session = localStorage.getItem('unibot-session');
  if (!session || !guildId) return;
  toast('🔄 جاري تحميل بيانات السيرفر...');
  try {
    const r = await fetch(`${API_URL}/api/guild/${guildId}/data`, { headers: { 'x-session': session } });
    if (!r.ok) { toast('⚠️ تعذر جلب البيانات'); return; }
    const data = await r.json();

    if (data.wallet) {
      const el = $('#userWalletLy');
      if (el) el.textContent = `${data.wallet.balance} Ly`;
    }

    const chanHtml = data.channels.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const roleHtml = data.roles.map(rr => `<option value="${rr.id}">@${rr.name}</option>`).join('');

    $$('select').forEach(sel => {
      if (sel.id === 'guildSelect') return;
      const curVal = sel.value;
      if (sel.id.includes('Channel') || sel.id.includes('Room') || sel.id.includes('room') || sel.id.includes('Category') || sel.id.includes('category') || sel.id.includes('channel')) {
        sel.innerHTML = `<option value="">اختر القناة...</option>` + chanHtml;
      } else if (sel.id.includes('Role') || sel.id.includes('role')) {
        sel.innerHTML = `<option value="">اختر الرتبة...</option>` + roleHtml;
      }
      if (curVal) sel.value = curVal;
    });

    // تعبئة الحقول المحفوظة
    if (data.settings) {
      Object.entries(data.settings).forEach(([sysKey, sysData]) => {
        if (sysData && typeof sysData === 'object') {
          Object.entries(sysData).forEach(([fieldKey, val]) => {
            const el = document.getElementById(fieldKey);
            if (el) {
              if (el.type === 'checkbox') el.checked = !!val;
              else el.value = val;
            }
          });
        }
      });
    }

    // الردود التلقائية المحفوظة
    renderAutoReplies((data.settings.autoreply && data.settings.autoreply.replies) || []);

    // الأعضاء للبرودكاست
    const mr = await fetch(`${API_URL}/api/guild/${guildId}/members`, { headers: { 'x-session': session } });
    guildMembersCache = await mr.json();
    const memberSel = $('#bcMember');
    if (memberSel) {
      memberSel.innerHTML = `<option value="">اختر الشخص...</option>` +
        guildMembersCache.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }

    toast('✅ تم التحميل بنجاح!');
  } catch (e) {
    toast('⚠️ تعذر جلب تفاصيل السيرفر');
  }
}

// ====== الردود التلقائية: إضافة + حذف ======
let autoReplyRows = [];
function renderAutoReplies(list) {
  autoReplyRows = list.map(r => ({ ...r }));
  const box = $('#autoReplyContainer');
  if (!box) return;
  box.innerHTML = '';
  autoReplyRows.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'ar-row';
    div.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;';
    div.innerHTML = `
      <input class="ar-trigger" value="${(r.trigger || '').replace(/"/g, '&quot;')}" placeholder="الكلمة" style="flex:1;min-width:120px;">
      <input class="ar-response" value="${(r.response || '').replace(/"/g, '&quot;')}" placeholder="الرد" style="flex:2;min-width:160px;">
      <button class="btn ar-del" data-i="${i}" style="padding:6px 12px;">🗑️</button>`;
    box.appendChild(div);
  });
  box.querySelectorAll('.ar-del').forEach(b => b.addEventListener('click', () => {
    autoReplyRows.splice(+b.dataset.i, 1);
    renderAutoReplies(autoReplyRows);
    toast('🗑️ تم حذف الرد — اضغط حفظ لتأكيد الحذف');
  }));
}
const addAutoReplyBtn = $('#addAutoReplyBtn');
if (addAutoReplyBtn) addAutoReplyBtn.addEventListener('click', () => {
  autoReplyRows.push({ trigger: '', response: '' });
  renderAutoReplies(autoReplyRows);
});

// ====== البرودكاست: إظهار اختيار الشخص عند "شخص واحد" ======
const bcTarget = $('#bcTarget');
if (bcTarget) bcTarget.addEventListener('change', () => {
  const memberField = $('#bcMemberField');
  if (memberField) memberField.style.display = bcTarget.value === 'one' ? 'block' : 'none';
});

// ====== الإحصائيات الحية ======
function fmtUptime(s) {
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  return `${d}ي ${h}س ${m}د`;
}
async function refreshStats() {
  try {
    const r = await fetch(`${API_URL}/api/stats`);
    const d = await r.json();
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set('#statPing', `${d.ping}ms`);
    set('#pingVal', `${d.ping}ms`);
    set('#uptime', fmtUptime(d.uptime));
    set('#overviewUptime', fmtUptime(d.uptime));
  } catch {}
}
refreshStats();
setInterval(refreshStats, 10000);

// ====== الحفظ ======
document.querySelectorAll('[data-save]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const session = localStorage.getItem('unibot-session');
    if (!session || !currentGuildId) { toast('⚠️ سجل الدخول واختر سيرفراً أولاً!'); return; }

    const activePage = document.querySelector('.page.on')?.id || 'settings';

    // زر البرودكاست يرسل، مو يحفظ
    if (activePage === 'broadcasts') {
      const type = $('#bcType')?.value || 'embed';
      const target = $('#bcTarget')?.value || 'all';
      const content = $('#bcContent')?.value || '';
      const userId = $('#bcMember')?.value || null;
      if (target === 'one' && !userId) { toast('⚠️ اختر الشخص أولاً!'); return; }
      try {
        const res = await fetch(`${API_URL}/api/broadcast/${currentGuildId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session': session },
          body: JSON.stringify({ type, target, content, userId })
        });
        const result = await res.json();
        if (result.ok) toast(`📢 تم الإرسال إلى ${result.sent} عضو!`);
        else toast('❌ فشل الإرسال');
      } catch { toast('❌ خطأ في الاتصال'); }
      return;
    }

    const payload = {};
    document.querySelectorAll(`#${activePage} input, #${activePage} select, #${activePage} textarea`).forEach(el => {
      if (!el.id) return;
      if (el.id === 'guildSelect') return;
      payload[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });

    // الردود التلقائية: نجمع الصفوف
    if (activePage === 'autoreply') {
      const rows = [];
      $$('#autoReplyContainer .ar-row').forEach(row => {
        const t = row.querySelector('.ar-trigger')?.value.trim();
        const rr = row.querySelector('.ar-response')?.value.trim();
        if (t && rr) rows.push({ trigger: t, response: rr });
      });
      payload.replies = rows;
    }

    try {
      const res = await fetch(`${API_URL}/api/settings/${currentGuildId}/${activePage}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session': session },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.ok) toast('💾 تم الحفظ بنجاح!');
      else toast('❌ فشل الحفظ');
    } catch {
      toast('❌ خطأ في الاتصال');
    }
  });
});

const savedPage = localStorage.getItem('unibot-page');
if (savedPage && $('#' + savedPage)) goTo(savedPage);

handleAuthCallback();
