# TunHire

**TunHire** est une plateforme de recrutement intelligente qui met en relation candidats et recruteurs en Tunisie. Les candidats déposent un CV PDF et postulent aux offres ; les recruteurs gèrent leur entreprise, publient des offres, classent les candidatures grâce à un score IA hybride et communiquent en temps réel.

Projet réalisé dans le cadre d'un **Projet de Fin d'Études** à l'**ISET Bizerte**, en partenariat avec **RIF Tunisie**.

## Fonctionnalités

### Côté candidat
- Inscription / connexion (JWT)
- Consultation des offres ouvertes (liste publique avec pagination)
- Import d'un **CV PDF** — compétences et champs de profil extraits via Groq (LLaMA 3.3)
- Gestion du profil et des compétences
- Candidature aux offres et suivi du statut
- Messagerie temps réel avec les recruteurs

### Côté recruteur
- Création et gestion d'un **espace entreprise**
- Invitation des membres d'équipe (`RECRUITER_ADMIN` / `MEMBER`)
- Publication et cycle de vie des offres (`DRAFT` → `OPEN` → `CLOSED`)
- Consultation des candidatures et mise à jour du statut (`SUBMITTED`, `IN_REVIEW`, `SHORTLISTED`, `REJECTED`)
- **Classement IA** — score de compatibilité hybride (SBERT + règles métier + Groq)
- Scores mis en cache dans `application_match_scores` (recalcul si l'offre ou le profil change)
- Tableau de bord, notifications, chat WebSocket

## Architecture

```
┌─────────────┐     REST + WebSocket (JWT)     ┌──────────────────┐
│   Next.js   │ ─────────────────────────────► │   core-service   │
│  frontend   │                                │  (Spring Boot)   │
└─────────────┘                                └────────┬─────────┘
                                                        │ REST
                                                        ▼
                                               ┌──────────────────┐
                                               │    ai-service    │
                                               │    (FastAPI)     │
                                               │  SBERT + Groq    │
                                               └──────────────────┘

                        ┌──────────────────┐
                        │   PostgreSQL     │  ← core-service uniquement
                        └──────────────────┘
```

| Service | Rôle | Port par défaut (dev local) |
|---------|------|-----------------------------|
| `frontend` | Interface Next.js / React | `3000` |
| `core-service` | Logique métier, auth, persistance | `8181` |
| `ai-service` | Parsing CV, matching, classement | `8000` |
| PostgreSQL | Base de données | `15432` (hôte) |

Le microservice IA est **stateless** — il ne se connecte pas à PostgreSQL. Le core-service l'appelle en HTTP et persiste les résultats (y compris les scores de matching).

## Stack technique

| Couche | Technologies |
|--------|----------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, STOMP/WebSocket |
| Backend | Java 21, Spring Boot 3.4, Spring Security, Spring Modulith, JPA, PostgreSQL |
| Service IA | Python, FastAPI, pdfplumber, Sentence Transformers (SBERT), API Groq |
| Authentification | JWT (stateless), BCrypt |
| DevOps | Docker Compose (optionnel), Maven, npm |

## Structure du projet

```
TunHire_fork/
├── frontend/          # Interface Next.js (App Router)
├── core-service/      # Monolithe modulaire Spring Boot
│   ├── src/main/java/com/tunhire/tunhire/
│   │   ├── auth/
│   │   ├── candidate/
│   │   ├── companies/
│   │   ├── job_offers/
│   │   ├── applications/
│   │   ├── chat/
│   │   └── notifications/
│   └── compose.yaml   # PostgreSQL + image app optionnelle
├── ai-service/        # FastAPI — parsing CV + match/rank v2
└── README.md
```

## Prérequis

- **Java 21** + Maven (ou `./mvnw` dans `core-service`)
- **Node.js 18+**
- **Python 3.10+**
- **Docker** (pour PostgreSQL via Compose)
- **Clé API Groq** — [console.groq.com](https://console.groq.com/) (parsing CV et scoring LLM)

## Démarrage rapide (développement local)

### 1. Base de données

```bash
cd core-service
docker compose up -d postgres
```

PostgreSQL écoute sur **`localhost:15432`** (utilisateur / mot de passe / base : `tunhire` / `tunhire` / `tunhire`).

### 2. Service IA

```bash
cd ai-service
python -m pip install -r requirements.txt
copy .env.example .env    # Windows
# Renseigner GROQ_API_KEY dans .env

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Santé du service : http://127.0.0.1:8000/health

Au premier lancement, le modèle SBERT se télécharge une fois (~400 Mo).

### 3. Core service

```bash
cd core-service
copy .env.example .env    # optionnel — les valeurs par défaut fonctionnent avec Compose

./mvnw spring-boot:run    # Linux/macOS
# ou : mvnw.cmd spring-boot:run   # Windows
```

API : http://localhost:8181

### 4. Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Application : http://localhost:3000

Définir `NEXT_PUBLIC_API_URL=http://localhost:8181` dans `.env.local`.

### Ordre de démarrage

1. PostgreSQL  
2. `ai-service` (port 8000)  
3. `core-service` (port 8181)  
4. `frontend` (port 3000)

## Variables d'environnement

### `core-service`

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `SPRING_DATASOURCE_URL` | URL JDBC | `jdbc:postgresql://localhost:15432/tunhire` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Identifiants BDD | `tunhire` |
| `JWT_SECRET` | Clé de signature (≥ 32 caractères) | voir `application.properties` |
| `ai.service.url` | URL du service IA | `http://localhost:8000` |

### `ai-service`

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Requis pour le parsing CV et le ranking LLM |
| `SCORER_MODE` | `hybrid` (défaut), `embedding` ou `llm` |
| `SCORER_EMBED_WEIGHT` / `LLM` / `RULES` | Pondération hybride (défaut 0,4 / 0,4 / 0,2) |

### `frontend`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API core (`http://localhost:8181`) |

## API principale

| Domaine | Exemples |
|---------|----------|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Offres | `GET /jobs` (public), `POST /jobs` (recruteur) |
| Candidat | `GET /candidates/me`, `POST /candidates/me/cv/parse` |
| Candidatures | `POST /applications`, `GET /applications/job/{jobId}/ranked` |
| Entreprises | `POST /companies`, invitations, équipe, tableau de bord |
| Chat | REST + WebSocket (STOMP) |
| IA (direct) | `POST /v1/cv/parse`, `POST /v2/match`, `POST /v2/rank` |

## Rôles utilisateurs

| Rôle | Périmètre |
|------|-----------|
| `CANDIDATE` | Profil, candidatures, chat |
| `RECRUITER` | Entreprises, offres, candidats, classement |
| `RECRUITER_ADMIN` | Admin entreprise (équipe, paramètres) |
| `MEMBER` | Membre entreprise (offres et candidatures) |

## Pipeline de scoring (résumé)

1. **CV** — PDF → pdfplumber → Groq → profil structuré  
2. **Matching** — textes composites offre/profil → similarité cosinus SBERT  
3. **Règles** — niveau d'expérience, localisation, complétude du profil  
4. **Groq** — évaluation LLM optionnelle  
5. **Blend** — `0,4×embed + 0,4×LLM + 0,2×rules` (ou `0,7×embed + 0,3×rules` sans Groq)  
6. **Cache** — scores stockés par candidature dans PostgreSQL ; invalidation si offre, profil ou version du scorer change  

## Docker (core + base de données)

Pour lancer le core-service packagé avec Postgres :

```bash
cd core-service
docker compose up -d
```

L'image applicative est exposée sur le **port 8081** (port 8080 dans le conteneur). Adapter `NEXT_PUBLIC_API_URL` en conséquence si vous utilisez ce mode plutôt que Maven en local.

## Documentation complémentaire

- [`frontend/README.md`](frontend/README.md) — routes, architecture frontend, scénarios de test  
- [`ai-service/README.md`](ai-service/README.md) — endpoints IA et dépannage  
- [`core-service/chat-arch.md`](core-service/chat-arch.md) — modules backend et notes API  

## Licence

Projet académique — consulter le propriétaire du dépôt pour les conditions d'utilisation.
