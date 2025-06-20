#!/bin/bash
# Comprehensive Assessment Test Runner
# Runs unit tests, integration tests, contract tests, and E2E tests for assessment features

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
CLIENT_DIR="./client"
SERVER_DIR="./server"
RESULTS_DIR="./test-results"

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

# Function to check if a service is running
check_service() {
    local port=$1
    local service_name=$2
    
    if curl -s "http://localhost:$port" >/dev/null 2>&1; then
        print_success "$service_name is running on port $port"
        return 0
    else
        print_warning "$service_name is not running on port $port"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_service $port "$service_name"; then
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to setup test environment
setup_test_env() {
    print_status "Setting up test environment..."
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
    # Install dependencies if needed
    if [ ! -d "$CLIENT_DIR/node_modules" ]; then
        print_status "Installing client dependencies..."
        cd "$CLIENT_DIR" && npm install && cd ..
    fi
    
    if [ ! -d "$SERVER_DIR/node_modules" ]; then
        print_status "Installing server dependencies..."
        cd "$SERVER_DIR" && npm install && cd ..
    fi
    
    print_success "Test environment setup complete"
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    cd "$CLIENT_DIR"
    
    # Run regular unit tests
    if npm run test:unit; then
        print_success "Unit tests passed"
        return 0
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Check if API server is running
    if ! check_service 3000 "API Server"; then
        print_warning "Starting API server for integration tests..."
        cd "$SERVER_DIR"
        npm run dev &
        SERVER_PID=$!
        cd ..
        
        # Wait for server to be ready
        if ! wait_for_service 3000 "API Server"; then
            print_error "Could not start API server for integration tests"
            kill $SERVER_PID 2>/dev/null || true
            return 1
        fi
    fi
    
    cd "$CLIENT_DIR"
    
    # Run integration tests
    if npm run test:integration; then
        print_success "Integration tests passed"
        integration_success=true
    else
        print_error "Integration tests failed"
        integration_success=false
    fi
    
    # Cleanup server if we started it
    if [ ! -z "$SERVER_PID" ]; then
        print_status "Stopping API server..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    
    cd ..
    
    if [ "$integration_success" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to run contract tests
run_contract_tests() {
    print_status "Running contract tests..."
    
    cd "$CLIENT_DIR"
    
    # Run contract tests (subset of integration tests)
    if npm run test:contract; then
        print_success "Contract tests passed"
        return 0
    else
        print_error "Contract tests failed"
        return 1
    fi
}

# Function to run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    # Check if frontend and backend are running
    local need_frontend=false
    local need_backend=false
    
    if ! check_service 5173 "Frontend Server"; then
        need_frontend=true
    fi
    
    if ! check_service 3000 "Backend Server"; then
        need_backend=true
    fi
    
    # Start services if needed
    local frontend_pid=""
    local backend_pid=""
    
    if [ "$need_backend" = true ]; then
        print_status "Starting backend server for E2E tests..."
        cd "$SERVER_DIR"
        npm run dev &
        backend_pid=$!
        cd ..
        
        if ! wait_for_service 3000 "Backend Server"; then
            print_error "Could not start backend server for E2E tests"
            kill $backend_pid 2>/dev/null || true
            return 1
        fi
    fi
    
    if [ "$need_frontend" = true ]; then
        print_status "Starting frontend server for E2E tests..."
        cd "$CLIENT_DIR"
        npm run dev &
        frontend_pid=$!
        cd ..
        
        if ! wait_for_service 5173 "Frontend Server"; then
            print_error "Could not start frontend server for E2E tests"
            kill $frontend_pid 2>/dev/null || true
            kill $backend_pid 2>/dev/null || true
            return 1
        fi
    fi
    
    # Run E2E tests
    if npx playwright test --config=playwright.assessment.config.ts; then
        print_success "E2E tests passed"
        e2e_success=true
    else
        print_error "E2E tests failed"
        e2e_success=false
    fi
    
    # Cleanup services if we started them
    if [ ! -z "$frontend_pid" ]; then
        print_status "Stopping frontend server..."
        kill $frontend_pid 2>/dev/null || true
        wait $frontend_pid 2>/dev/null || true
    fi
    
    if [ ! -z "$backend_pid" ]; then
        print_status "Stopping backend server..."
        kill $backend_pid 2>/dev/null || true
        wait $backend_pid 2>/dev/null || true
    fi
    
    if [ "$e2e_success" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to generate test report
generate_report() {
    print_status "Generating comprehensive test report..."
    
    local report_file="$RESULTS_DIR/assessment-test-report.md"
    
    cat > "$report_file" << EOF
# Assessment Features Test Report

Generated: $(date)

## Test Summary

| Test Type | Status | Details |
|-----------|--------|---------|
| Unit Tests | $1 | Traditional mocked component tests |
| Integration Tests | $2 | Real API endpoint tests |
| Contract Tests | $3 | Mock vs Reality validation |
| E2E Tests | $4 | Full user workflow tests |

## Test Coverage

### Unit Tests
- ✅ Component rendering and interactions
- ✅ Form validation logic
- ✅ State management
- ✅ Language switching
- ❌ Real API integration (by design)

### Integration Tests
- ✅ Real API endpoint calls
- ✅ Data fetching and mutations
- ✅ Error handling
- ✅ Performance validation

### Contract Tests
- ✅ Mock data structure validation
- ✅ API response format verification
- ✅ Data type consistency
- ✅ Required vs optional fields

### E2E Tests
- ✅ Complete user workflows
- ✅ Cross-component integration
- ✅ Browser compatibility
- ✅ Mobile responsiveness

## Files Tested

### Assessment Components
- \`EvidenceQuickEntry\` - Evidence collection workflow
- \`OutcomeReflectionsJournal\` - Teacher reflection management
- \`LanguageSensitiveAssessmentBuilder\` - Assessment template creation

### API Endpoints
- \`/api/outcomes\` - Learning outcomes data
- \`/api/students\` - Student information
- \`/api/reflections\` - Teacher reflections CRUD
- \`/api/assessment\` - Assessment templates CRUD
- \`/api/students/reflections\` - Student evidence CRUD

## Recommendations

$([ "$2" = "✅ PASSED" ] && echo "- All integration tests passing - API contracts are stable" || echo "- Fix integration test failures before production deployment")
$([ "$3" = "✅ PASSED" ] && echo "- Mock data matches real API - tests are reliable" || echo "- Update mock data to match real API structure")
$([ "$4" = "✅ PASSED" ] && echo "- User workflows function correctly end-to-end" || echo "- Address E2E test failures for production readiness")

## Next Steps

1. **Performance Testing**: Add load tests for concurrent users
2. **Accessibility Testing**: Verify WCAG AA compliance
3. **Security Testing**: Validate input sanitization and authentication
4. **Browser Testing**: Expand to older browser versions if needed

---
*Generated by automated test runner*
EOF

    print_success "Test report generated: $report_file"
}

# Main execution
main() {
    print_status "Starting comprehensive assessment test suite..."
    
    # Track test results
    local unit_result="❌ FAILED"
    local integration_result="❌ FAILED"
    local contract_result="❌ FAILED"
    local e2e_result="❌ FAILED"
    
    # Setup
    setup_test_env
    
    # Run tests
    if run_unit_tests; then
        unit_result="✅ PASSED"
    fi
    
    if run_integration_tests; then
        integration_result="✅ PASSED"
    fi
    
    if run_contract_tests; then
        contract_result="✅ PASSED"
    fi
    
    if run_e2e_tests; then
        e2e_result="✅ PASSED"
    fi
    
    # Generate report
    generate_report "$unit_result" "$integration_result" "$contract_result" "$e2e_result"
    
    # Summary
    echo ""
    print_status "=== Assessment Test Suite Results ==="
    echo "Unit Tests:        $unit_result"
    echo "Integration Tests: $integration_result"
    echo "Contract Tests:    $contract_result"
    echo "E2E Tests:         $e2e_result"
    echo ""
    
    # Exit with error if any tests failed
    if [[ "$unit_result" == *"FAILED"* ]] || [[ "$integration_result" == *"FAILED"* ]] || [[ "$contract_result" == *"FAILED"* ]] || [[ "$e2e_result" == *"FAILED"* ]]; then
        print_error "Some tests failed. Check individual test outputs for details."
        exit 1
    else
        print_success "All assessment tests passed! 🎉"
        exit 0
    fi
}

# Parse command line arguments
case "${1:-all}" in
    unit)
        setup_test_env && run_unit_tests
        ;;
    integration)
        setup_test_env && run_integration_tests
        ;;
    contract)
        setup_test_env && run_contract_tests
        ;;
    e2e)
        setup_test_env && run_e2e_tests
        ;;
    all)
        main
        ;;
    *)
        echo "Usage: $0 [unit|integration|contract|e2e|all]"
        echo ""
        echo "  unit        - Run unit tests only"
        echo "  integration - Run integration tests only"
        echo "  contract    - Run contract tests only"
        echo "  e2e         - Run E2E tests only"
        echo "  all         - Run all test types (default)"
        exit 1
        ;;
esac