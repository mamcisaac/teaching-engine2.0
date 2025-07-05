# Real File Operations Testing

This directory contains tests that use actual file system operations instead of mocks, providing comprehensive validation of file handling behavior in real-world scenarios.

## Overview

The real file operations testing framework replaces file system mocking with actual temporary file operations to ensure:

- **Real I/O Testing**: Tests use actual file reads, writes, and operations
- **Error Scenario Coverage**: Tests handle real permission errors, disk space issues, and file corruption
- **Performance Validation**: Tests measure actual file operation performance
- **Cleanup Management**: Automated cleanup of temporary test files

## Quick Start

### Run All Real File Tests
```bash
cd server
npm run test:real-files
```

### Run Specific Test Categories
```bash
# File upload/download tests
npm run test:real-files:integration

# Unit tests with real files
npm run test:real-files:unit

# Watch mode for development
npm run test:real-files:watch

# Debug mode with verbose output
npm run test:real-files:debug
```

### Environment Variables
```bash
# Enable real file operations
USE_REAL_FILE_OPERATIONS=true

# Enable real file parsers (PDF, DOCX)
USE_REAL_FILE_PARSERS=true

# Disable all file system mocks
DISABLE_FS_MOCKS=true

# Custom temp directory
TEST_TEMP_DIR=/tmp/my-test-files

# Verbose file operation logging
VERBOSE_FILE_TESTS=true

# Debug test execution
DEBUG_TESTS=true
```

## Test Categories

### 1. File System Infrastructure Tests
**Location**: `tests/utils/FileSystemTestUtils.ts`
**Purpose**: Core utilities for temporary file management

```typescript
import { FileSystemTestUtils, FileSystemTestSetup } from '../utils/FileSystemTestUtils';

// Create temporary directory
const testDir = await FileSystemTestUtils.createTempDir('my-test');

// Create test files
const csvFile = await testDir.createFile('test.csv', csvContent);
const pdfFile = await testDir.createFile('test.pdf', pdfBuffer);

// Cleanup
await testDir.cleanup();
```

### 2. File Upload/Download Tests
**Location**: `tests/integration/file-operations.real.test.ts`
**Purpose**: Test actual file upload and download operations

**Features Tested**:
- Real multipart file uploads
- File size validation with actual files
- Binary file downloads
- Concurrent upload handling
- File corruption detection

### 3. Template File Operations Tests
**Location**: `tests/integration/template-file-operations.real.test.ts`
**Purpose**: Test template file processing and PDF generation

**Features Tested**:
- Reading Handlebars templates from disk
- Rendering templates to HTML files
- PDF generation with actual output files
- Template caching and performance
- Error handling with invalid templates

### 4. Curriculum File Processing Tests
**Location**: `tests/integration/curriculum-file-processing.real.test.ts`
**Purpose**: Test curriculum file parsing with real files

**Features Tested**:
- CSV curriculum file parsing
- JSON curriculum file validation
- PDF content extraction (when enabled)
- Batch file processing
- Malformed file handling

### 5. File System Error Handling Tests
**Location**: `tests/integration/file-system-error-handling.real.test.ts`
**Purpose**: Test error scenarios with real file system conditions

**Features Tested**:
- Permission errors (read-only, no access)
- Disk space limitations
- File corruption scenarios
- Concurrent access issues
- Recovery procedures

## Configuration

### Jest Configuration
The real file operations tests use a specialized Jest configuration:

```javascript
// jest.real-files.config.js
module.exports = {
  // Longer timeouts for file operations
  testTimeout: 30000,
  
  // Real file test patterns
  testMatch: [
    '<rootDir>/tests/**/*.real.test.{ts,tsx,js}',
    '<rootDir>/tests/integration/file-*.test.{ts,tsx,js}'
  ],
  
  // Don't mock file system modules
  unmockedModulePathPatterns: [
    'fs', 'fs/promises', 'path', 'os', 'crypto'
  ],
  
  // Detect open file handles
  detectOpenHandles: true,
  forceExit: true
};
```

### Environment Setup
```javascript
// tests/setup/real-file-env.js
process.env.USE_REAL_FILE_OPERATIONS = 'true';
process.env.USE_REAL_FILE_PARSERS = 'true';
process.env.TEST_TEMP_DIR = '/tmp/teaching-engine-real-files-test';
```

## Utilities and Helpers

### FileSystemTestUtils
Core utility class for real file operations:

```typescript
// Create temporary directory
const testDir = await FileSystemTestUtils.createTempDir('test-name');

// Create various file types
const files = await FileSystemTestUtils.createTestFiles(testDir);
// Returns: { csv, json, pdf, docx, txt, malicious, large, empty }

// Create files with permission issues
const permFiles = await FileSystemTestUtils.createPermissionTestFiles(testDir);
// Returns: { readonly, noRead, noWrite }

// Create corrupted files
const corruptedPdf = await FileSystemTestUtils.createCorruptedFile(testDir, 'pdf');

// File operations
await FileSystemTestUtils.writeFile(path, content);
const content = await FileSystemTestUtils.readFile(path);
await FileSystemTestUtils.copyFile(source, dest);
await FileSystemTestUtils.moveFile(source, dest);

// File verification
const exists = await FileSystemTestUtils.verifyFile(path, expectedContent);
const size = await FileSystemTestUtils.getFileSize(path);

// Cleanup
await FileSystemTestUtils.cleanupAll();
```

### FileSystemTestSetup
Jest test setup and teardown:

