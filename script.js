'use strict';

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const API_URL = "https://ejhyovem0d.apps.bot-hosting.cloud";
const CLIENT_ID = "1523042577924886749";
const REDIRECT_URI = window.location.origin + window.location.pathname;

let currentGuildId = null;
let currentSession = null;
let guildChannelsCache = [];
let guildRolesCache = [];
let commandsConfigCache = {};

const loginBtn = document.getElementById('discordLoginBtn');

function hideLoaderNow() {
  const l = $('#loader');
  if (!l) return;
  l.classList.add('done');
  l.style.opacity = '0';
  l.style.pointerEvents = 'none';
  l.style.visibility = 'hidden';
  setTimeout(() => {
    if (l && l.parentNode) l.style.display = 'none';
  }, 250);
}

window.addEventListener('load', () => {
  setTimeout(hideLoaderNow, 150);
});
setTimeout(hideLoaderNow, 1200);

// ═══ ترجمة الموقع بالكامل (عربي / إنجليزي) ═══
const SITE_I18N = {
  ar: {
    dir: 'rtl',
    langAttr: 'ar',
    loader: 'جاري تحميل أنظمة UniBot 2030...',
    yourServers: 'سيرفراتك',
    guildHint: 'اختر سيرفر لعرض إعداداته 👆',
    loginBtn: '🔑 تسجيل الدخول بديسكورد',
    inviteBtn: '🎮 أضف البوت لسيرفرك',
    mainTitle: 'لوحة تحكم <em>UniBot</em>',
    footer: 'UniBot © 2030 — جميع الحقوق محفوظة 🐺',
    cap_general: 'عام',
    nav_overview: 'نظرة عامة & المحفظة',
    nav_wallet_logs: 'سجل تحويلات العملة',
    cap_profile: 'إعدادات البروفايل',
    nav_profile_settings: 'الإعدادات العامة (اللغة)',
    cap_server: 'إعدادات السيرفر',
    nav_settings: 'إعدادات السيرفر والبوت',
    nav_public_commands: 'الأوامر العامة',
    nav_mod_commands: 'الإشراف',
    nav_welcome: 'الترحيب & المغادرة',
    nav_autoreply: 'الرد التلقائي',
    nav_autorank: 'الرولات التلقائية',
    nav_embeds: 'رسائل الإيمبد',
    nav_tickets: 'نظام التذاكر',
    nav_levels: 'المستويات & XP',
    nav_present: 'نظام التقديم',
    nav_broadcasts: 'البثوث والبرودكاست',
    nav_protect: 'حماية السيرفر',
    cap_other: 'أخرى',
    nav_about: 'عن UniBot',
    lbl_uptime: 'التشغيل',
    stat_wallet: 'رصيد محفظتك',
    stat_level: 'مستواك الحالي',
    stat_ping: 'تأخير البوت',
    stat_uptime: 'مدة التشغيل',
    wallet_info_title: '💼 معلومات المحفظة',
    wallet_logs_title: '📋 سجل تحويلات العملة (Ly)',
    general_settings_title: '🌐 الإعدادات العامة',
    site_lang_label: 'لغة الموقع (Website Language)',
    site_lang_hint: 'تغيير لغة الموقع يحوّل جميع النصوص والعناصر في لوحة التحكم بالكامل.',
    bot_lang_label: 'لغة البوت (Bot Language)',
    bot_lang_hint: 'لغة البوت تتحكم بكل رسائله في السيرفر المحدد بما في ذلك قائمة المساعدة وشرح الأوامر.',
    server_bot_settings: '⚙️ إعدادات السيرفر والبوت',
    prefix_label: 'بادئة الأوامر (Prefix)',
    public_cmds_title: '🌐 الأوامر العامة',
    public_cmds_desc: 'تحكم في أوامر البوت العامة واضغط "تعديل" على أي أمر لضبط الاختصارات والرومات والرتب وحذف الردود.',
    mod_cmds_title: '🔨 الإشراف',
    mod_cmds_desc: 'تحكم في أوامر المشرفين واضغط "تعديل" على أي أمر لضبط الصلاحيات وحذف الردود التلقائي.',
    welcome_title: '🎉 الترحيب & المغادرة',
    welcome_channel_lbl: 'قناة الترحيب',
    welcome_dest_lbl: 'مكان إرسال رسالة الترحيب',
    welcome_type_lbl: 'شكل رسالة الترحيب',
    welcome_img_lbl: 'رابط صورة الترحيب (اختياري)',
    welcome_msg_lbl: 'نص الرسالة',
    autoreply_title: '🤖 الرد التلقائي',
    autorank_title: '🏆 الرولات التلقائية',
    join_role_lbl: 'رتبة الأعضاء الجدد',
    embeds_title: '💬 رسائل الإيمبد',
    tickets_title: '🎫 نظام التذاكر',
    levels_title: '📈 المستويات & XP',
    present_title: '📝 نظام التقديم',
    broadcasts_title: '📢 البرودكاست والبثوث',
    protect_title: '🛡️ حماية السيرفر المتقدمة'
  },
  en: {
    dir: 'ltr',
    langAttr: 'en',
    loader: 'Loading UniBot 2030 systems...',
    yourServers: 'Your Servers',
    guildHint: 'Select a server to view its settings 👆',
    loginBtn: '🔑 Login with Discord',
    inviteBtn: '🎮 Invite Bot to Server',
    mainTitle: '<em>UniBot</em> Dashboard',
    footer: 'UniBot © 2030 — All Rights Reserved 🐺',
    cap_general: 'General',
    nav_overview: 'Overview & Wallet',
    nav_wallet_logs: 'Currency Logs',
    cap_profile: 'Profile Settings',
    nav_profile_settings: 'General Settings (Language)',
    cap_server: 'Server Settings',
    nav_settings: 'Server & Bot Settings',
    nav_public_commands: 'Public Commands',
    nav_mod_commands: 'Moderation',
    nav_welcome: 'Welcome & Leave',
    nav_autoreply: 'Auto Reply',
    nav_autorank: 'Auto Roles',
    nav_embeds: 'Embed Messages',
    nav_tickets: 'Ticket System',
    nav_levels: 'Levels & XP',
    nav_present: 'Applications',
    nav_broadcasts: 'Broadcasts',
    nav_protect: 'Server Protection',
    cap_other: 'Other',
    nav_about: 'About UniBot',
    lbl_uptime: 'Uptime',
    stat_wallet: 'Your Wallet Balance',
    stat_level: 'Current Level',
    stat_ping: 'Bot Latency',
    stat_uptime: 'Uptime',
    wallet_info_title: '💼 Wallet Information',
    wallet_logs_title: '📋 Currency Transfer Logs (Ly)',
    general_settings_title: '🌐 General Settings',
    site_lang_label: 'Website Language',
    site_lang_hint: 'Switching website language translates all dashboard labels and navigation immediately.',
    bot_lang_label: 'Bot Language',
    bot_lang_hint: 'Bot language controls all bot responses in the selected guild including the help menu and command descriptions.',
    server_bot_settings: '⚙️ Server & Bot Settings',
    prefix_label: 'Command Prefix',
    public_cmds_title: '🌐 Public Commands',
    public_cmds_desc: 'Manage public bot commands and click "Edit" on any command to configure aliases, channels, roles, and auto-delete.',
    mod_cmds_title: '🔨 Moderation',
    mod_cmds_desc: 'Manage moderation commands and click "Edit" on any command to configure permissions and auto-delete replies.',
    welcome_title: '🎉 Welcome & Leave',
    welcome_channel_lbl: 'Welcome Channel',
    welcome_dest_lbl: 'Welcome Message Destination',
    welcome_type_lbl: 'Welcome Message Format',
    welcome_img_lbl: 'Welcome Image URL (Optional)',
    welcome_msg_lbl: 'Welcome Message',
    autoreply_title: '🤖 Auto Reply',
    autorank_title: '🏆 Auto Roles',
    join_role_lbl: 'Join Role',
    embeds_title: '💬 Embed Messages',
    tickets_title: '🎫 Ticket System',
    levels_title: '📈 Levels & XP',
    present_title: '📝 Application System',
    broadcasts_title: '📢 Broadcasts',
    protect_title: '🛡️ Advanced Server Protection'
  }
};

