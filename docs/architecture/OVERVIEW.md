# Taschengeld Application Architecture

## Overview

Taschengeld is a Next.js-based web application designed to manage allowances and tasks for children. It uses a PostgreSQL database for data persistence and follows a modular architecture for maintainability and scalability.

## Tech Stack

- Frontend: Next.js 14 with React
- Backend: Next.js API Routes
- Database: PostgreSQL v16 (hosted on Homebrew)
  - Schema management through migrations
  - Direct SQL queries (no ORM)
  - Full backup/restore capabilities
  - Strict data integrity constraints
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Authentication: Custom PIN-based system
- State Management: React hooks (useState, useEffect, useContext)

## Directory Structure

The Taschengeld project follows a Next.js-based architecture with React components and App Router. Here's an overview of the main directories and their purposes:

- `/app`: Contains the main application logic and page components.
  - `/api`: API routes for data operations
    - `/backup`: Endpoints for database backup operations
    - `/restore`: Endpoints for database restore operations
  - `/lib`: Houses utility functions and database connection logic.
  - `/types`: Stores TypeScript type definitions for consistent data structures.
  - `/components`: Contains reusable React components used across the application.
- `/migrations`: Database migration files for schema management
- `/components`: Reusable UI components that are used in various parts of the application.
- `/tests`: Includes unit and integration tests.
  - `backup-restore.test.ts`: Tests for database backup/restore functionality
- `/docs`: Project documentation
  - `/architecture`: System architecture documentation
    - `DATABASE.md`: Detailed database schema and operations
    - `OVERVIEW.md`: This file
- `/types`: TypeScript type definitions
  - `database.ts`: Database schema type definitions

## Database Architecture

### Schema Management

- Migrations-based schema evolution
- Standardized data types and constraints
- Proper foreign key relationships
- Check constraints for data validity

### Data Operations

- Direct SQL queries for performance
- Prepared statements for security
- Transaction support for data integrity
- Backup/restore functionality for data safety

### Key Features

- Timezone-aware timestamps
- Standardized numeric precision for currency
- Cascading deletes for referential integrity
- Circular reference handling
- Full and partial backup/restore support

For detailed database information, see `docs/architecture/DATABASE.md`.

## Key Components and Their Relationships

See `docs/LAYOUT_ARCHITECTURE.md` for detailed information.

0. Wireframes

   - /requirements/TG-Wireframe-1.jpg
   - /requirements/tgeld_wireframe_01.jpg
   - /requirements/overview2.jpg

1. AppShell (`components/app-shell.tsx`)

   - Main layout component wrapping all pages
   - Includes Header and Sidebar components (`components/header.tsx` and `components/sidebar.tsx`)

2. Piggy Bank Interface (`components/piggy-bank.tsx`)

   - Displays current balance and allows adding and withdrawing funds, and viewing transaction history
   - Uses AddFundsModal, WithdrawFundsModal, and TransactionsModal

3. User Management Interface (`components/user-management.tsx`)

   - Manages user profiles creation, editing, and deletion
   - Uses UserCard, AddUserModal, and EditUserModal components

4. Task Management Interface (`components/task-management.tsx`)

   - Handles task creation, editing, and deletion
   - Uses AddTaskModal and EditTaskModal components

5. Payday Interface (`components/payday.tsx`)

   - Manages completed task approvals and rejections
   - Uses CompletedTaskCard component

6. Task Completion Interface (`components/task-completion.tsx`)

   - Manages task completion

7. Global Settings Interface (`components/global-settings.tsx`)

   - Manages global settings
   - Enable or disable parent mode
   - Enable or disable PIN-based authentication
   - Set Currency
   - Backup and Restore Database
   - Reset selected or all data

## State Management

- Local state management using React hooks (useState, useEffect)
- Direct database interactions through API routes and repositories

## API Structure

- `/api/users`: User management endpoints
- `/api/tasks`: Task management endpoints
- `/api/transactions`: Transaction management for Piggy Bank
- Refer to `/requirements/API.md` for detailed information.

## Authentication

- No user logins
- PIN-based system for parent/child mode switching

## Styling

- Tailwind CSS for utility-first styling
- shadcn/ui components for consistent UI elements
- See `docs/color-system/README.md` and `docs/color-system/IMPLEMENTATION.md` for detailed information.

## Development Workflow

- Prettier is used for code formatting
- ESLint is used for linting
- TypeScript is used for type checking

## Known Issues

- none

## Git Commit Preparation Process

When preparing for a git commit, always follow these steps:

1. Review and update the CHANGELOG.md file with any new features, changes, or fixes.
2. Update the PROJECT_STATUS.md file to reflect the current state of the project, including any completed tasks or new known issues.
3. Prepare a concise but descriptive commit message that summarizes the changes made.
4. Run any linters or tests to ensure code quality and catch any potential issues.
5. Stage the changes using `git add .`
6. Commit the changes using `git commit -m "Your prepared commit message"`
7. Push the changes to the remote repository using `git push origin main` (or the appropriate branch name)

Following these steps ensures that the project documentation remains up-to-date and that commit messages are informative and consistent.

## Scripts (per package.json)

- dev: "next dev" (for running the development server)
- build: "next build" (for building the production version)
- start: "next start" (for starting the production server)
- lint: "next lint" (for linting the entire project)
- lint:dir: "next lint app components" (for linting specific directories)
