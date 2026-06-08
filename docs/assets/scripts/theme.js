(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");

  if (!toggle) {
    return;
  }

  const updateToggle = () => {
    const isDay = root.dataset.theme === "day";
    toggle.setAttribute("aria-pressed", String(isDay));
    toggle.setAttribute("aria-label", `Switch to ${isDay ? "night" : "day"} theme`);
  };

  toggle.addEventListener("click", () => {
    const isDay = root.dataset.theme === "day";

    if (isDay) {
      delete root.dataset.theme;
      try {
        localStorage.removeItem("theme");
      } catch {}
    } else {
      root.dataset.theme = "day";
      try {
        localStorage.setItem("theme", "day");
      } catch {}
    }

    updateToggle();
  });

  updateToggle();
})();
