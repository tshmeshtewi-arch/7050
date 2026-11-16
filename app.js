(() => {
  "use strict";

  // ===== الإعدادات =====
  // ضع هنا رابط API الخاص بالبوت (يجب أن يبدأ بـ https://). اتركه فارغاً للوضع التجريبي.
  // لا تضع أبداً توكن البوت أو أي مفتاح سري في هذا الملف: أي شخص يستطيع رؤيته.
  const CONFIG = Object.freeze({ API_URL: "", REFRESH_MS: 5000 });

  const VIEWS = ["overview", "servers", "commands", "games", "tickets", "logs"];
  const TITLES = { overview: "نظرة عامة", servers: "السيرفرات", commands: "الأوامر", games: "الألعاب", tickets: "التذاكر", logs: "السجلات" };
  const LEVELS = ["info", "warn", "error"];

  const $ = (id) => document.getElementById(id);
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const str = (v, max = 200) => String(v ?? "").slice(0, max);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const hhmmss = (d) => d.toLocaleTimeString("en-GB");

  const state = { online: false, demo: true, ping: [], servers: [], commands: [], logs: [], users: 0, uptime: 0 };

  // ===== بيانات تجريبية =====
  const DEMO_SERVERS = [["Wolf Pack", 1240], ["Alpha Den", 860], ["Universe HQ", 3120], ["Night Pack", 410]];
  const DEMO_CMDS = [["/help", "عرض قائمة الأوامر", 842], ["/ping", "قياس سرعة البوت", 1530], ["/play", "تشغيل أغنية", 970], ["/ban", "حظر عضو", 64], ["/stats", "إحصائيات السيرفر", 311]];
  const DEMO_MSGS = [["info", "تم تنفيذ أمر /ping"], ["info", "انضم عضو جديد إلى Wolf Pack"], ["warn", "تأخر في الاستجابة"], ["error", "فشل تحميل أحد الأوامر"], ["info", "تم تحديث الإحصائيات"]];
  const started = Date.now();

  function demoTick() {
    const last = state.ping.length ? state.ping[state.ping.length - 1] : 70;
    const ping = Math.max(20, Math.min(180, Math.round(last + (Math.random() - 0.5) * 30)));
    const [lvl, msg] = DEMO_MSGS[Math.floor(Math.random() * DEMO_MSGS.length)];
    return {
      ping,
      users: DEMO_SERVERS.reduce((a, s) => a + s[1], 0),
      uptime: Math.floor((Date.now() - started) / 1000) + 86400 * 3,
      servers: DEMO_SERVERS.map(([name, members]) => ({ name, members })),
      commands: DEMO_CMDS.map(([name, description, uses]) => ({ name, description, uses })),
      log: { time: hhmmss(new Date()), level: lvl, message: msg },
    };
  }

  // ===== جلب البيانات من API مع تحقق صارم =====
  const apiOk = /^https:\/\/[^\s]+$/i.test(CONFIG.API_URL);

  async function fetchApi() {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    try {
      const r = await fetch(CONFIG.API_URL, {
        credentials: "omit", referrerPolicy: "no-referrer", signal: ctl.signal, headers: { Accept: "application/json" },
      });
      if (!r.ok) throw new Error("bad status");
      const d = await r.json();
      return {
        ping: num(d.ping),
        users: num(d.users),
        uptime: num(d.uptime),
        servers: (Array.isArray(d.servers) ? d.servers : []).slice(0, 100).map((s) => ({ name: str(s.name, 60), members: num(s.members) })),
        commands: (Array.isArray(d.commands) ? d.commands : []).slice(0, 200).map((c) => ({ name: str(c.name, 40), description: str(c.description, 120), uses: num(c.uses) })),
        logs: (Array.isArray(d.logs) ? d.logs : []).slice(0, 50).map((l) => ({ time: str(l.time, 20), level: LEVELS.includes(l.level) ? l.level : "info", message: str(l.message, 200) })),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  // ===== العرض =====
  function fmtUptime(s) {
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return `${d}ي ${h}س ${m}د`;
  }

  function setStatus(on) {
    const box = $("status");
    box.className = "status " + (on ? "on" : "off");
    box.lastElementChild.textContent = on ? "متصل" : "غير متصل";
  }

  function drawChart() {
    const NS = "http://www.w3.org/2000/svg", W = 600, H = 170, max = 200;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "رسم بياني لسرعة الاستجابة");
    [0.25, 0.5, 0.75].forEach((p) => {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("class", "grid");
      l.setAttribute("x1", 0); l.setAttribute("x2", W);
      l.setAttribute("y1", H * p); l.setAttribute("y2", H * p);
      svg.appendChild(l);
    });
    const pts = state.ping.map((v, i) => {
      const x = state.ping.length > 1 ? (i / (state.ping.length - 1)) * W : 0;
      return [x, H - Math.min(v, max) / max * (H - 10) - 5];
    });
    if (pts.length > 1) {
      const line = pts.map((p) => p.join(",")).join(" ");
      const area = document.createElementNS(NS, "polygon");
      area.setAttribute("class", "area");
      area.setAttribute("points", `0,${H} ${line} ${W},${H}`);
      const pl = document.createElementNS(NS, "polyline");
      pl.setAttribute("class", "line");
      pl.setAttribute("points", line);
      svg.append(area, pl);
    }
    $("chart").replaceChildren(svg);
  }

  function renderLogs(target, limit) {
    const items = state.logs.slice(0, limit).map((l) => {
      const li = el("li", LEVELS.includes(l.level) ? l.level : "info");
      li.append(el("time", "", l.time), el("span", "", l.message));
      return li;
    });
    target.replaceChildren(...(items.length ? items : [el("li", "", "لا توجد أحداث بعد")]));
  }

  function renderServers() {
    const items = state.servers.map((s) => {
      const li = el("li");
      li.append(el("strong", "", s.name), el("small", "", `${s.members.toLocaleString("en-US")} عضو`));
      return li;
    });
    $("server-list").replaceChildren(...(items.length ? items : [el("li", "", "لا توجد سيرفرات")]));
  }

  function renderCommands() {
    const q = $("search").value.trim().toLowerCase();
    const rows = state.commands.filter((c) => (c.name + " " + c.description).toLowerCase().includes(q)).map((c) => {
      const tr = el("tr");
      tr.append(el("td", "", c.name), el("td", "", c.description), el("td", "", c.uses.toLocaleString("en-US")));
      return tr;
    });
    if (!rows.length) {
      const tr = el("tr"), td = el("td", "empty", "لا توجد نتائج");
      td.colSpan = 3; tr.appendChild(td); rows.push(tr);
    }
    $("cmd-body").replaceChildren(...rows);
  }

  function render() {
    $("s-servers").textContent = state.servers.length;
    $("s-users").textContent = state.users.toLocaleString("en-US");
    $("s-ping").textContent = state.ping.length ? state.ping[state.ping.length - 1] : 0;
    $("s-uptime").textContent = fmtUptime(state.uptime);
    $("mode").textContent = state.demo ? "وضع تجريبي: بيانات وهمية" : "متصل بالبوت";
    setStatus(state.online);
    drawChart();
    renderLogs($("recent"), 6);
    renderLogs($("log-list"), 50);
    renderServers();
    renderCommands();
  }

  // ===== الحلقة الرئيسية =====
  async function tick() {
    try {
      if (apiOk) {
        const d = await fetchApi();
        state.demo = false;
        Object.assign(state, { users: d.users, uptime: d.uptime, servers: d.servers, commands: d.commands, logs: d.logs });
        state.ping = state.ping.concat(d.ping).slice(-30);
      } else {
        const d = demoTick();
        state.demo = true;
        Object.assign(state, { users: d.users, uptime: d.uptime, servers: d.servers, commands: d.commands });
        state.ping = state.ping.concat(d.ping).slice(-30);
        state.logs = [d.log].concat(state.logs).slice(0, 50);
      }
      state.online = true;
    } catch (e) {
      state.online = false;
    }
    render();
  }

  // ===== التنقل =====
  function show() {
    let v = location.hash.slice(1);
    if (!VIEWS.includes(v)) v = "overview";
    VIEWS.forEach((id) => { $(id).hidden = id !== v; });
    document.querySelectorAll("#nav a").forEach((a) => {
      if (a.dataset.view === v) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    $("title").textContent = TITLES[v];
  }

  window.addEventListener("hashchange", show);
  $("search").addEventListener("input", renderCommands);
  show();
  tick();
  setInterval(tick, CONFIG.REFRESH_MS);
})();