function applyWebsiteLanguage(siteLang) {
  const code = siteLang === 'en' ? 'en' : 'ar';
  const dict = SITE_I18N[code];
  document.documentElement.lang = dict.langAttr;
  document.documentElement.dir = dict.dir;
  document.body.dir = dict.dir;

  if ($('#loaderText')) $('#loaderText').textContent = dict.loader;
  if ($('#yourServersCap')) $('#yourServersCap').textContent = dict.yourServers;
  if ($('#guildHint')) $('#guildHint').textContent = dict.guildHint;
  if (loginBtn && !currentSession) loginBtn.textContent = dict.loginBtn;
  if ($('#inviteBotLink')) $('#inviteBotLink').textContent = dict.inviteBtn;
  if ($('#mainTitle')) $('#mainTitle').innerHTML = dict.mainTitle;
  if ($('#footerText')) $('#footerText').textContent = dict.footer;

  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  const sel = $('#siteLangSelect');
  if (sel) sel.value = code;
  localStorage.setItem('unibot-site-lang', code);
  renderCommandLists();
}

const initialSiteLang = localStorage.getItem('unibot-site-lang') || 'ar';
applyWebsiteLanguage(initialSiteLang);

const siteLangSelect = $('#siteLangSelect');
if (siteLangSelect) {
  siteLangSelect.addEventListener('change', () => {
    applyWebsiteLanguage(siteLangSelect.value);
    toast(siteLangSelect.value === 'en' ? '🌐 Website switched to English' : '🌐 تم تحويل لغة الموقع إلى العربية');
  });
}

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
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    if (currentSession) return;
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

