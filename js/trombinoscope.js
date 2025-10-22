/**
 * Gestionnaire du trombinoscope avec filtrage par équipe
 * Charge et affiche les employés selon la hiérarchie organisationnelle
 * Niveau de confiance: 88%
 */

class TrombinoscopeManager {
    constructor() {
        this.employees = [];
        this.filteredEmployees = [];
        this.currentFilter = 'all';
        
        // Configuration des couleurs d'équipe
        this.teamColors = {
            'equipe1': '#ff6b35',
            'equipe2': '#f7931e', 
            'equipe3': '#ffb627',
            'equipe4': '#e74c3c',
            'equipe5': '#9b59b6',
            'equipe6': '#3498db'
        };
        
        this.init();
    }

    /**
     * Initialise le trombinoscope
     */
    async init() {
        try {
            await this.loadEmployees();
            this.setupEventListeners();
            this.renderTrombinoscope();
            this.hideLoading();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du trombinoscope:', error);
            this.showError();
        }
    }

    /**
     * Charge les données des employés depuis le fichier JSON
     */
    async loadEmployees() {
        try {
            this.employees = await dataManager.getData('employees.json');
            this.filteredEmployees = [...this.employees];
        } catch (error) {
            console.error('Erreur de chargement des employés:', error);
            throw error;
        }
    }

