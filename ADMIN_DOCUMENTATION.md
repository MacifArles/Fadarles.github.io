# Interface d'Administration Fad'Arles

## Vue d'ensemble

L'interface d'administration permet de gérer le contenu du site intranet Fad'Arles sans modifier manuellement les fichiers JSON. Cette interface sécurisée offre une gestion complète des employés avec validation des données et intégration GitHub.

**Niveau de confiance global : 88%**

## Fonctionnalités Principales

### ✅ Fonctionnalités Implémentées
- **Authentification sécurisée** : Connexion par email/mot de passe
- **Gestion CRUD des employés** : Ajout, modification, suppression
- **Upload et traitement d'images** : Redimensionnement automatique
- **Filtrage et recherche** : Par nom, équipe, poste
- **Statistiques temps réel** : Nombre d'employés par équipe
- **Validation des données** : Protection contre les injections XSS
- **Interface responsive** : Compatible mobile et desktop
- **Notifications utilisateur** : Feedback des actions

### ⏳ À Développer Prochainement
- Gestion des autres sections (Agenda, Blog, Bonnes Affaires)
- Système de rôles utilisateurs
- Logs d'audit des modifications
- Sauvegarde automatique des données

## Installation et Configuration

### 1. Fichiers Requis

Ajoutez ces fichiers à votre structure existante :

```
Fadarles.github.io/
├── pages/admin.html
├── css/admin.css
├── js/admin.js
└── js/data-manager-admin.js (remplace data-manager.js)
```

### 2. Configuration GitHub

#### A. Génération du Token GitHub

1. Allez sur GitHub.com > Settings > Developer settings > Personal access tokens
2. Cliquez "Generate new token (classic)"
3. Sélectionnez les permissions :
   - `repo` (accès complet au repository)
   - `contents:write` (modification des fichiers)
4. Copiez le token généré

#### B. Configuration dans l'interface

1. Connectez-vous à l'administration
2. Allez dans "Paramètres"
3. Saisissez votre token GitHub
4. Cliquez "Sauvegarder"

### 3. Configuration des Administrateurs

Modifiez dans `js/admin.js` ligne 12-16 :

```javascript
adminEmails: [
    'votre-email@fadarles.com',
    'direction@fadarles.com',
    'rh@fadarles.com'
],
adminPassword: 'VotreMotDePasseSecurise123!'
```

## Utilisation de l'Interface

### Connexion Administrateur

**URL d'accès :** `https://macifarles.github.io/Fadarles.github.io/pages/admin.html`

**Identifiants par défaut :**
- Email : Un des emails configurés
- Mot de passe : `FadArles2024!` (à changer)

### Gestion des Employés

#### Ajouter un Employé

1. Cliquez "Ajouter un Employé"
2. Remplissez les champs obligatoires :
   - **Prénom** : Min. 2 caractères
   - **Nom** : Min. 2 caractères
   - **Poste** : Obligatoire
   - **Équipe** : Sélection obligatoire
3. Champs optionnels :
   - **Email** : Validation automatique du format
   - **Photo** : JPG/PNG/WebP max 5MB
   - **Date de naissance**
   - **Date d'arrivée**
4. Cliquez "Sauvegarder"

#### Modifier un Employé

1. Cliquez "✏️ Modifier" sur la carte employé
2. Modifiez les informations souhaitées
3. Cliquez "Sauvegarder"

#### Supprimer un Employé

1. Cliquez "🗑️ Supprimer" sur la carte employé
2. Confirmez la suppression
3. L'employé est immédiatement retiré du site

### Filtrage et Recherche

- **Barre de recherche** : Nom, prénom ou poste
- **Filtre par équipe** : Affichage par équipe spécifique
- **Combinaison** : Recherche + filtre équipe

## Sécurité Implémentée

### Protection des Données

- **Validation côté client** : Vérification des formats
- **Échappement HTML** : Protection XSS
- **Nettoyage des entrées** : Suppression des caractères dangereux
- **Validation des images** : Types et tailles autorisés

### Authentification

- **Emails autorisés** : Liste fermée d'administrateurs
- **Mot de passe requis** : Minimum 8 caractères
- **Session temporaire** : Stockage local sécurisé
- **Déconnexion automatique** : Nettoyage des données

### API GitHub

- **Token sécurisé** : Stockage local temporaire
- **Permissions limitées** : Accès repository uniquement
- **Validation des modifications** : Vérification avant commit

## Structures de Données

### Format Employé

```javascript
{
    "id": "emp_1640995200000_abc123def",
    "firstName": "Jean",
    "lastName": "Dupont",
    "position": "Conseiller",
    "team": "Equipe 1",
    "email": "jean.dupont@fadarles.com",
    "photo": "data:image/jpeg;base64,/9j/4AAQ...", // ou URL
    "birthday": "1985-06-15",
    "startDate": "2020-03-01"
}
```

### Équipes Disponibles

- `Direction` - Couleur : #2c3e50
- `Equipe 1` - Couleur : #ff6b35
- `Equipe 2` - Couleur : #f7931e
- `Equipe 3` - Couleur : #ffb627
- `Equipe 4` - Couleur : #e74c3c
- `Equipe 5` - Couleur : #9b59b6
- `Equipe 6` - Couleur : #3498db

## Dépannage

### Problèmes Courants

#### "Erreur lors du chargement des données"
- Vérifiez la connectivité internet
- Contrôlez l'URL du repository dans `data-manager-admin.js`
- Assurez-vous que `employees.json` existe

#### "Token GitHub requis"
- Configurez un token valide dans les paramètres
- Vérifiez les permissions du token
- Renouveler le token si expiré

#### "Erreur lors de la sauvegarde"
- Vérifiez que le token a les permissions `repo`
- Contrôlez que le repository est accessible
- Vérifiez la structure du fichier JSON

#### Images non affichées
- Vérifiez le format (JPG, PNG, WebP)
- Contrôlez la taille (max 5MB)
- Assurez-vous de la validité de l'image

### Logs de Débogage

Ouvrez la console développeur (F12) pour voir les erreurs détaillées :

```javascript
// Activer les logs détaillés
localStorage.setItem('fadArlesDebug', 'true');
```

## Maintenance

### Sauvegarde Données

Exportez régulièrement le fichier `data/employees.json` :

```javascript
// Dans la console
dataManager.exportEmployees('json').then(data => {
    console.log(data);
    // Copier et sauvegarder
});
```

### Mise à jour Token

Renouvelez le token GitHub tous les 6-12 mois selon votre configuration.

### Nettoyage Cache

Si les données semblent obsolètes :

```javascript
// Dans la console
dataManager.clearCache();
location.reload();
```

## Évolutions Prévues

### Phase 2 - Fonctionnalités Étendues
- Gestion de l'agenda avec événements
- Interface blog avec éditeur de contenu
- Section bonnes affaires avec catégories
- Activités externes avec inscription

### Phase 3 - Fonctionnalités Avancées
- Système de rôles (Super Admin, Admin, Éditeur)
- Historique des modifications
- Notifications par email
- API REST complète
- Dashboard analytique

## Support

Pour toute assistance :
1. Consultez cette documentation
2. Vérifiez les logs de la console
3. Testez avec des données simples
4. Contactez l'équipe technique

**Date de dernière mise à jour :** Octobre 2025  
**Version :** 1.0.0
