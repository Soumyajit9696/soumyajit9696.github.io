/* Command palette (Round 17) — ⌘K / Ctrl+K quick actions.
   Vanilla JS, no deps. Opens a neobrutalist modal with fuzzy search over
   pages, actions and the brutal-tools desklets (via #brutal-tools shadow DOM). */
(function () {
  "use strict";
  if (window.__SD_PALETTE) return;
  window.__SD_PALETTE = true;

  var MAC = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
  var TOUCH = false;
  try { TOUCH = matchMedia("(hover: none)").matches; } catch (e) {}
  var KEY = TOUCH ? "Search" : (MAC ? "⌘K" : "Ctrl K");

  /* ---------- data ---------- */
  var PAGES = [
    { t: "Home", s: "page", ico: "#i-window", url: "index.html" },
    { t: "About — bio & live terminal", s: "page", ico: "#i-terminal", url: "about.html" },
    { t: "Skills — periodic table", s: "page", ico: "#i-grid", url: "skills.html" },
    { t: "Projects", s: "page", ico: "#i-cube", url: "projects.html" },
    { t: "Gallery", s: "page", ico: "#i-image", url: "gallery.html" },
    { t: "Blog", s: "page", ico: "#i-pen", url: "blog.html" },
    { t: "Resources — bookshelf", s: "page", ico: "#i-book", url: "resources.html" }
  ];
  var TOOLS = [
    { t: "Clock", s: "tool", ico: "#i-monitor", tool: "clock" },
    { t: "Cite this site (BibTeX)", s: "tool", ico: "#i-doc", tool: "ct" },
    { t: "Links", s: "tool", ico: "#i-ext", tool: "lk" },
    { t: "Feedback", s: "tool", ico: "#i-mail", tool: "fb" }
  ];
  var ACTIONS = [
    { t: "Toggle dark mode", s: "action", ico: "#i-moon", run: function () { var b = document.querySelector(".theme-toggle"); if (b) b.click(); } },
    { t: "Copy email address", s: "action", ico: "#i-mail", run: function () { var e = (window.BRUTAL_TOOLS && window.BRUTAL_TOOLS.email) || "dsoumyajit295@gmail.com"; try { navigator.clipboard.writeText(e); } catch (err) {} } },
    { t: "Download CV", s: "action", ico: "#i-download", url: "docs/SOUMYAJIT_DAS_CV.pdf" },
    { t: "GitHub — Soumyajit9696", s: "action", ico: "#i-github", url: "https://github.com/Soumyajit9696", ext: true },
    { t: "LinkedIn", s: "action", ico: "#i-linkedin", url: "https://www.linkedin.com/in/soumyajit-das-40a1851b8/", ext: true },
    { t: "Sci-Tech Science (blog)", s: "action", ico: "#i-globe", url: "https://sci-tech-science.blogspot.com/", ext: true }
  ];

  function toolsAvailable() {
    var host = document.getElementById("brutal-tools");
    return !!(host && host.shadowRoot && host.shadowRoot.querySelector("button[data-t]"));
  }
  function launchTool(id) {
    var host = document.getElementById("brutal-tools");
    if (!host || !host.shadowRoot) return;
    var sr = host.shadowRoot;
    var wins = sr.getElementById("wins");
    var dm = sr.getElementById("dm");
    var dt = sr.getElementById("dt");
    var built = wins && wins.children.length > 0;
    var wasOpen = dm && dm.classList.contains("open");
    if (!built && dt) dt.click(); /* first click runs build() + opens menu */
    var btn = sr.querySelector('button[data-t="' + id + '"]');
    if (btn) btn.click();
    if (!built && !wasOpen && dm && dm.classList.contains("open") && dt) dt.click(); /* re-close menu we opened */
  }

  /* ---------- fuzzy match ---------- */
  function fuzzy(q, s) {
    q = q.toLowerCase(); s = s.toLowerCase();
    if (!q) return { score: 1, marks: [] };
    var qi = 0, score = 0, marks = [], streak = 0;
    for (var i = 0; i < s.length && qi < q.length; i++) {
      if (s[i] === q[qi]) {
        marks.push(i); qi++; streak++;
        score += 2 + (streak > 1 ? 1 : 0) + (i === 0 ? 2 : 0);
      } else streak = 0;
    }
    if (qi < q.length) return null;
    return { score: score, marks: marks };
  }

  /* ---------- recents ---------- */
  function getRecents() {
    try { return JSON.parse(localStorage.getItem("pk-recents") || "[]"); } catch (e) { return []; }
  }
  function pushRecent(key) {
    try {
      var r = getRecents().filter(function (x) { return x !== key; });
      r.unshift(key);
      localStorage.setItem("pk-recents", JSON.stringify(r.slice(0, 5)));
    } catch (e) {}
  }

  /* ---------- build DOM ---------- */
  var root = document.createElement("div");
  root.className = "pk-root";
  root.innerHTML =
    '<div class="pk-backdrop" data-pk-close></div>' +
    '<div class="pk-panel" role="dialog" aria-modal="true" aria-label="Quick actions">' +
    '<div class="pk-head">' +
    '<svg class="pk-search-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4" stroke-width="3"/></svg>' +
    '<input class="pk-input" type="text" placeholder="Search pages, tools, actions…" autocomplete="off" spellcheck="false" aria-label="Search">' +
    '<button class="pk-esc" type="button" data-pk-close aria-label="Close">esc</button>' +
    "</div>" +
    '<div class="pk-list" role="listbox" aria-label="Results" data-pk-list></div>' +
    '<div class="pk-foot">' +
    "<span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>" +
    "<span><kbd>↵</kbd> open</span>" +
    "<span><kbd>esc</kbd> close</span>" +
    '<span class="pk-brand">SD · quick actions</span>' +
    "</div>" +
    "</div>";

  var trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "pk-trigger";
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4" stroke-width="3"/></svg><span>' + KEY + "</span>";
  trigger.setAttribute("aria-label", "Open quick actions (" + KEY + ")");

  var input, list, opened = false, items = [], active = -1, lastFocus = null;

  function render(query) {
    var pool = [];
    var recents = getRecents();
    PAGES.concat(ACTIONS).forEach(function (it) { it._k = "p:" + it.t; pool.push(it); });
    if (toolsAvailable()) TOOLS.forEach(function (it) { it._k = "t:" + it.t; pool.push(it); });

    var matched = [];
    if (query) {
      pool.forEach(function (it) {
        var m = fuzzy(query, it.t);
        if (m) matched.push({ it: it, m: m });
      });
      matched.sort(function (a, b) { return b.m.score - a.m.score; });
      items = matched.map(function (x) { return x.it; });
    } else {
      var recentItems = recents.map(function (k) {
        return pool.filter(function (it) { return it._k === k; })[0];
      }).filter(Boolean);
      var rest = pool.filter(function (it) { return recents.indexOf(it._k) === -1; });
      items = recentItems.concat(rest);
    }
    active = items.length ? 0 : -1;

    var html = "";
    if (query && !items.length) {
      html = '<p class="pk-empty">Nothing matches “" + escapeHtml(query) + "” — try “table”, “calc”, “dark”…</p>';
    }
    if (!query && getRecents().length) html += '<p class="pk-sec">Recent</p>';
    var shownRecents = !query ? getRecents().length : 0;
    items.forEach(function (it, i) {
      if (!query && i === shownRecents && i > 0) html += '<p class="pk-sec">All</p>';
      var label = highlight(it.t, query);
      html +=
        '<button class="pk-item' + (i === 0 ? " is-active" : "") + '" type="button" role="option" data-i="' + i + '" aria-selected="' + (i === 0) + '">' +
        '<svg class="pk-item-ico" viewBox="0 0 24 24" aria-hidden="true"><use href="' + it.ico + '"/></svg>' +
        "<span>" + label + "</span>" +
        '<span class="pk-tag pk-tag-' + it.s + '">' + it.s + "</span>" +
        "</button>";
    });
    list.innerHTML = html;
    list.scrollTop = 0;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function highlight(t, q) {
    t = escapeHtml(t);
    if (!q) return t;
    var m = fuzzy(q, t);
    if (!m) return t;
    var out = "", set = {};
    m.marks.forEach(function (i) { set[i] = 1; });
    for (var i = 0; i < t.length; i++) out += set[i] ? "<mark>" + t[i] + "</mark>" : t[i];
    return out;
  }

  function open() {
    if (opened) return;
    opened = true;
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add("pk-open");
    input.value = "";
    render("");
    input.focus();
  }
  function close() {
    if (!opened) return;
    opened = false;
    root.hidden = true;
    document.documentElement.classList.remove("pk-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function run(i) {
    var it = items[i];
    if (!it) return;
    pushRecent(it._k);
    close();
    if (it.tool) { launchTool(it.tool); return; }
    if (it.run) { it.run(); return; }
    if (it.url) {
      if (it.ext) window.open(it.url, "_blank", "noopener");
      else window.location.href = it.url;
    }
  }

  function setActive(i) {
    if (!items.length) return;
    active = (i + items.length) % items.length;
    var btns = list.querySelectorAll(".pk-item");
    for (var j = 0; j < btns.length; j++) {
      var on = j === active;
      btns[j].classList.toggle("is-active", on);
      btns[j].setAttribute("aria-selected", on);
    }
    var el = btns[active];
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  function init() {
    document.body.appendChild(root);
    document.body.appendChild(trigger);
    root.hidden = true;
    input = root.querySelector(".pk-input");
    list = root.querySelector("[data-pk-list]");

    input.addEventListener("input", function () { render(input.value.trim()); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter") { e.preventDefault(); run(active); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
    });
    list.addEventListener("click", function (e) {
      var b = e.target.closest(".pk-item");
      if (b) run(+b.getAttribute("data-i"));
    });
    list.addEventListener("mousemove", function (e) {
      var b = e.target.closest(".pk-item");
      if (b) setActive(+b.getAttribute("data-i"));
    });
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-pk-close]")) close();
    });
    trigger.addEventListener("click", open);

    document.addEventListener("keydown", function (e) {
      var mod = MAC ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        opened ? close() : open();
      } else if (e.key === "Escape" && opened) {
        close();
      } else if (e.key === "/" && !opened) {
        var tag = (document.activeElement && document.activeElement.tagName) || "";
        if (tag !== "INPUT" && tag !== "TEXTAREA" && !document.activeElement.isContentEditable) {
          e.preventDefault();
          open();
        }
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
