"use client";

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { SignaturePlacement, DateStampPlacement } from "@/types";

interface ExportButtonProps {
  pdfBytes: Uint8Array;
  signatureDataUrl: string;
  placements: SignaturePlacement[];
  dateStamps: DateStampPlacement[];
  renderWidth: number;
}

export default function ExportButton({
  pdfBytes,
  signatureDataUrl,
  placements,
  dateStamps,
  renderWidth,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  // Pre-rotate the signature image using Canvas so the exported PDF matches the preview.
  const getRotatedSignatureBytes = async (rotation: number): Promise<Uint8Array> => {
    const rot = ((rotation % 360) + 360) % 360;

    const response = await fetch(signatureDataUrl);
    const originalBytes = new Uint8Array(await response.arrayBuffer());

    if (rot === 0) return originalBytes;

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
    if (placements.length === 0 && dateStamps.length === 0) return;

    setExporting(true);
    try {
      const canvas = document.querySelector(".react-pdf__Page canvas") as HTMLCanvasElement;
      const parentDiv = canvas?.closest(".relative") as HTMLElement;

      const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
      const pages = pdfDoc.getPages();

      const rotationCache = new Map<number, Uint8Array>();

      for (const placement of placements) {
        const page = pages[placement.pageIndex];
        if (!page) continue;

        const rot = ((placement.rotation % 360) + 360) % 360;
        let signatureBytes = rotationCache.get(rot);
        if (!signatureBytes) {
          signatureBytes = await getRotatedSignatureBytes(placement.rotation);
          rotationCache.set(rot, signatureBytes);
        }

        const signatureImage = await pdfDoc.embedPng(signatureBytes);

        const pdfPageWidth = page.getWidth();
        const pdfPageHeight = page.getHeight();

        // Use actual parent container width for scale computation.
        // This is the element that Rnd overlays are positioned within,
        // ensuring pixel-perfect coordinate mapping.
        const actualWidth = parentDiv?.clientWidth ?? renderWidth;
        const scale = pdfPageWidth / actualWidth;

        const pdfX = placement.x * scale;
        const pdfWidth = placement.width * scale;
        const pdfHeight = placement.height * scale;
        // FLIP Y-axis: PDF origin is bottom-left, screen origin is top-left
        const pdfY = pdfPageHeight - placement.y * scale - pdfHeight;

        page.drawImage(signatureImage, {
          x: pdfX,
          y: pdfY,
          width: pdfWidth,
          height: pdfHeight,
        });
      }

      // Draw date stamps
      if (dateStamps.length > 0) {
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        for (const stamp of dateStamps) {
          const page = pages[stamp.pageIndex];
          if (!page) continue;

          const pdfPageWidth = page.getWidth();
          const pdfPageHeight = page.getHeight();
          const actualWidth = parentDiv?.clientWidth ?? renderWidth;
          const scale = pdfPageWidth / actualWidth;

          const pdfFontSize = stamp.fontSize * scale;
          const pdfX = stamp.x * scale;
          // Approximate text height for Y-flip
          const textHeight = pdfFontSize;
          const pdfY = pdfPageHeight - stamp.y * scale - textHeight;

          page.drawText(stamp.dateText, {
            x: pdfX,
            y: pdfY,
            size: pdfFontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }

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
      disabled={exporting || (placements.length === 0 && dateStamps.length === 0)}
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
