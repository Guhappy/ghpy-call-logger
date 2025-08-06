# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Construction Project Logger** - a client-side web application for logging and tracking construction project activities. It's a pure HTML/CSS/JavaScript application that runs entirely in the browser with local storage for data persistence.

## Application Architecture

### Core Components
- **index.html** - Main application interface with forms for logging entries and project management
- **script.js** - Contains the `ProjectLogger` class that handles all application logic
- **styles.css** - Complete styling with responsive design and priority-based visual indicators

### Data Architecture
The application uses browser localStorage for persistence with two main data structures:
- **Projects** (`constructionProjects`): Stores project metadata (id, name, location, description)
- **Logs** (`constructionLogs`): Stores individual log entries linked to projects by projectId

### Key Features
- Project creation and management
- Log entry creation with contact types, priorities, and follow-up tracking
- Date-based filtering and project-based filtering
- CSV export functionality
- Priority-based visual indicators (low/medium/high/urgent)
- Responsive design for mobile and desktop

## Development Commands

This is a static web application with no build process. To develop:
- **Run locally**: Open `index.html` directly in a web browser or serve through a local web server
- **No dependencies**: Pure vanilla JavaScript, HTML, and CSS - no package manager or build tools required
- **Testing**: Manual testing in browser - no automated test framework configured

## Code Structure

### ProjectLogger Class (script.js)
- **Constructor**: Initializes projects and logs from localStorage
- **UI Management**: Handles form interactions, modal displays, and event listeners
- **Data Management**: CRUD operations for projects and logs with localStorage persistence
- **Display Logic**: Filtering, grouping, and rendering of log entries
- **Export Functionality**: CSV generation and download

### Storage Schema
```javascript
// Projects stored as:
{id: string, name: string, location: string, description: string, createdAt: ISO string}

// Logs stored as:
{id: string, projectId: string, date: string, time: string, contactType: string, 
 contactPerson: string, description: string, priority: string, followUp: boolean, 
 followUpDate: string|null, createdAt: ISO string}
```

## Data Access

This application integrates with a PostgreSQL database through MCP (Model Context Protocol). The database contains construction-related tables including:
- `customer_tbl` - Customer information 
- `project_tbl` - Project data
- `team_tbl` - Team/contractor information with Thai language support
- Various n8n workflow tables for automation

Access database using: `mcp__stpk-postgres__query` with SQL commands.

## File Locations

- Main application: `/index.html`
- Application logic: `/script.js` 
- Styling: `/styles.css`