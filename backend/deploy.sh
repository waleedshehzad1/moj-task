#!/bin/bash

# HMCTS Task Management API - Deployment Script
# This script sets up the complete backend environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_header() {
    echo ""
    print_message $BLUE "=============================================="
    print_message $BLUE "$1"
    print_message $BLUE "=============================================="
    echo ""
}

print_success() {
    print_message $GREEN "✅ $1"
}

print_warning() {
    print_message $YELLOW "⚠️  $1"
}

print_error() {
    print_message $RED "❌ $1"
}

# Check if required tools are installed
check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is 22 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ $MAJOR_VERSION -lt 22 ]; then
            print_error "Node.js 22 or higher is required. Current: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found. You'll need to install PostgreSQL and Redis manually."
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose found: $COMPOSE_VERSION"
    else
        print_warning "Docker Compose not found."
    fi
}

# Install Node.js dependencies
install_dependencies() {
    print_header "Installing Node.js Dependencies"
    
    if [ -f "package.json" ]; then
        print_message $BLUE "Installing npm packages..."
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Setup environment variables
setup_environment() {
    print_header "Setting up Environment"
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        else
            print_warning "No .env.example found. Creating basic .env file..."
            cat > .env << EOF
# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hmcts_tasks_dev
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
DB_LOGGING=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=a8f7e9c2d1b4f6e8a9c7d5e3f1b8c6d4e7f2a5b9c8e1d6f3a4b7c9e2d8f5a1b6c3e9f7d2a4b8c5e1f6d9a3b7c2e8f4d1a5b9c6e3f7d2a8b4c1e6f9d5a2b7c8e4f1d3a6b9c5e2f8d7a1b4c6e9f3d5a2b8c7e1f4d9a6b3c8e5f2d1a7b4c9e6f8d3a5b2c1e7f4d9a8b6c3e5f1d2a9b7c4e8f6d3a1b5c2e9f7d4a8b6c1e3f5d2a9b7c8e4f1d6a3b5c9e2f7d8a4b1c6e3f9d5a2b8c7e1f4d6a9b3c5e8f2d7a1b4c6e9f3d5a8b2c7e4f1d9a6b3c8e5f2d1a7b4c9e6f8d3a5b2c1e7f4a9d8b6c3e5f1d2a9b7c4e8f6d3a1b5c2e9f7d4a8b6c1e3f5d2a9b7c8e4f1d6a3b5c9e2f7d8a4b1c6e3f9d5a2b8c7e1f4d6a9b3c5e8f2d7a1b4c6e9f3d5a8b2c7e4f1d9a6b3c8e5f2d1a7b4c9e6f8d3a5b2c1e7f4
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=b9f8e7d6c5a4b3e2f1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6e5f4d3c2b1a9f8e7d6c5b4a3f2e1
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security Configuration
BCRYPT_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_NAME=app.log

# Monitoring (Dynatrace simulation)
DYNATRACE_ENABLED=false
DYNATRACE_TENANT_ID=your-tenant-id
DYNATRACE_API_TOKEN=your-api-token

# Health Check Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000

# Swagger Documentation
SWAGGER_ENABLED=true
SWAGGER_TITLE=HMCTS Task Management API

# CORS Configuration - Allow all origins
CORS_ORIGIN=*
CORS_CREDENTIALS=true

# API Key Encryption
API_KEY_ENCRYPTION_KEY=your-encryption-key-change-in-production
EOF
            print_success "Basic .env file created"
        fi
    else
        print_success ".env file already exists"
    fi
    
    print_warning "Please review and update the .env file with your specific configuration"
}

# Start Docker services
start_docker_services() {
    print_header "Starting Docker Services"
    
    if command -v docker-compose &> /dev/null; then
        if [ -f "docker-compose.yml" ]; then
            print_message $BLUE "Starting PostgreSQL and Redis..."
            docker-compose up -d postgres redis
            
            # Wait for services to be ready
            print_message $BLUE "Waiting for services to start..."
            sleep 10
            
            # Check if PostgreSQL is ready
            if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
                print_success "PostgreSQL is ready"
            else
                print_warning "PostgreSQL might not be ready yet. Please check manually."
            fi
            
            # Check if Redis is ready
            if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
                print_success "Redis is ready"
            else
                print_warning "Redis might not be ready yet. Please check manually."
            fi
        else
            print_error "docker-compose.yml not found"
            exit 1
        fi
    else
        print_warning "Docker Compose not available. Please start PostgreSQL and Redis manually."
        print_message $YELLOW "PostgreSQL: localhost:5432 (user: postgres, password: postgres, db: hmcts_tasks_dev)"
        print_message $YELLOW "Redis: localhost:6379"
    fi
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    # Wait a bit more for database to be ready
    sleep 5
    
    if npm run db:migrate; then
        print_success "Database migrations completed"
    else
        print_error "Database migrations failed"
        print_message $YELLOW "Make sure PostgreSQL is running and accessible"
        exit 1
    fi
}

# Run database seeds
run_seeds() {
    print_header "Running Database Seeds"
    
    read -p "Do you want to seed the database with sample data? (y/N): " seed_choice
    case $seed_choice in
        [Yy]* )
            if npm run db:seed; then
                print_success "Database seeded with sample data"
                print_message $BLUE "Sample users created:"
                print_message $BLUE "  - admin@hmcts.gov.uk (password: Admin123!@#)"
                print_message $BLUE "  - manager@hmcts.gov.uk (password: Manager123!@#)"
                print_message $BLUE "  - caseworker1@hmcts.gov.uk (password: Caseworker123!@#)"
                print_message $BLUE "  - caseworker2@hmcts.gov.uk (password: Caseworker123!@#)"
                print_message $BLUE "  - viewer@hmcts.gov.uk (password: Viewer123!@#)"
            else
                print_error "Database seeding failed"
                exit 1
            fi
            ;;
        * )
            print_message $BLUE "Skipping database seeding"
            ;;
    esac
}

