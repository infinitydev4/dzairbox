# DzairBox V1 — implémentation et exploitation

## Données

- `Business` : profil canonique approuvé, implantation structurée, état de modération, demande de modification sensible et index de recherche normalisé.
- `BusinessPageConfig` : document V2 partagé par l’éditeur et le rendu, brouillon, révision, version soumise et instantané public.
- `BusinessMedia` : objet S3 privé associé au propriétaire et à son activité ; adresse stable `/api/media/[id]`, accès public uniquement si référencé dans une page publique approuvée.
- `BusinessEvent` : compteurs journaliers de vues et clics de contact ; événements d’inscription, d’arrivée au studio et de demande de publication. Ce sont des clics, pas des appels aboutis ou clients acquis.

`lib/studio/document.ts` valide les documents et prépare un registre de sections versionnées. Les futures générations IA devront utiliser ce contrat et créer un brouillon. Aucun générateur IA ni connecteur API/MCP n’est activé en V1.

Les sauvegardes et décisions de modération verrouillent la même activité en transaction. Un numéro de révision périmé produit HTTP 409, sans écraser le brouillon d’un autre onglet. Les droits sont contrôlés côté serveur. La session relit le statut de vérification email ; son actualisation conserve l’éditeur ouvert.

## Routes

| Usage | Route |
| --- | --- |
| Inscription courte | `/create-service`, `POST /api/onboarding` |
| Activités du propriétaire | `/dashboard/businesses` |
| Studio privé | `/dashboard/businesses/[id]/studio` |
| Lecture / sauvegarde / publication | `GET / PUT /api/businesses/[id]/studio` |
| Recherche filtrée paginée | `/businesses`, `/api/directory` |
| Référentiel | `/api/locations?wilaya=16` |
| Média stable | `/api/media/[id]` |
| Modération | `/admin/businesses`, `PATCH /api/admin/businesses/[id]` |
| URL publique historique | `/[subdomain]` |

La recherche conserve les filtres dans l’URL. Les positions des communes sont signalées comme approximatives. Une activité mobile n’affiche aucun domicile ni itinéraire privé. Le visiteur autorise sa géolocalisation uniquement via « Autour de moi ». L’échec de Google Maps conserve les résultats en liste.

## Installation et migration

1. Sauvegarder la base de production.
2. Déployer les migrations avec `npx prisma migrate deploy` et régénérer Prisma. La migration additive `20261024000000_studio_v1` conserve les URL, configurations et états des activités existantes ; les activités précédemment actives sont considérées approuvées.
3. Exécuter `node scripts/backfill-studio.cjs` pour enrichir les anciens index de recherche bilingues. Le script ne déduit aucune commune ou wilaya d’une adresse libre et ne remplace aucun contenu public.
4. Démarrer l’application et contrôler une ancienne page, une fiche standard et une publication V2.

La migration et le backfill ont été appliqués à la base locale pendant le développement. La production n’a pas été déployée par cette intervention.

## Variables et services

Conserver les variables existantes PostgreSQL/NextAuth, Resend, S3 et `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. La clé Google doit autoriser les domaines de déploiement et les API réellement utilisées. `GOOGLE_MAPS_SERVER_API_KEY`, facultative et réservée au serveur, permet le renouvellement du géocodage ; sa restriction doit être adaptée au serveur. Aucun secret n’est envoyé au navigateur en dehors de la clé Maps publique déjà prévue pour cet usage.

Les uploads acceptent JPEG/PNG/WebP, 5 Mo maximum. Le serveur vérifie le décodage, retire les métadonnées et produit du WebP. La reprise réessaie le fichier complet ; le transfert n’est pas multipart. Le préfixe S3 `private/business-media/` doit rester privé dans la politique du bucket. Les nouvelles images sont stockées sous ce préfixe, sans ACL publique et délivrées par l’endpoint stable. Les anciennes URL sont conservées pour compatibilité.

### Cache Google

Les points saisis manuellement, points de communes et résultats de géocodage ont une provenance distincte. Les résultats Google portent une expiration à 29 jours maximum, ne sont plus exposés une fois expirés et sont retirés des profils, brouillons, versions soumises et instantanés publics par `purgeExpiredGeocodes`.

`netlify/functions/expire-geocodes.mjs` exécute cette purge chaque heure sur le déploiement Netlify de production. Les variables de connexion PostgreSQL doivent aussi être accessibles aux Functions. Sur un autre hébergeur, programmer cette même fonction au moins quotidiennement. La carte renouvelle au plus cinq caches expirés par requête en parallèle, avec délai maximal de trois secondes et reprise ultérieure ; les centres de communes restent disponibles en cas d’échec. L’absence de clé serveur exploitable conserve ce repli approximatif.

Références : [conditions du géocodage](https://cloud.google.com/maps-platform/terms/maps-service-terms#6.-geocoding-api), [fonctions planifiées Netlify](https://docs.netlify.com/build/functions/scheduled-functions/). Le référentiel géographique et ses sources sont décrits dans `data/locations/README.md`.

## Vérifications reproductibles

- `npx tsc --noEmit` : contrôle des types.
- `node node_modules/next/dist/bin/next build --webpack` : compilation de production complète, réussie. Le moteur Turbopack échoue dans cet environnement sur l’ouverture de ses ports internes ; aucun changement de moteur n’est imposé au projet.
- ESLint sur les fichiers du studio, de l’annuaire et des nouvelles routes.
- `node --require tsx/cjs --test scripts/test-service-onboarding.cjs` : 10 tests de validation, téléphones, document, migration, recherche FR/AR et protection des adresses privées.
- `node scripts/test-studio-integration.cjs` : scénarios transactionnels sur PostgreSQL local, permissions, conflits, séparation des instantanés, fiche standard, suspension et purge du cache dans toutes les copies.
- `node scripts/test-studio-browser.cjs` : Chrome, véritable connexion non vérifiée, studio, styles, annuler/rétablir, services, FAQ, sauvegarde/rechargement, reprise d’upload, mobile 390/320 px, arabe RTL, vérification, approbation et rendu public.

Les scénarios PostgreSQL et navigateur créent puis retirent leurs propres utilisateurs/activités temporaires et refusent une base distante. L’inscription HTTP du scénario navigateur et l’upload S3 y sont simulés ; l’API d’inscription réelle est vérifiée séparément par les scénarios transactionnels. Aucun email réel n’est envoyé dans ces tests. L’envoi Resend, les restrictions Maps et le stockage S3 doivent être contrôlés avec la configuration de production avant ouverture au public.

## Pilote restant à organiser

Faire utiliser le parcours à cinq professionnels réels, sur téléphone, et mesurer le temps jusqu’à la première page préparée. Objectif : moins de dix minutes hors attente d’email et de modération. Ce test humain ne peut pas être remplacé par les scénarios automatisés.

### Résultat de la validation locale

10 tests de validation, 15 scénarios transactionnels et 8 scénarios navigateur passent. Aucun message d’erreur JavaScript dans le parcours navigateur final. TypeScript, ESLint ciblé et compilation de production Webpack réussissent. `/create-service` répond HTTP 200 après la compilation. Les fixtures de test ont été supprimées.