```typescript
import { FileSystemTestSetup } from '../utils/FileSystemTestUtils';

describe('My File Tests', () => {
  let testDir: TempDirectory;

  beforeAll(async () => {
    testDir = await FileSystemTestSetup.beforeAll();
  });

  afterAll(async () => {
    await FileSystemTestSetup.afterAll();
  });
});
```

## Test Examples

### Basic File Upload Test
```typescript
it('should upload real CSV file', async () => {
  const csvContent = `Code,Description,Type
A1.1,Test expectation,specific`;
  
  const csvFile = await FileSystemTestUtils.createTempFile(csvContent, {
    name: 'curriculum',
    extension: '.csv'
  });

  try {
    const response = await request
      .post('/api/upload')
      .attach('file', csvFile.path);

    expect(response.status).toBe(200);
    
    // Verify file was actually stored
    const storedContent = await FileSystemTestUtils.readFile(response.body.path);
    expect(storedContent.toString()).toBe(csvContent);
  } finally {
    await csvFile.cleanup();
  }
});
```

### PDF Generation Test
```typescript
it('should generate actual PDF file', async () => {
  const template = {
    content: '<html><body><h1>{{title}}</h1></body></html>',
    format: 'pdf'
  };
  
  const context = { title: 'Test Document' };
  
  // Generate PDF
  const result = await pdfEngine.render(template, context);
  
  // Save to actual file
  const pdfFile = await outputDir.createFile('test.pdf', result.content);
  
  try {
    // Verify PDF signature
    const content = await FileSystemTestUtils.readFile(pdfFile.path);
    expect(content.slice(0, 4).toString()).toBe('%PDF');
  } finally {
    await pdfFile.cleanup();
  }
});
```

### Error Handling Test
```typescript
it('should handle permission errors', async () => {
  const testFile = await testDir.createFile('readonly.txt', 'content');
  
  try {
    // Make file read-only
    await fs.chmod(testFile.path, 0o444);
    
    // Attempt to write should fail
    await expect(FileSystemTestUtils.writeFile(testFile.path, 'new'))
      .rejects.toMatchObject({ code: 'EACCES' });
  } finally {
    await fs.chmod(testFile.path, 0o644); // Restore for cleanup
    await testFile.cleanup();
  }
});
```

## Performance Considerations

### Test Timeouts
Real file operations require longer timeouts:
- Standard tests: 30 seconds
- Large file tests: 60 seconds
- Performance tests: 120 seconds

### Memory Management
```bash
# Increase Node.js memory for large file tests
NODE_OPTIONS='--max-old-space-size=2048'

# Limit concurrent workers
--maxWorkers=2
```

### Cleanup Strategy
- Automatic cleanup after each test
- Global cleanup on process exit
- Orphaned file detection and removal
- Temporary directory management

## Troubleshooting

### Common Issues

**Tests timeout during file operations**
```bash
# Increase timeout
jest --testTimeout=60000

# Run with fewer workers
jest --maxWorkers=1
```

**Permission errors on cleanup**
```bash
# Ensure proper permissions
chmod -R 755 /tmp/teaching-engine-test-*

# Force cleanup
rm -rf /tmp/teaching-engine-test-*
```

**Disk space issues**
```bash
# Check available space
df -h /tmp

# Clean up orphaned test files
npm run test:real-files:cleanup
```

### Debugging

**Enable verbose logging**
```bash
VERBOSE_FILE_TESTS=true npm run test:real-files:debug
```

**Monitor file operations**
```bash
# Watch file system activity
sudo fs_usage -w -f filesystem | grep "teaching-engine"
```

**Check for open handles**
```bash
# List open files
lsof | grep "teaching-engine"
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Real File Operations Tests
  run: |
    cd server
    npm run test:real-files
  env:
    USE_REAL_FILE_OPERATIONS: true
    USE_REAL_FILE_PARSERS: true
    CI: true
```

### Docker Support
```dockerfile
# Ensure sufficient disk space for file tests
RUN df -h

# Create test temp directory
RUN mkdir -p /tmp/teaching-engine-test

# Run with proper permissions
USER node
```

## Best Practices

### Test Design
1. **Always use try/finally for cleanup**
2. **Test with realistic file sizes**
3. **Include edge cases (empty files, large files)**
4. **Test concurrent operations**
5. **Validate actual file content, not just success**

### Performance
1. **Use appropriate timeouts**
2. **Limit concurrent workers for file tests**
3. **Clean up immediately after each test**
4. **Monitor memory usage with large files**

### Error Handling
1. **Test permission scenarios**
2. **Simulate disk space issues**
3. **Handle corrupted files**
4. **Test recovery procedures**

## Contributing

### Adding New Real File Tests
1. Create test file with `.real.test.ts` suffix
2. Use `FileSystemTestUtils` for file operations
3. Include proper cleanup in try/finally blocks
4. Add appropriate timeouts
5. Test both success and error scenarios

### Updating File Utilities
1. Add new methods to `FileSystemTestUtils`
2. Update type definitions
3. Add corresponding tests
4. Update documentation

## Migration from Mocked Tests

### Converting Existing Tests
```typescript
// Before (mocked)
jest.mock('fs', () => ({
  readFile: jest.fn().mockResolvedValue('mocked content')
}));

// After (real files)
import { FileSystemTestUtils } from '../utils/FileSystemTestUtils';

const testFile = await FileSystemTestUtils.createTempFile('real content');
const content = await FileSystemTestUtils.readFile(testFile.path);
```

### Gradual Migration Strategy
1. Keep existing mocked tests
2. Add real file tests alongside
3. Run both test suites in CI
4. Gradually replace mocked tests
5. Remove mocks once confident in real tests

---

For more information, see the individual test files and utility documentation.