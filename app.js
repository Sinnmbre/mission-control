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

/* ── IDEAS (appended) ───────────────────────── */
(function () {
  const DB2 = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem("mc_"+k)) ?? d; } catch { return d; } },
    set: (k, v) => localStorage.setItem("mc_"+k, JSON.stringify(v))
  };

  function uid2() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc2(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function nowStr2() { return new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}); }
  function toast2(msg) {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div"); t.className="toast"; t.textContent=msg; c.appendChild(t);
    setTimeout(()=>t.remove(),3200);
  }

  let ideas = DB2.get("ideas", []);
  let currentFilter = "all";

  // Seed default ideas from backlog
  if (ideas.length === 0) {
    const defaults = [
      { title: "WatchParty uptime auto-monitor", desc: "Auto-add WatchParty to the uptime monitor the first time someone visits Mission Control." },
      { title: "Income tracker", desc: "Log freelance and sales income over time. See monthly totals and progress toward the goal." },
      { title: "Pomodoro timer", desc: "Built-in 25/5 Pomodoro timer so Domidev can focus sessions without leaving the dashboard." },
      { title: "Roadmap / Kanban board", desc: "Kanban view for projects: To Do → In Progress → Done. Drag and drop cards." },
      { title: "Daily standup prompt", desc: "Each morning, a quick 3-question prompt: What did I do? What's next? Any blockers?" },
      { title: "Countdown to goal date", desc: "Set a target date (e.g. leave warehouse by X) and show a live countdown on the overview." },
      { title: "Quick-add keyboard shortcuts", desc: "Press N for new note, L for new log entry, I for new idea — never touch the mouse." },
      { title: "Export dev log as Markdown", desc: "One-click export of the full dev log as a .md file — great for sharing progress." },
      { title: "Streak tracker", desc: "Track how many days in a row Domidev has worked on a project. Motivational streak counter." },
      { title: "GitHub commit feed", desc: "Show recent commits from active GitHub repos directly in the dashboard." },
    ];
    ideas = defaults.map(d => ({ id: uid2(), title: d.title, desc: d.desc, status: "pending", date: "2026-02-19", proposedBy: "NightClaw 🌙" }));
    DB2.set("ideas", ideas);
  }

  function statusIcon(s) {
    return { pending:"⏳", approved:"✅", rejected:"❌", built:"🚀" }[s] || "💡";
  }

  function renderIdeas() {
    const list = document.getElementById("ideas-list");
    if (!list) return;
    const filtered = currentFilter === "all" ? ideas : ideas.filter(i => i.status === currentFilter);

    if (!filtered.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💡</div><p>No ideas in this category yet.</p></div>`;
      return;
    }

    list.innerHTML = [...filtered].reverse().map(idea => `
      <div class="idea-card glass-card" data-id="${idea.id}">
        <div class="idea-status-icon">${statusIcon(idea.status)}</div>
        <div class="idea-body">
          <div class="idea-title">${esc2(idea.title)}</div>
          <div class="idea-desc">${esc2(idea.desc)}</div>
          <div>
            <span class="idea-status-badge badge-${idea.status}">${idea.status.charAt(0).toUpperCase()+idea.status.slice(1)}</span>
          </div>
          <div class="idea-meta">Proposed by ${esc2(idea.proposedBy||"?")} · ${esc2(idea.date)}</div>
        </div>
        <div class="idea-actions">
          ${idea.status !== "approved" && idea.status !== "built" ? `<button class="idea-btn idea-btn-approve" data-id="${idea.id}" data-action="approved">✅ Approve</button>` : ""}
          ${idea.status !== "rejected" ? `<button class="idea-btn idea-btn-reject" data-id="${idea.id}" data-action="rejected">❌ Reject</button>` : ""}
          ${idea.status === "approved" ? `<button class="idea-btn idea-btn-built" data-id="${idea.id}" data-action="built">🚀 Mark Built</button>` : ""}
          <button class="idea-btn idea-btn-del" data-id="${idea.id}" data-action="delete">🗑</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".idea-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const { id, action } = btn.dataset;
        if (action === "delete") {
          ideas = ideas.filter(i => i.id !== id);
          toast2("Idea removed");
        } else {
          const idea = ideas.find(i => i.id === id);
          if (idea) { idea.status = action; toast2(`Idea marked as ${action} ${statusIcon(action)}`); }
        }
        DB2.set("ideas", ideas);
        renderIdeas();
      });
    });
  }

  function initIdeas() {
    // Tab filters
    document.querySelectorAll(".idea-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".idea-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentFilter = tab.dataset.filter;
        renderIdeas();
      });
    });

    // Add idea button
    document.getElementById("add-idea-btn")?.addEventListener("click", () => {
      const title = prompt("Idea title:");
      if (!title?.trim()) return;
      const desc = prompt("Describe the idea:");
      if (desc === null) return;
      ideas.push({ id: uid2(), title: title.trim(), desc: (desc||"").trim(), status: "pending", date: nowStr2(), proposedBy: "Domidev" });
      DB2.set("ideas", ideas);
      renderIdeas();
      toast2("Idea added 💡");
    });
  }

  // Wait for DOM then init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initIdeas(); renderIdeas(); });
  } else {
    initIdeas(); renderIdeas();
  }
})();

