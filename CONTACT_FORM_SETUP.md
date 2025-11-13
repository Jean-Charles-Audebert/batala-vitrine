# Configuration du formulaire de contact

Le formulaire de contact dans le footer permet aux visiteurs d'envoyer des messages via email.

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Configuration SMTP
SMTP_HOST=smtp.example.com      # Serveur SMTP (ex: smtp.gmail.com, smtp-relay.brevo.com)
SMTP_PORT=587                    # Port SMTP (587 pour TLS, 465 pour SSL)
SMTP_USER=votre-email@example.com
SMTP_PASS=votre_mot_de_passe

# Email de destination
CONTACT_EMAIL=contact@batala-larochelle.fr  # Adresse qui recevra les messages
```

## Exemples de configuration SMTP

### Gmail - **RECOMMANDÉ** ⭐
Fiable, gratuit, intégration directe avec votre boîte mail personnelle.

**Étapes de configuration :**
1. Activez la validation en 2 étapes sur votre compte Google : https://myaccount.google.com/security
2. Créez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Choisissez "Autre (nom personnalisé)" et entrez "Batala Contact Form"
4. Google génère un mot de passe de 16 caractères - copiez-le

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre_mot_de_passe_application_16_chars
CONTACT_EMAIL=votre-email@gmail.com  # Même adresse pour recevoir les messages
```

### Brevo (ex-Sendinblue)
Gratuit jusqu'à 300 emails/jour.

⚠️ **Attention** : Brevo peut suspendre votre compte si vous faites trop de tests en développement. Privilégiez Gmail ou Ethereal pour les tests.

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=votre-login-brevo
SMTP_PASS=votre_cle_smtp_brevo
CONTACT_EMAIL=votre-email@exemple.com
```

### OVH
```bash
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=votre-email@votredomaine.fr
SMTP_PASS=votre_mot_de_passe
```

## Fonctionnement

1. Un visiteur remplit le formulaire dans le footer (Nom, Prénom, Contact, Message)
2. Le formulaire envoie les données à `/api/contact`
3. Le serveur envoie un email à `CONTACT_EMAIL` avec les informations
4. L'adresse "reply-to" est définie sur le contact fourni par le visiteur

## Test en développement

Pour tester sans vrai serveur SMTP, utilisez un service comme [Ethereal Email](https://ethereal.email/) :

```bash
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=generated-user@ethereal.email
SMTP_PASS=generated-password
CONTACT_EMAIL=test@example.com
```

Les emails ne seront pas vraiment envoyés, mais vous pourrez les visualiser sur ethereal.email.

## Sécurité

- N'ajoutez jamais le fichier `.env` au contrôle de version
- Utilisez des mots de passe d'application pour Gmail (pas votre mot de passe principal)
- Vérifiez que le port SMTP est ouvert sur votre serveur
