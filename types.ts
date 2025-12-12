
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
  evidence: string; 
  localization: string; 
}

// --- Survival ---
export interface SurvivalDataPoint {
  time: number;
  survivalProb: number;
  group: 'High Expression' | 'Low Expression';
}

export interface ClinicalSample {
  sampleId: string;
  expressionLevel: number;
  group: 'High' | 'Low';
  survivalMonths: number;
  status: 'LIVING' | 'DECEASED';
}

export interface SurvivalAnalysis {
  pValLogRank: number;
  hazardRatio: number;
  data: SurvivalDataPoint[];
  interpretation: string;
  samples: ClinicalSample[];
}

// --- Clinical Pathological ---
export interface ClinicalFeature {
  featureName: string; // e.g., "Pathologic Stage", "Gender", "Tumor Grade"
  groups: {
    name: string; // e.g., "Stage I", "Stage II"
    averageExpression: number;
    count: number;
  }[];
  pValue: number; // Significance of expression difference between groups
}

// --- GO/KEGG ---
export interface EnrichmentTerm {
  id: string; // GO:000123
  term: string; // "tRNA processing"
  category: 'GO_BP' | 'GO_CC' | 'GO_MF' | 'KEGG';
  pValue: number;
  count: number;
  geneRatio: number; // 0-1
}

// --- Immune Infiltration ---
export interface ImmuneCell {
  cellType: string; // e.g., "CD8+ T cells"
  correlation: number; // -1 to 1 (Spearman)
  pValue: number;
}

// --- Drug Targets ---
export interface DrugSensitivity {
  drugName: string;
  correlation: number; // Correlation with IC50 (negative means higher expression = more sensitive)
  mechanism: string;
  pValue: number;
}

// --- Aggregated Result ---
export interface ComprehensiveAnalysisResult {
  geneSymbol: string;
  tumorType: string;
  survival: SurvivalAnalysis;
  clinical: ClinicalFeature[];
  enrichment: EnrichmentTerm[];
  immune: ImmuneCell[];
  drugs: DrugSensitivity[];
}

export interface AnalysisState {
  loading: boolean;
  data: GlycoRnaExpression[] | null;
  error: string | null;
}

export interface DetailedAnalysisState {
  loading: boolean;
  data: ComprehensiveAnalysisResult | null;
  error: string | null;
}
