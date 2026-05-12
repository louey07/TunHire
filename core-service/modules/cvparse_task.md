# TunHire — AI Service

#### Module CV Parsing — Cahier des Charges

```
Module CV Parsing — FastAPI AI Service
```
```
Développeur assigné Abdelhak
```
```
Langage / Framework Python 3.11+ / FastAPI
```
```
Bibliothèques principales pdfplumber, python-docx, spaCy (fr_core_news_md), sentence-
transformers
```
```
CVs de test fournis 5 fichiers PDF (développeurs tunisiens, français)
```
```
Endpoint principal POST /v1/cv/parse
```
```
Priorité HAUTE — bloque le matching et le ranking
```
## 1. Contexte et Objectif

Le service de parsing de CV est la pierre angulaire du service IA de TunHire. Sans lui, ni le matching
sémantique ni le ranking des candidats ne peuvent fonctionner.

Ton travail consiste à construire un endpoint FastAPI qui :

- Reçoit un fichier CV (PDF ou DOCX)
- Extrait le texte proprement
- Identifie et structure les informations clés (nom, email, compétences, expérience, formation)
- Retourne un JSON structuré exploitable par le reste du service IA

⚠️ Important : Le parsing doit fonctionner sur des CVs réels en français. Les 5 CVs de test fournis sont des
profils de développeurs tunisiens — c'est ton jeu de données de validation.

## 2. CVs de Test Fournis

Tu reçois 5 CVs PDF générés spécifiquement pour ce projet. Voici ce qu'ils contiennent :

```
Fichier Profil Exp. Compétences principales
```
cv_ahmed_bensalah.pdf (^) Full Stack Java/Angular 4 ans Java, Spring Boot, Angular, Docker
cv_sarra_trabelsi.pdf (^) Backend Python/Django 3 ans Python, Django, FastAPI, Pandas
cv_amine_gharbi.pdf (^) DevOps / Cloud 5 ans AWS, Kubernetes, Terraform,
Jenkins
cv_youssef_hammami.pdf (^) Mobile React Native /
Flutter
2.5 ans React Native, Flutter, Firebase
cv_nour_mansouri.pdf (^) Data Scientist / ML 3 ans BERT, spaCy, MLflow, PyTorch

## 3. Ce Que Tu Dois Faire

### 3.1 Setup du projet FastAPI

- Créer la structure du projet FastAPI dans /ai-service/


- Installer les dépendances : pdfplumber, python-docx, spaCy, fastapi, uvicorn, pydantic
- Télécharger le modèle spaCy français : python -m spacy download fr_core_news_md
- Lancer sur le port 8000

### 3.2 Extraction du texte brut

Pour chaque CV reçu, extraire le texte selon le format :

- PDF → utiliser pdfplumber : pdf.pages[i].extract_text()
- DOCX → utiliser python-docx : paragraphs + tables
- Concaténer toutes les pages en un seul bloc de texte
- Nettoyer : supprimer les espaces multiples, lignes vides consécutives

⚠️ Ne pas utiliser PyPDF 2 — il rate beaucoup de textes. Utiliser uniquement pdfplumber.

### 3.3 Parsing structuré — Ce qu'il faut extraire

À partir du texte brut, tu dois extraire les 7 champs suivants :

```
Champ Type Comment l'extraire
```
full_name string (^) Première ligne non-vide du texte, ou regex sur les lignes du haut
email string (^) Regex : [\w.+-]+@[\w-]+\.[\w.]+ — toujours présent
phone string | null (^) Regex : +216 suivi de 8 chiffres, ou format international
location string | null (^) Chercher après 'Tunis', 'Sfax', 'Sousse' ou ligne avec ville + pays
years_experience int (^) Regex sur 'X ans d\'expérience' ou calculer depuis dates emploi
skills list[string] (^) Section 'COMPETENCES' ou 'SKILLS' — splitter par virgule/saut
de ligne
education list[Education] (^) Section 'FORMATION' — extraire diplôme + école + dates

### 3.4 L'endpoint FastAPI

Tu dois implémenter exactement cet endpoint :

POST /v1/cv/parse

Content-Type: multipart/form-data

Body: file (UploadFile) — PDF ou DOCX

Structure de la réponse attendue (Pydantic) :

##### {

"candidate_id": "string | null",
"full_name": "string",
"email": "string",
"phone": "string | null",
"location": "string | null",
"years_experience": 0,
"skills": ["string"],
"education": [
{
"degree": "string",
"school": "string",
"dates": "string",
"mention": "string | null"
}


##### ],

"raw_text": "string",
"parser_version": "1.0.0",
"confidence_score": 0.
}

## 4. Résultat Attendu — Ground Truth

Voici exactement ce que ton parser doit retourner pour chacun des 5 CVs. C'est ta référence de validation.

#### CV 1 — Ahmed Ben Salah

##### {

