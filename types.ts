export interface TumorType {
  code: string;
  name: string;
}

export enum RnaCategory {
  tRNA = 'tRNA',
  YRNA = 'YRNA',
  snRNA = 'snRNA',
  rRNA = 'rRNA',
  snoRNA = 'snoRNA',
}

export interface GlycoRnaExpression {
  geneId: string;
  symbol: string;
  category: RnaCategory;
  tumorExpression: number; // Log2 CPM
  normalExpression: number; // Log2 CPM
  foldChange: number;
  pValue: number;
  fdr: number;
  evidence: string; // e.g., "ManNAz-IP, Periodate oxidation"
  localization: string; // e.g., "Cell Surface", "Membrane"
}

export interface SurvivalDataPoint {
  time: number; // Months
  survivalProb: number; // 0.0 to 1.0
  group: 'High Expression' | 'Low Expression';
}

export interface SurvivalAnalysisResult {
  geneSymbol: string;
  tumorType: string;
  pValLogRank: number;
  hazardRatio: number;
  data: SurvivalDataPoint[];
  interpretation: string;
}

export interface AnalysisState {
  loading: boolean;
  data: GlycoRnaExpression[] | null;
  error: string | null;
}

export interface SurvivalState {
  loading: boolean;
  data: SurvivalAnalysisResult | null;
  error: string | null;
}