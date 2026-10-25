require("tsx/cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { publicMapPoint } = require("../lib/studio/map-location.ts");
const { clusterMarkers } = require("../lib/directory-map.ts");
const { allCommunes } = require("../lib/locations.ts");
const casbah = allCommunes.find((c) => c.fr === "Casbah");
const location = {
  mode: "establishment",
  wilayaCode: "16",
  communeCode: casbah.code,
  address: "Rue publique, Casbah",
  areas: [],
  point: null,
};
test("Les anciennes adresses produisent un centre de commune, sans modifier les données", () => {
  const raw = { location: null, address: "Casbah, Alger" };
  assert.deepEqual(publicMapPoint(raw.location, raw.address), {
    lat: casbah.lat,
    lng: casbah.lng,
    source: "commune",
    mode: "establishment",
  });
  assert.equal(raw.location, null);
});
test("Les variantes françaises et arabes connues gardent une localisation approximative", () => {
  for (const address of [
    "Bab Ezzouar, Alger",
    "باب الزوار، الجزائر",
    "Bachdjerrah, Alger",
  ])
    assert.equal(publicMapPoint(null, address)?.source, "commune");
});
test("Une adresse contradictoire ou un mot partiel ne crée pas de faux repère", () => {
  for (const address of [
    "Tlemcen, Alger",
    "Oran, Tlemcen",
    "Rue Casbah inconnue, Alger",
    "Adresse sans commune",
    "Casbah, El Biar, Alger",
  ])
    assert.equal(publicMapPoint(null, address), null);
});
test("Un professionnel mobile ne révèle pas son domicile dans le repère", () => {
  const safe = publicMapPoint(
    {
      ...location,
      mode: "area",
      address: "SECRET",
      point: { source: "user", lat: 1, lng: 2 },
    },
    "SECRET",
  );
  assert.equal(safe.mode, "area");
  assert.equal(safe.source, "commune");
  assert.equal(safe.lat, casbah.lat);
  assert(!JSON.stringify(safe).includes("SECRET"));
});
test("Les points fournis restent précis, les résultats Google expirés utilisent la commune", () => {
  assert.equal(
    publicMapPoint(
      { ...location, point: { lat: 36, lng: 3, source: "user" } },
      "",
    ).source,
    "user",
  );
  const expired = publicMapPoint(
    {
      ...location,
      point: {
        lat: 1,
        lng: 2,
        source: "google",
        expiresAt: "2020-01-01T00:00:00.000Z",
      },
    },
    "",
  );
  assert.equal(expired.source, "commune");
  assert.equal(expired.lat, casbah.lat);
});
test("Une localisation structurée invalide ne se rabat pas sur une adresse potentiellement privée", () => {
  assert.equal(publicMapPoint({ mode: "area" }, "Casbah, Alger"), null);
});
const marker = (id, lat, lng) => ({
  id,
  name: id,
  subdomain: id,
  lat,
  lng,
  approximate: true,
  mode: "establishment",
  page: 1,
  category: "artisan",
  address: "Casbah",
  phone: null,
});
test("Les regroupements conservent tous les professionnels au même emplacement", () => {
  const rows = [
    marker("a", 36.78, 3.05),
    marker("b", 36.78, 3.05),
    marker("c", 35, -1),
  ];
  for (const zoom of [5, 10, 16, 20]) {
    const groups = clusterMarkers(rows, zoom);
    assert.equal(groups.flat().length, 3);
    assert(groups.some((g) => g.length === 2));
    assert.deepEqual(
      rows.map((r) => r.id),
      ["a", "b", "c"],
    );
  }
});
test("Des coordonnées invalides ne cassent pas les regroupements et une liste vide reste valide", () => {
  assert.deepEqual(clusterMarkers([], 7), []);
  assert.equal(
    clusterMarkers([marker("bad", NaN, 1), marker("ok", 36, 3)], 10).flat()
      .length,
    1,
  );
});

test("Les repères proches de part et d’autre d’une frontière de grille restent regroupés", () => {
  const close = [marker("left", 36.75, 3.0), marker("right", 36.7501, 3.0001)];
  assert.equal(clusterMarkers(close, 10).length, 1);
  assert.equal(clusterMarkers(close, 20).flat().length, 2);
});
