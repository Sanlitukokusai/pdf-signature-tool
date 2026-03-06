"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SignatureOverlay from "./SignatureOverlay";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });
import ExportButton from "./ExportButton";
import type { SignaturePlacement } from "@/types";

interface PdfSignatureEditorProps {
  pdfBytes: Uint8Array;
  signatureDataUrl: string;
  onBack: () => void;
}

let nextId = 1;
function genId() {
  return `sig_${nextId++}_${Date.now()}`;
}

export default function PdfSignatureEditor({
  pdfBytes,
  signatureDataUrl,
  onBack,
}: PdfSignatureEditorProps) {
  const PDF_RENDER_WIDTH = 700;
  const [pageIndex, setPageIndex] = useState(0);

  // Multiple signatures
  const [signatures, setSignatures] = useState<SignaturePlacement[]>(() => [
    { id: genId(), pageIndex: 0, x: 100, y: 400, width: 200, height: 80, rotation: 0 },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(signatures[0]?.id ?? null);

  const handleOverlayUpdate = useCallback(
    (id: string, newPos: { x: number; y: number }, newSize: { width: number; height: number }) => {
      setSignatures((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x: newPos.x, y: newPos.y, width: newSize.width, height: newSize.height } : s))
      );
    },
    []
  );

  const handleRotate = useCallback((id: string, rotation: number) => {
    setSignatures((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation } : s))
    );
  }, []);

  const handleCopy = useCallback(
    (id: string) => {
      setSignatures((prev) => {
        const source = prev.find((s) => s.id === id);
        if (!source) return prev;
        const newSig: SignaturePlacement = {
          ...source,
          id: genId(),
          x: source.x + 20,
          y: source.y + 20,
        };
        setSelectedId(newSig.id);
        return [...prev, newSig];
      });
    },
    []
  );

  const handleDelete = useCallback(
    (id: string) => {
      setSignatures((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        return updated;
      });
      setSelectedId((currentSelected) =>
        currentSelected === id ? null : currentSelected
      );
    },
    []
  );

  const handleAddSignature = () => {
    const newSig: SignaturePlacement = {
      id: genId(),
      pageIndex,
      x: 100 + Math.random() * 50,
      y: 300 + Math.random() * 50,
      width: 200,
      height: 80,
      rotation: 0,
    };
    setSignatures((prev) => [...prev, newSig]);
    setSelectedId(newSig.id);
  };

  // Click on empty area deselects
  const handleBackgroundClick = () => {
    setSelectedId(null);
  };

  // Signatures on the current page
  const currentPageSignatures = signatures.filter((s) => s.pageIndex === pageIndex);
  const totalSignatures = signatures.length;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">操作说明：</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>拖拽签名调整位置</li>
          <li>拖拽签名角落调整大小</li>
          <li>点击签名选中后可旋转、复制、删除</li>
          <li>点击「添加签名」可在当前页添加新签名</li>
          <li>切换页面后添加签名即可在不同页签名</li>
        </ul>
      </div>

      {/* Add signature button + count */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAddSignature}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加签名
        </button>
        <span className="text-sm text-gray-500">
          共 {totalSignatures} 个签名，当前页 {currentPageSignatures.length} 个
        </span>
      </div>

      {/* PDF Viewer with Signature Overlays */}
      <div onClick={handleBackgroundClick}>
        <PdfViewer
          pdfBytes={pdfBytes}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          onPageRenderSuccess={() => {}}
          width={PDF_RENDER_WIDTH}
        >
          {currentPageSignatures.map((sig) => (
            <SignatureOverlay
              key={sig.id}
              signatureDataUrl={signatureDataUrl}
              position={{ x: sig.x, y: sig.y }}
              size={{ width: sig.width, height: sig.height }}
              rotation={sig.rotation}
              selected={selectedId === sig.id}
              onUpdate={(pos, size) => handleOverlayUpdate(sig.id, pos, size)}
              onRotate={(r) => handleRotate(sig.id, r)}
              onSelect={() => setSelectedId(sig.id)}
              onCopy={() => handleCopy(sig.id)}
              onDelete={() => handleDelete(sig.id)}
            />
          ))}
        </PdfViewer>
      </div>

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
          placements={signatures}
          renderWidth={PDF_RENDER_WIDTH}
        />
      </div>
    </div>
  );
}
