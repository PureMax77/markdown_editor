import React, { useState, useEffect } from 'react';
import { PageData } from '../utils/markdownParser';

interface Props {
  pages: PageData[];
  onApply: (pageIndex: number | 'all', margin: string | null) => void;
  onClose: () => void;
}

function parseMargin(padding: string | undefined) {
  if (!padding) return { top: '20', right: '25', bottom: '20', left: '25' };
  const parts = padding.trim().split(/\s+/).map((p) => p.replace('mm', ''));
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  if (parts.length === 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  return { top: '20', right: '25', bottom: '20', left: '25' };
}

const ALL = 'all' as const;

export const PageMarginModal: React.FC<Props> = ({ pages, onApply, onClose }) => {
  const [selectedPage, setSelectedPage] = useState<number | typeof ALL>(0);
  const [top, setTop] = useState('20');
  const [right, setRight] = useState('25');
  const [bottom, setBottom] = useState('20');
  const [left, setLeft] = useState('25');

  useEffect(() => {
    if (selectedPage === ALL) {
      setTop('20'); setRight('25'); setBottom('20'); setLeft('25');
      return;
    }
    const { top: t, right: r, bottom: b, left: l } = parseMargin(pages[selectedPage]?.padding);
    setTop(t); setRight(r); setBottom(b); setLeft(l);
  }, [selectedPage, pages]);

  const handleApply = () => {
    onApply(selectedPage, `${top}mm ${right}mm ${bottom}mm ${left}mm`);
    onClose();
  };

  const handleReset = () => {
    onApply(selectedPage, null);
    onClose();
  };

  const fields = [
    { label: '위', value: top, set: setTop },
    { label: '오른쪽', value: right, set: setRight },
    { label: '아래', value: bottom, set: setBottom },
    { label: '왼쪽', value: left, set: setLeft },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-[90vw]">
        <h2 className="font-bold text-base text-gray-800 mb-4">페이지 마진 설정</h2>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">페이지 선택</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPage(ALL)}
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                selectedPage === ALL
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              전체 페이지
            </button>
            {pages.map((page, i) => (
              <button
                key={i}
                onClick={() => setSelectedPage(i)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  selectedPage === i
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {i + 1}페이지
                {page.padding && (
                  <span className="ml-1 text-[10px] text-blue-400">●</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2">여백 (mm) — 기본값: 위·아래 20mm / 좌·우 25mm</p>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    min="0"
                    className="flex-1 px-2 py-1.5 text-sm outline-none w-0"
                  />
                  <span className="px-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-200 py-1.5">
                    mm
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            기본값으로 초기화
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
