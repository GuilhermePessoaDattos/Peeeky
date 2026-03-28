const API_BASE = "https://peeeky.com";

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await chrome.storage.local.get("apiKey");

  if (apiKey) {
    showLinksView(apiKey);
  }

  document.getElementById("save-key").addEventListener("click", async () => {
    const key = document.getElementById("api-key").value.trim();
    if (!key) return;

    const status = document.getElementById("login-status");
    status.textContent = "Connecting...";
    status.className = "status";

    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (res.ok) {
        await chrome.storage.local.set({ apiKey: key });
        status.textContent = "Connected!";
        status.className = "status ok";
        setTimeout(() => showLinksView(key), 500);
      } else {
        status.textContent = "Invalid API key";
        status.className = "status err";
      }
    } catch {
      status.textContent = "Connection failed";
      status.className = "status err";
    }
  });
});

async function showLinksView(apiKey) {
  document.getElementById("login-view").style.display = "none";
  document.getElementById("links-view").style.display = "block";

  try {
    const res = await fetch(`${API_BASE}/api/documents`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) throw new Error("Failed");
    const docs = await res.json();

    const list = document.getElementById("links-list");
    list.innerHTML = "";

    for (const doc of docs.slice(0, 8)) {
      if (!doc.links?.length) continue;
      for (const link of doc.links) {
        const item = document.createElement("div");
        item.className = "link-item";
        item.innerHTML = `
          <div>
            <div class="link-name">${doc.name}</div>
            <div class="link-slug">${API_BASE}/view/${link.slug}</div>
          </div>
          <button class="copy-btn" data-url="${API_BASE}/view/${link.slug}">Copy</button>
        `;
        list.appendChild(item);
      }
    }

    list.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(btn.dataset.url);
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      });
    });
  } catch {
    document.getElementById("links-status").textContent = "Failed to load links";
    document.getElementById("links-status").className = "status err";
  }
}
