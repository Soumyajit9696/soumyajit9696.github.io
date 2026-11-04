/* Soumyajit Das — portfolio interactions (vanilla, no dependencies) */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Housekeeping: retire keys from removed experiments ---------- */
  try { localStorage.removeItem("lab-badges"); localStorage.removeItem("lab-stats"); } catch (e) {}

  /* ---------- Theme toggle ---------- */
  var toggle = doc.querySelector(".theme-toggle");
  var themeMeta = null;
  try {
    themeMeta = doc.querySelector('meta[name="theme-color"]:not([media])');
    if (!themeMeta) {
      themeMeta = doc.createElement("meta");
      themeMeta.setAttribute("name", "theme-color");
      doc.head.appendChild(themeMeta);
    }
  } catch (e) {}
  function syncThemeColor() {
    if (themeMeta) themeMeta.setAttribute("content", root.getAttribute("data-theme") === "dark" ? "#131419" : "#FAF8F2");
  }
  function syncToggle() {
    if (toggle) toggle.setAttribute("aria-checked", root.getAttribute("data-theme") === "dark" ? "true" : "false");
  }
  syncToggle();
  syncThemeColor();
  if (toggle) toggle.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark";
    /* brief cross-fade window (skipped for reduced motion — CSS handles it) */
    if (!reduceMotion) {
      root.classList.add("theme-fade");
      setTimeout(function () { root.classList.remove("theme-fade"); }, 300);
    }
    root.setAttribute("data-theme", dark ? "light" : "dark");
    try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) {}
    syncToggle();
    syncThemeColor();
  });

  /* ---------- Font size control ---------- */
  var fsBtns = doc.querySelectorAll(".fs-btn");
  var FS_STEPS = [14, 15, 16, 17, 18];
  var FS_DEF = 2;
  function fsIndex() {
    var cur = parseFloat(root.style.fontSize) || 16, best = FS_DEF;
    for (var i = 0; i < FS_STEPS.length; i++) {
      if (Math.abs(FS_STEPS[i] - cur) <= Math.abs(FS_STEPS[best] - cur)) best = i;
    }
    return best;
  }
  function applyFs(i, save) {
    if (i < 0) i = 0;
    if (i > FS_STEPS.length - 1) i = FS_STEPS.length - 1;
    root.style.fontSize = FS_STEPS[i] + "px";
    if (save) { try { localStorage.setItem("fs", String(FS_STEPS[i])); } catch (e) {} }
    fsBtns.forEach(function (b) {
      var d = b.getAttribute("data-fs");
      if (d === "reset") return;
      d = parseInt(d, 10);
      b.disabled = (d < 0 && i === 0) || (d > 0 && i === FS_STEPS.length - 1);
    });
  }
  if (fsBtns.length) {
    fsBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var d = b.getAttribute("data-fs");
        applyFs(d === "reset" ? FS_DEF : fsIndex() + parseInt(d, 10), true);
      });
    });
    applyFs(fsIndex(), false);
  }

  /* ---------- Mobile nav ---------- */
  var sidebar = doc.querySelector(".sidebar"),
      burger = doc.querySelector(".nav-toggler"),
      backdrop = doc.querySelector(".nav-backdrop");
  function closeNav() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    burger && burger.setAttribute("aria-expanded", "false");
    backdrop && backdrop.classList.remove("show");
    doc.body.style.overflow = "";
  }
  if (burger && sidebar) {
    burger.addEventListener("click", function () {
      var open = sidebar.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      backdrop && backdrop.classList.toggle("show", open);
      doc.body.style.overflow = open ? "hidden" : "";
    });
    backdrop && backdrop.addEventListener("click", closeNav);
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Typed line ---------- */
  var typedEl = doc.querySelector(".typed");
  if (typedEl) {
    var lines = [
      "Physics graduate & DFT researcher",
      "I build scientific software",
      "Python · PyQt · NumPy · SciPy",
      "Condensed-matter enthusiast",
      "Linux & open-source lover"
    ];
    if (reduceMotion) {
      typedEl.textContent = lines[0];
    } else {
      var li = 0, ch = 0, erasing = false;
      (function tick() {
        var text = lines[li];
        typedEl.textContent = text.slice(0, ch);
        var delay = erasing ? 26 : 58;
        if (!erasing && ch === text.length) { delay = 1900; erasing = true; }
        else if (erasing && ch === 0) { erasing = false; li = (li + 1) % lines.length; delay = 320; }
        else ch += erasing ? -1 : 1;
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var rvs = doc.querySelectorAll(".rv");
  if (rvs.length && "IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rvs.forEach(function (el) { ro.observe(el); });
    /* Safety net: reveal everything shortly after load (covers non-scrolling
       renderers, crawlers and full-page previews). */
    setTimeout(function () {
      rvs.forEach(function (el) { el.classList.add("in"); });
    }, 1600);
  } else {
    rvs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Toast (tiny, bottom-centre, auto-dismiss) ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (toastEl) toastEl.remove();
    clearTimeout(toastTimer);
    toastEl = doc.createElement("div");
    toastEl.className = "sd-toast";
    toastEl.setAttribute("role", "status");
    toastEl.textContent = msg;
    doc.body.appendChild(toastEl);
    requestAnimationFrame(function () { requestAnimationFrame(function () { toastEl.classList.add("on"); }); });
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("on");
      setTimeout(function () { if (toastEl) toastEl.remove(); }, 250);
    }, 1900);
  }

  /* ---------- Copy-to-clipboard buttons (About email, etc.) ---------- */
  function copyText(t, okMsg) {
    function fallback() {
      try {
        var ta = doc.createElement("textarea");
        ta.value = t;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
        doc.body.appendChild(ta);
        ta.select();
        var ok = doc.execCommand("copy");
        ta.remove();
        return ok;
      } catch (e) { return false; }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(
        function () { toast(okMsg); },
        function () { toast(fallback() ? okMsg : "Copy failed — please select it manually"); }
      );
    } else {
      toast(fallback() ? okMsg : "Copy failed — please select it manually");
    }
  }
  doc.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      copyText(b.getAttribute("data-copy"), "Copied — " + b.getAttribute("data-copy"));
    });
  });

  /* ---------- Reading progress ---------- */
  (function () {
    var bar = doc.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    doc.body.appendChild(bar);

    var ticking = false;
    function update() {
      ticking = false;
      var h = doc.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var y = window.scrollY || h.scrollTop || 0;
      bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }
    addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- Gallery filters ---------- */
  doc.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
    var grid = doc.getElementById(bar.getAttribute("data-filter-bar"));
    if (!grid) return;
    bar.addEventListener("click", function (e) {
      var pill = e.target.closest(".pill");
      if (!pill) return;
      bar.querySelectorAll(".pill").forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      var f = pill.getAttribute("data-filter");
      grid.querySelectorAll("[data-category]").forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-category") === f;
        card.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = doc.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".lb-caption"),
        lbCount = lb.querySelector(".lb-count"),
        lbClose = lb.querySelector("[data-lb-close]"), lbPrev = lb.querySelector("[data-lb-prev]"),
        lbNext = lb.querySelector("[data-lb-next]"), idx = 0;
    function visibleCards() {
      return Array.prototype.slice.call(doc.querySelectorAll(".gcard")).filter(function (c) {
        return !c.classList.contains("hide");
      });
    }
    function show(i) {
      var cards = visibleCards();
      if (!cards.length) return;
      idx = (i + cards.length) % cards.length;
      var card = cards[idx], img = card.querySelector("img"), cap = card.querySelector("figcaption b");
      lbImg.src = img.getAttribute("src");
      lbImg.alt = img.alt || "";
      lbCap.textContent = cap ? cap.textContent : "";
      lbCount.textContent = (idx + 1) + " / " + cards.length;
    }
    function open(i) {
      show(i);
      lb.classList.add("open");
      doc.body.style.overflow = "hidden";
      lbClose.focus();
    }
    function close() {
      lb.classList.remove("open");
      doc.body.style.overflow = "";
    }
    /* body-level delegation: covers live in the featured report cards
       (projects) as well as the .gallery-grid (gallery) */
    doc.body.addEventListener("click", function (e) {
      var card = e.target.closest(".gcard");
      if (card && !card.classList.contains("hide")) open(visibleCards().indexOf(card));
    });
    lbClose.addEventListener("click", close);
    lbPrev.addEventListener("click", function () { show(idx - 1); });
    lbNext.addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    doc.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Music player — seek + volume ---------- */
  var music = doc.querySelector(".music");
  if (music) {
    var audio = music.querySelector("audio"),
        tracks = JSON.parse(music.getAttribute("data-tracks")),
        tTitle = music.querySelector(".m-title"), tArtist = music.querySelector(".m-artist"),
        art = music.querySelector(".music-art"),
        playBtn = music.querySelector('[data-act="play"]'), useEl = playBtn.querySelector("use"),
        prevBtn = music.querySelector('[data-act="prev"]'), nextBtn = music.querySelector('[data-act="next"]'),
        seekTrack = music.querySelector(".seek-track"), seekFill = music.querySelector(".seek-fill"),
        seekThumb = music.querySelector(".seek-thumb"),
        tCur = music.querySelector(".t-cur"), tDur = music.querySelector(".t-dur"),
        muteBtn = music.querySelector('[data-act="mute"]'), muteUse = muteBtn.querySelector("use"),
        volTrack = music.querySelector(".vol-track"), volFill = music.querySelector(".vol-fill"),
        volThumb = music.querySelector(".vol-thumb"),
        list = music.querySelector(".playlist"), cur = 0, started = false;

    function fmt(s) {
      if (!isFinite(s)) return "0:00";
      var m = Math.floor(s / 60), sec = Math.floor(s % 60);
      return m + ":" + (sec < 10 ? "0" : "") + sec;
    }
    function renderList() {
      list.innerHTML = tracks.map(function (t, i) {
        return '<li><button data-i="' + i + '" class="' + (i === cur ? "current" : "") + '">' +
          '<span class="num">0' + (i + 1) + '</span><span class="name">' + t.title + " — " + t.artist +
          '</span><span class="dur">' + t.dur + "</span></button></li>";
      }).join("");
    }
    function load(i, autoplay) {
      cur = (i + tracks.length) % tracks.length;
      var t = tracks[cur];
      tTitle.textContent = t.title; tArtist.textContent = t.artist;
      audio.src = t.src;
      if (t.art) { art.innerHTML = '<img src="' + t.art + '" width="86" height="86" alt="">'; }
      else { art.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-music"/></svg>'; }
      renderList();
      tDur.textContent = t.dur;
      paintSeek(0); tCur.textContent = "0:00";
      if (autoplay) audio.play().catch(function () {});
    }

    /* ---- seek bar: drag / click / keyboard ---- */
    var seeking = false;
    function trackRatio(el, e) {
      var r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    }
    function paintSeek(p) {
      seekFill.style.width = p * 100 + "%";
      seekThumb.style.left = p * 100 + "%";
      seekTrack.setAttribute("aria-valuenow", Math.round(p * 100));
      seekTrack.setAttribute("aria-valuetext", fmt(p * (audio.duration || 0)) + " of " + fmt(audio.duration || 0));
    }
    function commitSeek(p) {
      var t = p * (audio.duration || 0);
      if (audio.duration) audio.currentTime = t;
      paintSeek(p);
      tCur.textContent = fmt(t);
    }
    seekTrack.addEventListener("pointerdown", function (e) {
      if (!audio.duration) return;            /* nothing loaded yet */
      seeking = true;
      seekTrack.classList.add("drag");
      try { seekTrack.setPointerCapture(e.pointerId); } catch (_) {}
      commitSeek(trackRatio(seekTrack, e));
      e.preventDefault();
    });
    seekTrack.addEventListener("pointermove", function (e) {
      if (seeking) commitSeek(trackRatio(seekTrack, e));
    });
    function endSeek() {
      if (!seeking) return;
      seeking = false;
      seekTrack.classList.remove("drag");
    }
    seekTrack.addEventListener("pointerup", endSeek);
    seekTrack.addEventListener("pointercancel", endSeek);
    seekTrack.addEventListener("click", function (e) {   /* pure-keyboard/AT click passthrough */
      if (!audio.duration || seeking) return;
      commitSeek(trackRatio(seekTrack, e));
    });
    seekTrack.addEventListener("keydown", function (e) {
      if (!audio.duration) return;
      var t = audio.currentTime, d = audio.duration, k = e.key;
      if (k === "ArrowLeft") t = Math.max(0, t - 5);
      else if (k === "ArrowRight") t = Math.min(d, t + 5);
      else if (k === "Home") t = 0;
      else if (k === "End") t = d - 0.1;
      else return;
      e.preventDefault();
      commitSeek(t / d);
    });

    /* ---- volume: slider + mute, persisted ---- */
    var lastAudible = 80;
    function readVol() {
      var v = 80, m = "0";
      try {
        var s = parseFloat(localStorage.getItem("mp-vol"));
        if (s >= 0 && s <= 100) v = s;
        m = localStorage.getItem("mp-mute") === "1" ? "1" : "0";
      } catch (_) {}
      return [v, m === "1"];
    }
    function saveVol() {
      try {
        localStorage.setItem("mp-vol", String(Math.round(audio.volume * 100)));
        localStorage.setItem("mp-mute", audio.muted ? "1" : "0");
      } catch (_) {}
    }
    function paintVol(v) {
      volFill.style.width = v + "%";
      volThumb.style.left = v + "%";
      volTrack.setAttribute("aria-valuenow", Math.round(v));
      volTrack.setAttribute("aria-valuetext", Math.round(v) + " percent");
    }
    function applyVol(v, muted) {
      v = Math.min(100, Math.max(0, v));
      if (v >= 5) lastAudible = v;      /* remember only genuinely audible levels */
      audio.volume = v / 100;
      audio.muted = muted;
      paintVol(v);
      muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
      muteUse.setAttribute("href", (muted || v < 1) ? "#i-mute" : "#i-vol");
    }
    var volDrag = false;
    function commitVol(p) { applyVol(p * 100, false); }   /* touching the slider unmutes */
    volTrack.addEventListener("pointerdown", function (e) {
      volDrag = true;
      volTrack.classList.add("drag");
      try { volTrack.setPointerCapture(e.pointerId); } catch (_) {}
      commitVol(trackRatio(volTrack, e));
      e.preventDefault();
    });
    volTrack.addEventListener("pointermove", function (e) {
      if (volDrag) commitVol(trackRatio(volTrack, e));
    });
    function endVol() {
      if (!volDrag) return;
      volDrag = false;
      volTrack.classList.remove("drag");
      saveVol();
    }
    volTrack.addEventListener("pointerup", endVol);
    volTrack.addEventListener("pointercancel", endVol);
    volTrack.addEventListener("keydown", function (e) {
      var v = audio.volume * 100, k = e.key;
      if (k === "ArrowLeft") v = Math.max(0, v - 5);
      else if (k === "ArrowRight") v = Math.min(100, v + 5);
      else if (k === "Home") v = 0;
      else if (k === "End") v = 100;
      else return;
      e.preventDefault();
      applyVol(v, false);
      saveVol();
    });
    muteBtn.addEventListener("click", function () {
      if (audio.muted) {
        var v = audio.volume * 100;
        if (v < 5) v = lastAudible;       /* unmute from (near-)silent restores the last audible level */
        applyVol(v, false);
      } else {
        applyVol(audio.volume * 100, true);
      }
      saveVol();
    });

    /* restore the visitor's last setting */
    (function () {
      var s = readVol();
      if (s[0] > 0) lastAudible = s[0];
      applyVol(s[0], s[1]);
    })();

    /* ---- transport ---- */
    playBtn.addEventListener("click", function () {
      if (!started) { started = true; load(cur, true); return; }
      audio.paused ? audio.play().catch(function () {}) : audio.pause();
    });
    prevBtn.addEventListener("click", function () { started = true; load(cur - 1, !audio.paused); });
    nextBtn.addEventListener("click", function () { started = true; load(cur + 1, !audio.paused); });
    audio.addEventListener("play", function () { music.classList.add("playing"); useEl.setAttribute("href", "#i-pause"); });
    audio.addEventListener("pause", function () { music.classList.remove("playing"); useEl.setAttribute("href", "#i-play"); });
    audio.addEventListener("ended", function () { load(cur + 1, true); });
    audio.addEventListener("loadedmetadata", function () {
      tDur.textContent = fmt(audio.duration);
      paintSeek(audio.duration ? audio.currentTime / audio.duration : 0);
    });
    audio.addEventListener("timeupdate", function () {
      if (seeking) return;                    /* the drag owns the bar while scrubbing */
      var p = audio.duration ? (audio.currentTime / audio.duration) : 0;
      paintSeek(p);
      tCur.textContent = fmt(audio.currentTime);
    });
    list.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]");
      if (b) { started = true; load(parseInt(b.getAttribute("data-i"), 10), true); }
    });
    renderList();
    tDur.textContent = tracks[0].dur;
  }

  /* ---------- Live blog feed (deferred, non-blocking) ---------- */
  var feed = doc.getElementById("blogger-posts");
  if (feed && feed.hasAttribute("data-live")) {
    window.bloggerPostsCallback = function (res) {
      var entries = res && res.feed && res.feed.entry ? res.feed.entry.slice(0, 3) : [];
      if (!entries.length) return;
      feed.innerHTML = entries.map(function (en) {
        var link = (en.link || []).filter(function (l) { return l.rel === "alternate"; })[0];
        var href = link ? link.href : "#";
        var d = new Date(en.published.$t);
        var date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        var tmp = doc.createElement("div");
        tmp.innerHTML = en.content ? en.content.$t : "";
        tmp.querySelectorAll("style,script,noscript,iframe,svg,template").forEach(function (n) { n.remove(); });
        var fullText = (tmp.textContent || "").replace(/\s+/g, " ").trim();
        var excerpt = fullText.slice(0, 150);
        var mins = Math.max(1, Math.round(fullText.split(" ").length / 200));
        var thumb = en.media$thumbnail && en.media$thumbnail.url
          ? en.media$thumbnail.url.replace(/\/s\d+-c\//, "/s600/") : "images/blog/1.webp";
        var cat = en.category && en.category[0] ? en.category[0].term : "Science";
        var safeTitle = (en.title.$t || "Blog post").replace(/"/g, "&quot;");
        return '<article class="card card-hover post-card rv in">' +
          '<div class="thumb"><img src="' + thumb + '" alt="' + safeTitle + '" width="600" height="375" loading="lazy" decoding="async">' +
          '<span class="chip chip-y">' + date + "</span></div>" +
          '<div class="body"><h3><a href="' + href + '" target="_blank" rel="noopener">' + en.title.$t + "</a></h3>" +
          "<p>" + excerpt + "…</p>" +
          '<p class="post-meta">≈' + mins + " min read</p>" +
          '<span class="go">Read on Blogger <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg></span></div></article>';
      }).join("");
    };
    setTimeout(function () {
      var s = doc.createElement("script");
      s.src = "https://sci-tech-science.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=3&callback=bloggerPostsCallback";
      s.async = true;
      doc.head.appendChild(s);
    }, 6000);
  }

  /* ---------- Welcome note (home, once per session, time-aware) ---------- */
  (function () {
    if (!doc.querySelector(".hero")) return;
    var shown = false;
    try { shown = sessionStorage.getItem("sd-welcome") === "1"; } catch (e) {}
    if (shown) return;
    try { sessionStorage.setItem("sd-welcome", "1"); } catch (e) {}

    /* time-of-day greeting — respectful and universal for any visitor */
    var h = new Date().getHours(), G;
    if (h >= 5 && h < 12) {
      G = { hi: "Good morning, visitor!", tail: "Have a good day ahead \u2014 take a look around: research, code, writing and resources." };
    } else if (h >= 12 && h < 17) {
      G = { hi: "Good afternoon, visitor!", tail: "Have a good day \u2014 take a look around: research, code, writing and resources." };
    } else if (h >= 17 && h < 21) {
      G = { hi: "Good evening, visitor!", tail: "Have a good evening \u2014 take a look around: research, code, writing and resources." };
    } else {
      G = { hi: "Good night, visitor!", tail: "Have a good night \u2014 take a look around: research, code, writing and resources." };
    }
    var clock = "";
    try { clock = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch (e) {}

    var wrap = doc.createElement("div");
    wrap.className = "wl-backdrop";
    wrap.id = "wl";
    wrap.innerHTML =
      '<div class="wl-card" role="dialog" aria-modal="true" aria-labelledby="wl-title">' +
      '<span class="wl-kicker">' +
      '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
      '<ellipse cx="12" cy="12" rx="10" ry="4.1"/><ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(60 12 12)"/>' +
      '<ellipse cx="12" cy="12" rx="10" ry="4.1" transform="rotate(120 12 12)"/>' +
      '<circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/></svg>' +
      "VISITOR DETECTED" +
      (clock ? '<span class="wl-time">' + clock + "</span>" : "") +
      "</span>" +
      '<h2 id="wl-title">' + G.hi + "</h2>" +
      "<p>Welcome to my universe \u2014 I\u2019m <strong>Soumyajit Das</strong>, physics M.Sc. graduate, " +
      "DFT researcher and scientific-software builder. " + G.tail + "</p>" +
      '<p class="wl-note">P.S. Every observation changes the outcome \u2014 thanks for collapsing this wavefunction.</p>' +
      '<div class="wl-actions">' +
      '<a class="btn btn-ink" href="projects.html">Explore my work <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow"/></svg></a>' +
      '<button class="btn" type="button" data-wl-close>Just looking around</button>' +
      "</div></div>";
    doc.body.appendChild(wrap);
    /* lock scroll but compensate the scrollbar so nothing shifts (CLS 0) */
    var sw = window.innerWidth - doc.documentElement.clientWidth;
    doc.body.style.overflow = "hidden";
    if (sw > 0) doc.body.style.paddingRight = sw + "px";

    var closer = wrap.querySelector("[data-wl-close]");
    function close() {
      doc.body.style.overflow = "";
      doc.body.style.paddingRight = "";
      if (reduceMotion) { wrap.remove(); return; }
      wrap.classList.remove("on");
      setTimeout(function () { wrap.remove(); }, 220);
    }
    wrap.addEventListener("click", function (e) { if (e.target === wrap) close(); });
    closer.addEventListener("click", close);
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.getElementById("wl")) close();
    });
    /* keep Tab inside the card while it is open */
    wrap.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = wrap.querySelectorAll("a,button"), first = f[0], lastF = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); lastF.focus(); }
      else if (!e.shiftKey && doc.activeElement === lastF) { e.preventDefault(); first.focus(); }
    });
    requestAnimationFrame(function () {
      wrap.classList.add("on");
      closer.focus();
    });
  })();

  /* ---------- Analytics: load only after real engagement ---------- */
  (function () {
    var loaded = false, GTM = "GTM-5QM9KTX5", GA = "G-0BSMLY357C";
    function init() {
      if (loaded) return;
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var gtm = doc.createElement("script");
      gtm.async = true;
      gtm.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM;
      doc.head.appendChild(gtm);
      var ga = doc.createElement("script");
      ga.async = true;
      ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA;
      doc.head.appendChild(ga);
      window.dataLayer.push({ js: new Date() });
      window.dataLayer.push({ config: GA });
    }
    if (doc.prerendering) {
      doc.addEventListener("prerenderingchange", init, true);
    } else {
      ["scroll", "keydown", "pointerdown", "touchstart"].forEach(function (evt) {
        window.addEventListener(evt, init, { once: true, capture: true, passive: true });
      });
      setTimeout(init, 3500);
    }
  })();
})();
