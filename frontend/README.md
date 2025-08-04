# Frontend Task Management Application

A modern, responsive task management application built with Vue 3, TypeScript, and Tailwind CSS. This application provides a comprehensive solution for managing tasks with CRUD operations, advanced filtering, and a professional user interface.

## 🚀 Features

- **Task Management**: Create, read, update, and delete tasks
- **Advanced Filtering**: Filter by status, priority, tags, and date ranges
- **Bulk Operations**: Select and manage multiple tasks simultaneously
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Reactive state management with Pinia
- **Professional UI**: Modern interface with consistent design patterns
- **Comprehensive Testing**: Unit tests with Vitest and E2E tests with Playwright
- **Type Safety**: Full TypeScript implementation
- **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks

## 🏗️ Architecture

### Technology Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Code Quality**: ESLint + Prettier + Husky
- **Deployment**: Docker + Nginx

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Generic UI components
│   └── layout/          # Layout components
├── views/               # Page components
├── stores/              # Pinia stores
├── services/            # API services
├── router/              # Vue Router configuration
├── utils/               # Utility functions
└── test/                # Test configuration
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

### Unit & Integration Tests
```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Install Playwright
npx playwright install

# Run E2E tests
npx playwright test

# Run E2E tests with UI
npx playwright test --ui
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   │   ├── ConfirmationModal.vue
│   │   ├── StatsCard.vue
│   │   ├── TaskPriorityBadge.vue
│   │   └── TaskStatusBadge.vue
│   └── layout/          # Layout components
│       └── AppHeader.vue
├── views/               # Page components
│   ├── Dashboard.vue
│   ├── TaskList.vue
│   ├── TaskDetail.vue
│   ├── TaskCreate.vue
│   └── TaskEdit.vue
├── stores/              # Pinia stores
│   └── taskStore.ts
├── services/            # API services
│   ├── api.ts
│   └── taskService.ts
├── router/              # Vue Router config
│   └── index.ts
├── utils/               # Utility functions
│   └── debounce.ts
├── tests/               # Test files
│   ├── components/
│   ├── views/
│   ├── services/
│   └── e2e/
└── types/               # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=Task Management
```

### API Configuration
The application communicates with a REST API. Configure the base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
```

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile** (320px - 768px): Optimized for touch interactions
- **Tablet** (768px - 1024px): Enhanced layout with sidebars
- **Desktop** (1024px+): Full-featured interface with advanced controls

## ♿ Accessibility

- **Semantic HTML** - Proper heading hierarchy and landmarks
- **ARIA Labels** - Screen reader friendly
- **Keyboard Navigation** - Full keyboard support
- **Color Contrast** - WCAG AA compliant
- **Focus Management** - Visible focus indicators

## 🎨 Styling Guide

### Design System
- **Primary Color**: Blue (#3B82F6)
- **Typography**: System fonts with fallbacks
- **Spacing**: 4px base unit (Tailwind's spacing scale)
- **Breakpoints**: Mobile-first responsive design

### Component Conventions
- Use composition API with `<script setup>`
- Props interface definition with TypeScript
- Emits with proper type definitions
- Consistent naming: PascalCase for components, camelCase for props

## 🔄 State Management

### Task Store (Pinia)
```typescript
// State
const tasks = ref<Task[]>([])
const currentTask = ref<Task | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Actions
const fetchTasks = async (query?: TaskQuery) => { ... }
const createTask = async (taskData: TaskInput) => { ... }
const updateTask = async (id: string, taskData: Partial<TaskInput>) => { ... }
const deleteTask = async (id: string) => { ... }
```

## 🛡️ Error Handling

### Global Error Handling
- HTTP interceptors for API errors
- Toast notifications for user feedback
- Fallback UI for component errors
- Validation errors with field-level feedback

### Error Boundaries
```typescript
// API Error Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
    }
    return Promise.reject(error)
  }
)
```

## 🚀 Performance

### Optimization Strategies
- **Lazy Loading** - Route-based code splitting
- **Virtual Scrolling** - For large task lists
- **Debounced Search** - Reduces API calls
- **Memoization** - Computed properties for expensive operations
- **Image Optimization** - Responsive images with lazy loading

### Bundle Analysis
```bash
npm run build -- --analyze
```

## 🔒 Security

### Best Practices
- **XSS Prevention** - Sanitized user inputs
- **CSRF Protection** - Token-based authentication
- **Content Security Policy** - Restrictive CSP headers
- **Secure Headers** - HTTPS enforcement

## 📈 Monitoring

### Performance Monitoring
- **Core Web Vitals** - LCP, FID, CLS tracking
- **Error Tracking** - Client-side error reporting
- **User Analytics** - Usage patterns and flows

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "preview"]
```

### Environment-specific Builds
```bash
# Development
npm run dev

# Staging
npm run build:staging

# Production
npm run build:production
```

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and type checking
4. Submit pull request with description

### Code Standards
- **ESLint** - Enforced coding standards
- **Prettier** - Consistent code formatting
- **TypeScript** - Strict type checking
- **Conventional Commits** - Structured commit messages

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 📋 API Integration

### Task Management API
The frontend integrates with the HMCTS Task Management API:

- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: Bearer token (optional)
- **Rate Limiting**: Handled with retry logic

### Endpoint Examples
```typescript
// Get tasks with filtering
GET /api/v1/tasks?status=pending&priority=high&limit=20

// Create new task
POST /api/v1/tasks
{
  "title": "New Task",
  "description": "Task description",
  "due_date": "2024-01-15T17:00:00Z",
  "priority": "high"
}

// Update task status
PATCH /api/v1/tasks/{id}/status
{
  "status": "completed"
}
```

## 🔍 Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Type check without emitting
npm run type-check

# Clear Vite cache
rm -rf node_modules/.vite
```

#### Test Failures
```bash
# Run tests in watch mode for debugging
npm run test -- --watch

# Run specific test file
npm run test TaskList.test.ts
```

## 📞 Support

For technical support or questions:
- **Issue Tracker**: GitHub Issues
- **Documentation**: Internal docs portal
- **Team Contact**: dev-team@hmcts.net

## 📄 License

MIT License - see LICENSE.md for details

---

Built with ❤️ by the HMCTS Development Team
