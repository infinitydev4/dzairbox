// Local PostgreSQL only. Creates and removes its own fixtures. Never sends emails.
require("tsx/cjs");
require("@next/env").loadEnvConfig(process.cwd());
const assert = require("node:assert/strict"),
  Module = require("node:module"),
  crypto = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const original = Module._load;
let session = null;
let mails = 0;
assert(
  ["localhost", "127.0.0.1", "::1"].includes(
    new URL(process.env.DATABASE_URL).hostname,
  ),
  "Use a local database",
);
Module._load = function (request, parent, main) {
  if (request === "@/lib/prisma") return { prisma: db };
  if (request === "@/lib/auth") return { authOptions: {} };
  if (request === "next-auth") return { getServerSession: async () => session };
  if (request === "next/cache") return { revalidatePath: () => {} };
  if (request === "@/lib/onboarding-email")
    return {
      sendOnboardingVerification: async () => {
        mails++;
        return { success: false };
      },
    };
  return original.call(this, request, parent, main);
};
const { POST } = require("../app/api/onboarding/route.ts");
const {
  readStudio,
  saveStudio,
  moderateBusiness,
  publicBusiness,
} = require("../lib/studio/server.ts");
const { allCommunes } = require("../lib/locations.ts");
const { searchDirectory } = require("../lib/studio/directory.ts");
const { GET: mediaGET } = require("../app/api/media/[id]/route.ts");
const {
  POST: oldConfigPOST,
} = require("../app/api/businesses/[id]/page-config/route.ts");
const { purgeExpiredGeocodes } = require("../lib/studio/geocache.ts");
const { POST: oldSignPOST } = require("../app/api/images/signed-url/route.ts");
const { GET: oldProxyGET } = require("../app/api/images/proxy/route.ts");
const { NextRequest } = require("next/server");
Module._load = original;
const prefix = "studio-it-" + crypto.randomUUID();
const email = prefix + "@example.invalid";
const id = crypto.randomUUID();
const ids = [];
const passed = [];
const request = (body) =>
  new Request("http://localhost:3000/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
(async () => {
  try {
    const c = allCommunes.find((c) => c.wilayaCode === "16");
    const payload = {
      requestId: id,
      language: "fr",
      account: { name: "Test Studio", email, password: "Secret123!" },
      business: { name: prefix, category: "menuisier" },
      contact: {
        phone: "0555 123 456",
        location: {
          mode: "establishment",
          wilayaCode: c.wilayaCode,
          communeCode: c.code,
          address: "10 rue test, Alger",
          areas: [],
          point: null,
        },
      },
    };
    const response = await POST(request(payload));
    assert.equal(response.status, 201);
    const created = await response.json();
    assert(created.studioUrl.endsWith("/studio"));
    assert.equal(mails, 1);
    const b = await db.business.findUniqueOrThrow({
      where: { id },
      include: { pageConfig: true },
    });
    ids.push(b.userId);
    assert.equal(b.pageConfig, null);
    assert.equal(b.useCustomPage, false);
    assert.equal(b.isActive, false);
    passed.push("Inscription atomique sans page, échec email non bloquant");
    const retry = await POST(request(payload));
    assert.equal(retry.status, 200);
    assert.equal(await db.business.count({ where: { id } }), 1);
    passed.push("Nouvelle tentative idempotente");
    let loaded = await readStudio(id, b.userId);
    assert.equal(loaded.revision, 0);
    await assert.rejects(
      () => readStudio(id, "another-user"),
      (e) => e.status === 404,
    );
    const doc = loaded.document;
    doc.content.about.fr = "Un artisan local pour vos meubles.";
    await saveStudio(id, b.userId, doc, 0);
    await assert.rejects(
      () => saveStudio(id, b.userId, doc, 1, true),
      (e) => e.code === "EMAIL_UNVERIFIED",
    );
    passed.push(
      "Brouillon privé accessible avant vérification, publication interdite",
    );
    const races = await Promise.allSettled([
      saveStudio(id, b.userId, doc, 1),
      saveStudio(id, b.userId, doc, 1),
    ]);
    assert.equal(races.filter((r) => r.status === "fulfilled").length, 1);
    assert(
      races.some(
        (r) => r.status === "rejected" && r.reason.code === "REVISION_CONFLICT",
      ),
    );
    passed.push("Conflits entre onglets détectés par transaction et révision");
    await db.user.update({
      where: { id: b.userId },
      data: { emailVerified: new Date() },
    });
    loaded = await readStudio(id, b.userId);
    const pending = await saveStudio(id, b.userId, doc, loaded.revision, true);
    assert.equal(pending.pending, true);
    assert.equal(
      (await db.business.findUnique({ where: { id } })).isActive,
      false,
    );
    await moderateBusiness(id, "approve", "");
    let pub = await db.business.findUniqueOrThrow({
      where: { id },
      include: { pageConfig: true },
    });
    assert.equal(pub.isActive, true);
    assert.equal(pub.pageConfig.config.version, 2);
    passed.push("Soumission privée puis publication du snapshot approuvé");
    loaded = await readStudio(id, b.userId);
    const next = structuredClone(loaded.document);
    next.profile.name = prefix + " changed";
    const queued = await saveStudio(id, b.userId, next, loaded.revision, true);
    assert(queued.pending);
    pub = await db.business.findUniqueOrThrow({
      where: { id },
      include: { pageConfig: true },
    });
    assert.equal(pub.name, prefix);
    assert.equal(pub.pageConfig.config.profile.name, prefix);
    passed.push("Modification sensible : ancienne version publique conservée");
    loaded = await readStudio(id, b.userId);
    const later = structuredClone(loaded.document);
    later.profile.name = prefix + " not submitted";
    await saveStudio(id, b.userId, later, loaded.revision);
    await moderateBusiness(id, "approve", "");
    pub = await db.business.findUniqueOrThrow({
      where: { id },
      include: { pageConfig: true },
    });
    assert.equal(pub.name, prefix + " changed");
    assert.equal(pub.pageConfig.draft.profile.name, prefix + " not submitted");
    passed.push(
      "L’approbation publie la version soumise, pas un brouillon ultérieur",
    );
    const other = await db.user.create({
      data: {
        name: "Other fixture",
        email: prefix + "-other@example.invalid",
        password: "no-login",
      },
    });
    ids.push(other.id);
    const ob = await db.business.create({
      data: {
        name: "Other private",
        category: "menuisier",
        address: "Private",
        subdomain: prefix + "-other",
        userId: other.id,
      },
    });
    const media = await db.businessMedia.create({
      data: {
        businessId: ob.id,
        userId: other.id,
        storageUrl: `https://${process.env.DZAIRBOX_AWS_S3_BUCKET_NAME}.s3.${process.env.DZAIRBOX_AWS_REGION}.amazonaws.com/private/business-media/${prefix}.jpg`,
        contentType: "image/jpeg",
      },
    });
    loaded = await readStudio(id, b.userId);
    const stolen = structuredClone(loaded.document);
    stolen.content.cover = "/api/media/" + media.id;
    await assert.rejects(
      () => saveStudio(id, b.userId, stolen, loaded.revision),
      (e) => e.code === "INVALID_MEDIA",
    );
    session = { user: { id: b.userId } };
    assert.equal(
      (
        await mediaGET(new Request("http://localhost"), {
          params: Promise.resolve({ id: media.id }),
        })
      ).status,
      404,
    );
    passed.push("Médias et brouillons d’un autre propriétaire inaccessibles");
    assert.equal(
      (
        await oldSignPOST(
          new NextRequest("http://localhost/api/images/signed-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: media.storageUrl }),
          }),
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await oldProxyGET(
          new NextRequest(
            "http://localhost/api/images/proxy?url=" +
              encodeURIComponent(media.storageUrl),
          ),
        )
      ).status,
      404,
    );
    passed.push(
      "Anciens proxy et signature S3 : aucun contournement des médias privés",
    );
    assert.equal((await oldConfigPOST()).status, 409);
    passed.push("Ancienne route de publication neutralisée");
    const results = await searchDirectory(new URLSearchParams({ q: prefix }));
    assert(results.items.some((row) => row.id === id));
    assert(
      results.items.every(
        (row) => !("profileDraft" in row) && !("userId" in row),
      ),
    );
    passed.push(
      "Recherche publique paginée et projection sans données privées",
    );
    const area = publicBusiness({
      ...pub,
      location: {
        ...payload.contact.location,
        mode: "area",
        address: "SECRET HOME",
        point: { lat: 1, lng: 2, source: "user" },
      },
    });
    assert(!JSON.stringify(area).includes("SECRET HOME"));
    passed.push("Adresse personnelle absente des données publiques");
    await db.user.update({
      where: { id: other.id },
      data: { emailVerified: new Date() },
    });
    await moderateBusiness(ob.id, "approve", "");
    const fiche = await db.business.findUniqueOrThrow({
      where: { id: ob.id },
      include: { pageConfig: true },
    });
    assert.equal(fiche.isActive, true);
    assert.equal(fiche.useCustomPage, false);
    assert.equal(fiche.pageConfig, null);
    passed.push("Fiche standard approuvée sans création de page personnalisée");
    const expired = {
      ...payload.contact.location,
      point: {
        lat: 36,
        lng: 3,
        source: "google",
        expiresAt: "2020-01-01T00:00:00.000Z",
      },
    };
    const expiredDoc = {
      ...doc,
      profile: { ...doc.profile, location: expired },
    };
    await db.business.update({
      where: { id },
      data: { location: expired, profileDraft: expiredDoc.profile },
    });
    await db.businessPageConfig.update({
      where: { businessId: id },
      data: { draft: expiredDoc, config: expiredDoc, submitted: expiredDoc },
    });
    assert.equal(await purgeExpiredGeocodes(db), 5);
    const purged = await db.business.findUniqueOrThrow({
      where: { id },
      include: { pageConfig: true },
    });
    assert.equal(purged.location.point, null);
    assert.equal(purged.profileDraft.location.point, null);
    for (const key of ["draft", "config", "submitted"]) {
      assert.equal(purged.pageConfig[key].profile.location.point, null);
      assert.equal(
        purged.pageConfig[key].content.about.fr,
        doc.content.about.fr,
      );
    }
    passed.push(
      "Expiration Google : purge du cache et des trois instantanés sans perte de contenu",
    );
    await moderateBusiness(id, "suspend", "Test suspension");
    assert.equal(
      (await searchDirectory(new URLSearchParams({ q: prefix }))).total,
      0,
    );
    passed.push("Suspension : retrait de l’annuaire et de la carte");
    console.log(JSON.stringify({ passed, emailsActuallySent: 0 }, null, 2));
  } finally {
    await db.business.deleteMany({
      where: { OR: [{ id }, { subdomain: { startsWith: prefix } }] },
    });
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
