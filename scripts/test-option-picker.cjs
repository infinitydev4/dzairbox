require("tsx/cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { filterPickerOptions } = require("../lib/option-picker.ts");

const options = [
  { value: "électricien", label: "Électricien" },
  { value: "plombier", label: "سباك" },
  { value: "menuisier", label: "Menuisier" },
];

test("La recherche ignore les accents et trouve le métier français", () => {
  assert.deepEqual(
    filterPickerOptions(options, "electricien").map((option) => option.value),
    ["électricien"],
  );
});

test("Une recherche arabe trouve le libellé affiché", () => {
  assert.deepEqual(
    filterPickerOptions(options, "سباك").map((option) => option.value),
    ["plombier"],
  );
});

test("La clé du métier reste cherchable même si le libellé est arabe", () => {
  assert.deepEqual(
    filterPickerOptions(options, "plomb").map((option) => option.value),
    ["plombier"],
  );
});

test("Une recherche vide conserve toute la liste et une recherche inconnue n’en garde aucune", () => {
  assert.equal(filterPickerOptions(options, "   ").length, options.length);
  assert.equal(filterPickerOptions(options, "zzzz").length, 0);
});
