# DzairBox — Identité visuelle v1

Proposition fondée sur l'analyse de l'accueil actuel, de `app/home.css`, de `docs/home-visual-system.md`, de `components/home/home-experience.tsx`, de `app/icon.svg` et de `app/manifest.ts`.

## Vision
**Proche. Local. Clair.** Une plateforme de découverte des services et professionnels algériens, avec une personnalité contemporaine, locale et rassurante.

## Logotype
Concept : **épingle de localisation + cube isométrique**, trois faces pour signifier la vitrine et les entreprises locales. Wortdmark exact : **DzairBox** (D et B majuscules).

Le logo SVG/PNG, l'icône mobile et le document de charte complète sont préparés séparément et doivent être validés avant remplacement des ressources de production.

### Couleurs
| Nom | Hex | Usage |
|---|---|---|
| Pin profond | `#103832` | Texte, fonds sombres |
| Vert signal | `#17745F` | CTA et repères |
| Calcaire | `#F7F6F0` | Fond |
| Blanc | `#FFFFFF` | Cartes |
| Bleu Méditerranée | `#B9DCE3` | Accent calme |
| Jaune soleil | `#F6C96B` | Accent ponctuel |

### Typographie
- Geist Variable : H1–H3, chiffres importants et titres.
- Inter : textes, formulaires et navigation.
- Noto Sans Arabic : interfaces arabes avec direction RTL.

### Utilisation
- Espacement libre minimal autour du logo : 25 % de la hauteur du symbole.
- Largeur du logo horizontal : au moins 140px ; icône seule : idéalement 32px minimum.
- Ne jamais étirer, incliner, ombrer ni recolorer arbitrairement.
- Texte courant contrasté ; focus visible ; contrôles tactiles d'au moins 44px.
- Transitions discrètes avec support `prefers-reduced-motion`.
- Illustrations isométriques et photos réalistes de commerces locaux ; aucun commerce fictif ne doit être présenté comme réel.

## Migration recommandée
1. Approuver le logo et tester ses tailles.
2. Stocker les fichiers sous `public/branding/`.
3. Mettre à jour `components/home/home-experience.tsx`, header, footer, `app/icon.svg`, manifest et OG.
4. Harmoniser les anciennes classes Emerald et les tokens CSS.
5. Tester desktop/mobile, FR/AR, RTL, cache PWA, contraste et SEO.

**Statut : proposition non intégrée en production.** L'ancien logo reste inchangé durant l'approbation.
