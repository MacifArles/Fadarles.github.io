/**
 * Trombinoscope Fad'Arles - Gestion d'affichage des employés
 * Compatible avec data-manager.js hybride
 * Niveau de confiance : 95%
 */

class TrombinnoscopeManager {
    constructor() {
        this.employees = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        
        // Mapping des équipes pour compatibilité
        this.teamMapping = {
            'all': 'all',
            'direction': 'Direction',
            'equipe1': 'Equipe 1',
            'equipe2': 'Equipe 2', 
            'equipe3': 'Equipe 3',
            'equipe4': 'Equipe 4',
            'equipe5': 'Equipe 5',
            'equipe6': 'Equipe 6'
        };
        
        this.teamColors = {
            'Direction': '#2c3e50',
            'Equipe 1': '#ff6b35',
            'Equipe 2': '#f7931e',
            'Equipe 3': '#ffb627',
            'Equipe 4': '#e74c3c',
            'Equipe 5': '#9b59b6',
            'Equipe 6': '#3498db'
        };
        
        this.init();
    }

    /**
     * Initialisation du trombinoscope
     */
    init() {
        console.log('👥 Initialisation du trombinoscope...');
        this.bindEvents();
        this.loadEmployees();
    }

    /**
     * Liaison des événements
     */
    bindEvents() {
        // Filtres d'équipe
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const team = e.target.dataset.team;
                this.filterByTeam(team);
                this.updateActiveFilter(e.target);
            });
        });
        
        console.log('✅ Événements du trombinoscope configurés');
    }

    /**
     * Chargement des employés
     */
    async loadEmployees() {
        console.log('📥 Chargement des employés pour le trombinoscope...');
        
        this.showLoading(true);
        this.hideError();
        
        try {
            // Vérification DataManager
            if (typeof window.dataManager === 'undefined') {
                throw new Error('DataManager non disponible');
            }
            
            // Chargement des employés
            this.employees = await window.dataManager.getEmployees();
            console.log(`✅ ${this.employees.length} employés chargés pour le trombinoscope`);
            
            // Affichage des employés par équipe
            if (this.employees.length > 0) {
                this.logEmployeesByTeam();
                this.renderAllEmployees();
                this.showLoading(false);
            } else {
                throw new Error('Aucun employé trouvé dans les données');
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement trombinoscope:', error);
            this.showError(`Erreur lors du chargement: ${error.message}`);
            this.showLoading(false);
        }
    }

    /**
     * Log des employés par équipe pour debug
     */
    logEmployeesByTeam() {
        const teamStats = {};
        this.employees.forEach(emp => {
            if (!teamStats[emp.team]) {
                teamStats[emp.team] = [];
            }
            teamStats[emp.team].push(`${emp.firstName} ${emp.lastName}`);
        });
        
        console.log('📊 Répartition des employés par équipe:');
        Object.entries(teamStats).forEach(([team, members]) => {
            console.log(`   ${team}: ${members.length} membre(s) - ${members.join(', ')}`);
        });
    }

    /**
     * Affichage de tous les employés
     */
    renderAllEmployees() {
        console.log('🖼️ Rendu de tous les employés...');
        
        // Rendu de la direction
        this.renderDirection();
        
        // Rendu des équipes commerciales
        this.renderTeams();
    }

    /**
     * Rendu de la section Direction
     */
    renderDirection() {
        const directionGrid = document.getElementById('direction-grid');
        if (!directionGrid) return;
        
        const directionEmployees = this.employees.filter(emp => emp.team === 'Direction');
        console.log(`👑 Direction: ${directionEmployees.length} membre(s)`);
        
        if (directionEmployees.length === 0) {
            directionGrid.innerHTML = '<p class="no-employees">Aucun membre de la direction trouvé</p>';
            return;
        }
        
        directionGrid.innerHTML = directionEmployees.map(employee => 
            this.createEmployeeCard(employee, 'direction')
        ).join('');
    }

    /**
     * Rendu des équipes commerciales
     */
    renderTeams() {
        const teamsContainer = document.getElementById('teams-container');
        if (!teamsContainer) return;
        
        const teams = ['Equipe 1', 'Equipe 2', 'Equipe 3', 'Equipe 4', 'Equipe 5', 'Equipe 6'];
        
        teamsContainer.innerHTML = teams.map(teamName => {
            const teamEmployees = this.employees.filter(emp => emp.team === teamName);
            console.log(`🏢 ${teamName}: ${teamEmployees.length} membre(s)`);
            
            return `
                <div class="team-section" data-team="${teamName.toLowerCase().replace(' ', '')}">
                    <div class="team-header" style="background: ${this.teamColors[teamName]}">
                        <img src="../assets/images/equipe-${teamName.split(' ')[1]}.png" 
                             alt="Logo ${teamName}" 
                             class="team-logo"
                             onerror="this.style.display='none'">
                        <h3>${teamName}</h3>
                        <span class="team-count">${teamEmployees.length} membre(s)</span>
                    </div>
                    <div class="employees-grid">
                        ${teamEmployees.length > 0 
                            ? teamEmployees.map(emp => this.createEmployeeCard(emp, teamName.toLowerCase().replace(' ', ''))).join('')
                            : '<p class="no-employees">Aucun membre dans cette équipe</p>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Création d'une carte employé
     */
    createEmployeeCard(employee, teamClass) {
        const birthDate = employee.birthday ? new Date(employee.birthday).toLocaleDateString('fr-FR') : '';
        const startDate = employee.startDate ? new Date(employee.startDate).toLocaleDateString('fr-FR') : '';
        
        return `
            <div class="employee-card ${teamClass}" data-team="${employee.team}">
                <div class="employee-photo-container">
                    <img src="${employee.photo || '../assets/images/default-avatar.png'}" 
                         alt="Photo de ${employee.firstName} ${employee.lastName}"
                         class="employee-photo"
                         onerror="this.src='../assets/images/default-avatar.png'">
                </div>
                <div class="employee-info">
                    <h4 class="employee-name">${employee.firstName} ${employee.lastName}</h4>
                    <p class="employee-position">${employee.position}</p>
                    ${employee.email ? `<p class="employee-email">📧 ${employee.email}</p>` : ''}
                    ${birthDate ? `<p class="employee-birthday">🎂 ${birthDate}</p>` : ''}
                    ${startDate ? `<p class="employee-start">📅 Arrivée: ${startDate}</p>` : ''}
                    <span class="employee-team-badge" style="background: ${this.teamColors[employee.team] || '#ccc'}">
                        ${employee.team}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Filtrage par équipe
     */
    filterByTeam(filterKey) {
        console.log(`🔍 Filtrage par équipe: ${filterKey}`);
        
        this.currentFilter = filterKey;
        const targetTeam = this.teamMapping[filterKey];
        
        // Masquer toutes les sections
        document.querySelectorAll('.hierarchy-section').forEach(section => {
            section.style.display = 'none';
        });
        
        document.querySelectorAll('.team-section').forEach(section => {
            section.style.display = 'none';
        });
        
        if (filterKey === 'all') {
            // Afficher toutes les sections
            document.querySelectorAll('.hierarchy-section').forEach(section => {
                section.style.display = 'block';
            });
            document.querySelectorAll('.team-section').forEach(section => {
                section.style.display = 'block';
            });
        } else if (filterKey === 'direction') {
            // Afficher seulement la direction
            document.getElementById('direction-section').style.display = 'block';
        } else {
            // Afficher seulement l'équipe sélectionnée
            document.getElementById('teams-section').style.display = 'block';
            const teamSection = document.querySelector(`[data-team="${filterKey}"]`);
            if (teamSection) {
                teamSection.style.display = 'block';
            }
        }
        
        console.log(`✅ Filtrage appliqué: ${targetTeam || 'Toutes les équipes'}`);
    }

    /**
     * Mise à jour du filtre actif
     */
    updateActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    /**
     * Affichage du loading
     */
    showLoading(show) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.style.display = show ? 'block' : 'none';
        }
        this.isLoading = show;
    }

    /**
     * Affichage des erreurs
     */
    showError(message) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.innerHTML = `<p>${message}</p>`;
            errorMessage.classList.remove('hidden');
            errorMessage.style.display = 'block';
        }
    }

    /**
     * Masquage des erreurs
     */
    hideError() {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
            errorMessage.style.display = 'none';
        }
    }

    /**
     * Rechargement des données
     */
    async reload() {
        console.log('🔄 Rechargement du trombinoscope...');
        if (window.dataManager && window.dataManager.clearCache) {
            window.dataManager.clearCache();
        }
        await this.loadEmployees();
    }
}

// Initialisation globale
let trombinnoscopeManager;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM chargé, initialisation du trombinoscope...');
    
    // Attendre que DataManager soit chargé
    function initTrombinoscope() {
        if (typeof window.dataManager !== 'undefined') {
            trombinnoscopeManager = new TrombinnoscopeManager();
            console.log('✅ Trombinoscope initialisé avec succès');
        } else {
            console.log('⏳ Attente du DataManager...');
            setTimeout(initTrombinoscope, 100);
        }
    }
    
    initTrombinoscope();
});

// Export global pour debug
window.trombinnoscopeManager = trombinnoscopeManager;