// تحميل البروفايل + السيرفرات
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

    const profileBlock = $('#profileBlock');
    if (profileBlock && data.user) {
      profileBlock.style.display = 'flex';
      const avatarUrl = data.user.avatar
        ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
      $('#userAvatar').src = avatarUrl;
      $('#userName').textContent = data.user.username;
      if (loginBtn) loginBtn.style.display = 'none';
    }

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
          if ($('#guildHint')) $('#guildHint').style.display = 'none';
          toast(`🛡️ تم اختيار: ${g.name}`);
          loadGuildRealData(g.id);
        });
        icons.appendChild(div);
      });
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
    if (['langSelect', 'siteLangSelect', 'bcTarget', 'bcType', 'applyDmNotify', 'ticketType', 'welcomeDestination', 'welcomeMessageType'].includes(sel.id)) return;
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

// ═══ الأوامر العامة والإشراف ولوحة "تعديل" لكل أمر ═══
const PUBLIC_CMDS = [
  { key: 'help', name: 'help', arDesc: 'عرض قائمة المساعدة وشرح جميع أوامر البوت', enDesc: 'Show help menu and command explanations', defaultAliases: ['مساعدة', 'اوامر'] },
  { key: 'server', name: 'server', arDesc: 'عرض معلومات السيرفر والمالك وتاريخ الإنشاء وأكثر عضو دعوات', enDesc: 'Show server info, owner, creation time, and top inviter', defaultAliases: ['سيرفر'] },
  { key: 'balance', name: 'balance', arDesc: 'عرض رصيدك الحالي من عملة Ly', enDesc: 'Check your current Ly balance', defaultAliases: ['رصيدي', 'محفظة'] },
  { key: 'transfer', name: 'transfer', arDesc: 'تحويل رصيد Ly من محفظتك إلى عضو آخر', enDesc: 'Transfer Ly balance to another member', defaultAliases: ['تحويل'] },
  { key: 'ping', name: 'ping', arDesc: 'معرفة سرعة استجابة البوت الحالية', enDesc: 'Check current bot latency', defaultAliases: ['بنق'] }
];

