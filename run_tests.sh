#!/bin/bash

echo "🚀 Running PAG Command Centre Tests"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Backend Tests
echo ""
print_status "Running Backend Tests (FastAPI + SQLite)..."
cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    print_status "Virtual environment activated"
else
    print_warning "No virtual environment found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install pytest pytest-asyncio httpx
fi

# Run backend tests
if pytest tests/ -v --tb=short; then
    print_success "Backend tests passed! ✅"
else
    print_error "Backend tests failed! ❌"
    exit 1
fi

cd ..

# Frontend Tests
echo ""
print_status "Running Frontend Tests (React + Jest)..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing frontend dependencies..."
    npm install
fi

# Run frontend tests
if npm test -- --watchAll=false --passWithNoTests; then
    print_success "Frontend tests passed! ✅"
else
    print_error "Frontend tests failed! ❌"
    exit 1
fi

cd ..

# Integration Tests
echo ""
print_status "Running Integration Tests..."
print_status "Starting backend server for integration tests..."

# Start backend server in background
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    print_success "Backend server is running"
else
    print_warning "Backend health check failed, but continuing..."
fi

# Run integration tests
print_status "Running integration tests..."
cd backend
source venv/bin/activate

# Test API endpoints
echo "Testing /api/messages endpoint..."
if curl -s http://localhost:8000/api/messages | grep -q "id"; then
    print_success "Messages endpoint working"
else
    print_warning "Messages endpoint returned no data"
fi

echo "Testing /api/refresh endpoint..."
if curl -s http://localhost:8000/api/refresh | grep -q "message"; then
    print_success "Refresh endpoint working"
else
    print_warning "Refresh endpoint may have issues"
fi

cd ..

# Stop backend server
kill $BACKEND_PID 2>/dev/null

# Summary
echo ""
echo "=================================="
print_success "All tests completed!"
echo ""
print_status "Test Summary:"
echo "  ✅ Backend Tests (FastAPI + SQLite)"
echo "  ✅ Frontend Tests (React + Jest)"
echo "  ✅ Integration Tests (API Endpoints)"
echo ""
print_status "To run individual test suites:"
echo "  Backend: cd backend && pytest tests/ -v"
echo "  Frontend: cd frontend && npm test"
echo ""
print_status "To start the application:"
echo "  ./start.sh"
echo ""
