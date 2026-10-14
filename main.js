(() => {
  "use strict";

  const config = window.RESORT_CONFIG || {};
  const propertyName = config.name || "Misty Fern";
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
  const pages = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["rooms.html", "Rooms"],
    ["facilities.html", "Facilities"],
    ["gallery.html", "Gallery"],
    ["contact.html", "Contact"]
  ];

  const address = config.address || {};
  const fullAddress = [
    address.streetAddress,
    address.addressLocality,
    address.addressRegion,
    address.postalCode,
    address.addressCountry
  ].filter((part) => typeof part === "string" && part.trim()).join(", ");
  const verifiedAddress = Boolean(
    address.streetAddress?.trim()
    && address.addressLocality?.trim()
    && address.addressRegion?.trim()
    && address.postalCode?.trim()
    && address.addressCountry?.trim()
  );
  const configuredLocation = typeof config.location === "string" ? config.location.trim() : "";
  const mapQuery = verifiedAddress ? fullAddress : configuredLocation;
  const canonicalBase = typeof config.canonicalBaseUrl === "string"
    ? config.canonicalBaseUrl.trim()
    : "";
  let canonicalUrl = "";
  try {
    const parsedBase = new URL(canonicalBase);
    if (parsedBase.protocol === "https:" && parsedBase.hostname !== "example.com" && !parsedBase.username && !parsedBase.password) {
      const basePath = `${parsedBase.pathname.replace(/\/+$/, "")}/`;
      const siteBaseUrl = `${parsedBase.origin}${basePath}`;
      canonicalUrl = new URL(currentPage === "index.html" ? "./" : currentPage, siteBaseUrl).href;
    }
  } catch {
    canonicalUrl = "";
  }
  if (canonicalUrl && currentPage !== "404.html") {
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = canonicalUrl;
    document.head.append(canonical);
    const openGraphUrl = document.querySelector('meta[property="og:url"]') || document.createElement("meta");
    openGraphUrl.setAttribute("property", "og:url");
    openGraphUrl.content = canonicalUrl;
    document.head.append(openGraphUrl);
  }
  if (canonicalUrl && verifiedAddress) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      name: propertyName,
      url: canonicalUrl,
      address: {
        "@type": "PostalAddress",
        streetAddress: address.streetAddress,
        addressLocality: address.addressLocality,
        addressRegion: address.addressRegion,
        postalCode: address.postalCode,
        addressCountry: address.addressCountry
      }
    };
    if (typeof config.phone === "string" && config.phone.trim()) structuredData.telephone = config.phone.trim();
    if (typeof config.email === "string" && config.email.trim()) structuredData.email = config.email.trim();
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify(structuredData);
    document.head.append(schema);
  }

  const headerTarget = document.querySelector("#site-header");
  if (headerTarget) {
    const navItems = pages.map(([url, label]) =>
      `<a href="${url}"${currentPage === url ? ' aria-current="page"' : ""}>${label}</a>`
    ).join("");
    headerTarget.innerHTML = `
      <header class="site-header">
        <div class="container nav-wrap">
          <a class="brand" href="index.html" aria-label="${escapeHtml(propertyName)} home">
            <span class="brand-name">${escapeHtml(propertyName)}</span><span class="brand-sub">MUNNAR · KERALA</span>
          </a>
          <button class="menu-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span><span></span></button>
          <nav class="nav-links" id="primary-navigation" aria-label="Main navigation">${navItems}<a class="button button-small" href="contact.html#enquiry">Enquire now <span aria-hidden="true">↗</span></a></nav>
        </div>
      </header>`;
  }

  const footerTarget = document.querySelector("#site-footer");
  if (footerTarget) {
    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <section><a class="brand footer-brand" href="index.html"><span class="brand-name">${escapeHtml(propertyName)}</span><span class="brand-sub">MUNNAR · KERALA</span></a><p>Plan a relaxing family getaway in Munnar. Get in touch and we’ll help you take the next step.</p></section>
            <section><h2>Explore</h2><nav class="footer-links" aria-label="Footer navigation">${pages.map(([url, label]) => `<a href="${url}">${label}</a>`).join("")}</nav></section>
            <section><h2>Contact</h2><address>Munnar, Kerala, India</address><p>Questions about your visit? We’re happy to help.</p></section>
            <section><h2>Plan your stay</h2><p>Share your dates and group size, and we’ll help you enquire about your stay.</p><a class="text-link" href="contact.html#enquiry" style="color:#f0ead9">Get in touch <span aria-hidden="true">→</span></a></section>
          </div>
          <div class="footer-bottom"><p>© <span data-current-year></span> ${escapeHtml(propertyName)}. We look forward to welcoming you.</p><p>Room details and rates are confirmed directly with the property.</p></div>
        </div>
      </footer>`;
  }

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const sightseeingCarousel = document.querySelector("#munnar-carousel");
  const previousSightseeing = document.querySelector("[data-carousel-prev]");
  const nextSightseeing = document.querySelector("[data-carousel-next]");
  const sightseeingToggle = document.querySelector("[data-carousel-toggle]");
  const sightseeingRegion = sightseeingCarousel?.closest(".gallery-preview");
  if (
    sightseeingCarousel
    && sightseeingRegion
    && previousSightseeing instanceof HTMLButtonElement
    && nextSightseeing instanceof HTMLButtonElement
    && sightseeingToggle instanceof HTMLButtonElement
  ) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const autoAdvanceDelay = 5000;
    let autoAdvanceTimer = 0;
    let userPaused = reducedMotion.matches;
    let pointerInside = false;
    let focusInside = false;
    const updateSightseeingControls = () => {
      previousSightseeing.disabled = sightseeingCarousel.scrollLeft <= 1;
      nextSightseeing.disabled = sightseeingCarousel.scrollLeft + sightseeingCarousel.clientWidth >= sightseeingCarousel.scrollWidth - 1;
    };
    const updateSightseeingToggle = () => {
      sightseeingToggle.textContent = userPaused ? "▶" : "Ⅱ";
      sightseeingToggle.setAttribute("aria-label", userPaused ? "Start automatic movement" : "Pause automatic movement");
      sightseeingToggle.setAttribute("aria-pressed", String(userPaused));
    };
    const scrollSightseeing = (direction) => {
      const firstCard = sightseeingCarousel.querySelector(".sightseeing-card");
      if (!firstCard) return;
      const gap = Number.parseFloat(getComputedStyle(sightseeingCarousel).columnGap) || 0;
      const distance = firstCard.getBoundingClientRect().width + gap;
      sightseeingCarousel.scrollBy({
        left: direction * distance,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    };
    const stopAutoAdvance = () => {
      window.clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = 0;
    };
    const startAutoAdvance = () => {
      stopAutoAdvance();
      if (userPaused || document.hidden || sightseeingCarousel.scrollWidth <= sightseeingCarousel.clientWidth) return;
      autoAdvanceTimer = window.setInterval(() => {
        if (interactionActive()) return;
        const atEnd = sightseeingCarousel.scrollLeft + sightseeingCarousel.clientWidth >= sightseeingCarousel.scrollWidth - 1;
        if (atEnd) {
          sightseeingCarousel.scrollTo({
            left: 0,
            behavior: reducedMotion.matches ? "auto" : "smooth"
          });
        } else {
          scrollSightseeing(1);
        }
      }, autoAdvanceDelay);
    };
    const interactionActive = () => pointerInside || focusInside;
    sightseeingToggle.addEventListener("click", () => {
      userPaused = !userPaused;
      updateSightseeingToggle();
      startAutoAdvance();
    });
    previousSightseeing.addEventListener("click", () => scrollSightseeing(-1));
    nextSightseeing.addEventListener("click", () => scrollSightseeing(1));
    sightseeingCarousel.addEventListener("scroll", updateSightseeingControls, { passive: true });
    sightseeingRegion.addEventListener("mouseenter", () => {
      pointerInside = true;
    });
    sightseeingRegion.addEventListener("mouseleave", () => {
      pointerInside = false;
    });
    sightseeingRegion.addEventListener("focusin", () => {
      focusInside = true;
    });
    sightseeingRegion.addEventListener("focusout", (event) => {
      if (!sightseeingRegion.contains(event.relatedTarget)) focusInside = false;
    });
    document.addEventListener("visibilitychange", startAutoAdvance);
    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        userPaused = true;
        updateSightseeingToggle();
      }
      startAutoAdvance();
    });
    window.addEventListener("resize", updateSightseeingControls);
    updateSightseeingControls();
    updateSightseeingToggle();
    startAutoAdvance();
  }

  const addressElement = document.querySelector("[data-property-address]");
  if (addressElement && verifiedAddress) addressElement.textContent = fullAddress;

  const phoneElement = document.querySelector("[data-property-phone]");
  if (phoneElement && typeof config.phone === "string" && /^\+?[\d(). -]{7,25}$/.test(config.phone.trim())) {
    const phoneLink = document.createElement("a");
    phoneLink.href = `tel:${config.phone.replace(/[^\d+]/g, "")}`;
    phoneLink.textContent = config.phone;
    phoneElement.replaceChildren(phoneLink);
  }

  const emailElement = document.querySelector("[data-property-email]");
  if (emailElement && typeof config.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email.trim())) {
    const emailLink = document.createElement("a");
    emailLink.href = `mailto:${config.email.trim()}`;
    emailLink.textContent = config.email.trim();
    emailElement.replaceChildren(emailLink);
  }

  const directionsMessage = document.querySelector("[data-property-directions]");
  const mapLink = document.querySelector("[data-property-map]");
  if (verifiedAddress && directionsMessage && mapLink) {
    directionsMessage.textContent = fullAddress;
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    mapLink.textContent = "Get directions on Google Maps";
  }
  if (mapQuery) {
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    for (const link of document.querySelectorAll("[data-property-map]")) {
      link.href = directionsUrl;
      link.textContent = verifiedAddress ? "Get directions on Google Maps" : `Explore ${configuredLocation} on Google Maps`;
    }
    for (const frame of document.querySelectorAll(".map-placeholder .map-embed")) {
      frame.title = verifiedAddress ? `Map showing ${propertyName}` : `Map of ${configuredLocation}`;
      frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
    }
  }
  if (!verifiedAddress && mapLink && directionsMessage) {
    mapLink.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(configuredLocation)}`;
    mapLink.textContent = `Get directions to ${configuredLocation} on Google Maps`;
  }

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-navigation");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menuButton.setAttribute("aria-label", expanded ? "Open navigation menu" : "Close navigation menu");
      navigation.classList.toggle("is-open", !expanded);
    });
    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
        menuButton.focus();
      }
    });
  }

  const checkIn = document.querySelector("#check-in");
  const checkOut = document.querySelector("#check-out");
  if (checkIn && checkOut) {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    checkIn.min = localToday;
    checkOut.min = localToday;
    checkIn.addEventListener("change", () => {
      checkOut.min = checkIn.value || localToday;
      if (checkOut.value && checkOut.value <= checkIn.value) checkOut.value = "";
    });
  }

  const params = new URLSearchParams(window.location.search);
  const requestedRoom = params.get("room");
  const roomSelect = document.querySelector("#room-type");
  if (requestedRoom && roomSelect) {
    const matchingOption = Array.from(roomSelect.options).find((option) => option.text.startsWith(requestedRoom));
    if (matchingOption) roomSelect.value = matchingOption.value;
  }

  const form = document.querySelector("[data-enquiry-form]");
  const formStatus = document.querySelector("[data-form-status]");
  if (form && formStatus instanceof HTMLElement) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      formStatus.textContent = "";
      formStatus.removeAttribute("data-state");
      if (!form.reportValidity()) return;

      const submitButton = form.querySelector('button[type="submit"]');
      if (!(submitButton instanceof HTMLButtonElement)) return;
      submitButton.disabled = true;
      submitButton.textContent = "Sending…";

      try {
        const emailConfig = window.EMAILJS_CONFIG || {};
        const hasEmailJsConfig = ["serviceId", "templateId", "publicKey"].every((key) =>
          typeof emailConfig[key] === "string"
          && emailConfig[key].trim()
          && !emailConfig[key].startsWith("YOUR_")
        );
        if (!hasEmailJsConfig) {
          throw new Error("Add your EmailJS service ID, template ID, and public key in emailjs-config.js.");
        }
        if (!window.emailjs || typeof window.emailjs.sendForm !== "function") {
          throw new Error("The EmailJS browser library did not load.");
        }
        await window.emailjs.sendForm(emailConfig.serviceId, emailConfig.templateId, form, {
          publicKey: emailConfig.publicKey
        });
        formStatus.textContent = "Your enquiry was submitted. The property team will follow up using the details you provided. This is not a booking confirmation.";
        form.reset();
        if (checkIn && checkOut) {
          const todayAfterReset = new Date();
          const minDate = new Date(todayAfterReset.getTime() - todayAfterReset.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
          checkIn.min = minDate;
          checkOut.min = minDate;
        }
      } catch (error) {
        console.error("Enquiry submission failed:", error);
        formStatus.textContent = error instanceof Error && error.message.includes("Add your EmailJS")
          ? "The enquiry form is not configured yet. Please contact the property by phone or WhatsApp."
          : "We couldn’t submit your enquiry. Please check your connection and try again, or contact the property directly.";
        formStatus.dataset.state = "error";
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send enquiry <span aria-hidden="true">↗</span>';
      }
    });
  }

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item[data-category]"));
  const galleryStatus = document.querySelector("#gallery-status");
  if (filterButtons.length && galleryItems.length) {
    for (const button of filterButtons) {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        let visibleCount = 0;
        for (const item of galleryItems) {
          const visible = filter === "all" || item.dataset.category === filter;
          item.hidden = !visible;
          if (visible) visibleCount += 1;
        }
        for (const filterButton of filterButtons) {
          const selected = filterButton === button;
          filterButton.classList.toggle("is-active", selected);
          filterButton.setAttribute("aria-pressed", String(selected));
        }
        if (galleryStatus) galleryStatus.textContent = `${visibleCount} ${filter === "all" ? "" : `${filter} `}images shown.`;
      });
    }
  }

  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("figure img");
  const lightboxCaption = lightbox?.querySelector("figcaption");
  const visibleGalleryItems = () => galleryItems.filter((item) => !item.hidden);
  let activeImageIndex = 0;

  const showGalleryImage = (index) => {
    const items = visibleGalleryItems();
    if (!items.length || !lightboxImage || !lightboxCaption) return;
    activeImageIndex = (index + items.length) % items.length;
    const item = items[activeImageIndex];
    const image = item.querySelector("img");
    if (!image) return;
    lightboxImage.src = (item.dataset.full || image.currentSrc || image.src).replaceAll("&amp;", "&");
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = item.dataset.caption || image.alt;
  };

  if (lightbox instanceof HTMLDialogElement && lightboxImage && lightboxCaption) {
    for (const item of galleryItems) {
      item.addEventListener("click", () => {
        showGalleryImage(visibleGalleryItems().indexOf(item));
        lightbox.showModal();
        lightbox.querySelector(".lightbox-close")?.focus();
      });
    }
    lightbox.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
    lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => showGalleryImage(activeImageIndex - 1));
    lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => showGalleryImage(activeImageIndex + 1));
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showGalleryImage(activeImageIndex - 1);
      if (event.key === "ArrowRight") showGalleryImage(activeImageIndex + 1);
    });
  }

  const whatsapp = document.querySelector("[data-whatsapp-link]");
  const whatsappIcon = '<svg class="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.48 0 .13 5.34.13 11.91c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 0 0 5.74 1.46h.01c6.57 0 11.91-5.34 11.92-11.91a11.85 11.85 0 0 0-3.45-8.42ZM12.05 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.38a9.88 9.88 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.91-9.9a9.84 9.84 0 0 1 7.01 2.91 9.84 9.84 0 0 1 2.9 7.02c0 5.46-4.44 9.9-9.92 9.9Zm5.43-7.41c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>';
  if (typeof config.whatsapp === "string") {
    const digits = config.whatsapp.replace(/\D/g, "");
    if (digits.length >= 8) {
      if (whatsapp) {
        whatsapp.setAttribute("href", `https://wa.me/${digits}`);
        whatsapp.removeAttribute("aria-disabled");
        whatsapp.removeAttribute("title");
        whatsapp.innerHTML = whatsappIcon;
        whatsapp.setAttribute("aria-label", "Message us on WhatsApp");
        whatsapp.title = "Message us on WhatsApp";
        whatsapp.setAttribute("target", "_blank");
        whatsapp.setAttribute("rel", "noopener noreferrer");
      }
      const floatingWhatsApp = document.createElement("a");
      floatingWhatsApp.className = "whatsapp-float";
      floatingWhatsApp.href = `https://wa.me/${digits}`;
      floatingWhatsApp.target = "_blank";
      floatingWhatsApp.rel = "noopener noreferrer";
      floatingWhatsApp.setAttribute("aria-label", "Contact the resort on WhatsApp");
      floatingWhatsApp.innerHTML = whatsappIcon;
      document.body.append(floatingWhatsApp);
    } else if (whatsapp) {
      whatsapp.removeAttribute("href");
    }
  } else if (whatsapp) {
    whatsapp.removeAttribute("href");
  }
})();
