// Peeeky for Gmail — Content Script
// Injects "Peeeky" button into Gmail compose toolbar and handles link insertion

const PEEEKY_API = "https://peeeky.com/api/extension";
const PEEEKY_URL = "https://peeeky.com";

let cachedDocs = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

async function fetchDocs() {
  if (cachedDocs && Date.now() - cacheTime < CACHE_TTL) return cachedDocs;

  const { apiKey } = await chrome.storage.local.get("apiKey");
  const headers = {};
  if (apiKey) headers["x-peeeky-key"] = apiKey;

  try {
    const res = await fetch(PEEEKY_API, {
      headers,
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    cachedDocs = data.documents || [];
    cacheTime = Date.now();
    return cachedDocs;
  } catch {
    return null;
  }
}

function createDropdown(docs, composeBox) {
  // Remove existing dropdown
  document.querySelectorAll(".peeeky-dropdown").forEach(el => el.remove());

  const dropdown = document.createElement("div");
  dropdown.className = "peeeky-dropdown";

  if (!docs || docs.length === 0) {
    dropdown.innerHTML = `
      <div class="peeeky-dropdown-empty">
        <p>No documents found.</p>
        <a href="${PEEEKY_URL}/documents" target="_blank">Upload a document</a>
      </div>
    `;
  } else {
    let html = '<div class="peeeky-dropdown-header">Insert tracked link</div>';
    html += '<div class="peeeky-dropdown-list">';

    for (const doc of docs) {
      for (const link of doc.links) {
        html += `
          <div class="peeeky-dropdown-item" data-url="${link.url}" data-name="${doc.name}">
            <div class="peeeky-dropdown-item-name">${doc.name}</div>
            <div class="peeeky-dropdown-item-meta">${link.views} view${link.views !== 1 ? "s" : ""} · ${link.slug}</div>
          </div>
        `;
      }
    }

    html += "</div>";
    html += `<a class="peeeky-dropdown-footer" href="${PEEEKY_URL}/documents" target="_blank">Manage documents ↗</a>`;
    dropdown.innerHTML = html;
  }

  // Position near the button
  document.body.appendChild(dropdown);

  // Handle clicks on items
  dropdown.querySelectorAll(".peeeky-dropdown-item").forEach(item => {
    item.addEventListener("click", () => {
      const url = item.dataset.url;
      const name = item.dataset.name;
      insertLinkIntoCompose(composeBox, url, name);
      dropdown.remove();
    });
  });

  // Close on outside click
  setTimeout(() => {
    const handler = (e) => {
      if (!dropdown.contains(e.target) && !e.target.closest(".peeeky-btn")) {
        dropdown.remove();
        document.removeEventListener("click", handler);
      }
    };
    document.addEventListener("click", handler);
  }, 100);

  return dropdown;
}

function insertLinkIntoCompose(composeBox, url, name) {
  // Find the editable content area within this compose box
  const editableDiv = composeBox.querySelector('[role="textbox"][g_editable="true"]') ||
                      composeBox.querySelector('[contenteditable="true"]');

  if (!editableDiv) return;

  // Focus the editable area
  editableDiv.focus();

  // Create a styled link element
  const linkHtml = `<a href="${url}" style="color:#6C5CE7;text-decoration:underline;" target="_blank">${name}</a>&nbsp;`;

  // Insert at cursor position using execCommand for Gmail compatibility
  document.execCommand("insertHTML", false, linkHtml);
}

function positionDropdown(dropdown, button) {
  const rect = button.getBoundingClientRect();
  dropdown.style.position = "fixed";
  dropdown.style.top = `${rect.bottom + 8}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.zIndex = "10000";
}

function injectButtons() {
  // Gmail compose toolbars — multiple selectors for robustness
  const composeBoxes = document.querySelectorAll(".iN > tbody, .aoP, [role='dialog'] .aDh");

  // Also try the bottom toolbar of compose windows
  const toolbars = document.querySelectorAll(".btC, [gh='mtb'], .aX0");

  toolbars.forEach(toolbar => {
    if (toolbar.querySelector(".peeeky-btn")) return;

    // Find the parent compose box
    const composeBox = toolbar.closest(".M9, .iN, [role='dialog'], .aoP") || toolbar.parentElement;

    const btn = document.createElement("div");
    btn.className = "peeeky-btn";
    btn.innerHTML = `
      <div class="peeeky-compose-btn" title="Insert Peeeky tracked link">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="2" stroke="#6C5CE7" stroke-width="1.5"/>
          <path d="M5 7h6M5 9.5h4" stroke="#6C5CE7" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <span>Peeeky</span>
      </div>
    `;

    btn.addEventListener("click", async (e) => {
      e.stopPropagation();

      // Close existing dropdown
      document.querySelectorAll(".peeeky-dropdown").forEach(el => el.remove());

      const docs = await fetchDocs();
      const dropdown = createDropdown(docs, composeBox);
      positionDropdown(dropdown, btn);
    });

    toolbar.appendChild(btn);
  });
}

// Observe DOM for compose windows (Gmail loads dynamically)
const observer = new MutationObserver(() => {
  injectButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial injection
injectButtons();
