import type { ParsedFile, OpenClawConfig, SizeCheckResult } from '../types';

export function checkSizeLimits(
  files: ParsedFile[],
  config: OpenClawConfig
): { filtered: ParsedFile[]; result: SizeCheckResult } {
  const limits = config.limits;
  const skippedFiles: string[] = [];
  let totalLines = 0;

  const filteredFiles = files.filter((file) => {
    const fileLines = file.additions + file.deletions;

    if (fileLines > limits.max_lines_per_file) {
      skippedFiles.push(
        `${file.filename} (${fileLines} lines > ${limits.max_lines_per_file} limit)`
      );
      return false;
    }

    return true;
  });

  for (const file of filteredFiles) {
    totalLines += file.additions + file.deletions;
  }

  if (filteredFiles.length > limits.max_files) {
    return {
      filtered: [],
      result: {
        ok: false,
        reason: `PR has ${filteredFiles.length} files, exceeds limit of ${limits.max_files}`,
        stats: {
          totalFiles: files.length,
          totalLines,
          skippedFiles,
        },
      },
    };
  }

  if (totalLines > limits.max_total_lines) {
    return {
      filtered: [],
      result: {
        ok: false,
        reason: `PR has ${totalLines} total lines changed, exceeds limit of ${limits.max_total_lines}`,
        stats: {
          totalFiles: files.length,
          totalLines,
          skippedFiles,
        },
      },
    };
  }

  return {
    filtered: filteredFiles,
    result: {
      ok: true,
      stats: {
        totalFiles: filteredFiles.length,
        totalLines,
        skippedFiles,
      },
    },
  };
}
