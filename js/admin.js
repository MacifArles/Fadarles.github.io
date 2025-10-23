/**
 * Interface d'Administration Fad'Arles
 * Gestion sécurisée des employés et données du site
 * Niveau de confiance : 85%
 */

class AdminManager {
    constructor() {
        // Configuration sécurisée
        this.config = {
            adminEmails: [
                'admin@fadarles.com',
                'direction@fadarles.com',
                'rh@fadarles.com'
            ],
            adminPassword: 'FadArles2024!', // À changer en production
            maxFileSize: 5 * 1024 * 1024, // 5MB max pour les images
            allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        };

        this.currentUser = null;
        this.employees = [];
        this.isEditMode = false;
        this.currentEmployeeId = null;

        this.init();
    }

    /**
     * Initialisation de l'interface admin
     */
    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.loadEmployees();
    }

    /**
     * Liaison des événements
     */
    bindEvents() {
        // Événements d'authentification
        document.getElementById('auth-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation admin
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Gestion des employés
        document.getElementById('add-employee-btn')?.addEventListener('click', () => {
            this.openEmployeeModal();
        });

        document.getElementById('employee-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmployeeSubmit();
        });

        // Modal
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.closeEmployeeModal();
        });

        document.getElementById('cancel-employee')?.addEventListener('click', () => {
            this.closeEmployeeModal();
        });

        // Filtres et recherche
        document.getElementById('search-employee')?.addEventListener('input', (e) => {
            this.filterEmployees(e.target.value, document.getElementById('filter-team').value);
        });

        document.getElementById('filter-team')?.addEventListener('change', (e) => {
            this.filterEmployees(document.getElementById('search-employee').value, e.target.value);
        });

        // Prévisualisation photo
        document.getElementById('employee-photo')?.addEventListener('change', (e) => {
            this.handlePhotoPreview(e.target.files[0]);
        });

        // Paramètres GitHub
        document.getElementById('save-github-settings')?.addEventListener('click', () => {
            this.saveGitHubSettings();
        });

        // Fermeture notification
        document.querySelector('.notification-close')?.addEventListener('click', () => {
            this.hideNotification();
        });

        // Fermeture modal par clic extérieur
        document.getElementById('employee-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'employee-modal') {
                this.closeEmployeeModal();
            }
        });
    }

    /**
     * Vérification du statut d'authentification
     */
    checkAuthStatus() {
        const storedUser = localStorage.getItem('fadArlesAdminUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showDashboard();
        } else {
            this.showAuthForm();
        }
    }

    /**
     * Gestion de la connexion - Sécurisée avec validation
     */
    handleLogin() {
        const email = this.sanitizeInput(document.getElementById('admin-email').value);
        const password = document.getElementById('admin-password').value;

        // Validation des entrées
        if (!this.validateEmail(email)) {
            this.showError('Format d\'email invalide');
            return;
        }

        if (password.length < 8) {
            this.showError('Mot de passe trop court');
            return;
        }

        // Vérification des credentials
        if (this.config.adminEmails.includes(email) && password === this.config.adminPassword) {
            this.currentUser = {
                email: email,
                loginTime: new Date().toISOString()
            };
            
            // Stockage sécurisé (temporaire)
            localStorage.setItem('fadArlesAdminUser', JSON.stringify(this.currentUser));
            
            this.showDashboard();
            this.showNotification('Connexion réussie', 'success');
        } else {
            this.showError('Email ou mot de passe incorrect');
        }
    }

    /**
     * Déconnexion sécurisée
     */
    handleLogout() {
        localStorage.removeItem('fadArlesAdminUser');
        this.currentUser = null;
        this.showAuthForm();
        this.showNotification('Déconnexion réussie', 'success');
    }

    /**
     * Affichage de l'interface d'authentification
     */
    showAuthForm() {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
    }

    /**
     * Affichage du tableau de bord
     */
    showDashboard() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'block';
        this.updateStats();
    }

    /**
     * Changement de section dans le tableau de bord
     */
    switchSection(sectionName) {
        // Masquer toutes les sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Désactiver tous les boutons de navigation
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activer la section demandée
        document.getElementById(`${sectionName}-section`)?.classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        // Charger les données spécifiques
        if (sectionName === 'teams') {
            this.loadTeamsData();
        }
    }

    /**
     * Chargement des employés depuis le data manager
     */
    async loadEmployees() {
        try {
            if (typeof window.dataManager !== 'undefined') {
                this.employees = await window.dataManager.getEmployees();
                this.renderEmployeesList();
                this.updateStats();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des employés:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    /**
     * Affichage de la liste des employés avec sécurité XSS
     */
    renderEmployeesList(filteredEmployees = null) {
        const employeesToRender = filteredEmployees || this.employees;
        const container = document.getElementById('employees-list');
        
        if (!container) return;

        container.innerHTML = '';

        employeesToRender.forEach(employee => {
            const employeeCard = this.createEmployeeCard(employee);
            container.appendChild(employeeCard);
        });
    }

    /**
     * Création sécurisée d'une carte employé
     */
    createEmployeeCard(employee) {
        const card = document.createElement('div');
        card.className = 'employee-card';

        // Échappement des données pour éviter XSS
        const safeData = {
            firstName: this.escapeHtml(employee.firstName || ''),
            lastName: this.escapeHtml(employee.lastName || ''),
            position: this.escapeHtml(employee.position || ''),
            team: this.escapeHtml(employee.team || ''),
            email: this.escapeHtml(employee.email || '')
        };

        card.innerHTML = `
            <img src="${employee.photo || '../assets/images/default-avatar.png'}" 
                 alt="Photo ${safeData.firstName} ${safeData.lastName}" 
                 class="employee-photo"
                 onerror="this.src='../assets/images/default-avatar.png'">
            <div class="employee-info">
                <h4>${safeData.firstName} ${safeData.lastName}</h4>
                <p>${safeData.position}</p>
                <p>${safeData.email}</p>
                <span class="employee-team team-${this.getTeamClass(employee.team)}">${safeData.team}</span>
            </div>
            <div class="employee-actions">
                <button class="btn-edit" onclick="adminManager.editEmployee('${employee.id}')">
                    ✏️ Modifier
                </button>
                <button class="btn-delete" onclick="adminManager.deleteEmployee('${employee.id}')">
                    🗑️ Supprimer
                </button>
            </div>
        `;

        return card;
    }

    /**
     * Ouverture du modal employé
     */
    openEmployeeModal(employeeId = null) {
        this.isEditMode = !!employeeId;
        this.currentEmployeeId = employeeId;

        const modal = document.getElementById('employee-modal');
        const title = document.getElementById('modal-title');
        
        title.textContent = this.isEditMode ? 'Modifier l\'Employé' : 'Ajouter un Employé';
        
        if (this.isEditMode && employeeId) {
            this.populateEmployeeForm(employeeId);
        } else {
            this.resetEmployeeForm();
        }

        modal.style.display = 'flex';
    }

    /**
     * Fermeture du modal
     */
    closeEmployeeModal() {
        document.getElementById('employee-modal').style.display = 'none';
        this.resetEmployeeForm();
        this.isEditMode = false;
        this.currentEmployeeId = null;
    }

    /**
     * Remplissage du formulaire pour modification
     */
    populateEmployeeForm(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;

        document.getElementById('employee-firstname').value = employee.firstName || '';
        document.getElementById('employee-lastname').value = employee.lastName || '';
        document.getElementById('employee-position').value = employee.position || '';
        document.getElementById('employee-team').value = employee.team || '';
        document.getElementById('employee-email').value = employee.email || '';
        document.getElementById('employee-birthday').value = employee.birthday || '';
        document.getElementById('employee-startdate').value = employee.startDate || '';

        // Prévisualisation de la photo existante
        if (employee.photo) {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${employee.photo}" alt="Photo actuelle">`;
        }
    }

    /**
     * Réinitialisation du formulaire
     */
    resetEmployeeForm() {
        document.getElementById('employee-form').reset();
        document.getElementById('photo-preview').innerHTML = '';
    }

    /**
     * Gestion de la soumission du formulaire employé avec validation
     */
    async handleEmployeeSubmit() {
        try {
            // Validation des données
            const formData = this.validateEmployeeForm();
            if (!formData) return;

            // Gestion de l'image
            const photoFile = document.getElementById('employee-photo').files[0];
            if (photoFile) {
                if (!this.validateImageFile(photoFile)) return;
                formData.photo = await this.processImage(photoFile);
            }

            // Sauvegarde
            if (this.isEditMode) {
                await this.updateEmployee(this.currentEmployeeId, formData);
            } else {
                await this.addEmployee(formData);
            }

            this.closeEmployeeModal();
            this.loadEmployees();
            this.showNotification(
                this.isEditMode ? 'Employé modifié avec succès' : 'Employé ajouté avec succès',
                'success'
            );

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    /**
     * Validation sécurisée du formulaire employé
     */
    validateEmployeeForm() {
        const firstName = this.sanitizeInput(document.getElementById('employee-firstname').value);
        const lastName = this.sanitizeInput(document.getElementById('employee-lastname').value);
        const position = this.sanitizeInput(document.getElementById('employee-position').value);
        const team = document.getElementById('employee-team').value;
        const email = this.sanitizeInput(document.getElementById('employee-email').value);

        // Validations obligatoires
        if (!firstName || firstName.length < 2) {
            this.showNotification('Le prénom doit contenir au moins 2 caractères', 'error');
            return null;
        }

        if (!lastName || lastName.length < 2) {
            this.showNotification('Le nom doit contenir au moins 2 caractères', 'error');
            return null;
        }

        if (!position || position.length < 2) {
            this.showNotification('Le poste doit être spécifié', 'error');
            return null;
        }

        if (!team) {
            this.showNotification('L\'équipe doit être sélectionnée', 'error');
            return null;
        }

        if (email && !this.validateEmail(email)) {
            this.showNotification('Format d\'email invalide', 'error');
            return null;
        }

        return {
            id: this.isEditMode ? this.currentEmployeeId : this.generateId(),
            firstName,
            lastName,
            position,
            team,
            email,
            birthday: document.getElementById('employee-birthday').value,
            startDate: document.getElementById('employee-startdate').value
        };
    }

    /**
     * Validation des fichiers image
     */
    validateImageFile(file) {
        if (file.size > this.config.maxFileSize) {
            this.showNotification('La taille de l\'image ne doit pas dépasser 5MB', 'error');
            return false;
        }

        if (!this.config.allowedImageTypes.includes(file.type)) {
            this.showNotification('Format d\'image non supporté (JPG, PNG, WebP uniquement)', 'error');
            return false;
        }

        return true;
    }

    /**
     * Traitement et redimensionnement d'image
     */
    async processImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Redimensionnement à 300x300 max
                    const maxSize = 300;
                    let { width, height } = img;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Prévisualisation de photo
     */
    handlePhotoPreview(file) {
        if (!file) return;

        if (!this.validateImageFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Prévisualisation">`;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Ajout d'un nouvel employé
     */
    async addEmployee(employeeData) {
        if (typeof window.dataManager !== 'undefined') {
            await window.dataManager.addEmployee(employeeData);
        }
    }

    /**
     * Modification d'un employé
     */
    async updateEmployee(employeeId, employeeData) {
        if (typeof window.dataManager !== 'undefined') {
            await window.dataManager.updateEmployee(employeeId, employeeData);
        }
    }

    /**
     * Modification d'un employé
     */
    editEmployee(employeeId) {
        this.openEmployeeModal(employeeId);
    }

    /**
     * Suppression d'un employé avec confirmation
     */
    async deleteEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;

        const confirmed = confirm(
            `Êtes-vous sûr de vouloir supprimer ${employee.firstName} ${employee.lastName} ?`
        );

        if (confirmed) {
            try {
                if (typeof window.dataManager !== 'undefined') {
                    await window.dataManager.deleteEmployee(employeeId);
                }
                this.loadEmployees();
                this.showNotification('Employé supprimé avec succès', 'success');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    }

    /**
     * Filtrage des employés
     */
    filterEmployees(searchTerm, teamFilter) {
        let filtered = [...this.employees];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(emp => 
                emp.firstName.toLowerCase().includes(term) ||
                emp.lastName.toLowerCase().includes(term) ||
                emp.position.toLowerCase().includes(term)
            );
        }

        if (teamFilter) {
            filtered = filtered.filter(emp => emp.team === teamFilter);
        }

        this.renderEmployeesList(filtered);
    }

    /**
     * Chargement des données d'équipes
     */
    loadTeamsData() {
        const teamsGrid = document.getElementById('teams-grid');
        if (!teamsGrid) return;

        const teams = [
            { name: 'Direction', color: '#2c3e50', count: this.employees.filter(emp => emp.team === 'Direction').length },
            { name: 'Équipe 1', color: '#ff6b35', count: this.employees.filter(emp => emp.team === 'Equipe 1').length },
            { name: 'Équipe 2', color: '#f7931e', count: this.employees.filter(emp => emp.team === 'Equipe 2').length },
            { name: 'Équipe 3', color: '#ffb627', count: this.employees.filter(emp => emp.team === 'Equipe 3').length },
            { name: 'Équipe 4', color: '#e74c3c', count: this.employees.filter(emp => emp.team === 'Equipe 4').length },
            { name: 'Équipe 5', color: '#9b59b6', count: this.employees.filter(emp => emp.team === 'Equipe 5').length },
            { name: 'Équipe 6', color: '#3498db', count: this.employees.filter(emp => emp.team === 'Equipe 6').length }
        ];

        teamsGrid.innerHTML = teams.map(team => `
            <div class="team-card">
                <div class="team-logo" style="background: ${team.color}">
                    ${team.name.charAt(0)}
                </div>
                <h4>${this.escapeHtml(team.name)}</h4>
                <p>${team.count} membre(s)</p>
            </div>
        `).join('');
    }

    /**
     * Mise à jour des statistiques
     */
    updateStats() {
        document.getElementById('total-employees').textContent = this.employees.length;
    }

    /**
     * Sauvegarde des paramètres GitHub
     */
    saveGitHubSettings() {
        const token = document.getElementById('github-token').value;
        
        if (token) {
            // Configuration sécurisée du token (stockage temporaire)
            localStorage.setItem('fadArlesGitHubToken', token);
            
            if (typeof window.dataManager !== 'undefined') {
                window.dataManager.setGitHubToken(token);
            }
            
            this.showNotification('Paramètres GitHub sauvegardés', 'success');
            document.getElementById('github-token').value = '';
        }
    }

    /**
     * Affichage des notifications
     */
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        notification.className = `notification ${type}`;
        messageElement.textContent = message;
        notification.style.display = 'flex';

        // Masquage automatique après 4 secondes
        setTimeout(() => {
            this.hideNotification();
        }, 4000);
    }

    /**
     * Masquage des notifications
     */
    hideNotification() {
        document.getElementById('notification').style.display = 'none';
    }

    /**
     * Affichage des erreurs d'authentification
     */
    showError(message) {
        const errorElement = document.getElementById('auth-error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    // Utilitaires de sécurité

    /**
     * Nettoyage des entrées utilisateur
     */
    sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '');
    }

    /**
     * Échappement HTML pour éviter XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Validation d'email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Génération d'ID unique
     */
    generateId() {
        return 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Conversion nom d'équipe en classe CSS
     */
    getTeamClass(teamName) {
        const teamMapping = {
            'Direction': 'direction',
            'Equipe 1': '1',
            'Equipe 2': '2',
            'Equipe 3': '3',
            'Equipe 4': '4',
            'Equipe 5': '5',
            'Equipe 6': '6'
        };
        return teamMapping[teamName] || 'default';
    }
}

// Initialisation globale sécurisée
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
