// File: /home/saif-linux/Projects/vizal-flash-sale-saif/e2e-tests/index.js

const jest = require('jest');
const path = require('path');

/**
 * Run end-to-end tests
 * @param {string} [testFile] - Optional specific test file to run
 */
async function runTests(testFile) {
  const config = {
    roots: [path.resolve(__dirname)],
    testEnvironment: 'node',
    verbose: true,
  };

  if (testFile) {
    config.testRegex = testFile;
  }

  try {
    const result = await jest.runCLI(config, [__dirname]);
    if (!result.results.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// If this script is run directly, run all tests
if (require.main === module) {
  runTests();
} else {
  // Export the function for programmatic use
  module.exports = { runTests };
}