import React, { useRef, useState } from 'react';
import { downloadImagePdf } from '../utils/downloadImagePdf';

interface TopBarProps {
  onPrint: () => void;
  onFileImport: (text: string) => void;
  onAutoDetect: () => void;
  isDetecting: boolean;
}

type ModalState = 'hidden' | 'choosing' | 'generating';

export const TopBar: React.FC<TopBarProps> = ({
  onPrint,
  onFileImport,
  onAutoDetect,
  isDetecting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState<ModalState>('hidden');
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onFileImport(ev.target?.result as string);
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  /* 브라우저 인쇄 방식 */
  const handleBrowserPrint = () => {
    setModal('hidden');
    onPrint();
  };

  /* html2canvas + jsPDF 방식 */
  const handleImagePdf = async () => {
    setModal('generating');
    setProgress(null);
    try {
      await downloadImagePdf((current, total) => {
        setProgress({ current, total });
      });
    } catch (e) {
      alert(String(e));
    } finally {
      setModal('hidden');
      setProgress(null);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0 print:hidden">
        <span className="font-bold text-lg text-gray-800">MD2PDF</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
          <button
            onClick={onAutoDetect}
            disabled={isDetecting}
            className="px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetecting ? '분석 중…' : '페이지 구분 자동 삽입'}
          </button>
          <button
            onClick={() => setModal('choosing')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            PDF 다운로드 ↓
          </button>
        </div>
      </header>

      {/* 저장 방식 선택 모달 */}
      {modal === 'choosing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[480px] max-w-[90vw]">
            <h2 className="font-bold text-base text-gray-800 mb-1">PDF 저장 방식 선택</h2>
            <p className="text-xs text-gray-400 mb-4">두 방식의 특성이 다릅니다. 용도에 맞게 선택하세요.</p>

            <div className="space-y-3 mb-5">
              {/* 방법 1 */}
              <button
                onClick={handleBrowserPrint}
                className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                    방법 1 — 브라우저 인쇄
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">텍스트 검색 가능</span>
                </div>
                <p className="text-xs text-gray-500">
                  브라우저 인쇄 창 → "PDF로 저장". 텍스트 복사·검색 가능, 파일 크기 작음.<br />
                  <span className="text-amber-500">인쇄 창에서 여백 "없음", 배율 100% 설정 필요.</span>
                </p>
              </button>

              {/* 방법 2 */}
              <button
                onClick={handleImagePdf}
                className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                    방법 2 — 이미지 PDF (WYSIWYG) ⭐
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">뷰어와 동일</span>
                </div>
                <p className="text-xs text-gray-500">
                  각 페이지를 이미지로 캡처해 PDF 생성. 뷰어와 픽셀 단위로 동일.<br />
                  <span className="text-gray-400">텍스트 복사·검색 불가, 파일 크기 큼.</span>
                </p>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setModal('hidden')}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 PDF 생성 중 로딩 */}
      {modal === 'generating' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 min-w-[220px]">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-700">
              {progress
                ? `PDF 생성 중… ${progress.current} / ${progress.total} 페이지`
                : 'PDF 생성 중…'}
            </p>
            <p className="text-xs text-gray-400">페이지 수에 따라 수 초 소요될 수 있습니다.</p>
          </div>
        </div>
      )}
    </>
  );
};
