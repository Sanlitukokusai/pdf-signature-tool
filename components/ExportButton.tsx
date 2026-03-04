"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import type { SignaturePlacement, PageDimensions } from "@/types";

interface ExportButtonProps {
  pdfBytes: Uint8Array;
  signatureDataUrl: string;
  placement: SignaturePlacement;
  renderedPageDimensions: PageDimensions | null;
}

export default function ExportButton({
  pdfBytes,
  signatureDataUrl,
  placement,
  renderedPageDimensions,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  // Pre-rotate the signature image using Canvas so the exported PDF matches the preview.
  // This avoids pdf-lib's rotation (which rotates counter-clockwise, opposite to CSS).
  const getRotatedSignatureBytes = async (): Promise<Uint8Array> => {
    const rot = ((placement.rotation % 360) + 360) % 360;

    const response = await fetch(signatureDataUrl);
    const originalBytes = new Uint8Array(await response.arrayBuffer());

    if (rot === 0) return originalBytes;

    // Load image to get dimensions
    const img = await new Promise<HTMLImageElement>((resolve) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.src = signatureDataUrl;
    });

    const rad = (rot * Math.PI) / 180;
    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));
    const newW = Math.round(img.width * absCos + img.height * absSin);
    const newH = Math.round(img.width * absSin + img.height * absCos);

    const canvas = document.createElement("canvas");
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    return new Uint8Array(await blob.arrayBuffer());
  };

  const handleExport = async () => {
    if (!renderedPageDimensions) return;

    setExporting(true);
    try {
      // Load from a copy in case the original buffer was detached
      const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
      const page = pdfDoc.getPages()[placement.pageIndex];

      // Get the rotated signature image bytes (rotation already baked in)
      const signatureBytes = await getRotatedSignatureBytes();
      const signatureImage = await pdfDoc.embedPng(signatureBytes);

      // Coordinate conversion: screen pixels -> PDF points
      const pdfPageWidth = page.getWidth();
      const pdfPageHeight = page.getHeight();
      const scaleX = pdfPageWidth / renderedPageDimensions.width;
      const scaleY = pdfPageHeight / renderedPageDimensions.height;

      const pdfX = placement.x * scaleX;
      const pdfWidth = placement.width * scaleX;
      const pdfHeight = placement.height * scaleY;
      // FLIP Y-axis: PDF origin is bottom-left, screen origin is top-left
      const pdfY = pdfPageHeight - placement.y * scaleY - pdfHeight;

      // Draw the signature — rotation is already applied to the image
      page.drawImage(signatureImage, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      });

      // Save and download
      const signedPdfBytes = await pdfDoc.save();
      const blob = new Blob([signedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `signed-document-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("PDF导出失败，请重试。");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !renderedPageDimensions}
      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {exporting ? (
        <>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          导出中...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          导出PDF
        </>
      )}
    </button>
  );
}
