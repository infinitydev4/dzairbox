# Onboarding et studio DzairBox V1

## Parcours livré

1. Compte : nom, email et mot de passe ; un compte connecté est reconnu.
2. Activité : nom et catégorie principale.
3. Localisation et téléphone : établissement public ou zone d’intervention sans adresse personnelle.
4. Confirmation : création atomique du compte et de l’activité, ouverture d’une session puis redirection vers `/dashboard/businesses/[id]/studio`.

L’inscription ne crée aucune configuration publiée. Le brouillon local exclut le mot de passe. Un identifiant stable permet de reprendre une création après une réponse réseau perdue. L’échec de livraison d’email n’empêche pas l’ouverture du studio.

## Studio

Le professionnel complète son contenu, ses services avec tarifs DZD facultatifs, galerie et textes alternatifs, horaires/rendez-vous, contacts et FAQ. Les trois designs, palettes et associations typographiques partagent le même document. L’aperçu et la page publique utilisent `StudioCanvas`. Les sections facultatives sont masquables et réordonnables ; aucun placement libre.

Sauvegarde automatique avec numéro de révision, secours local, détection des conflits, annuler/rétablir dans la session. Sur mobile : section par section, aperçu accessible à tout moment. Sami, la checklist et les conseils accompagnent l’édition. Interface FR/AR, RTL, contenu dans sa langue d’origine si la seconde version manque, animations réduites selon les préférences système.

## Publication

La vérification email et la validation administrative sont indépendantes. Un compte non vérifié prépare ses brouillons et médias. Une fiche standard peut être approuvée sans page personnalisée. Une demande de publication conserve un instantané distinct du brouillon ; une approbation publie cet instantané précis. Les modifications sensibles passent de nouveau en validation tout en conservant la version publique précédente. Une suspension retire l’activité des pages publiques, résultats, carte et sitemap.

Les anciennes URL restent accessibles. La première ouverture du studio convertit la configuration historique pour l’édition sans modifier la version publique. Les anciennes routes d’édition ne peuvent pas publier en dehors du studio.

## Charte

Vert profond #103832, vert #17745f, ivoire #f7f6f0, bleu #b9dce3 et jaune #f6c96b. Geist, Inter et Noto Sans Arabic. Les sources et assets du guide sont conservés ci-dessous.

## Assets générés

Outil : image_gen intégré, avec fond transparent. Les fichiers WebP conservent l’alpha et sont utilisés par Next Image. Les PNG sont conservés comme sources.

- /Users/ruby/Developer/Projets/dzairbox/dzairbox/public/images/onboarding/sami-guide.webp (720 × 1080, environ 84 Ko)
- /Users/ruby/Developer/Projets/dzairbox/dzairbox/public/images/onboarding/sami-success.webp (720 × 1080, environ 75 Ko)
- Sources : public/images/onboarding/sami-guide.png et sami-success.png.
- Les miniatures de mise en page et les éléments graphiques sont créés en CSS et Lucide.

### Prompt de création

Use case: stylized-concept. Asset type: transparent character illustration for DzairBox's guided business onboarding, Algeria. Create a single charming professional male Algerian business concierge, about 35, olive skin, neatly groomed dark hair and short beard, wearing a beautifully tailored deep forest green suit (#103832), ivory shirt and a restrained ochre tie (#f6c96b). Friendly confident smile, expressive warm eyes. Premium tactile 3D clay editorial illustration with sophisticated proportions, gently oversized head, soft smooth matte materials and beautifully modeled fabric, not cheap cartoon. Three-quarter body portrait from head to upper thighs, facing slightly to viewer's right, one hand open in welcoming guidance gesture, other holding a slim light blue business folder. Entire head and hands fully in frame, centered, generous transparent padding. Soft directional studio lighting. Isolated cutout on genuinely transparent background. No scene, no floor, no lettering, no watermark. Crisp production website character art.

### Prompt de variation

Référence : sami-guide.png.

Edit the referenced image to make a second pose of exactly the same DzairBox concierge character, Sami. Use case: identity-preserve. Asset type: transparent onboarding success character. Keep his exact face, age, olive skin, dark hair, beard, forest green tailored suit, ivory shirt, golden ochre tie, blue folder, and premium matte tactile 3D editorial illustration rendering. Change only his welcoming open right hand to a clear, natural thumbs-up gesture with anatomically correct fingers. Make his smile slightly broader, warm and proud, acknowledging successful creation of a business page. Keep the same three-quarter body framing, fully visible head and hands, same proportions, camera and lighting. Preserve genuinely transparent background and alpha, no scenery, no text or logos. No other objects.


## Vérification et exploitation

Voir [studio-v1.md](studio-v1.md) pour les tests, la migration et les conditions de mise en production.