# Run tests
run_tests() {
    print_header "Running Tests"
    
    read -p "Do you want to run the test suite? (y/N): " test_choice
    case $test_choice in
        [Yy]* )
            if npm test; then
                print_success "All tests passed"
            else
                print_warning "Some tests failed. Please check the output above."
            fi
            ;;
        * )
            print_message $BLUE "Skipping tests"
            ;;
    esac
}

# Start the application
start_application() {
    print_header "Starting Application"
    
    print_message $BLUE "The API server will be available at:"
    print_message $GREEN "  🌐 API: http://localhost:3000"
    print_message $GREEN "  📚 API Docs: http://localhost:3000/api-docs"
    print_message $GREEN "  🏥 Health Check: http://localhost:3000/health"
    echo ""
    
    read -p "Do you want to start the server now? (Y/n): " start_choice
    case $start_choice in
        [Nn]* )
            print_message $BLUE "You can start the server later with: npm run dev"
            ;;
        * )
            print_message $BLUE "Starting development server..."
            npm run dev
            ;;
    esac
}

# Main deployment flow
main() {
    print_header "HMCTS Task Management API - Deployment Setup"
    
    echo "This script will:"
    echo "1. Check system dependencies"
    echo "2. Install Node.js packages"
    echo "3. Setup environment configuration"
    echo "4. Start Docker services (PostgreSQL & Redis)"
    echo "5. Run database migrations"
    echo "6. Optionally seed database with sample data"
    echo "7. Optionally run tests"
    echo "8. Start the application"
    echo ""
    
    read -p "Continue with deployment? (Y/n): " continue_choice
    case $continue_choice in
        [Nn]* )
            print_message $BLUE "Deployment cancelled"
            exit 0
            ;;
        * )
            ;;
    esac
    
    check_dependencies
    install_dependencies
    setup_environment
    start_docker_services
    run_migrations
    run_seeds
    run_tests
    start_application
    
    print_header "Deployment Complete!"
    print_success "HMCTS Task Management API is ready to use"
    echo ""
    print_message $BLUE "Next steps:"
    print_message $BLUE "  1. Review and update .env file for your environment"
    print_message $BLUE "  2. Test the API endpoints using the Swagger documentation"
    print_message $BLUE "  3. Set up monitoring and logging for production use"
    echo ""
    print_message $GREEN "Happy coding! 🚀"
}

# Run main function
main "$@"
