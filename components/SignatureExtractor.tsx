"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { extractSignature } from "@/lib/signature-extraction";

interface SignatureExtractorProps {
  signatureFile: File;
  onExtracted: (dataUrl: string) => void;
  onBack: () => void;
  onSignatureFileChange: (file: File) => void;
}

export default function SignatureExtractor({
  signatureFile,
  onExtracted,
  onBack,
  onSignatureFileChange,
}: SignatureExtractorProps) {
  const [threshold, setThreshold] = useState(160);
  const [extractedDataUrl, setExtractedDataUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        onSignatureFileChange(file);
      }
    },
    [onSignatureFileChange]
  );

  // Load the signature image
  useEffect(() => {
    const url = URL.createObjectURL(signatureFile);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const result = extractSignature(img, threshold);
      setExtractedDataUrl(result);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureFile]);

  // Re-extract when threshold changes
  const handleThresholdChange = useCallback(
    (newThreshold: number) => {
      setThreshold(newThreshold);
      if (imageRef.current) {
        const result = extractSignature(imageRef.current, newThreshold);
        setExtractedDataUrl(result);
      }
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Preview area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              原始图片
            </h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              更换图片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="border rounded-xl p-4 bg-white">
            {originalUrl && (
              <img
                src={originalUrl}
                alt="Original signature"
                className="max-w-full h-auto mx-auto max-h-[250px] object-contain"
              />
            )}
          </div>
        </div>

        {/* Extracted */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            提取结果
          </h3>
          <div
            className="border rounded-xl p-4"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          >
            {extractedDataUrl && (
              <img
                src={extractedDataUrl}
                alt="Extracted signature"
                className="max-w-full h-auto mx-auto max-h-[250px] object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Threshold slider */}
      <div className="bg-white border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            提取灵敏度
          </label>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {threshold}
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={230}
          value={threshold}
          onChange={(e) => handleThresholdChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>提取更多</span>
          <span>提取更少</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
        >
          返回
        </button>
        <button
          onClick={() => extractedDataUrl && onExtracted(extractedDataUrl)}
          disabled={!extractedDataUrl}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-40"
        >
          下一步 - 放置到PDF上
        </button>
      </div>
    </div>
  );
}
