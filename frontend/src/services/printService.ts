import { api } from "../lib/api";

/**
 * Client-side price calculation used by the landing page (instant, no round-trip).
 * Matches the backend formula exactly.
 * Pricing: ₹2.50/side B&W, ₹8.00/side Color.
 */
export function calculateEstimate(opts: {
  pageCount: number;
  copies: number;
  colorMode: ColorMode;
  sidedness: "simplex" | "duplex";
}) {
  const BW_RATE = 2.5;
  const COLOR_RATE = 8.0;
  const rate = opts.colorMode === "bw" ? BW_RATE : COLOR_RATE;
  const ratePerSidePaise = Math.round(rate * 100);
  const printedSides = opts.sidedness === "duplex" ? opts.pageCount * 2 : opts.pageCount;
  const costPerCopyPaise = printedSides * ratePerSidePaise;
  const totalPaise = costPerCopyPaise * opts.copies;
  const physicalSheets =
    opts.sidedness === "duplex" ? Math.ceil(opts.pageCount / 2) : opts.pageCount;
  return {
    pageCount: opts.pageCount,
    copies: opts.copies,
    colorMode: opts.colorMode,
    sidedness: opts.sidedness,
    printedSides,
    physicalSheets,
    ratePerSidePaise,
    costPerCopyPaise,
    totalPaise,
  };
}

export type ColorMode = "bw" | "color";
export type PrintType = "simplex" | "duplex";

export interface EstimateInput {
  page_count: number;
  copies: number;
  color_mode: ColorMode;
  print_type: PrintType;
}

export interface EstimateResponse {
  estimate_id: number;
  page_count: number;
  copies: number;
  color_mode: ColorMode;
  print_type: PrintType;
  printed_sides_per_copy: number;
  physical_sheets_per_copy: number;
  total_printed_sides: number;
  total_physical_sheets: number;
  price_per_printed_side: string;
  cost_per_copy: string;
  total_cost: string;
  currency: string;
  created_at: string;
}

export interface EstimateListResponse {
  items: EstimateResponse[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PricingConfig {
  currency: string;
  rates: { key: string; color_mode: ColorMode; print_type: PrintType; price_per_printed_side: string }[];
}

export async function createEstimate(input: EstimateInput): Promise<EstimateResponse> {
  return api.post<EstimateResponse>("/api/v1/estimates", input);
}

export async function listEstimates(page = 1, pageSize = 50): Promise<EstimateListResponse> {
  return api.get<EstimateListResponse>(`/api/v1/estimates?page=${page}&page_size=${pageSize}`);
}

export async function getEstimate(id: number): Promise<EstimateResponse> {
  return api.get<EstimateResponse>(`/api/v1/estimates/${id}`);
}

export async function getPricing(): Promise<PricingConfig> {
  return api.get<PricingConfig>("/api/v1/pricing");
}
