import { useMemo } from 'react';
import { splitIntoPages, PageData } from '../utils/markdownParser';

export function usePageSplit(markdown: string): PageData[] {
  return useMemo(() => {
    const pages = splitIntoPages(markdown);
    return pages.length > 0 ? pages : [{ content: markdown }];
  }, [markdown]);
}
