// Jest config ESM natif (Node.js 24+)
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  roots: ['<rootDir>/tests'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  verbose: true,
};