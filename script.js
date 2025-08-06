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

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('projectModal');
            if (e.target === modal) {
                this.hideProjectModal();
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

        document.getElementById('projectSelect').value = project.id;
    }

    addLogEntry() {
        const projectId = document.getElementById('projectSelect').value;
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
        this.setCurrentTime();
        
        alert('Log entry added successfully!');
    }

    populateProjectSelects() {
        const projectSelect = document.getElementById('projectSelect');
        const filterProject = document.getElementById('filterProject');

        projectSelect.innerHTML = '<option value="">Select a project...</option>';
        filterProject.innerHTML = '<option value="">All Projects</option>';

        this.projects.forEach(project => {
            const option1 = new Option(`${project.name} ${project.location ? '- ' + project.location : ''}`, project.id);
            const option2 = new Option(`${project.name} ${project.location ? '- ' + project.location : ''}`, project.id);
            projectSelect.appendChild(option1);
            filterProject.appendChild(option2);
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