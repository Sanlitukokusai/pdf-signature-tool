export interface SignaturePlacement {
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
  signaturePlacement: SignaturePlacement | null;
  renderedPageDimensions: PageDimensions | null;
}
