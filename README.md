# Page Weight

A Chrome extension that inspects the size of every resource loaded by a page —
scripts, stylesheets, images, fonts, and the document itself — so you can see
where a page's weight comes from.

## Features

- Per-tab breakdown of every resource loaded, with its real transferred size
  (via the Resource Timing API, so it reflects compression/caching).
- Filter by resource type (document, script, stylesheet, image, etc.).
- Search/filter by URL.
- Sort by URL, type, or size.
- Color-coded sizes to highlight large and medium-sized resources.

## Installation (load unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select this project's folder.
4. Pin the "Page Weight" icon to your toolbar for quick access.

## Usage

1. Visit any webpage and let it fully load.
2. Click the Page Weight icon in the toolbar.
3. The popup shows a summary (total resources, total measured size) and a
   table of every resource with its type and size.
4. Use the filter buttons or search box to narrow down the list, and click
   column headers to sort.

> Note: only resources loaded *after* the page begins loading (captured via a
> content script) are measured. Reload the page before opening the popup for
> the most complete picture. Some cross-origin resources may show "unknown"
> size if the server doesn't send a `Timing-Allow-Origin` header.

## How it works

- `content.js` — injected into every page, uses the
  [Resource Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Resource_timing)
  to capture each resource's transfer size and reports it to the background
  service worker.
- `background.js` — collects resource entries per tab, clearing them on each
  new top-level navigation.
- `popup.js` / `popup.html` / `popup.css` — the UI shown when clicking the
  toolbar icon, fetching the current tab's data from the background script.

## Permissions

- `activeTab` — to identify the current tab when the popup opens.
- `webNavigation` — to clear stale data when a tab navigates to a new page.
- `storage` — reserved for future settings/persistence.
- `<all_urls>` (host permission) — required for the content script to run on
  all pages.
## Demo

<img width="556" height="482" alt="image" src="https://github.com/user-attachments/assets/c383ff8f-7bda-4693-b488-97d9d9420864" />
