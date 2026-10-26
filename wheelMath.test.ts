import test from "node:test";
import assert from "node:assert/strict";
import {
    wrapIndex,
    getShortestCircularDelta,
    computeWheelSlotMetrics,
    buildWheelVirtualSlots,
    computeWheelTargetFromDelta,
} from "./wheelMath.js";

test("wrapIndex wraps positive and negative indices into [0, count - 1]", () => {
    assert.equal(wrapIndex(0, 9), 0);
    assert.equal(wrapIndex(9, 9), 0);
    assert.equal(wrapIndex(10, 9), 1);
    assert.equal(wrapIndex(-1, 9), 8);
    assert.equal(wrapIndex(-9, 9), 0);
    assert.equal(wrapIndex(-10, 9), 8);
});

test("computeWheelSlotMetrics matches carterogunsola.com/lab radial arc geometry", () => {
    const center = computeWheelSlotMetrics(0);
    assert.equal(center.isActive, true);
    assert.equal(Math.round(center.x * 100) / 100, 82.63);
    assert.equal(center.y, 414.5);
    assert.equal(center.angleDeg, 0);
    assert.equal(center.scale, 1);
    assert.equal(center.opacity, 1);

    const slotMinus1 = computeWheelSlotMetrics(-1);
    assert.equal(slotMinus1.isActive, false);
    assert.ok(Math.abs(slotMinus1.x - 78.901) < 0.05);
    assert.ok(Math.abs(slotMinus1.y - 343.631) < 0.05);
    assert.ok(Math.abs(slotMinus1.angleDeg - -6.02667) < 0.001);
    assert.ok(Math.abs(slotMinus1.scale - 0.9883) < 0.001);

    const slotPlus1 = computeWheelSlotMetrics(1);
    assert.equal(slotPlus1.isActive, false);
    assert.ok(Math.abs(slotPlus1.x - 78.901) < 0.05);
    assert.ok(Math.abs(slotPlus1.y - 485.369) < 0.05);
    assert.ok(Math.abs(slotPlus1.angleDeg - 6.02667) < 0.001);
});

test("buildWheelVirtualSlots maintains continuity across half-integer boundaries", () => {
    const beforeBoundary = buildWheelVirtualSlots(0.499, 9, 7);
    const afterBoundary = buildWheelVirtualSlots(0.501, 9, 7);

    // Item 1 should be at almost the exact same d (+0.501 vs +0.499)
    const item1Before = beforeBoundary.find((s) => s.slotOffset === 1);
    const item1After = afterBoundary.find((s) => s.slotOffset === 0);

    assert.equal(item1Before?.itemIndex, 1);
    assert.equal(item1After?.itemIndex, 1);
    assert.ok(Math.abs((item1Before?.y ?? 0) - (item1After?.y ?? 0)) < 0.5);
});

test("getShortestCircularDelta finds shortest direction around the wheel", () => {
    assert.equal(getShortestCircularDelta(0, 2, 9), 2);
    assert.equal(getShortestCircularDelta(0, 8, 9), -1);
    assert.equal(getShortestCircularDelta(8, 0, 9), 1);
});

test("computeWheelTargetFromDelta advances past snap threshold on single wheel notch", () => {
    const nextTarget = computeWheelTargetFromDelta(0, 100);
    assert.equal(Math.round(nextTarget), 1);
    const multiTarget = computeWheelTargetFromDelta(0, 350);
    assert.equal(Math.round(multiTarget), 3);
});

test("AWARDS_DATA contains all 5 awards with updated images and external competition links", async () => {
    const { AWARDS_DATA } = await import("./script.js");
    assert.equal(AWARDS_DATA.length, 5);

    const agri = AWARDS_DATA.find((a) => a.id === "ida-agrivision-v1");
    assert.equal(agri?.image, "/assets/aistudio/Untitled26_6fe4bbd9.webp");
    assert.equal(agri?.externalUrl, "https://www.idesignawards.com/social/zoom.php?eid=9-65192-25");

    const elephant = AWARDS_DATA.find((a) => a.id === "kioskedia-elephant");
    assert.equal(elephant?.image, "/assets/aistudio/Untitled25_c2560062.webp");
    assert.equal(elephant?.externalUrl, "https://award.kioskedia.com/winner/2597");

    const lunight = AWARDS_DATA.find((a) => a.id === "dlight-lunight");
    assert.equal(lunight?.image, "/assets/aistudio/Untitled24_a790fbb6.webp");
    assert.equal(lunight?.externalUrl, "https://dlightaward.com/winners/?dwp_winner=4983");

    const yalda = AWARDS_DATA.find((a) => a.id === "iauctb-yalda-pack");
    assert.equal(yalda?.image, "/assets/aistudio/Untitled28_45993003.webp");
    assert.equal(yalda?.externalUrl, "");

    const axis = AWARDS_DATA.find((a) => a.id === "ida-axis");
    assert.equal(axis?.image, "/assets/aistudio/Untitled27.webp");
    assert.equal(axis?.externalUrl, "https://www.idesignawards.com/social/zoom.php?eid=9-65067-25");
});

