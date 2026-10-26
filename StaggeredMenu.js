/**
 * StaggeredMenu — GSAP-powered multi-layer staggered drawer component
 * Faithful implementation of the React Bits StaggeredMenu animation architecture
 * in pure ES6 JavaScript + GSAP for 60fps GPU-composited motion.
 */
import { gsap } from "gsap";

export default class StaggeredMenu {
    /**
     * @param {Object} options
     * @param {'right' | 'left'} [options.position='right']
     * @param {Array<{label: string, ariaLabel?: string, link: string, id?: string}>} [options.items=[]]
     * @param {Array<{label: string, link: string}>} [options.socialItems=[]]
     * @param {boolean} [options.displaySocials=true]
     * @param {boolean} [options.displayItemNumbering=true]
     * @param {string} [options.menuButtonColor='#ffffff']
     * @param {string} [options.openMenuButtonColor='#ffffff']
     * @param {boolean} [options.changeMenuColorOnOpen=true]
     * @param {string[]} [options.colors=['#7f072b', '#1F1F24']]
     * @param {string} [options.accentColor='#7f072b']
     * @param {() => void} [options.onMenuOpen]
     * @param {() => void} [options.onMenuClose]
     * @param {(item: {label: string, link: string, id?: string}, event: MouseEvent) => void} [options.onItemClick]
     */
    constructor(options = {}) {
        this.position = options.position || "right";
        this.items = options.items || [];
        this.socialItems = options.socialItems || [];
        this.displaySocials =
            options.displaySocials !== undefined ? options.displaySocials : true;
        this.displayItemNumbering =
            options.displayItemNumbering !== undefined
                ? options.displayItemNumbering
                : true;
        this.menuButtonColor = options.menuButtonColor || "#ffffff";
        this.openMenuButtonColor = options.openMenuButtonColor || "#7f072b";
        this.changeMenuColorOnOpen =
            options.changeMenuColorOnOpen !== undefined
                ? options.changeMenuColorOnOpen
                : true;
        this.colors =
            Array.isArray(options.colors) && options.colors.length
                ? options.colors.slice(0, 4)
                : ["#7f072b", "#1F1F24"];
        this.accentColor = options.accentColor || "#7f072b";
        this.onMenuOpen = options.onMenuOpen || (() => {});
        this.onMenuClose = options.onMenuClose || (() => {});
        this.onItemClick = options.onItemClick || null;

        this.isOpen = false;
        this.isBusy = false;
        this.openTl = null;
        this.closeTween = null;
        this.spinTween = null;
        this.textCycleAnim = null;
        this.colorTween = null;

        this.labels = {
            menu: "Menu",
            close: "Close",
        };

        if (typeof document !== "undefined") {
            this.mount();
        }
    }

    mount() {
        this.wrapper = document.getElementById("staggered-menu");
        this.panel = document.getElementById("staggered-menu-panel");
        this.preLayersContainer = document.getElementById("sm-prelayers");
        this.backdrop = document.getElementById("sm-backdrop");
        this.toggleBtn = document.getElementById("menu-toggle");
        this.textInner = document.getElementById("sm-toggle-textInner");
        this.icon = document.getElementById("sm-toggle-icon");
        this.lineH = document.getElementById("sm-icon-line-h");
        this.lineV = document.getElementById("sm-icon-line-v");
        this.listEl = document.getElementById("sm-panel-list");
        this.socialsContainer = document.getElementById("sm-socials");
        this.socialsListEl = document.getElementById("sm-socials-list");

        if (!this.wrapper || !this.panel || !this.toggleBtn) return;

        this.wrapper.style.setProperty("--sm-accent", this.accentColor);
        this.wrapper.setAttribute("data-position", this.position);

        // Render pre-layers dynamically from colors prop
        if (this.preLayersContainer) {
            this.preLayersContainer.innerHTML = "";
            this.colors.forEach((color) => {
                const layer = document.createElement("div");
                layer.className = "sm-prelayer";
                layer.style.background = color;
                this.preLayersContainer.appendChild(layer);
            });
            this.preLayerEls = Array.from(
                this.preLayersContainer.querySelectorAll(".sm-prelayer")
            );
        } else {
            this.preLayerEls = [];
        }

        // Set initial GSAP transforms offscreen (physical right = +100, left = -100)
        const offscreen = this.position === "left" ? -100 : 100;
        gsap.set([...this.preLayerEls, this.panel], {
            xPercent: offscreen,
            force3D: true,
        });

        if (this.lineH && this.lineV && this.icon) {
            gsap.set(this.lineH, { rotate: 0, transformOrigin: "50% 50%" });
            gsap.set(this.lineV, { rotate: 90, transformOrigin: "50% 50%" });
            gsap.set(this.icon, { rotate: 0, transformOrigin: "50% 50%" });
        }

        if (this.textInner) {
            gsap.set(this.textInner, { yPercent: 0, force3D: true });
        }

        gsap.set(this.toggleBtn, { color: this.menuButtonColor });

        this.bindEvents();
    }

