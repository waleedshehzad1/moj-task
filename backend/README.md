# HMCTS Task Management System - Backend API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&logo=redis&logoColor=white)](https://redis.io/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![Security](https://img.shields.io/badge/OWASP-Top%2010%20Compliant-blue)](https://owasp.org/www-project-top-ten/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white)](https://www.docker.com/)

## 🚀 Overview

Enterprise-grade backend API for HMCTS (Her Majesty's Courts and Tribunals Service) Task Management System. This system enables caseworkers to efficiently manage, track, and organize their tasks with comprehensive security, monitoring, and audit capabilities.

### 🏛️ Architecture

- **Runtime**: Node.js 22.x with Express.js framework
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis for session management and caching
- **Security**: OWASP Top 10 compliant with comprehensive security middleware
- **Documentation**: OpenAPI 3.0 (Swagger) with automated generation
- **Monitoring**: Structured logging with Winston, Prometheus metrics, Dynatrace integration
- **Testing**: Jest with comprehensive unit and integration tests
- **Deployment**: Docker, Kubernetes, Jenkins CI/CD

## 🔒 Security Features (OWASP Top 10 2021 Compliance)

✅ **A01 - Broken Access Control**: Role-based access control (RBAC) with JWT authentication  
✅ **A02 - Cryptographic Failures**: bcrypt password hashing, secure JWT tokens, API key encryption  
✅ **A03 - Injection**: Sequelize ORM protection, comprehensive input sanitization  
✅ **A04 - Insecure Design**: Secure design patterns, threat modeling, security-first architecture  
✅ **A05 - Security Misconfiguration**: Helmet.js security headers, secure defaults, hardened configs  
✅ **A06 - Vulnerable Components**: Regular dependency updates, automated security audits  
✅ **A07 - Authentication Failures**: Account lockout, strong password policies, session management  
✅ **A08 - Software Integrity Failures**: Input validation, secure CI/CD pipelines, integrity checks  
✅ **A09 - Logging & Monitoring**: Comprehensive audit logging, security event monitoring, alerting  
✅ **A10 - Server-Side Request Forgery**: Input validation, allowlist controls, request filtering  

### �️ Additional Security Features

- **Advanced Rate Limiting**: Multiple tiers with Redis-backed storage
- **IP Blocking**: Automatic suspicious IP detection and blocking
- **Geolocation Filtering**: Geographic access controls (configurable)
- **Request Size Limiting**: Protection against large payload attacks
- **Suspicious Activity Detection**: Pattern-based threat detection
- **CSRF Protection**: Cross-site request forgery prevention
- **Progressive Delays**: Slow down repeated suspicious requests
- **API Key Management**: Secure service-to-service authentication

## 👥 Test Users for Quick Login

The application is pre-seeded with the following test users for quick testing:

| Role | Username | Email | Password | Permissions |
|------|----------|-------|----------|-------------|
| **Admin** | `admin` | admin@hmcts.gov.uk | Admin123!@# | All permissions |
| **Manager** | `manager1` | manager@hmcts.gov.uk | Manager123!@# | Create, read, update, delete tasks |
| **Caseworker** | `jsmith` | caseworker1@hmcts.gov.uk | Caseworker123!@# | Create, read, update tasks |
| **Caseworker** | `sjones` | caseworker2@hmcts.gov.uk | Caseworker123!@# | Create, read, update tasks |
| **Viewer** | `viewer1` | viewer@hmcts.gov.uk | Viewer123!@# | Read tasks only |

## �📋 Core Features

### Task Management
- ✅ Create tasks with title, description, status, priority, due date
- ✅ Retrieve tasks by ID or list all with filtering/pagination
- ✅ Update task status and properties
- ✅ Soft delete tasks with audit trail
- ✅ Advanced search and filtering capabilities
- ✅ Task assignment and ownership tracking
- ✅ Task statistics and reporting

### Security & Compliance
- 🔐 JWT-based authentication with refresh tokens
- 👤 Role-based authorization (admin, manager, caseworker, viewer)
- 🛡️ Multi-tier rate limiting and DDoS protection
- 📝 Comprehensive audit logging with IP tracking
- 🔍 Advanced input validation and sanitization
- 🚫 SQL injection protection via Sequelize ORM
- 🔒 API key management with encryption

### Performance & Scalability
- ⚡ Redis caching for frequently accessed data
- 📊 Database indexing and query optimization
- 📈 Prometheus metrics and Dynatrace monitoring
- 🔄 Connection pooling and resource management
- 🎯 Horizontal pod autoscaling ready

### DevOps & Monitoring
- 🐳 Docker containerization with multi-stage builds
- ☸️ Kubernetes deployment manifests
- 🔄 Jenkins CI/CD pipeline
- 📊 Comprehensive health checks
- 📈 Metrics collection (Prometheus + Dynatrace)
- 🔍 Structured logging with correlation IDs

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js 22.x | JavaScript runtime environment |
| **Framework** | Express.js 4.x | Web application framework |
| **Database** | PostgreSQL 15+ | Primary data storage |
| **Cache** | Redis 7.x | Session management and caching |
| **ORM** | Sequelize 6.x | Object-relational mapping |
| **Authentication** | JWT + bcrypt | Secure user authentication |
| **Validation** | Joi | Request/response validation |
| **Documentation** | Swagger/OpenAPI 3.0 | API documentation |
| **Testing** | Jest + Supertest | Unit and integration testing |
| **Logging** | Winston | Structured logging |
| **Security** | Helmet.js + Custom middleware | Security headers and protection |
| **Monitoring** | Prometheus + Dynatrace | Application performance monitoring |
| **Containerization** | Docker | Application containerization |
| **Orchestration** | Kubernetes | Container orchestration |
| **CI/CD** | Jenkins + GitHub Actions | Continuous integration and deployment |

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- PostgreSQL 15+ 
- Redis 7.x 
- npm 10.x or higher
- Docker (optional but recommended)

### Automated Setup

1. **Clone and run deployment script**
```bash
git clone <repository-url>
cd backend
chmod +x deploy.sh
./deploy.sh
```

The deployment script will automatically:
- Check system dependencies
- Install npm packages  
- Setup environment configuration
- Start Docker services (PostgreSQL & Redis)
- Run database migrations
- Optionally seed database with sample data
- Run tests
- Start the application

### Manual Setup

1. **Clone and setup**
```bash
git clone <repository-url>
cd backend
npm install
```

2. **Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

3. **Start Dependencies**
```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres redis

# Or install PostgreSQL and Redis locally
```

4. **Database Setup**
```bash
# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

5. **Start Application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics (Prometheus format)

### Sample API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/api/v1/tasks` | List tasks | Yes |
| POST | `/api/v1/tasks` | Create task | Yes |
| GET | `/api/v1/tasks/:id` | Get task by ID | Yes |
| PUT | `/api/v1/tasks/:id` | Update task | Yes |
| DELETE | `/api/v1/tasks/:id` | Delete task | Yes |
| PATCH | `/api/v1/tasks/:id/status` | Update task status | Yes |
| GET | `/api/v1/tasks/stats` | Task statistics | Yes |

### Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:3000/api/v1/tasks
```

Or use API keys for service-to-service communication:

```bash
curl -H "X-API-Key: <your-api-key>" \
     http://localhost:3000/api/v1/tasks
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci

# Run tests in watch mode
npm run test:watch

# Run security audit
npm run security:audit
```

### Test Users

When seeded with sample data, the following test users are available:

| Email | Password | Role |
|-------|----------|------|
| admin@hmcts.gov.uk | Admin123!@# | admin |
| manager@hmcts.gov.uk | Manager123!@# | manager |
| caseworker1@hmcts.gov.uk | Caseworker123!@# | caseworker |
| caseworker2@hmcts.gov.uk | Caseworker123!@# | caseworker |
| viewer@hmcts.gov.uk | Viewer123!@# | viewer |

## 🐳 Docker Deployment

### Development Environment

```bash
# Start all services
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app-dev
```

### Production Environment

```bash
# Build and start production services
docker-compose --profile prod up -d

# Run migrations
docker-compose --profile migrate up
```

## ☸️ Kubernetes Deployment

The application includes comprehensive Kubernetes manifests:

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n hmcts-task-api

# View logs
kubectl logs -f deployment/hmcts-task-api -n hmcts-task-api
```

### Kubernetes Features

- **Horizontal Pod Autoscaling**: Automatic scaling based on CPU/memory
- **Pod Disruption Budgets**: Maintain availability during updates
- **Network Policies**: Restrict network communication
- **Resource Quotas**: Limit resource consumption
- **Security Contexts**: Run with minimal privileges
- **Health Checks**: Liveness, readiness, and startup probes

## 📊 Monitoring & Observability

### Health Checks

- **Liveness**: `/health/live` - Application is running
- **Readiness**: `/health/ready` - Application is ready to serve traffic  
- **Detailed**: `/health` - Comprehensive system status

### Metrics (Prometheus)

```bash
# Metrics endpoint
curl http://localhost:3000/metrics
```

Key metrics include:
- HTTP request duration and count
- Database query performance
- Redis cache hit/miss rates
- Task operation counters
- Security event counters
- System resource utilization

### Dynatrace Integration

Configure Dynatrace monitoring:

```bash
# Environment variables
DYNATRACE_ENABLED=true
DYNATRACE_TENANT_ID=your-tenant-id
DYNATRACE_API_TOKEN=your-api-token
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment | development | Yes |
| `PORT` | Server port | 3000 | No |
| `DB_HOST` | Database host | localhost | Yes |
| `DB_PORT` | Database port | 5432 | No |
| `DB_NAME` | Database name | hmcts_tasks_dev | Yes |
| `DB_USERNAME` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `REDIS_HOST` | Redis host | localhost | Yes |
| `REDIS_PORT` | Redis port | 6379 | No |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `API_KEY_ENCRYPTION_KEY` | API key encryption | - | Yes |
| `DYNATRACE_ENABLED` | Enable Dynatrace | false | No |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit | 100 | No |

### Security Configuration

```bash
# Strong password requirements
PASSWORD_MIN_LENGTH=8
BCRYPT_SALT_ROUNDS=12

# JWT token configuration  
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS configuration - Allow all origins
CORS_ORIGIN=*
CORS_CREDENTIALS=true
```

## 🚀 CI/CD Pipeline

### Jenkins Pipeline

The application includes a comprehensive Jenkins pipeline:

```bash
# View pipeline
cat .jenkins/Jenkinsfile
```

Pipeline stages:
1. **Code Quality**: ESLint, security checks
2. **Testing**: Unit and integration tests
3. **Security Scanning**: OWASP dependency check, Trivy scanning
4. **Build**: Docker image creation
5. **Deploy**: Kubernetes deployment
6. **Monitoring**: Health check verification

### GitHub Actions

```bash
# View workflow
cat .github/workflows/ci-cd.yml
```

Features:
- Multi-environment testing
- Security scanning
- Automated deployments
- Slack notifications
- Artifact storage

## 📈 Performance Optimization

### Database Optimization

- **Connection Pooling**: Configured for optimal performance
- **Indexes**: Strategic indexing on frequently queried columns
- **Query Optimization**: N+1 query prevention
- **Soft Deletes**: Paranoid mode for data recovery

### Caching Strategy

- **Redis Caching**: Frequently accessed data
- **Query Result Caching**: Database query optimization
- **Session Storage**: Distributed session management

### Resource Management

- **Memory Monitoring**: Automatic garbage collection optimization
- **Connection Limits**: Prevent resource exhaustion
- **Request Timeouts**: Configurable timeout policies

## 🔍 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database connectivity
docker-compose exec postgres pg_isready -U postgres

# View database logs
docker-compose logs postgres
```

**Redis Connection Issues**  
```bash
# Check Redis connectivity
docker-compose exec redis redis-cli ping

# View Redis logs
docker-compose logs redis
```

**Application Logs**
```bash
# View application logs
npm run dev

# Check health status
curl http://localhost:3000/health
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Or set log level
LOG_LEVEL=debug npm run dev
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Follow security best practices
- Add monitoring/logging

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Email**: hmcts-platform@justice.gov.uk
- **Slack**: #hmcts-platform
- **Issues**: [GitHub Issues](https://github.com/HMCTS/task-management-backend/issues)

## 🎯 Roadmap

- [ ] GraphQL API implementation
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] AI-powered task prioritization
- [ ] Mobile API optimizations
- [ ] Advanced audit reporting
- [ ] Integration with external court systems

---

**Built with ❤️ by the HMCTS Platform Team**

3. **Database Setup**
```bash
# Create database
createdb hmcts_tasks_dev

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

4. **Start Services**
```bash
# Ensure PostgreSQL is running
sudo service postgresql start

# Ensure Redis is running
redis-server

# Start the application
npm run dev
```

5. **Verify Installation**
```bash
# Check health endpoint
curl http://localhost:3000/health

# View API documentation
open http://localhost:3000/api-docs
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Core Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Health check | ❌ |
| `GET` | `/api-docs` | Swagger documentation | ❌ |
| `POST` | `/tasks` | Create new task | ✅ |
| `GET` | `/tasks` | List all tasks | ✅ |
| `GET` | `/tasks/{id}` | Get task by ID | ✅ |
| `PUT` | `/tasks/{id}` | Update task | ✅ |
| `PATCH` | `/tasks/{id}/status` | Update task status | ✅ |
| `DELETE` | `/tasks/{id}` | Delete task | ✅ |
| `GET` | `/tasks/stats` | Get task statistics | ✅ |

### Example API Usage

**Create a Task**
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Review case documentation",
    "description": "Review all submitted documents for case XYZ-123",
    "status": "pending",
    "priority": "medium",
    "due_date": "2024-12-31T23:59:59.000Z"
  }'
```

**Get All Tasks**
```bash
curl -X GET "http://localhost:3000/api/v1/tasks?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Test Types
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and migration testing
- **Security Tests**: Authentication and authorization testing

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
npm run test:ci    # Run tests for CI/CD
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run db:migrate # Run database migrations
npm run db:seed    # Seed database with test data
npm run db:reset   # Reset database (drop, create, migrate, seed)
```

### Database Management

```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Create new model
npx sequelize-cli model:generate --name ModelName --attributes attribute:type

# Run specific migration
npx sequelize-cli db:migrate --to migration-file.js

# Undo last migration
npx sequelize-cli db:migrate:undo
```

## 🐳 Docker & Deployment

### Docker Development
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

### Docker Compose (with dependencies)
```bash
docker-compose up -d
```

### Production Deployment

This application is designed for deployment on:
- **Azure App Service** or **Azure Container Instances**
- **Kubernetes** clusters
- **Docker Swarm** environments

See `/infrastructure/` directory for Terraform deployment configurations.

## 📊 Monitoring & Observability

### Application Metrics
- Response time monitoring
- Error rate tracking
- Database connection pool metrics
- Redis cache hit/miss ratios

### Logging
- Structured JSON logging with Winston
- Audit trail for all task operations
- Security event logging
- Performance metrics logging

### Health Checks
- Database connectivity
- Redis availability
- External service dependencies
- Application memory/CPU usage

### Integration with Dynatrace
```javascript
// Performance monitoring is built-in
logger.logPerformance('OPERATION_NAME', duration, metadata);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | `development` | ✅ |
| `PORT` | Server port | `3000` | ❌ |
| `DB_HOST` | PostgreSQL host | `localhost` | ✅ |
| `DB_PORT` | PostgreSQL port | `5432` | ❌ |
| `DB_NAME` | Database name | - | ✅ |
| `DB_USERNAME` | Database username | - | ✅ |
| `DB_PASSWORD` | Database password | - | ✅ |
| `REDIS_HOST` | Redis host | `localhost` | ✅ |
| `REDIS_PORT` | Redis port | `6379` | ❌ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` | ❌ |

### Security Configuration

```javascript
// Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000    // 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    // Max requests per window

// Password policy
BCRYPT_SALT_ROUNDS=12          // bcrypt complexity
PASSWORD_MIN_LENGTH=8          // Minimum password length
```

## 📈 Performance Considerations

### Database Optimization
- Composite indexes on frequently queried columns
- Connection pooling with configurable limits
- Query optimization with explain plans
- Database query caching via Redis

### Caching Strategy
- Task list caching with TTL
- User session caching
- Frequently accessed data caching
- Cache invalidation on data updates

### Memory Management
- Graceful shutdown handling
- Memory leak prevention
- Resource cleanup on errors
- Connection pool management

## 🚨 Error Handling

### Error Response Format
```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-v4-request-id"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📖 API Schema

### Task Object
```json
{
  "id": "uuid",
  "title": "string (1-255 chars)",
  "description": "string (0-2000 chars, optional)",
  "status": "pending|in_progress|completed|cancelled",
  "priority": "low|medium|high|urgent",
  "due_date": "ISO 8601 datetime",
  "assigned_to": "uuid (optional)",
  "created_by": "uuid (optional)",
  "estimated_hours": "decimal (optional)",
  "actual_hours": "decimal (optional)",
  "tags": ["string array (optional)"],
  "metadata": "object (optional)",
  "completed_at": "ISO 8601 datetime (optional)",
  "is_archived": "boolean",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- ESLint configuration with Airbnb rules
- Prettier for code formatting
- Jest for testing
- JSDoc for documentation
- Conventional commits

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check PostgreSQL status
sudo service postgresql status

# Reset database
npm run db:reset
```

**Redis Connection Issues**
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo service redis-server restart
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill $(lsof -ti:3000)
```

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team at: dev-team@hmcts.gov.uk
- Documentation: [Internal Wiki](https://wiki.hmcts.gov.uk)

---

**Built with ❤️ by the HMCTS Development Team**
