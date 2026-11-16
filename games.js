(() => {
  "use strict";
  // أضف ألعابك هنا. state يجب أن تكون "on" أو "off" فقط.
  const GAMES = [
    { name: "Wolf Hunt", players: 128, state: "on" },
    { name: "Universe Quiz", players: 342, state: "on" },
    { name: "Alpha Duel", players: 57, state: "off" },
  ];
  const LEADERS = [["AlphaKing", 9820], ["NightWolf", 8410], ["Luna", 7755], ["ShadowPack", 6120]];

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = String(text);
    return e;
  };
  const list = document.getElementById("game-list");
  const board = document.getElementById("leaderboard");
  if (!list || !board) return;

  list.replaceChildren(...GAMES.map((g) => {
    const on = g.state === "on";
    const li = el("li");
    const info = el("div");
    info.append(el("strong", "", g.name), el("br"), el("small", "", g.players + " لاعب"));
    li.append(info, el("span", "badge " + (on ? "on" : "off"), on ? "نشطة" : "متوقفة"));
    return li;
  }));

  board.replaceChildren(...LEADERS.map(([name, pts], i) => {
    const li = el("li");
    li.append(el("strong", "", (i + 1) + ". " + name), el("small", "", pts.toLocaleString("en-US") + " نقطة"));
    return li;
  }));
})();
