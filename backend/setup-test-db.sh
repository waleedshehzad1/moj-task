#!/bin/bash

# Database setup for tests
echo "Setting up test database..."

# Set environment variables
export NODE_ENV=test
export DB_NAME_TEST=${DB_NAME_TEST:-hmcts_tasks_test}
export DB_USERNAME=${DB_USERNAME:-postgres}
export DB_PASSWORD=${DB_PASSWORD:-postgres}
export DB_HOST=${DB_HOST:-localhost}
export DB_PORT=${DB_PORT:-5432}

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT; then
    echo "Error: PostgreSQL is not running on $DB_HOST:$DB_PORT"
    echo "Please start PostgreSQL first"
    exit 1
fi

# Create test database if it doesn't exist
echo "Creating test database if it doesn't exist..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME_TEST 2>/dev/null || echo "Database may already exist"

# Run migrations for test database
echo "Running migrations..."
NODE_ENV=test npx sequelize-cli db:migrate

echo "Test database setup completed!"
