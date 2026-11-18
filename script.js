'use strict';

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const API_URL = "https://ejhyovem0d.apps.bot-hosting.cloud";
const CLIENT_ID = "1523042577924886749";
const REDIRECT_URI = window.location.origin + window.location.pathname;

let currentGuildId = null;
let currentSession = null;
let guildMembersCache = [];

window.addEventListener('load', () => {
  const l = $('#loader');
  if (l) setTimeout(() => l.classList.add('done'), 200);
});

function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// القائمة الجانبية
const burger = $('#burger'), overlay = $('#overlay');
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

function tickClock() {
  const c = $('#clock');
  if (c) c.textContent = new Date().toLocaleTimeString('en-GB');
}
tickClock();
setInterval(tickClock, 1000);

// تسجيل الدخول
const loginBtn = document.getElementById('discordLoginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    if (currentSession) return; // البروفايل يتكفل بالخروج
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  });
}
const logoutBtn = $('#logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  location.reload();
});

// كود OAuth
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
        currentSession = data.token;
        localStorage.setItem('unibot-session', data.token);
        toast(`✅ أهلاً بك ${data.user.username}!`);
        loadUserGuilds();
      } else toast('❌ فشل تسجيل الدخول');
    } catch { toast('❌ خطأ في الاتصال بالبوت'); }
  } else {
    currentSession = localStorage.getItem('unibot-session');
    if (currentSession) loadUserGuilds();
  }
}

// تحميل البروفايل + السيرفرات (تصميم ProBot)
async function loadUserGuilds() {
  if (!currentSession) return;
  try {
    const r = await fetch(`${API_URL}/api/my-guilds`, { headers: { 'x-session': currentSession } });
    if (r.status === 401) {
      currentSession = null;
      localStorage.removeItem('unibot-session');
      return;
    }
    const data = await r.json();

    // البروفايل فوق
    const profileBlock = $('#profileBlock');
    if (profileBlock && data.user) {
      profileBlock.style.display = 'flex';
      const avatarUrl = data.user.avatar
        ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
      $('#userAvatar').src = avatarUrl;
      $('#userName').textContent = data.user.username;
      loginBtn.style.display = 'none';
    }

    // سيرفرات بالجانب
    const guildsBlock = $('#guildsBlock');
    const icons = $('#guildIcons');
    if (guildsBlock && icons && data.guilds) {
      guildsBlock.style.display = 'block';
      icons.innerHTML = '';
      data.guilds.forEach(g => {
        const div = document.createElement('div');
        div.className = 'guild-icon';
        div.title = g.name;
        div.dataset.gid = g.id;
        if (g.icon) {
          div.innerHTML = `<img src="${g.icon}" alt="${g.name}">`;
        } else {
          div.innerHTML = `<span>${g.name.slice(0, 2)}</span>`;
        }
        div.addEventListener('click', () => {
          $$('.guild-icon').forEach(x => x.classList.remove('selected'));
          div.classList.add('selected');
          currentGuildId = g.id;
          localStorage.setItem('unibot-selected-guild', g.id);
          $('#guildHint').style.display = 'none';
          toast(`🛡️ تم اختيار: ${g.name}`);
          loadGuildRealData(g.id);
        });
        icons.appendChild(div);
      });
      // استعادة السيرفر المحفوظ
      const saved = localStorage.getItem('unibot-selected-guild');
      const savedIcon = icons.querySelector(`[data-gid="${saved}"]`);
      if (savedIcon) savedIcon.click();
    }
  } catch {}
}

// تتبّع القائمة المنسدلة المفتوحة
let activeSelectElement = null;
document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'SELECT') activeSelectElement = e.target;
});
document.addEventListener('focusout', (e) => {
  if (e.target.tagName === 'SELECT') {
    setTimeout(() => {
      if (document.activeElement?.tagName !== 'SELECT') activeSelectElement = null;
    }, 200);
  }
});

