# PowerPoint Version Control System

## Overview

This application serves as a version control system for PowerPoint presentations, similar to Git but specialized for presentations. It allows users to track changes to their presentations, create branches for different versions, and visualize differences between versions.

The system is built as a full-stack web application with:
- React frontend with Tailwind CSS and shadcn/ui components
- Express backend
- Drizzle ORM for database management
- PostgreSQL database for storage

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a standard client-server architecture:

1. **Frontend**: React application with a component-based structure using shadcn/ui for UI components and Tailwind CSS for styling.

2. **Backend**: Express.js server that provides REST API endpoints for the frontend to interact with.

3. **Database**: Uses Drizzle ORM with a PostgreSQL database (setup required in Replit) to store user data, presentations, branches, commits, slides, and diffs.

4. **Authentication**: Simplified authentication for demo purposes, but structured for potential expansion.

5. **File Processing**: Includes functions for handling PPTX files and extracting slide information.

## Key Components

### Frontend

1. **Component Structure**:
   - UI components based on shadcn/ui (built on Radix UI primitives)
   - Page components for different views (home, preview, diff view, history, branches)
   - Layout components like header and sidebar

2. **State Management**:
   - React Query for data fetching and caching
   - Local state using React hooks
   - Custom hooks for accessing common functionality

3. **Routing**:
   - Uses wouter for client-side routing
   - Routes defined in App.tsx

### Backend

1. **API Routes**:
   - RESTful endpoints for presentations, branches, commits, slides, and diffs
   - File upload handling for PPTX files

2. **Storage Logic**:
   - Memory-based storage implementation for development
   - Database schema defined for production use with Drizzle ORM

3. **File Processing Services**:
   - Utilities for extracting content from PPTX files
   - Diff generation between presentation versions

### Database Schema

The database schema includes tables for:

1. **Users**: Authentication and user management
2. **Presentations**: Top-level container for presentation projects
3. **Branches**: Different versions/variations of a presentation
4. **Commits**: Points in time for a presentation branch
5. **Slides**: Individual slides within a commit
6. **Diffs**: Changes between commits

## Data Flow

1. **User Authentication**:
   - User logs in/registers (simplified in the current implementation)
   - Session maintained for user identification

2. **Presentation Management**:
   - User creates a new presentation or uploads a PPTX
   - System creates an initial branch and commit
   - User can view and edit presentations

3. **Version Control**:
   - User can create branches from existing presentations
   - When changes are made, new commits are created
   - Diffs are generated to track changes between versions

4. **Visualization**:
   - User can view presentation history
   - Differences between versions are visualized
   - User can switch between branches

## External Dependencies

Key frontend dependencies:
- React for UI rendering
- Tailwind CSS for styling
- shadcn/ui (Radix UI) for UI components
- React Query for data fetching
- wouter for routing

Key backend dependencies:
- Express for the server
- Drizzle ORM for database interactions
- multer for file uploads
- JSZip for processing PPTX files

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Development Mode**:
   - `npm run dev` command starts both frontend and backend in development mode
   - Vite serves the frontend with hot module replacement
   - Express server provides API endpoints

2. **Production Build**:
   - `npm run build` bundles the frontend and backend
   - Frontend is compiled to static files
   - Backend is bundled with esbuild

3. **Database Setup**:
   - PostgreSQL should be provisioned in the Replit environment
   - `npm run db:push` updates the database schema
   - Environment variable `DATABASE_URL` must be set

4. **Deployment Configuration**:
   - Configured in .replit file for Replit hosting
   - Exposes port 5000 externally as port 80
   - Includes autoscaling configuration