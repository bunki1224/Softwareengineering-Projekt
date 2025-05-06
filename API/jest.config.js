module.exports = {
  testEnvironment: 'node',
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'API Test Report',
      outputPath: './reports/test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true,
      dateFormat: "yyyy-mm-dd HH:MM:ss"
    }]
  ]
};