test("PROJECT_DETAILS reflects updated project titles, categories, and links", async () => {
    const { PROJECT_DETAILS } = await import("./script.js");
    assert.equal(PROJECT_DETAILS.agri.category, "autonomous field surveying");
    assert.equal(PROJECT_DETAILS.agri.title, "AGRIVISION");
    assert.equal(PROJECT_DETAILS.elephant.category, "EV charging station");
    assert.equal(PROJECT_DETAILS.elephant.title, "Elephant");
    assert.equal(PROJECT_DETAILS.elephant.link, "./elephant.html");
    assert.equal(PROJECT_DETAILS.sarv.category, "Lighting Product");
    assert.equal(PROJECT_DETAILS.sarv.title, "Sarv");
    assert.equal(PROJECT_DETAILS.sarv.link, "./sarv.html");
    assert.equal(PROJECT_DETAILS.gallery.title, "General 3D gallery");
    assert.equal(PROJECT_DETAILS.gallery.link, "./gallery.html");
    assert.equal(PROJECT_DETAILS.interior.title, "Interior design");
    assert.equal(PROJECT_DETAILS.interior.link, "./interior.html");
    assert.equal(PROJECT_DETAILS.interior.image, "/assets/aistudio/61webp_4ad89aa8.webp");
});

test("galleryLayout classifies aspect ratios and packs rows to 12 columns", async () => {
    const { classifyAspectRatio, autoSortGalleryItems } = await import("./galleryLayout.js");
    assert.equal(classifyAspectRatio(2100, 900), "panoramic");
    assert.equal(classifyAspectRatio(1600, 1000), "landscape");
    assert.equal(classifyAspectRatio(1200, 1200), "square");
    assert.equal(classifyAspectRatio(900, 1200), "portrait");

    const sampleItems = [
        { id: "p1", width: 1600, height: 1000, isUploaded: false },
        { id: "u1", width: 900, height: 1200, isUploaded: true, title: "Portrait Render" },
        { id: "u2", width: 1920, height: 1080, isUploaded: true, title: "Landscape Render" },
        { id: "u3", width: 2400, height: 900, isUploaded: true, title: "Panorama Render" },
    ];

    const sorted = autoSortGalleryItems(sampleItems);
    assert.equal(sorted.length, 4);
    // Uploaded items should be sorted ahead of non-uploaded placeholders
    assert.equal(sorted[0].isUploaded, true);
    assert.equal(sorted[1].isUploaded, true);
    assert.equal(sorted[2].isUploaded, true);
    assert.equal(sorted[3].isUploaded, false);

    // Every row in sorted should sum to 12 columns
    const rowSums = new Map();
    for (const item of sorted) {
        rowSums.set(item.rowIndex, (rowSums.get(item.rowIndex) || 0) + item.colSpan);
    }
    for (const [, sum] of rowSums) {
        assert.equal(sum, 12);
    }
});

test("GALLERY_ITEMS contains all 46 finalized renders and packs every row to 12 columns", async () => {
    const { GALLERY_ITEMS, autoSortGalleryItems } = await import("./galleryLayout.js");
    assert.equal(GALLERY_ITEMS.length, 46);
    for (const item of GALLERY_ITEMS) {
        assert.equal(item.isUploaded, true);
        assert.ok(item.src.startsWith("/assets/aistudio/"));
        assert.ok(item.width > 0 && item.height > 0);
    }

    const sorted = autoSortGalleryItems(GALLERY_ITEMS);
    assert.equal(sorted.length, 46);
    const rowSums = new Map();
    for (const item of sorted) {
        rowSums.set(item.rowIndex, (rowSums.get(item.rowIndex) || 0) + item.colSpan);
    }
    for (const [, sum] of rowSums) {
        assert.equal(sum, 12);
    }
});

test("INTERIOR_ITEMS contains all 28 Dorsa Design Studio plates (56webp to 83webp) with uploaded assets", async () => {
    const { INTERIOR_ITEMS, autoSortGalleryItems } = await import("./galleryLayout.js");
    assert.equal(INTERIOR_ITEMS.length, 28);
    assert.equal(INTERIOR_ITEMS[0].src, "/assets/aistudio/56webp_eea885b9.webp");
    assert.equal(INTERIOR_ITEMS[0].plateLabel, "Plate 01");
    assert.equal(INTERIOR_ITEMS[27].src, "/assets/aistudio/83webp_113f9860.webp");
    assert.equal(INTERIOR_ITEMS[27].plateLabel, "Plate 28");

    for (const item of INTERIOR_ITEMS) {
        assert.equal(item.isUploaded, true);
        assert.ok(item.src.startsWith("/assets/aistudio/"));
    }

    const sorted = autoSortGalleryItems(INTERIOR_ITEMS);
    assert.equal(sorted.length, 28);
    const rowSums = new Map();
    for (const item of sorted) {
        rowSums.set(item.rowIndex, (rowSums.get(item.rowIndex) || 0) + item.colSpan);
    }
    for (const [, sum] of rowSums) {
        assert.equal(sum, 12);
    }
});

test("SERVICES_ITEMS contains all 4 design & visualization services with contextual portfolio renders", async () => {
    const { SERVICES_ITEMS, STUDIO_SECTIONS } = await import("./script.js");
    assert.equal(SERVICES_ITEMS.length, 4);
    assert.equal(SERVICES_ITEMS[0].title, "01 / Industrial & Hardware Design");
    assert.equal(SERVICES_ITEMS[1].title, "02 / Spatial Architecture & Custom Millwork");
    assert.equal(SERVICES_ITEMS[2].title, "03 / 3D Visualization & CGI");
    assert.equal(SERVICES_ITEMS[3].title, "04 / Concept Design & Worldbuilding");

    for (const service of SERVICES_ITEMS) {
        assert.ok(service.image.startsWith("/assets/aistudio/"));
        assert.ok(service.description.length > 80);
    }

    assert.equal(STUDIO_SECTIONS.services.items.length, 4);
});


