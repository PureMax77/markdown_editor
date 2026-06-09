export const PAGE_BREAK_PATTERN = /<!--\s*page-break\s*-->|---page-break---/gi;
export const PAGE_MARGIN_PATTERN = /<!--\s*page-margin:\s*([^-]+?)\s*-->/i;

export interface PageData {
  content: string;
  padding?: string;
}

export function splitByPageBreak(markdown: string): string[] {
  const segments = markdown.split(/<!--\s*page-break\s*-->|---page-break---/gi);
  return segments.map((s) => s.trim()).filter((s) => s.length > 0);
}

export function splitIntoPages(markdown: string): PageData[] {
  const segments = markdown.split(/<!--\s*page-break\s*-->|---page-break---/gi);
  return segments
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const match = /<!--\s*page-margin:\s*([^-]+?)\s*-->/i.exec(s);
      if (match) {
        return {
          content: s.replace(/<!--\s*page-margin:\s*([^-]+?)\s*-->/i, '').trim(),
          padding: match[1].trim(),
        };
      }
      return { content: s };
    });
}

export function stripPageBreaks(markdown: string): string {
  return markdown.replace(/<!--\s*page-break\s*-->|---page-break---/gi, '');
}

/**
 * 마크다운을 블록(단락, 제목, 표, 코드블록 등) 단위로 분리
 * 빈 줄로 구분하되, 펜스 코드블록 내부는 유지
 */
export function splitIntoBlocks(markdown: string): string[] {
  const lines = markdown.split('\n');
  const blocks: string[] = [];
  let currentLines: string[] = [];
  let inFencedCode = false;

  for (const line of lines) {
    if (/^(`{3,}|~{3,})/.test(line.trimStart())) {
      inFencedCode = !inFencedCode;
    }

    if (!inFencedCode && line.trim() === '') {
      if (currentLines.length > 0) {
        blocks.push(currentLines.join('\n'));
        currentLines = [];
      }
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.some(l => l.trim())) {
    blocks.push(currentLines.join('\n'));
  }

  return blocks.filter(b => b.trim().length > 0);
}
