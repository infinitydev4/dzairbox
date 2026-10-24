# DzairBox — direction de l’accueil

## Idée

Un carnet d’adresses vivant, inspiré des repères de la ville algérienne contemporaine : signalétique nette, lumière franche et tracés de parcours. Les plans et les repères sont des illustrations abstraites, jamais une carte ou une promesse de couverture.

## Palette

| Rôle | Nom | Valeur |
| --- | --- | --- |
| Texte et grande scène | Pin profond | `#103832` |
| Actions et repères | Vert signal | `#17745F` |
| Fond principal | Calcaire | `#F7F6F0` |
| Surfaces de lecture | Blanc | `#FFFFFF` |
| Contrepoint calme | Bleu Méditerranée | `#B9DCE3` |
| Point focal ponctuel | Jaune soleil | `#F6C96B` |

Le vert signal indique les actions. Le jaune guide le regard une seule fois par scène. Les traits fins structurent l’information ; les ombres sont réservées à la démonstration de la page business.

## Typographies

- **Geist Variable**, déjà présent localement : grands titres, mot-symbole et chiffres d’interface. Graisses 650–750, approche serrée en français.
- **Inter**, déjà chargé par l’application : paragraphes, navigation, champs et boutons.
- **Noto Sans Arabic**, déjà chargé par l’application : tout le texte arabe, approche normale et interligne plus ample. Les composants suivent `dir="rtl"`.

## Composition

Hero asymétrique : promesse et formulaire à gauche, quartier isométrique illustratif à droite. Les scènes alternent grands aplats, photos éditoriales et zones blanches : catégories, vie locale, aperçu d’une page business, recherche par lieu, parcours pour deux publics, appel final, FAQ. Les titres annoncent directement le contenu. Aucun nombre, avis, entreprise ou lieu couvert n’est supposé.

## Mouvement

- Le formulaire et les liens restent visibles et utilisables dès le premier rendu.
- Entrée courte du support visuel du hero, sans retarder le contenu (moins de 800 ms).
- Révélation par masque des titres de scène ; une seule entrée par scène.
- Cartes de catégories révélées par petits décalages latéraux ; photos révélées par masque puis parallaxe mesurée ; aperçu business avec profondeur 3D légère ; illustrations isométriques avec un déplacement de moins de 30 px.
- Animations principalement sur `transform` et `opacity`, avec un masque ponctuel des photos. Aucun blocage du scroll, aucune boucle automatique.
- Sur écran tactile : mouvements plus courts, sans parallaxe ni 3D. Avec `prefers-reduced-motion` : aucun mouvement non essentiel.

## Enrichissement visuel et conversion

1. Objectif : rendre la recherche immédiatement utile et donner aux professionnels une entrée explicite vers leur page business.
2. Publics : visiteurs cherchant un service en Algérie et professionnels souhaitant présenter leur activité.
3. Ton : proximité, savoir-faire et lumière du quotidien ; informations concrètes et actions explicites.
4. Composition : miniature 3D dans le hero, deux photos de vie locale aux proportions asymétriques, démonstration HTML d’une page, seconde illustration isométrique pour relier lieu et recherche.
5. Typographies et palette : continuité du système ci-dessus, photos et matériaux aux tons pin, calcaire et soleil.
6. Médias : quatre images fixes générées, mode illustratif. La narration animée appartient au DOM ; aucune transformation filmée ou promesse de carte réelle.
7. Différenciation et mouvement : quartier miniature comme repère visuel, rythme différent à chaque scène, maintien des formulaires et CTA hors de toute entrée retardée.

Les leviers de conversion sont la reconnaissance des besoins, une promesse précise, l’aperçu concret du résultat, l’explication des étapes, la réduction de l’incertitude et les CTA adaptés aux deux intentions. La barre mobile contextuelle prend le relais après le hero et s’efface devant l’appel final. Aucune urgence, statistique, preuve sociale ou gratuité n’est inventée. Une hausse de conversion devra être mesurée après déploiement.

Les assets et leurs prompts sont consignés dans `home-media-assets.md`.
