// Peeeky Gmail Integration
// Injects a "Peeeky" button into Gmail compose toolbar

const PEEEKY_URL = "https://peeeky.com";

function injectPeeekyButton() {
  // Watch for Gmail compose windows
  const observer = new MutationObserver(() => {
    const toolbars = document.querySelectorAll('[gh="mtb"]');
    toolbars.forEach((toolbar) => {
      if (toolbar.querySelector(".peeeky-btn")) return;

      const btn = document.createElement("div");
      btn.className = "peeeky-btn";
      btn.innerHTML = `
        <div class="peeeky-compose-btn" title="Insert Peeeky link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke="#6C5CE7" stroke-width="1.5"/>
            <path d="M5 7h6M5 9.5h4" stroke="#6C5CE7" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <span>Peeeky</span>
        </div>
      `;

      btn.addEventListener("click", () => {
        window.open(`${PEEEKY_URL}/documents?action=select-link`, "_blank", "width=500,height=600");
      });

      toolbar.appendChild(btn);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for messages from the Peeeky popup/page to insert links
window.addEventListener("message", (event) => {
  if (event.data?.type === "peeeky-insert-link") {
    const activeElement = document.querySelector('[role="textbox"][g_editable="true"]');
    if (activeElement) {
      const link = document.createElement("a");
      link.href = event.data.url;
      link.textContent = event.data.name || event.data.url;
      link.style.color = "#6C5CE7";
      activeElement.appendChild(link);
      activeElement.appendChild(document.createTextNode(" "));
    }
  }
});

injectPeeekyButton();
