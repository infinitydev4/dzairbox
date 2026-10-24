# Assets générés pour l’accueil DzairBox

Génération avec l’outil intégré `image_gen`, modèle et coût gérés par l’outil et non exposés. Quatre générations, une par asset, aucune variante écartée. Mode de vérité : **illustratif**. Les personnes, commerces et quartiers ne constituent ni des membres de l’annuaire ni des témoignages. La page le signale avec les mentions de scènes illustratives et des textes alternatifs localisés.

Les originaux restent dans le dossier de génération Codex. Les versions finales utilisées par le projet sont dans `public/images/home/`. Compression WebP par Sharp, qualité 82, sans modification sémantique des images. Seul le quartier du hero est préchargé ; les images des scènes suivantes utilisent le chargement différé de `next/image`, avec dimensions réservées et `sizes` adaptés.

| Fichier final | Dimensions | Poids approximatif | Placement |
| --- | --- | --- | --- |
| `neighborhood-isometric.webp` | 1254 × 1254 | 217 Kio | Hero, miniature de quartier |
| `neighborhood-cafe.webp` | 1536 × 1024 | 181 Kio | Scène de vie locale |
| `artisan-workshop.webp` | 1536 × 1024 | 115 Kio | Scène de savoir-faire et aperçu business |
| `local-discovery-isometric.webp` | 1254 × 1254 | 108 Kio | Recherche par lieu |
| `dzairbox-local-life-og.webp` | 1200 × 630 | 93 Kio | Aperçu social dérivé du café |

## Prompts finaux

### Quartier isométrique

```text
Use case: stylized-concept. Asset type: premium landing page hero illustration for DzairBox, an Algerian local services directory. Create a refined photorealistic 3D isometric miniature of one lively contemporary Algerian neighborhood, floating on a compact beveled square base: warm white low-rise Mediterranean buildings with teal shutters, a small café terrace, a workshop storefront, a few tiny pedestrians, one street tree and a subtle amber map-location sculptural marker. The architecture feels contemporary Algerian, grounded and beautiful, not a fantasy city or a generic skyscraper skyline. Composition: square image, entire miniature centered with generous 10 percent breathing space, isometric camera about 35 degrees above, clearly layered real materials and soft ambient occlusion. Background perfectly uniform warm ivory #f7f6f0. Palette: deep pine green #103832, cream limestone, sun-warmed terracotta, Mediterranean blue, restrained amber #f6c96b. Lighting: warm morning sun, premium architectural model photography, tactile limestone and matte ceramics, crisp details, gentle long soft shadows. The asset should be compelling and dimensional at 500px wide. No text, no letters, no logos, no watermark, no interface, no frame, no flags. This is an illustrative neighborhood, not a claim of real listed businesses or geographic coverage.
```

### Café de quartier

```text
Use case: photorealistic-natural. Asset type: wide editorial lifestyle photograph for the DzairBox homepage, an Algerian local services directory. A candid moment at a small contemporary neighborhood café in Algeria: a North African woman in her thirties in everyday modern clothing receives a coffee from the café proprietor, a North African man in his forties wearing a simple pine green apron. Friendly natural exchange, not posed, realistic faces and anatomically correct hands. Foreground small marble table, espresso cup, warm wood door, cream plaster facade, dark green awning, subtle ceramic tile details, leafy street tree and softly blurred Mediterranean urban life behind. Contemporary lived-in Algeria, tasteful and grounded, no tourist costumes, no exotic clichés. Composition horizontal 3:2, subjects in central area to work with responsive crops, medium-wide 35mm documentary photography, natural morning light, warm cream, forest green, muted terracotta, rich tactile surfaces, real camera depth of field, true skin texture, understated premium color grade. No text, no signage lettering, no logos, no watermarks, no fake interface. This is an illustrative generated scene, not an actual customer or listed establishment. Output one single photograph, no collage, no border.
```

### Atelier du menuisier

```text
Use case: photorealistic-natural. Asset type: editorial lifestyle image for the DzairBox local business homepage. Create a candid realistic portrait of a contemporary Algerian craft professional in his late thirties working carefully at a wooden bench in his small well-kept carpentry workshop. North African man with natural short dark hair and light stubble, wearing an olive work shirt with rolled sleeves, using a hand plane on a smooth solid wood board. His face, both hands, the plane and the wood surface must be anatomically and mechanically plausible. A few neatly hung hand tools and timber boards in the background, large window from left, no dangerous machinery in motion. Concentration, pride in useful everyday work, human warmth. Photographic 50mm lens, realistic skin, tactile grain, subtle sawdust, natural warm side light, premium documentary color grade, palette warm honey wood, deep pine green, cream and muted blue. Composition: horizontal 3:2, main person centered so the photograph also crops well to a vertical card, face around upper central third, hands around middle; enough workshop context at the edges. No text, no signs, no lettering, no logos, no watermark. Single photograph, not a collage. This is an illustrative generated scene, not an actual registered professional or a testimonial.
```

