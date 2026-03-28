const API_BASE = "https://peeeky.com";

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await chrome.storage.local.get("apiKey");

  if (apiKey) {
    loadDocuments(apiKey);
  } else {
    showAuthView();
  }

  // Connect button
  document.getElementById("connect-btn").addEventListener("click", async () => {
    const key = document.getElementById("api-key").value.trim();
    if (!key) return;

    const status = document.getElementById("auth-status");
    status.textContent = "Connecting...";
    status.className = "status";

    try {
      const res = await fetch(`${API_BASE}/api/extension`, {
        headers: { "x-peeeky-key": key },
      });

      if (res.ok) {
        await chrome.storage.local.set({ apiKey: key });
        status.textContent = "Connected!";
        status.className = "status ok";
        setTimeout(() => loadDocuments(key), 500);
      } else {
        status.textContent = "Invalid key. Make sure you're using your referral code.";
        status.className = "status err";
      }
    } catch {
      status.textContent = "Connection failed. Check your internet.";
      status.className = "status err";
    }
  });

  // Disconnect button
  document.getElementById("disconnect-btn").addEventListener("click", async () => {
    await chrome.storage.local.remove("apiKey");
    showAuthView();
  });
});

function showAuthView() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("auth-view").style.display = "block";
  document.getElementById("docs-view").style.display = "none";
}

async function loadDocuments(apiKey) {
  document.getElementById("loading").style.display = "block";
  document.getElementById("auth-view").style.display = "none";
  document.getElementById("docs-view").style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/api/extension`, {
      headers: { "x-peeeky-key": apiKey },
    });

    if (!res.ok) {
      showAuthView();
      return;
    }

    const data = await res.json();
    const docs = data.documents || [];

    document.getElementById("loading").style.display = "none";
    document.getElementById("docs-view").style.display = "block";

    const list = document.getElementById("docs-list");
    list.innerHTML = "";

    if (docs.length === 0) {
      list.innerHTML = '<div class="empty">No documents yet. <a href="https://peeeky.com/documents" target="_blank" style="color:#6C5CE7;">Upload one</a></div>';
      return;
    }

    for (const doc of docs) {
      if (!doc.links || doc.links.length === 0) continue;

      for (const link of doc.links) {
        const item = document.createElement("div");
        item.className = "doc-item";
        item.innerHTML = `
          <div class="doc-name">${escapeHtml(doc.name)}</div>
          <div class="link-row">
            <span class="link-url">/view/${link.slug}</span>
            <span class="link-views">${link.views} view${link.views !== 1 ? "s" : ""}</span>
            <button class="copy-btn" data-url="${link.url}">Copy link</button>
          </div>
        `;
        list.appendChild(item);
      }
    }

    // Copy handlers
    list.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.url);
        btn.textContent = "Copied!";
        btn.style.background = "#00B894";
        btn.style.color = "white";
        btn.style.borderColor = "#00B894";
        setTimeout(() => {
          btn.textContent = "Copy link";
          btn.style.background = "";
          btn.style.color = "";
          btn.style.borderColor = "";
        }, 1500);
      });
    });
  } catch {
    showAuthView();
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
