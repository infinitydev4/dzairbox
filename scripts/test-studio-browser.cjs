// Local, temporary fixtures; no email or S3 upload is sent. Chrome is required.
require("@next/env").loadEnvConfig(process.cwd());
const assert = require("node:assert/strict"),
  path = require("node:path"),
  os = require("node:os"),
  fs = require("node:fs"),
  crypto = require("node:crypto");
let pw;
try {
  pw = require("playwright");
} catch {
  pw = require(
    path.join(
      os.homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    ),
  );
}
const { PrismaClient } = require("@prisma/client"),
  { encode } = require("next-auth/jwt"),
  bcrypt = require("bcryptjs");
const db = new PrismaClient(),
  base = "http://localhost:3000",
  prefix = "studio-browser-" + crypto.randomUUID(),
  password = "LocalStudio123!";
const errors = [];
const passed = [];
let browser;
assert(
  ["localhost", "127.0.0.1", "::1"].includes(
    new URL(process.env.DATABASE_URL).hostname,
  ),
);
assert(process.env.NEXTAUTH_SECRET, "NEXTAUTH_SECRET is required locally");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function cookie(user) {
  return {
    name: "next-auth.session-token",
    value: await encode({
      secret: process.env.NEXTAUTH_SECRET,
      token: {
        id: user.id,
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      maxAge: 3600,
    }),
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  };
}
async function settled(page) {
  await page.waitForFunction(
    () =>
      document
        .querySelector(".st-save-status")
        ?.textContent.includes("Brouillon enregistré"),
    { timeout: 20000 },
  );
}
(async () => {
  try {
    const communes = require("../data/locations/communes.json"),
      c = communes.find((c) => c.wilaya_code === 16);
    const location = {
      mode: "establishment",
      address: "10 rue de test, Alger",
      wilayaCode: "16",
      communeCode: String(c.id),
      areas: [],
      point: null,
    };
    const user = await db.user.create({
      data: {
        name: "Amine Studio",
        email: prefix + "@example.invalid",
        password: await bcrypt.hash(password, 12),
      },
    });
    const admin = await db.user.create({
      data: {
        name: "Studio admin fixture",
        email: prefix + "-admin@example.invalid",
        password: "not-for-login",
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    const other = await db.user.create({
      data: {
        name: "Other fixture",
        email: prefix + "-other@example.invalid",
        password: "not-for-login",
        emailVerified: new Date(),
      },
    });
    const business = await db.business.create({
      data: {
        id: crypto.randomUUID(),
        name: "Atelier Test Studio",
        category: "menuisier",
        address: location.address,
        phone: "+213555123456",
        location,
        wilayaCode: "16",
        communeCode: String(c.id),
        primaryLanguage: "fr",
        subdomain: prefix,
        userId: user.id,
      },
    });
    const media = await db.businessMedia.create({
      data: {
        businessId: business.id,
        userId: user.id,
        storageUrl: "https://fixture.invalid/private.webp",
        contentType: "image/webp",
      },
    });
    browser = await pw.chromium.launch({ headless: true, channel: "chrome" });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const p = await context.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => {
      if (
        m.type() === "error" &&
        !m.text().includes("500 (Internal Server Error)") &&
        !m.text().includes("409 (Conflict)") &&
        !m.text().includes("400 (Bad Request)")
      )
        errors.push(m.text());
    });
    await context.route("**/api/events", async (route) => {
      const body = route.request().postDataJSON();
      if (!body.businessId) return route.fulfill({ status: 204 });
      return route.continue();
    });
    await context.route(`**/api/media/${media.id}`, (route) =>
      route.fulfill({
        contentType: "image/webp",
        body: fs.readFileSync(
          path.join(process.cwd(), "public/images/home/artisan-workshop.webp"),
        ),
      }),
    );
    await p.goto(base + "/onboarding");
    await p.waitForLoadState("networkidle");
    assert.equal(await p.locator(".ob-stepper li").count(), 4);
    await p.getByLabel("Votre nom complet").fill(user.name);
    await p.getByLabel("Votre adresse email").fill(user.email);
    await p.getByLabel("Choisissez un mot de passe").fill(password);
    await p.getByRole("button", { name: "Continuer", exact: true }).click();
    await p.getByLabel("Nom de votre activité").fill(business.name);
    await p.getByLabel("Votre métier ou catégorie").selectOption("menuisier");
    assert.equal(
      await p
        .getByRole("textbox", { name: "Présentez votre activité" })
        .count(),
      0,
    );
    await p.getByRole("button", { name: "Continuer", exact: true }).click();
    await p.getByLabel("Wilaya", { exact: false }).selectOption("16");
    await p.getByLabel("Commune", { exact: false }).selectOption(String(c.id));
    await p
      .getByLabel("Adresse publique", { exact: false })
      .fill(location.address);
    await p
      .getByLabel("Téléphone professionnel", { exact: false })
      .fill("0555 123 456");
    await p.getByRole("button", { name: "Continuer", exact: true }).click();
    let onboardingPayload;
    await p.route("**/api/onboarding", (route) => {
      onboardingPayload = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        json: {
          business: { id: business.id, subdomain: prefix },
          studioUrl: `/dashboard/businesses/${business.id}/studio`,
          requiresVerification: true,
          verificationEmailSent: false,
        },
      });
    });
    await p
      .getByRole("button", {
        name: "Créer mon activité et ouvrir le studio",
        exact: true,
      })
      .click();
    await p.waitForURL("**/studio", { timeout: 30000 });
    await p.locator(".st-panel h1").waitFor();
    console.log("Studio reached");
    assert(!("page" in onboardingPayload));
    assert.equal(await p.locator(".st-publish").isDisabled(), true);
    passed.push(
      "Inscription courte → connexion réelle non vérifiée → studio privé",
    );
    await pause(300);
    await p.screenshot({
      path: "/tmp/dzairbox-studio-desktop.png",
      fullPage: true,
    });
    await p
      .locator(".st-rail nav")
      .getByRole("button", { name: "Présentation", exact: true })
      .click();
    await p
      .getByLabel("Description", { exact: true })
      .fill(
        "Artisan menuisier à Alger, nous réalisons vos meubles sur mesure.",
      );
    await settled(p);
    await p
      .locator(".st-rail nav")
      .getByRole("button", { name: "Identité visuelle", exact: true })
      .click();
    await p.getByRole("button", { name: "Essentiel", exact: true }).click();
    await p.locator(".bc-essential").waitFor();
    await p
      .getByRole("button", { name: "Annuler la modification", exact: true })
      .click();
    await p.locator(".bc-panorama").waitFor();
    await p
      .getByRole("button", { name: "Rétablir la modification", exact: true })
      .click();
    await p.locator(".bc-essential").waitFor();
    await settled(p);
    passed.push(
      "Aperçu réel, changement de design, sauvegarde automatique, annuler/rétablir",
    );
    console.log("Design/undo/redo passed");
    await p
      .locator(".st-rail nav")
      .getByRole("button", { name: "Services", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Ajouter un service", exact: true })
      .click();
    await p
      .getByLabel("Nom du service", { exact: true })
      .fill("Meubles sur mesure");
    await p.getByLabel("Tarification", { exact: true }).selectOption("fixed");
    await p.getByLabel("Prix en DZD", { exact: true }).fill("15000");
    await settled(p);
    assert((await p.locator(".bc-price").textContent()).includes("15"));
    await p
      .locator(".st-rail nav")
      .getByRole("button", { name: "Questions fréquentes", exact: true })
      .click();
    await p
      .getByRole("button", { name: "Ajouter une question", exact: true })
      .click();
    await p
      .getByLabel("Question", { exact: true })
      .fill("Comment demander un devis ?");
    await p
      .getByLabel("Réponse", { exact: true })
      .fill("Contactez-nous pour présenter votre projet.");
    await settled(p);
    await p
      .locator(".st-rail nav")
      .getByRole("button", { name: "Galerie", exact: true })
      .click();
    let uploadAttempts = 0;
    await p.route("**/api/upload", (route) => {
      uploadAttempts++;
      return uploadAttempts === 1
        ? route.fulfill({ status: 500, json: { code: "UPLOAD_FAILED" } })
        : route.fulfill({
            status: 201,
            json: { id: media.id, url: `/api/media/${media.id}` },
          });
    });
    await p
      .locator("input[type=file]")
      .setInputFiles(
        path.join(process.cwd(), "public/images/home/artisan-workshop.webp"),
      );
    await p.getByText("L’envoi a échoué.", { exact: false }).waitFor();
    await p.getByRole("button", { name: "Réessayer", exact: true }).click();
    await p
      .getByLabel("Décrire la photo", { exact: true })
      .fill("Un atelier de menuiserie");
    await settled(p);
    assert.equal(uploadAttempts, 2);
    passed.push(
      "Services avec prix DZD, FAQ et upload avec échec puis reprise",
    );
    await p.reload();
    await p.locator(".st-panel h1").waitFor();
    await p
      .locator(".st-rail nav")
      .getByRole("button", { name: "Présentation", exact: true })
      .click();
    assert(
      (
        await p.getByLabel("Description", { exact: true }).inputValue()
      ).includes("Artisan menuisier"),
    );
    passed.push("Brouillon restauré depuis le serveur après rechargement");
    await p
      .locator(".st-rail nav")
      .getByRole("button", { name: "Services", exact: true })
      .click();
    await pause(350);
    await p.screenshot({
      path: "/tmp/dzairbox-studio-services.png",
      fullPage: true,
    });
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await mobile.addCookies([await cookie(user)]);
    await mobile.route(`**/api/media/${media.id}`, (route) =>
      route.fulfill({
        contentType: "image/webp",
        body: fs.readFileSync(
          path.join(process.cwd(), "public/images/home/artisan-workshop.webp"),
        ),
      }),
    );
    const mp = await mobile.newPage();
    mp.on("pageerror", (e) => errors.push(e.message));
    await mp.goto(base + `/dashboard/businesses/${business.id}/studio`);
    await mp.locator(".st-panel h1").waitFor();
    assert(
      await mp.locator("body").evaluate((el) => el.scrollWidth <= innerWidth),
    );
    await mp.screenshot({
      path: "/tmp/dzairbox-studio-mobile.png",
      fullPage: true,
    });
    await mp
      .locator(".st-panel")
      .getByRole("button", { name: "Aperçu", exact: true })
      .click();
    await mp.locator(".st-preview-open").waitFor();
    await mp
      .locator(".st-preview-open")
      .getByRole("button", { name: "Modifier · Présentation", exact: true })
      .click({ force: true });
    assert.equal(
      await mp.locator(".st-panel h1").textContent(),
      "Présentation",
    );
    await mp.locator(".st-language").click();
    await mp
      .locator(".st-panel h1")
      .filter({ hasText: "التعريف بالنشاط" })
      .waitFor();
    assert.equal(await mp.locator(".st-root").getAttribute("dir"), "rtl");
    await mp.screenshot({
      path: "/tmp/dzairbox-studio-mobile-ar.png",
      fullPage: true,
    });
    await mp.setViewportSize({ width: 320, height: 750 });
    assert(
      await mp.locator("body").evaluate((el) => el.scrollWidth <= innerWidth),
    );
    passed.push("Studio mobile 390/320 px, aperçu sélectionnable, arabe RTL");
    await mobile.close();
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    await p
      .getByRole("button", { name: "J’ai vérifié mon email", exact: true })
      .click();
    await p.waitForFunction(
      () =>
        document.querySelector(".st-publish") &&
        !document.querySelector(".st-publish").disabled,
    );
    const publishResponse = p.waitForResponse(
      (r) =>
        r.url().includes("/studio") &&
        r.request().method() === "PUT" &&
        r.request().postDataJSON().publish,
    );
    await p.locator(".st-publish").click();
    const pr = await publishResponse;
    assert.equal(pr.status(), 200);
    assert.equal((await pr.json()).pending, true);
    const adminContext = await browser.newContext();
    await adminContext.addCookies([await cookie(admin)]);
    const approved = await adminContext.request.patch(
      base + `/api/admin/businesses/${business.id}`,
      { data: { action: "approve" } },
    );
    assert.equal(approved.status(), 200);
    const publicContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    await publicContext.route(`**/api/media/${media.id}`, (route) =>
      route.fulfill({
        contentType: "image/webp",
        body: fs.readFileSync(
          path.join(process.cwd(), "public/images/home/artisan-workshop.webp"),
        ),
      }),
    );
    const publicPage = await publicContext.newPage();
    await publicPage.goto(base + "/" + prefix);
    await publicPage.waitForLoadState("networkidle");
    assert(
      (await publicPage.locator(".bc-about").textContent()).includes(
        "Artisan menuisier",
      ),
    );
    assert.equal(
      (await publicPage.locator('a[href="tel:+213555123456"]').count()) > 0,
      true,
    );
    await publicPage.screenshot({
      path: "/tmp/dzairbox-business-public.png",
      fullPage: true,
    });
    const html = await (
      await publicContext.request.get(base + "/" + prefix)
    ).text();
    assert(html.includes("application/ld+json"));
    assert(!html.includes("profileDraft"));
    passed.push(
      "Vérification puis validation administrateur : publication publique, données structurées et contenu réel",
    );
    const otherContext = await browser.newContext();
    await otherContext.addCookies([await cookie(other)]);
    assert.equal(
      (
        await otherContext.request.get(
          base + `/api/businesses/${business.id}/studio`,
        )
      ).status(),
      404,
    );
    const privateDraft = await otherContext.request.get(
      base + `/api/businesses/${business.id}/studio`,
    );
    assert.equal(privateDraft.status(), 404); // This media is now deliberately published.
    await publicContext.request.post(base + "/api/events", {
      data: { kind: "call", businessId: business.id },
    });
    const owner = await context.request.get(
      base + `/api/businesses/${business.id}/studio`,
    );
    assert((await owner.json()).stats.call >= 1);
    passed.push(
      "Comptage des contacts et isolation des brouillons ; média publié accessible",
    );
    const dir = await publicContext.request.get(
      base + `/api/directory?q=${encodeURIComponent("Atelier Test Studio")}`,
    );
    assert((await dir.json()).items.some((b) => b.id === business.id));
    await publicPage.goto(base + "/businesses");
    await publicPage.waitForLoadState("networkidle");
    await publicPage
      .getByRole("button", { name: "Carte", exact: true })
      .click();
    await publicPage.locator(".directory-map-side").waitFor();
    passed.push("Recherche serveur et bascule carte avec liste conservée");
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed, errors }, null, 2));
  } catch (error) {
    console.log("Browser errors", errors);
    if (browser) {
      for (const ctx of browser.contexts()) {
        for (const page of ctx.pages()) {
          console.log(
            "At",
            page.url(),
            (await page.locator("body").innerText()).slice(0, 4500),
          );
          await page
            .screenshot({
              path: "/tmp/dzairbox-studio-failure.png",
              fullPage: true,
            })
            .catch(() => {});
        }
      }
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    await db.verificationToken.deleteMany({
      where: { identifier: { startsWith: prefix } },
    });
    await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
    await db.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
