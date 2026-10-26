/**
 * Arian Nami | Minimalist Interactive Hover List Portfolio + GSAP StaggeredMenu
 * Vanilla JS: StaggeredMenu Initialization + Hover Image Swap
 */
import StaggeredMenu from "./StaggeredMenu.js";
import {
    wrapIndex,
    buildWheelVirtualSlots,
    computeWheelTargetFromDelta,
} from "./wheelMath.js";

export const MENU_ITEMS = [
    {
        id: "home",
        number: "01",
        label: "Home",
        ariaLabel: "Go to home page",
        link: "./index.html",
    },
    {
        id: "about",
        number: "02",
        label: "About",
        ariaLabel: "Learn about us",
        link: "./about.html",
    },
    {
        id: "services",
        number: "03",
        label: "Services",
        ariaLabel: "View our services",
        link: "/services",
    },
    {
        id: "projects",
        number: "04",
        label: "Projects",
        ariaLabel: "View projects",
        link: "./projects.html",
    },
    {
        id: "awards",
        number: "05",
        label: "Awards",
        ariaLabel: "View awards and recognition",
        link: "./awards.html",
    },
];

export const SOCIAL_ITEMS = [
    { label: "LinkedIn", link: "https://www.linkedin.com/in/arian-nami-b1209633b" },
    { label: "Instagram", link: "https://www.instagram.com/arian.nmi" },
    { label: "Behance", link: "https://www.behance.net/ariannami" },
];

export const AWARDS_DATA = [
    {
        id: "ida-agrivision-v1",
        title: "AGRI vision, first version",
        organization: "IDA Competition",
        year: "2025",
        honor: "Bronze",
        category: "Agricultural Tools",
        image: "/assets/aistudio/Untitled26_6fe4bbd9.webp",
        externalUrl: "https://www.idesignawards.com/social/zoom.php?eid=9-65192-25",
        externalLabel: "IDA Award Page",
        dialogExternalLabel: "View Official IDA Award Page",
        lightBg: true,
        caseStudyUrl: "./agrivision.html",
        description:
            "IDA Competition 2025 Bronze winner in Agricultural Tools for the first-generation AGRI vision autonomous field surveying and mobile solar docking system.",
    },
    {
        id: "kioskedia-elephant",
        title: "Elephant",
        organization: "Kioskedia International Awards",
        year: "2025",
        honor: "Honorable Mention",
        category: "Product",
        image: "/assets/aistudio/Untitled25_c2560062.webp",
        externalUrl: "https://award.kioskedia.com/winner/2597",
        externalLabel: "Kioskedia Award Page",
        dialogExternalLabel: "View Official Kioskedia Award Page",
        lightBg: false,
        description:
            "Kioskedia International Awards 2025 Honorable Mention in Product Design for a modular solar-canopy EV charging station with sculptural architectural columns and integrated kiosk terminals.",
    },
    {
        id: "dlight-lunight",
        title: "Lunight",
        organization: "D'Light Lighting Design Awards",
        year: "2026",
        honor: "Bronze",
        category: "Lighting Design",
        image: "/assets/aistudio/Untitled24_a790fbb6.webp",
        externalUrl: "https://dlightaward.com/winners/?dwp_winner=4983",
        externalLabel: "D'Light Award Page",
        dialogExternalLabel: "View Official D'Light Award Page",
        lightBg: false,
        description:
            "D'Light Lighting Design Awards 2026 Bronze winner, honored for its lunar-textured body, warm orbital neon light arcs, and precision-machined brushed aluminum base.",
    },
    {
        id: "iauctb-yalda-pack",
        title: "Yalda Pack",
        organization: "IAUCTB Internal Competition",
        year: "2025",
        honor: "First Place",
        category: "Packaging & Product",
        image: "/assets/aistudio/Untitled28_45993003.webp",
        externalUrl: "",
        externalLabel: "",
        dialogExternalLabel: "",
        lightBg: true,
        description:
            "First Place winner at the 2025 IAUCTB Internal Competition, celebrated for structural packaging architecture, cultural storytelling, and tactile presentation.",
    },
    {
        id: "ida-axis",
        title: "Axis",
        organization: "IDA Competition",
        year: "2025",
        honor: "Bronze",
        category: "Product Design",
        image: "/assets/aistudio/Untitled27.webp",
        externalUrl: "https://www.idesignawards.com/social/zoom.php?eid=9-65067-25",
        externalLabel: "IDA Award Page",
        dialogExternalLabel: "View Official IDA Award Page",
        lightBg: true,
        description:
            "IDA Competition 2025 Bronze winner inspired by the counterclockwise orbital motion of Earth and Mars around the Sun, featuring two motorized concentric rings and automatic Bluetooth GMT synchronization.",
    },
];

