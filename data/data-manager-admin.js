/**
 * Data Manager Fad'Arles - Version Admin
 * Gestion sécurisée des données avec API GitHub
 * Niveau de confiance : 90%
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

        this.gitHubToken = this.getStoredToken();
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Configuration du token GitHub
     */
    setGitHubToken(token) {
        this.gitHubToken = token;
        localStorage.setItem('fadArlesGitHubToken', token);
    }

    /**
     * Récupération du token stocké
     */
    getStoredToken() {
        return localStorage.getItem('fadArlesGitHubToken');
    }

    /**
     * Chargement des employés avec cache
     */
    async getEmployees() {
        const cacheKey = 'employees';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.config.baseUrl}/data/employees.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const employees = await response.json();
            
            // Mise en cache
            this.cache.set(cacheKey, {
                data: employees,
                timestamp: Date.now()
            });
            
            return employees;
        } catch (error) {
            console.error('Erreur lors du chargement des employés:', error);
            
            // Données de fallback en cas d'erreur
            return this.getFallbackEmployees();
        }
    }

    /**
     * Ajout d'un nouvel employé
     */
    async addEmployee(employeeData) {
        if (!this.gitHubToken) {
            throw new Error('Token GitHub requis pour modifier les données');
        }

        try {
            // Validation des données
            const validatedData = this.validateEmployeeData(employeeData);
            
            // Récupération des employés actuels
            const currentEmployees = await this.getEmployees();
            
            // Ajout du nouvel employé
            const updatedEmployees = [...currentEmployees, validatedData];
            
            // Sauvegarde sur GitHub
            await this.updateEmployeesFile(updatedEmployees);
            
            // Invalidation du cache
            this.cache.delete('employees');
            
            return validatedData;
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'employé:', error);
            throw error;
        }
    }

    /**
     * Modification d'un employé existant
     */
    async updateEmployee(employeeId, employeeData) {
        if (!this.gitHubToken) {
            throw new Error('Token GitHub requis pour modifier les données');
        }

        try {
            // Validation des données
            const validatedData = this.validateEmployeeData(employeeData);
            validatedData.id = employeeId;
            
            // Récupération des employés actuels
            const currentEmployees = await this.getEmployees();
            
            // Recherche et mise à jour de l'employé
            const employeeIndex = currentEmployees.findIndex(emp => emp.id === employeeId);
            if (employeeIndex === -1) {
                throw new Error('Employé non trouvé');
            }
            
            currentEmployees[employeeIndex] = validatedData;
            
            // Sauvegarde sur GitHub
            await this.updateEmployeesFile(currentEmployees);
            
            // Invalidation du cache
            this.cache.delete('employees');
            
            return validatedData;
        } catch (error) {
            console.error('Erreur lors de la modification de l\'employé:', error);
            throw error;
        }
    }

    /**
     * Suppression d'un employé
     */
    async deleteEmployee(employeeId) {
        if (!this.gitHubToken) {
            throw new Error('Token GitHub requis pour modifier les données');
        }

        try {
            // Récupération des employés actuels
            const currentEmployees = await this.getEmployees();
            
            // Filtrage pour supprimer l'employé
            const updatedEmployees = currentEmployees.filter(emp => emp.id !== employeeId);
            
            if (updatedEmployees.length === currentEmployees.length) {
                throw new Error('Employé non trouvé');
            }
            
            // Sauvegarde sur GitHub
            await this.updateEmployeesFile(updatedEmployees);
            
            // Invalidation du cache
            this.cache.delete('employees');
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'employé:', error);
            throw error;
        }
    }

    /**
     * Mise à jour du fichier employees.json sur GitHub
     */
    async updateEmployeesFile(employeesData) {
        if (!this.gitHubToken) {
            throw new Error('Token GitHub requis');
        }

        try {
            // Récupération du SHA actuel du fichier
            const fileInfo = await this.getFileInfo('data/employees.json');
            
            // Contenu du fichier en base64
            const content = btoa(JSON.stringify(employeesData, null, 2));
            
            // Requête de mise à jour
            const response = await fetch(
                `${this.config.apiUrl}/repos/${this.config.owner}/${this.config.repo}/contents/data/employees.json`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.gitHubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Mise à jour des employés - ${new Date().toISOString()}`,
                        content: content,
                        sha: fileInfo.sha,
                        branch: this.config.branch
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erreur GitHub API: ${errorData.message}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la mise à jour sur GitHub:', error);
            throw error;
        }
    }

    /**
     * Récupération des informations d'un fichier sur GitHub
     */
    async getFileInfo(filePath) {
        try {
            const response = await fetch(
                `${this.config.apiUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${filePath}`,
                {
                    headers: {
                        'Authorization': `token ${this.gitHubToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Erreur lors de la récupération du fichier: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des informations du fichier:', error);
            throw error;
        }
    }

    /**
     * Validation sécurisée des données employé
     */
    validateEmployeeData(data) {
        const errors = [];

        // Validation des champs obligatoires
        if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length < 2) {
            errors.push('Le prénom est obligatoire et doit contenir au moins 2 caractères');
        }

        if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length < 2) {
            errors.push('Le nom est obligatoire et doit contenir au moins 2 caractères');
        }

        if (!data.position || typeof data.position !== 'string' || data.position.trim().length < 2) {
            errors.push('Le poste est obligatoire');
        }

        const validTeams = ['Direction', 'Equipe 1', 'Equipe 2', 'Equipe 3', 'Equipe 4', 'Equipe 5', 'Equipe 6'];
        if (!data.team || !validTeams.includes(data.team)) {
            errors.push('L\'équipe doit être sélectionnée parmi les équipes valides');
        }

        // Validation de l'email si fourni
        if (data.email && !this.validateEmail(data.email)) {
            errors.push('Format d\'email invalide');
        }

        // Validation des dates si fournies
        if (data.birthday && !this.validateDate(data.birthday)) {
            errors.push('Format de date de naissance invalide');
        }

        if (data.startDate && !this.validateDate(data.startDate)) {
            errors.push('Format de date d\'arrivée invalide');
        }

        if (errors.length > 0) {
            throw new Error('Erreurs de validation: ' + errors.join(', '));
        }

        // Nettoyage et structuration des données
        return {
            id: data.id || this.generateEmployeeId(),
            firstName: this.sanitizeString(data.firstName),
            lastName: this.sanitizeString(data.lastName),
            position: this.sanitizeString(data.position),
            team: data.team,
            email: data.email ? this.sanitizeString(data.email) : '',
            photo: data.photo || '',
            birthday: data.birthday || '',
            startDate: data.startDate || ''
        };
    }

    /**
     * Filtrage des employés par équipe
     */
    async getEmployeesByTeam(teamName) {
        const employees = await this.getEmployees();
        return employees.filter(employee => employee.team === teamName);
    }

    /**
     * Recherche d'employés
     */
    async searchEmployees(searchTerm) {
        const employees = await this.getEmployees();
        const term = searchTerm.toLowerCase();
        
        return employees.filter(employee => 
            employee.firstName.toLowerCase().includes(term) ||
            employee.lastName.toLowerCase().includes(term) ||
            employee.position.toLowerCase().includes(term) ||
            employee.team.toLowerCase().includes(term)
        );
    }

    /**
     * Statistiques des employés
     */
    async getEmployeeStats() {
        const employees = await this.getEmployees();
        
        const stats = {
            total: employees.length,
            byTeam: {},
            recentHires: 0
        };

        // Statistiques par équipe
        employees.forEach(employee => {
            if (!stats.byTeam[employee.team]) {
                stats.byTeam[employee.team] = 0;
            }
            stats.byTeam[employee.team]++;
        });

        // Embauches récentes (6 derniers mois)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        stats.recentHires = employees.filter(employee => {
            if (!employee.startDate) return false;
            const startDate = new Date(employee.startDate);
            return startDate >= sixMonthsAgo;
        }).length;

        return stats;
    }

    // Utilitaires de validation et sécurité

    /**
     * Validation d'email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validation de date
     */
    validateDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Nettoyage sécurisé des chaînes
     */
    sanitizeString(str) {
        return str.trim().replace(/[<>]/g, '');
    }

    /**
     * Génération d'ID employé unique
     */
    generateEmployeeId() {
        return 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Données de fallback en cas d'erreur
     */
    getFallbackEmployees() {
        return [
            {
                id: "emp_fallback_001",
                firstName: "Admin",
                lastName: "Système",
                position: "Administrateur",
                team: "Direction",
                email: "admin@fadarles.com",
                photo: "",
                birthday: "",
                startDate: ""
            }
        ];
    }

    /**
     * Vérification de la connectivité GitHub
     */
    async testGitHubConnection() {
        if (!this.gitHubToken) {
            throw new Error('Token GitHub non configuré');
        }

        try {
            const response = await fetch(
                `${this.config.apiUrl}/repos/${this.config.owner}/${this.config.repo}`,
                {
                    headers: {
                        'Authorization': `token ${this.gitHubToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Erreur d'accès au repository: ${response.status}`);
            }

            return { success: true, message: 'Connexion GitHub établie' };
        } catch (error) {
            console.error('Erreur de connexion GitHub:', error);
            throw error;
        }
    }

    /**
     * Nettoyage du cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Export des données employés
     */
    async exportEmployees(format = 'json') {
        const employees = await this.getEmployees();
        
        switch (format) {
            case 'json':
                return JSON.stringify(employees, null, 2);
            case 'csv':
                return this.convertToCSV(employees);
            default:
                throw new Error('Format d\'export non supporté');
        }
    }

    /**
     * Conversion en CSV
     */
    convertToCSV(employees) {
        if (employees.length === 0) return '';
        
        const headers = Object.keys(employees[0]);
        const csvContent = [
            headers.join(','),
            ...employees.map(emp => 
                headers.map(header => `"${emp[header] || ''}"`).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }
}

// Initialisation globale
window.dataManager = new DataManager();

// Compatibility avec l'ancien code
window.DataManager = DataManager;
