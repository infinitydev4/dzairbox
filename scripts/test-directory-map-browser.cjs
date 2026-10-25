// Real Maps UI against the local app. Read-only: no accounts, emails or uploads.
const assert = require("node:assert/strict");
const path = require("node:path"),
  os = require("node:os");
let playwright;
try {
  playwright = require("playwright");
} catch {
  playwright = require(
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    ),
  );
}
const base = "http://localhost:3000";
const errors = [],
  passed = [];
let browser;
async function waitForPins(page) {
  await page
    .locator('.directory-map[data-tiles-loaded="true"]')
    .waitFor({ timeout: 25000 });
  await page.locator(".directory-pin").first().waitFor({ timeout: 25000 });
}
async function noOverflow(page) {
  assert(
    await page
      .locator(".directory-root")
      .evaluate((el) => el.scrollWidth <= innerWidth),
    "Horizontal overflow",
  );
}
(async () => {
  try {
    browser = await playwright.chromium.launch({
      headless: true,
      channel: "chrome",
    });
    const desktop = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await desktop.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    const data = await (
      await desktop.request.get(base + "/api/directory?view=map")
    ).json();
    assert(
      data.markers.length > 0,
      "Use a local dataset with at least one located public activity",
    );
    await page.goto(base + "/businesses?view=map");
    await page.waitForLoadState("networkidle");
    await waitForPins(page);
    const box = await page.locator(".directory-map-side").boundingBox();
    assert(box.height > 600);
    assert(Math.abs(box.y + box.height - 980) < 3);
    await noOverflow(page);
    const list = page.locator(".directory-list-panel");
    await list.evaluate((el) => {
      el.scrollTop = 250;
    });
    assert.deepEqual(
      await page.locator(".directory-map-side").boundingBox(),
      box,
    );
    passed.push(
      "Ordinateur : carte sur toute la hauteur disponible, liste indépendante",
    );
    await page.locator(".directory-map-canvas").evaluate((el) => {
      el.dataset.probe = "persistent";
    });
    const single = page.locator(".directory-pin:not(.is-cluster)").first();
    await single.focus();
    await single.press("Enter");
    await page.locator(".directory-map-card").waitFor();
    assert.equal(
      await page.locator(".directory-map-canvas").getAttribute("data-probe"),
      "persistent",
    );
    passed.push(
      "Repères réels, sélection au clavier, fiche de contact et synchronisation sans remonter la carte",
    );
    await page.screenshot({
      path: "/tmp/dzairbox-map-desktop-final.png",
      fullPage: true,
    });
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await mobile.addInitScript(() => {
      window.__geoCalls = 0;
      navigator.geolocation.getCurrentPosition = (_ok, failed) => {
        window.__geoCalls++;
        failed?.({ code: 1, message: "denied" });
      };
    });
    const mp = await mobile.newPage();
    mp.on("pageerror", (error) => errors.push(error.message));
    await mp.goto(base + "/businesses?view=map");
    await mp.waitForLoadState("networkidle");
    await waitForPins(mp);
    assert.equal(await mp.evaluate(() => window.__geoCalls), 0);
    const mobileBox = await mp.locator(".directory-map-side").boundingBox();
    assert.equal(mobileBox.x, 0);
    assert.equal(mobileBox.y, 0);
    assert.equal(mobileBox.width, 390);
    assert.equal(mobileBox.height, 844);
    assert.equal(await mp.locator(".directory-list-panel").isVisible(), false);
    await noOverflow(mp);
    await mp.screenshot({
      path: "/tmp/dzairbox-map-mobile-final.png",
      fullPage: true,
    });
    passed.push(
      "Mobile : carte plein écran 390 px, aucun débordement ni demande automatique de position",
    );
    await mp.getByRole("button", { name: "Filtres", exact: true }).click();
    const dialog = mp.getByRole("dialog");
    await dialog.waitFor();
    await dialog
      .getByRole("button", { name: "Autour de moi", exact: true })
      .click();
    assert.equal(await mp.evaluate(() => window.__geoCalls), 1);
    await mp.keyboard.press("Escape");
    assert.equal(await dialog.isVisible(), false);
    assert.equal(
      await mp
        .locator(".directory-map-filter-toggle")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    passed.push(
      "Filtres accessibles, fermeture Échap et géolocalisation uniquement sur action",
    );
    // Same coordinates remain grouped, and every member stays selectable.
    const groupPin = mp.locator(".directory-pin.is-cluster").first();
    if (await groupPin.count()) {
      await groupPin.click();
      await mp.waitForTimeout(450);
      const samePlace = mp.locator(".directory-pin.is-cluster").first();
      if (await samePlace.count()) {
        await samePlace.click();
        await mp.waitForTimeout(450);
      }
    }
    const pin = mp.locator(".directory-pin:not(.is-cluster)").first();
    if (await pin.count()) {
      await pin.click();
      await mp.locator(".directory-map-card").waitFor();
      const cardBox = await mp.locator(".directory-map-card").boundingBox();
      assert(cardBox.x >= 0 && cardBox.x + cardBox.width <= 391);
      await mp.screenshot({
        path: "/tmp/dzairbox-map-mobile-card-final.png",
        fullPage: true,
      });
    }
    await mp.locator(".directory-map-back").click();
    await mp.waitForURL((url) => url.searchParams.get("view") === "list");
    await mp.locator(".directory-heading").waitFor({ state: "visible" });
    assert.notEqual(
      await mp.locator("body").evaluate((el) => el.style.overflow),
      "hidden",
    );
    passed.push("Retour à la liste : défilement et navigation restaurés");
    await mp.getByRole("button", { name: "Carte", exact: true }).click();
    await mp.waitForURL((url) => url.searchParams.get("view") === "map");
    await waitForPins(mp);
    await mp.setViewportSize({ width: 320, height: 740 });
    await noOverflow(mp);
    const small = await mp.locator(".directory-map-side").boundingBox();
    assert.equal(small.height, 740);
    await mp.screenshot({
      path: "/tmp/dzairbox-map-320-final.png",
      fullPage: true,
    });
    passed.push("Mode carte réversible et responsive à 320 px");
    await mp.locator(".directory-map-back").click();
    await mp.waitForURL((url) => url.searchParams.get("view") === "list");
    await mp.getByRole("button", { name: "ع", exact: true }).click();
    await mp.getByRole("button", { name: "خريطة", exact: true }).click();
    await mp.waitForURL((url) => url.searchParams.get("view") === "map");
    await waitForPins(mp);
    assert.equal(
      await mp.locator(".directory-root").getAttribute("dir"),
      "rtl",
    );
    await noOverflow(mp);
    await mp.screenshot({
      path: "/tmp/dzairbox-map-ar-final.png",
      fullPage: true,
    });
    passed.push("Arabe RTL : contrôles et vue plein écran sans débordement");
    const duplicate = data.markers.find((entry) =>
      data.markers.some(
        (other) =>
          other.id !== entry.id &&
          other.address === entry.address &&
          other.lat === entry.lat &&
          other.lng === entry.lng,
      ),
    );
    if (duplicate) {
      const clusterPage = await mobile.newPage();
      clusterPage.on("pageerror", (error) => errors.push(error.message));
      await clusterPage.goto(
        base +
          "/businesses?view=map&q=" +
          encodeURIComponent(duplicate.address),
      );
      await clusterPage.waitForLoadState("networkidle");
      await waitForPins(clusterPage);
      await clusterPage.locator(".directory-pin.is-cluster").first().click();
      const group = clusterPage.locator(".directory-map-group");
      await group.waitFor();
      assert((await group.locator("div > button").count()) >= 2);
      await group.locator("div > button").first().click();
      await clusterPage.locator(".directory-map-card").waitFor();
      assert.equal(await group.isVisible(), false);
      passed.push(
        "Repères au même endroit : tous les professionnels restent sélectionnables",
      );
      await clusterPage.close();
    }
    const broken = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    await broken.route("**/maps.googleapis.com/maps/api/js*", (route) =>
      route.abort(),
    );
    const bp = await broken.newPage();
    bp.on("pageerror", (error) => errors.push(error.message));
    await bp.goto(base + "/businesses?view=map");
    await bp.locator(".directory-map-error").waitFor({ timeout: 25000 });
    await bp
      .getByRole("button", { name: "Voir la liste", exact: false })
      .last()
      .click();
    await bp.waitForURL((url) => url.searchParams.get("view") === "list");
    await bp.locator(".directory-list-panel").waitFor({ state: "visible" });
    passed.push("Échec Google Maps : message de reprise et liste accessible");
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed, errors }, null, 2));
  } catch (error) {
    if (browser)
      for (const context of browser.contexts())
        for (const page of context.pages()) {
          console.log(
            "At",
            page.url(),
            (await page.locator("body").innerText()).slice(0, 2000),
          );
          await page
            .screenshot({
              path: "/tmp/dzairbox-map-failure.png",
              fullPage: true,
            })
            .catch(() => {});
        }
    throw error;
  } finally {
    await browser?.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
