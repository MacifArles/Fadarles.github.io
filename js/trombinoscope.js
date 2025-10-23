/**
 * Gestionnaire du trombinoscope - Version corrigée
 * Évite les boucles infinies et gère les erreurs proprement
 * Niveau de confiance: 95%
 */

class TrombinoscopeManager {
    constructor() {
        this.isLoading = false;
        this.employees = [];
        this.selectedTeam = 'all';
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    /**
     * Initialise le trombinoscope de manière sécurisée
     */
    async init() {
        try {
            console.log('🔄 Initialisation du trombinoscope...');
            
            // Éviter les initialisations multiples
            if (this.isLoading) {
                console.warn('⚠️ Initialisation déjà en cours');
                return;
            }

            this.isLoading = true;
            await this.loadEmployees();
            this.setupEventListeners();
            this.displayEmployees();
            
            console.log('✅ Trombinoscope initialisé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors du chargement du trombinoscope');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Charge les employés avec gestion d'erreur et retry
     */
    async loadEmployees() {
        try {
            console.log('📥 Chargement des employés...');
            
            // Vérifier si DataManager est disponible
            if (typeof window.DataManager === 'undefined') {
                throw new Error('DataManager non disponible');
            }

            // Charger les données avec timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout du chargement')), 10000);
            });

            const loadPromise = window.DataManager.loadEmployees();
            
            this.employees = await Promise.race([loadPromise, timeoutPromise]);
            
            if (!Array.isArray(this.employees) || this.employees.length === 0) {
                throw new Error('Aucun employé trouvé');
            }

            console.log(`✅ ${this.employees.length} employés chargés`);
            
        } catch (error) {
            console.error('❌ Erreur chargement employés:', error);
            
            // Retry logique
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Tentative ${this.retryCount}/${this.maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.loadEmployees();
            }
            
            throw error;
        }
    }

    /**
     * Configure les événements utilisateur
     */
    setupEventListeners() {
        // Filtre par équipe
        const teamFilter = document.getElementById('team-filter');
        if (teamFilter) {
            teamFilter.addEventListener('change', (e) => {
                this.selectedTeam = e.target.value;
                this.displayEmployees();
            });
        }

        // Bouton rafraîchir
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
    }

    /**
     * Affiche les employés avec protection contre les boucles
     */
    displayEmployees() {
        try {
            const container = document.getElementById('employees-container');
            if (!container) {
                throw new Error('Container employés non trouvé');
            }

            console.log('🎨 Affichage des employés...');

            // Nettoyer le container
            container.innerHTML = '';

            // Filtrer les employés
            const filteredEmployees = this.filterEmployees();
            
            if (filteredEmployees.length === 0) {
                container.innerHTML = `
                    <div class="no-employees">
                        <p>Aucun employé trouvé pour cette équipe.</p>
                    </div>
                `;
                return;
            }

            // Grouper par équipe
            const groupedEmployees = this.groupByTeam(filteredEmployees);
            
            // Afficher chaque équipe
            Object.keys(groupedEmployees).forEach(team => {
                const teamSection = this.createTeamSection(team, groupedEmployees[team]);
                container.appendChild(teamSection);
            });

            console.log(`✅ ${filteredEmployees.length} employés affichés`);

        } catch (error) {
            console.error('❌ Erreur affichage:', error);
            this.showError('Erreur lors de l\'affichage des employés');
        }
    }

    /**
     * Filtre les employés selon l'équipe sélectionnée
     */
    filterEmployees() {
        if (this.selectedTeam === 'all') {
            return this.employees;
        }
        
        return this.employees.filter(emp => 
            emp.team && emp.team.toLowerCase() === this.selectedTeam.toLowerCase()
        );
    }

    /**
     * Groupe les employés par équipe
     */
    groupByTeam(employees) {
        const groups = {};
        
        employees.forEach(emp => {
            const team = emp.team || 'Sans équipe';
            if (!groups[team]) {
                groups[team] = [];
            }
            groups[team].push(emp);
        });
        
        return groups;
    }

    /**
     * Crée une section d'équipe avec ses employés
     */
    createTeamSection(teamName, employees) {
        const section = document.createElement('div');
        section.className = 'team-section';
        
        // Titre de l'équipe
        const title = document.createElement('h3');
        title.className = 'team-title';
        title.textContent = `${teamName} (${employees.length} membre${employees.length > 1 ? 's' : ''})`;
        
        // Container des cartes employés
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'employees-grid';
        
        // Créer les cartes employés
        employees.forEach(employee => {
            const card = this.createEmployeeCard(employee);
            cardsContainer.appendChild(card);
        });
        
        section.appendChild(title);
        section.appendChild(cardsContainer);
        
        return section;
    }

    /**
     * Crée une carte employé sécurisée
     */
    createEmployeeCard(employee) {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.setAttribute('data-id', employee.id || '');
        
        // Échapper les données pour éviter XSS
        const safeEmployee = {
            firstName: this.escapeHtml(employee.firstName || ''),
            lastName: this.escapeHtml(employee.lastName || ''),
            position: this.escapeHtml(employee.position || ''),
            email: this.escapeHtml(employee.email || ''),
            photo: employee.photo || 'assets/images/default-avatar.png'
        };
        
        card.innerHTML = `
            <div class="employee-photo">
                <img src="${safeEmployee.photo}" 
                     alt="${safeEmployee.firstName} ${safeEmployee.lastName}"
                     onerror="this.src='assets/images/default-avatar.png'">
            </div>
            <div class="employee-info">
                <h4 class="employee-name">${safeEmployee.firstName} ${safeEmployee.lastName}</h4>
                <p class="employee-position">${safeEmployee.position}</p>
                <a href="mailto:${safeEmployee.email}" class="employee-email">
                    ${safeEmployee.email}
                </a>
            </div>
        `;
        
        return card;
    }

    /**
     * Sécurité : Échapper le HTML pour éviter les injections XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Affiche un message d'erreur utilisateur
     */
    showError(message) {
        const container = document.getElementById('employees-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Erreur</h3>
                    <p>${this.escapeHtml(message)}</p>
                    <button onclick="trombinoscopeManager.refresh()" class="retry-btn">
                        Réessayer
                    </button>
                </div>
            `;
        }
    }

    /**
     * Rafraîchit le trombinoscope
     */
    async refresh() {
        console.log('🔄 Rafraîchissement du trombinoscope...');
        this.retryCount = 0;
        this.employees = [];
        await this.init();
    }
}

// Instance globale du gestionnaire
let trombinoscopeManager;

// Initialisation sécurisée au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Démarrage du trombinoscope...');
        
        // Attendre que DataManager soit disponible
        let attempts = 0;
        while (typeof window.DataManager === 'undefined' && attempts < 10) {
            console.log('⏳ Attente du DataManager...');
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (typeof window.DataManager === 'undefined') {
            throw new Error('DataManager non disponible après 5 secondes');
        }
        
        // Créer et initialiser le gestionnaire
        trombinoscopeManager = new TrombinoscopeManager();
        await trombinoscopeManager.init();
        
    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        
        // Affichage d'erreur de secours
        const container = document.getElementById('employees-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>❌ Erreur de chargement</h3>
                    <p>Impossible de charger le trombinoscope.</p>
                    <button onclick="window.location.reload()" class="retry-btn">
                        Recharger la page
                    </button>
                </div>
            `;
        }
    }
});
