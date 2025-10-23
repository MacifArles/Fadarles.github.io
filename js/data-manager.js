/**
 * Gestionnaire de données pour le site Fad'Arles
 * Version originale fonctionnelle
 * Repository: macifarles/Fadarles.github.io
 */

class DataManager {
    constructor() {
        // Configuration GitHub - Repository correct
        this.config = {
            owner: 'macifarles',
            repo: 'Fadarles.github.io',
            branch: 'main',
            apiUrl: 'https://api.github.com',
            baseUrl: 'https://macifarles.github.io/Fadarles.github.io'
        };
        
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Récupère les données d'un fichier JSON avec mise en cache
     * @param {string} filename - Nom du fichier JSON
     * @returns {Promise<Array>} Données du fichier
     */
    async getData(filename) {
        const cacheKey = filename;
        const cached = this.cache.get(cacheKey);
        
        // Vérifier le cache
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log(`Données ${filename} servies depuis le cache`);
            return cached.data;
        }

        try {
            console.log(`Chargement de ${filename} depuis GitHub...`);
            const response = await fetch(`${this.config.baseUrl}/data/${filename}`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status} lors du chargement de ${filename}`);
            }

            const data = await response.json();
            
            // Mettre en cache
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            console.log(`${filename} chargé avec succès:`, data.length, 'éléments');
            return data;
            
        } catch (error) {
            console.error(`Erreur lors du chargement de ${filename}:`, error);
            throw error;
        }
    }

    /**
     * Vide le cache pour forcer un rechargement
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache vidé');
    }

    /**
     * Filtre les employés par équipe
     * @param {Array} employees - Liste des employés
     * @param {string} team - Équipe à filtrer
     * @returns {Array} Employés filtrés
     */
    filterByTeam(employees, team) {
        if (!team || team === 'all') {
            return employees;
        }
        
        return employees.filter(employee => {
            if (team === 'direction') {
                return employee.team === 'Direction';
            }
            return employee.team === team;
        });
    }

    /**
     * Obtient les équipes uniques
     * @param {Array} employees - Liste des employés
     * @returns {Array} Liste des équipes
     */
    getTeams(employees) {
        const teams = [...new Set(employees.map(emp => emp.team))];
        return teams.filter(team => team && team.trim() !== '');
    }
}

// Instance globale
const dataManager = new DataManager();

// Export pour compatibilité
if (typeof window !== 'undefined') {
    window.dataManager = dataManager;
    window.DataManager = DataManager;
}

console.log('📦 DataManager chargé et prêt');