const MOD_CMDS = [
  { key: 'ban', name: 'ban', arDesc: 'حظر عضو من السيرفر أو فك الحظر عنه', enDesc: 'Ban or unban a member from the server', defaultAliases: ['حظر'] },
  { key: 'kick', name: 'kick', arDesc: 'طرد عضو من السيرفر', enDesc: 'Kick a member from the server', defaultAliases: ['طرد'] },
  { key: 'mute', name: 'mute', arDesc: 'إسكات عضو كتابياً أو فك الإسكات عنه', enDesc: 'Mute or unmute a member in text channels', defaultAliases: ['ميوت'] },
  { key: 'timeout', name: 'timeout', arDesc: 'إعطاء تايم أوت مؤقت لعضو أو إزالته', enDesc: 'Timeout or remove timeout for a member', defaultAliases: ['تايم'] },
  { key: 'clear', name: 'clear', arDesc: 'حذف عدد من الرسائل في الروم', enDesc: 'Bulk delete messages in a channel', defaultAliases: ['مسح'] },
  { key: 'lock', name: 'lock', arDesc: 'قفل روم كتابي مؤقتاً', enDesc: 'Lock a text channel', defaultAliases: ['قفل'] },
  { key: 'role', name: 'role', arDesc: 'إضافة أو إزالة رتبة لعضو', enDesc: 'Add or remove a role from a member', defaultAliases: ['رتبة'] }
];

let expandedCmdKey = null;

function getCmdRuleState(cmdDef) {
  const saved = commandsConfigCache[cmdDef.key] || {};
  return {
    enabled: saved.enabled !== undefined ? !!saved.enabled : true,
    aliases: Array.isArray(saved.aliases) ? saved.aliases : [...cmdDef.defaultAliases],
    enabledRoles: Array.isArray(saved.enabledRoles) ? saved.enabledRoles : [],
    disabledRoles: Array.isArray(saved.disabledRoles) ? saved.disabledRoles : [],
    enabledChannels: Array.isArray(saved.enabledChannels) ? saved.enabledChannels : [],
    disabledChannels: Array.isArray(saved.disabledChannels) ? saved.disabledChannels : [],
    deleteReplyOnUserDelete: saved.deleteReplyOnUserDelete !== undefined ? !!saved.deleteReplyOnUserDelete : true,
    autoDeleteReplyAfter5s: !!saved.autoDeleteReplyAfter5s
  };
}

