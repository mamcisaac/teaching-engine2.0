// Custom ESLint Plugin for Real Implementation Testing Standards
const path = require('path');

/**
 * Custom ESLint rules to enforce real implementation testing standards
 */
module.exports = {
  rules: {
    // Prevent mocking in integration tests
    'no-mock-in-integration': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent mocking in integration tests',
          category: 'Real Implementation Testing',
          recommended: true
        },
        fixable: null,
        schema: []
      },
      create(context) {
        const filename = context.getFilename();
        const isIntegrationTest = filename.includes('.integration.test.') || 
                                 filename.includes('/integration/');
        
        if (!isIntegrationTest) return {};
        
        return {
          CallExpression(node) {
            // Check for jest.mock usage
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'jest' &&
              node.callee.property.name === 'mock'
            ) {
              context.report({
                node,
                message: 'Mocking is not allowed in integration tests. Use real implementations instead.'
              });
            }
            
            // Check for mockReturnValue usage
            if (
              node.callee.type === 'MemberExpression' &&
              (node.callee.property.name === 'mockReturnValue' ||
               node.callee.property.name === 'mockResolvedValue' ||
               node.callee.property.name === 'mockRejectedValue')
            ) {
              context.report({
                node,
                message: 'Mock return values are not allowed in integration tests. Use real implementations.'
              });
            }
          }
        };
      }
    },

    // Require real implementation identifier in test descriptions
    'require-real-implementation': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require "Real Implementation" in test describe blocks',
          category: 'Real Implementation Testing',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        const filename = context.getFilename();
        const isTestFile = filename.includes('.test.') || filename.includes('.spec.');
        
        if (!isTestFile) return {};
        
        return {
          CallExpression(node) {
            if (
              node.callee.name === 'describe' &&
              node.arguments.length > 0 &&
              node.arguments[0].type === 'Literal'
            ) {
              const description = node.arguments[0].value;
              
              if (!description.includes('Real Implementation')) {
                context.report({
                  node: node.arguments[0],
                  message: 'Test describe block must include "Real Implementation" to indicate testing approach.',
                  fix(fixer) {
                    const newDescription = `${description} - Real Implementation`;
                    return fixer.replaceText(node.arguments[0], `"${newDescription}"`);
                  }
                });
              }
            }
          }
        };
      }
    },

    // Prevent shallow mocks
    'no-shallow-mocks': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent shallow mock objects',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        const filename = context.getFilename();
        const isTestFile = filename.includes('.test.') || filename.includes('.spec.');
        
        if (!isTestFile) return {};
        
        return {
          ObjectExpression(node) {
            // Check for simple mock objects like { id: 1, name: 'test' }
            const properties = node.properties;
            
            if (properties.length <= 3) {
              const hasSimpleValues = properties.some(prop => {
                if (prop.type === 'Property' && prop.value.type === 'Literal') {
                  const value = prop.value.value;
                  return (
                    typeof value === 'number' && value <= 10 ||
                    typeof value === 'string' && value.includes('test')
                  );
                }
                return false;
              });
              
              if (hasSimpleValues) {
                context.report({
                  node,
                  message: 'Avoid simple mock objects. Use realistic test data generators instead.'
                });
              }
            }
          }
        };
      }
    },

    // Enforce test naming convention
    'test-naming-convention': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce descriptive test naming convention',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              (node.callee.name === 'it' || node.callee.name === 'test') &&
              node.arguments.length > 0 &&
              node.arguments[0].type === 'Literal'
            ) {
              const description = node.arguments[0].value;
              
              // Check for vague descriptions
              const vaguePhrases = ['should work', 'test', 'works', 'basic test'];
              const isVague = vaguePhrases.some(phrase => 
                description.toLowerCase().includes(phrase.toLowerCase())
              );
              
              if (isVague || description.length < 20) {
                context.report({
                  node: node.arguments[0],
                  message: 'Test descriptions should be specific and descriptive (minimum 20 characters). Describe what the test validates.'
                });
              }
              
              // Check for proper format: "should [action] when [condition]"
              if (!description.toLowerCase().includes('should') || !description.toLowerCase().includes('when')) {
                context.report({
                  node: node.arguments[0],
                  message: 'Test descriptions should follow the pattern: "should [action] when [condition]"'
                });
              }
            }
          }
        };
      }
    },

    // Require performance monitoring
    'require-performance-monitoring': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require performance monitoring in tests',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();
        const filename = context.getFilename();
        const isTestFile = filename.includes('.test.') || filename.includes('.spec.');
        
        if (!isTestFile) return {};
        
        // Check if performance monitoring is present
        const hasPerformanceMonitoring = 
          text.includes('performanceManager') ||
          text.includes('measureTestPerformance') ||
          text.includes('performanceTestUtils');
        
        if (!hasPerformanceMonitoring) {
          return {
            Program(node) {
              context.report({
                node,
                message: 'Consider adding performance monitoring to track test execution time and resource usage.'
              });
            }
          };
        }
        
        return {};
      }
    },

    // Require database cleanup
    'require-database-cleanup': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require proper database cleanup in tests',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();
        const filename = context.getFilename();
        const isTestFile = filename.includes('.test.') || filename.includes('.spec.');
        
        if (!isTestFile) return {};
        
        // Check for database usage without cleanup
        const hasDatabaseUsage = 
          text.includes('prisma') ||
          text.includes('testDb') ||
          text.includes('TestDatabaseManager');
        
        const hasCleanup = 
          text.includes('afterEach') ||
          text.includes('cleanup') ||
          text.includes('rollback') ||
          text.includes('teardown');
        
        if (hasDatabaseUsage && !hasCleanup) {
          return {
            Program(node) {
              context.report({
                node,
                message: 'Tests using database operations must include proper cleanup in afterEach or afterAll blocks.'
              });
            }
          };
        }
        
        return {};
      }
    },

    // Prevent hardcoded test data
    'no-hardcoded-test-data': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Discourage hardcoded test data',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          VariableDeclarator(node) {
            if (node.init && node.init.type === 'ObjectExpression') {
              const properties = node.init.properties;
              
              // Check for email patterns like 'test@example.com'
              const hasTestEmail = properties.some(prop => {
                return prop.value && 
                       prop.value.type === 'Literal' && 
                       typeof prop.value.value === 'string' &&
                       prop.value.value.includes('@example.com');
              });
              
              // Check for numeric IDs
              const hasSimpleId = properties.some(prop => {
                return prop.key && 
                       prop.key.name === 'id' &&
                       prop.value && 
                       prop.value.type === 'Literal' &&
                       typeof prop.value.value === 'number' &&
                       prop.value.value <= 10;
              });
              
              if (hasTestEmail || hasSimpleId) {
                context.report({
                  node,
                  message: 'Consider using test data generators (faker, factories) instead of hardcoded values for more realistic test data.'
                });
              }
            }
          }
        };
      }
    },

    // Require realistic test data
    'require-realistic-test-data': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require realistic test data generators',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();
        const filename = context.getFilename();
        const isTestFile = filename.includes('.test.') || filename.includes('.spec.');
        
        if (!isTestFile) return {};
        
        // Check for realistic test data usage
        const hasRealisticData = 
          text.includes('createRealisticTestData') ||
          text.includes('testUtils.') ||
          text.includes('faker.') ||
          text.includes('Factory.') ||
          text.includes('testDataBuilder');
        
        // Check for simple object creation
        const hasSimpleObjectCreation = /{[\s]*id:\s*\d+/.test(text);
        
        if (hasSimpleObjectCreation && !hasRealisticData) {
          return {
            Program(node) {
              context.report({
                node,
                message: 'Use realistic test data generators instead of simple object literals. Import testUtils or use faker.js.'
              });
            }
          };
        }
        
        return {};
      }
    },

    // Prevent jest.mock for internal services
    'no-jest-mock-services': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent mocking internal services',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        const settings = context.settings['real-implementation-testing'] || {};
        const allowedMockPatterns = settings.allowedMockPatterns || [];
        
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'jest' &&
              node.callee.property.name === 'mock' &&
              node.arguments.length > 0 &&
              node.arguments[0].type === 'Literal'
            ) {
              const mockPath = node.arguments[0].value;
              
              // Check if it's an internal service (not external dependency)
              const isInternalService = 
                mockPath.includes('/services/') ||
                mockPath.includes('@/services') ||
                mockPath.includes('../services');
              
              // Check if it's in allowed patterns
              const isAllowed = allowedMockPatterns.some(pattern => {
                const regex = new RegExp(pattern);
                return regex.test(mockPath);
              });
              
              if (isInternalService && !isAllowed) {
                context.report({
                  node,
                  message: `Mocking internal service "${mockPath}" is not allowed. Use real implementation with dependency injection instead.`
                });
              }
            }
          }
        };
      }
    },

    // Require database verification
    'require-database-verification': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require database state verification after operations',
          category: 'Real Implementation Testing',
          recommended: true
        },
        schema: []
      },
      create(context) {
        return {
          CallExpression(node) {
            // Look for service method calls that likely modify database
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.property &&
              ['create', 'update', 'delete', 'save'].some(method => 
                node.callee.property.name && node.callee.property.name.includes(method)
              )
            ) {
              // Check if there's a database verification in the same test
              const parent = findTestBlock(node);
              if (parent) {
                const testBody = context.getSourceCode().getText(parent);
                const hasVerification = 
                  testBody.includes('prisma.') ||
                  testBody.includes('findUnique') ||
                  testBody.includes('findMany') ||
                  testBody.includes('count') ||
                  testBody.includes('verifyInDatabase');
                
                if (!hasVerification) {
                  context.report({
                    node,
                    message: 'Database operations should be verified by querying the database state after the operation.'
                  });
                }
              }
            }
          }
        };
      }
    }
  }
};

// Helper function to find the containing test block
function findTestBlock(node) {
  let current = node.parent;
  
  while (current) {
    if (
      current.type === 'CallExpression' &&
      current.callee.name &&
      ['it', 'test', 'describe'].includes(current.callee.name)
    ) {
      return current;
    }
    current = current.parent;
  }
  
  return null;
}