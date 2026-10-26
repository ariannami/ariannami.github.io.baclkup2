/**
 * Pure auto-sorting and 12-column bin-packing layout engine for General 3D Gallery.
 * Classifies images by aspect ratio (width / height) and arranges them into
 * balanced 12-column editorial rows without orphan gaps.
 */

/**
 * Classifies an image's orientation from its width and height.
 * @param {number} width
 * @param {number} height
 * @returns {'panoramic' | 'landscape' | 'square' | 'portrait'}
 */
export function classifyAspectRatio(width, height) {
    if (!width || !height || width <= 0 || height <= 0) {
        return "landscape";
    }
    const ratio = width / height;
    if (ratio >= 1.95) return "panoramic";
    if (ratio >= 1.2) return "landscape";
    if (ratio >= 0.85) return "square";
    return "portrait";
}

/**
 * Auto-sorts and packs a list of gallery items (uploaded images + optional placeholders)
 * into balanced 12-column rows so every row sums to 12 columns and varied aspect ratios
 * interlock cleanly.
 *
 * @template {{ id: string, width?: number, height?: number, isUploaded?: boolean, title?: string }} T
 * @param {T[]} items
 * @returns {Array<T & { orientation: string, colSpan: number, aspectCss: string, rowIndex: number }>}
 */
export function autoSortGalleryItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return [];
    }

    // Separate uploaded items first so user-uploaded images always appear at the top,
    // followed by remaining placeholder slots.
    const uploaded = [];
    const placeholders = [];

    for (const item of items) {
        const w = Number(item.width) || 1600;
        const h = Number(item.height) || 1000;
        const orientation = classifyAspectRatio(w, h);
        const enriched = {
            ...item,
            width: w,
            height: h,
            ratio: w / h,
            orientation,
        };
        if (item.isUploaded) {
            uploaded.push(enriched);
        } else {
            placeholders.push(enriched);
        }
    }

    // Interleave uploaded items by orientation (landscape/portrait pairs, square trios, etc.)
    // so extreme aspect ratios complement each other in 12-column rows.
    const sortedUploaded = interleaveByOrientation(uploaded);
    const combined = [...sortedUploaded, ...placeholders];

    // Assign 12-column spans in balanced row groups
    const result = [];
    let i = 0;
    let rowIndex = 0;

    while (i < combined.length) {
        const remaining = combined.length - i;
        const current = combined[i];

        if (remaining === 1) {
            // Single final item: full 12-column feature or 8-column centered
            result.push({
                ...current,
                colSpan: 12,
                aspectCss: current.orientation === "panoramic" ? "21 / 9" : "16 / 9",
                rowIndex,
            });
            i += 1;
            rowIndex += 1;
            continue;
        }

        if (current.orientation === "panoramic") {
            result.push({
                ...current,
                colSpan: 12,
                aspectCss: "21 / 9",
                rowIndex,
            });
            i += 1;
            rowIndex += 1;
            continue;
        }

        const next = combined[i + 1];

        // Pair a landscape + portrait as 8 + 4 (or 4 + 8 alternating by rowIndex)
        if (
            (current.orientation === "landscape" && next.orientation === "portrait") ||
            (current.orientation === "portrait" && next.orientation === "landscape")
        ) {
            const landscapeFirst = rowIndex % 2 === 0;
            const firstIsLandscape = current.orientation === "landscape";
            const orderedPair =
                landscapeFirst === firstIsLandscape ? [current, next] : [next, current];

            result.push({
                ...orderedPair[0],
                colSpan: orderedPair[0].orientation === "landscape" ? 8 : 4,
                aspectCss: orderedPair[0].orientation === "landscape" ? "16 / 10" : "4 / 5",
                rowIndex,
            });
            result.push({
                ...orderedPair[1],
                colSpan: orderedPair[1].orientation === "landscape" ? 8 : 4,
                aspectCss: orderedPair[1].orientation === "landscape" ? "16 / 10" : "4 / 5",
                rowIndex,
            });
            i += 2;
            rowIndex += 1;
            continue;
        }

        // If we have at least 3 items and they are square or portrait, pack a 3-up row (4 + 4 + 4)
        if (
            remaining >= 3 &&
            (current.orientation === "square" ||
                current.orientation === "portrait" ||
                rowIndex % 3 === 2)
        ) {
            const third = combined[i + 2];
            const trio = [current, next, third];
            const allPortrait = trio.every((it) => it.orientation === "portrait");
            const allLandscape = trio.every((it) => it.orientation === "landscape");
            const aspectCss = allPortrait ? "3 / 4" : allLandscape ? "16 / 9" : "1 / 1";

            for (const item of trio) {
                result.push({
                    ...item,
                    colSpan: 4,
                    aspectCss,
                    rowIndex,
                });
            }
            i += 3;
            rowIndex += 1;
            continue;
        }

        // Default 2-up balanced row (6 + 6 or alternating 7 + 5)
        const useAsymmetric = rowIndex % 2 === 1 && current.orientation !== next.orientation;
        const firstSpan = useAsymmetric ? 7 : 6;
        const secondSpan = 12 - firstSpan;

        result.push({
            ...current,
            colSpan: firstSpan,
            aspectCss: current.orientation === "portrait" ? "4 / 5" : "16 / 9",
            rowIndex,
        });
        result.push({
            ...next,
            colSpan: secondSpan,
            aspectCss: next.orientation === "portrait" ? "4 / 5" : "16 / 9",
            rowIndex,
        });
        i += 2;
        rowIndex += 1;
    }

    return result;
}

