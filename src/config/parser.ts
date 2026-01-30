import YAML from 'yaml';
import type { OpenClawConfig } from '../types';
import { DEFAULT_CONFIG } from './defaults';

export async function fetchConfig(
  repoFullName: string,
  branch: string,
  token: string
): Promise<OpenClawConfig> {
  const url = `https://api.github.com/repos/${repoFullName}/contents/.openclaw.yml?ref=${branch}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'OpenClaw-Bot',
      },
    });

    if (!response.ok) {
      return DEFAULT_CONFIG;
    }

    const content = await response.text();
    const userConfig = YAML.parse(content) as Partial<OpenClawConfig>;

    return mergeConfig(userConfig);
  } catch {
    return DEFAULT_CONFIG;
  }
}

function mergeConfig(userConfig: Partial<OpenClawConfig>): OpenClawConfig {
  return {
    version: userConfig.version ?? DEFAULT_CONFIG.version,
    review: {
      ...DEFAULT_CONFIG.review,
      ...userConfig.review,
    },
    ignore: userConfig.ignore ?? DEFAULT_CONFIG.ignore,
    limits: {
      ...DEFAULT_CONFIG.limits,
      ...userConfig.limits,
    },
    languages: userConfig.languages ?? DEFAULT_CONFIG.languages,
    verbosity: userConfig.verbosity ?? DEFAULT_CONFIG.verbosity,
  };
}
