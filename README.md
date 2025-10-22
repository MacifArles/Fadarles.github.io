# Fad'Arles - Site Intranet CRC MACIF

## Description du Projet
Site intranet pour le collectif Fad'Arles du Centre de Relation Commercial MACIF d'Arles.
Permet la gestion des informations d'équipe, événements et annonces internes.

## Fonctionnalités Principales
- **Trombinoscope** : Affichage des membres par équipes avec photos et informations
- **Agenda** : Calendrier des anniversaires et événements
- **Blog Événements** : Articles sur les activités du collectif
- **Bonnes Affaires** : Petites annonces entre collègues (authentification requise)
- **Activités Externes** : Annonces d'activités organisées (authentification requise)

## Architecture Technique
- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **Hébergement** : GitHub Pages
- **Stockage** : Fichiers JSON dans le repository GitHub
- **API** : GitHub API pour les modifications de données
- **Design** : Glassmorphing avec couleurs chaudes

## Structure du Repository
```
Fadarles.github.io/
├── index.html (Page d'accueil)
├── css/style.css (Styles principaux)
├── js/
│   ├── main.js (Fonctions principales)
│   ├── auth.js (Authentification)
│   └── data-manager.js (Gestion des données)
├── data/ (Fichiers JSON de données)
│   ├── employees.json (Trombinoscope)
│   ├── events.json (Événements)
│   ├── birthdays.json (Anniversaires)
│   ├── classified-ads.json (Bonnes affaires)
│   └── activities.json (Activités externes)
├── pages/ (Pages secondaires)
└── assets/images/ (Photos du trombinoscope)
```

## Configuration Requise

### Token GitHub Personnel
1. Accéder à Settings > Developer settings > Personal access tokens
2. Créer un token avec permissions "repo" complètes
3. Configurer dans l'interface admin du site

### Administrateurs Autorisés
Liste des emails administrateurs configurée dans `js/data-manager.js`
Modifier la variable `adminEmails` selon les besoins

### URL du Site
Production : https://macifarles.github.io/Fadarles.github.io/

## Maintenance et Modifications

### Ajout de Nouvelles Images
1. Accéder au dossier assets/images via l'interface GitHub
2. Utiliser "Add file" > "Upload files" pour ajouter des photos
3. Format recommandé : JPEG 300x300 pixels maximum

### Modification des Données
- **Consultation libre** : Aucune authentification requise
- **Annonces** : Connexion avec email requis
- **Administration** : Accès restreint aux emails autorisés

### Déploiement
GitHub Pages déploie automatiquement à chaque commit sur la branche main.
Délai de propagation : 5-10 minutes après modification.

## Contact Technique
En cas de problème technique, consulter les logs dans l'onglet Actions du repository.
Les erreurs de chargement sont généralement liées aux chemins de fichiers ou permissions.

## Sécurité
- Ne jamais exposer le token GitHub publiquement
- Renouveler régulièrement les tokens d'accès
- Vérifier les permissions administrateurs périodiquement