/**
 * Interleaves items of different orientations so landscape and portrait images
 * naturally pair up and squares form clean trios.
 * @param {Array<any>} items
 */
function interleaveByOrientation(items) {
    if (items.length <= 2) return items;

    const panoramic = items.filter((it) => it.orientation === "panoramic");
    const landscape = items.filter((it) => it.orientation === "landscape");
    const portrait = items.filter((it) => it.orientation === "portrait");
    const square = items.filter((it) => it.orientation === "square");

    const output = [];
    let lIdx = 0;
    let pIdx = 0;
    let sIdx = 0;
    let panIdx = 0;

    while (
        lIdx < landscape.length ||
        pIdx < portrait.length ||
        sIdx < square.length ||
        panIdx < panoramic.length
    ) {
        // Pair landscape + portrait whenever both are available
        if (lIdx < landscape.length && pIdx < portrait.length) {
            output.push(landscape[lIdx++], portrait[pIdx++]);
        } else if (lIdx + 1 < landscape.length) {
            output.push(landscape[lIdx++], landscape[lIdx++]);
        } else if (lIdx < landscape.length) {
            output.push(landscape[lIdx++]);
        }

        // Insert a trio of squares or remaining portraits
        if (sIdx + 2 < square.length) {
            output.push(square[sIdx++], square[sIdx++], square[sIdx++]);
        } else if (sIdx < square.length) {
            output.push(square[sIdx++]);
        }

        if (pIdx < portrait.length && lIdx >= landscape.length) {
            output.push(portrait[pIdx++]);
        }

        // Insert panoramic full-width feature periodically
        if (panIdx < panoramic.length) {
            output.push(panoramic[panIdx++]);
        }
    }

    return output;
}

/**
 * Finalized 46-image curated 3D gallery archive.
 */
