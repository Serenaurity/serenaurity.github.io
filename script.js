(() => {
  "use strict";
  const tabs = [...document.querySelectorAll(".tab")];
  const panels = [...document.querySelectorAll(".panel")];
  const cards = document.querySelector("#repo-cards");
  const search = document.querySelector("#repo-search");
  const languageFilter = document.querySelector("#repo-language-filter");
  const refreshButton = document.querySelector("#repo-refresh");
  const status = document.querySelector("#repo-sync-status");
  const form = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#contact-status");
  const snapshot = Array.isArray(window.PORTFOLIO_REPOS) ? window.PORTFOLIO_REPOS : [];
  const apiUrl = "https://api.github.com/users/Serenaurity/repos?per_page=100";
  const repoNotes = {
    "cve-attack-role-kg": { label: "Research benchmark · In progress", text: "Role-aware CVE→MITRE ATT&CK ranking benchmark; source snapshots and a reference harness are present, while ingestion, baselines, ranking, and model results remain in progress." },
    "kaishi-drill": { label: "Prototype", text: "Single-file active-recall prototype for a Kaishi Anki export, with local audio and a localStorage heatmap; translation feedback uses a keyword-overlap heuristic." },
    "serenium-core": { label: "Design spec + scene prototype", text: "AI-OS desktop design exploration with a reported 2,912-node and 9,052-edge wiki-link snapshot; no full application code is represented as complete." },
    "sql-online-sale-analysis": { label: "SQL study", text: "AI-assisted SQL review and documentation project; its README states that queries, calculations, and findings were checked against dataset outputs." },
    "chinook-sql": { label: "Training project", text: "MySQL Workbench practice using the Chinook sample database, covering sales trends and basic data-quality checks." },
    "Northwind-sql": { label: "Training project", text: "Northwind sample-database analysis with 14 SQL scripts for profiling, sales, customer, product, employee, shipping, inventory, views, and query inspection." },
    "Financial_D-N-A": { label: "Concept · Pre-prototype", text: "Financial-intelligence design proposal centered on consented data, separate coverage and confidence controls, and offline synthetic-data evaluation." }
  };
  let repos = snapshot;

  function setPanel(id, updateHash) {
    const tab = tabs.find((item) => item.getAttribute("aria-controls") === id) || tabs[0];
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === tab.getAttribute("aria-controls");
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    if (updateHash) history.replaceState(null, "", "#" + tab.getAttribute("aria-controls"));
  }

  function safeUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" && parsed.hostname === "github.com" ? parsed.href : "https://github.com/Serenaurity";
    } catch {
      return "https://github.com/Serenaurity";
    }
  }

  function cleanRepos(items) {
    return items.filter((repo) => repo && repo.private === false && typeof repo.name === "string")
      .map((repo) => ({ name: repo.name, description: typeof repo.description === "string" ? repo.description : "", language: typeof repo.language === "string" ? repo.language : "", stars: Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0, forks: Number.isFinite(repo.forks_count) ? repo.forks_count : 0, url: safeUrl(repo.html_url) }));
  }

  function render() {
    const query = search.value.trim().toLowerCase();
    const language = languageFilter.value;
    const matching = cleanRepos(repos).filter((repo) => (!query || (repo.name + " " + repo.description).toLowerCase().includes(query)) && (!language || repo.language === language));
    cards.replaceChildren();
    if (!matching.length) {
      const empty = document.createElement("p");
      empty.className = "empty-repos";
      empty.textContent = "No public repositories match this filter.";
      cards.append(empty);
      return;
    }
    matching.forEach((repo) => {
      const card = document.createElement("article");
      card.className = "repo-card";
      const name = document.createElement("a");
      name.className = "repo-name";
      name.href = repo.url;
      name.target = "_blank";
      name.rel = "noreferrer";
      name.innerHTML = '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 2.75A.75.75 0 0 1 2.75 2h3.5a.75.75 0 0 1 .53.22l.75.75h5.72A.75.75 0 0 1 14 3.72v9.53a.75.75 0 0 1-.75.75h-10a.75.75 0 0 1-.75-.75V2.75Zm1.5.75v9h8.999V4.47H7.22a.75.75 0 0 1-.53-.22l-.75-.75H3.5Z"/></svg>';
      name.append(document.createTextNode(repo.name));
      const description = document.createElement("p");
      description.className = "repo-description";
      description.textContent = repo.description || "Public GitHub repository.";
      const meta = document.createElement("div");
      meta.className = "repo-meta";
      if (repo.language) {
        const languageItem = document.createElement("span");
        languageItem.className = "repo-language";
        languageItem.textContent = repo.language;
        meta.append(languageItem);
      }
      const stars = document.createElement("span");
      stars.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="m8 1.2 1.86 3.77 4.16.61-3.01 2.93.71 4.14L8 10.7l-3.72 1.95.71-4.14-3.01-2.93 4.16-.61L8 1.2Z"/></svg><span class="sr-only">Stars </span>';
      stars.append(document.createTextNode(String(repo.stars)));
      const forks = document.createElement("span");
      forks.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M5 2a2 2 0 1 1-3.999.001A2 2 0 0 1 5 2Zm10 0a2 2 0 1 1-3.999.001A2 2 0 0 1 15 2ZM8 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4.09 4.4a4.98 4.98 0 0 0 2.9 7.1v-1.6a3.48 3.48 0 0 1-1.5-4.78l-1.4-.72Zm7.82 0-1.4.72a3.48 3.48 0 0 1-1.5 4.78v1.6a4.98 4.98 0 0 0 2.9-7.1Z"/></svg><span class="sr-only">Forks </span>';
      forks.append(document.createTextNode(String(repo.forks)));
      meta.append(stars, forks);
      const note = repoNotes[repo.name];
      if (note) {
        const context = document.createElement("p");
        context.className = "repo-context";
        context.textContent = note.label + " — " + note.text;
        card.append(name, description, context, meta);
      } else {
        card.append(name, description, meta);
      }
      cards.append(card);
    });
  }

  function setLanguages() {
    const selected = languageFilter.value;
    const languages = [...new Set(cleanRepos(repos).map((repo) => repo.language).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    languageFilter.replaceChildren(new Option("All languages", ""));
    languages.forEach((language) => languageFilter.add(new Option(language, language)));
    languageFilter.value = languages.includes(selected) ? selected : "";
  }

  async function refresh() {
    refreshButton.disabled = true;
    refreshButton.textContent = "Refreshing…";
    status.textContent = "Checking GitHub for public repositories…";
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    try {
      let url = apiUrl;
      const collected = [];
      while (url) {
        const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal });
        if (!response.ok) throw new Error("GitHub response failed");
        const page = await response.json();
        if (!Array.isArray(page)) throw new Error("Unexpected GitHub response");
        collected.push(...page.filter((repo) => repo.private === false));
        const next = /<([^>]+)>; rel="next"/.exec(response.headers.get("Link") || "");
        url = next ? next[1] : "";
      }
      repos = collected;
      setLanguages();
      render();
      status.textContent = "Showing " + repos.length + " public repositories refreshed from GitHub at " + new Date().toLocaleString() + ".";
    } catch {
      repos = snapshot;
      setLanguages();
      render();
      status.textContent = "Could not refresh GitHub. Showing the bundled public-repository snapshot.";
    } finally {
      window.clearTimeout(timer);
      refreshButton.disabled = false;
      refreshButton.textContent = "Refresh list";
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setPanel(tab.getAttribute("aria-controls"), true));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      setPanel(tabs[next].getAttribute("aria-controls"), true);
    });
  });
  window.addEventListener("hashchange", () => setPanel(location.hash.slice(1), false));
  search.addEventListener("input", render);
  languageFilter.addEventListener("change", render);
  refreshButton.addEventListener("click", refresh);
  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      formStatus.textContent = "Please complete the required fields with a valid email address.";
      return;
    }
    if (location.protocol === "file:") {
      event.preventDefault();
      formStatus.textContent = "To send this message, preview the portfolio through a local HTTP server or a hosted site; FormSubmit cannot be verified from a file preview.";
      return;
    }
    document.querySelector("#contact-submit").disabled = true;
    document.querySelector("#contact-submit").textContent = "Opening FormSubmit…";
    formStatus.textContent = "Opening FormSubmit. Its CAPTCHA and confirmation flow will handle delivery.";
  });
  window.addEventListener("pageshow", () => {
    document.querySelector("#contact-submit").disabled = false;
    document.querySelector("#contact-submit").textContent = "Send message";
  });
  setPanel(panels.some((panel) => panel.id === location.hash.slice(1)) ? location.hash.slice(1) : "about", false);
  setLanguages();
  render();
  if (navigator.onLine) refresh();
})();


