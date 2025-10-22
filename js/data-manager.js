/**
 * Gestionnaire des données centralisées via API GitHub
 * Permet la lecture et l'écriture de fichiers JSON dans le repository
 * Niveau de confiance: 90%
 */

class DataManager {
    constructor() {
        this.repoOwner = 'macifarles'; // Nom correct du compte GitHub
        this.repoName = 'Fadarles.github.io'; // Nom exact du repository
        this.apiBase = 'https://api.github.com/repos';
        this.contentBase = 'https://raw.githubusercontent.com';
        
        // Token GitHub (à configurer dans l'admin)
        this.githubToken = localStorage.getItem('githubToken');
        
        // Liste des administrateurs autorisés
        this.adminEmails = [
            'admin1@macif.fr',
            'admin2@macif.fr'
            // À compléter avec les emails réels des administrateurs
        ];
    }

    /**
     * Récupère les données d'un fichier JSON
     * @param {string} fileName - Nom du fichier (ex: 'employees.json')
     * @returns {Promise<Object>} - Données du fichier
     */
    async getData(fileName) {
        try {
            const url = `${this.contentBase}/${this.repoOwner}/${this.repoName}/main/data/${fileName}`;
            console.log(`Chargement des données depuis: ${url}`); // Log pour débogage
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status} lors du chargement de ${fileName}`);
            }
            
            const data = await response.json();
            console.log(`Données chargées avec succès pour ${fileName}:`, data); // Log pour débogage
            return data;
        } catch (error) {
            console.error('Erreur de récupération des données:', error);
            return this.getDefaultData(fileName);
        }
    }

    /**
     * Met à jour un fichier JSON dans le repository
     * @param {string} fileName - Nom du fichier
     * @param {Object} data - Nouvelles données
     * @param {string} commitMessage - Message de commit
     * @returns {Promise<boolean>} - Succès de l'opération
     */
    async updateData(fileName, data, commitMessage) {
        if (!this.githubToken) {
            throw new Error('Token GitHub requis pour la modification');
        }

        try {
            // 1. Récupérer le SHA actuel du fichier
            const fileUrl = `${this.apiBase}/${this.repoOwner}/${this.repoName}/contents/data/${fileName}`;
            const fileResponse = await fetch(fileUrl, {
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            let sha = null;
            if (fileResponse.ok) {
                const fileData = await fileResponse.json();
                sha = fileData.sha;
            }

            // 2. Encoder les nouvelles données en base64
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

            // 3. Mettre à jour le fichier
            const updateResponse = await fetch(fileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: content,
                    sha: sha // Obligatoire pour la mise à jour
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(`Erreur lors de la mise à jour: ${errorData.message}`);
            }

            return true;
        } catch (error) {
            console.error('Erreur de mise à jour:', error);
            throw error;
        }
    }

    /**
     * Ajoute une nouvelle entrée à un fichier JSON
     * @param {string} fileName - Nom du fichier
     * @param {Object} newEntry - Nouvelle entrée à ajouter
     * @param {string} commitMessage - Message de commit
     */
    async addEntry(fileName, newEntry, commitMessage) {
        try {
            const currentData = await this.getData(fileName);
            
            // Ajouter la nouvelle entrée avec métadonnées
            const entryWithMetadata = {
                ...newEntry,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            currentData.push(entryWithMetadata);

            await this.updateData(fileName, currentData, commitMessage);
            return entryWithMetadata;
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            throw error;
        }
    }

    /**
     * Supprime une entrée d'un fichier JSON
     * @param {string} fileName - Nom du fichier
     * @param {string} entryId - ID de l'entrée à supprimer
     * @param {string} commitMessage - Message de commit
     */
    async removeEntry(fileName, entryId, commitMessage) {
        try {
            const currentData = await this.getData(fileName);
            const filteredData = currentData.filter(item => item.id !== entryId);
            
            if (filteredData.length === currentData.length) {
                throw new Error('Entrée non trouvée');
            }

            await this.updateData(fileName, filteredData, commitMessage);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            throw error;
        }
    }

    /**
     * Met à jour une entrée existante dans un fichier JSON
     * @param {string} fileName - Nom du fichier
     * @param {string} entryId - ID de l'entrée à modifier
     * @param {Object} updatedEntry - Nouvelles données
     * @param {string} commitMessage - Message de commit
     */
    async updateEntry(fileName, entryId, updatedEntry, commitMessage) {
        try {
            const currentData = await this.getData(fileName);
            const entryIndex = currentData.findIndex(item => item.id === entryId);
            
            if (entryIndex === -1) {
                throw new Error('Entrée non trouvée');
            }

            // Conserver certaines métadonnées et ajouter la date de modification
            currentData[entryIndex] = {
                ...currentData[entryIndex],
                ...updatedEntry,
                id: entryId, // Préserver l'ID original
                updatedAt: new Date().toISOString()
            };

            await this.updateData(fileName, currentData, commitMessage);
            return currentData[entryIndex];
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            throw error;
        }
    }

    /**
     * Vérifie si un utilisateur est administrateur
     * @param {string} email - Email de l'utilisateur
     * @returns {boolean} - Statut administrateur
     */
    isAdmin(email) {
        return this.adminEmails.includes(email.toLowerCase());
    }

    /**
     * Configure le token GitHub pour les opérations d'écriture
     * @param {string} token - Token GitHub personnel
     */
    setGithubToken(token) {
        this.githubToken = token;
        localStorage.setItem('githubToken', token);
    }

    /**
     * Supprime le token GitHub stocké
     */
    clearGithubToken() {
        this.githubToken = null;
        localStorage.removeItem('githubToken');
    }

    /**
     * Vérifie si un token GitHub est configuré
     * @returns {boolean} - Présence du token
     */
    hasGithubToken() {
        return this.githubToken !== null && this.githubToken !== undefined;
    }

    /**
     * Génère un ID unique pour les nouvelles entrées
     * @returns {string} - ID unique basé sur timestamp et random
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Retourne des données par défaut en cas d'erreur
     * @param {string} fileName - Nom du fichier
     * @returns {Array} - Tableau vide par défaut
     */
    getDefaultData(fileName) {
        console.warn(`Utilisation des données par défaut pour ${fileName}`);
        return [];
    }

    /**
     * Valide la structure d'un fichier JSON avant modification
     * @param {string} fileName - Nom du fichier
     * @param {Object} data - Données à valider
     * @returns {boolean} - Validité des données
     */
    validateData(fileName, data) {
        if (!Array.isArray(data)) {
            console.error('Les données doivent être un tableau');
            return false;
        }

        // Validation spécifique selon le type de fichier
        switch (fileName) {
            case 'employees.json':
                return data.every(emp => 
                    emp.id && emp.firstName && emp.lastName && 
                    emp.position && emp.team && emp.email
                );
            case 'events.json':
                return data.every(event => 
                    event.id && event.title && event.date
                );
            case 'birthdays.json':
                return data.every(birthday => 
                    birthday.id && birthday.name && birthday.date
                );
            default:
                return true; // Validation basique pour les autres fichiers
        }
    }

    /**
     * Teste la connectivité avec l'API GitHub
     * @returns {Promise<boolean>} - Statut de la connexion
     */
    async testConnection() {
        try {
            const testUrl = `${this.apiBase}/${this.repoOwner}/${this.repoName}`;
            const response = await fetch(testUrl);
            return response.ok;
        } catch (error) {
            console.error('Erreur de connexion à l\'API GitHub:', error);
            return false;
        }
    }
}

// Instance globale du gestionnaire de données
const dataManager = new DataManager();

// Export pour utilisation dans d'autres modules si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
