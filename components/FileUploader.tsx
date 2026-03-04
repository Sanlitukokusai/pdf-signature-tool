"use client";

import { useCallback, useRef, useState } from "react";

interface FileUploaderProps {
  onFilesReady: (pdfBytes: Uint8Array, pdfFile: File, signatureFile: File) => void;
}

export default function FileUploader({ onFilesReady }: FileUploaderProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [pdfDragActive, setPdfDragActive] = useState(false);
  const [sigDragActive, setSigDragActive] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = useCallback((file: File) => {
    if (file.type === "application/pdf") {
      setPdfFile(file);
    }
  }, []);

  const handleSignatureChange = useCallback((file: File) => {
    if (file.type.startsWith("image/")) {
      setSignatureFile(file);
    }
  }, []);

  const handleNext = async () => {
    if (!pdfFile || !signatureFile) return;
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    onFilesReady(pdfBytes, pdfFile, signatureFile);
  };

  const DropZone = ({
    label,
    icon,
    accept,
    file,
    dragActive,
    setDragActive,
    onFileChange,
    inputRef,
    hint,
  }: {
    label: string;
    icon: React.ReactNode;
    accept: string;
    file: File | null;
    dragActive: boolean;
    setDragActive: (v: boolean) => void;
    onFileChange: (f: File) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    hint: string;
  }) => (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : file
          ? "border-green-400 bg-green-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) onFileChange(droppedFile);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) onFileChange(selectedFile);
        }}
      />
      <div className="flex flex-col items-center gap-3">
        {icon}
        <div>
          <p className="font-medium text-gray-700">{label}</p>
          <p className="text-sm text-gray-400 mt-1">{hint}</p>
        </div>
        {file && (
          <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {file.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Upload */}
        <DropZone
          label="上传PDF文件"
          accept=".pdf"
          file={pdfFile}
          dragActive={pdfDragActive}
          setDragActive={setPdfDragActive}
          onFileChange={handlePdfChange}
          inputRef={pdfInputRef}
          hint="点击或拖拽上传"
          icon={
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        {/* Signature Image Upload */}
        <DropZone
          label="上传签名图片"
          accept="image/*"
          file={signatureFile}
          dragActive={sigDragActive}
          setDragActive={setSigDragActive}
          onFileChange={handleSignatureChange}
          inputRef={sigInputRef}
          hint="手写签名照片 (PNG/JPG)"
          icon={
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          }
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!pdfFile || !signatureFile}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        下一步 - 提取签名
      </button>
    </div>
  );
}
