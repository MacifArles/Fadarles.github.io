/**
 * Gestionnaire des données centralisées via API GitHub
 * Permet la lecture et l'écriture de fichiers JSON dans le repository
 * Niveau de confiance: 90%
 */

class DataManager {
    constructor() {
        this.repoOwner = 'fadarles'; // Nom du compte GitHub
        this.repoName = 'fadarles.github.io';
        this.apiBase = 'https://api.github.com/repos';
        this.contentBase = 'https://raw.githubusercontent.com';
        
        // Token GitHub (à configurer dans l'admin)
        this.githubToken = localStorage.getItem('githubToken');
        
        // Liste des administrateurs autorisés
        this.adminEmails = [
            'admin1@macif.fr',
            'admin2@macif.fr'
            // À compléter avec les emails réels
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
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur lors du chargement de ${fileName}`);
            }
            
            return await response.json();
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
                throw new Error('Erreur lors de la mise à jour du fichier');
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
            currentData.push({
                ...newEntry,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            await this.updateData(fileName, currentData, commitMessage);
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
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
     * Génère un ID unique pour les nouvelles entrées
     * @returns {string} - ID unique
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
        return [];
    }
}

// Instance globale du gestionnaire de données
const dataManager = new DataManager();
