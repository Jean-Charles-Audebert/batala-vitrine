# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Aller au contenu principal" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - heading "Connexion" [level=1] [ref=e4]
    - alert [ref=e5]: Identifiants invalides.
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]: Email
        - textbox "Email" [active] [ref=e9]
      - generic [ref=e10]:
        - generic [ref=e11]: Mot de passe
        - textbox "Mot de passe" [ref=e12]
      - button "Se connecter" [ref=e13] [cursor=pointer]
    - link "← Retour à l'accueil" [ref=e15] [cursor=pointer]:
      - /url: /
```