/* ── INCOME TRACKER (appended) ──────────────── */
(function () {
  const DB3 = {
    get: (k,d) => { try { return JSON.parse(localStorage.getItem("mc_"+k)) ?? d; } catch { return d; } },
    set: (k,v) => localStorage.setItem("mc_"+k, JSON.stringify(v))
  };

  function uid3() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc3(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function toast3(msg) {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div"); t.className="toast"; t.textContent=msg; c.appendChild(t);
    setTimeout(()=>t.remove(),3200);
  }
  function fmtMoney(n) { return "$" + Number(n||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }

  let income = DB3.get("income", []);

  const TYPE_ICONS = { freelance:"💻", product:"📦", agency:"🤖", content:"📱", other:"💼" };
  const TYPE_LABELS= { freelance:"Freelance", product:"Digital Product", agency:"Agency", content:"Content", other:"Other" };

  function getMonthKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  }

  function getMonthLabel(key) {
    const [y,m] = key.split("-");
    return new Date(y, m-1, 1).toLocaleString("en-US",{month:"short"}) + " " + y.slice(2);
  }

  function renderStats() {
    const total = income.reduce((s,e) => s + Number(e.amount||0), 0);
    const now   = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const monthTotal = income.filter(e => getMonthKey(e.date) === thisMonthKey).reduce((s,e)=>s+Number(e.amount||0),0);

    // Best month
    const byMonth = {};
    income.forEach(e => { const k = getMonthKey(e.date); byMonth[k] = (byMonth[k]||0) + Number(e.amount||0); });
    const best = Math.max(0, ...Object.values(byMonth));

    const t = document.getElementById("income-total");
    const m = document.getElementById("income-month");
    const b = document.getElementById("income-best");
    if (t) t.textContent = fmtMoney(total);
    if (m) m.textContent = fmtMoney(monthTotal);
    if (b) b.textContent = fmtMoney(best);
  }

  function renderChart() {
    const chart = document.getElementById("income-chart");
    if (!chart) return;

    if (!income.length) {
      chart.innerHTML = '<div class="chart-empty">Log your first income to see the chart 📈</div>';
      return;
    }

    // Build monthly totals — last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      months.push({ key, label: getMonthLabel(key), total: 0 });
    }

    income.forEach(e => {
      const k = getMonthKey(e.date);
      const m = months.find(x => x.key === k);
      if (m) m.total += Number(e.amount||0);
    });

    const max = Math.max(1, ...months.map(m => m.total));

    chart.innerHTML = months.map(m => {
      const pct = Math.round((m.total / max) * 90);
      const hasData = m.total > 0;
      return `
        <div class="chart-col">
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${hasData ? Math.max(pct,4) : 3}px; opacity:${hasData?1:0.2};" data-tip="${fmtMoney(m.total)}"></div>
          </div>
          <div class="chart-label">${m.label}</div>
        </div>
      `;
    }).join("");
  }

  function renderIncome() {
    const list = document.getElementById("income-list");
    if (!list) return;
    renderStats();
    renderChart();

    if (!income.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💰</div><p>No income logged yet. Every dollar counts!</p></div>';
      return;
    }

    list.innerHTML = [...income].reverse().map(e => `
      <div class="income-entry glass-card" data-id="${e.id}">
        <div class="income-type-icon">${TYPE_ICONS[e.type]||"💼"}</div>
        <div class="income-info">
          <div class="income-source">${esc3(e.source)}</div>
          <div class="income-meta">${TYPE_LABELS[e.type]||e.type} · ${esc3(e.date)}${e.notes ? " · " + esc3(e.notes) : ""}</div>
        </div>
        <div class="income-amount">+${fmtMoney(e.amount)}</div>
        <button class="income-del" data-id="${e.id}">🗑</button>
      </div>
    `).join("");

    list.querySelectorAll(".income-del").forEach(btn => {
      btn.addEventListener("click", () => {
        income = income.filter(e => e.id !== btn.dataset.id);
        DB3.set("income", income);
        renderIncome();
        toast3("Entry removed");
      });
    });
  }

  function initIncome() {
    const form      = document.getElementById("income-form");
    const addBtn    = document.getElementById("add-income-btn");
    const saveBtn   = document.getElementById("save-income-btn");
    const cancelBtn = document.getElementById("cancel-income-btn");
    const dateInput = document.getElementById("income-date");

    // Default date to today
    if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

    addBtn?.addEventListener("click", () => {
      form.style.display = form.style.display === "none" ? "flex" : "none";
      form.style.flexDirection = "column";
      form.style.gap = "14px";
      if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);
    });

    cancelBtn?.addEventListener("click", () => form.style.display = "none");

    saveBtn?.addEventListener("click", () => {
      const source = document.getElementById("income-source")?.value.trim();
      const amount = parseFloat(document.getElementById("income-amount")?.value);
      const type   = document.getElementById("income-type")?.value;
      const notes  = document.getElementById("income-notes")?.value.trim();
      const date   = document.getElementById("income-date")?.value;

      if (!source) { toast3("Enter a source"); return; }
      if (!amount || amount <= 0) { toast3("Enter a valid amount"); return; }

      income.push({ id: uid3(), source, amount, type, notes, date: date || new Date().toISOString().slice(0,10) });
      DB3.set("income", income);

      // Reset form
      ["income-source","income-amount","income-notes"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
      form.style.display = "none";
      renderIncome();
      toast3(`💰 +${fmtMoney(amount)} logged!`);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initIncome(); renderIncome(); });
  } else {
    initIncome(); renderIncome();
  }
})();

