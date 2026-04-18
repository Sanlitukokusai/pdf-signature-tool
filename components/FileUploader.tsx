"use client";

import { useCallback, useRef, useState } from "react";

const MAX_SIGNATURES = 5;

interface FileUploaderProps {
  onFilesReady: (pdfBytes: Uint8Array, pdfFile: File, signatureFiles: File[]) => void;
}

export default function FileUploader({ onFilesReady }: FileUploaderProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatureFiles, setSignatureFiles] = useState<File[]>([]);
  const [pdfDragActive, setPdfDragActive] = useState(false);
  const [sigDragActive, setSigDragActive] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = useCallback((file: File) => {
    if (file.type === "application/pdf") setPdfFile(file);
  }, []);

  const addSignatureFiles = useCallback((files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setSignatureFiles((prev) => [...prev, ...imgs].slice(0, MAX_SIGNATURES));
  }, []);

  const removeSignature = (idx: number) => {
    setSignatureFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNext = async () => {
    if (!pdfFile || signatureFiles.length === 0) return;
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    onFilesReady(pdfBytes, pdfFile, signatureFiles);
  };

  const canAddMore = signatureFiles.length < MAX_SIGNATURES;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Upload */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            pdfDragActive ? "border-blue-500 bg-blue-50"
              : pdfFile ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
          onClick={() => pdfInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setPdfDragActive(true); }}
          onDragLeave={() => setPdfDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setPdfDragActive(false);
            const f = e.dataTransfer.files[0];
            if (f) handlePdfChange(f);
          }}
        >
          <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePdfChange(f);
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-700">上传PDF文件</p>
              <p className="text-sm text-gray-400 mt-1">点击或拖拽上传</p>
            </div>
            {pdfFile && (
              <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-600 truncate max-w-[200px]">{pdfFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Signature Images Upload (multi) */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
            sigDragActive ? "border-blue-500 bg-blue-50"
              : signatureFiles.length > 0 ? "border-green-400 bg-green-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          } ${canAddMore ? "cursor-pointer" : ""}`}
          onClick={() => canAddMore && sigInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (canAddMore) setSigDragActive(true); }}
          onDragLeave={() => setSigDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSigDragActive(false);
            if (!canAddMore) return;
            addSignatureFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <input ref={sigInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => {
              addSignatureFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <div className="flex flex-col items-center gap-3 text-center">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <div>
              <p className="font-medium text-gray-700">上传签名图片 (最多 {MAX_SIGNATURES} 个)</p>
              <p className="text-sm text-gray-400 mt-1">
                可一次选多张；已添加 {signatureFiles.length}/{MAX_SIGNATURES}
              </p>
            </div>
          </div>

          {signatureFiles.length > 0 && (
            <ul className="mt-4 space-y-1.5" onClick={(e) => e.stopPropagation()}>
              {signatureFiles.map((f, i) => (
                <li key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700 truncate max-w-[220px]">
                    <span className="text-blue-600 font-medium mr-2">#{i + 1}</span>
                    {f.name}
                  </span>
                  <button onClick={() => removeSignature(i)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">
                    移除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!pdfFile || signatureFiles.length === 0}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        下一步 - 提取签名
      </button>
    </div>
  );
}