### Découverte locale isométrique

```text
Use case: stylized-concept. Asset type: second isometric 3D website illustration for DzairBox, the Algerian local services directory. Create an elegant high-end 3D editorial still life communicating the path from searching locally to discovering a business. On a clean pale sage background #e5efed, a slim dark pine green smartphone lies at an isometric angle on a small matte cream stepped platform. On its screen only a subtle abstract street map with simple green lines, one amber location marker and three blank rounded cards, absolutely no text or letters. Beside the phone rise two miniature contemporary Mediterranean Algerian storefront buildings: cream limestone facades, green shutters and a small dark green striped café awning, a tiny terracotta plant, a smaller artisan workshop. A thin sculptural pale gold path connects a physical amber map pin next to the buildings to the marker on the phone. This is a conceptual illustration, not a real map or actual app screenshot. Composition square 1:1, orthographic isometric camera, full objects visible with generous 12 percent breathing space, strong clear hierarchy phone -> map pin -> storefront, keep details legible at 450px. Materials tactile matte ceramic, limestone and soft glass; very refined physically based 3D render, studio architectural lighting from upper left, subtle soft shadows. Warm cream, forest #103832 and #17745f, muted Mediterranean blue and restrained amber #f6c96b. No text, no branding, no logo, no watermark, no people, no collage, no ornamental clutter, no frame.
```

## Vérification visuelle

Les quatre sorties ont été inspectées : cohérence des matières et de la lumière, absence de texte ou marque inventés, figures humaines et mains lisibles, géométrie des illustrations, composition compatible avec les recadrages prévus. Les recadrages et le mouvement sont également contrôlés dans le navigateur. Les images restent des interprétations visuelles de l’Algérie contemporaine et ne documentent pas des lieux réels identifiés.

## Validation de l’intégration — 24 octobre 2026

- ESLint : aucune erreur. TypeScript : aucune erreur. `next build --webpack` : compilation, vérification des types et génération des 26 pages statiques réussies.
- Chromium avec Playwright, rendu de production : les cinq occurrences d’images chargent correctement ; aucune erreur JavaScript ou console sur l’accueil.
- Français et arabe/RTL : contrôle desktop à 1440 px et mobile/tablette à 320, 360, 390 et 768 px, sans débordement horizontal. À 360 × 800, le bouton de recherche est visible dès le premier écran.
- Recherche arabe : soumission native vers `/businesses?search=صيدلية`. CTA professionnel : ouverture du formulaire `/create-service` en arabe. Aucun compte réel soumis.
- Clavier : lien d’évitement en premier dans l’ordre de tabulation. FAQ native fonctionnelle. Barre d’action mobile présente après le hero et masquée devant le CTA final ; navigation mobile générale masquée uniquement sur l’accueil pour éviter le chevauchement.
- Mouvement réduit : défilement non animé, titres et photos visibles, absence de transformation des illustrations. Sans JavaScript : H1, deux formulaires GET, liens et photos restent dans le HTML.
- SEO : un H1, marque non dupliquée dans le titre, URL canonique, image sociale et quatre questions FAQ cohérentes entre HTML et JSON-LD.
- Compatibilité du chargement Prisma : utilisation de `createRequire(import.meta.url)` pour permettre l’analyse de Webpack, en conservant le contrôle de lisibilité du fichier `.env` existant.
- Parcours public : le proxy laisse atteindre `/[subdomain]`, et la page business conserve le filtre `isActive: true`. Un slug inexistant retourne 404. Les routes `/dashboard`, `/dashboard/profile`, `/admin` et `/admin/users` renvoient toujours un visiteur déconnecté vers la connexion.

Le build et le serveur de vérification utilisent des variables temporaires de test, sans base réelle. Les résultats réels de l’annuaire, une page business active et l’inscription effective avec e-mail restent à contrôler avec l’environnement applicatif connecté. Aucune mesure de conversion ou de Core Web Vitals en production n’est revendiquée.

Captures et rapport JSON : dossier de visualisation Codex de cette tâche, fichiers `dzairbox-enriched-*.png` et `dzairbox-enriched-qa.json`. Les changements restent locaux au projet ; aucun déploiement n’a été effectué.
