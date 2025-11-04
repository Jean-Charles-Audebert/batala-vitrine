# Référence Icônes SVG Disponibles

> **Toutes les icônes sont monochromes** avec `fill="currentColor"`  
> **Format standard :** `viewBox="0 0 24 24"`, width="24", height="24"

## 🔧 Admin & Actions (13)

| Icône | Fichier | Usage typique |
|-------|---------|---------------|
| ⚙️ | `settings.svg` | Paramètres / Configuration |
| 👤 | `user.svg` | Connexion / Profil utilisateur |
| ✏️ | `edit.svg` | Éditer / Modifier |
| ➕ | `plus.svg` | Ajouter / Créer |
| 🗑️ | `trash.svg` | Supprimer / Effacer |
| 💾 | `save.svg` | Sauvegarder |
| ❌ | `cancel.svg` | Annuler / Fermer (cercle) |
| ⬆️ | `arrow-up.svg` | Monter / Scroll to top |
| ⬇️ | `arrow-down.svg` | Descendre |
| ☰ | `menu.svg` | Menu burger (3 lignes) |
| ✖️ | `close.svg` | Fermer / Close (X) |
| 🎨 | `palette.svg` | Personnaliser couleurs |
| 🖼️ | `image.svg` | Upload image |

## 📱 Réseaux Sociaux Grand Public (14)

| Icône | Fichier | Plateforme |
|-------|---------|------------|
| 📘 | `facebook.svg` | Facebook |
| 📷 | `instagram.svg` | Instagram |
| 💼 | `linkedin.svg` | LinkedIn |
| ▶️ | `youtube.svg` | YouTube |
| 🎵 | `tiktok.svg` | TikTok |
| 🐦 | `twitter.svg` | X (Twitter) |
| 💬 | `whatsapp.svg` | WhatsApp |
| ✈️ | `telegram.svg` | Telegram |
| 📌 | `pinterest.svg` | Pinterest |
| 👻 | `snapchat.svg` | Snapchat |
| 🧵 | `threads.svg` | Threads (Meta) |
| ☁️ | `bluesky.svg` | Bluesky |
| 🐘 | `mastodon.svg` | Mastodon |
| 👽 | `reddit.svg` | Reddit |

## 💼 Outils Professionnels (7)

| Icône | Fichier | Plateforme |
|-------|---------|------------|
| 🎮 | `discord.svg` | Discord |
| 💬 | `slack.svg` | Slack |
| 📞 | `teams.svg` | Microsoft Teams |
| 📹 | `zoom.svg` | Zoom |
| 📞 | `skype.svg` | Skype |
| 🐙 | `github.svg` | GitHub |
| 🦊 | `gitlab.svg` | GitLab |

---

## 🎨 Utilisation dans les templates

### EJS (futur)

```html
<!-- Footer social icons -->
<a href="https://facebook.com/..." class="social-icon">
  <img src="/icons/facebook.svg" alt="Facebook" />
</a>

<!-- Admin action buttons -->
<button class="btn-icon" aria-label="Modifier">
  <img src="/icons/edit.svg" alt="" />
</button>
```

### CSS (contrôle de couleur)

```css
/* Par défaut : gris */
.social-icon img {
  width: 24px;
  height: 24px;
  filter: invert(50%); /* Gris */
  transition: filter 0.3s;
}

/* Hover : couleur d'origine (ou custom) */
.social-icon:hover img {
  filter: none; /* Couleur native ou custom via fill */
}

/* Alternative : utiliser directement fill via inline SVG */
.btn-icon svg {
  fill: currentColor; /* Hérite de la couleur du parent */
}
```

---

## 📦 Chemins d'accès

- **URL publique :** `/icons/nom-fichier.svg`
- **Chemin physique :** `public/icons/nom-fichier.svg`
- **Servi par :** `express.static('public')` dans `src/server.js`

---

## 🔍 Notes

- **Pas de dépendance externe** (Font Awesome, Material Icons, etc.)
- **Optimisé pour le thème** : `currentColor` permet l'adaptation automatique
- **Accessibilité** : Toujours ajouter `alt` (vide si décoratif) ou `aria-label`
- **Performance** : Fichiers légers (~1-2 KB chacun)

---

**Mise à jour :** 04 novembre 2025  
**Total :** 34 icônes disponibles