/* ── SCHEDULE (appended) ─────────────────────── */
(function () {
  const DB4 = {
    get: (k,d) => { try { return JSON.parse(localStorage.getItem("mc_"+k)) ?? d; } catch { return d; } },
    set: (k,v) => localStorage.setItem("mc_"+k, JSON.stringify(v))
  };

  function uid4() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc4(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function toast4(msg) {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div"); t.className="toast"; t.textContent=msg; c.appendChild(t);
    setTimeout(()=>t.remove(),3000);
  }

  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // Get the Monday of the current week
  function getWeekDays() {
    const now = new Date();
    const dow = now.getDay(); // 0=Sun
    const days = [];
    // Start from Sunday
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - dow + i);
      days.push(d);
    }
    return days;
  }

  function dateKey(d) {
    return d.toISOString().slice(0,10);
  }

  function isToday(d) {
    return dateKey(d) === dateKey(new Date());
  }

  function isPast(d) {
    const today = new Date(); today.setHours(0,0,0,0);
    const dd = new Date(d); dd.setHours(0,0,0,0);
    return dd < today;
  }

  let schedule = DB4.get("schedule", {}); // { "2026-02-19": [{id, text, done}] }

  function renderSchedule() {
    const container = document.getElementById("schedule-week");
    if (!container) return;

    const days = getWeekDays();
    container.innerHTML = "";

    days.forEach(day => {
      const key   = dateKey(day);
      const tasks = schedule[key] || [];
      const done  = tasks.filter(t => t.done).length;
      const total = tasks.length;
      const pct   = total ? Math.round((done/total)*100) : 0;
      const today = isToday(day);
      const past  = isPast(day);

      const card = document.createElement("div");
      card.className = "day-card" + (today ? " today" : "") + (past && !today ? " past" : "");
      card.innerHTML = `
        <div class="day-header">
          <div class="day-name">${DAY_SHORT[day.getDay()]}</div>
          ${today ? '<span class="day-today-badge">Today</span>' : `<span class="day-date">${day.getDate()}/${day.getMonth()+1}</span>`}
        </div>
        <div class="day-tasks" id="tasks-${key}">
          ${tasks.map(t => `
            <div class="day-task" data-key="${key}" data-id="${t.id}">
              <div class="task-check ${t.done ? "done" : ""}">${t.done ? "✓" : ""}</div>
              <span class="task-text ${t.done ? "done" : ""}">${esc4(t.text)}</span>
            </div>
          `).join("")}
        </div>
        ${total > 0 ? `
          <div class="day-progress">${done}/${total}</div>
          <div class="day-progress-bar"><div class="day-progress-fill" style="width:${pct}%"></div></div>
        ` : ""}
        <button class="day-add-btn" data-key="${key}">+ Add task</button>
      `;

      // Task check toggle
      card.querySelectorAll(".day-task").forEach(taskEl => {
        taskEl.addEventListener("click", () => {
          const { key: k, id } = taskEl.dataset;
          const task = (schedule[k]||[]).find(t => t.id === id);
          if (task) {
            task.done = !task.done;
            DB4.set("schedule", schedule);
            renderSchedule();
            if (task.done) toast4("✅ Done!");
          }
        });
      });

      // Add task button
      card.querySelector(".day-add-btn").addEventListener("click", () => {
        const text = prompt(`Add task for ${DAY_NAMES[day.getDay()]}:`);
        if (!text?.trim()) return;
        if (!schedule[key]) schedule[key] = [];
        schedule[key].push({ id: uid4(), text: text.trim(), done: false });
        DB4.set("schedule", schedule);
        renderSchedule();
      });

      container.appendChild(card);
    });
  }

  function initSchedule() {
    document.getElementById("reset-week-btn")?.addEventListener("click", () => {
      if (!confirm("Reset all tasks for this week? Completed tasks will be cleared.")) return;
      const days = getWeekDays();
      days.forEach(d => { delete schedule[dateKey(d)]; });
      DB4.set("schedule", schedule);
      renderSchedule();
      toast4("Week reset 🔄");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initSchedule(); renderSchedule(); });
  } else {
    initSchedule(); renderSchedule();
  }
})();

