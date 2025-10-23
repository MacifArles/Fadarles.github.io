/**
 * Gestionnaire du trombinoscope avec filtrage par équipe
 * Charge et affiche les employés selon la hiérarchie organisationnelle
 * Version originale fonctionnelle
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
            console.log('Employés chargés:', this.employees);
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
                console.log('Filtre sélectionné:', team);
                this.filterByTeam(team);
                this.updateActiveFilter(e.target);
            });
        });
    }

    /**
     * Filtre les employés par équipe
     */
    filterByTeam(teamFilter) {
        this.currentFilter = teamFilter;
        console.log('Application du filtre:', teamFilter);
        
        if (teamFilter === 'all') {
            this.filteredEmployees = [...this.employees];
        } else if (teamFilter === 'direction') {
            // Direction inclut responsable + tous les managers
            this.filteredEmployees = this.employees.filter(employee => 
                employee.position.toLowerCase().includes('responsable') ||
                employee.position.toLowerCase().includes('manager')
            );
        } else {
            // Filtrage par équipe spécifique
            const teamNumber = teamFilter.replace('equipe', '');
            this.filteredEmployees = this.employees.filter(employee => 
                employee.team.toLowerCase().includes(teamNumber) ||
                employee.team.toLowerCase() === `équipe ${teamNumber}`
            );
        }
        
        console.log('Employés filtrés:', this.filteredEmployees);
        this.renderTrombinoscope();
    }

    /**
     * Met à jour le bouton de filtre actif
     */
    updateActiveFilter(activeButton) {
        // Retirer la classe active de tous les boutons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Ajouter la classe active au bouton cliqué
        activeButton.classList.add('active');
    }

    /**
     * Affiche la hiérarchie complète
     */
    renderTrombinoscope() {
        const container = document.getElementById('trombinoscope-container');
        if (!container) {
            console.error('Container du trombinoscope introuvable');
            return;
        }

        container.innerHTML = '';

        if (this.currentFilter === 'all') {
            this.renderHierarchy(container);
        } else if (this.currentFilter === 'direction') {
            this.renderDirection(container);
        } else {
            this.renderTeamEmployees(container);
        }
    }

    /**
     * Affiche la hiérarchie complète (Direction + Équipes)
     */
    renderHierarchy(container) {
        // Section Direction
        const directionSection = this.createSection('Direction', 'hierarchy-section');
        const responsable = this.employees.find(emp => 
            emp.position.toLowerCase().includes('responsable')
        );
        
        if (responsable) {
            const responsableCard = this.createEmployeeCard(responsable);
            responsableCard.classList.add('responsable');
            directionSection.appendChild(responsableCard);
        }

        container.appendChild(directionSection);

        // Section Équipes Commerciales
        const teamsSection = this.createSection('Équipes Commerciales', 'hierarchy-section');
        const teamsContainer = document.createElement('div');
        teamsContainer.className = 'teams-container';

        for (let i = 1; i <= 6; i++) {
            const teamEmployees = this.employees.filter(emp => 
                emp.team.toLowerCase().includes(i.toString()) ||
                emp.team.toLowerCase() === `équipe ${i}`
            );
            
            if (teamEmployees.length > 0) {
                const teamCard = this.createTeamCard(i, teamEmployees);
                teamsContainer.appendChild(teamCard);
            }
        }

        teamsSection.appendChild(teamsContainer);
        container.appendChild(teamsSection);
    }

    /**
     * Affiche seulement la direction avec managers
     */
    renderDirection(container) {
        const section = this.createSection('Direction & Management', 'hierarchy-section');
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
        const teamNumber = this.currentFilter.replace('equipe', '');
        const section = this.createSection(`Équipe ${teamNumber}`, 'hierarchy-section');
        const grid = document.createElement('div');
        grid.className = 'team-employees-grid';

        this.filteredEmployees.forEach(employee => {
            const card = this.createEmployeeCard(employee);
            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }

    /**
     * Crée une section avec titre
     */
    createSection(title, className) {
        const section = document.createElement('div');
        section.className = className;
        
        const titleElement = document.createElement('h2');
        titleElement.className = 'section-title';
        titleElement.textContent = title;
        
        section.appendChild(titleElement);
        return section;
    }

    /**
     * Crée une carte d'équipe avec ses employés
     */
    createTeamCard(teamNumber, employees) {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        
        // Couleur de l'équipe
        const color = this.teamColors[`equipe${teamNumber}`] || '#6c5ce7';
        teamCard.style.borderColor = color;

        // En-tête de l'équipe avec logo
        const teamHeader = document.createElement('div');
        teamHeader.className = 'team-header';
        teamHeader.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
        
        const teamLogo = document.createElement('img');
        teamLogo.src = `assets/images/equipe-${teamNumber}.png`;
        teamLogo.alt = `Logo Équipe ${teamNumber}`;
        teamLogo.className = 'team-logo';
        teamLogo.onerror = () => teamLogo.style.display = 'none';
        
        const teamTitle = document.createElement('h3');
        teamTitle.textContent = `Équipe ${teamNumber}`;
        teamTitle.className = 'team-title';
        
        teamHeader.appendChild(teamLogo);
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
     * Crée une carte d'employé complète
     */
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

    /**
     * Crée une mini-carte d'employé pour les équipes
     */
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

    /**
     * Cache le spinner de chargement
     */
    hideLoading() {
        const loading = document.querySelector('.loading-message');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * Affiche un message d'erreur
     */
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

// Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du trombinoscope...');
    new TrombinoscopeManager();
});
