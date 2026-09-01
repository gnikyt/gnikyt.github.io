(() => {
  // Only enhance images within post/page content, not site chrome (avatar, etc.).
  const images = Array.from(
    document.querySelectorAll(".post .tab__content .content-container img")
  );

  if (!images.length) {
    return;
  }

  // Build the overlay once and reuse it.
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <button type="button" class="lightbox__close" aria-label="Close image">&times;</button>
    <figure class="lightbox__figure">
      <img class="lightbox__img" alt="" />
      <figcaption class="lightbox__caption"></figcaption>
      <a class="lightbox__fullsize" target="_blank" rel="noopener">View full size &#8599;</a>
    </figure>
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector(".lightbox__img");
  const overlayCaption = overlay.querySelector(".lightbox__caption");
  const overlayFullsize = overlay.querySelector(".lightbox__fullsize");
  const closeButton = overlay.querySelector(".lightbox__close");

  let lastFocused = null;

  const open = (src, alt) => {
    lastFocused = document.activeElement;
    overlayImg.setAttribute("src", src);
    overlayImg.setAttribute("alt", alt || "");
    overlayFullsize.setAttribute("href", src);

    if (alt) {
      overlayCaption.textContent = alt;
      overlayCaption.hidden = false;
    } else {
      overlayCaption.textContent = "";
      overlayCaption.hidden = true;
    }

    overlay.classList.add("lightbox--open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-lock");
    closeButton.focus();
  };

  const close = () => {
    overlay.classList.remove("lightbox--open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-lock");
    overlayImg.removeAttribute("src");

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  images.forEach((img) => {
    const link = img.closest("a");
    // Prefer the linked full-size image if the author wrapped it in an anchor.
    const fullSrc = link ? link.getAttribute("href") : img.getAttribute("src");

    // Skip anchors that don't point at an image (rare, but be safe).
    if (link && !/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(fullSrc || "")) {
      return;
    }

    const trigger = link || img;
    trigger.classList.add("lightbox-trigger");
    if (!link) {
      trigger.setAttribute("role", "button");
      trigger.setAttribute("tabindex", "0");
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      open(fullSrc, img.getAttribute("alt"));
    });

    if (!link) {
      trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(fullSrc, img.getAttribute("alt"));
        }
      });
    }
  });

  closeButton.addEventListener("click", close);

  overlay.addEventListener("click", (event) => {
    // Close when clicking the backdrop (outside the figure).
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("lightbox--open")) {
      close();
    }
  });
})();