"full_name": "Ahmed Ben Salah",
"email": "ahmed.bensalah@gmail.com",
"phone": "+216 55 123 456",
"location": "Tunis, Tunisie",
"years_experience": 4,
"skills": ["Java 17", "Spring Boot", "Angular 14", "TypeScript", "PostgreSQL",
"MySQL", "MongoDB", "Docker", "Jenkins", "Git", "Maven"],
"education": [
{
"degree": "Diplôme National d'Ingénieur en Informatique",
"school": "ESPRIT",
"dates": "2016 – 2020",
"mention": "Mention Bien"
}
],
"confidence_score": >= 0.
}

#### CV 2 — Sarra Trabelsi

##### {

"full_name": "Sarra Trabelsi",
"email": "sarra.trabelsi@outlook.com",
"phone": "+216 22 987 654",
"location": "Sfax, Tunisie",
"years_experience": 3,
"skills": ["Python", "Django", "Django REST Framework", "FastAPI",
"Pandas", "NumPy", "scikit-learn", "PostgreSQL", "Docker"],
"education": [
{
"degree": "Licence en Informatique Appliquée",
"school": "Faculté des Sciences de Sfax",
"dates": "2017 – 2021",
"mention": "Mention Très Bien"
}
],
"confidence_score": >= 0.
}

#### CV 3 — Mohamed Amine Gharbi

##### {

"full_name": "Mohamed Amine Gharbi",
"email": "amine.gharbi@gmail.com",
"phone": "+216 98 456 789",
"location": "Sousse, Tunisie",
"years_experience": 5,
"skills": ["AWS", "Kubernetes", "Docker", "Terraform", "Ansible",
"Jenkins", "GitLab CI", "Prometheus", "Grafana", "Python", "Bash"],
"education": [
{
"degree": "Diplôme d'Ingénieur en Réseaux et Télécommunications",
"school": "SUP'COM",


"dates": "2014 – 2019",
"mention": null
}
],
"confidence_score": >= 0.
}

#### CV 4 — Youssef Hammami

##### {

"full_name": "Youssef Hammami",
"email": "youssef.hammami@protonmail.com",
"phone": "+216 50 321 987",
"location": "Tunis, Tunisie",
"years_experience": 2,
"skills": ["React Native", "Flutter", "Expo", "Dart", "React.js",
"TypeScript", "Node.js", "Firebase", "Git", "Figma"],
"education": [
{
"degree": "Licence en Génie Logiciel",
"school": "ISET Rades",
"dates": "2018 – 2021",
"mention": "Mention Bien"
}
],
"confidence_score": >= 0.
}

#### CV 5 — Nour El Houda Mansouri

##### {

"full_name": "Nour El Houda Mansouri",
"email": "nour.mansouri@gmail.com",
"phone": "+216 27 654 321",
"location": "Tunis, Tunisie",
"years_experience": 3,
"skills": ["Python", "scikit-learn", "TensorFlow", "PyTorch", "BERT",
"spaCy", "sentence-transformers", "FastAPI", "MLflow", "Docker"],
"education": [
{
"degree": "Master en Data Science et Intelligence Artificielle",
"school": "ENSI",
"dates": "2019 – 2021",
"mention": "Major de promotion"
},
{
"degree": "Licence en Mathématiques Appliquées et Informatique",
"school": "Faculté des Sciences de Tunis",
"dates": "2 016 – 2019",
"mention": null
}
],
"confidence_score": >= 0.
}

## 5. Critères de Validation

Ton parsing est considéré réussi si et seulement si :

```
Critère Seuil minimum Objectif PFE
```
```
Email extrait correctement 5/5 CVs 5/5 CVs
Nom complet extrait correctement 4/5 CVs 5/5 CVs
```
```
Téléphone extrait correctement 4/5 CVs 5/5 CVs
```

```
Localisation correcte 3/5 CVs 5/5 CVs
```
```
Années d'expérience correctes (±1 an) 4/5 CVs 5/5 CVs
Au moins 5 compétences correctes par CV 4/5 CVs 5/5 CVs
```
```
Au moins 1 formation correcte par CV 4/5 CVs 5/5 CVs
confidence_score >= 0.70 4/5 CVs 5/5 CVs
```
## 6. Livrables Attendus

Quand tu as fini, tu envoies :

- Le code Python du parser (fichier cv_parser.py ou équivalent)
- Le fichier main.py avec l'endpoint FastAPI fonctionnel
- Un fichier requirements.txt avec toutes les dépendances
- Les 5 JSONs de résultats — un fichier par CV, nommés result_ahmed.json, result_sarra.json, etc.
- Un fichier scores.txt avec tes scores de validation par critère

Si un champ n'est pas trouvé dans le CV, retourner null — jamais une string vide. Si le confidence_score
est < 0.60, logger un warning.

## 7. Stack et Commandes Utiles

pip install fastapi uvicorn pdfplumber python-docx spacy pydantic

python -m spacy download fr_core_news_md

uvicorn main:app --reload --port 8000

# Tester l'endpoint :

curl -X POST [http://localhost:8000/v1/cv/parse](http://localhost:8000/v1/cv/parse) \

- F 'file=@cv_ahmed_bensalah.pdf'

```
TunHire — Bonne chance!
```