export const GALLERY_ITEMS = [
    { id: "render-01", title: "3D Visualization Study 01", src: "/assets/aistudio/1_05be8140.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-02", title: "3D Visualization Study 02", src: "/assets/aistudio/2_5abf9801.webp", width: 3840, height: 5120, isUploaded: true },
    { id: "render-03", title: "3D Visualization Study 03", src: "/assets/aistudio/3webp_a1801f38.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-04", title: "3D Visualization Study 04", src: "/assets/aistudio/4webp_8c05c7d2.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-05", title: "3D Visualization Study 05", src: "/assets/aistudio/5webp_25233b4e.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-06", title: "3D Visualization Study 06", src: "/assets/aistudio/6webp_76a363fc.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-07", title: "3D Visualization Study 07", src: "/assets/aistudio/7webp_dda66856.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-08", title: "3D Visualization Study 08", src: "/assets/aistudio/8webp_fb212ae1.webp", width: 1920, height: 599, isUploaded: true },
    { id: "render-09", title: "3D Visualization Study 09", src: "/assets/aistudio/9webp_0e1e50a0.webp", width: 4320, height: 5400, isUploaded: true },
    { id: "render-10", title: "3D Visualization Study 10", src: "/assets/aistudio/10webp_4a07b047.webp", width: 4320, height: 4320, isUploaded: true },
    { id: "render-11", title: "3D Visualization Study 11", src: "/assets/aistudio/11webp_a1339573.webp", width: 4320, height: 5400, isUploaded: true },
    { id: "render-12", title: "3D Visualization Study 12", src: "/assets/aistudio/12webp_d1fc37a5.webp", width: 1080, height: 1080, isUploaded: true },
    { id: "render-13", title: "3D Visualization Study 13", src: "/assets/aistudio/13webp_5696333d.webp", width: 1080, height: 1080, isUploaded: true },
    { id: "render-14", title: "3D Visualization Study 14", src: "/assets/aistudio/14webp_a4b0c5e7.webp", width: 1080, height: 1350, isUploaded: true },
    { id: "render-15", title: "3D Visualization Study 15", src: "/assets/aistudio/15webp_ae9cd388.webp", width: 1080, height: 1920, isUploaded: true },
    { id: "render-16", title: "3D Visualization Study 16", src: "/assets/aistudio/16webp_095787df.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-17", title: "3D Visualization Study 17", src: "/assets/aistudio/17webp_5e3e3445.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-18", title: "3D Visualization Study 18", src: "/assets/aistudio/18webp_db43f5bc.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-19", title: "3D Visualization Study 19", src: "/assets/aistudio/19webp_043eb7bd.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-20", title: "3D Visualization Study 20", src: "/assets/aistudio/20webp_ed7aa3cf.webp", width: 7680, height: 4320, isUploaded: true },
    { id: "render-21", title: "3D Visualization Study 21", src: "/assets/aistudio/21webp_55c905a7.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-22", title: "3D Visualization Study 22", src: "/assets/aistudio/22webp_67e83872.webp", width: 3840, height: 2160, isUploaded: true },
    { id: "render-23", title: "3D Visualization Study 23", src: "/assets/aistudio/23webp_a2abdafe.webp", width: 1080, height: 1450, isUploaded: true },
    { id: "render-24", title: "3D Visualization Study 24", src: "/assets/aistudio/24webp_47964294.webp", width: 3840, height: 2160, isUploaded: true },
    { id: "render-25", title: "3D Visualization Study 25", src: "/assets/aistudio/25webp_458ba514.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-26", title: "3D Visualization Study 26", src: "/assets/aistudio/26webp_aec6ece2.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-27", title: "3D Visualization Study 27", src: "/assets/aistudio/27webp_3b1d5d3e.webp", width: 1200, height: 675, isUploaded: true },
    { id: "render-28", title: "3D Visualization Study 28", src: "/assets/aistudio/28webp_1afcb458.webp", width: 1200, height: 675, isUploaded: true },
    { id: "render-29", title: "3D Visualization Study 29", src: "/assets/aistudio/29webp_8c06628b.webp", width: 1200, height: 675, isUploaded: true },
    { id: "render-30", title: "3D Visualization Study 30", src: "/assets/aistudio/30webp_b049ef28.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-31", title: "3D Visualization Study 31", src: "/assets/aistudio/31webp_45b7d9fa.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-32", title: "3D Visualization Study 32", src: "/assets/aistudio/32webp_89776b3a.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-33", title: "3D Visualization Study 33", src: "/assets/aistudio/33webp_50245d6d.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-34", title: "3D Visualization Study 34", src: "/assets/aistudio/34webp_6d3ecb52.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-35", title: "3D Visualization Study 35", src: "/assets/aistudio/35webp_6217fa1e.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-36", title: "3D Visualization Study 36", src: "/assets/aistudio/36webp_50f4d99b.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-37", title: "3D Visualization Study 37", src: "/assets/aistudio/37webp_e75811f8.webp", width: 2560, height: 1440, isUploaded: true },
    { id: "render-38", title: "3D Visualization Study 38", src: "/assets/aistudio/38webp_b165a030.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-39", title: "3D Visualization Study 39", src: "/assets/aistudio/39webp_9f8371ea.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-40", title: "3D Visualization Study 40", src: "/assets/aistudio/40webp_9500335d.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-41", title: "3D Visualization Study 41", src: "/assets/aistudio/41webp_bfed7000.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-42", title: "3D Visualization Study 42", src: "/assets/aistudio/42webp_a9655e9a.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-43", title: "3D Visualization Study 43", src: "/assets/aistudio/43webp_7e4d4ad2.webp", width: 1080, height: 640, isUploaded: true },
    { id: "render-44", title: "3D Visualization Study 44", src: "/assets/aistudio/44webp_9f74669b.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-45", title: "3D Visualization Study 45", src: "/assets/aistudio/45webp_8fdc8ffa.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "render-46", title: "3D Visualization Study 46", src: "/assets/aistudio/46webp_4f4e3bfa.webp", width: 1080, height: 1440, isUploaded: true },
];

/**
 * 28-plate spatial archive (56webp through 83webp) for
 * Chapter 01 · Dorsa Design Studio — Adaptive Reuse & Brand Architecture.
 */
export const INTERIOR_ITEMS = [
    { id: "dorsa-56", fileNum: 56, fileName: "56webp.webp", plateLabel: "Plate 01", title: "The Challenge & Existing Site Context", src: "/assets/aistudio/56webp_eea885b9.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-57", fileNum: 57, fileName: "57webp.webp", plateLabel: "Plate 02", title: "Concept: The Weaver's Arch & Material Swatches", src: "/assets/aistudio/57webp_76238fb2.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-58", fileNum: 58, fileName: "58webp.webp", plateLabel: "Plate 03", title: "Spatial Configuration & Zoning Plan", src: "/assets/aistudio/58webp_01ce38a5.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-59", fileNum: 59, fileName: "59webp.webp", plateLabel: "Plate 04", title: "Master Plan & 3D Axonometric Cutaway", src: "/assets/aistudio/59webp_4f605426.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-60", fileNum: 60, fileName: "60webp.webp", plateLabel: "Plate 05", title: "Zone Key: Manager's Office", src: "/assets/aistudio/60webp_3f38c0b5.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-61", fileNum: 61, fileName: "61webp.webp", plateLabel: "Plate 06", title: "Manager's Office — Wide Perspective", src: "/assets/aistudio/61webp_4ad89aa8.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-62", fileNum: 62, fileName: "62webp.webp", plateLabel: "Plate 07", title: "Manager's Office — Bespoke Oak Shelving", src: "/assets/aistudio/62webp_4fa5e169.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-63", fileNum: 63, fileName: "63webp.webp", plateLabel: "Plate 08", title: "Manager's Office — Executive Desk & Linear LED Cove", src: "/assets/aistudio/63webp_cb0b9ea4.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-64", fileNum: 64, fileName: "64webp.webp", plateLabel: "Plate 09", title: "Manager's Office — Lounge & Daylight Aperture", src: "/assets/aistudio/64webp_bfa26b31.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-65", fileNum: 65, fileName: "65webp.webp", plateLabel: "Plate 10", title: "Manager's Office — Oak Joinery & Shadow Play", src: "/assets/aistudio/65webp_b2b864ae.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-66", fileNum: 66, fileName: "66webp.webp", plateLabel: "Plate 11", title: "Zone Key: Main Conference Room (8-Pax)", src: "/assets/aistudio/66webp_692ed8fd.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-67", fileNum: 67, fileName: "67webp.webp", plateLabel: "Plate 12", title: "Restroom & Custom Timber-Inlaid Door Detail", src: "/assets/aistudio/67webp_08489d15.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-68", fileNum: 68, fileName: "68webp.webp", plateLabel: "Plate 13", title: "Zone Key: Marketing & Strategy Room", src: "/assets/aistudio/68webp_60434d91.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-69", fileNum: 69, fileName: "69webp.webp", plateLabel: "Plate 14", title: "Zone Key: Breakout Area", src: "/assets/aistudio/69webp_2cba4814.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-70", fileNum: 70, fileName: "70webp.webp", plateLabel: "Plate 15", title: "Main Conference Room — Timber Table & Micro-Cement Floor", src: "/assets/aistudio/70webp_2d8137a9.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-71", fileNum: 71, fileName: "71webp.webp", plateLabel: "Plate 16", title: "Main Conference Room — Presentation & AV Integration", src: "/assets/aistudio/71webp_ec2bb68e.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-72", fileNum: 72, fileName: "72webp.webp", plateLabel: "Plate 17", title: "Zone Key: Open Design Studio", src: "/assets/aistudio/72webp_35827049.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-73", fileNum: 73, fileName: "73webp.webp", plateLabel: "Plate 18", title: "Main Conference Room — Natural Daylight Glazing", src: "/assets/aistudio/73webp_f8c915bb.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-74", fileNum: 74, fileName: "74webp.webp", plateLabel: "Plate 19", title: "Suspended Collaborative Desk — 2m CAD & Render Study", src: "/assets/aistudio/74webp_890aeea1.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-75", fileNum: 75, fileName: "75webp.webp", plateLabel: "Plate 20", title: "Marketing & Strategy Room — Collaborative Workstations I", src: "/assets/aistudio/75webp_a34ad145.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-76", fileNum: 76, fileName: "76webp.webp", plateLabel: "Plate 21", title: "Marketing & Strategy Room — Collaborative Workstations II", src: "/assets/aistudio/76webp_5f4f14e0.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-77", fileNum: 77, fileName: "77webp.webp", plateLabel: "Plate 22", title: "Modular Chrome & Glass Display Shelving Detail", src: "/assets/aistudio/77webp_aed30717.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-78", fileNum: 78, fileName: "78webp.webp", plateLabel: "Plate 23", title: "Breakout Area — Sculptural Lounge & Dining Table", src: "/assets/aistudio/78webp_e63181d6.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-79", fileNum: 79, fileName: "79webp.webp", plateLabel: "Plate 24", title: "Breakout Area — Daylight & Material Library Vitrine", src: "/assets/aistudio/79webp_7116d5f9.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-80", fileNum: 80, fileName: "80webp.webp", plateLabel: "Plate 25", title: "Open Design Studio — Suspended Table & Material Rack", src: "/assets/aistudio/80webp_ce3085d8.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-81", fileNum: 81, fileName: "81webp.webp", plateLabel: "Plate 26", title: "The Weaver's Arch — 2.87m Wireframe Pod CAD & Render", src: "/assets/aistudio/81webp_5269d951.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-82", fileNum: 82, fileName: "82webp.webp", plateLabel: "Plate 27", title: "Open Design Studio — Collaborative Lounge & Pin-Up Wall", src: "/assets/aistudio/82webp_b50f1441.webp", width: 1920, height: 1080, isUploaded: true },
    { id: "dorsa-83", fileNum: 83, fileName: "83webp.webp", plateLabel: "Plate 28", title: "Dorsa Design Studio — Architectural Presentation Board", src: "/assets/aistudio/83webp_113f9860.webp", width: 1920, height: 1080, isUploaded: true },
];



