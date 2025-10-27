// Jest config pour support ESM et Node.js 24
export default {
  testEnvironment: 'node',
  transform: {}, // Pas de transform, ESM natif
  moduleFileExtensions: ['js', 'json'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  roots: ['<rootDir>/tests'],
  verbose: true,
};