function renderSingleCommandGroup(containerId, list) {
  const container = $(containerId);
  if (!container) return;
  const siteLang = localStorage.getItem('unibot-site-lang') || 'ar';
  const editLabel = siteLang === 'en' ? 'Edit' : 'تعديل';
  const saveLabel = siteLang === 'en' ? 'Save Changes' : 'حفظ التغييرات';
  const cancelLabel = siteLang === 'en' ? 'Cancel' : 'إلغاء';

  container.innerHTML = '';

  list.forEach(cmdDef => {
    const rule = getCmdRuleState(cmdDef);
    const isOpen = expandedCmdKey === cmdDef.key;
    const desc = siteLang === 'en' ? cmdDef.enDesc : cmdDef.arDesc;

    const itemWrap = document.createElement('div');
    itemWrap.className = 'card';
    itemWrap.style.cssText = 'background:var(--panel2); margin-bottom:10px; padding:14px;';

    const roleOptionsHtml = (rid) =>
      `<option value="">—</option>` +
      guildRolesCache.map(r => `<option value="${r.id}" ${rid === r.id ? 'selected' : ''}>@${r.name}</option>`).join('');

    const chanOptionsHtml = (cid) =>
      `<option value="">—</option>` +
      guildChannelsCache.filter(c => !c.name.startsWith('📁')).map(c => `<option value="${c.id}" ${cid === c.id ? 'selected' : ''}>${c.name}</option>`).join('');

    itemWrap.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
        <div>
          <b style="font-size:1em;">${cmdDef.name}/</b>
          <p style="color:var(--mut); font-size:.82em; margin-top:3px;">${desc}</p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <button type="button" class="btn ghost cmd-edit-btn" data-cmd="${cmdDef.key}" style="padding:6px 14px; font-size:.82em;">${editLabel}</button>
          <label class="switch">
            <input type="checkbox" class="cmd-toggle-input" data-cmd="${cmdDef.key}" ${rule.enabled ? 'checked' : ''}>
            <i></i>
          </label>
        </div>
      </div>

      ${isOpen ? `
        <div class="cmd-editor-panel" style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border);">
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:12px;">
            <div class="field">
              <label>الاختصارات (مفصولة بفاصلة)</label>
              <input type="text" class="cmd-aliases-inp" value="${rule.aliases.join(', ')}" placeholder="مثال: مساعدة, اوامر">
            </div>
            <div class="field">
              <label>الرتب المفعّلة</label>
              <select class="cmd-en-role">${roleOptionsHtml(rule.enabledRoles[0] || '')}</select>
            </div>
            <div class="field">
              <label>الرتب المعطّلة</label>
              <select class="cmd-dis-role">${roleOptionsHtml(rule.disabledRoles[0] || '')}</select>
            </div>
            <div class="field">
              <label>الرومات المفعّلة</label>
              <select class="cmd-en-chan">${chanOptionsHtml(rule.enabledChannels[0] || '')}</select>
            </div>
            <div class="field">
              <label>الرومات المعطّلة</label>
              <select class="cmd-dis-chan">${chanOptionsHtml(rule.disabledChannels[0] || '')}</select>
            </div>
          </div>

          <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
              <span style="font-size:.85em;">حذف رد البوت تلقائياً عندما يتم حذف رسالة العضو</span>
              <label class="switch">
                <input type="checkbox" class="cmd-del-on-user-del" ${rule.deleteReplyOnUserDelete ? 'checked' : ''}>
                <i></i>
              </label>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
              <span style="font-size:.85em;">مسح تلقائي لرسالة الرد من البوت بعد 5 ثواني</span>
              <label class="switch">
                <input type="checkbox" class="cmd-del-5s" ${rule.autoDeleteReplyAfter5s ? 'checked' : ''}>
                <i></i>
              </label>
            </div>
          </div>

          <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
            <button type="button" class="btn cmd-save-single-btn" data-cmd="${cmdDef.key}" style="padding:8px 16px;">💾 ${saveLabel}</button>
            <button type="button" class="btn ghost cmd-cancel-single-btn" style="padding:8px 14px;">${cancelLabel}</button>
          </div>
        </div>
      ` : ''}
    `;

    container.appendChild(itemWrap);
  });

  container.querySelectorAll('.cmd-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.cmd;
      expandedCmdKey = expandedCmdKey === key ? null : key;
      renderCommandLists();
    });
  });

  container.querySelectorAll('.cmd-toggle-input').forEach(chk => {
    chk.addEventListener('change', async () => {
      const key = chk.dataset.cmd;
      const prev = getCmdRuleState({ key, defaultAliases: [] });
      commandsConfigCache[key] = { ...prev, enabled: chk.checked };
      await persistSingleCommandRule(key);
    });
  });

  container.querySelectorAll('.cmd-cancel-single-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      expandedCmdKey = null;
      renderCommandLists();
    });
  });

  container.querySelectorAll('.cmd-save-single-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.cmd;
      const panel = btn.closest('.cmd-editor-panel');
      if (!panel) return;
      const aliasesRaw = panel.querySelector('.cmd-aliases-inp')?.value || '';
      const aliases = aliasesRaw.split(',').map(s => s.trim()).filter(Boolean);
      const enRole = panel.querySelector('.cmd-en-role')?.value || '';
      const disRole = panel.querySelector('.cmd-dis-role')?.value || '';
      const enChan = panel.querySelector('.cmd-en-chan')?.value || '';
      const disChan = panel.querySelector('.cmd-dis-chan')?.value || '';
      const delOnUserDel = !!panel.querySelector('.cmd-del-on-user-del')?.checked;
      const del5s = !!panel.querySelector('.cmd-del-5s')?.checked;

      const prev = getCmdRuleState({ key, defaultAliases: [] });
      commandsConfigCache[key] = {
        ...prev,
        aliases,
        enabledRoles: enRole ? [enRole] : [],
        disabledRoles: disRole ? [disRole] : [],
        enabledChannels: enChan ? [enChan] : [],
        disabledChannels: disChan ? [disChan] : [],
        deleteReplyOnUserDelete: delOnUserDel,
        autoDeleteReplyAfter5s: del5s
      };

      await persistSingleCommandRule(key);
      expandedCmdKey = null;
      renderCommandLists();
    });
  });
}

async function persistSingleCommandRule(cmdKey) {
  if (!currentSession || !currentGuildId) {
    toast('⚠️ سجل الدخول واختر سيرفراً أولاً!');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/settings/${currentGuildId}/commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-session': currentSession },
      body: JSON.stringify({ [cmdKey]: commandsConfigCache[cmdKey] })
    });
    const result = await res.json();
    if (result.ok) toast('💾 تم حفظ إعدادات الأمر!');
    else toast('❌ فشل الحفظ');
  } catch {
    toast('❌ خطأ في الاتصال');
  }
}

function renderCommandLists() {
  renderSingleCommandGroup('#publicCommandsList', PUBLIC_CMDS);
  renderSingleCommandGroup('#modCommandsList', MOD_CMDS);
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

// ═══ أسئلة التقديم ═══
let applyQuestionsList = ['اسمك وعمرك؟', 'كم ساعات تفاعلك؟', 'لماذا تريد الانضمام؟'];

function renderApplyQuestions(list) {
  applyQuestionsList = (Array.isArray(list) ? list : [])
    .map(item => typeof item === 'string' ? item : (item?.label || item?.question || ''))
    .slice(0, 5);
  if (!applyQuestionsList.length) applyQuestionsList = [''];

  const box = $('#applyQuestionsContainer');
  if (!box) return;
  box.innerHTML = '';

  applyQuestionsList.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'ar-row';
    row.innerHTML = `
      <input type="text" class="apply-q-input" value="${String(q).replace(/"/g, '&quot;')}" placeholder="اكتب السؤال رقم ${i + 1}..." style="flex:1;min-width:160px;">
      <button type="button" class="btn ghost ar-del apply-q-del" data-qi="${i}" title="حذف السؤال">🗑️</button>
    `;
    box.appendChild(row);
  });

  box.querySelectorAll('.apply-q-input').forEach((inp, idx) => {
    inp.addEventListener('input', () => {
      applyQuestionsList[idx] = inp.value;
    });
  });

  box.querySelectorAll('.apply-q-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.dataset.qi;
      if (applyQuestionsList.length <= 1) {
        applyQuestionsList = [''];
      } else {
        applyQuestionsList.splice(idx, 1);
      }
      renderApplyQuestions(applyQuestionsList);
    });
  });
}

const addApplyQuestionBtn = $('#addApplyQuestionBtn');
if (addApplyQuestionBtn) {
  addApplyQuestionBtn.addEventListener('click', () => {
    syncApplyQuestionsFromInputs();
    if (applyQuestionsList.length >= 5) {
      toast('⚠️ الحد الأقصى لأسئلة النموذج في ديسكورد هو 5 أسئلة');
      return;
    }
    applyQuestionsList.push('');
    renderApplyQuestions(applyQuestionsList);
  });
}

function syncApplyQuestionsFromInputs() {
  const inputs = $$('#applyQuestionsContainer .apply-q-input');
  applyQuestionsList = inputs
    .map(i => i.value.trim())
    .filter(Boolean)
    .slice(0, 5);
  return applyQuestionsList;
}

renderApplyQuestions(applyQuestionsList);

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

  guildChannelsCache = data.channels || [];
  guildRolesCache = data.roles || [];

  const chanHtml = guildChannelsCache.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const roleHtml = guildRolesCache.map(rr => `<option value="${rr.id}">@${rr.name}</option>`).join('');
  populateSelects(chanHtml, roleHtml);

  if (data.settings) {
    Object.entries(data.settings).forEach(([sysKey, sysData]) => {
      if (sysData && typeof sysData === 'object') {
        Object.entries(sysData).forEach(([fieldKey, val]) => {
          const el = document.getElementById(fieldKey);
          if (el) {
            if (el.type === 'checkbox') el.checked = !!val;
            else if (val !== undefined && val !== null) el.value = val;
          }
        });
      }
    });

    const dmSel = $('#applyDmNotify');
    if (dmSel && data.settings.present) dmSel.value = data.settings.present.applyDmNotify || 'off';

    const presentCfg = data.settings.present || {};
    if (Array.isArray(presentCfg.applyQuestions) && presentCfg.applyQuestions.length) {
      renderApplyQuestions(presentCfg.applyQuestions);
    } else {
      renderApplyQuestions(['اسمك وعمرك؟', 'كم ساعات تفاعلك؟', 'لماذا تريد الانضمام؟']);
    }

    if ($('#applyImageUrl')) {
      const savedUrl = presentCfg.applyImageUrl || presentCfg.applyImage || '';
      $('#applyImageUrl').value = savedUrl.startsWith('data:image/') ? '' : savedUrl;
    }

    const ticketCfg = data.settings.tickets || {};
    if ($('#ticketEmbedImage')) $('#ticketEmbedImage').value = ticketCfg.ticketEmbedImage || '';
    if ($('#ticketWelcomeImage')) $('#ticketWelcomeImage').value = ticketCfg.ticketWelcomeImage || '';

    const welcomeCfg = data.settings.welcome || {};
    if ($('#welcomeDestination')) $('#welcomeDestination').value = welcomeCfg.welcomeDestination || 'channel';
    if ($('#welcomeMessageType')) $('#welcomeMessageType').value = welcomeCfg.welcomeMessageType || 'normal';
    if ($('#welcomeImage')) $('#welcomeImage').value = welcomeCfg.welcomeImage || '';

    commandsConfigCache = data.settings.commands || {};
  }

  renderCommandLists();
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

    if (activePage === 'present') {
      payload.applyQuestions = syncApplyQuestionsFromInputs();
      payload.applyImageUrl = ($('#applyImageUrl')?.value || '').trim();
      payload.applyImage = payload.applyImageUrl;
    }

    if (activePage === 'tickets') {
      payload.ticketEmbedImage = ($('#ticketEmbedImage')?.value || '').trim();
      payload.ticketWelcomeImage = ($('#ticketWelcomeImage')?.value || '').trim();
    }

    if (activePage === 'welcome') {
      payload.welcomeImage = ($('#welcomeImage')?.value || '').trim();
      payload.welcomeDestination = $('#welcomeDestination')?.value || 'channel';
      payload.welcomeMessageType = $('#welcomeMessageType')?.value || 'normal';
    }

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
  const chosenSiteLang = $('#siteLangSelect')?.value || 'ar';
  applyWebsiteLanguage(chosenSiteLang);

  if (!currentSession || !currentGuildId) {
    toast('🌐 تم حفظ لغة الموقع (اختر سيرفراً لحفظ لغة البوت)');
    return;
  }
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
    if (result.ok) toast('🌐 تم حفظ لغة الموقع واللغة الخاصة بالبوت!');
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
