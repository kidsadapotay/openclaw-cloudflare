import type { OpenClawConfig } from '../types';

export const DEFAULT_CONFIG: OpenClawConfig = {
  version: 1,
  review: {
    security: true,
    quality: true,
    refactor: true,
    tests: true,
  },
  ignore: [
    '*.lock',
    '*.min.js',
    '*.min.css',
    'dist/**',
    'build/**',
    'node_modules/**',
    'vendor/**',
    '**/*.generated.*',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'composer.lock',
    'Gemfile.lock',
    'poetry.lock',
    '**/*.map',
    '**/*.d.ts',
  ],
  limits: {
    max_files: 15,
    max_lines_per_file: 300,
    max_total_lines: 1500,
  },
  languages: [],
  verbosity: 'normal',
};

export const SUPPORTED_LANGUAGES: Record<string, string[]> = {
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  typescript: ['.ts', '.tsx', '.mts', '.cts'],
  python: ['.py', '.pyw'],
  java: ['.java'],
  go: ['.go'],
  rust: ['.rs'],
  ruby: ['.rb'],
  php: ['.php'],
  csharp: ['.cs'],
  cpp: ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
  c: ['.c', '.h'],
  swift: ['.swift'],
  kotlin: ['.kt', '.kts'],
};
