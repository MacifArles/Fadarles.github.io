# 🚨 Guide de Dépannage - Interface Admin (Version Hybride)

## ⚡ Solution Rapide (95% des cas)

### 1. **Identifiants Exacts**
```
Email: admin@fadarles.com
Mot de passe: FadArles2024!
```
⚠️ **ATTENTION** : Respectez exactement les majuscules et caractères spéciaux !

### 2. **Test de Diagnostic OBLIGATOIRE**
**TOUJOURS commencer par :** `pages/admin-test.html`
- ✅ Cette page fonctionne à 100%
- ✅ Test automatique des identifiants
- ✅ Messages de diagnostic détaillés
- ✅ Si ça marche ici, le problème vient des fichiers

### 3. **Structure de Fichiers (NOUVELLE VERSION)**
```
✅ js/data-manager.js      ← Version hybride (trombinoscope + admin)
✅ js/admin.js             ← Interface d'administration
✅ pages/admin.html        ← Page d'administration
✅ css/admin.css           ← Styles admin
```

## 🔍 Diagnostic par Étapes

### Étape 1: Vérification Trombinoscope
**IMPORTANT :** Le trombinoscope doit toujours fonctionner !
```
URL: pages/trombinoscope.html
✅ Doit afficher les employés
✅ Filtres doivent marcher
❌ Si cassé → Restaurez data-manager-backup.js
```

### Étape 2: Test Admin Diagnostic
```
URL: pages/admin-test.html
✅ Doit afficher "Connexion réussie"
✅ Logs de diagnostic dans la section bleue
❌ Si échec → Vérifiez les identifiants
```

### Étape 3: Test Admin Complet
```
URL: pages/admin.html
✅ Connexion avec identifiants
✅ Tableau de bord affiché
✅ Liste employés chargée
```

### Étape 4: Vérification Console
Dans la console (F12), vous devez voir :
```javascript
📦 Data Manager (version hybride trombinoscope + admin) chargé
🔧 Scripts chargés
🚀 DOM chargé
✅ Formulaire trouvé, événements attachés
```

## 🛠️ Solutions par Problème

### ❌ "Le trombinoscope ne marche plus"
**Cause** : Problème avec le nouveau data-manager.js
**Solution URGENTE** :
```bash
# Restaurez votre sauvegarde
cp js/data-manager-backup.js js/data-manager.js
```
Puis contactez-moi avec l'erreur.

### ❌ "admin-test.html ne marche pas"
**Cause** : Problème de fichiers de base
**Solution** :
1. Vérifiez que `admin-test.html` est bien uploadé
2. Testez dans un autre navigateur
3. Cette page DOIT marcher - elle est autonome

### ❌ "Connexion admin-test OK mais admin.html KO"
**Cause** : Problème de chargement des scripts
**Solution** :
1. Vérifiez que `js/admin.js` est accessible
2. Vérifiez que `css/admin.css` est accessible
3. Console (F12) → cherchez les erreurs 404

### ❌ "Token GitHub demandé"
**Cause** : Normal pour les modifications
**Solution** :
1. Configurez un token GitHub dans Paramètres
2. Pour juste tester la connexion : pas besoin de token
3. Token nécessaire seulement pour ajouter/modifier

### ❌ "DataManager undefined"
**Cause** : data-manager.js pas chargé
**Solution** :
```javascript
// Dans la console
console.log('DataManager:', typeof window.dataManager);
// Doit afficher: "object"
```

## 🔧 Tests de Validation Hybride

### Test 1: Compatibilité Trombinoscope
```javascript
// Dans la console du trombinoscope
dataManager.getEmployees().then(emp => console.log(emp.length + ' employés'));
```

### Test 2: Fonctions Admin Disponibles
```javascript
// Dans la console de admin.html
console.log('Fonctions admin:', {
    add: typeof dataManager.addEmployee,
    update: typeof dataManager.updateEmployee,
    delete: typeof dataManager.deleteEmployee
});
// Doit afficher: {add: "function", update: "function", delete: "function"}
```

### Test 3: Activation Token
```javascript
// Test d'activation des fonctions admin
dataManager.setGitHubToken('test');
// Doit afficher: "🔧 Fonctions d'administration activées"
```

## 📊 Codes d'Erreur Spécifiques

| Code | Message | Solution Hybride |
|------|---------|------------------|
| H001 | "Trombinoscope cassé" | Restaurez data-manager-backup.js |
| H002 | "admin-test.html KO" | Re-uploadez le fichier |
| H003 | "Fonctions admin absentes" | Vérifiez data-manager.js version hybride |
| H004 | "Token requis" | Normal pour modifications |

## 🆘 Plan de Récupération d'Urgence

### Si TOUT est cassé :
```
1. Restaurez data-manager-backup.js
2. Vérifiez que le trombinoscope marche
3. Re-uploadez admin-test.html
4. Testez admin-test.html
5. Si OK → Re-uploadez admin.html
```

### Si Trombinoscope OK mais Admin KO :
```
1. Le trombinoscope fonctionne = data-manager.js OK
2. Problème = admin.html ou admin.js
3. Testez admin-test.html
4. Re-uploadez les fichiers admin spécifiques
```

## ✅ Validation Finale Hybride

**Trombinoscope :**
- ✅ Affiche les employés correctement
- ✅ Filtres et recherche fonctionnels
- ✅ Aucune régression

**Administration :**
- ✅ admin-test.html : "Connexion réussie"
- ✅ admin.html : Tableau de bord affiché
- ✅ Console : Aucune erreur rouge
- ✅ Fonctions CRUD disponibles (avec token)

## 🎯 Points Critiques Version Hybride

1. **UN SEUL data-manager.js** pour tout
2. **Trombinoscope PRIORITAIRE** (ne doit jamais casser)
3. **admin-test.html** fonctionne TOUJOURS
4. **Fonctions admin activées** seulement avec token
5. **Sauvegarde** avant toute modification

**Si admin-test.html ne marche pas → problème de fichiers**  
**Si admin-test.html marche mais pas admin.html → problème de scripts**  
**Si trombinoscope cassé → restaurez immédiatement la sauvegarde**
