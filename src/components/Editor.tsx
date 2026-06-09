import React, { useRef, useCallback } from 'react';

interface EditorProps {
  defaultValue: string;
  onTextChange: (text: string) => void;
  onFileImport: (text: string) => void;
  onPageMargin: () => void;
}

/**
 * forwardRef로 textarea DOM을 부모에 노출.
 * uncontrolled textarea를 사용해 브라우저 네이티브 undo/redo(Ctrl+Z/Y)를 보존.
 */
export const Editor = React.forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ defaultValue, onTextChange, onFileImport, onPageMargin }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 외부 ref와 내부 ref를 모두 연결
    const setRef = useCallback((el: HTMLTextAreaElement | null) => {
      internalRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      }
    }, [ref]);

    const readFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (ev) => onFileImport(ev.target?.result as string);
      reader.readAsText(file, 'UTF-8');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) { readFile(file); e.target.value = ''; }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith('.md')) readFile(file);
    };

    const insertPageBreak = useCallback(() => {
      const ta = internalRef.current;
      if (!ta) return;
      ta.focus();

      const tag = '\n\n<!-- page-break -->\n\n';

      // execCommand는 브라우저 undo 스택에 정상 등록됨
      const ok = document.execCommand('insertText', false, tag);

      if (!ok) {
        // execCommand 미지원 환경 폴백 (undo 스택은 깨지지만 삽입은 됨)
        const start = ta.selectionStart;
        const before = ta.value.slice(0, start);
        const after = ta.value.slice(ta.selectionEnd);
        ta.value = before + tag + after;
        ta.selectionStart = ta.selectionEnd = start + tag.length;
        onTextChange(ta.value);
      }
    }, [onTextChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        insertPageBreak();
      }
    };

    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const shortcutLabel = isMac ? '⌘⇧↵' : 'Ctrl+Shift+↵';

    return (
      <div
        className="flex flex-col h-full border-r border-gray-200"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
          <span className="text-sm font-medium text-gray-600">마크다운 편집</span>
          <div className="flex items-center gap-2">
            <button
              onClick={insertPageBreak}
              title={`현재 커서 위치에 페이지 구분 삽입 (${shortcutLabel})`}
              className="text-xs px-2 py-1 bg-blue-50 border border-blue-300 text-blue-600 rounded hover:bg-blue-100 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <span>＋ 페이지 구분</span>
              <kbd className="font-sans opacity-60 text-[10px]">{shortcutLabel}</kbd>
            </button>
            <button
              onClick={onPageMargin}
              title="페이지별 마진 설정"
              className="text-xs px-2 py-1 bg-gray-50 border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              페이지 마진
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              .md 파일 열기
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <textarea
          ref={setRef}
          defaultValue={defaultValue}
          className="flex-1 w-full p-4 font-mono text-sm leading-relaxed resize-none outline-none text-gray-800 bg-white"
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`마크다운을 입력하거나 .md 파일을 드래그하세요.\n\n페이지를 강제로 나누려면:\n<!-- page-break -->`}
          spellCheck={false}
        />
      </div>
    );
  }
);

Editor.displayName = 'Editor';
