export default {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.{ts,tsx}',
        '**/*.{test,spec}.{ts,tsx}',
    ],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react',
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                },
            },
        ],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    watchman: false,
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
        '!src/main.tsx',
        '!src/vite-env.d.ts',
    ],
    testTimeout: 10000,
    verbose: true,
}