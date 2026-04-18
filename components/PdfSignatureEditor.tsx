"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SignatureOverlay from "./SignatureOverlay";
import DateStampOverlay from "./DateStampOverlay";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });
import ExportButton from "./ExportButton";
import type { SignaturePlacement, DateStampPlacement, SignatureAsset } from "@/types";

interface PdfSignatureEditorProps {
  pdfBytes: Uint8Array;
  signatureAssets: SignatureAsset[];
  onBack: () => void;
}

let nextId = 1;
function genId() {
  return `sig_${nextId++}_${Date.now()}`;
}

export default function PdfSignatureEditor({
  pdfBytes,
  signatureAssets,
  onBack,
}: PdfSignatureEditorProps) {
  const PDF_RENDER_WIDTH = 700;
  const [pageIndex, setPageIndex] = useState(0);

  const [activeAssetId, setActiveAssetId] = useState<string>(signatureAssets[0]?.id ?? "");

  const [signatures, setSignatures] = useState<SignaturePlacement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dateStamps, setDateStamps] = useState<DateStampPlacement[]>([]);

  const assetById = (id: string) => signatureAssets.find((a) => a.id === id);

  const handleOverlayUpdate = useCallback(
    (id: string, newPos: { x: number; y: number }, newSize: { width: number; height: number }) => {
      setSignatures((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, x: newPos.x, y: newPos.y, width: newSize.width, height: newSize.height } : s
        )
      );
    },
    []
  );

  const handleRotate = useCallback((id: string, rotation: number) => {
    setSignatures((prev) => prev.map((s) => (s.id === id ? { ...s, rotation } : s)));
  }, []);

  const handleCopy = useCallback((id: string) => {
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
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const handleAddSignature = () => {
    if (!activeAssetId) return;
    const newSig: SignaturePlacement = {
      id: genId(),
      signatureId: activeAssetId,
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

  const handleAddDateStamp = () => {
    const today = new Date();
    const dateText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const newStamp: DateStampPlacement = {
      id: genId(),
      pageIndex,
      x: 300 + Math.random() * 50,
      y: 80 + Math.random() * 30,
      fontSize: 28,
      dateText,
    };
    setDateStamps((prev) => [...prev, newStamp]);
    setSelectedId(newStamp.id);
  };

  const handleDateStampUpdate = useCallback((id: string, pos: { x: number; y: number }) => {
    setDateStamps((prev) => prev.map((d) => (d.id === id ? { ...d, x: pos.x, y: pos.y } : d)));
  }, []);

  const handleDateStampDelete = useCallback((id: string) => {
    setDateStamps((prev) => prev.filter((d) => d.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const handleDateStampFontSize = useCallback((id: string, fontSize: number) => {
    setDateStamps((prev) => prev.map((d) => (d.id === id ? { ...d, fontSize } : d)));
  }, []);

  const handleDateStampTextChange = useCallback((id: string, dateText: string) => {
    setDateStamps((prev) => prev.map((d) => (d.id === id ? { ...d, dateText } : d)));
  }, []);

  const handleBackgroundClick = () => setSelectedId(null);

  const currentPageSignatures = signatures.filter((s) => s.pageIndex === pageIndex);
  const currentPageDateStamps = dateStamps.filter((d) => d.pageIndex === pageIndex);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">操作说明：</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>先在下方选择要使用的签名，再点击「添加签名」放到当前页</li>
          <li>拖拽签名调整位置、拖拽角落调整大小</li>
          <li>点击签名选中后可旋转、复制、删除</li>
          <li>切换页面后再次添加，可在不同页放置不同签名</li>
          <li>点击「添加日期」可在当前页添加日期标注，支持调整字号和日期</li>
        </ul>
      </div>

      {/* Signature palette */}
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          选择签名 (共 {signatureAssets.length} 个)
        </p>
        <div className="flex flex-wrap gap-3">
          {signatureAssets.map((asset, idx) => {
            const isActive = asset.id === activeAssetId;
            return (
              <button
                key={asset.id}
                onClick={() => setActiveAssetId(asset.id)}
                className={`flex flex-col items-center gap-1 border-2 rounded-lg p-2 transition-all ${
                  isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"
                }`}
                title={asset.name}
              >
                <div className="w-24 h-14 flex items-center justify-center bg-white rounded">
                  <img src={asset.dataUrl} alt={asset.name}
                    className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-xs text-gray-600">签名 #{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleAddSignature}
          disabled={!activeAssetId}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加签名到当前页
        </button>
        <button
          onClick={handleAddDateStamp}
          className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
          </svg>
          添加日期
        </button>
        <span className="text-sm text-gray-500">
          共 {signatures.length} 个签名、{dateStamps.length} 个日期，当前页 {currentPageSignatures.length} 个签名、{currentPageDateStamps.length} 个日期
        </span>
      </div>

      <div onClick={handleBackgroundClick}>
        <PdfViewer
          pdfBytes={pdfBytes}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          onPageRenderSuccess={() => {}}
          width={PDF_RENDER_WIDTH}
        >
          {currentPageSignatures.map((sig) => {
            const asset = assetById(sig.signatureId);
            if (!asset) return null;
            return (
              <SignatureOverlay
                key={sig.id}
                signatureDataUrl={asset.dataUrl}
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
            );
          })}
          {currentPageDateStamps.map((stamp) => (
            <DateStampOverlay
              key={stamp.id}
              dateText={stamp.dateText}
              fontSize={stamp.fontSize}
              position={{ x: stamp.x, y: stamp.y }}
              selected={selectedId === stamp.id}
              onUpdate={(pos) => handleDateStampUpdate(stamp.id, pos)}
              onSelect={() => setSelectedId(stamp.id)}
              onDelete={() => handleDateStampDelete(stamp.id)}
              onFontSizeChange={(fs) => handleDateStampFontSize(stamp.id, fs)}
              onDateTextChange={(dt) => handleDateStampTextChange(stamp.id, dt)}
            />
          ))}
        </PdfViewer>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
        >
          返回
        </button>
        <ExportButton
          pdfBytes={pdfBytes}
          signatureAssets={signatureAssets}
          placements={signatures}
          dateStamps={dateStamps}
          renderWidth={PDF_RENDER_WIDTH}
        />
      </div>
    </div>
  );
}
