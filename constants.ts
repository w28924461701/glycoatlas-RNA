import { TumorType, RnaCategory } from './types';

export const TUMOR_TYPES: TumorType[] = [
  { code: 'ACC', name: 'Adrenocortical Carcinoma' },
  { code: 'BLCA', name: 'Bladder Urothelial Carcinoma' },
  { code: 'BRCA', name: 'Breast Invasive Carcinoma' },
  { code: 'CESC', name: 'Cervical Squamous Cell Carcinoma' },
  { code: 'CHOL', name: 'Cholangiocarcinoma' },
  { code: 'COAD', name: 'Colon Adenocarcinoma' },
  { code: 'ESCA', name: 'Esophageal Carcinoma' },
  { code: 'GBM', name: 'Glioblastoma Multiforme' },
  { code: 'HNSC', name: 'Head and Neck Squamous Cell Carcinoma' },
  { code: 'KICH', name: 'Kidney Chromophobe' },
  { code: 'KIRC', name: 'Kidney Renal Clear Cell Carcinoma' },
  { code: 'KIRP', name: 'Kidney Renal Papillary Cell Carcinoma' },
  { code: 'LGG', name: 'Brain Lower Grade Glioma' },
  { code: 'LIHC', name: 'Liver Hepatocellular Carcinoma' },
  { code: 'LUAD', name: 'Lung Adenocarcinoma' },
  { code: 'LUSC', name: 'Lung Squamous Cell Carcinoma' },
  { code: 'OV', name: 'Ovarian Serous Cystadenocarcinoma' },
  { code: 'PAAD', name: 'Pancreatic Adenocarcinoma' },
  { code: 'PRAD', name: 'Prostate Adenocarcinoma' },
  { code: 'READ', name: 'Rectum Adenocarcinoma' },
  { code: 'SKCM', name: 'Skin Cutaneous Melanoma' },
  { code: 'STAD', name: 'Stomach Adenocarcinoma' },
  { code: 'THCA', name: 'Thyroid Carcinoma' },
  { code: 'UCEC', name: 'Uterine Corpus Endometrial Carcinoma' },
];

export const RNA_CATEGORIES: RnaCategory[] = [
  RnaCategory.tRNA,
  RnaCategory.YRNA,
  RnaCategory.snRNA,
  RnaCategory.rRNA,
  RnaCategory.snoRNA,
];

export const COLORS = {
  primary: '#0f172a', // Slate 900
  secondary: '#334155', // Slate 700
  accent: '#0ea5e9', // Sky 500
  success: '#10b981', // Emerald 500
  danger: '#ef4444', // Red 500
  warning: '#f59e0b', // Amber 500
  tumor: '#e11d48', // Rose 600
  normal: '#3b82f6', // Blue 500
};