"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import SignatureExtractor from "@/components/SignatureExtractor";
import PdfSignatureEditor from "@/components/PdfSignatureEditor";
import type { AppStep, SignatureAsset } from "@/types";

export default function Home() {
  const [step, setStep] = useState<AppStep>(1);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [signatureFiles, setSignatureFiles] = useState<File[]>([]);
  const [signatureAssets, setSignatureAssets] = useState<SignatureAsset[]>([]);

  const handleFilesReady = (bytes: Uint8Array, _pdfFile: File, sigFiles: File[]) => {
    setPdfBytes(bytes);
    setSignatureFiles(sigFiles);
    setStep(2);
  };

  const handleSignaturesExtracted = (assets: SignatureAsset[]) => {
    setSignatureAssets(assets);
    setStep(3);
  };

  const goToStep = (s: AppStep) => setStep(s);

  const handleReset = () => {
    setPdfBytes(null);
    setSignatureFiles([]);
    setSignatureAssets([]);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="font-semibold text-gray-900">PDF 电子签名工具</h1>
          </div>
          <div className="flex items-center gap-4">
            {step > 1 && (
              <button onClick={handleReset}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                重新开始
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          {[
            { num: 1, label: "上传文件" },
            { num: 2, label: "提取签名" },
            { num: 3, label: "调整位置 & 导出" },
          ].map(({ num, label }, idx) => (
            <div key={num} className="flex items-center">
              {idx > 0 && (
                <div className={`w-8 h-0.5 mx-1 ${step >= num ? "bg-blue-500" : "bg-gray-300"}`} />
              )}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === num ? "bg-blue-600 text-white"
                    : step > num ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {step > num ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : num}
                </div>
                <span className={`text-sm hidden sm:inline ${
                  step === num ? "text-blue-600 font-medium" : "text-gray-500"
                }`}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-12">
        {step === 1 && <FileUploader onFilesReady={handleFilesReady} />}

        {step === 2 && signatureFiles.length > 0 && (
          <SignatureExtractor
            signatureFiles={signatureFiles}
            onExtracted={handleSignaturesExtracted}
            onBack={() => goToStep(1)}
            onSignatureFilesChange={setSignatureFiles}
          />
        )}

        {step === 3 && pdfBytes && signatureAssets.length > 0 && (
          <PdfSignatureEditor
            pdfBytes={pdfBytes}
            signatureAssets={signatureAssets}
            onBack={() => goToStep(2)}
          />
        )}
      </main>
    </div>
  );
}
