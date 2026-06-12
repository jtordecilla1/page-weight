// Map tabId -> array of captured requests
const tabRequests = {};

// Clear requests when a tab starts a new navigation
chrome.webNavigation.onBeforeNavigate.addListener(({ tabId, frameId }) => {
  if (frameId === 0) tabRequests[tabId] = [];
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabRequests[tabId];
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RESOURCE_ENTRY" && sender.tab) {
    const tabId = sender.tab.id;
    if (!tabRequests[tabId]) tabRequests[tabId] = [];
    tabRequests[tabId].push({
      url: message.entry.url,
      type: message.entry.initiatorType,
      size: message.entry.transferSize > 0 ? message.entry.transferSize : null,
    });
  } else if (message.type === "GET_REQUESTS") {
    sendResponse({ requests: tabRequests[message.tabId] || [] });
  }
});