function populateSelects(chanHtml, roleHtml) {
  $$('select').forEach(sel => {
    if (sel === activeSelectElement || sel === document.activeElement) return;
    if (sel.id === 'langSelect' || sel.id === 'bcTarget' || sel.id === 'bcType' || sel.id === 'applyDmNotify' || sel.id === 'ticketType') return;
    const isChan = /channel|room|category|receive|result/i.test(sel.id);
    const isRole = /role/i.test(sel.id);
    if (!isChan && !isRole) return;
    const html = isChan
      ? `<option value="">اختر القناة...</option>` + chanHtml
      : `<option value="">اختر الرتبة...</option>` + roleHtml;
    if (sel.innerHTML === html) return;
    const cur = sel.value;
    sel.innerHTML = html;
    if (cur && [...sel.options].some(o => o.value === cur)) sel.value = cur;
  });
}

// سجل التحويلات الحقيقي
function renderWalletLogs(logs) {
  const box = $('#walletLogsList');
  if (!box) return;
  if (!logs || !logs.length) {
    box.innerHTML = '<p style="color:var(--mut);">لا توجد تحويلات سابقة.</p>';
    return;
  }
  box.innerHTML = logs.map(l => {
    const d = new Date(l.at).toLocaleString('ar');
    const icon = l.type === 'add' ? '➕' : l.type === 'take' ? '➖' : '💸';
    const from = l.from === 'SYSTEM' ? 'النظام' : `<@${l.from}>`;
    const to = l.to === 'SYSTEM' ? 'النظام' : `<@${l.to}>`;
    return `<div class="log-row" style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid var(--border);font-size:.85em;">
      <span>${icon} ${from} → ${to}</span>
      <span style="color:var(--primary);font-weight:bold;">${l.amount} Ly</span>
      <span style="color:var(--mut);">${d}</span>
    </div>`;
  }).join('');
}

// بيانات السيرفر
async function loadGuildRealData(guildId) {
  if (!currentSession || !guildId) return;
  toast('🔄 جاري تحميل بيانات السيرفر...');
  const opts = { headers: { 'x-session': currentSession } };
  const [dataRes, membersRes] = await Promise.allSettled([
    fetch(`${API_URL}/api/guild/${guildId}/data`, opts),
    fetch(`${API_URL}/api/guild/${guildId}/members`, opts)
  ]);

  if (dataRes.status !== 'fulfilled' || !dataRes.value.ok) {
    toast('⚠️ تعذر جلب البيانات');
    return;
  }
  const data = await dataRes.value.json();

  if (data.wallet) {
    const el = $('#userWalletLy');
    if (el) el.textContent = `${data.wallet.balance} Ly`;
    renderWalletLogs(data.wallet.logs);
  }

  const chanHtml = data.channels.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const roleHtml = data.roles.map(rr => `<option value="${rr.id}">@${rr.name}</option>`).join('');
  populateSelects(chanHtml, roleHtml);

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
    const dmSel = $('#applyDmNotify');
    if (dmSel && data.settings.present) dmSel.value = data.settings.present.applyDmNotify || 'off';
  }

  renderEmbedsList((data.settings.embeds && data.settings.embeds.list) || []);
  renderAutoReplies((data.settings.autoreply && data.settings.autoreply.replies) || []);

  if (membersRes.status === 'fulfilled' && membersRes.value.ok) {
    try {
      const members = await membersRes.value.json();
      const memberSel = $('#bcMember');
      if (memberSel && Array.isArray(members)) {
        memberSel.innerHTML = `<option value="">اختر الشخص...</option>` +
          members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
      }
    } catch {}
  }
  toast('✅ تم التحميل بنجاح!');
}

// ═══ الإيمبدات المتعددة ═══
let embedsList = [];