export const PROJECT_DETAILS = {
    agri: {
        id: "agri",
        link: "./agrivision.html",
        image: "/assets/aistudio/Untitled1_da706d99.jpg",
        model3d: "/assets/podanddrone.glb",
        aerialUnitFrontView: "/assets/aistudio/Untitled2_78bbfd05.webp",
        aerialUnitBackView: "/assets/aistudio/Untitled3_2bbc8a67.webp",
        groundStationView: "/assets/aistudio/Untitled11_eb6b18ee.webp",
        category: "autonomous field surveying",
        title: "AGRIVISION",
        description:
            "Professional agricultural drone ecosystem featuring an autonomous quadrotor and ruggedized 500W solar-assisted mobile docking station with integrated battery telemetry and field kit storage.",
    },
    elephant: {
        id: "elephant",
        link: "./elephant.html",
        image: "/assets/aistudio/Untitled25_c2560062.webp",
        category: "EV charging station",
        title: "Elephant",
        description:
            "Modular solar-canopy EV charging station with sculptural architectural columns, dual high-output charging bays, and integrated kiosk terminals.",
    },
    wheelchair: {
        id: "wheelchair",
        link: "./elephant.html",
        image: "/assets/aistudio/Untitled25_c2560062.webp",
        category: "EV charging station",
        title: "Elephant",
        description:
            "Modular solar-canopy EV charging station with sculptural architectural columns, dual high-output charging bays, and integrated kiosk terminals.",
    },
    sarv: {
        id: "sarv",
        link: "./sarv.html",
        image: "/assets/aistudio/47webp_2033afe0.webp",
        category: "Lighting Product",
        title: "Sarv",
        description:
            "Architectural lighting product inspired by the Persian cypress, featuring 18 radial burl-wood and brushed-aluminum louver fins around a warm diffused LED core.",
    },
    rfid: {
        id: "rfid",
        link: "./sarv.html",
        image: "/assets/aistudio/47webp_2033afe0.webp",
        category: "Lighting Product",
        title: "Sarv",
        description:
            "Architectural lighting product inspired by the Persian cypress, featuring 18 radial burl-wood and brushed-aluminum louver fins around a warm diffused LED core.",
    },
    interior: {
        id: "interior",
        link: "./interior.html",
        image: "/assets/aistudio/61webp_4ad89aa8.webp",
        category: "Spatial & Architectural",
        title: "Interior design",
        description:
            "Transformative commercial interiors and collaborative design studios shaped by brand heritage, fluid zoning, and bespoke architectural framing.",
    },
    gallery: {
        id: "gallery",
        link: "./gallery.html",
        image: "/assets/aistudio/1_05be8140.webp",
        category: "Concept Art",
        title: "General 3D gallery",
        description:
            "Curated archive of 46 3D studies, hard-surface concept models, product visualizations, material explorations, and studio lighting renders.",
    },
    survival: {
        id: "survival",
        link: "./gallery.html",
        image: "/assets/aistudio/1_05be8140.webp",
        category: "Concept Art",
        title: "General 3D gallery",
        description:
            "Curated archive of 46 3D studies, hard-surface concept models, product visualizations, material explorations, and studio lighting renders.",
    },
};

