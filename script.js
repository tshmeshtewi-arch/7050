/* ============================================================
   ربط لوحة التحكم بالسيرفر الحقيقي (LIVE API INTEGRATION)
============================================================ */
const API_URL = "https://ejhyovem0d.apps.bot-hosting.cloud";
const CLIENT_ID = "1523042577924886749"; // معرف بوتك من الصورة
const REDIRECT_URI = window.location.origin + window.location.pathname;

let currentGuildId = localStorage.getItem('unibot-selected-guild') || null;

// 1. جلب الإحصائيات الحية للبوت (البنق، السيرفرات، الأبتايم)
async function loadLiveStats() {
  try {
    const res = await fetch(`${API_URL}/api/stats`);
    const data = await res.json();
    
    // تحديث عدد السيرفرات
    const srvEl = document.querySelector('.stat-card.v .s-num');
    if (srvEl && data.servers !== undefined) srvEl.textContent = data.servers;

    // تحديث البنق في البطاقة والشريط الجانبي
    const pingEl = document.querySelector('.stat-card.b .s-num');
    if (pingEl && data.ping !== undefined) pingEl.innerHTML = `${data.ping}<small>ms</small>`;
    const pillEl = document.querySelector('.status-pill');
    if (pillEl) pillEl.innerHTML = `<i class="dot"></i> ${data.ping}ms`;

    // تحديث مدة التشغيل الحقيقية
    if (data.uptime && upEl) {
      const d = Math.floor(data.uptime / 86400);
      const h = Math.floor((data.uptime % 86400) / 3600);
      const m = Math.floor((data.uptime % 3600) / 60);
      upEl.textContent = `${d}ي ${h}س ${m}د`;
    }
  } catch (e) {
    console.warn("تعذر جلب إحصائيات البوت:", e);
  }
}
loadLiveStats();
setInterval(loadLiveStats, 15000);

// 2. نظام تسجيل الدخول OAuth2
const loginBtn = document.getElementById('discordLoginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    window.location.href = authUrl;
  });
}

// استقبال الكود بعد العودة من ديسكورد
async function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    window.history.replaceState({}, document.title, REDIRECT_URI); // تنظيف الرابط
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
        toast('❌ فشل تسجيل الدخول، تأكد من رابط Redirect في ديسكورد');
      }
    } catch (e) {
      toast('❌ خطأ في الاتصال بسيرفر البوت');
    }
  } else if (localStorage.getItem('unibot-session')) {
    loadUserGuilds();
  }
}

// 3. جلب السيرفرات الحقيقية للمستخدم
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
    
    if (loginBtn && data.user) {
      loginBtn.textContent = `👤 ${data.user.username} (تسجيل خروج)`;
      loginBtn.onclick = () => {
        localStorage.removeItem('unibot-session');
        location.reload();
      };
    }

    const box = document.getElementById('guildSelectorBox');
    const select = document.getElementById('guildSelect');
    if (box && select && data.guilds) {
      box.style.display = 'block';
      select.innerHTML = data.guilds.length 
        ? data.guilds.map(g => `<option value="${g.id}">${g.name}</option>`).join('')
        : '<option value="">البوت غير موجود في سيرفراتك</option>';

      if (currentGuildId && data.guilds.some(g => g.id === currentGuildId)) {
        select.value = currentGuildId;
      } else if (data.guilds.length > 0) {
        currentGuildId = data.guilds[0].id;
        localStorage.setItem('unibot-selected-guild', currentGuildId);
      }

      select.addEventListener('change', () => {
        currentGuildId = select.value;
        localStorage.setItem('unibot-selected-guild', currentGuildId);
        loadGuildRealData(currentGuildId);
      });

      if (currentGuildId) loadGuildRealData(currentGuildId);
    }
  } catch (e) {
    console.error(e);
  }
}

// 4. تعبئة الرومات والرتب الحقيقية للسيرفر المختار
async function loadGuildRealData(guildId) {
  const session = localStorage.getItem('unibot-session');
  if (!session || !guildId) return;

  toast('🔄 جاري جلب بيانات السيرفر...');
  try {
    const r = await fetch(`${API_URL}/api/guild/${guildId}/data`, {
      headers: { 'x-session': session }
    });
    const data = await r.json();

    // تعبئة جميع قوائم الرومات الحقيقية
    const chanHtml = data.channels.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    document.querySelectorAll('#globalAlert, [data-k="alerts"], #welcome select, #levels select, #present select, #tickets select, #notify select, #gives select').forEach(sel => {
      if (sel.options.length > 0 && sel.options[0].text.startsWith('#')) {
        sel.innerHTML = chanHtml;
      }
    });

    // تعبئة جميع قوائم الرتب الحقيقية
    const roleHtml = data.roles.map(r => `<option value="${r.id}">@${r.name}</option>`).join('');
    document.querySelectorAll('#globalRoles, [data-k="roles"], #joinRole').forEach(sel => {
      sel.innerHTML = roleHtml;
    });

    toast('✅ تم تحميل بيانات السيرفر الحقيقية!');
  } catch (e) {
    toast('⚠️ تعذر جلب تفاصيل السيرفر');
  }
}

// 5. ربط أزرار الحفظ بالسيرفر الحقيقي
document.querySelectorAll('[data-save]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const session = localStorage.getItem('unibot-session');
    if (!session || !currentGuildId) {
      toast('⚠️ سجل الدخول واختر سيرفراً أولاً!');
      return;
    }

    // تحديد القسم الحالي
    const activePage = document.querySelector('.page.on')?.id || 'system';
    const systemMap = { protect: 'protection', tickets: 'tickets' };
    const targetSystem = systemMap[activePage] || 'system';

    // تجميع البيانات من الصفحة الحالية
    const payload = { updatedAt: Date.now() };
    document.querySelectorAll(`#${activePage} input, #${activePage} select, #${activePage} textarea`).forEach((el, idx) => {
      const key = el.id || el.dataset.k || `field_${idx}`;
      payload[key] = el.type === 'checkbox' ? el.checked : el.value;
    });

    try {
      const res = await fetch(`${API_URL}/api/settings/${currentGuildId}/${targetSystem}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': session
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.ok) toast('💾 تم الحفظ في قاعدة بيانات البوت بنجاح!');
      else toast('❌ فشل الحفظ: ' + (result.error || 'خطأ غير معروف'));
    } catch {
      toast('❌ تعذر الاتصال بالبوت');
    }
  });
});

handleAuthCallback();
