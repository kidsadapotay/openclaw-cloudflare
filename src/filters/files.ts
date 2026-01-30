import type { ParsedFile, OpenClawConfig } from '../types';

export function filterFiles(
  files: ParsedFile[],
  config: OpenClawConfig
): ParsedFile[] {
  return files.filter((file) => {
    if (file.status === 'deleted') {
      return false;
    }

    if (matchesIgnorePattern(file.filename, config.ignore)) {
      return false;
    }

    if (config.languages.length > 0) {
      if (!config.languages.includes(file.language)) {
        return false;
      }
    } else {
      if (file.language === 'unknown') {
        return false;
      }
    }

    return true;
  });
}

function matchesIgnorePattern(filename: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (matchGlob(filename, pattern)) {
      return true;
    }
  }
  return false;
}

function matchGlob(filename: string, pattern: string): boolean {
  const normalizedFilename = filename.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  const regexPattern = normalizedPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '<<<GLOBSTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<GLOBSTAR>>>/g, '.*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(normalizedFilename);
}
