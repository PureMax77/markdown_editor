import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { usePageSplit } from '../hooks/usePageSplit';

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const match = /language-(\w+)/.exec(className || '');
  if (match) {
    return (
      <SyntaxHighlighter
        language={match[1]}
        PreTag="div"
        customStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowX: 'visible', border: '1px solid #e5e7eb', padding: 0, color: '#374151' }}
        codeTagProps={{ style: { whiteSpace: 'pre-wrap', wordBreak: 'break-all' } }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }
  return <code className={className}>{children}</code>;
}

function A4Page({ content, padding }: { content: string; padding?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="a4-page prose prose-sm max-w-none"
      style={padding ? { padding } : undefined}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ code: CodeBlock }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface PdfPreviewProps {
  markdownText: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ markdownText }) => {
  const pages = usePageSplit(markdownText);

  return (
    <div className="preview-container">
      {pages.map((page, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div className="page-break-indicator">── 페이지 구분 ──</div>
          )}
          <A4Page content={page.content} padding={page.padding} />
        </React.Fragment>
      ))}
    </div>
  );
};
