import { GoogleGenAI, Type } from "@google/genai";
import { GlycoRnaExpression, ComprehensiveAnalysisResult, RnaCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-2.5-flash';

export const fetchGlycoExpressionData = async (
  tumorCode: string,
  rnaCategory: RnaCategory
): Promise<GlycoRnaExpression[]> => {
  try {
    const prompt = `
      Act as a specialized bioinformatics database for Glycosylated RNAs (GlycoRNA).
      The user is querying for '${rnaCategory}' in the TCGA tumor type '${tumorCode}'.

      Generate a realistic dataset of 10 specific RNA transcripts that are KNOWN or HIGHLY PREDICTED to be GlycoRNAs.
      
      For each entry provide:
      - geneId, symbol, category
      - tumorExpression, normalExpression (Log2 CPM)
      - foldChange, pValue, fdr
      - evidence (brief mechanism)
      - localization
      
      Return ONLY JSON array.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              geneId: { type: Type.STRING },
              symbol: { type: Type.STRING },
              category: { type: Type.STRING },
              tumorExpression: { type: Type.NUMBER },
              normalExpression: { type: Type.NUMBER },
              foldChange: { type: Type.NUMBER },
              pValue: { type: Type.NUMBER },
              fdr: { type: Type.NUMBER },
              evidence: { type: Type.STRING },
              localization: { type: Type.STRING },
            },
            required: ["geneId", "symbol", "category", "tumorExpression", "normalExpression", "foldChange", "pValue", "fdr", "evidence", "localization"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({ ...item, category: rnaCategory }));

  } catch (error) {
    console.error("Error fetching expression data:", error);
    throw new Error("Failed to retrieve analysis data.");
  }
};

export const fetchComprehensiveAnalysis = async (
  symbol: string,
  tumorCode: string
): Promise<ComprehensiveAnalysisResult> => {
  try {
    const prompt = `
      Perform a comprehensive multi-omics analysis for the GlycoRNA '${symbol}' in TCGA-${tumorCode}.
      
      Generate a JSON object containing:
      
      1. **survival**: Simulated Kaplan-Meier data (time, probability, group) and 15 simulated patient samples with TCGA barcodes.
         - CRITICAL: The 'group' field in 'data' MUST be exactly "High Expression" or "Low Expression".
      2. **clinical**: Analyze expression differences by 'Pathologic Stage' (Stage I, II, III, IV) and 'Gender'. Provide avg expression per group and p-value.
      3. **enrichment**: Top 5 GO terms (BP/CC/MF) and KEGG pathways correlated with this gene.
      4. **immune**: Correlation (Spearman rho) with 6 key immune cells (e.g., CD8+ T, Macrophages, B cells).
      5. **drugs**: Top 5 drugs where gene expression correlates with sensitivity (IC50).
      
      Ensure biological plausibility for a GlycoRNA (e.g., surface interaction pathways, immune evasion).
      Return ONLY JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            geneSymbol: { type: Type.STRING },
            tumorType: { type: Type.STRING },
            survival: {
              type: Type.OBJECT,
              properties: {
                pValLogRank: { type: Type.NUMBER },
                hazardRatio: { type: Type.NUMBER },
                interpretation: { type: Type.STRING },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { 
                      time: { type: Type.NUMBER }, 
                      survivalProb: { type: Type.NUMBER }, 
                      group: { type: Type.STRING, enum: ["High Expression", "Low Expression"] } 
                    }
                  }
                },
                samples: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      sampleId: { type: Type.STRING },
                      expressionLevel: { type: Type.NUMBER },
                      group: { type: Type.STRING },
                      survivalMonths: { type: Type.NUMBER },
                      status: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            clinical: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  featureName: { type: Type.STRING },
                  pValue: { type: Type.NUMBER },
                  groups: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { name: { type: Type.STRING }, averageExpression: { type: Type.NUMBER }, count: { type: Type.NUMBER } }
                    }
                  }
                }
              }
            },
            enrichment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  term: { type: Type.STRING },
                  category: { type: Type.STRING },
                  pValue: { type: Type.NUMBER },
                  count: { type: Type.NUMBER },
                  geneRatio: { type: Type.NUMBER }
                }
              }
            },
            immune: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { cellType: { type: Type.STRING }, correlation: { type: Type.NUMBER }, pValue: { type: Type.NUMBER } }
              }
            },
            drugs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { drugName: { type: Type.STRING }, correlation: { type: Type.NUMBER }, mechanism: { type: Type.STRING }, pValue: { type: Type.NUMBER } }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error fetching detailed analysis:", error);
    throw new Error("Failed to perform comprehensive analysis.");
  }
};