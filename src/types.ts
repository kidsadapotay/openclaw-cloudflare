export interface Env {
  AI: Ai;
  GITHUB_TOKEN: string;
  GITHUB_WEBHOOK_SECRET: string;
}

export interface OpenClawConfig {
  version: number;
  review: {
    security: boolean;
    quality: boolean;
    refactor: boolean;
    tests: boolean;
  };
  ignore: string[];
  limits: {
    max_files: number;
    max_lines_per_file: number;
    max_total_lines: number;
  };
  languages: string[];
  verbosity: 'minimal' | 'normal' | 'detailed';
}

export interface PRPayload {
  action: string;
  number: number;
  pull_request: {
    number: number;
    title: string;
    head: {
      ref: string;
      sha: string;
    };
    base: {
      ref: string;
    };
  };
  repository: {
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
  };
}

export interface ParsedFile {
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  patch: string;
  language: string;
}

export interface ReviewResult {
  type: 'security' | 'quality' | 'refactor' | 'tests';
  issues: ReviewIssue[];
}

export interface ReviewIssue {
  severity: 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface SizeCheckResult {
  ok: boolean;
  reason?: string;
  stats: {
    totalFiles: number;
    totalLines: number;
    skippedFiles: string[];
  };
}
