import test from "node:test";
import assert from "node:assert/strict";
import {
  MENU_ITEMS,
  SOCIAL_ITEMS,
  AWARDS_DATA,
  PROJECT_DETAILS,
  getProjectById,
} from "../script.js";

test("StaggeredMenu configuration includes 5 numbered items and 3 social items", () => {
  assert.equal(MENU_ITEMS.length, 5);
  assert.deepEqual(
    MENU_ITEMS.map((item) => item.number),
    ["01", "02", "03", "04", "05"]
  );
  assert.deepEqual(
    MENU_ITEMS.map((item) => item.label),
    ["Home", "About", "Services", "Projects", "Awards"]
  );
  const aboutItem = MENU_ITEMS.find((item) => item.id === "about");
  assert.equal(aboutItem?.link, "./about.html");
  const projectsItem = MENU_ITEMS.find((item) => item.id === "projects");
  assert.equal(projectsItem?.link, "./projects.html");
  assert.equal(SOCIAL_ITEMS.length, 3);
  assert.deepEqual(
    SOCIAL_ITEMS.map((s) => s.label),
    ["LinkedIn", "Instagram", "Behance"]
  );
});

test("AWARDS_DATA contains the exact 5 requested awards", () => {
  assert.equal(AWARDS_DATA.length, 5);
  assert.deepEqual(
    AWARDS_DATA.map((a) => ({
      title: a.title,
      organization: a.organization,
      category: a.category,
      year: a.year,
      honor: a.honor,
    })),
    [
      {
        title: "AGRI vision, first version",
        organization: "IDA Competition",
        category: "Agricultural Tools",
        year: "2025",
        honor: "Bronze",
      },
      {
        title: "Elephant",
        organization: "Kioskedia International Awards",
        category: "Product",
        year: "2025",
        honor: "Honorable Mention",
      },
      {
        title: "Lunight",
        organization: "D'Light Lighting Design Awards",
        category: "Lighting Design",
        year: "2026",
        honor: "Bronze",
      },
      {
        title: "Yalda Pack",
        organization: "IAUCTB Internal Competition",
        category: "Packaging & Product",
        year: "2025",
        honor: "First Place",
      },
      {
        title: "Axis",
        organization: "IDA Competition",
        category: "Product Design",
        year: "2025",
        honor: "Bronze",
      },
    ]
  );
});

test("project registry maps all portfolio projects to English titles and render assets", () => {
  assert.equal(
    getProjectById("agri").image,
    "/assets/aistudio/Untitled1_da706d99.jpg"
  );
  assert.equal(
    getProjectById("agri").model3d,
    "/assets/podanddrone.glb"
  );
  assert.equal(
    getProjectById("agri").aerialUnitFrontView,
    "/assets/aistudio/Untitled2_78bbfd05.webp"
  );
  assert.equal(
    getProjectById("agri").aerialUnitBackView,
    "/assets/aistudio/Untitled3_2bbc8a67.webp"
  );
  assert.equal(
    getProjectById("agri").groundStationView,
    "/assets/aistudio/Untitled11_eb6b18ee.webp"
  );
  assert.equal(getProjectById("agri").title, "AGRIVISION");
  assert.equal(getProjectById("agri").link, "./agrivision.html");

  const expectedIds = ["agri", "wheelchair", "rfid", "survival"];
  for (const id of expectedIds) {
    const project = getProjectById(id);
    assert.equal(project.id, id);
    assert.ok(PROJECT_DETAILS[id].title.length > 0);
    assert.ok(project.image.startsWith("/"));
  }
});
