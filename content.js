// Reports resource sizes (from the Resource Timing API) to the background service worker.
const reported = new Set();

function reportEntry(entry, typeOverride) {
  const key = `${entry.entryType}:${entry.name}`;
  if (reported.has(key)) return;
  reported.add(key);
  try {
    chrome.runtime.sendMessage({
      type: "RESOURCE_ENTRY",
      entry: {
        url: entry.name,
        initiatorType: typeOverride || entry.initiatorType || "other",
        transferSize: entry.transferSize || 0,
      },
    });
  } catch {
    // extension context may be gone (page unloading) - ignore
  }
}

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    reportEntry(entry, entry.entryType === "navigation" ? "document" : undefined);
  }
});

observer.observe({ type: "resource", buffered: true });
observer.observe({ type: "navigation", buffered: true });
