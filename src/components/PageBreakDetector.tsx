import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { stripPageBreaks, splitIntoBlocks } from '../utils/markdownParser';

// A4 콘텐츠 높이: 297mm - 위아래 패딩(20mm × 2) = 257mm → 96dpi 기준 px
const A4_CONTENT_PX = Math.round(257 * 96 / 25.4); // ~971px

interface PageBreakDetectorProps {
  markdown: string;
  onDetected: (markdownWithBreaks: string) => void;
}

/**
 * 숨겨진 div에 마크다운 블록들을 렌더링하고 높이를 측정해
 * <!-- page-break --> 위치를 계산한 뒤 onDetected 콜백으로 반환.
 * 마운트 시 1회만 실행되고, onDetected 호출 후 부모가 언마운트시킴.
 */
export const PageBreakDetector: React.FC<PageBreakDetectorProps> = ({
  markdown,
  onDetected,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blocks = splitIntoBlocks(stripPageBreaks(markdown));

  useEffect(() => {
    const container = containerRef.current;
    if (!container || blocks.length === 0) {
      onDetected(markdown);
      return;
    }

    const blockDivs = Array.from(container.children) as HTMLElement[];
    if (blockDivs.length !== blocks.length) return;

    const containerTop = container.getBoundingClientRect().top;
    const result: string[] = [];
    let pageStart = 0;

    blockDivs.forEach((div, i) => {
      const rect = div.getBoundingClientRect();
      const blockTop = rect.top - containerTop;
      const blockBottom = rect.bottom - containerTop;

      // 이 블록의 하단이 현재 페이지를 초과하고,
      // 이미 앞에 내용이 있을 때(첫 항목이 아닐 때)만 페이지 구분 삽입
      if (i > 0 && blockBottom - pageStart > A4_CONTENT_PX && blockTop > pageStart) {
        result.push('<!-- page-break -->');
        pageStart = blockTop;
      }

      result.push(blocks[i]);
    });

    onDetected(result.join('\n\n'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 1회만 실행

  return (
    <div
      ref={containerRef}
      className="prose prose-sm max-w-none"
      style={{
        position: 'fixed',
        top: 0,
        left: '-9999px',
        width: '160mm',
        visibility: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {blocks.map((block, i) => (
        <div key={i}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
};
