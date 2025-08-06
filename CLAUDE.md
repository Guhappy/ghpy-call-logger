# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Construction Project Logger** - a client-side web application for logging and tracking construction project activities. It's a pure HTML/CSS/JavaScript application that runs entirely in the browser with local storage for data persistence.

## Application Architecture

### Core Components
- **index.html** - Main application interface with forms for logging entries and quick project access
- **script.js** - Contains the `ProjectLogger` class that handles all application logic
- **styles.css** - Complete styling with responsive design and priority-based visual indicators
- **projects.html** - Dedicated project management interface
- **projects.js** - Contains the `ProjectManager` class for comprehensive project CRUD operations
- **projects.css** - Styling specific to the project management interface

### Data Architecture
The application uses browser localStorage for persistence with two main data structures:
- **Projects** (`constructionProjects`): Stores project metadata (id, name, location, description, shortname, notes, createdAt)
- **Logs** (`constructionLogs`): Stores individual log entries linked to projects by projectId

### Key Features
- **Enhanced Project Management**: Dedicated project management page with full CRUD operations
- **Quick Data Entry**: Enter key shortcuts and auto-focus for rapid log entry
- **Project Shortnames**: Quick identifier codes for fast project searching
- **Project Notes**: Additional project-specific information storage
- **Smart Project Search**: Real-time search including names, shortnames, locations, and descriptions
- **Quick Project Creation**: Create projects on-the-fly from search results
- **Log Entry Management**: Contact types, priorities, and follow-up tracking
- **Advanced Filtering**: Date-based and project-based filtering
- **CSV Export**: Full data export functionality
- **Priority Visual Indicators**: Color-coded priority system (low/medium/high/urgent)
- **Responsive Design**: Mobile and desktop optimized interface

## Development Commands

This is a static web application with no build process. To develop:
- **Run locally**: Open `index.html` directly in a web browser or serve through a local web server
- **No dependencies**: Pure vanilla JavaScript, HTML, and CSS - no package manager or build tools required
- **Testing**: Manual testing in browser - no automated test framework configured

## Code Structure

### ProjectLogger Class (script.js)
- **Constructor**: Initializes projects and logs from localStorage with automatic migration for new fields
- **UI Management**: Handles form interactions, modal displays, and event listeners
- **Data Management**: CRUD operations for projects and logs with localStorage persistence
- **Display Logic**: Filtering, grouping, and rendering of log entries
- **Export Functionality**: CSV generation and download
- **Keyboard Shortcuts**: Enter key submission with Shift+Enter for multi-line in textarea
- **Enhanced Search**: Includes shortname matching in project search functionality

### ProjectManager Class (projects.js)
- **Constructor**: Initializes project data with automatic field migration
- **Project CRUD**: Complete Create, Read, Update, Delete operations for projects
- **Search & Filter**: Real-time project filtering across all fields
- **UI Management**: Modal controls, form handling, and event listeners
- **Data Validation**: Prevents deletion of projects with existing logs
- **Statistics**: Displays log counts and follow-up counts per project

### Storage Schema
```javascript
// Projects stored as:
{id: string, name: string, location: string, description: string, 
 shortname: string, notes: string, createdAt: ISO string, updatedAt?: ISO string}

// Logs stored as:
{id: string, projectId: string, date: string, time: string, contactType: string, 
 contactPerson: string, description: string, priority: string, followUp: boolean, 
 followUpDate: string|null, createdAt: ISO string}
```

### User Experience Enhancements
- **Keyboard Shortcuts**: Enter to submit forms, Shift+Enter for new lines in descriptions
- **Auto-Focus**: Cursor returns to project search after log entry for rapid data entry
- **Quick Project Creation**: Create projects directly from search when no matches found
- **Smart Navigation**: Seamless switching between main logger and project management
- **Default Contact Type**: "Other" selected by default for faster entry

## Data Access

This application integrates with a PostgreSQL database through MCP (Model Context Protocol). The database contains construction-related tables including:
- `customer_tbl` - Customer information 
- `project_tbl` - Project data
- `team_tbl` - Team/contractor information with Thai language support
- Various n8n workflow tables for automation

Access database using: `mcp__stpk-postgres__query` with SQL commands.

## File Locations

### Main Application
- Main logger interface: `/index.html`
- Main application logic: `/script.js` 
- Main styling: `/styles.css`

### Project Management
- Project management interface: `/projects.html`
- Project management logic: `/projects.js`
- Project management styling: `/projects.css`

### Configuration
- Developer guidance: `/CLAUDE.md`