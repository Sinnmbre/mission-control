/* ================================================
   MISSION CONTROL — NightClaw x Domidev
   All data stored in localStorage — no server needed
   ================================================ */
(function () {
  "use strict";

  /* ── STORAGE ───────────────────────────────── */
  const DB = {
    get: (k, def) => { try { return JSON.parse(localStorage.getItem("mc_"+k)) ?? def; } catch { return def; } },
    set: (k, v)   => localStorage.setItem("mc_"+k, JSON.stringify(v))
  };

  /* ── STATE ─────────────────────────────────── */
  let projects = DB.get("projects", []);
  let devlog   = DB.get("devlog",   []);
  let goals    = DB.get("goals",    []);
  let notes    = DB.get("notes",    []);
  let monitors = DB.get("monitors", []);

  /* ── SEED DATA (first load) ─────────────────── */
  if (projects.length === 0) {
    projects = [{
      id: uid(), name: "WatchParty", desc: "Synchronized YouTube & Twitch watch party app with real-time chat, queue, emoji reactions and more.",
      github: "https://github.com/Sinnmbre/watchparty", url: "", status: "in-progress",
      date: "2026-02-19"
    }];
    DB.set("projects", projects);
  }

  if (devlog.length === 0) {
    devlog = [
      { id: uid(), project: "WatchParty", type: "build", text: "Built full Watch Party app from scratch — WebSocket server (Node.js, no API keys), real-time sync, live chat, typing indicators, emoji reactions, video queue, vote skip, movie night mode.", date: "2026-02-19 04:00" },
      { id: uid(), project: "WatchParty", type: "build", text: "v3.0 redesign: glassmorphism UI, animated orbs, Inter font, gradient brand, platform picker on room creation (YouTube & Twitch).", date: "2026-02-19 12:00" },
      { id: uid(), project: "WatchParty", type: "fix",   text: "Fixed duplicate player bug — host was loading video locally AND receiving server echo. Fixed player height leaving empty space below.", date: "2026-02-19 12:30" },
      { id: uid(), project: "Mission Control", type: "build", text: "Built NightClaw Mission Control — project tracker, dev log, goals, uptime monitor, notes. All localStorage-powered.", date: "2026-02-19" },
    ];
    DB.set("devlog", devlog);
  }

  if (goals.length === 0) {
    goals = [
      { id: uid(), text: "Leave the warehouse job", category: "Life Goal", done: false },
      { id: uid(), text: "Build and launch WatchParty live", category: "WatchParty", done: false },
      { id: uid(), text: "Get first paying client (freelance build)", category: "Income", done: false },
      { id: uid(), text: "Set up AI Automation Agency offer", category: "Income", done: false },
      { id: uid(), text: "Deploy WatchParty to Railway", category: "WatchParty", done: false },
    ];
    DB.set("goals", goals);
  }

  /* ── UTILS ─────────────────────────────────── */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function toast(msg) {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  function esc(s) {
    return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function fmtDate(d) {
    return d || new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  }

  function nowStr() {
    return new Date().toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
  }

  function statusBadge(s) {
    const map = { live:"status-live", "in-progress":"status-in-progress", idea:"status-idea", paused:"status-paused" };
    const label = { live:"🟢 Live", "in-progress":"🔨 In Progress", idea:"💡 Idea", paused:"⏸ Paused" };
    return `<span class="status-badge ${map[s]||""}">${label[s]||s}</span>`;
  }

  function logTypeBadge(t) {
    const map = { build:"log-build 🔨 Build", fix:"log-fix 🐛 Fix", decision:"log-decision 💡 Decision", research:"log-research 🔍 Research", deploy:"log-deploy 🚀 Deploy" };
    const parts = (map[t] || "log-build " + t).split(" ");
    const cls = parts[0];
    const label = parts.slice(1).join(" ");
    return `<span class="log-type-badge ${cls}">${label}</span>`;
  }

  /* ── CLOCK ─────────────────────────────────── */
  function startClock() {
    const el = document.getElementById("live-clock");
    function tick() {
      el.textContent = new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ── NAV ────────────────────────────────────── */
  function initNav() {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", e => {
        e.preventDefault();
        const sec = item.dataset.section;
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        item.classList.add("active");
        document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
        document.getElementById("section-" + sec)?.classList.add("active");
        document.getElementById("page-title").textContent = item.textContent.replace(/^[\S]+\s/, "").trim();
      });
    });
  }

  /* ── THEME ──────────────────────────────────── */
  function initTheme() {
    const saved = localStorage.getItem("mc_theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    document.getElementById("theme-toggle").textContent = saved === "dark" ? "☀️" : "🌙";

    document.getElementById("theme-toggle").addEventListener("click", () => {
      const cur  = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("mc_theme", next);
      document.getElementById("theme-toggle").textContent = next === "dark" ? "☀️" : "🌙";
    });
  }

  /* ── OVERVIEW ───────────────────────────────── */
  function renderOverview() {
    document.getElementById("stat-projects").textContent = projects.length;
    document.getElementById("stat-logs").textContent = devlog.length;

    const list = document.getElementById("recent-activity");
    const recent = [...devlog].reverse().slice(0, 6);
    if (!recent.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No activity yet. Start logging!</p></div>';
      return;
    }
    list.innerHTML = recent.map(e => `
      <div class="activity-item">
        <div class="activity-dot"></div>
        <div class="activity-text"><strong>${esc(e.project)}</strong> — ${esc(e.text)}</div>
        <div class="activity-time">${esc(e.date)}</div>
      </div>
    `).join("");
  }

  /* ── PROJECTS ───────────────────────────────── */
  function renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!projects.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🚀</div><p>No projects yet. Add your first one!</p></div>';
      return;
    }
    grid.innerHTML = projects.map(p => `
      <div class="project-card glass-card" data-id="${p.id}">
        <div class="project-header">
          <div class="project-name">${esc(p.name)}</div>
          ${statusBadge(p.status)}
        </div>
        <div class="project-desc">${esc(p.desc)}</div>
        <div class="project-links">
          ${p.github ? `<a class="project-link" href="${esc(p.github)}" target="_blank">📁 GitHub</a>` : ""}
          ${p.url    ? `<a class="project-link" href="${esc(p.url)}"    target="_blank">🌐 Live</a>`   : ""}
        </div>
        <div class="project-footer">
          <div class="project-date">${fmtDate(p.date)}</div>
          <button class="project-del" data-id="${p.id}" title="Delete">🗑</button>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll(".project-del").forEach(btn => {
      btn.addEventListener("click", () => {
        projects = projects.filter(p => p.id !== btn.dataset.id);
        DB.set("projects", projects);
        renderProjects();
        renderOverview();
        toast("Project deleted");
      });
    });
  }

  function initProjects() {
    const modal   = document.getElementById("project-modal");
    const addBtn  = document.getElementById("add-project-btn");
    const saveBtn = document.getElementById("save-project-btn");
    const cancelBtn = document.getElementById("cancel-project-btn");

    addBtn.addEventListener("click", () => modal.style.display = "flex");
    cancelBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

    saveBtn.addEventListener("click", () => {
      const name = document.getElementById("proj-name").value.trim();
      if (!name) { toast("Enter a project name"); return; }
      projects.push({
        id: uid(), name,
        desc:   document.getElementById("proj-desc").value.trim(),
        github: document.getElementById("proj-github").value.trim(),
        url:    document.getElementById("proj-url").value.trim(),
        status: document.getElementById("proj-status").value,
        date:   new Date().toISOString().slice(0,10)
      });
      DB.set("projects", projects);
      modal.style.display = "none";
      ["proj-name","proj-desc","proj-github","proj-url"].forEach(id => document.getElementById(id).value = "");
      renderProjects();
      renderOverview();
      toast("Project added ✅");
    });
  }

  /* ── DEV LOG ────────────────────────────────── */
  function renderDevLog() {
    const list = document.getElementById("devlog-list");
    if (!devlog.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No log entries yet.</p></div>';
      return;
    }
    list.innerHTML = [...devlog].reverse().map(e => `
      <div class="log-entry glass-card">
        ${logTypeBadge(e.type)}
        <div class="log-body">
          <div class="log-project">${esc(e.project)}</div>
          <div class="log-text">${esc(e.text)}</div>
          <div class="log-date">${esc(e.date)}</div>
        </div>
        <div class="log-actions">
          <button class="log-del" data-id="${e.id}">🗑</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".log-del").forEach(btn => {
      btn.addEventListener("click", () => {
        devlog = devlog.filter(e => e.id !== btn.dataset.id);
        DB.set("devlog", devlog);
        renderDevLog();
        renderOverview();
        toast("Entry deleted");
      });
    });
  }

  function initDevLog() {
    const form     = document.getElementById("log-form");
    const addBtn   = document.getElementById("add-log-btn");
    const saveBtn  = document.getElementById("save-log-btn");
    const cancelBtn= document.getElementById("cancel-log-btn");

    addBtn.addEventListener("click", () => {
      form.style.display = form.style.display === "none" ? "flex" : "none";
      form.style.flexDirection = "column";
      form.style.gap = "14px";
    });
    cancelBtn.addEventListener("click", () => form.style.display = "none");

    saveBtn.addEventListener("click", () => {
      const text = document.getElementById("log-text").value.trim();
      if (!text) { toast("Write something first"); return; }
      devlog.push({
        id: uid(),
        project: document.getElementById("log-project").value.trim() || "General",
        type:    document.getElementById("log-type").value,
        text,
        date:    nowStr()
      });
      DB.set("devlog", devlog);
      document.getElementById("log-text").value = "";
      document.getElementById("log-project").value = "";
      form.style.display = "none";
      renderDevLog();
      renderOverview();
      toast("Logged ✅");
    });
  }

  /* ── GOALS ──────────────────────────────────── */
  function renderGoals() {
    const list = document.getElementById("goals-list");
    if (!goals.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><p>No goals yet. Add one!</p></div>';
      return;
    }
    list.innerHTML = goals.map(g => `
      <div class="goal-item glass-card" data-id="${g.id}">
        <div class="goal-check ${g.done ? "done" : ""}" data-id="${g.id}">${g.done ? "✓" : ""}</div>
        <div class="goal-content">
          <div class="goal-text ${g.done ? "done" : ""}">${esc(g.text)}</div>
          <div class="goal-category">${esc(g.category)}</div>
        </div>
        <button class="goal-del" data-id="${g.id}">🗑</button>
      </div>
    `).join("");

    list.querySelectorAll(".goal-check").forEach(btn => {
      btn.addEventListener("click", () => {
        const g = goals.find(x => x.id === btn.dataset.id);
        if (g) { g.done = !g.done; DB.set("goals", goals); renderGoals(); }
      });
    });
    list.querySelectorAll(".goal-del").forEach(btn => {
      btn.addEventListener("click", () => {
        goals = goals.filter(g => g.id !== btn.dataset.id);
        DB.set("goals", goals);
        renderGoals();
        toast("Goal removed");
      });
    });
  }

  function initGoals() {
    document.getElementById("add-goal-btn").addEventListener("click", () => {
      const text = prompt("What's the goal?");
      if (!text?.trim()) return;
      const category = prompt("Category? (e.g. Income, WatchParty, Life Goal)") || "General";
      goals.push({ id: uid(), text: text.trim(), category: category.trim(), done: false });
      DB.set("goals", goals);
      renderGoals();
      toast("Goal added 🎯");
    });
  }

  /* ── UPTIME ─────────────────────────────────── */
  function renderMonitors() {
    const list = document.getElementById("uptime-list");
    if (!monitors.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🟢</div><p>No sites monitored. Add one!</p></div>';
      document.getElementById("wp-status-overview").textContent = "No monitors";
      return;
    }

    list.innerHTML = monitors.map(m => `
      <div class="uptime-card glass-card" data-id="${m.id}">
        <div class="uptime-status ${m.status}" title="${m.status}">
          ${m.status === "up" ? "🟢" : m.status === "down" ? "🔴" : "🟡"}
        </div>
        <div class="uptime-info">
          <div class="uptime-name">${esc(m.name)}</div>
          <div class="uptime-url">${esc(m.url)}</div>
          <div class="uptime-meta">Last checked: ${esc(m.lastChecked || "Never")}</div>
        </div>
        <div class="uptime-result ${m.status}">${m.status === "up" ? "● Online" : m.status === "down" ? "● Offline" : "Checking..."}</div>
        <button class="uptime-del" data-id="${m.id}">🗑</button>
      </div>
    `).join("");

    list.querySelectorAll(".uptime-del").forEach(btn => {
      btn.addEventListener("click", () => {
        monitors = monitors.filter(m => m.id !== btn.dataset.id);
        DB.set("monitors", monitors);
        renderMonitors();
        toast("Monitor removed");
      });
    });

    // Update overview widget
    const wp = monitors.find(m => m.name.toLowerCase().includes("watch"));
    if (wp) {
      document.getElementById("wp-status-overview").textContent =
        wp.status === "up" ? "🟢 Online" : wp.status === "down" ? "🔴 Offline" : "🟡 Checking...";
    }
  }

  async function checkMonitor(m) {
    m.status = "checking";
    m.lastChecked = nowStr();
    renderMonitors();
    try {
      // Use a CORS proxy for external URLs
      const res = await fetch(`https://api.allorigins.win/head?url=${encodeURIComponent(m.url)}`, { signal: AbortSignal.timeout(8000) });
      m.status = res.ok ? "up" : "down";
    } catch {
      m.status = "down";
    }
    m.lastChecked = nowStr();
    DB.set("monitors", monitors);
    renderMonitors();
  }

  function initUptime() {
    document.getElementById("add-uptime-btn").addEventListener("click", () => {
      const url  = document.getElementById("uptime-url-input").value.trim();
      const name = document.getElementById("uptime-name-input").value.trim();
      if (!url) { toast("Enter a URL"); return; }
      const m = { id: uid(), url, name: name || url, status: "checking", lastChecked: null };
      monitors.push(m);
      DB.set("monitors", monitors);
      document.getElementById("uptime-url-input").value = "";
      document.getElementById("uptime-name-input").value = "";
      renderMonitors();
      checkMonitor(m);
      toast("Monitor added 🟢");
    });

    document.getElementById("check-all-btn").addEventListener("click", () => {
      monitors.forEach(m => checkMonitor(m));
      toast("Checking all sites...");
    });

    // Auto-check every 2 minutes
    setInterval(() => monitors.forEach(m => checkMonitor(m)), 2 * 60 * 1000);
  }

  /* ── NOTES ──────────────────────────────────── */
  function renderNotes() {
    const grid = document.getElementById("notes-grid");
    let html = notes.map(n => `
      <div class="note-card glass-card" data-id="${n.id}">
        <div class="note-title">${esc(n.title)}</div>
        <div class="note-body">${esc(n.body)}</div>
        <div class="note-date">${esc(n.date)}</div>
      </div>
    `).join("");
    html += `<div class="note-add-card" id="note-add-card"><span style="font-size:1.5rem">+</span><span>New Note</span></div>`;
    grid.innerHTML = html;

    grid.querySelectorAll(".note-card").forEach(card => {
      card.addEventListener("click", () => {
        const n = notes.find(x => x.id === card.dataset.id);
        if (!n) return;
        const newBody = prompt("Edit note:", n.body);
        if (newBody === null) return;
        if (newBody.trim() === "") {
          if (confirm("Delete this note?")) {
            notes = notes.filter(x => x.id !== n.id);
            DB.set("notes", notes);
            renderNotes();
          }
          return;
        }
        n.body = newBody.trim();
        n.date = nowStr();
        DB.set("notes", notes);
        renderNotes();
      });
    });

    document.getElementById("note-add-card").addEventListener("click", addNote);
  }

  function addNote() {
    const title = prompt("Note title:");
    if (!title?.trim()) return;
    const body  = prompt("Note content:");
    if (body === null) return;
    notes.push({ id: uid(), title: title.trim(), body: (body||"").trim(), date: nowStr() });
    DB.set("notes", notes);
    renderNotes();
    toast("Note saved 📝");
  }

  function initNotes() {
    document.getElementById("add-note-btn").addEventListener("click", addNote);
  }

  /* ── BOOT ───────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", () => {
    startClock();
    initTheme();
    initNav();
    renderOverview();
    initProjects(); renderProjects();
    initDevLog();   renderDevLog();
    initGoals();    renderGoals();
    initUptime();   renderMonitors();
    initNotes();    renderNotes();
  });

})();
