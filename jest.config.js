module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest'
    },
    moduleFileExtensions: ['js', 'jsx', 'json'],
    transformIgnorePatterns: [
      '/node_modules/(?!.*.jsx$)'
    ],
  }