export const SERVICES_ITEMS = [
    {
        id: "industrial-hardware",
        title: "01 / Industrial & Hardware Design",
        image: "/assets/aistudio/Untitled2_78bbfd05.webp",
        alt: "AgriVision Autonomous Surveying Hardware Render",
        description:
            "I design functional, multi-component product ecosystems engineered for the real world. From agricultural machinery and modular medical equipment to consumer electronics, I bridge the gap between strict physical manufacturing constraints and forward-looking, ergonomic forms.",
    },
    {
        id: "spatial-architecture",
        title: "02 / Spatial Architecture & Custom Millwork",
        image: "/assets/aistudio/61webp_4ad89aa8.webp",
        alt: "Dorsa Design Studio Spatial Architecture & Custom Millwork Render",
        description:
            "Transforming rigid spaces into fluid, collaborative environments. My interior services cover precise architectural surveying, adaptive reuse planning, and the design of bespoke, highly tactical custom furniture and fixtures tailored to a brand’s specific visual identity.",
    },
    {
        id: "3d-visualization-cgi",
        title: "03 / 3D Visualization & CGI",
        image: "/assets/aistudio/24webp_47964294.webp",
        alt: "Orthographic Multi-View & Exploded 3D CGI Presentation Sheet Render",
        description:
            "Translating raw CAD data into compelling visual narratives. I specialize in high-fidelity photorealistic rendering, cinematic lighting, and the creation of highly detailed orthographic multi-view presentation sheets that communicate exact technical specifications to clients and engineers.",
    },
    {
        id: "concept-worldbuilding",
        title: "04 / Concept Design & Worldbuilding",
        image: "/assets/aistudio/28webp_1afcb458.webp",
        alt: "Survivalist Tactical Blade & Mechanical Prop Concept Render",
        description:
            "When not bound by real-world manufacturing, I sculpt immersive visual identities and functional fiction. This includes designing atmospheric post-apocalyptic character concepts, survivalist equipment, and highly detailed mechanical props for entertainment and digital media.",
    },
];

export const STUDIO_SECTIONS = {
    about: {
        category: "Studio Profile",
        title: "About Arian Nami",
        image: "/assets/aistudio/Untitled1_da706d99.jpg",
        description:
            "Industrial Designer & 3D Visualization Specialist focused on hardware products, medical devices, robotics enclosures, and atmospheric architectural spaces engineered for real-world manufacturing.",
    },
    services: {
        category: "Capabilities & Disciplines",
        title: "Design & Visualization Services",
        image: "/assets/aistudio/Untitled2_78bbfd05.webp",
        description:
            "01 / Industrial & Hardware Design — 02 / Spatial Architecture & Custom Millwork — 03 / 3D Visualization & CGI — 04 / Concept Design & Worldbuilding",
        items: SERVICES_ITEMS,
    },
    contact: {
        category: "Direct Inquiries",
        title: "Arnami.samco@gmail.com",
        image: "/assets/aistudio/61webp_4ad89aa8.webp",
        description:
            "Available for industrial design, spatial architecture, 3D visualization, and concept commissions worldwide. Reach out directly via Arnami.samco@gmail.com.",
    },
    awards: {
        category: "Recognition & Honors",
        title: "Selected Design Awards",
        image: "/assets/aistudio/Untitled26_6fe4bbd9.webp",
        description:
            "Recognized for excellence in industrial hardware ergonomics, autonomous agricultural mobility ecosystems, and photorealistic 3D product visualization.",
    },
};

/**
 * Pure helper: looks up project metadata by key
 * @param {string} key
 */
export function getProjectById(key) {
    return PROJECT_DETAILS[key] || PROJECT_DETAILS.agri;
}

/**
 * Initializes the carterogunsola.com/lab-inspired radial wheel on awards.html
 * @param {(award: typeof AWARDS_DATA[number]) => void} openAwardModal
 */
