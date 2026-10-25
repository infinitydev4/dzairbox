# Carte de l’annuaire

## Affichage

En mode carte, l’annuaire occupe la hauteur du viewport (`100dvh`). Sur ordinateur, la liste défile indépendamment de la carte. Sur mobile jusqu’à 750 px, la carte couvre tout l’écran : recherche, filtres dans une boîte de dialogue native, zoom, recentrage et retour à la liste restent accessibles. La fiche sélectionnée présente ses contacts au bas de la carte. Les contrôles et panneaux respectent les zones sûres du téléphone, le clavier et le RTL.

L’état de vue et les filtres restent dans l’URL. Les changements de page ou de filtre conservent l’instance Google Maps ; seul un changement des emplacements recadre la carte. La position du visiteur est demandée uniquement via « Autour de moi ». L’échec du chargement permet une nouvelle tentative et conserve l’accès à la liste.

## Repères

`lib/directory-map.ts` contient les types partagés et le regroupement à distance visuelle, basé sur la projection Mercator. Les cellules voisines sont examinées pour éviter les superpositions aux frontières des regroupements. Des professionnels au même emplacement restent réunis même au zoom maximal ; un panneau permet de les sélectionner individuellement.

`components/directory/map-pins.ts` crée des boutons HTML dans un `OverlayView` Google Maps. Cette API stable ne nécessite pas de Map ID ou de nouvelle configuration Google Cloud. Les boutons ont un nom accessible, un état de sélection et une cible tactile d’au moins 44 px. Le composant nettoie les repères, écouteurs, temporisateurs et observateurs à sa fermeture. Les tuiles sont accompagnées d’un état de chargement ; les erreurs de fournisseur proposent une reprise.

## Anciennes adresses

`lib/studio/map-location.ts` produit une projection de lecture pour les anciennes fiches sans coordonnées. Il rapproche uniquement des noms complets de communes FR/AR et des variantes orthographiques explicites, avec leur wilaya lorsqu’elle est présente. Les adresses contradictoires ou ambiguës restent dans la liste et ne créent aucun faux repère.

Un emplacement déduit est présenté comme un centre de commune approximatif. Aucun code administratif, adresse ni profil n’est réécrit. Les emplacements précis déjà fournis sont conservés ; les professionnels itinérants utilisent exclusivement un centre de commune, sans adresse personnelle. Les protections d’expiration existantes des coordonnées Google restent appliquées.

## Validation

- `node --test scripts/test-directory-map.cjs` : rapprochement des anciennes adresses, variantes FR/AR, ambiguïtés, adresses privées, coordonnées expirées et regroupements.
- `node scripts/test-directory-map-browser.cjs` : véritables tuiles Google et boutons de repères, hauteur ordinateur, carte mobile 390/320 px, filtres, clavier, géolocalisation sur action, RTL, sélection des regroupements et panne de Google Maps. Le script ne crée ni compte ni média et suppose un annuaire local contenant des professionnels localisés.
- `node scripts/test-studio-integration.cjs` : non-régression des autorisations, états publics, confidentialité et recherche.
- TypeScript, ESLint ciblé et `node node_modules/next/dist/bin/next build --webpack`.
