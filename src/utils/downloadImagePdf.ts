import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * 화면에 렌더링된 .a4-page 요소들을 html2canvas로 캡처해
 * jsPDF로 합쳐 PDF 파일을 저장한다.
 * @param onProgress 페이지별 진행 콜백 (current, total)
 */
export async function downloadImagePdf(
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const pages = Array.from(
    document.querySelectorAll('.a4-page'),
  ) as HTMLElement[];

  if (pages.length === 0) {
    throw new Error('출력할 페이지가 없습니다.');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    onProgress?.(i + 1, pages.length);

    const canvas = await html2canvas(pages[i], {
      scale: 2,             // 2배 해상도로 선명하게
      useCORS: true,        // Google Fonts 등 외부 리소스 허용
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    if (i > 0) pdf.addPage();
    // 캔버스를 A4 전체(210×297mm)에 맞춰 삽입
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  }

  pdf.save('document.pdf');
}
