import { useRef, useState } from 'react';
import { Editor } from './components/Editor';
import { PdfPreview } from './components/PdfPreview';
import { TopBar } from './components/TopBar';
import { PageBreakDetector } from './components/PageBreakDetector';
import { PageMarginModal } from './components/PageMarginModal';
import { splitIntoPages } from './utils/markdownParser';

const SAMPLE_MARKDOWN = `# 마크다운 PDF 변환기

본문 내용을 여기에 작성하세요. 왼쪽 에디터에 마크다운을 입력하면 오른쪽 프리뷰에서 A4 페이지 레이아웃을 실시간으로 확인할 수 있습니다.

## 표 예시

| 항목 | 설명 | 비고 |
|------|------|------|
| A    | 첫 번째 항목 | 중요 |
| B    | 두 번째 항목 | 일반 |
| C    | 세 번째 항목 | 참고 |

## 코드 블록 예시

\`\`\`typescript
const hello = (name: string): string => {
  return \`Hello, \${name}!\`;
};

console.log(hello('World'));
\`\`\`

<!-- page-break -->

## 다음 페이지 시작

\`<!-- page-break -->\` 태그가 있는 위치에서 새 페이지가 시작됩니다.

페이지 구분을 자동으로 삽입하려면 상단의 **"페이지 구분 자동 삽입"** 버튼을 클릭하거나,
.md 파일을 불러오면 자동으로 분석합니다.

## 인용구 예시

> 마크다운은 HTML 없이도 구조적인 문서를 작성할 수 있는 경량 마크업 언어입니다.

**PDF 다운로드** 버튼을 클릭하면 브라우저 인쇄 다이얼로그가 열립니다. "PDF로 저장"을 선택하세요.
`;

function App() {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  // 프리뷰 전용 상태 — textarea value와 분리
  const [previewMarkdown, setPreviewMarkdown] = useState(SAMPLE_MARKDOWN);
  const [detectTarget, setDetectTarget] = useState<string | null>(null);
  const [showMarginModal, setShowMarginModal] = useState(false);

  /** textarea DOM과 프리뷰 상태를 동시에 업데이트 */
  const setEditorContent = (text: string) => {
    if (editorRef.current) editorRef.current.value = text;
    setPreviewMarkdown(text);
  };

  const handleDetected = (result: string) => {
    setEditorContent(result);
    setDetectTarget(null);
  };

  // 파일 불러올 때 자동으로 페이지 구분 삽입
  const handleFileImport = (text: string) => {
    setDetectTarget(text);
  };

  const handleApplyMargin = (pageIndex: number | 'all', margin: string | null) => {
    const parts = previewMarkdown.split(/<!--\s*page-break\s*-->|---page-break---/gi);

    const applyToSegment = (segment: string) => {
      const stripped = segment.trim().replace(/<!--\s*page-margin:\s*[^-]+?\s*-->/gi, '').trim();
      return margin ? `<!-- page-margin: ${margin} -->\n\n${stripped}` : stripped;
    };

    const updated =
      pageIndex === 'all'
        ? parts.map(applyToSegment)
        : parts.map((seg, i) => (i === pageIndex ? applyToSegment(seg) : seg));

    setEditorContent(updated.join('\n\n<!-- page-break -->\n\n'));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar
        onPrint={() => window.print()}
        onFileImport={handleFileImport}
        onAutoDetect={() => setDetectTarget(editorRef.current?.value ?? previewMarkdown)}
        isDetecting={detectTarget !== null}
      />

      <div className="flex flex-1 overflow-hidden min-w-[1024px]">
        <div className="w-1/2 overflow-hidden">
          <Editor
            ref={editorRef}
            defaultValue={SAMPLE_MARKDOWN}
            onTextChange={setPreviewMarkdown}
            onFileImport={handleFileImport}
            onPageMargin={() => setShowMarginModal(true)}
          />
        </div>
        <div className="w-1/2 overflow-hidden">
          <PdfPreview markdownText={previewMarkdown} />
        </div>
      </div>

      {detectTarget !== null && (
        <PageBreakDetector
          markdown={detectTarget}
          onDetected={handleDetected}
        />
      )}

      {showMarginModal && (
        <PageMarginModal
          pages={splitIntoPages(previewMarkdown)}
          onApply={handleApplyMargin}
          onClose={() => setShowMarginModal(false)}
        />
      )}
    </div>
  );
}

export default App;