function renderEmbedsList(list) {
  embedsList = list.map(e => ({ ...e }));
  const box = $('#embedsList');
  if (!box) return;
  box.innerHTML = embedsList.length
    ? `<p style="color:var(--mut);font-size:.8em;margin-top:10px;">الإيمبدات المحفوظة (${embedsList.length}):</p>` +
      embedsList.map((e, i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border:1px solid var(--border);border-radius:10px;margin-top:6px;">
        <span>💬 <b>${(e.title || 'بدون عنوان').slice(0, 30)}</b></span>
        <button class="btn ar-del" data-ei="${i}" title="حذف" style="padding:4px 10px;">🗑️</button>
      </div>`).join('')
    : '';
  box.querySelectorAll('.ar-del').forEach(b => b.addEventListener('click', () => {
    embedsList.splice(+b.dataset.ei, 1);
    renderEmbedsList(embedsList);
    toast('🗑️ تم حذف الإيمبد — اضغط حفظ لتأكيد');
  }));
}

const addNewEmbedBtn = $('#addNewEmbedBtn');
if (addNewEmbedBtn) addNewEmbedBtn.addEventListener('click', () => {
  const cur = {
    title: $('#embedTitle')?.value || '',
    desc: $('#embedDesc')?.value || '',
    color: $('#embedColor')?.value || '#ef4444',
    channel: $('#embedChannel')?.value || ''
  };
  if (cur.title || cur.desc) {
    embedsList.push(cur);
    toast('💾 تم حفظ الإيمبد الحالي — الآن اكتب الإيمبد الجديد');
  }
  if ($('#embedTitle')) $('#embedTitle').value = '';
  if ($('#embedDesc')) $('#embedDesc').value = '';
  renderEmbedsList(embedsList);
});

const sendEmbedBtn = $('#sendEmbedBtn');
if (sendEmbedBtn) sendEmbedBtn.addEventListener('click', async () => {
  if (!currentSession || !currentGuildId) { toast('⚠️ سجل الدخول واختر سيرفراً!'); return; }
  const channelId = $('#embedChannel')?.value;
  if (!channelId) { toast('⚠️ اختر الشات أولاً!'); return; }
  try {
    const res = await fetch(`${API_URL}/api/embed-send/${currentGuildId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
      body: JSON.stringify({
        channelId,
        title: $('#embedTitle')?.value,
        description: $('#embedDesc')?.value,
        color: $('#embedColor')?.value
      })
    });
    const result = await res.json();
    if (result.ok) toast('📤 تم إرسال الإيمبد للشات!');
    else toast('❌ فشل الإرسال');
  } catch { toast('❌ خطأ في الاتصال'); }
});

// ═══ الردود التلقائية ═══
let autoReplyRows = [];
function renderAutoReplies(list) {
  autoReplyRows = list.map(r => ({ ...r }));
  const box = $('#autoReplyContainer');
  if (!box) return;
  box.innerHTML = '';
  autoReplyRows.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'ar-row';
    div.innerHTML = `
      <input class="ar-trigger" value="${(r.trigger || '').replace(/"/g, '&quot;')}" placeholder="الكلمة أو الجملة" style="flex:1;min-width:120px;">
      <input class="ar-response" value="${(r.response || '').replace(/"/g, '&quot;')}" placeholder="الرد التلقائي" style="flex:2;min-width:160px;">
      <button class="btn ar-del" data-i="${i}" title="حذف الرد">🗑️</button>`;
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

// ═══ البرودكاست ═══
const bcTarget = $('#bcTarget');
if (bcTarget) bcTarget.addEventListener('change', () => {
  const f = $('#bcMemberField');
  if (f) f.style.display = bcTarget.value === 'one' ? 'block' : 'none';
});

// ═══ الإحصائيات ═══
function fmtUptime(s) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
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

// ═══ الحفظ ═══
document.querySelectorAll('[data-save]').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!currentSession || !currentGuildId) { toast('⚠️ سجل الدخول واختر سيرفراً أولاً!'); return; }

    const activePage = document.querySelector('.page.on')?.id || 'settings';

    if (activePage === 'broadcasts') {
      const type = $('#bcType')?.value || 'embed';
      const target = $('#bcTarget')?.value || 'all';
      const content = $('#bcContent')?.value || '';
      const userId = $('#bcMember')?.value || null;
      if (target === 'one' && !userId) { toast('⚠️ اختر الشخص أولاً!'); return; }
      if (!content.trim()) { toast('⚠️ اكتب محتوى الرسالة!'); return; }
      try {
        const res = await fetch(`${API_URL}/api/broadcast/${currentGuildId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
          body: JSON.stringify({ type, target, content, userId })
        });
        const result = await res.json();
        if (result.ok) toast(`📢 تم الإرسال إلى ${result.sent} عضو!`);
        else toast('❌ فشل الإرسال');
      } catch { toast('❌ خطأ في الاتصال'); }
      return;
    }

    if (activePage === 'embeds') {
      const cur = {
        title: $('#embedTitle')?.value || '',
        desc: $('#embedDesc')?.value || '',
        color: $('#embedColor')?.value || '#ef4444',
        channel: $('#embedChannel')?.value || ''
      };
      if ((cur.title || cur.desc) && !embedsList.some(e => e.title === cur.title && e.desc === cur.desc)) {
        embedsList.push(cur);
      }
      try {
        const res = await fetch(`${API_URL}/api/settings/${currentGuildId}/embeds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
          body: JSON.stringify({ list: embedsList })
        });
        const result = await res.json();
        if (result.ok) { toast('💾 تم حفظ الإيمبدات!'); renderEmbedsList(embedsList); }
        else toast('❌ فشل الحفظ');
      } catch { toast('❌ خطأ في الاتصال'); }
      return;
    }

    const payload = {};
    document.querySelectorAll(`#${activePage} input, #${activePage} select, #${activePage} textarea`).forEach(el => {
      if (!el.id) return;
      payload[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });

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
        headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.ok) toast('💾 تم الحفظ بنجاح!');
      else toast('❌ فشل الحفظ');
    } catch { toast('❌ خطأ في الاتصال'); }
  });
});

