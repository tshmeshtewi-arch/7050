(() => {
  "use strict";
  // أضف تذاكرك هنا. status يجب أن تكون "open" أو "closed" فقط.
  const TICKETS = [
    { id: 101, user: "Luna", subject: "مشكلة في أمر /play", status: "open" },
    { id: 100, user: "NightWolf", subject: "طلب إضافة لعبة جديدة", status: "open" },
    { id: 99, user: "AlphaKing", subject: "البوت لا يرد في روم الموسيقى", status: "closed" },
  ];
  const FILTERS = ["all", "open", "closed"];

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = String(text);
    return e;
  };
  const list = document.getElementById("ticket-list");
  const sel = document.getElementById("ticket-filter");
  if (!list || !sel) return;

  function render() {
    const f = FILTERS.includes(sel.value) ? sel.value : "all";
    const items = TICKETS.filter((t) => f === "all" || t.status === f).map((t) => {
      const open = t.status === "open";
      const li = el("li");
      const info = el("div");
      info.append(el("strong", "", "#" + t.id + " " + t.subject), el("br"), el("small", "", t.user));
      li.append(info, el("span", "badge " + (open ? "open" : "closed"), open ? "مفتوحة" : "مغلقة"));
      return li;
    });
    list.replaceChildren(...(items.length ? items : [el("li", "", "لا توجد تذاكر")]));
  }
  sel.addEventListener("change", render);
  render();
})();
