"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfBytes: Uint8Array;
  pageIndex: number;
  onPageChange: (index: number) => void;
  onPageRenderSuccess: (width: number, height: number) => void;
  width?: number;
  children?: React.ReactNode;
}

export default function PdfViewer({
  pdfBytes,
  pageIndex,
  onPageChange,
  onPageRenderSuccess,
  width = 700,
  children,
}: PdfViewerProps) {
  // Use useState + useEffect to create a stable Blob URL that survives re-renders
  // This avoids the ArrayBuffer detach issue with pdfjs worker postMessage
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const prevBytesRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    // Only create a new URL if pdfBytes actually changed
    if (prevBytesRef.current === pdfBytes && fileUrl) return;
    prevBytesRef.current = pdfBytes;

    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfBytes]); // eslint-disable-line react-hooks/exhaustive-deps

  const [numPages, setNumPages] = useState<number>(0);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  const onRenderSuccess = useCallback(() => {
    const pageEl = document.querySelector(".react-pdf__Page") as HTMLElement;
    if (pageEl) {
      const canvas = pageEl.querySelector("canvas");
      if (canvas) {
        onPageRenderSuccess(canvas.clientWidth, canvas.clientHeight);
      }
    }
  }, [onPageRenderSuccess]);

  if (!fileUrl) return null;

  return (
    <div className="space-y-4">
      {/* Page navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0}
          className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          &larr; 上一页
        </button>
        <span className="text-sm text-gray-600">
          {pageIndex + 1} / {numPages || "..."}
        </span>
        <button
          onClick={() => onPageChange(Math.min(numPages - 1, pageIndex + 1))}
          disabled={pageIndex >= numPages - 1}
          className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          下一页 &rarr;
        </button>
      </div>

      {/* PDF Page with signature overlay */}
      <div className="flex justify-center">
        <div
          className="relative inline-block shadow-lg border border-gray-200 rounded-lg overflow-hidden"
          style={{ lineHeight: 0 }}
        >
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageIndex + 1}
              width={width}
              onRenderSuccess={onRenderSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Children (signature overlay) positioned absolutely within the page */}
          {children}
        </div>
      </div>
    </div>
  );
}
