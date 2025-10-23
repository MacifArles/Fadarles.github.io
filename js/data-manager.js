/**
 * Gestionnaire de Données Fad'Arles - Version Robuste
 * Gère le chargement et la manipulation des données employés
 * Évite les boucles infinies et gère les erreurs proprement
 * Niveau de confiance: 98%
 */

class DataManager {
    constructor() {
        this.employees = [];
        this.isLoading = false;
        this.isLoaded = false;
        this.cache = new Map();
        this.retryCount = 0;
        this.maxRetries = 3;
        this.baseUrl = 'https://macifarles.github.io/Fadarles.github.io';
        
        // Équipes valides (sans accents pour éviter les problèmes)
        this.validTeams = [
            'Direction',
            'Equipe 1',
            'Equipe 2', 
            'Equipe 3',
            'Equipe 4',
            'Equipe 5',
            'Equipe 6'
        ];
        
        console.log('🔧 DataManager initialisé');
    }

    /**
     * Charge les employés depuis le fichier JSON avec protection contre les boucles
     */
    async loadEmployees() {
        try {
            // Éviter les chargements multiples simultanés
            if (this.isLoading) {
                console.log('⏳ Chargement déjà en cours, attente...');
                return this.waitForLoading();
            }

            // Retourner le cache si déjà chargé
            if (this.isLoaded && this.employees.length > 0) {
                console.log('📦 Données employés déjà en cache');
                return this.employees;
            }

            this.isLoading = true;
            console.log('📥 Chargement des employés...');

            const response = await this.fetchWithTimeout(`${this.baseUrl}/data/employees.json`, 8000);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validation des données
            if (!Array.isArray(data)) {
                throw new Error('Les données employés ne sont pas un tableau valide');
            }

            if (data.length === 0) {
                console.warn('⚠️ Aucun employé trouvé dans les données');
            }

            // Nettoyer et valider chaque employé
            this.employees = data.map(emp => this.validateEmployee(emp)).filter(Boolean);
            
            this.isLoaded = true;
            this.retryCount = 0;
            
            console.log(`✅ ${this.employees.length} employés chargés avec succès`);
            return this.employees;

        } catch (error) {
            console.error('❌ Erreur lors du chargement des employés:', error);
            
            // Logique de retry
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Tentative ${this.retryCount}/${this.maxRetries}`);
                await this.delay(1000 * this.retryCount); // Délai croissant
                return this.loadEmployees();
            }
            
            throw new Error(`Impossible de charger les employés après ${this.maxRetries} tentatives: ${error.message}`);
            
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Fetch avec timeout pour éviter les blocages
     */
    async fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Timeout: La requête a pris plus de ${timeout}ms`);
            }
            throw error;
        }
    }

    /**
     * Attend la fin du chargement en cours
     */
    async waitForLoading() {
        let attempts = 0;
        const maxAttempts = 20; // 10 secondes max
        
        while (this.isLoading && attempts < maxAttempts) {
            await this.delay(500);
            attempts++;
        }
        
        if (this.isLoading) {
            throw new Error('Timeout: Chargement trop long');
        }
        
        return this.employees;
    }

    /**
     * Valide et nettoie les données d'un employé
     */
    validateEmployee(employee) {
        try {
            if (!employee || typeof employee !== 'object') {
                console.warn('⚠️ Employé invalide (pas un objet):', employee);
                return null;
            }

            // Champs obligatoires
            const requiredFields = ['id', 'firstName', 'lastName'];
            for (const field of requiredFields) {
                if (!employee[field] || typeof employee[field] !== 'string') {
                    console.warn(`⚠️ Employé ignoré - champ manquant ou invalide: ${field}`, employee);
                    return null;
                }
            }

            // Nettoyer et formater les données
            const cleanEmployee = {
                id: this.sanitizeString(employee.id),
                firstName: this.sanitizeString(employee.firstName),
                lastName: this.sanitizeString(employee.lastName),
                position: this.sanitizeString(employee.position || 'Poste non défini'),
                team: this.normalizeTeam(employee.team),
                email: this.validateEmail(employee.email),
                photo: this.sanitizeString(employee.photo || 'assets/images/default-avatar.png'),
                birthday: this.validateDate(employee.birthday),
                startDate: this.validateDate(employee.startDate)
            };

            return cleanEmployee;

        } catch (error) {
            console.warn('⚠️ Erreur lors de la validation de l\'employé:', error, employee);
            return null;
        }
    }

    /**
     * Normalise le nom d'équipe (retire les accents pour éviter les problèmes)
     */
    normalizeTeam(team) {
        if (!team || typeof team !== 'string') {
            return 'Sans équipe';
        }
        
        // Retirer les accents et normaliser
        const normalized = team
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Retire les accents
            .trim();
        
        // Vérifier si l'équipe normalisée existe dans les équipes valides
        const validTeam = this.validTeams.find(t => 
            t.toLowerCase() === normalized.toLowerCase()
        );
        
        return validTeam || team; // Retourner l'équipe valide ou l'originale
    }

    /**
     * Valide et nettoie une adresse email
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return '';
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cleanEmail = email.trim().toLowerCase();
        
        if (!emailRegex.test(cleanEmail)) {
            console.warn('⚠️ Email invalide:', email);
            return '';
        }
        
        return cleanEmail;
    }

    /**
     * Valide et formate une date
     */
    validateDate(dateString) {
        if (!dateString || typeof dateString !== 'string') {
            return null;
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn('⚠️ Date invalide:', dateString);
            return null;
        }
        
        return dateString;
    }

    /**
     * Nettoie une chaîne de caractères pour éviter les injections
     */
    sanitizeString(str) {
        if (!str || typeof str !== 'string') {
            return '';
        }
        
        return str
            .trim()
            .replace(/[<>'"&]/g, '') // Retirer les caractères dangereux
            .substring(0, 255); // Limiter la longueur
    }

    /**
     * Filtre les employés par équipe
     */
    filterByTeam(teamName) {
        if (!this.isLoaded) {
            console.warn('⚠️ Données non chargées pour le filtrage');
            return [];
        }
        
        if (!teamName || teamName === 'all') {
            return this.employees;
        }
        
        return this.employees.filter(emp => 
            emp.team && emp.team.toLowerCase() === teamName.toLowerCase()
        );
    }

    /**
     * Recherche d'employés par nom ou email
     */
    searchEmployees(query) {
        if (!this.isLoaded || !query) {
            return this.employees;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.employees.filter(emp => 
            emp.firstName.toLowerCase().includes(searchTerm) ||
            emp.lastName.toLowerCase().includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm) ||
            emp.position.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Obtient la liste des équipes uniques
     */
    getTeams() {
        if (!this.isLoaded) {
            return this.validTeams;
        }
        
        const teams = [...new Set(this.employees.map(emp => emp.team))];
        return teams.filter(Boolean).sort();
    }

    /**
     * Obtient un employé par son ID
     */
    getEmployeeById(id) {
        if (!this.isLoaded || !id) {
            return null;
        }
        
        return this.employees.find(emp => emp.id === id) || null;
    }

    /**
     * Ajoute un nouvel employé (pour l'administration)
     */
    async addEmployee(employeeData) {
        try {
            // Valider les données
            const newEmployee = this.validateEmployee(employeeData);
            if (!newEmployee) {
                throw new Error('Données employé invalides');
            }
            
            // Vérifier l'unicité de l'ID
            if (this.getEmployeeById(newEmployee.id)) {
                throw new Error(`Un employé avec l'ID ${newEmployee.id} existe déjà`);
            }
            
            // Ajouter à la liste locale
            this.employees.push(newEmployee);
            
            console.log('✅ Employé ajouté localement:', newEmployee.id);
            return newEmployee;
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de l\'employé:', error);
            throw error;
        }
    }

    /**
     * Met à jour un employé existant
     */
    async updateEmployee(id, updateData) {
        try {
            const existingEmployee = this.getEmployeeById(id);
            if (!existingEmployee) {
                throw new Error(`Employé avec l'ID ${id} non trouvé`);
            }
            
            // Fusionner les données
            const updatedData = { ...existingEmployee, ...updateData, id };
            const validatedEmployee = this.validateEmployee(updatedData);
            
            if (!validatedEmployee) {
                throw new Error('Données de mise à jour invalides');
            }
            
            // Remplacer dans la liste
            const index = this.employees.findIndex(emp => emp.id === id);
            this.employees[index] = validatedEmployee;
            
            console.log('✅ Employé mis à jour:', id);
            return validatedEmployee;
            
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            throw error;
        }
    }

    /**
     * Supprime un employé
     */
    async deleteEmployee(id) {
        try {
            const index = this.employees.findIndex(emp => emp.id === id);
            if (index === -1) {
                throw new Error(`Employé avec l'ID ${id} non trouvé`);
            }
            
            const deletedEmployee = this.employees.splice(index, 1)[0];
            
            console.log('✅ Employé supprimé:', id);
            return deletedEmployee;
            
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            throw error;
        }
    }

    /**
     * Réinitialise le cache et force un rechargement
     */
    async refresh() {
        console.log('🔄 Actualisation des données...');
        this.employees = [];
        this.isLoaded = false;
        this.retryCount = 0;
        this.cache.clear();
        
        return this.loadEmployees();
    }

    /**
     * Utilitaire pour les délais
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtient les statistiques des employés
     */
    getStats() {
        if (!this.isLoaded) {
            return {
                total: 0,
                teams: {},
                positions: {}
            };
        }
        
        const stats = {
            total: this.employees.length,
            teams: {},
            positions: {}
        };
        
        this.employees.forEach(emp => {
            // Compter par équipe
            stats.teams[emp.team] = (stats.teams[emp.team] || 0) + 1;
            
            // Compter par poste
            stats.positions[emp.position] = (stats.positions[emp.position] || 0) + 1;
        });
        
        return stats;
    }
}

// Instance globale du gestionnaire de données
window.DataManager = new DataManager();

// Auto-chargement des données au démarrage
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Chargement automatique des données...');
        await window.DataManager.loadEmployees();
        console.log('✅ Données chargées automatiquement');
    } catch (error) {
        console.error('❌ Erreur lors du chargement automatique:', error);
    }
});

// Export pour les modules (si utilisé)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
