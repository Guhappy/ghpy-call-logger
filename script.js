class ProjectLogger {
    constructor() {
        this.projects = this.loadProjects();
        this.logs = this.loadLogs();
        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.populateProjectSelects();
        this.loadTodaysLogs();
        this.setupEventListeners();
        this.setCurrentTime();
    }

    updateCurrentDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
        document.getElementById('filterDate').value = today.toISOString().split('T')[0];
    }

    setCurrentTime() {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        document.getElementById('timeInput').value = timeString;
    }

    setupEventListeners() {
        document.getElementById('logForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLogEntry();
        });

        document.getElementById('projectForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProject();
        });

        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.showProjectModal();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.hideProjectModal();
        });

        document.getElementById('followUp').addEventListener('change', (e) => {
            const followUpDate = document.getElementById('followUpDate');
            followUpDate.style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('filterProject').addEventListener('change', () => {
            this.filterLogs();
        });

        document.getElementById('filterDate').addEventListener('change', () => {
            this.filterLogs();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });

        // Project search functionality
        document.getElementById('projectSearch').addEventListener('input', (e) => {
            this.handleProjectSearch(e.target.value);
        });

        document.getElementById('projectSearch').addEventListener('focus', () => {
            this.showProjectDropdown();
        });

        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.project-search-container');
            const modal = document.getElementById('projectModal');
            
            if (!searchContainer.contains(e.target)) {
                this.hideProjectDropdown();
            }
            
            if (e.target === modal) {
                this.hideProjectModal();
            }
        });

        // Add Enter key shortcut for log form submission
        document.getElementById('logForm').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.target.tagName === 'TEXTAREA') {
                    // In textarea: Enter submits, Shift+Enter adds new line
                    if (!e.shiftKey) {
                        e.preventDefault();
                        this.addLogEntry();
                    }
                } else {
                    // In other fields: Enter submits
                    e.preventDefault();
                    this.addLogEntry();
                }
            }
        });
    }

    addProject() {
        const name = document.getElementById('projectName').value.trim();
        const location = document.getElementById('projectLocation').value.trim();
        const description = document.getElementById('projectDescription').value.trim();

        if (!name) return;

        const project = {
            id: Date.now().toString(),
            name,
            location,
            description,
            createdAt: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveProjects();
        this.populateProjectSelects();
        this.hideProjectModal();
        document.getElementById('projectForm').reset();

        document.getElementById('selectedProjectId').value = project.id;
        document.getElementById('projectSearch').value = `${project.name} ${project.location ? '- ' + project.location : ''}`;
        this.hideProjectDropdown();
    }

    createQuickProject(projectName) {
        const project = {
            id: Date.now().toString(),
            name: projectName,
            location: '',
            description: '',
            createdAt: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveProjects();
        this.populateProjectSelects();
        
        document.getElementById('selectedProjectId').value = project.id;
        document.getElementById('projectSearch').value = project.name;
        this.hideProjectDropdown();
    }

    handleProjectSearch(searchTerm) {
        const dropdown = document.getElementById('projectDropdown');
        const hiddenInput = document.getElementById('selectedProjectId');
        
        if (!searchTerm.trim()) {
            hiddenInput.value = '';
            this.showAllProjects();
            return;
        }

        const filteredProjects = this.projects.filter(project => {
            const projectText = `${project.name} ${project.location || ''}`.toLowerCase();
            return projectText.includes(searchTerm.toLowerCase());
        });

        this.displayProjectDropdown(filteredProjects);
        hiddenInput.value = '';
    }

    showProjectDropdown() {
        this.showAllProjects();
    }

    showAllProjects() {
        const dropdown = document.getElementById('projectDropdown');
        this.displayProjectDropdown(this.projects);
        dropdown.style.display = 'block';
    }

    displayProjectDropdown(projects) {
        const dropdown = document.getElementById('projectDropdown');
        
        if (projects.length === 0) {
            const searchTerm = document.getElementById('projectSearch').value.trim();
            dropdown.innerHTML = `
                <div class="dropdown-item no-results">No projects found</div>
                ${searchTerm ? `<div class="dropdown-item create-new" data-create-project="${searchTerm}">
                    <div class="project-name">+ Create "${searchTerm}" as new project</div>
                </div>` : ''}
            `;
            dropdown.style.display = 'block';
            
            // Add click listener for create new project option
            const createNewItem = dropdown.querySelector('.create-new');
            if (createNewItem) {
                createNewItem.addEventListener('click', () => {
                    this.createQuickProject(searchTerm);
                });
            }
            return;
        }

        let html = '';
        projects.forEach(project => {
            const displayText = `${project.name} ${project.location ? '- ' + project.location : ''}`;
            html += `<div class="dropdown-item" data-project-id="${project.id}" data-project-text="${displayText}">
                        <div class="project-name">${project.name}</div>
                        ${project.location ? `<div class="project-location">${project.location}</div>` : ''}
                     </div>`;
        });
        
        dropdown.innerHTML = html;
        dropdown.style.display = 'block';

        // Add click listeners to dropdown items
        dropdown.querySelectorAll('.dropdown-item[data-project-id]').forEach(item => {
            item.addEventListener('click', () => {
                this.selectProject(item.dataset.projectId, item.dataset.projectText);
            });
        });
    }

    selectProject(projectId, projectText) {
        document.getElementById('selectedProjectId').value = projectId;
        document.getElementById('projectSearch').value = projectText;
        this.hideProjectDropdown();
    }

    hideProjectDropdown() {
        document.getElementById('projectDropdown').style.display = 'none';
    }

    addLogEntry() {
        const projectId = document.getElementById('selectedProjectId').value;
        const time = document.getElementById('timeInput').value;
        const contactType = document.getElementById('contactType').value;
        const contactPerson = document.getElementById('contactPerson').value.trim();
        const description = document.getElementById('logDescription').value.trim();
        const priority = document.getElementById('priority').value;
        const followUp = document.getElementById('followUp').checked;
        const followUpDate = document.getElementById('followUpDate').value;

        if (!projectId || !time || !contactType || !description) {
            alert('Please fill in all required fields');
            return;
        }

        const log = {
            id: Date.now().toString(),
            projectId,
            date: new Date().toISOString().split('T')[0],
            time,
            contactType,
            contactPerson,
            description,
            priority,
            followUp,
            followUpDate: followUp ? followUpDate : null,
            createdAt: new Date().toISOString()
        };

        this.logs.push(log);
        this.saveLogs();
        this.loadTodaysLogs();
        document.getElementById('logForm').reset();
        document.getElementById('projectSearch').value = '';
        document.getElementById('selectedProjectId').value = '';
        this.hideProjectDropdown();
        this.setCurrentTime();
        
        // Set focus back to project search for quick data entry
        document.getElementById('projectSearch').focus();
        
        alert('Log entry added successfully!');
    }

    populateProjectSelects() {
        const filterProject = document.getElementById('filterProject');

        filterProject.innerHTML = '<option value="">All Projects</option>';

        this.projects.forEach(project => {
            const option = new Option(`${project.name} ${project.location ? '- ' + project.location : ''}`, project.id);
            filterProject.appendChild(option);
        });
    }

    loadTodaysLogs() {
        const today = new Date().toISOString().split('T')[0];
        const todaysLogs = this.logs.filter(log => log.date === today);
        this.displayLogs(todaysLogs);
    }

    filterLogs() {
        const selectedProject = document.getElementById('filterProject').value;
        const selectedDate = document.getElementById('filterDate').value;

        let filteredLogs = this.logs;

        if (selectedProject) {
            filteredLogs = filteredLogs.filter(log => log.projectId === selectedProject);
        }

        if (selectedDate) {
            filteredLogs = filteredLogs.filter(log => log.date === selectedDate);
        }

        this.displayLogs(filteredLogs);
    }

    displayLogs(logs) {
        const logsList = document.getElementById('logsList');
        
        if (logs.length === 0) {
            logsList.innerHTML = '<p class="no-logs">No logs found for the selected criteria.</p>';
            return;
        }

        const groupedLogs = logs.reduce((groups, log) => {
            const project = this.projects.find(p => p.id === log.projectId);
            const projectName = project ? project.name : 'Unknown Project';
            
            if (!groups[projectName]) {
                groups[projectName] = [];
            }
            groups[projectName].push(log);
            return groups;
        }, {});

        let html = '';
        Object.keys(groupedLogs).sort().forEach(projectName => {
            html += `<div class="project-group">
                <h3>${projectName}</h3>`;
            
            groupedLogs[projectName].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).forEach(log => {
                const priorityClass = `priority-${log.priority}`;
                html += `
                    <div class="log-entry ${priorityClass}">
                        <div class="log-header">
                            <span class="log-time">${log.time}</span>
                            <span class="log-date">${new Date(log.date).toLocaleDateString()}</span>
                            <span class="log-type">${log.contactType.replace('-', ' ').toUpperCase()}</span>
                            <span class="log-priority ${priorityClass}">${log.priority.toUpperCase()}</span>
                        </div>
                        ${log.contactPerson ? `<div class="log-contact"><strong>Contact:</strong> ${log.contactPerson}</div>` : ''}
                        <div class="log-description">${log.description}</div>
                        ${log.followUp ? `<div class="log-followup">📌 Follow-up required${log.followUpDate ? ` by ${new Date(log.followUpDate).toLocaleDateString()}` : ''}</div>` : ''}
                        <button class="delete-log" onclick="logger.deleteLog('${log.id}')">Delete</button>
                    </div>
                `;
            });
            html += '</div>';
        });

        logsList.innerHTML = html;
    }

    deleteLog(logId) {
        if (confirm('Are you sure you want to delete this log entry?')) {
            this.logs = this.logs.filter(log => log.id !== logId);
            this.saveLogs();
            this.filterLogs();
        }
    }

    showProjectModal() {
        document.getElementById('projectModal').style.display = 'block';
        document.getElementById('projectName').focus();
    }

    hideProjectModal() {
        document.getElementById('projectModal').style.display = 'none';
        document.getElementById('projectForm').reset();
    }

    exportToCSV() {
        if (this.logs.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Date', 'Time', 'Project', 'Contact Type', 'Contact Person', 'Description', 'Priority', 'Follow-up', 'Follow-up Date'];
        const csvContent = [headers.join(',')];

        this.logs.forEach(log => {
            const project = this.projects.find(p => p.id === log.projectId);
            const projectName = project ? project.name.replace(/,/g, ';') : 'Unknown';
            
            const row = [
                log.date,
                log.time,
                `"${projectName}"`,
                log.contactType,
                `"${log.contactPerson.replace(/"/g, '""')}"`,
                `"${log.description.replace(/"/g, '""')}"`,
                log.priority,
                log.followUp ? 'Yes' : 'No',
                log.followUpDate || ''
            ];
            csvContent.push(row.join(','));
        });

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `construction_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    clearAllData() {
        this.projects = [];
        this.logs = [];
        this.saveProjects();
        this.saveLogs();
        this.populateProjectSelects();
        this.loadTodaysLogs();
        alert('All data has been cleared');
    }

    loadProjects() {
        const saved = localStorage.getItem('constructionProjects');
        return saved ? JSON.parse(saved) : [];
    }

    saveProjects() {
        localStorage.setItem('constructionProjects', JSON.stringify(this.projects));
    }

    loadLogs() {
        const saved = localStorage.getItem('constructionLogs');
        return saved ? JSON.parse(saved) : [];
    }

    saveLogs() {
        localStorage.setItem('constructionLogs', JSON.stringify(this.logs));
    }
}

const logger = new ProjectLogger();