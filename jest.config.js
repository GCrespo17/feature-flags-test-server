/** @type {import('jest').Config} */
const config = {
  // Directorios donde Jest buscará tus archivos de prueba.
  // Es común usar "__tests__" o terminar los archivos con ".test.ts" o ".spec.ts".
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],

  // Directorios o archivos que Jest debe ignorar.
  // Mantener alejados de node_modules, dist (tu directorio de salida de TypeScript).
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],

  // Extensiones de archivo que Jest debe reconocer.
  // Es importante incluir ".ts" para TypeScript.
  moduleFileExtensions: [
    "js",
    "json",
    "ts",
    "node"
  ],

  // Entorno de prueba. 'node' es adecuado para librerías o lógica de backend.
  // Si tuvieras que probar componentes de UI, usarías 'jsdom'.
  testEnvironment: "node",

  // Transformaciones de archivos. Aquí le decimos a Jest que use 'ts-jest'
  // para procesar archivos TypeScript (.ts).
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },

  // Configuración para el reporter de cobertura de código.
  // Puedes ajustarlo si no necesitas cobertura.
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [
    "json",
    "lcov",
    "text",
    "clover"
  ],
  collectCoverageFrom: [
    "src/**/*.ts", // Recolecta cobertura de todos los archivos TS en la carpeta src
    "!src/**/*.d.ts", // Excluye archivos de definición de TypeScript
  ],

  // Archivos de configuración de Jest que se ejecutarán antes de cada suite de pruebas.
  // Si tienes alguna configuración específica para Jest (ej. mocks globales), iría aquí.
  // Por ahora, no es estrictamente necesario, pero lo dejo como ejemplo.
  // setupFilesAfterEnv: [],

  // Mapeo de módulos para manejar alias o archivos especiales (ej. CSS, imágenes).
  // No es estrictamente necesario para tu setup actual, pero es útil saberlo.
  // moduleNameMapper: {
  //   "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  //   "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/__mocks__/fileMock.js"
  // },

  // Opciones específicas para ts-jest si necesitas afinarlo.
  // Puedes usar tu tsconfig.json para la compilación de pruebas.
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Usa tu tsconfig.json para la compilación de ts-jest
    },
  },
};

module.exports = config;