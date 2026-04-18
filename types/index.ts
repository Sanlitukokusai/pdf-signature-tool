export interface SignatureAsset {
  id: string;
  name: string;
  dataUrl: string;
  threshold: number;
}

export interface SignaturePlacement {
  id: string;
  signatureId: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface DateStampPlacement {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  fontSize: number;
  dateText: string;
}

export interface PageDimensions {
  width: number;
  height: number;
}

export type AppStep = 1 | 2 | 3;
