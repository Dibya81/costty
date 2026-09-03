export type ColorMode = "bw" | "color";
export type Sidedness = "simplex" | "duplex";

export interface EstimateInput {
  pageCount: number;
  copies: number;
  colorMode: ColorMode;
  sidedness: Sidedness;
}

export interface EstimateResult extends EstimateInput {
  printedSides: number;
  physicalSheets: number;
  ratePerSidePaise: number;
  costPerCopyPaise: number;
  totalPaise: number;
}

export interface EstimateHistoryEntry extends EstimateResult {
  id: string;
  documentName: string;
  createdAt: string; // ISO date
}
