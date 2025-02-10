# Development Setup Guide

This guide covers the setup and workflow for developing the Tgeld Task Management System.

## Development Environment Setup

### Prerequisites

1. **Required Software**

   - Node.js 18 or later
   - Docker (for production deployment only)
   - Git
   - Code editor (VS Code recommended)

2. **Recommended VS Code Extensions**
   - ESLint
   - Prettier
   - Docker
   - TypeScript and JavaScript
   - Prisma

### Initial Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/barneephife/tgeld.git
   cd tgeld
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment**

   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Code Organization

```
tgeld/
├── app/
│   ├── api/            # API routes
│   ├── lib/            # Shared libraries
│   └── types/          # TypeScript types
├── components/         # React components
├── prisma/            # Database schema
└── public/            # Static assets
```

### 2. Database Development

#### Running Migrations

1. Create a migration:

   ```bash
   npx prisma migrate dev --name description_of_change
   ```

2. Apply migrations:

   ```bash
   npx prisma migrate deploy
   ```

3. Reset database:
   ```bash
   npx prisma migrate reset
   ```

#### Working with Prisma Studio

Launch Prisma Studio for database management:

```bash
npx prisma studio
```

### 3. API Development

#### Creating New API Routes

1. Create a new file in `app/api/`
2. Export HTTP method handlers
3. Use Prisma client for database operations

Example:

```typescript
import { NextResponse } from 'next/server';
import { taskRepository } from '@/app/lib/taskRepository';

export async function GET() {
  try {
    const tasks = await taskRepository.getAll();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
```

### 4. Component Development

#### Component Structure

```typescript
// components/TaskList.tsx
import React from 'react';
import { Task } from '@/app/types/task';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  // Component implementation
}
```

#### Styling Guidelines

- Use Tailwind CSS for styling
- Follow BEM naming convention for custom CSS
- Keep components focused and reusable

### 5. Testing

#### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- components/TaskList.test.tsx

# Watch mode
npm test -- --watch
```

#### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';

describe('TaskList', () => {
  it('renders tasks correctly', () => {
    const tasks = [/* test data */];
    render(<TaskList tasks={tasks} onTaskUpdate={() => {}} />);
    expect(screen.getByText(tasks[0].title)).toBeInTheDocument();
  });
});
```

### 6. Production Deployment

#### Building Images

```bash
# Build production image
docker build -t tgeld-prod -f Dockerfile.prod .
```

#### Running Production Containers

```bash
# Start production environment
docker-compose up -d
```

### 7. Debugging

#### Server-Side Debugging

1. Add console logs:

   ```typescript
   console.log('Debug data:', data);
   ```

2. Use VS Code debugger:
   - Set breakpoints
   - Attach to Node.js process
   - Inspect variables

#### Client-Side Debugging

1. Use React Developer Tools
2. Browser console logging
3. Network tab for API requests

### 8. Code Quality

#### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Formatting

```bash
# Format code
npm run format
```

#### Pre-commit Hooks

The project uses husky for pre-commit hooks:

- Lint checking
- Type checking
- Unit tests

### 9. Version Control

#### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Hotfix: `hotfix/description`

#### Commit Messages

Follow conventional commits:

```
feat: add task filtering
fix: resolve task creation error
docs: update API documentation
```

## Docker Cleanup

To maintain disk space and keep your development environment clean, regularly run these cleanup commands:

```bash
# Remove all stopped containers, unused networks, dangling images, and build cache
docker system prune -f

# Additionally remove any unused images (not just dangling ones)
docker system prune -af

# Remove unused volumes (be careful as this deletes data)
docker volume prune -f
```

You can also add these aliases to your shell configuration (~/.zshrc for zsh):

```bash
# Docker cleanup aliases
alias dprune='docker system prune -f'
alias dpruneall='docker system prune -af'
alias dprunevolumes='docker volume prune -f'
```

### Automated Cleanup

To automate cleanup, you can add this to your development workflow:

1. Add this script to `scripts/docker-cleanup.sh`:

```bash
#!/bin/bash
echo "Cleaning up Docker resources..."

# Remove stopped containers, unused networks, dangling images, and build cache
docker system prune -f

# Only remove unused images if explicitly requested
if [ "$1" == "--all" ]; then
    docker system prune -af
fi

# Report disk space
echo "Current Docker disk usage:"
docker system df
```

2. Make it executable:

```bash
chmod +x scripts/docker-cleanup.sh
```

3. Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "docker:cleanup": "scripts/docker-cleanup.sh",
    "docker:cleanup:all": "scripts/docker-cleanup.sh --all",
    "prebuild": "npm run docker:cleanup"
  }
}
```

Now cleanup will automatically run before each build, and you can manually run:

- `npm run docker:cleanup` for basic cleanup
- `npm run docker:cleanup:all` for full cleanup including unused images

## Troubleshooting

### Common Issues

1. **Database Connection Issues**

   ```bash
   # Check database connection string in .env
   # Ensure PostgreSQL is running
   ```

2. **Build Errors**

   ```bash
   # Clear Next.js cache
   rm -rf .next

   # Rebuild node_modules
   rm -rf node_modules
   npm install
   ```

3. **Prisma Issues**

   ```bash
   # Regenerate Prisma client
   npx prisma generate

   # Reset database
   npx prisma migrate reset
   ```

## Best Practices

1. **Code Organization**

   - Keep components small and focused
   - Use TypeScript interfaces
   - Follow DRY principle

2. **Performance**

   - Use proper React hooks
   - Optimize database queries
   - Implement caching where needed

3. **Security**

   - Validate all inputs
   - Use proper error handling
   - Follow security best practices

4. **Documentation**
   - Document complex functions
   - Update README when needed
   - Keep API documentation current