    bindEvents() {
        this.toggleBtn.addEventListener("click", () => {
            this.toggle();
        });

        if (this.backdrop) {
            this.backdrop.addEventListener("click", () => {
                if (this.isOpen) this.close();
            });
        }

        if (this.listEl) {
            this.listEl.querySelectorAll(".sm-panel-item").forEach((linkEl, idx) => {
                linkEl.addEventListener("click", (event) => {
                    if (this.onItemClick) {
                        const itemData = this.items[idx] || {
                            label: linkEl.textContent.trim(),
                            link: linkEl.getAttribute("href") || "/",
                            id: linkEl.getAttribute("data-menu-section") || "home",
                        };
                        this.onItemClick(itemData, event);
                    }
                });
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && this.isOpen) {
                this.close();
            }
        });
    }

    buildOpenTimeline() {
        if (!this.panel) return null;

        this.openTl?.kill();
        if (this.closeTween) {
            this.closeTween.kill();
            this.closeTween = null;
        }

        const itemEls = Array.from(
            this.panel.querySelectorAll(".sm-panel-itemLabel")
        );
        const numberEls = Array.from(
            this.panel.querySelectorAll(
                ".sm-panel-list[data-numbering] .sm-panel-item"
            )
        );
        const emailBlock = this.panel.querySelector(".sm-email-block");
        const socialTitle = this.panel.querySelector(".sm-socials-title");
        const socialLinks = Array.from(
            this.panel.querySelectorAll(".sm-socials-link")
        );

        const offscreen = this.position === "left" ? -100 : 100;

        if (itemEls.length) {
            gsap.set(itemEls, {
                yPercent: 140,
                rotate: 10,
                force3D: true,
            });
        }
        if (numberEls.length) {
            gsap.set(numberEls, { "--sm-num-opacity": 0 });
        }
        if (emailBlock) {
            gsap.set(emailBlock, { y: 16, opacity: 0, force3D: true });
        }
        if (socialTitle) {
            gsap.set(socialTitle, { opacity: 0 });
        }
        if (socialLinks.length) {
            gsap.set(socialLinks, { y: 25, opacity: 0, force3D: true });
        }
        if (this.backdrop) {
            gsap.set(this.backdrop, { opacity: 0 });
        }

        const tl = gsap.timeline({ paused: true });

        if (this.backdrop) {
            tl.to(
                this.backdrop,
                { opacity: 1, duration: 0.35, ease: "power2.out" },
                0
            );
        }

        this.preLayerEls.forEach((layerEl, i) => {
            tl.fromTo(
                layerEl,
                { xPercent: offscreen },
                { xPercent: 0, duration: 0.5, ease: "power4.out", force3D: true },
                i * 0.07
            );
        });

        const lastTime = this.preLayerEls.length
            ? (this.preLayerEls.length - 1) * 0.07
            : 0;
        const panelInsertTime = lastTime + (this.preLayerEls.length ? 0.08 : 0);
        const panelDuration = 0.65;

        tl.fromTo(
            this.panel,
            { xPercent: offscreen },
            {
                xPercent: 0,
                duration: panelDuration,
                ease: "power4.out",
                force3D: true,
            },
            panelInsertTime
        );

        if (itemEls.length) {
            const itemsStart = panelInsertTime + panelDuration * 0.15;
            tl.to(
                itemEls,
                {
                    yPercent: 0,
                    rotate: 0,
                    duration: 1,
                    ease: "power4.out",
                    force3D: true,
                    stagger: { each: 0.1, from: "start" },
                },
                itemsStart
            );

            if (numberEls.length) {
                tl.to(
                    numberEls,
                    {
                        duration: 0.6,
                        ease: "power2.out",
                        "--sm-num-opacity": 1,
                        stagger: { each: 0.08, from: "start" },
                    },
                    itemsStart + 0.1
                );
            }
        }

        if (emailBlock || socialTitle || socialLinks.length) {
            const socialsStart = panelInsertTime + panelDuration * 0.4;
            if (emailBlock) {
                tl.to(
                    emailBlock,
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.5,
                        ease: "power2.out",
                        force3D: true,
                    },
                    socialsStart - 0.04
                );
            }
            if (socialTitle) {
                tl.to(
                    socialTitle,
                    { opacity: 1, duration: 0.5, ease: "power2.out" },
                    socialsStart
                );
            }
            if (socialLinks.length) {
                tl.to(
                    socialLinks,
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.55,
                        ease: "power3.out",
                        force3D: true,
                        stagger: { each: 0.08, from: "start" },
                        onComplete: () => {
                            gsap.set(socialLinks, { clearProps: "opacity" });
                        },
                    },
                    socialsStart + 0.04
                );
            }
        }

        this.openTl = tl;
        return tl;
    }

    playOpen() {
        if (this.isBusy) return;
        this.isBusy = true;
        const tl = this.buildOpenTimeline();
        if (tl) {
            tl.eventCallback("onComplete", () => {
                this.isBusy = false;
            });
            tl.play(0);
        } else {
            this.isBusy = false;
        }
    }

    playClose() {
        this.openTl?.kill();
        this.openTl = null;

        const all = [...this.preLayerEls, this.panel];
        const offscreen = this.position === "left" ? -100 : 100;

        if (this.backdrop) {
            gsap.to(this.backdrop, {
                opacity: 0,
                duration: 0.28,
                ease: "power2.in",
                overwrite: "auto",
            });
        }

        this.closeTween?.kill();
        this.closeTween = gsap.to(all, {
            xPercent: offscreen,
            duration: 0.32,
            ease: "power3.in",
            overwrite: "auto",
            force3D: true,
            onComplete: () => {
                const itemEls = Array.from(
                    this.panel.querySelectorAll(".sm-panel-itemLabel")
                );
                if (itemEls.length) {
                    gsap.set(itemEls, { yPercent: 140, rotate: 10 });
                }
                const numberEls = Array.from(
                    this.panel.querySelectorAll(
                        ".sm-panel-list[data-numbering] .sm-panel-item"
                    )
                );
                if (numberEls.length) {
                    gsap.set(numberEls, { "--sm-num-opacity": 0 });
                }
                const socialTitle = this.panel.querySelector(".sm-socials-title");
                const socialLinks = Array.from(
                    this.panel.querySelectorAll(".sm-socials-link")
                );
                if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
                if (socialLinks.length) {
                    gsap.set(socialLinks, { y: 25, opacity: 0 });
                }
                this.isBusy = false;
            },
        });
    }

    animateIcon(opening) {
        if (!this.lineH || !this.lineV) return;
        this.spinTween?.kill();
        if (opening) {
            this.spinTween = gsap
                .timeline({ defaults: { ease: "power4.out" } })
                .to(this.lineH, { rotate: 45, duration: 0.5 }, 0)
                .to(this.lineV, { rotate: -45, duration: 0.5 }, 0);
        } else {
            this.spinTween = gsap
                .timeline({ defaults: { ease: "power3.inOut" } })
                .to(this.lineH, { rotate: 0, duration: 0.35 }, 0)
                .to(this.lineV, { rotate: 90, duration: 0.35 }, 0);
        }
    }

    animateColor(opening) {
        if (!this.toggleBtn) return;
        this.colorTween?.kill();
        if (this.changeMenuColorOnOpen) {
            const targetColor = opening
                ? this.openMenuButtonColor
                : this.menuButtonColor;
            this.colorTween = gsap.to(this.toggleBtn, {
                color: targetColor,
                delay: 0.12,
                duration: 0.3,
                ease: "power2.out",
            });
        } else {
            gsap.set(this.toggleBtn, { color: this.menuButtonColor });
        }
    }

    animateText(opening) {
        if (!this.textInner) return;
        this.textCycleAnim?.kill();

        const menuWord = this.labels.menu;
        const closeWord = this.labels.close;
        const currentLabel = opening ? menuWord : closeWord;
        const targetLabel = opening ? closeWord : menuWord;
        const cycles = 3;

        const seq = [currentLabel];
        let last = currentLabel;
        for (let i = 0; i < cycles; i++) {
            last = last === menuWord ? closeWord : menuWord;
            seq.push(last);
        }
        if (last !== targetLabel) seq.push(targetLabel);
        seq.push(targetLabel);

        this.textInner.innerHTML = seq
            .map((line) => `<span class="sm-toggle-line">${line}</span>`)
            .join("");

        gsap.set(this.textInner, { yPercent: 0, force3D: true });
        const lineCount = seq.length;
        const finalShift = ((lineCount - 1) / lineCount) * 100;

        this.textCycleAnim = gsap.to(this.textInner, {
            yPercent: -finalShift,
            duration: 0.5 + cycles * 0.12,
            ease: "power4.out",
            force3D: true,
        });
    }

    setLocalizedLabels(menuWord, closeWord) {
        this.labels.menu = menuWord;
        this.labels.close = closeWord;
        if (!this.textInner) return;
        const activeWord = this.isOpen ? closeWord : menuWord;
        this.textInner.innerHTML = `<span class="sm-toggle-line">${activeWord}</span>`;
        gsap.set(this.textInner, { yPercent: 0, force3D: true });
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        document.body.setAttribute("data-menu-open", "true");
        this.wrapper?.setAttribute("data-open", "true");
        this.wrapper?.setAttribute("aria-hidden", "false");
        this.toggleBtn?.setAttribute("aria-expanded", "true");

        this.onMenuOpen?.();
        this.playOpen();
        this.animateIcon(true);
        this.animateColor(true);
        this.animateText(true);
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        document.body.setAttribute("data-menu-open", "false");
        this.wrapper?.setAttribute("data-open", "false");
        this.wrapper?.setAttribute("aria-hidden", "true");
        this.toggleBtn?.setAttribute("aria-expanded", "false");

        this.onMenuClose?.();
        this.playClose();
        this.animateIcon(false);
        this.animateColor(false);
        this.animateText(false);
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}