    /**
     * Configure les événements de filtrage
     */
    setupEventListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const team = e.target.dataset.team;
                this.filterByTeam(team);
                this.updateActiveFilter(e.target);
            });
        });
    }

    /**
     * Filtre les employés par équipe
     * @param {string} teamFilter - Filtre d'équipe à appliquer
     */
    filterByTeam(teamFilter) {
        this.currentFilter = teamFilter;
        
        if (teamFilter === 'all') {
            this.filteredEmployees = [...this.employees];
        } else {
            this.filteredEmployees = this.employees.filter(employee => 
                employee.team.toLowerCase().replace(' ', '') === teamFilter
            );
        }
        
        this.renderTrombinoscope();
    }

    /**
     * Met à jour l'état visuel du filtre actif
     * @param {HTMLElement} activeButton - Bouton filtre actif
     */
    updateActiveFilter(activeButton) {
        document.querySelectorAll('.filter-btn').forEach(btn => 
            btn.classList.remove('active')
        );
        activeButton.classList.add('active');
    }

    /**
     * Affiche le trombinoscope complet
     */
    renderTrombinoscope() {
        this.renderDirection();
        this.renderTeams();
        this.updateVisibility();
    }

    /**
     * Affiche la section direction
     */
    renderDirection() {
        const directionGrid = document.getElementById('direction-grid');
        const responsable = this.filteredEmployees.find(emp => 
            emp.position.toLowerCase().includes('responsable')
        );

        if (responsable && (this.currentFilter === 'all' || this.currentFilter === 'direction')) {
            directionGrid.innerHTML = this.createEmployeeCard(responsable, 'responsable');
        } else {
            directionGrid.innerHTML = '';
        }
    }

    /**
     * Affiche les équipes commerciales
     */
    renderTeams() {
        const teamsContainer = document.getElementById('teams-container');
        const teams = this.getTeamsData();
        
        teamsContainer.innerHTML = '';
        
        teams.forEach(team => {
            if (team.employees.length > 0) {
                const teamElement = this.createTeamSection(team);
                teamsContainer.appendChild(teamElement);
            }
        });
    }

    /**
     * Organise les employés par équipe
     * @returns {Array} - Données organisées par équipe
     */
    getTeamsData() {
        const teams = [];
        
        // Traite chaque équipe numérotée
        for (let i = 1; i <= 6; i++) {
            const teamName = `Équipe ${i}`;
            const teamKey = `equipe${i}`;
            
            if (this.currentFilter === 'all' || this.currentFilter === teamKey) {
                const teamEmployees = this.filteredEmployees.filter(emp => 
                    emp.team === teamName && !emp.position.toLowerCase().includes('responsable')
                );
                
                if (teamEmployees.length > 0) {
                    teams.push({
                        name: teamName,
                        key: teamKey,
                        color: this.teamColors[teamKey],
                        employees: teamEmployees
                    });
                }
            }
        }
        
        return teams;
    }

    /**
     * Crée l'élément HTML d'une équipe
     * @param {Object} team - Données de l'équipe
     * @returns {HTMLElement} - Élément DOM de l'équipe
     */
    createTeamSection(team) {
        const section = document.createElement('div');
        section.className = 'team-section';
        section.style.setProperty('--team-color', team.color);
        
        const manager = team.employees.find(emp => 
            emp.position.toLowerCase().includes('manager')
        );
        const conseiller = team.employees.find(emp => 
            emp.position.toLowerCase().includes('conseiller clientèle')
        );
        const commerciaux = team.employees.filter(emp => 
            emp.position.toLowerCase().includes('conseiller commercial')
        );
        
        section.innerHTML = `
            <div class="team-header">
                <h3 class="team-name">${team.name}</h3>
                <div class="team-stats">
                    ${team.employees.length} membre(s) - ${commerciaux.length} commercial(aux)
                </div>
            </div>
            <div class="employees-grid team-employees-grid">
                ${team.employees.map(employee => 
                    this.createEmployeeCard(employee, this.getEmployeeType(employee))
                ).join('')}
            </div>
        `;
        
        return section;
    }

    /**
     * Détermine le type d'employé pour le style
     * @param {Object} employee - Données de l'employé
     * @returns {string} - Type d'employé
     */
    getEmployeeType(employee) {
        const position = employee.position.toLowerCase();
        if (position.includes('manager')) return 'manager';
        if (position.includes('conseiller clientèle')) return 'conseiller-clientele';
        return 'conseiller-commercial';
    }

    /**
     * Crée la carte HTML d'un employé
     * @param {Object} employee - Données de l'employé
     * @param {string} type - Type d'employé pour le style
     * @returns {string} - HTML de la carte employé
     */
    createEmployeeCard(employee, type) {
        const initials = this.getInitials(employee.firstName, employee.lastName);
        const photoSrc = employee.photo || '';
        
        return `
            <div class="employee-card ${type}" data-employee-id="${employee.id}">
                ${type === 'manager' ? '<div class="position-badge">Manager</div>' : ''}
                ${photoSrc ? 
                    `<img src="${photoSrc}" alt="${employee.firstName} ${employee.lastName}" class="employee-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="employee-photo placeholder" style="display:none;">${initials}</div>` :
                    `<div class="employee-photo placeholder">${initials}</div>`
                }
                <div class="employee-name">${employee.firstName} ${employee.lastName}</div>
                <div class="employee-position">${employee.position}</div>
                <div class="employee-email">${employee.email}</div>
            </div>
        `;
    }

    /**
     * Génère les initiales d'un employé
     * @param {string} firstName - Prénom
     * @param {string} lastName - Nom
     * @returns {string} - Initiales
     */
    getInitials(firstName, lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    /**
     * Met à jour la visibilité des sections selon le filtre
     */
    updateVisibility() {
        const directionSection = document.getElementById('direction-section');
        const teamsSection = document.getElementById('teams-section');
        
        if (this.currentFilter === 'direction') {
            directionSection.style.display = 'block';
            teamsSection.style.display = 'none';
        } else if (this.currentFilter === 'all') {
            directionSection.style.display = 'block';
            teamsSection.style.display = 'block';
        } else {
            directionSection.style.display = 'none';
            teamsSection.style.display = 'block';
        }
    }

    /**
     * Masque le message de chargement
     */
    hideLoading() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
    }

    /**
     * Affiche le message d'erreur
     */
    showError() {
        const errorMessage = document.getElementById('error-message');
        const loadingMessage = document.getElementById('loading-message');
        
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) errorMessage.classList.remove('hidden');
    }
}

// Initialisation automatique du trombinoscope
document.addEventListener('DOMContentLoaded', () => {
    const trombinoscopeManager = new TrombinoscopeManager();
});
