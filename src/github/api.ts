import type { ParsedFile } from '../types';

const GITHUB_API = 'https://api.github.com';

export async function fetchPRFiles(
  repoFullName: string,
  prNumber: number,
  token: string
): Promise<ParsedFile[]> {
  const url = `${GITHUB_API}/repos/${repoFullName}/pulls/${prNumber}/files`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'OpenClaw-Bot',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch PR files: ${response.status}`);
  }

  const files = (await response.json()) as GitHubFile[];

  return files.map((file) => ({
    filename: file.filename,
    status: file.status as ParsedFile['status'],
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch ?? '',
    language: detectLanguage(file.filename),
  }));
}

export async function postComment(
  repoFullName: string,
  prNumber: number,
  body: string,
  token: string
): Promise<void> {
  const url = `${GITHUB_API}/repos/${repoFullName}/issues/${prNumber}/comments`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'OpenClaw-Bot',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post comment: ${response.status} - ${error}`);
  }
}

export async function findExistingComment(
  repoFullName: string,
  prNumber: number,
  token: string
): Promise<number | null> {
  const url = `${GITHUB_API}/repos/${repoFullName}/issues/${prNumber}/comments`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'OpenClaw-Bot',
    },
  });

  if (!response.ok) {
    return null;
  }

  const comments = (await response.json()) as GitHubComment[];
  const openclawComment = comments.find((c) =>
    c.body.includes('OpenClaw Code Review')
  );

  return openclawComment?.id ?? null;
}

export async function updateComment(
  repoFullName: string,
  commentId: number,
  body: string,
  token: string
): Promise<void> {
  const url = `${GITHUB_API}/repos/${repoFullName}/issues/comments/${commentId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'OpenClaw-Bot',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update comment: ${response.status}`);
  }
}

function detectLanguage(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.'));
  const langMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.cs': 'csharp',
    '.cpp': 'cpp',
    '.c': 'c',
    '.swift': 'swift',
    '.kt': 'kotlin',
  };

  return langMap[ext] ?? 'unknown';
}

interface GitHubFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

interface GitHubComment {
  id: number;
  body: string;
}