export function initAwardsWheel(openAwardModal) {
    const viewport = document.getElementById("awards-wheel-viewport");
    if (!viewport) return;

    const wheelSection = document.getElementById("awards-wheel-section");
    const listSection = document.getElementById("awards-list-section");
    const gridSection = document.getElementById("awards-grid-section");
    const listContainer = document.getElementById("awards-list-container");
    const gridContainer = document.getElementById("awards-grid-container");

    const previewImg = /** @type {HTMLImageElement | null} */ (
        document.getElementById("awards-preview-img")
    );
    const previewIndex = document.getElementById("awards-preview-index");
    const previewCaption = document.getElementById("awards-preview-caption");
    const previewOrg = document.getElementById("awards-preview-org");
    const previewYear = document.getElementById("awards-preview-year");
    const previewHonor = document.getElementById("awards-preview-honor");
    const previewDesc = document.getElementById("awards-preview-desc");
    const previewTrigger = document.getElementById("awards-preview-trigger");
    const openDetailBtn = document.getElementById("awards-open-detail");
    const externalLinkEl = /** @type {HTMLAnchorElement | null} */ (
        document.getElementById("awards-external-link")
    );
    const stepPrevBtn = document.getElementById("awards-step-prev");
    const stepNextBtn = document.getElementById("awards-step-next");
    const viewButtons = Array.from(
        document.querySelectorAll(".awards-view-btn")
    );

    const count = AWARDS_DATA.length;
    const HALF_SLOTS = 7; // 15 visible radial slots (-7 .. +7)

    let currentPos = 0;
    let targetPos = 0;
    let activeAwardIndex = 0;
    let rafId = 0;
    let wheelSnapTimer = 0;

    // Create the 15 virtual slot elements once
    const slotElements = [];
    viewport.innerHTML = "";

    for (let k = -HALF_SLOTS; k <= HALF_SLOTS; k++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "awards-wheel-item";
        btn.setAttribute("data-slot-offset", String(k));

        const titleSpan = document.createElement("span");
        titleSpan.className = "awards-wheel-title";

        const metaWrap = document.createElement("span");
        metaWrap.className = "awards-wheel-tags";
        metaWrap.setAttribute("aria-hidden", "true");

        const tagCategory = document.createElement("span");
        tagCategory.className = "awards-wheel-tag";

        const tagHonor = document.createElement("span");
        tagHonor.className = "awards-wheel-tag awards-wheel-tag--honor";

        const arrowBadge = document.createElement("span");
        arrowBadge.className = "awards-wheel-arrow";
        arrowBadge.innerHTML = `<svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        metaWrap.append(tagCategory, tagHonor, arrowBadge);
        btn.append(titleSpan, metaWrap);

        btn.addEventListener("click", () => {
            const slotOffset = Number(btn.getAttribute("data-slot-offset") || "0");
            if (slotOffset === 0 && Math.abs(targetPos - currentPos) < 0.15) {
                openAwardModal(AWARDS_DATA[activeAwardIndex]);
            } else {
                targetPos = Math.round(currentPos) + slotOffset;
                scheduleRender();
            }
        });

        viewport.appendChild(btn);
        slotElements.push({
            k,
            btn,
            titleSpan,
            tagCategory,
            tagHonor,
        });
    }

    function updatePreviewStage(awardIndex) {
        const award = AWARDS_DATA[awardIndex];
        if (!award) return;
        const idxStr = String(awardIndex + 1).padStart(2, "0");
        const totalStr = String(count).padStart(2, "0");

        if (previewIndex) {
            previewIndex.textContent = `${idxStr} / ${totalStr}`;
        }
        if (previewCaption) {
            previewCaption.textContent = `${award.organization} · ${award.category} · ${award.year} ${award.honor}`;
        }
        if (previewOrg) {
            previewOrg.textContent = `${award.organization} · ${award.category}`;
        }
        if (previewYear) {
            previewYear.textContent = award.year;
        }
        if (previewHonor) {
            previewHonor.textContent = award.honor;
        }
        if (previewDesc) {
            previewDesc.textContent = award.description;
        }
        if (externalLinkEl) {
            if (award.externalUrl) {
                externalLinkEl.href = award.externalUrl;
                const labelSpan = externalLinkEl.querySelector("span");
                if (labelSpan) {
                    labelSpan.textContent = award.externalLabel || "Award Page";
                }
                externalLinkEl.hidden = false;
            } else {
                externalLinkEl.hidden = true;
            }
        }
        if (previewImg) {
            const mediaBox = previewImg.closest(".awards-preview-media");
            if (mediaBox) {
                mediaBox.classList.toggle("is-light-bg", Boolean(award.lightBg));
            }
            if (previewImg.getAttribute("src") !== award.image) {
                previewImg.classList.add("is-switching");
                previewImg.setAttribute("src", award.image);
                previewImg.setAttribute(
                    "alt",
                    `${award.title} — ${award.organization}`
                );
                window.setTimeout(() => {
                    previewImg.classList.remove("is-switching");
                }, 140);
            }
        }
    }

    function getViewportWheelConfig() {
        const vw = window.innerWidth || 1440;
        const vh = window.innerHeight || 900;
        const isMobile = vw < 768;
        const isTablet = vw >= 768 && vw < 1100;

        const radius = isMobile ? 330 : isTablet ? 560 : 675;
        const x0 = isMobile ? 36 : isTablet ? 54 : 82.6318;
        const y0 = Math.round(vh * (isMobile ? 0.31 : 0.46));

        return {
            radius,
            angleStepDeg: isMobile ? 6.8 : 6.02667,
            scaleStep: 0.0117,
            minScale: 0.85,
            x0,
            y0,
            fadeStartOffset: isMobile ? 3 : 4,
            fadeSlope: isMobile ? 0.34 : 0.263,
        };
    }

    function renderWheelFrame() {
        const cfg = getViewportWheelConfig();
        const slots = buildWheelVirtualSlots(currentPos, count, HALF_SLOTS, cfg);

        const newActiveIdx = wrapIndex(Math.round(currentPos), count);
        if (newActiveIdx !== activeAwardIndex) {
            activeAwardIndex = newActiveIdx;
            updatePreviewStage(activeAwardIndex);
        }

        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const dom = slotElements[i];
            const award = AWARDS_DATA[slot.itemIndex];

            dom.btn.style.transform = slot.transform;
            dom.btn.style.opacity = slot.opacity.toFixed(3);
            dom.btn.style.pointerEvents = slot.opacity < 0.08 ? "none" : "auto";
            dom.btn.classList.toggle("is-active", slot.isActive);
            dom.btn.setAttribute("data-award-id", award.id);

            if (dom.titleSpan.textContent !== award.title) {
                dom.titleSpan.textContent = award.title;
            }
            if (dom.tagCategory.textContent !== award.year) {
                dom.tagCategory.textContent = award.year;
            }
            if (dom.tagHonor.textContent !== award.honor) {
                dom.tagHonor.textContent = award.honor;
            }

            // Expose primary interactive slots to accessibility tree, hide distant edge clones
            if (Math.abs(slot.slotOffset) <= 3) {
                dom.btn.removeAttribute("aria-hidden");
                dom.btn.tabIndex = slot.slotOffset === 0 ? 0 : -1;
                dom.btn.setAttribute(
                    "aria-label",
                    `${award.title} — ${award.organization} (${award.year} ${award.honor})`
                );
            } else {
                dom.btn.setAttribute("aria-hidden", "true");
                dom.btn.tabIndex = -1;
            }
        }
    }

    function tickAnimation() {
        rafId = 0;
        const diff = targetPos - currentPos;
        if (Math.abs(diff) > 0.001) {
            currentPos += diff * 0.16;
            renderWheelFrame();
            rafId = window.requestAnimationFrame(tickAnimation);
        } else {
            currentPos = targetPos;
            renderWheelFrame();
        }
    }

    function scheduleRender() {
        if (!rafId) {
            rafId = window.requestAnimationFrame(tickAnimation);
        }
    }

    // Populate Alternative List & Grid Views so the bottom LIST | WHEEL | GRID switcher is 100% functional
    if (listContainer) {
        listContainer.innerHTML = AWARDS_DATA.map((award, idx) => {
            const num = String(idx + 1).padStart(2, "0");
            return `
                <button type="button" class="awards-list-row" data-award-idx="${idx}">
                    <span class="awards-list-num">’${num}</span>
                    <span class="awards-list-title">${award.title}</span>
                    <span class="awards-list-org">${award.organization}</span>
                    <span class="awards-list-meta">${award.category} &nbsp;·&nbsp; ${award.year} &nbsp;·&nbsp; ${award.honor}</span>
                </button>
            `;
        }).join("");

        listContainer.querySelectorAll(".awards-list-row").forEach((row) => {
            row.addEventListener("click", () => {
                const idx = Number(row.getAttribute("data-award-idx") || "0");
                targetPos = idx;
                currentPos = idx;
                activeAwardIndex = idx;
                updatePreviewStage(idx);
                renderWheelFrame();
                openAwardModal(AWARDS_DATA[idx]);
            });
        });
    }

    if (gridContainer) {
        gridContainer.innerHTML = AWARDS_DATA.map((award, idx) => {
            const num = String(idx + 1).padStart(2, "0");
            const mediaClass = award.lightBg
                ? "awards-grid-media is-light-bg"
                : "awards-grid-media";
            return `
                <button type="button" class="awards-grid-card" data-award-idx="${idx}">
                    <div class="${mediaClass}">
                        <img src="${award.image}" alt="${award.title}" class="awards-grid-img" referrerpolicy="no-referrer">
                    </div>
                    <div class="awards-grid-body">
                        <div class="awards-grid-kicker">’${num} &nbsp;·&nbsp; ${award.year} &nbsp;·&nbsp; ${award.honor}</div>
                        <div class="awards-grid-title">${award.title}</div>
                        <div class="awards-grid-org">${award.organization} &nbsp;·&nbsp; ${award.category}</div>
                    </div>
                </button>
            `;
        }).join("");

        gridContainer.querySelectorAll(".awards-grid-card").forEach((card) => {
            card.addEventListener("click", () => {
                const idx = Number(card.getAttribute("data-award-idx") || "0");
                targetPos = idx;
                currentPos = idx;
                activeAwardIndex = idx;
                updatePreviewStage(idx);
                renderWheelFrame();
                openAwardModal(AWARDS_DATA[idx]);
            });
        });
    }

    // View Switcher (LIST | WHEEL | GRID)
    viewButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const mode = btn.getAttribute("data-view-mode") || "wheel";
            document.body.setAttribute("data-awards-view", mode);

            viewButtons.forEach((b) => {
                const active = b === btn;
                b.classList.toggle("is-active", active);
                b.setAttribute("aria-pressed", active ? "true" : "false");
            });

            if (wheelSection) wheelSection.hidden = mode !== "wheel";
            if (listSection) listSection.hidden = mode !== "list";
            if (gridSection) gridSection.hidden = mode !== "grid";

            if (mode === "wheel") {
                renderWheelFrame();
            }
        });
    });

    // Mouse wheel rotation anywhere on the viewport in Wheel mode
    window.addEventListener(
        "wheel",
        (event) => {
            if (document.body.getAttribute("data-awards-view") !== "wheel") {
                return;
            }
            if (document.body.getAttribute("data-menu-open") === "true") {
                return;
            }
            const dialogEl = document.getElementById("project-dialog");
            if (dialogEl && dialogEl.hasAttribute("open")) {
                return;
            }
            event.preventDefault();
            targetPos = computeWheelTargetFromDelta(targetPos, event.deltaY);
            scheduleRender();

            window.clearTimeout(wheelSnapTimer);
            wheelSnapTimer = window.setTimeout(() => {
                targetPos = Math.round(targetPos);
                scheduleRender();
            }, 130);
        },
        { passive: false }
    );

    // Pointer drag support on wheel viewport
    let isDragging = false;
    let dragStartY = 0;
    let dragStartPos = 0;

    viewport.addEventListener("pointerdown", (event) => {
        if ((event.target instanceof Element) && event.target.closest("button")) {
            // Allow normal button clicks unless dragged
        }
        isDragging = true;
        dragStartY = event.clientY;
        dragStartPos = targetPos;
    });

    window.addEventListener("pointermove", (event) => {
        if (!isDragging) return;
        const dy = event.clientY - dragStartY;
        if (Math.abs(dy) > 6) {
            targetPos = dragStartPos - dy / 68;
            scheduleRender();
        }
    });

    const finishDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        targetPos = Math.round(targetPos);
        scheduleRender();
    };

    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    // Stepper & Keyboard navigation
    if (stepPrevBtn) {
        stepPrevBtn.addEventListener("click", () => {
            targetPos = Math.round(targetPos) - 1;
            scheduleRender();
        });
    }

    if (stepNextBtn) {
        stepNextBtn.addEventListener("click", () => {
            targetPos = Math.round(targetPos) + 1;
            scheduleRender();
        });
    }

    if (previewTrigger) {
        previewTrigger.addEventListener("click", () => {
            openAwardModal(AWARDS_DATA[activeAwardIndex]);
        });
    }

    if (openDetailBtn) {
        openDetailBtn.addEventListener("click", () => {
            openAwardModal(AWARDS_DATA[activeAwardIndex]);
        });
    }

    window.addEventListener("keydown", (event) => {
        if (document.body.getAttribute("data-awards-view") !== "wheel") return;
        if (document.body.getAttribute("data-menu-open") === "true") return;
        const dialogEl = document.getElementById("project-dialog");
        if (dialogEl && dialogEl.hasAttribute("open")) return;

        if (event.key === "ArrowDown" || event.key === "PageDown") {
            event.preventDefault();
            targetPos = Math.round(targetPos) + 1;
            scheduleRender();
        } else if (event.key === "ArrowUp" || event.key === "PageUp") {
            event.preventDefault();
            targetPos = Math.round(targetPos) - 1;
            scheduleRender();
        }
    });

    window.addEventListener("resize", () => {
        renderWheelFrame();
    });

    // Initial synchronous render so first paint has zero layout shift
    updatePreviewStage(0);
    renderWheelFrame();
}

export function initPortfolioIndex() {
    if (typeof document === "undefined") return;

    const bgReveal = /** @type {HTMLImageElement | null} */ (
        document.getElementById("bg-reveal")
    );
    const projectItems = Array.from(
        document.querySelectorAll(".project-item")
    );

    const dialogEl = /** @type {HTMLDialogElement | null} */ (
        document.getElementById("project-dialog")
    );
    const dialogCloseBtn = document.getElementById("dialog-close");
    const dialogCategory = document.getElementById("dialog-project-category");
    const dialogImg = /** @type {HTMLImageElement | null} */ (
        document.getElementById("dialog-project-img")
    );
    const dialogTitle = document.getElementById("dialog-project-title");
    const dialogDesc = document.getElementById("dialog-project-desc");
    const dialogSingleView = document.getElementById("dialog-single-view");
    const dialogServicesGrid = document.getElementById("dialog-services-grid");

    if (dialogServicesGrid) {
        dialogServicesGrid.innerHTML = SERVICES_ITEMS.map(
            (service) => `
            <article class="service-card">
                <div class="service-card__media">
                    <img src="${service.image}" alt="${service.alt}" class="service-card__img" loading="eager" />
                </div>
                <div class="service-card__body">
                    <h4 class="service-card__title">${service.title}</h4>
                    <p class="service-card__desc">${service.description}</p>
                </div>
            </article>
        `
        ).join("");
    }

    // Instantiate GSAP-powered StaggeredMenu with portfolio dark theme & #7f072b accent
    const staggeredMenu = new StaggeredMenu({
        position: "right",
        items: MENU_ITEMS,
        socialItems: SOCIAL_ITEMS,
        displaySocials: true,
        displayItemNumbering: true,
        menuButtonColor: "#ffffff",
        openMenuButtonColor: "#7f072b",
        changeMenuColorOnOpen: true,
        colors: ["#7f072b", "#1F1F24"],
        accentColor: "#7f072b",
        onItemClick: (item, event) => {
            if (
                item.id === "home" ||
                item.id === "about" ||
                item.id === "projects" ||
                item.id === "awards"
            ) {
                // Allow native navigation to ./index.html, ./about.html, ./projects.html, or ./awards.html
                return;
            }

            event.preventDefault();
            staggeredMenu.close();

            const sectionData = STUDIO_SECTIONS[item.id];
            if (sectionData && dialogEl) {
                if (dialogCategory) {
                    dialogCategory.textContent = sectionData.category;
                }
                if (dialogTitle) {
                    dialogTitle.textContent = sectionData.title;
                }
                if (item.id === "services" && dialogServicesGrid) {
                    if (dialogSingleView) dialogSingleView.hidden = true;
                    dialogServicesGrid.hidden = false;
                } else {
                    if (dialogServicesGrid) dialogServicesGrid.hidden = true;
                    if (dialogSingleView) dialogSingleView.hidden = false;
                    if (dialogImg) {
                        dialogImg.src = sectionData.image;
                    }
                    if (dialogDesc) {
                        dialogDesc.textContent = sectionData.description;
                    }
                }
                if (typeof dialogEl.showModal === "function") {
                    dialogEl.showModal();
                }
            }
        },
    });

    // Preload all project renders so hover swaps are instantaneous
    projectItems.forEach((item) => {
        const imgUrl = item.getAttribute("data-image");
        if (imgUrl) {
            const preload = new Image();
            preload.src = imgUrl;
        }
    });

    function swapBackgroundImage(imageUrl) {
        if (!bgReveal || !imageUrl) return;
        if (bgReveal.getAttribute("src") === imageUrl) return;

        bgReveal.classList.add("is-transitioning");
        bgReveal.setAttribute("src", imageUrl);
        window.setTimeout(() => {
            bgReveal.classList.remove("is-transitioning");
        }, 160);
    }

    // Hover & focus-within image swap logic on .project-item
    projectItems.forEach((item) => {
        const imageUrl = item.getAttribute("data-image");
        const projectKey = item.getAttribute("data-project-key") || "agri";
        const linkEl = item.querySelector(".project-name");

        const handleActivate = () => {
            projectItems.forEach((el) =>
                el.classList.toggle("is-active", el === item)
            );
            swapBackgroundImage(imageUrl);
        };

        item.addEventListener("mouseenter", handleActivate);
        item.addEventListener("focusin", handleActivate);

        if (linkEl) {
            linkEl.addEventListener("click", (event) => {
                const href = linkEl.getAttribute("href") || "";
                if (href && !href.startsWith("#")) {
                    // Allow native navigation to dedicated project page (e.g. ./agrivision.html)
                    return;
                }
                event.preventDefault();
                handleActivate();
                const details = getProjectById(projectKey);
                if (dialogServicesGrid) dialogServicesGrid.hidden = true;
                if (dialogSingleView) dialogSingleView.hidden = false;
                if (dialogCategory) {
                    dialogCategory.textContent = details.category;
                }
                if (dialogTitle) {
                    dialogTitle.textContent = details.title;
                }
                if (dialogImg) {
                    dialogImg.src = imageUrl || details.image;
                }
                if (dialogDesc) {
                    dialogDesc.textContent = details.description;
                }
                if (dialogEl && typeof dialogEl.showModal === "function") {
                    dialogEl.showModal();
                }
            });
        }
    });

    if (dialogCloseBtn && dialogEl) {
        dialogCloseBtn.addEventListener("click", () => dialogEl.close());
        dialogEl.addEventListener("click", (event) => {
            if (event.target === dialogEl) dialogEl.close();
        });
    }

    // Initialize Awards Radial Wheel if on awards.html
    const dialogActions = document.getElementById("dialog-project-actions");
    const dialogExternalLink = /** @type {HTMLAnchorElement | null} */ (
        document.getElementById("dialog-external-link")
    );

    initAwardsWheel((award) => {
        if (!dialogEl) return;
        if (dialogServicesGrid) dialogServicesGrid.hidden = true;
        if (dialogSingleView) dialogSingleView.hidden = false;
        if (dialogCategory) {
            dialogCategory.textContent = `${award.organization} · ${award.category} · ${award.year} · ${award.honor}`;
        }
        if (dialogTitle) {
            dialogTitle.textContent = award.title;
        }
        if (dialogImg) {
            dialogImg.src = award.image;
            dialogImg.alt = `${award.title} — ${award.organization}`;
            dialogImg.classList.toggle("is-light-bg", Boolean(award.lightBg));
        }
        if (dialogDesc) {
            dialogDesc.textContent = award.description;
        }
        if (dialogExternalLink) {
            if (award.externalUrl) {
                dialogExternalLink.href = award.externalUrl;
                const labelSpan = dialogExternalLink.querySelector("span");
                if (labelSpan) {
                    labelSpan.textContent =
                        award.dialogExternalLabel || "View Official Award Page";
                }
                dialogExternalLink.hidden = false;
                if (dialogActions) dialogActions.hidden = false;
            } else {
                dialogExternalLink.hidden = true;
                if (dialogActions) dialogActions.hidden = true;
            }
        }
        if (typeof dialogEl.showModal === "function") {
            dialogEl.showModal();
        }
    });

    // dnbls.com style interactive WORK > EXPERIENCE showcase switcher
    const expItems = Array.from(document.querySelectorAll(".dn-exp-item"));
    const expCards = Array.from(document.querySelectorAll(".dn-exp-card"));
    const expCounter = document.getElementById("dn-exp-counter");
    const expFooterMeta = document.getElementById("dn-exp-footer-meta");
    const expBgImg = /** @type {HTMLImageElement | null} */ (
        document.getElementById("dn-exp-bg-img")
    );

    if (expItems.length > 0) {
        const totalStr = String(expItems.length).padStart(2, "0");
        expItems.forEach((item) => {
            const activateExp = () => {
                const idx = item.getAttribute("data-exp-index") || "01";
                const role = item.getAttribute("data-exp-role") || "";
                const img = item.getAttribute("data-exp-image") || "";
                const targetId = item.getAttribute("data-exp-target") || "";

                expItems.forEach((el) =>
                    el.classList.toggle("is-active", el === item)
                );
                expCards.forEach((card) =>
                    card.classList.toggle("is-active", card.id === targetId)
                );

                if (expCounter) {
                    expCounter.textContent = `${idx} / ${totalStr}`;
                }
                if (expFooterMeta && role) {
                    expFooterMeta.textContent = role;
                }
                if (expBgImg && img && expBgImg.getAttribute("src") !== img) {
                    expBgImg.setAttribute("src", img);
                }
            };

            item.addEventListener("mouseenter", activateExp);
            item.addEventListener("focus", activateExp);
            item.addEventListener("click", activateExp);

            const targetId = item.getAttribute("data-exp-target") || "";
            const matchingCard = expCards.find((c) => c.id === targetId);
            if (matchingCard) {
                matchingCard.addEventListener("click", activateExp);
            }
        });
    }
}

if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPortfolioIndex);
    } else {
        initPortfolioIndex();
    }
}
