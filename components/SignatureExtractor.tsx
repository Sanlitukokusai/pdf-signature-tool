"use client";

import { useEffect, useRef, useState } from "react";
import { extractSignature } from "@/lib/signature-extraction";
import type { SignatureAsset } from "@/types";

interface SignatureExtractorProps {
  signatureFiles: File[];
  onExtracted: (assets: SignatureAsset[]) => void;
  onBack: () => void;
  onSignatureFilesChange: (files: File[]) => void;
}

interface SigState {
  file: File;
  originalUrl: string;
  threshold: number;
  extractedDataUrl: string | null;
}

export default function SignatureExtractor({
  signatureFiles,
  onExtracted,
  onBack,
  onSignatureFilesChange,
}: SignatureExtractorProps) {
  const [items, setItems] = useState<SigState[]>([]);
  const imageCache = useRef<Map<number, HTMLImageElement>>(new Map());

  useEffect(() => {
    const urls: string[] = [];
    const next: SigState[] = signatureFiles.map((f) => {
      const url = URL.createObjectURL(f);
      urls.push(url);
      return { file: f, originalUrl: url, threshold: 160, extractedDataUrl: null };
    });
    setItems(next);
    imageCache.current = new Map();

    next.forEach((item, idx) => {
      const img = new Image();
      img.onload = () => {
        imageCache.current.set(idx, img);
        const result = extractSignature(img, item.threshold);
        setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, extractedDataUrl: result } : p)));
      };
      img.src = item.originalUrl;
    });

    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [signatureFiles]);

  const handleThresholdChange = (idx: number, newThreshold: number) => {
    const img = imageCache.current.get(idx);
    setItems((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        const result = img ? extractSignature(img, newThreshold) : p.extractedDataUrl;
        return { ...p, threshold: newThreshold, extractedDataUrl: result };
      })
    );
  };

  const handleRemove = (idx: number) => {
    onSignatureFilesChange(signatureFiles.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    const assets: SignatureAsset[] = items
      .filter((it) => it.extractedDataUrl)
      .map((it, i) => ({
        id: `asset_${i}_${Date.now()}`,
        name: it.file.name || `签名${i + 1}`,
        dataUrl: it.extractedDataUrl!,
        threshold: it.threshold,
      }));
    if (assets.length === 0) return;
    onExtracted(assets);
  };

  const allExtracted = items.length > 0 && items.every((it) => it.extractedDataUrl);

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">
                <span className="text-blue-600 mr-2">签名 #{idx + 1}</span>
                <span className="text-sm text-gray-500 truncate">{item.file.name}</span>
              </h3>
              {items.length > 1 && (
                <button onClick={() => handleRemove(idx)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">
                  移除
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">原始图片</p>
                <div className="border rounded-lg p-3 bg-white">
                  <img src={item.originalUrl} alt="Original"
                    className="max-w-full h-auto mx-auto max-h-[180px] object-contain" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">提取结果</p>
                <div className="border rounded-lg p-3"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                >
                  {item.extractedDataUrl && (
                    <img src={item.extractedDataUrl} alt="Extracted"
                      className="max-w-full h-auto mx-auto max-h-[180px] object-contain" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">提取灵敏度</label>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.threshold}</span>
              </div>
              <input type="range" min={50} max={230} value={item.threshold}
                onChange={(e) => handleThresholdChange(idx, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>提取更多</span>
                <span>提取更少</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all">
          返回
        </button>
        <button onClick={handleNext} disabled={!allExtracted}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-40">
          下一步 - 放置到PDF上
        </button>
      </div>
    </div>
  );
}
