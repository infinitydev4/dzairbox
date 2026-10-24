// Run: node --require tsx/cjs --test scripts/test-service-onboarding.cjs
const { test } = require("node:test"),
  assert = require("node:assert/strict");
const {
  accountSchema,
  onboardingSchema,
  draftSchema,
  emptyOnboardingDraft,
  businessSlug,
  normalizeAlgerianPhone,
} = require("../lib/service-onboarding.ts");
const {
  emptyDocument,
  studioDocumentSchema,
  publicationErrors,
  documentFromBusiness,
  sameProfile,
} = require("../lib/studio/document.ts");
const {
  allCommunes,
  allWilayas,
  validateLocation,
  publicLocation,
} = require("../lib/locations.ts");
const { directorySearchClauses } = require("../lib/search-normalization.ts");
function profile() {
  const c = allCommunes.find((c) => c.wilayaCode === "16");
  return {
    name: "Atelier Benali",
    category: "menuisier",
    phone: "+213555123456",
    location: {
      mode: "establishment",
      wilayaCode: c.wilayaCode,
      communeCode: c.code,
      address: "10 rue de la Liberté, Alger",
      areas: [],
      point: null,
    },
  };
}
test("Inscription courte : compte, activité et coordonnées, sans page", () => {
  const d = emptyOnboardingDraft();
  d.requestId = crypto.randomUUID();
  d.account = {
    name: "Amine Benali",
    email: "AMINE@example.invalid",
    password: "Secret123!",
  };
  d.business = { name: "Atelier Benali", category: "menuisier" };
  d.contact = { phone: "0555 123 456", location: profile().location };
  const parsed = onboardingSchema.parse(d);
  assert.equal(parsed.account.email, "amine@example.invalid");
  assert.equal(parsed.contact.phone, "+213555123456");
  assert.equal("page" in parsed, false);
  assert.equal(
    onboardingSchema.safeParse({
      ...d,
      contact: {
        ...d.contact,
        location: { ...d.contact.location, communeCode: "" },
      },
    }).success,
    false,
  );
});
test("Brouillon sans mot de passe et informations incomplètes acceptées", () => {
  const d = emptyOnboardingDraft();
  d.requestId = crypto.randomUUID();
  const parsed = draftSchema.parse(d);
  assert.equal("password" in parsed.account, false);
  assert.equal(accountSchema.safeParse(d.account).success, false);
});
test("Téléphones et slugs réservés", () => {
  for (const n of ["0555 123 456", "+213 555123456", "00213 555123456"])
    assert.equal(normalizeAlgerianPhone(n), "+213555123456");
  assert.equal(businessSlug("Ébénisterie Alger"), "ebenisterie-alger");
  assert.equal(businessSlug("admin"), "business");
});
test("Référentiel 2026 cohérent et bilingue, sans commune dupliquée", () => {
  assert.equal(allWilayas.length, 69);
  assert.equal(allCommunes.length, 1541);
  assert.equal(new Set(allCommunes.map((c) => c.code)).size, 1541);
  assert(
    allCommunes.every(
      (c) => c.fr && c.ar && allWilayas.some((w) => w.code === c.wilayaCode),
    ),
  );
  assert(validateLocation(profile().location));
  assert(!validateLocation({ ...profile().location, wilayaCode: "99" }));
});
test("Les zones ne divulguent ni adresse personnelle ni position précise", () => {
  const l = publicLocation({
    ...profile().location,
    mode: "area",
    address: "PRIVATE ADDRESS",
    point: { lat: 1, lng: 2, source: "user" },
  });
  assert.equal(l.address, "");
  assert.equal(l.point.source, "commune");
  assert.notEqual(l.point.lat, 1);
});
test("Un résultat Google expiré ne ressort jamais dans la projection publique", () => {
  const l = publicLocation({
    ...profile().location,
    point: {
      lat: 1,
      lng: 2,
      source: "google",
      expiresAt: "2020-01-01T00:00:00.000Z",
    },
  });
  assert.notEqual(l.point?.source, "google");
});
test("Les neuf styles sont valides et un brouillon incomplet reste récupérable", () => {
  for (const layout of ["panorama", "essential", "signature"])
    for (const palette of ["forest", "ocean", "clay"]) {
      const d = emptyDocument(profile());
      d.design = { layout, palette, font: "modern" };
      assert(studioDocumentSchema.safeParse(d).success);
      assert(publicationErrors(d).includes("about"));
    }
  const d = emptyDocument(profile());
  d.profile.name = "";
  assert(studioDocumentSchema.safeParse(d).success);
  assert(publicationErrors(d).includes("intro"));
});
test("Conditions de publication : prix, horaires et liens", () => {
  const d = emptyDocument(profile());
  d.content.about.fr = "Un artisan à votre service.";
  assert.deepEqual(publicationErrors(d), []);
  d.content.appointmentOnly = false;
  d.content.hours.sunday.open = "";
  assert(studioDocumentSchema.safeParse(d).success);
  assert(publicationErrors(d).includes("hours"));
  d.content.socials.facebook = "javascript:alert(1)";
  assert(publicationErrors(d).includes("contact"));
});
test("Migration des contenus, de la couverture et des couleurs sans mutation", () => {
  const b = {
    ...profile(),
    address: profile().location.address,
    description: "Présentation",
    services: "Cuisine, Rénovation",
    heroImage: "https://example.invalid/cover.jpg",
    images: '["https://example.invalid/photo.jpg"]',
  };
  const old = {
    templateKey: "sidebar-left",
    theme: { primaryColor: "#123456", secondaryColor: "#654321" },
    hero: { title: "Ancien titre" },
    sections: {
      about: { content: "Texte conservé" },
      gallery: { images: ["https://example.invalid/galerie.jpg"] },
    },
  };
  const before = JSON.stringify(old),
    d = documentFromBusiness(b, old);
  assert.equal(d.design.layout, "signature");
  assert.equal(d.content.about.fr, "Texte conservé");
  assert.equal(d.content.title.fr, "Ancien titre");
  assert.equal(d.content.services.length, 2);
  assert.equal(d.design.colors[0], "#123456");
  assert.equal(JSON.stringify(old), before);
});
test("Recherche par expressions arabes et alternatives françaises", () => {
  const clauses = directorySearchClauses("سباك في الجزائر");
  assert(clauses.some((c) => c.includes("plombier")));
  assert(clauses.some((c) => c.includes("alger")));
  assert(!clauses.some((c) => c.includes("في")));
  assert(sameProfile(profile(), structuredClone(profile())));
});