/* ── WIN WALL (appended) ─────────────────────── */
(function () {
  const DB5 = {
    get: (k,d) => { try { return JSON.parse(localStorage.getItem("mc_"+k)) ?? d; } catch { return d; } },
    set: (k,v) => localStorage.setItem("mc_"+k, JSON.stringify(v))
  };

  function uid5() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc5(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function toast5(msg) {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div"); t.className="toast"; t.textContent=msg; c.appendChild(t);
    setTimeout(()=>t.remove(),3500);
  }
  function nowDate() { return new Date().toISOString().slice(0,10); }
  function fmtDateNice(d) { return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); }

  const QUOTES = [
    { text: "Every expert was once a beginner. Every pro was once an amateur.", author: "— Unknown" },
    { text: "The warehouse is temporary. The mission is forever.", author: "— NightClaw 🌙" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "— Zig Ziglar" },
    { text: "Small wins compound. Log every single one.", author: "— NightClaw 🌙" },
    { text: "The man who moves a mountain begins by carrying away small stones.", author: "— Confucius" },
    { text: "Ship it. Improve it. Ship it again.", author: "— NightClaw 🌙" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "— R. Collier" },
    { text: "You are one decision away from a completely different life.", author: "— Unknown" },
    { text: "Building your own thing while working 10 hours? That's not hustle. That's war.", author: "— NightClaw 🌙" },
  ];

  const WIN_EMOJIS = { build:"🔨", launch:"🚀", client:"🤝", income:"💰", learn:"📚", personal:"⭐", milestone:"🏆" };

  let wins = DB5.get("wins", []);

  // Seed with today's first win
  if (wins.length === 0) {
    wins = [
      { id: uid5(), title: "Built WatchParty from scratch", desc: "Full synchronized watch party app — WebSocket server, live chat, emoji reactions, queue, no API keys.", category: "build", size: "big", date: "2026-02-19" },
      { id: uid5(), title: "Launched Mission Control", desc: "Personal command center to track every project, goal, and decision. Always running on the server.", category: "launch", size: "big", date: "2026-02-19" },
      { id: uid5(), title: "First day building toward freedom", desc: "Decided to start. That's already more than most people do.", category: "personal", size: "big", date: "2026-02-19" },
    ];
    DB5.set("wins", wins);
  }

  function calcStreak() {
    if (!wins.length) return 0;
    const dates = [...new Set(wins.map(w => w.date))].sort().reverse();
    let streak = 0;
    let check = new Date(); check.setHours(0,0,0,0);
    for (const d of dates) {
      const wd = new Date(d); wd.setHours(0,0,0,0);
      const diff = Math.round((check - wd) / 86400000);
      if (diff === 0 || diff === streak) { streak++; check = wd; }
      else if (diff === 1) { streak++; check = wd; }
      else break;
    }
    return streak;
  }

  function renderWins() {
    // Stats
    const streak = calcStreak();
    const total  = wins.length;
    const now    = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
    const weekWins  = wins.filter(w => new Date(w.date) >= weekStart).length;

    const streakEl = document.getElementById("win-streak");
    const totalEl  = document.getElementById("win-total");
    const weekEl   = document.getElementById("win-week");
    if (streakEl) streakEl.textContent = streak + (streak === 1 ? " day 🔥" : " days 🔥");
    if (totalEl)  totalEl.textContent  = total;
    if (weekEl)   weekEl.textContent   = weekWins;

    // Random motivational quote
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const qEl = document.getElementById("win-quote");
    if (qEl) qEl.innerHTML = `
      <div class="win-quote-icon">💬</div>
      <div>
        <div class="win-quote-text">"${esc5(q.text)}"</div>
        <div class="win-quote-author">${esc5(q.author)}</div>
      </div>
    `;

    // Wall
    const wall = document.getElementById("wins-wall");
    if (!wall) return;

    if (!wins.length) {
      wall.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>No wins yet — log your first one!</p></div>';
      return;
    }

    wall.innerHTML = [...wins].reverse().map((w, i) => `
      <div class="win-card glass-card win-size-${w.size||"small"}" data-id="${w.id}">
        <div class="win-header">
          <div class="win-emoji">${WIN_EMOJIS[w.category]||"⭐"}</div>
          <div class="win-title-wrap">
            <div class="win-title">${esc5(w.title)}</div>
            <span class="win-category-badge">${esc5(w.category||"win")}</span>
          </div>
        </div>
        ${w.desc ? `<div class="win-desc">${esc5(w.desc)}</div>` : ""}
        <div class="win-footer">
          <div class="win-date">${fmtDateNice(w.date)}</div>
          <button class="win-del" data-id="${w.id}">🗑</button>
        </div>
      </div>
    `).join("");

    wall.querySelectorAll(".win-del").forEach(btn => {
      btn.addEventListener("click", () => {
        wins = wins.filter(w => w.id !== btn.dataset.id);
        DB5.set("wins", wins);
        renderWins();
        toast5("Win removed");
      });
    });
  }

  function initWins() {
    document.getElementById("add-win-btn")?.addEventListener("click", () => {
      const title = prompt("What did you win / achieve / ship?");
      if (!title?.trim()) return;
      const desc = prompt("Describe it (optional):") || "";
      const cat  = prompt("Category:\nbuild / launch / client / income / learn / personal / milestone") || "personal";
      const size = prompt("Size? big / small") || "small";

      wins.push({ id: uid5(), title: title.trim(), desc: desc.trim(), category: cat.trim().toLowerCase(), size: size.trim().toLowerCase(), date: nowDate() });
      DB5.set("wins", wins);
      renderWins();

      // Animate newest card
      setTimeout(() => {
        const cards = document.querySelectorAll(".win-card");
        if (cards[0]) { cards[0].classList.add("new-win"); }
      }, 50);

      toast5("🏆 Win logged! Keep going!");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initWins(); renderWins(); });
  } else {
    initWins(); renderWins();
  }
})();

