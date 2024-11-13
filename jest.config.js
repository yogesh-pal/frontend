module.exports = {
  jest: {
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*test.js'],
    coverageThreshold: {
      global: {
        lines: 90,
      },
    },
  },
};