const saveLangBtn = $('#saveLangBtn');
if (saveLangBtn) saveLangBtn.addEventListener('click', async () => {
  if (!currentSession || !currentGuildId) { toast('⚠️ اختر سيرفراً أولاً — اللغة تُحفظ لكل سيرفر'); return; }
  try {
    const r = await fetch(`${API_URL}/api/guild/${currentGuildId}/data`, { headers: { 'x-session': currentSession } });
    const data = await r.json();
    const settings = { ...(data.settings?.settings || {}), lang: $('#langSelect')?.value || 'ar' };
    const res = await fetch(`${API_URL}/api/settings/${currentGuildId}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
      body: JSON.stringify(settings)
    });
    const result = await res.json();
    if (result.ok) toast('🌐 تم حفظ لغة البوت!');
    else toast('❌ فشل الحفظ');
  } catch { toast('❌ خطأ في الاتصال'); }
});

const sendTicketPanelBtn = $('#sendTicketPanelBtn');
if (sendTicketPanelBtn) sendTicketPanelBtn.addEventListener('click', async () => {
  if (!currentSession || !currentGuildId) { toast('⚠️ سجل الدخول واختر سيرفراً!'); return; }
  try {
    const res = await fetch(`${API_URL}/api/ticket-panel/${currentGuildId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
      body: '{}'
    });
    const result = await res.json();
    if (result.ok) toast('📨 تم إرسال بانل التذاكر!');
    else toast('❌ حدد شات البانل واحفظ أولاً');
  } catch { toast('❌ خطأ في الاتصال'); }
});

const sendApplyPanelBtn = $('#sendApplyPanelBtn');
if (sendApplyPanelBtn) sendApplyPanelBtn.addEventListener('click', async () => {
  if (!currentSession || !currentGuildId) { toast('⚠️ سجل الدخول واختر سيرفراً!'); return; }
  try {
    const res = await fetch(`${API_URL}/api/apply-panel/${currentGuildId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
      body: '{}'
    });
    const result = await res.json();
    if (result.ok) toast('📨 تم إرسال بانل التقديم!');
    else toast('❌ حدد شات البانل واحفظ أولاً');
  } catch { toast('❌ خطأ في الاتصال'); }
});

// ═══ استعادة الصفحة + بدء التشغيل ═══
$('#profileBlock')?.addEventListener('click', (e) => {
  if (e.target.id !== 'logoutBtn') goTo('profile-settings');
});

const savedPage = localStorage.getItem('unibot-page');
if (savedPage && $('#' + savedPage)) goTo(savedPage);

handleAuthCallback();
