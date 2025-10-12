## Objectif

Ce projet suit une architecture claire, modulaire et maintenable, inspirée de Spring Boot / Maven, adaptée à un environnement Node.js / JavaScript.
Les principes SOLID et ACID doivent être respectés partout.

## Structure du projet

```bash
root/
│
├── src/
│   ├── components/       # Composants réutilisables (UI, helpers, etc.)
│   ├── controllers/      # Gestion des routes et logique de contrôle
│   ├── services/         # Logique métier et intégrations externes
│   ├── middlewares/      # Middlewares Express ou similaires
│   ├── models/           # Modèles de données et ORM (ex: Prisma, Sequelize)
│   ├── routes/           # Définition des endpoints API
│   ├── utils/            # Fonctions utilitaires pures et testables
│   └── index.js/         # Point d’entrée de l’application
│
├── test/                 # Tests unitaires, d’intégration, E2E
│
├── migrations/           # Scripts SQL et migration de schéma
│
├── docker/
│   └── docker-compose.yml
│
├── .env.example          # Variables d’environnement (jamais commit le vrai .env)
├── CONTRIBUTING.md
└── README.md
```

## Principes de code

### Syntaxe et style
* Utiliser `const` par défaut, `let` si réassignation, jamais `var`
* Utiliser les fonctions fléchées sauf si le `this` du contexte est nécessaire
* Préférer `forEach`, `map`, `filter`, `reduce`, à `for` ou `while`
* Utiliser la déstructuration `(const { id, name } = obj)`
* Ne pas imbriquer les ternaires — lisibilité avant tout
* Utiliser des fonctions pures autant que possible
* Préférer la création d’un nouvel objet/tableau plutôt que la mutation directe

```js
const updatedList = [...list, newItem]; // ✅
list.push(newItem); // ❌
```

### Organisation du code
* Une classe par responsabilité (ex: UserService, UserController)
* Une fonction = une tâche précise
* Les controllers ne contiennent pas de logique métier
* Les services ne contiennent pas de logique de présentation
* Les middlewares doivent être réutilisables (auth, validation, etc.)
* Le code doit être testable sans environnement externe (mock DB ou API)

## Principes d'architecture

### SOLID
1. Single Responsibility → une classe = une seule responsabilité
2. Open/Closed → extensible sans modification du code existant
3. Liskov Substitution → toute classe fille doit pouvoir remplacer la classe mère
4. Interface Segregation → éviter les interfaces trop lourdes
5. Dependency Inversion → dépendre d’abstractions, pas d’implémentations concrètes

### ACID (pour la base de données)
1. Atomicité → toute transaction est un tout indivisible
2. Cohérence → l’état reste valide après chaque transaction
3. Isolation → les transactions concurrentes ne se parasitent pas
4. Durabilité → les changements validés sont persistants

## Bonnes pratiques générales
* Documenter les fonctions publiques avec JSDoc
* Isoler toute dépendance externe (API, DB) dans des services dédiés
* Centraliser les erreurs dans un middleware de gestion d’erreurs
* Utiliser un fichier .env et jamais de variables en dur
* Gérer les connexions base de données via un pool
* Écrire un test unitaire pour chaque méthode critique
* Respecter le principe de moindre surprise : le code doit être prévisible

## Tests
* Les tests doivent suivre la pyramide des tests :
  * Unit test -> 60 %
  * Integration test -> 20 %
  * E2E tests -> 10 %
* Un test unitaire doit être indépendant, rapide et isolé
* Nommer les test clairesment : `should_doSomething_when_condition`
* Exemples
```bash
test/
├── unit/
├── integration/
└── e2e/
```

## Outils
* Lint : ESLint + Prettier
* Tests : Jest, Mocha ou Vitest
* ORM : pas d'ORM
* Server : Express.js
* Env : dotenv
* Containerisation : Docker avec volume et .env partagé

## Règles pour Continue
* Continue doit communiquer en français, mais ne traduit pas les termes techniques
* Il doit poser des questions en cas de doute
* Il ne doit pas inventer ni halluciner de dépendance
* Il vérifie le contexte du projet avant de générer du code
* Il doit respecter cette architecture et ces conventions à chaque génération

### Exemple de nommage
|Type|Convention d’écriture|Exemple|
|---|---|---|---|
|Dossier / Fichier|kebab-case|user-controller.js|
|Classe|PascalCase|UserService|
|Variable|camelCase|userRepository|
|Constante globale|UPPER_SNAKE_CASE|MAX_RETRY_COUNT|

## Workflow de commits

### Types autorisés

|Type|Description|
|---|---|
|feature/<US ##><nom_de_la_feature>| nouvelle fonctionnalité|
|fix/<nom>| correction de bug|
|docs|mise à jour de documentation|
|syle|changement de formatage (aucune logique modifiée)|
|refactor|amélioration du code sans nouvelle fonctionnalité|
|test| ajout ou modification de tests seuls|

#### Exemples
```bash
feature/US2_Authentification : ajout de l'authentification
fix/arrondi : correction d'une fonction
docs/contributing : ajout des règles pour continue
refactor/UserService : simplification de la logique métier
```

Les commits déclenchent automatiquement:
* les tests unitaires
* le lint
* l'analyse statique Continue
* l'actualisation du board github project

## Recommandations Docker et Environnement
* la base de données tourne dans un conteneur Docker avec un volume nommé :
  * `db_data:/var/lib/postgresql/data`
* les credentials et autres variables d'environnement sont définis dans le fichier .env
* L'application lit ces valeurs au runtime :
```bash
DATABASE_URL=postgresql://user:password@db:5432/batala-vitrine
NODE_ENV=development
PORT=3000
```

Soumis à relecture et amélioration continue au fil du développement. 