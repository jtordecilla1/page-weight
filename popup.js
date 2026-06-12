const LARGE_BYTES = 500_000;
const MEDIUM_BYTES = 100_000;

let allRequests = [];
let activeType = "all";
let searchQuery = "";
let sortCol = "size";
let sortDir = "desc";

function formatBytes(n) {
  if (n == null) return "unknown";
  if (n >= 1_048_576) return (n / 1_048_576).toFixed(2) + " MB";
  if (n >= 1_024) return (n / 1_024).toFixed(1) + " KB";
  return n + " B";
}

function shortUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + u.pathname;
  } catch {
    return url;
  }
}

function normalizeType(type) {
  if (type === "xmlhttprequest") return "fetch";
  if (type === "link" || type === "css") return "stylesheet";
  if (type === "img") return "image";
  return type;
}

function buildFilters(requests) {
  const types = ["all", ...new Set(requests.map((r) => normalizeType(r.type)))];
  const container = document.getElementById("filters");
  container.innerHTML = "";
  types.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (t === activeType ? " active" : "");
    btn.textContent = t;
    btn.addEventListener("click", () => {
      activeType = t;
      render();
    });
    container.appendChild(btn);
  });
}

function getSortValue(req, col) {
  if (col === "url") return shortUrl(req.url).toLowerCase();
  if (col === "type") return normalizeType(req.type);
  if (col === "size") return req.size ?? -1;
  return "";
}

function render() {
  // rebuild filter buttons to reflect active state
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.textContent === activeType);
  });

  let filtered = allRequests.filter((r) => {
    const typeMatch = activeType === "all" || normalizeType(r.type) === activeType;
    const searchMatch = searchQuery === "" || r.url.toLowerCase().includes(searchQuery);
    return typeMatch && searchMatch;
  });

  // sort
  filtered.sort((a, b) => {
    const av = getSortValue(a, sortCol);
    const bv = getSortValue(b, sortCol);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const tbody = document.getElementById("tbody");
  const empty = document.getElementById("empty");
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    empty.style.display = "block";
    document.getElementById("summary").textContent = "no results";
    return;
  }

  empty.style.display = "none";

  // summary
  const knownSizes = filtered.filter((r) => r.size != null).map((r) => r.size);
  const totalKnown = knownSizes.reduce((a, b) => a + b, 0);
  const unknown = filtered.length - knownSizes.length;
  const summaryParts = [
    `${filtered.length} resources`,
    `${formatBytes(totalKnown)} measured`,
  ];
  if (unknown > 0) summaryParts.push(`${unknown} unknown`);
  document.getElementById("summary").textContent = summaryParts.join("  ·  ");

  filtered.forEach(({ url, type, size }) => {
    const tr = document.createElement("tr");
    const normType = normalizeType(type);

    let sizeClass = "td-size";
    if (size == null) sizeClass += "";
    else if (size >= LARGE_BYTES) sizeClass += " known large";
    else if (size >= MEDIUM_BYTES) sizeClass += " known medium";
    else sizeClass += " known";

    tr.innerHTML = `
      <td class="td-url col-url" title="${url}">${shortUrl(url)}</td>
      <td class="td-type col-type type-${normType}">${normType}</td>
      <td class="${sizeClass} col-size">${formatBytes(size)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initSortHeaders() {
  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir = sortDir === "desc" ? "asc" : "desc";
      } else {
        sortCol = col;
        sortDir = "desc";
      }
      document.querySelectorAll("th.sortable").forEach((h) => {
        h.classList.remove("active", "asc");
      });
      th.classList.add("active");
      if (sortDir === "asc") th.classList.add("asc");
      render();
    });
  });
}

async function init() {
  initSortHeaders();

  document.getElementById("search").addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ type: "GET_REQUESTS", tabId: tab.id }, (res) => {
    allRequests = res?.requests || [];
    document.getElementById("loading").style.display = "none";
    document.getElementById("tableWrap").style.display = "";
    buildFilters(allRequests);
    render();
  });
}

init();