/* ── CRM / CLIENTS (appended) ────────────────── */
(function () {
  const DB6 = {
    get: (k,d) => { try { return JSON.parse(localStorage.getItem("mc_"+k)) ?? d; } catch { return d; } },
    set: (k,v) => localStorage.setItem("mc_"+k, JSON.stringify(v))
  };

  function uid6() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc6(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function fmtMoney6(n) { return "$" + Number(n||0).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0}); }
  function toast6(msg) {
    const c = document.getElementById("toast-container");
    const t = document.createElement("div"); t.className="toast"; t.textContent=msg; c.appendChild(t);
    setTimeout(()=>t.remove(),3000);
  }
  function nowDate6() { return new Date().toISOString().slice(0,10); }
  function fmtD(d) { return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}); }

  const STAGES = [
    { key: "lead",     label: "Lead",      desc: "New prospect" },
    { key: "contact",  label: "Contacted", desc: "Reached out" },
    { key: "proposal", label: "Proposal",  desc: "Sent offer" },
    { key: "active",   label: "Client",    desc: "Paying now" },
    { key: "closed",   label: "Closed",    desc: "Done / lost" },
  ];

  const NEXT_STAGE = { lead:"contact", contact:"proposal", proposal:"active", active:"closed" };
  const PREV_STAGE = { contact:"lead", proposal:"contact", active:"proposal", closed:"active" };

  let clients = DB6.get("crm_clients", []);

  function renderCRM() {
    // Stats
    const leads    = clients.filter(c => c.stage === "lead" || c.stage === "contact").length;
    const active   = clients.filter(c => c.stage === "active").length;
    const pipeline = clients.filter(c => c.stage !== "closed").reduce((s,c) => s + Number(c.value||0), 0);

    const lEl = document.getElementById("crm-leads");
    const aEl = document.getElementById("crm-active");
    const pEl = document.getElementById("crm-pipeline");
    if (lEl) lEl.textContent = leads;
    if (aEl) aEl.textContent = active;
    if (pEl) pEl.textContent = fmtMoney6(pipeline);

    // Board
    const board = document.getElementById("crm-board");
    if (!board) return;

    board.innerHTML = STAGES.map(stage => {
      const cards = clients.filter(c => c.stage === stage.key);
      return `
        <div class="crm-col crm-col-${stage.key}">
          <div class="crm-col-header">
            <span>${stage.label}</span>
            <span class="crm-col-count">${cards.length}</span>
          </div>
          ${cards.length === 0
            ? `<div class="crm-empty">Empty</div>`
            : cards.map(c => `
              <div class="crm-card glass-card" data-id="${c.id}">
                <div class="crm-card-name">${esc6(c.name)}</div>
                <div class="crm-card-type">${esc6(c.service||"")}</div>
                ${c.value ? `<div class="crm-card-value">${fmtMoney6(c.value)}</div>` : ""}
                ${c.note  ? `<div class="crm-card-note">${esc6(c.note)}</div>` : ""}
                <div class="crm-card-date">Added ${fmtD(c.date)}</div>
                <div class="crm-card-actions">
                  ${NEXT_STAGE[c.stage] ? `<button class="crm-move-btn" data-id="${c.id}" data-dir="next">→ ${STAGES.find(s=>s.key===NEXT_STAGE[c.stage])?.label}</button>` : ""}
                  ${PREV_STAGE[c.stage] ? `<button class="crm-move-btn" data-id="${c.id}" data-dir="prev">← Back</button>` : ""}
                  <button class="crm-del-btn" data-id="${c.id}">🗑</button>
                </div>
              </div>
            `).join("")
          }
        </div>
      `;
    }).join("");

    // Move buttons
    board.querySelectorAll(".crm-move-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const c = clients.find(x => x.id === btn.dataset.id);
        if (!c) return;
        c.stage = btn.dataset.dir === "next" ? NEXT_STAGE[c.stage] : PREV_STAGE[c.stage];
        DB6.set("crm_clients", clients);
        renderCRM();
        toast6(`Moved to ${STAGES.find(s=>s.key===c.stage)?.label} ✅`);
      });
    });

    // Delete
    board.querySelectorAll(".crm-del-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        clients = clients.filter(c => c.id !== btn.dataset.id);
        DB6.set("crm_clients", clients);
        renderCRM();
        toast6("Removed");
      });
    });
  }

  function initCRM() {
    document.getElementById("add-client-btn")?.addEventListener("click", () => {
      const name    = prompt("Name / Company:");
      if (!name?.trim()) return;
      const service = prompt("Service? (e.g. Freelance Build, AI Automation, Website)") || "";
      const value   = parseFloat(prompt("Deal value $ (leave blank if unknown):") || "0") || 0;
      const note    = prompt("Any notes? (optional)") || "";

      clients.push({ id: uid6(), name: name.trim(), service: service.trim(), value, note: note.trim(), stage: "lead", date: nowDate6() });
      DB6.set("crm_clients", clients);
      renderCRM();
      toast6("Lead added 🎯");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initCRM(); renderCRM(); });
  } else {
    initCRM(); renderCRM();
  }
})();
