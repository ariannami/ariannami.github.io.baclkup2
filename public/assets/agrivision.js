/**
 * AGRIVISION Case Study Interactive Controller
 * Handles preloader completion, lazy-image hydration with fallback,
 * interactive subsystem hotspots (Aerial Unit + Ground Station), and view switching.
 */
(function () {
  const DRONE_FRONT_RENDER = "/assets/aistudio/Untitled2_78bbfd05.webp";
  const DRONE_BACK_RENDER = "/assets/aistudio/Untitled3_2bbc8a67.webp";
  const GROUND_STATION_RENDER = "/assets/aistudio/Untitled11_eb6b18ee.webp";
  const FALLBACK_RENDER = "/assets/aistudio/Untitled1_da706d99.jpg";

  const PART_METADATA = {
    // Aerial Unit Subsystems
    battery: {
      title: "Battery",
      kicker: "01 · BATTERY",
      spec: "Dual 22.2V Solid-State LiPo · Hot-Swap · 42 min Flight",
    },
    propeller: {
      title: "Propellers",
      kicker: "02 · PROPELLER",
      spec: "Low-Noise Carbon Composite Blades · High-Torque Brushless Hubs",
    },
    chassis: {
      title: "Chassis — Upper Body",
      kicker: "03 · CHASSIS — UPPER BODY",
      spec: "Sealed Monocoque Airframe · Smoked Polycarbonate Sensor Visor",
    },
    arms: {
      title: "Extendable Arms",
      kicker: "04 · EXTENDABLE ARMS",
      spec: "4-Axis Foldable Carbon Booms · Precision Cam Latch Indicators",
    },
    "landing-gear": {
      title: "Landing Gear",
      kicker: "05 · LANDING GEAR",
      spec: "Telescopic Alloy Struts · Articulated Pod-Docking Feet",
    },

    // Ground Station Subsystems
    "station-transport": {
      title: "Transport System",
      kicker: "01 · TRANSPORT",
      spec: "All-Terrain Pneumatic Wheels · Telescopic Field Handle",
    },
    "station-shelter": {
      title: "Motorized Clamshell Lid",
      kicker: "02 · LID & SOLAR CANOPY",
      spec: "IP67 Sealed Enclosure · Integrated 180W Solar Harvesting Array",
    },
    "station-charging": {
      title: "500W Autonomous Power",
      kicker: "03 · CHARGING SYSTEM",
      spec: "2.4 kWh LiFePO4 Buffer · Contact Rails & Umbilical Port",
    },
    "station-processing": {
      title: "The AGRIPAD integration Bay",
      kicker: "04 · THE AGRIPAD INTEGRATION BAY",
      spec: "Recessed Rear Compute Dock · High-Speed Telemetry Sync",
    },
    "station-agripad": {
      title: "AGRIPAD Command Tablet",
      kicker: "05 · AGRIPAD",
      spec: "Detachable Ruggedized Controller · Live Agronomy & Leak Telemetry",
    },
    "station-landing": {
      title: "RTK Precision Docking Pad",
      kicker: "06 · LAUNCH & LANDING",
      spec: "Motorized Recovery Deck · Centimeter-Accurate Centering Guides",
    },
    "station-legs": {
      title: "Adjusting Legs (Outrigger Arms)",
      kicker: "07 · ADJUSTING LEGS",
      spec: "Quad-Actuator Gyroscopic Leveling · Wide-Stance Mud Footpads",
    },
  };

  function resolveAssetUrl(rawUrl) {
    if (!rawUrl) return FALLBACK_RENDER;
    const trimmed = rawUrl.trim().split(/\s+/)[0];
    if (!trimmed || trimmed.startsWith("data:")) return FALLBACK_RENDER;
    if (trimmed.startsWith("assets/")) {
      return `/${trimmed}`;
    }
    return trimmed;
  }

  function initPreloader() {
    const preloader = document.getElementById("site-preloader");
    const bar = document.getElementById("preloader-bar");
    const pct = document.getElementById("preloader-pct");

    if (bar) {
      bar.style.setProperty("--load-progress", "1");
    }
    if (pct) {
      pct.textContent = "100%";
    }
    document.documentElement.classList.add("is-playing");
    if (preloader) {
      preloader.classList.add("is-loaded");
    }
  }

  function hydrateImage(img) {
    if (!img || img.classList.contains("is-hydrated")) return;
    const dataSrc = img.getAttribute("data-src");
    if (dataSrc) {
      const resolved = resolveAssetUrl(dataSrc);
      img.setAttribute("data-original-src", dataSrc);
      if (img.getAttribute("src") !== resolved) {
        img.src = resolved;
      }
      if (img.hasAttribute("data-srcset")) {
        img.srcset = `${resolved} 1536w`;
      }
    }
    img.addEventListener(
      "error",
      () => {
        if (img.src && !img.src.endsWith(FALLBACK_RENDER)) {
          img.src = FALLBACK_RENDER;
        }
      },
      { once: true }
    );
    img.classList.add("is-hydrated", "is-lazy-loaded");
  }

  function initLazyImages() {
    const lazyImages = Array.from(
      document.querySelectorAll("img.mobile-img:not(.media-focus)")
    );
    lazyImages.forEach(hydrateImage);

    const pictureSources = Array.from(
      document.querySelectorAll("picture source[data-srcset]")
    );
    pictureSources.forEach((source) => {
      const rawSrcset = source.getAttribute("data-srcset") || "";
      if (rawSrcset) {
        source.setAttribute("srcset", rawSrcset);
      }
    });
  }

  function initInteractiveCard(cardEl) {
    const mediaEl = cardEl.querySelector(".project-card__media");
    if (!mediaEl) return;

    const hotspots = Array.from(mediaEl.querySelectorAll(".drone-hotspot"));
    const specItems = Array.from(cardEl.querySelectorAll(".spec-item[data-part]"));
    const calloutEl = mediaEl.querySelector(".part-callout");
    const calloutTextEl = mediaEl.querySelector(".part-callout__text");
    const hoverTooltipEl = mediaEl.querySelector(".part-hover-tooltip");
    const hoverKickerEl = mediaEl.querySelector(".part-hover-tooltip__kicker");
    const hoverSpecEl = mediaEl.querySelector(".part-hover-tooltip__spec");

    function setActivePart(partKey, sourceHotspot) {
      const currentActive = mediaEl.getAttribute("data-active-part");
      if (!partKey || currentActive === partKey) {
        mediaEl.classList.remove("is-part-active");
        mediaEl.removeAttribute("data-active-part");
        hotspots.forEach((btn) => btn.setAttribute("aria-pressed", "false"));
        specItems.forEach((item) => item.classList.remove("is-active"));
        return;
      }

      // Hydrate only the requested .media-focus layer on demand
      const focusImg = mediaEl.querySelector(`.media-focus-${partKey}`);
      if (focusImg) {
        hydrateImage(focusImg);
        if (
          mediaEl.id === "drone-media" &&
          mediaEl.getAttribute("data-view") === "back"
        ) {
          const backSrc =
            focusImg.getAttribute("data-back-src") || DRONE_BACK_RENDER;
          focusImg.src = backSrc;
          focusImg.srcset = `${backSrc} 3840w`;
        }
      }

      const targetHotspot =
        sourceHotspot ||
        hotspots.find((h) => h.getAttribute("data-part") === partKey);
      const meta = PART_METADATA[partKey];

      mediaEl.classList.add("is-part-active");
      mediaEl.setAttribute("data-active-part", partKey);

      if (targetHotspot && calloutEl) {
        const cx = targetHotspot.getAttribute("data-callout-x") || "50%";
        const cy = targetHotspot.getAttribute("data-callout-y") || "30%";
        calloutEl.style.setProperty("--callout-x", cx);
        calloutEl.style.setProperty("--callout-y", cy);
      }
      if (calloutTextEl && meta) {
        calloutTextEl.textContent = meta.title;
      }

      hotspots.forEach((btn) => {
        const isMatch = btn.getAttribute("data-part") === partKey;
        btn.setAttribute("aria-pressed", isMatch ? "true" : "false");
      });

      specItems.forEach((item) => {
        const isMatch = item.getAttribute("data-part") === partKey;
        item.classList.toggle("is-active", isMatch);
      });
    }

    function setHoverPart(partKey, hotspotEl) {
      if (!partKey || !hotspotEl) {
        mediaEl.classList.remove("is-part-hovering");
        hotspots.forEach((btn) => btn.classList.remove("is-part-hovered"));
        if (hoverTooltipEl) hoverTooltipEl.setAttribute("aria-hidden", "true");
        return;
      }

      const meta = PART_METADATA[partKey];
      mediaEl.classList.add("is-part-hovering");
      hotspots.forEach((btn) => {
        btn.classList.toggle(
          "is-part-hovered",
          btn.getAttribute("data-part") === partKey
        );
      });

      if (hoverTooltipEl) {
        const hx = hotspotEl.getAttribute("data-hover-x") || "50%";
        const hy = hotspotEl.getAttribute("data-hover-y") || "50%";
        hoverTooltipEl.style.setProperty("--hover-x", hx);
        hoverTooltipEl.style.setProperty("--hover-y", hy);
        hoverTooltipEl.setAttribute("aria-hidden", "false");
      }
      if (hoverKickerEl && meta) {
        hoverKickerEl.textContent = meta.kicker;
      }
      if (hoverSpecEl && meta) {
        hoverSpecEl.textContent = meta.spec;
      }
    }

    hotspots.forEach((hotspot) => {
      const partKey = hotspot.getAttribute("data-part");
      hotspot.addEventListener("mouseenter", () => setHoverPart(partKey, hotspot));
      hotspot.addEventListener("mouseleave", () => setHoverPart(null, null));
      hotspot.addEventListener("focus", () => setHoverPart(partKey, hotspot));
      hotspot.addEventListener("blur", () => setHoverPart(null, null));
      hotspot.addEventListener("click", (event) => {
        event.stopPropagation();
        setActivePart(partKey, hotspot);
      });
    });

    specItems.forEach((specItem) => {
      const partKey = specItem.getAttribute("data-part");
      specItem.addEventListener("click", () => {
        setActivePart(partKey, null);
      });
      specItem.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setActivePart(partKey, null);
        }
      });
    });

    mediaEl.addEventListener("click", (event) => {
      const target = /** @type {HTMLElement} */ (event.target);
      if (
        target.closest(".drone-hotspot") ||
        target.closest(".drone-view-controls")
      ) {
        return;
      }
      if (mediaEl.classList.contains("is-part-active")) {
        setActivePart(null, null);
      }
    });
  }

  function initDroneViewControls() {
    const droneMedia = document.getElementById("drone-media");
    if (!droneMedia) return;

    const viewButtons = Array.from(
      droneMedia.querySelectorAll(".drone-view-btn[data-view-target]")
    );
    const rotateBtn = document.getElementById("drone-rotate-btn");
    const viewIndicator = document.getElementById("drone-view-indicator");

    const droneLayers = Array.from(
      droneMedia.querySelectorAll("img.drone-layer-img")
    );

    function switchView(nextView) {
      const current = droneMedia.getAttribute("data-view") || "front";
      if (current === nextView) return;

      droneMedia.classList.add("is-switching-view");
      droneMedia.setAttribute("data-view", nextView);

      droneLayers.forEach((img) => {
        // Only swap src on the base image and any already-hydrated focus layer
        if (
          !img.classList.contains("media-base") &&
          !img.classList.contains("is-hydrated")
        ) {
          return;
        }
        const frontSrc = img.getAttribute("data-front-src") || DRONE_FRONT_RENDER;
        const backSrc = img.getAttribute("data-back-src") || DRONE_BACK_RENDER;
        const resolvedSrc = nextView === "front" ? frontSrc : backSrc;
        img.src = resolvedSrc;
        img.srcset = `${resolvedSrc} 3840w`;
      });

      viewButtons.forEach((btn) => {
        const isTarget = btn.getAttribute("data-view-target") === nextView;
        btn.classList.toggle("is-active", isTarget);
        btn.setAttribute("aria-pressed", isTarget ? "true" : "false");
      });

      if (viewIndicator) {
        viewIndicator.textContent =
          nextView === "back"
            ? "BACK VIEW · 3840 × 2400 · 4K CGI"
            : "FRONT VIEW · 3840 × 2400 · 4K CGI";
      }

      window.setTimeout(() => {
        droneMedia.classList.remove("is-switching-view");
      }, 220);
    }

    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const targetView = btn.getAttribute("data-view-target") || "front";
        switchView(targetView);
      });
    });

    if (rotateBtn) {
      rotateBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const current = droneMedia.getAttribute("data-view") || "front";
        switchView(current === "front" ? "back" : "front");
      });
    }
  }

  function initHeroNavigation() {
    const wrapper = document.getElementById("staggered-menu");
    const toggleBtn = document.getElementById("menu-toggle");
    const backdrop = document.getElementById("sm-backdrop");
    const dialogEl = /** @type {HTMLDialogElement | null} */ (
      document.getElementById("project-dialog")
    );
    const dialogCloseBtn = document.getElementById("dialog-close");

    function setMenuOpen(open) {
      if (!wrapper || !toggleBtn) return;
      document.body.setAttribute("data-menu-open", open ? "true" : "false");
      wrapper.setAttribute("data-open", open ? "true" : "false");
      wrapper.setAttribute("aria-hidden", open ? "false" : "true");
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      toggleBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if (toggleBtn && wrapper) {
      toggleBtn.addEventListener("click", () => {
        const isOpen = wrapper.getAttribute("data-open") === "true";
        setMenuOpen(!isOpen);
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", () => setMenuOpen(false));
    }

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        wrapper &&
        wrapper.getAttribute("data-open") === "true"
      ) {
        setMenuOpen(false);
      }
    });

    if (wrapper) {
      wrapper.querySelectorAll(".sm-panel-item").forEach((linkEl) => {
        linkEl.addEventListener("click", (event) => {
          const section = linkEl.getAttribute("data-menu-section");
          if (section === "services" && dialogEl) {
            event.preventDefault();
            setMenuOpen(false);
            if (typeof dialogEl.showModal === "function") {
              dialogEl.showModal();
            }
          }
        });
      });
    }

    if (dialogCloseBtn && dialogEl) {
      dialogCloseBtn.addEventListener("click", () => dialogEl.close());
      dialogEl.addEventListener("click", (event) => {
        if (event.target === dialogEl) dialogEl.close();
      });
    }
  }

  function initModelViewer() {
    const mv = /** @type {any} */ (
      document.querySelector("model-viewer.agrivision-model-viewer")
    );
    if (!mv) return;

    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (isMobile) {
      mv.setAttribute("shadow-intensity", "0.25");
      mv.setAttribute("minimum-render-scale", "0.65");
    }

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    let userSpinEnabled = !isSoftwareGl;
    const spinToggleBtn = document.getElementById("model-spin-toggle");

    function updateSpinState(enabled) {
      userSpinEnabled = enabled;
      if (enabled && !isSoftwareGl) {
        mv.setAttribute("auto-rotate", "");
        mv.autoRotate = true;
      } else {
        mv.removeAttribute("auto-rotate");
        mv.autoRotate = false;
      }
      if (spinToggleBtn) {
        spinToggleBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
        spinToggleBtn.textContent = enabled ? "Spin: On" : "Spin: Off";
      }
    }

    if (isSoftwareGl) {
      mv.setAttribute("shadow-intensity", "0");
      mv.setAttribute("minimum-render-scale", "0.5");
      mv.setAttribute("interpolation-decay", "1");
      updateSpinState(false);
      mv.addEventListener("load", () => {
        mv.removeAttribute("auto-rotate");
        mv.autoRotate = false;
        if (typeof mv.jumpCameraToGoal === "function") {
          mv.jumpCameraToGoal();
        }
      });
    }

    if (spinToggleBtn) {
      spinToggleBtn.addEventListener("click", () => {
        updateSpinState(!userSpinEnabled);
      });
    }

    // Camera preset buttons (Iso, Front, Side, Top) for effortless 1-tap mobile & desktop control
    const orbitButtons = Array.from(
      document.querySelectorAll(".model-ctrl-btn[data-orbit]")
    );
    orbitButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const orbit = btn.getAttribute("data-orbit");
        if (!orbit) return;
        mv.cameraOrbit = orbit;
        mv.cameraTarget = "auto auto auto";
        if (typeof mv.jumpCameraToGoal === "function" && isSoftwareGl) {
          mv.jumpCameraToGoal();
        }
        orbitButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      });
    });

    // Pause WebGL auto-rotate when the 3D stage is scrolled offscreen to keep mobile scrolling silky smooth
    if ("IntersectionObserver" in window) {
      const stageIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              mv.removeAttribute("auto-rotate");
            } else if (userSpinEnabled && !isSoftwareGl) {
              mv.setAttribute("auto-rotate", "");
            }
          });
        },
        { rootMargin: "100px 0px" }
      );
      stageIo.observe(mv);
    }
  }

  function boot() {
    initPreloader();
    initLazyImages();
    initModelViewer();
    document
      .querySelectorAll(".project-card")
      .forEach((card) => initInteractiveCard(card));
    initDroneViewControls();
    initHeroNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
