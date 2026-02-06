# Configuration Resend pour l'envoi d'emails

## Étapes de configuration

### 1. Créer un compte Resend
- Allez sur https://resend.com
- Créez un compte gratuit (100 emails/jour)

### 2. Obtenir votre clé API
- Connectez-vous à votre dashboard Resend
- Allez dans "API Keys"
- Créez une nouvelle clé API
- Copiez la clé

### 3. Configurer le domaine d'envoi
- Dans Resend, allez dans "Domains"
- Ajoutez votre domaine `dzairbox.com`
- Configurez les enregistrements DNS (SPF, DKIM, DMARC)
- Attendez la vérification

### 4. Ajouter la clé dans .env
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### 5. En développement (sans domaine vérifié)
Le code est déjà configuré pour utiliser automatiquement :
- En développement : `onboarding@resend.dev` (email de test Resend)
- En production : `noreply@dzairbox.com` (votre domaine vérifié)

## Fonctionnalités implémentées

### ✅ Email de vérification lors de l'inscription
- Envoi automatique après création de compte
- Token sécurisé avec expiration 24h
- Template HTML moderne avec logo DzairBox

### ✅ Vérification obligatoire pour se connecter
- Impossible de se connecter sans email vérifié
- Message d'erreur explicite

### ✅ Renvoi d'email de vérification
- Bouton pour renvoyer l'email depuis la page de connexion
- Suppression des anciens tokens avant création d'un nouveau

### ✅ Page de vérification
- Page dédiée `/auth/verify-email`
- Validation du token
- Redirection automatique vers connexion

## Structure des fichiers

```
/lib/email.ts                              # Service d'envoi d'emails
/app/auth/verify-email/page.tsx            # Page de vérification
/app/api/auth/verify-email/route.ts        # API validation token
/app/api/auth/resend-verification/route.ts # API renvoi email
/app/api/auth/register/route.ts            # Modifié pour envoyer email
/app/api/auth/register-with-business/route.ts # Modifié pour envoyer email
/lib/auth.ts                               # Modifié pour vérifier email
```

## Template email

Le template inclut :
- Logo DzairBox
- Design moderne avec gradient vert
- Bouton CTA principal
- Lien alternatif si bouton ne fonctionne pas
- Avertissement de sécurité
- Footer avec liens sociaux
- Responsive pour mobile

## Production

Pour la production sur Netlify :
1. Ajoutez `RESEND_API_KEY` dans les variables d'environnement Netlify
2. Configurez le domaine `dzairbox.com` vérifié dans Resend
3. Mettez à jour `NEXTAUTH_URL` avec l'URL de production (`https://dzairbox.com`)
4. Le logo doit être accessible à `https://dzairbox.com/logo-dzairbox.png`
