export interface SignaturePlacement {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PageDimensions {
  width: number;
  height: number;
}

export type AppStep = 1 | 2 | 3;

export interface AppState {
  step: AppStep;
  pdfFile: File | null;
  pdfBytes: Uint8Array | null;
  signatureImageFile: File | null;
  extractedSignatureDataUrl: string | null;
  signaturePlacements: SignaturePlacement[];
  renderedPageDimensions: PageDimensions | null;
}
