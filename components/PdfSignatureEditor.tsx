"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SignatureOverlay from "./SignatureOverlay";

// Dynamic import to avoid SSR issues with react-pdf (DOMMatrix not available in Node.js)
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });
import ExportButton from "./ExportButton";
import type { SignaturePlacement, PageDimensions } from "@/types";

interface PdfSignatureEditorProps {
  pdfBytes: Uint8Array;
  signatureDataUrl: string;
  onBack: () => void;
}

export default function PdfSignatureEditor({
  pdfBytes,
  signatureDataUrl,
  onBack,
}: PdfSignatureEditorProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(
    null
  );
  const [position, setPosition] = useState({ x: 100, y: 400 });
  const [size, setSize] = useState({ width: 200, height: 80 });
  const [rotation, setRotation] = useState(0);

  const handlePageRenderSuccess = useCallback(
    (width: number, height: number) => {
      setPageDimensions({ width, height });
    },
    []
  );

  const handleOverlayUpdate = useCallback(
    (newPos: { x: number; y: number }, newSize: { width: number; height: number }) => {
      setPosition(newPos);
      setSize(newSize);
    },
    []
  );

  const placement: SignaturePlacement = {
    pageIndex,
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    rotation,
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">操作说明：</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>拖拽签名调整位置</li>
          <li>拖拽签名角落调整大小</li>
          <li>点击签名下方按钮旋转</li>
          <li>切换页面选择签名位置</li>
        </ul>
      </div>

      {/* PDF Viewer with Signature Overlay */}
      <PdfViewer
        pdfBytes={pdfBytes}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        onPageRenderSuccess={handlePageRenderSuccess}
        width={700}
      >
        <SignatureOverlay
          signatureDataUrl={signatureDataUrl}
          position={position}
          size={size}
          rotation={rotation}
          onUpdate={handleOverlayUpdate}
          onRotate={setRotation}
        />
      </PdfViewer>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
        >
          返回
        </button>
        <ExportButton
          pdfBytes={pdfBytes}
          signatureDataUrl={signatureDataUrl}
          placement={placement}
          renderedPageDimensions={pageDimensions}
        />
      </div>
    </div>
  );
}
