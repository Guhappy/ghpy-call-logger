class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.logs = this.loadLogs();
        this.currentEditingProject = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayProjects();
        this.updateProjectCount();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('backToMainBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Add new project
        document.getElementById('addNewProjectBtn').addEventListener('click', () => {
            this.showAddProjectModal();
        });

        // Search functionality
        document.getElementById('projectSearchBox').addEventListener('input', (e) => {
            this.searchProjects(e.target.value);
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDeleteProject();
        });

        document.getElementById('deleteProjectBtn').addEventListener('click', () => {
            this.handleDeleteFromModal();
        });

        // Form submission
        document.getElementById('projectEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            const editModal = document.getElementById('projectEditModal');
            const deleteModal = document.getElementById('deleteConfirmModal');
            
            if (e.target === editModal) {
                this.hideModal();
            }
            if (e.target === deleteModal) {
                this.hideDeleteModal();
            }
        });

        // Enter key shortcuts
        document.getElementById('projectEditForm').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.saveProject();
            }
        });
    }

    // Project data management
    loadProjects() {
        const saved = localStorage.getItem('constructionProjects');
        const projects = saved ? JSON.parse(saved) : [];
        
        // Migrate existing projects to include new fields
        return projects.map(project => ({
            ...project,
            shortname: project.shortname || '',
            notes: project.notes || ''
        }));
    }

    saveProjects() {
        localStorage.setItem('constructionProjects', JSON.stringify(this.projects));
    }

    loadLogs() {
        const saved = localStorage.getItem('constructionLogs');
        return saved ? JSON.parse(saved) : [];
    }

    // Project CRUD operations
    addProject(projectData) {
        const project = {
            id: Date.now().toString(),
            name: projectData.name.trim(),
            shortname: projectData.shortname.trim(),
            location: projectData.location.trim(),
            description: projectData.description.trim(),
            notes: projectData.notes.trim(),
            createdAt: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveProjects();
        return project;
    }

    updateProject(projectId, projectData) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return false;

        this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            name: projectData.name.trim(),
            shortname: projectData.shortname.trim(),
            location: projectData.location.trim(),
            description: projectData.description.trim(),
            notes: projectData.notes.trim(),
            updatedAt: new Date().toISOString()
        };

        this.saveProjects();
        return true;
    }

    deleteProject(projectId) {
        // Check if project has logs
        const projectLogs = this.logs.filter(log => log.projectId === projectId);
        if (projectLogs.length > 0) {
            return {
                success: false,
                message: `Cannot delete project. It has ${projectLogs.length} log entries. Please delete the logs first.`
            };
        }

        this.projects = this.projects.filter(p => p.id !== projectId);
        this.saveProjects();
        return { success: true };
    }

    getProjectStats(projectId) {
        const projectLogs = this.logs.filter(log => log.projectId === projectId);
        const followUps = projectLogs.filter(log => log.followUp).length;
        
        return {
            totalLogs: projectLogs.length,
            followUps: followUps
        };
    }

    // Search functionality
    searchProjects(searchTerm) {
        const filteredProjects = this.filterProjects(searchTerm);
        this.displayProjects(filteredProjects);
        this.updateProjectCount(filteredProjects.length);
    }

    filterProjects(searchTerm) {
        if (!searchTerm.trim()) {
            return this.projects;
        }

        const term = searchTerm.toLowerCase();
        return this.projects.filter(project => {
            return project.name.toLowerCase().includes(term) ||
                   project.shortname.toLowerCase().includes(term) ||
                   project.location.toLowerCase().includes(term) ||
                   project.description.toLowerCase().includes(term) ||
                   project.notes.toLowerCase().includes(term);
        });
    }

    // Display functions
    displayProjects(projects = this.projects) {
        const projectsList = document.getElementById('projectsList');
        const noProjectsMessage = document.getElementById('noProjectsMessage');

        if (projects.length === 0) {
            projectsList.style.display = 'none';
            noProjectsMessage.style.display = 'block';
            return;
        }

        projectsList.style.display = 'grid';
        noProjectsMessage.style.display = 'none';

        projectsList.innerHTML = projects.map(project => {
            const stats = this.getProjectStats(project.id);
            const createdDate = new Date(project.createdAt).toLocaleDateString();
            
            return `
                <div class="project-card" data-project-id="${project.id}" onclick="projectManager.showEditProjectModal('${project.id}')">
                    <div class="project-card-header">
                        <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                        ${project.shortname ? `<span class="project-shortname">${this.escapeHtml(project.shortname)}</span>` : ''}
                    </div>
                    
                    ${project.location ? `<div class="project-location">${this.escapeHtml(project.location)}</div>` : ''}
                    
                    ${project.description ? `<div class="project-description">${this.escapeHtml(project.description)}</div>` : ''}
                    
                    ${project.notes ? `
                        <div class="project-notes">
                            <div class="project-notes-label">Notes:</div>
                            <div class="project-notes-content">${this.escapeHtml(project.notes)}</div>
                        </div>
                    ` : ''}
                    
                    <div class="project-meta">
                        <div class="project-stats">
                            <span class="stat-item">📝 ${stats.totalLogs} logs</span>
                            ${stats.followUps > 0 ? `<span class="stat-item">📌 ${stats.followUps} follow-ups</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateProjectCount(count = this.projects.length) {
        const countElement = document.getElementById('projectCount');
        countElement.textContent = `${count} project${count !== 1 ? 's' : ''} found`;
    }

    // Modal functions
    showAddProjectModal() {
        this.currentEditingProject = null;
        document.getElementById('modalTitle').textContent = 'Add New Project';
        document.getElementById('editProjectId').value = '';
        document.getElementById('projectEditForm').reset();
        document.getElementById('deleteProjectBtn').style.display = 'none'; // Hide delete button for new projects
        document.getElementById('projectMetaInfo').style.display = 'none'; // Hide meta info for new projects
        document.getElementById('projectEditModal').style.display = 'block';
        document.getElementById('editProjectName').focus();
    }

    showEditProjectModal(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        this.currentEditingProject = project;
        document.getElementById('modalTitle').textContent = 'Edit Project';
        document.getElementById('editProjectId').value = project.id;
        document.getElementById('editProjectName').value = project.name;
        document.getElementById('editProjectShortname').value = project.shortname || '';
        document.getElementById('editProjectLocation').value = project.location || '';
        document.getElementById('editProjectDescription').value = project.description || '';
        document.getElementById('editProjectNotes').value = project.notes || '';
        document.getElementById('deleteProjectBtn').style.display = 'inline-block'; // Show delete button for existing projects
        
        // Show project metadata
        const createdDate = new Date(project.createdAt).toLocaleDateString();
        const updatedDate = project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : null;
        const metaText = `Created: ${createdDate}${updatedDate ? ` • Last updated: ${updatedDate}` : ''}`;
        document.querySelector('.project-meta-text').textContent = metaText;
        document.getElementById('projectMetaInfo').style.display = 'block';
        
        document.getElementById('projectEditModal').style.display = 'block';
        document.getElementById('editProjectName').focus();
    }

    hideModal() {
        document.getElementById('projectEditModal').style.display = 'none';
        this.currentEditingProject = null;
    }

    showDeleteConfirmation(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const stats = this.getProjectStats(projectId);
        const deleteMessage = document.getElementById('deleteMessage');
        
        if (stats.totalLogs > 0) {
            deleteMessage.innerHTML = `
                <strong>Cannot delete "${this.escapeHtml(project.name)}"</strong><br>
                This project has ${stats.totalLogs} log entries. Please delete all logs first before deleting the project.
            `;
            document.getElementById('confirmDeleteBtn').style.display = 'none';
        } else {
            deleteMessage.innerHTML = `
                Are you sure you want to delete "<strong>${this.escapeHtml(project.name)}</strong>"?<br>
                This action cannot be undone.
            `;
            document.getElementById('confirmDeleteBtn').style.display = 'inline-block';
            document.getElementById('confirmDeleteBtn').onclick = () => this.confirmDeleteProject(projectId);
        }

        document.getElementById('deleteConfirmModal').style.display = 'block';
    }

    hideDeleteModal() {
        document.getElementById('deleteConfirmModal').style.display = 'none';
    }

    handleDeleteFromModal() {
        if (!this.currentEditingProject) return;
        
        const stats = this.getProjectStats(this.currentEditingProject.id);
        
        if (stats.totalLogs > 0) {
            alert(`Cannot delete "${this.currentEditingProject.name}". This project has ${stats.totalLogs} log entries. Please delete all logs first.`);
            return;
        }

        if (confirm(`Are you sure you want to delete "${this.currentEditingProject.name}"? This action cannot be undone.`)) {
            const result = this.deleteProject(this.currentEditingProject.id);
            
            if (result.success) {
                this.displayProjects();
                this.updateProjectCount();
                this.hideModal();
            } else {
                alert(result.message);
            }
        }
    }

    confirmDeleteProject(projectId) {
        const result = this.deleteProject(projectId);
        
        if (result.success) {
            this.displayProjects();
            this.updateProjectCount();
            this.hideDeleteModal();
        } else {
            alert(result.message);
        }
    }

    // Form handling
    saveProject() {
        const formData = {
            name: document.getElementById('editProjectName').value,
            shortname: document.getElementById('editProjectShortname').value,
            location: document.getElementById('editProjectLocation').value,
            description: document.getElementById('editProjectDescription').value,
            notes: document.getElementById('editProjectNotes').value
        };

        if (!formData.name.trim()) {
            alert('Project name is required');
            return;
        }

        const projectId = document.getElementById('editProjectId').value;
        
        if (projectId) {
            // Update existing project
            this.updateProject(projectId, formData);
        } else {
            // Add new project
            this.addProject(formData);
        }

        this.displayProjects();
        this.updateProjectCount();
        this.hideModal();
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the project manager when the page loads
const projectManager = new ProjectManager();