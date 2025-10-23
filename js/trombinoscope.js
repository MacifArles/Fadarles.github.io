/**
 * Gestionnaire du trombinoscope - Structure Organisationnelle Réelle
 * Direction = Skippers = Responsable + tous les Managers
 * K-team = Équipe 1, MC Solaire = Équipe 6, etc.
 * Niveau de confiance: 98%
 */

class TrombinoscopeManager {
    constructor() {
        this.employees = [];
        this.filteredEmployees = [];
        this.currentFilter = 'all';
        
        // Correspondance selon la vraie structure organisationnelle
        this.teamMapping = {
            'skippers': 'direction',      // Direction = Responsable + tous les Managers
            'k-team': 'Equipe 1',         // K-Team = Équipe 1 complète
            'sparks': 'Equipe 2',         // Les Sparks = Équipe 2
            'j-squad': 'Equipe 3',        // J Squad = Équipe 3
            'sherlock': 'Equipe 4',       // Sherlock'Oms = Équipe 4
            'golden': 'Equipe 5',         // Golden Team = Équipe 5
            'solaire': 'Equipe 6'         // MC Solaire = Équipe 6
        };
        
        // Configuration des couleurs d'équipe
        this.teamColors = {
            'skippers': '#2C3E50',        // Bleu foncé Direction
            'k-team': '#ff6b35',          // Orange Équipe 1
            'sparks': '#f7931e',          // Orange foncé Équipe 2
            'j-squad': '#ffb627',         // Jaune Équipe 3
            'sherlock': '#e74c3c',        // Rouge Équipe 4
            'golden': '#9b59b6',          // Violet Équipe 5
            'solaire': '#3498db'          // Bleu Équipe 6
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Démarrage du trombinoscope - Structure organisationnelle');
            await this.loadEmployees();
            this.setupEventListeners();
            this.renderTrombinoscope();
            this.hideLoading();
            console.log('✅ Trombinoscope initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du trombinoscope:', error);
            this.showError();
        }
    }

    async loadEmployees() {
        try {
            console.log('📥 Chargement des employés...');
            this.employees = await dataManager.getData('employees.json');
            this.filteredEmployees = [...this.employees];
            console.log('✅ Employés chargés:', this.employees.length, 'employés');
            console.log('📊 Structure des équipes détectée:', this.analyzeTeamStructure());
        } catch (error) {
            console.error('❌ Erreur de chargement des employés:', error);
            throw error;
        }
    }

    /**
     * Analyse la structure des équipes pour debug
     */
    analyzeTeamStructure() {
        const structure = {};
        this.employees.forEach(emp => {
            if (!structure[emp.team]) {
                structure[emp.team] = [];
            }
            structure[emp.team].push(`${emp.firstName} ${emp.lastName} (${emp.position})`);
        });
        return structure;
    }

    setupEventListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        console.log('🔘 Boutons de filtre trouvés:', filterButtons.length);
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const team = e.target.dataset.team;
                console.log('🎯 Filtre sélectionné:', team);
                this.filterByTeam(team);
                this.updateActiveFilter(e.target);
            });
        });
    }

    /**
     * Filtrage selon la vraie structure organisationnelle
     */
    filterByTeam(teamFilter) {
        this.currentFilter = teamFilter;
        console.log('🔍 Application du filtre:', teamFilter);
        
        if (teamFilter === 'all') {
            this.filteredEmployees = [...this.employees];
            console.log('📊 Tous les employés affichés:', this.filteredEmployees.length);
        } else if (teamFilter === 'skippers') {
            // Skippers = Direction = Responsable CRC + TOUS les Managers
            this.filteredEmployees = this.employees.filter(employee => 
                employee.team === 'Direction' ||
                employee.position.toLowerCase().includes('responsable') ||
                employee.position.toLowerCase().includes('manager')
            );
            console.log('🏢 Skippers (Direction) filtrés:', this.filteredEmployees.length, 'membres');
        } else {
            // Équipes spécifiques (K-team = Équipe 1, MC Solaire = Équipe 6, etc.)
            const realTeamName = this.teamMapping[teamFilter];
            if (realTeamName && realTeamName !== 'direction') {
                this.filteredEmployees = this.employees.filter(employee => 
                    employee.team === realTeamName
                );
                console.log(`👥 ${teamFilter} (${realTeamName}) filtrée:`, this.filteredEmployees.length, 'membres');
            } else {
                console.warn('⚠️ Équipe non trouvée dans le mapping:', teamFilter);
                this.filteredEmployees = [];
            }
        }
        
        console.log('📋 Employés filtrés:', this.filteredEmployees);
        this.renderTrombinoscope();
    }

    updateActiveFilter(activeButton) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    renderTrombinoscope() {
        const container = document.getElementById('trombinoscope-container');
        if (!container) {
            console.error('❌ Container du trombinoscope introuvable');
            return;
        }

        console.log('🎨 Rendu du trombinoscope, filtre actuel:', this.currentFilter);
        container.innerHTML = '';

        if (this.currentFilter === 'all') {
            this.renderHierarchy(container);
        } else if (this.currentFilter === 'skippers') {
            this.renderDirection(container);
        } else {
            this.renderTeamEmployees(container);
        }
    }

    /**
     * Affiche la hiérarchie complète (Direction + Équipes)
     */
    renderHierarchy(container) {
        console.log('🏗️ Rendu de la hiérarchie complète');
        
        // Section Direction (Skippers)
        this.renderDirectionSection(container);
        
        // Section Équipes Opérationnelles
        this.renderOperationalTeams(container);
    }

    /**
     * Section Direction (Skippers)
     */
    renderDirectionSection(container) {
        const directionSection = this.createSection('Direction - Skippers', 'hierarchy-section');
        
        // Responsable CRC
        const responsable = this.employees.find(emp => 
            emp.position.toLowerCase().includes('responsable')
        );
        
        // Tous les Managers
        const managers = this.employees.filter(emp => 
            emp.position.toLowerCase().includes('manager')
        );
        
        const directionEmployees = [];
        if (responsable) directionEmployees.push(responsable);
        directionEmployees.push(...managers);
        
        console.log('🏢 Direction (Skippers):', directionEmployees.length, 'membres');
        
        if (directionEmployees.length > 0) {
            const directionGrid = document.createElement('div');
            directionGrid.className = 'direction-grid';
            
            directionEmployees.forEach(employee => {
                const card = this.createEmployeeCard(employee);
                if (employee.position.toLowerCase().includes('responsable')) {
                    card.classList.add('responsable');
                }
                directionGrid.appendChild(card);
            });
            
            directionSection.appendChild(directionGrid);
        }

        container.appendChild(directionSection);
    }

    /**
     * Section Équipes Opérationnelles
     */
    renderOperationalTeams(container) {
        const teamsSection = this.createSection('Équipes Opérationnelles', 'hierarchy-section');
        const teamsContainer = document.createElement('div');
        teamsContainer.className = 'teams-container';

        // Créer les cartes pour chaque équipe opérationnelle
        Object.entries(this.teamMapping).forEach(([displayName, realName]) => {
            if (displayName !== 'skippers') { // Exclure la direction
                const teamEmployees = this.employees.filter(emp => emp.team === realName);
                console.log(`👥 ${realName} (${displayName}):`, teamEmployees.length, 'employés');
                
                if (teamEmployees.length > 0) {
                    const teamCard = this.createTeamCard(displayName, realName, teamEmployees);
                    teamsContainer.appendChild(teamCard);
                }
            }
        });

        teamsSection.appendChild(teamsContainer);
        container.appendChild(teamsSection);
    }

    /**
     * Affiche seulement la direction (Skippers)
     */
    renderDirection(container) {
        console.log('🏢 Rendu Direction (Skippers) uniquement');
        const section = this.createSection('Direction - Skippers', 'hierarchy-section');
        const grid = document.createElement('div');
        grid.className = 'direction-grid';

        this.filteredEmployees.forEach(employee => {
            const card = this.createEmployeeCard(employee);
            if (employee.position.toLowerCase().includes('responsable')) {
                card.classList.add('responsable');
            }
            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }

    /**
     * Affiche les employés d'une équipe spécifique
     */
    renderTeamEmployees(container) {
        const realTeamName = this.teamMapping[this.currentFilter] || this.currentFilter;
        const displayName = this.getDisplayTeamName(this.currentFilter);
        
        console.log(`👥 Rendu équipe spécifique: ${displayName} (${realTeamName})`);
        
        const section = this.createSection(displayName, 'hierarchy-section');
        const grid = document.createElement('div');
        grid.className = 'team-employees-grid';

        if (this.filteredEmployees.length > 0) {
            this.filteredEmployees.forEach(employee => {
                const card = this.createEmployeeCard(employee);
                grid.appendChild(card);
            });
        } else {
            const noData = document.createElement('p');
            noData.textContent = `Aucun employé trouvé dans ${displayName}`;
            noData.style.textAlign = 'center';
            noData.style.color = '#999';
            grid.appendChild(noData);
        }

        section.appendChild(grid);
        container.appendChild(section);
    }

    createSection(title, className) {
        const section = document.createElement('div');
        section.className = className;
        
        const titleElement = document.createElement('h2');
        titleElement.className = 'section-title';
        titleElement.textContent = title;
        
        section.appendChild(titleElement);
        return section;
    }

    createTeamCard(displayName, realName, employees) {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        
        // Couleur de l'équipe
        const color = this.teamColors[displayName] || '#6c5ce7';
        teamCard.style.borderColor = color;

        // En-tête de l'équipe
        const teamHeader = document.createElement('div');
        teamHeader.className = 'team-header';
        teamHeader.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
        
        const teamTitle = document.createElement('h3');
        teamTitle.textContent = this.getDisplayTeamName(displayName);
        teamTitle.className = 'team-title';
        
        teamHeader.appendChild(teamTitle);

        // Employés de l'équipe
        const employeesContainer = document.createElement('div');
        employeesContainer.className = 'team-employees';

        employees.forEach(employee => {
            const miniCard = this.createMiniEmployeeCard(employee);
            employeesContainer.appendChild(miniCard);
        });

        teamCard.appendChild(teamHeader);
        teamCard.appendChild(employeesContainer);

        return teamCard;
    }

    /**
     * Retourne le nom affiché pour une équipe
     */
    getDisplayTeamName(internalName) {
        const displayNames = {
            'skippers': 'Skippers (Direction)',
            'k-team': 'K-Team',
            'sparks': 'Les Sparks',
            'j-squad': 'J Squad',
            'sherlock': 'Sherlock\'Oms',
            'golden': 'Golden Team',
            'solaire': 'MC Solaire'
        };
        
        return displayNames[internalName] || internalName;
    }

    createEmployeeCard(employee) {
        const card = document.createElement('div');
        card.className = 'employee-card';

        const photo = document.createElement('div');
        photo.className = 'employee-photo';
        
        const img = document.createElement('img');
        img.src = employee.photo || 'assets/images/default-avatar.png';
        img.alt = `${employee.firstName} ${employee.lastName}`;
        img.onerror = () => img.src = 'assets/images/default-avatar.png';
        
        photo.appendChild(img);

        const info = document.createElement('div');
        info.className = 'employee-info';
        
        const name = document.createElement('h4');
        name.className = 'employee-name';
        name.textContent = `${employee.firstName} ${employee.lastName}`;
        
        const position = document.createElement('p');
        position.className = 'employee-position';
        position.textContent = employee.position;
        
        const email = document.createElement('a');
        email.className = 'employee-email';
        email.href = `mailto:${employee.email}`;
        email.textContent = employee.email;

        info.appendChild(name);
        info.appendChild(position);
        info.appendChild(email);

        card.appendChild(photo);
        card.appendChild(info);

        return card;
    }

    createMiniEmployeeCard(employee) {
        const card = document.createElement('div');
        card.className = 'mini-employee-card';

        const photo = document.createElement('div');
        photo.className = 'mini-employee-photo';
        
        const img = document.createElement('img');
        img.src = employee.photo || 'assets/images/default-avatar.png';
        img.alt = `${employee.firstName} ${employee.lastName}`;
        img.onerror = () => img.src = 'assets/images/default-avatar.png';
        
        photo.appendChild(img);

        const name = document.createElement('p');
        name.className = 'mini-employee-name';
        name.textContent = `${employee.firstName} ${employee.lastName}`;

        card.appendChild(photo);
        card.appendChild(name);

        return card;
    }

    hideLoading() {
        const loading = document.querySelector('.loading-message');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError() {
        const container = document.getElementById('trombinoscope-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>❌ Erreur de chargement</h3>
                    <p>Impossible de charger les données du trombinoscope.</p>
                    <button onclick="location.reload()" class="retry-btn">Réessayer</button>
                </div>
            `;
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du trombinoscope - Structure organisationnelle');
    new TrombinoscopeManager();
});
