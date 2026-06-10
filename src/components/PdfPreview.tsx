import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { usePageSplit } from '../hooks/usePageSplit';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

let mermaidIdCounter = 0;

function MermaidChart({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const id = `mermaid-${++mermaidIdCounter}`;
    mermaid.render(id, code)
      .then(({ svg }) => {
        setSvg(svg);
        setError('');
      })
      .catch((err) => {
        setError(err?.message ?? 'Mermaid 렌더링 오류');
        setSvg('');
      });
  }, [code]);

  if (error) {
    return (
      <pre style={{ color: '#dc2626', background: '#fef2f2', padding: '8px', borderRadius: '4px', fontSize: '12px' }}>
        {error}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      style={{ textAlign: 'center', margin: '8px 0' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const match = /language-(\w+)/.exec(className || '');
  if (match) {
    if (match[1] === 'mermaid') {
      return <MermaidChart code={String(children).replace(/\n$/, '')} />;
    }
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

function A4Page({ content, padding, pageNumber, totalPages }: { content: string; padding?: string; pageNumber: number; totalPages: number }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: 'relative' }}>
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
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '16px',
        fontSize: '11px',
        color: '#9ca3af',
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {pageNumber} / {totalPages}
      </div>
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
          <A4Page content={page.content} padding={page.padding} pageNumber={i + 1} totalPages={pages.length} />
        </React.Fragment>
      ))}
    </div>
  );
};
