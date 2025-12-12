import { GoogleGenAI, Type } from "@google/genai";
import { GlycoRnaExpression, SurvivalAnalysisResult, RnaCategory } from "../types";

// NOTE: In a real PHP application, this service would make fetch() calls to your PHP backend (e.g., /api/expression.php).
// Since this is a pure frontend demo, we use Gemini to simulate the complex biological database and statistical analysis.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

export const fetchGlycoExpressionData = async (
  tumorCode: string,
  rnaCategory: RnaCategory
): Promise<GlycoRnaExpression[]> => {
  try {
    const prompt = `
      Act as the backend for a GlycoRNA research platform integrating data from TCGA and **GlycoRNA DB (http://www.glycornadb.com)**.
      The user is querying for '${rnaCategory}' in the TCGA tumor type '${tumorCode}'.

      Generate a realistic dataset of 10 specific RNA transcripts.
      
      CRITICAL SELECTION CRITERIA:
      1. **Source:** The RNA candidates MUST be present in GlycoRNA DB (human). 
      2. **Targets:** Prioritize high-confidence GlycoRNAs such as:
         - Y RNAs: RNY1, RNY3, RNY4, RNY5
         - Small Nuclear RNAs: U1, U2, U4, U5, U12 snRNA
         - tRNAs: tRNA-Gly-GCC, tRNA-Val-CAC, tRNA-Glu-CTC
         - snoRNAs: SNORD3A, SNORD118
      3. **Context:** Ensure the gene symbol matches the requested category '${rnaCategory}'.

      For each entry provide:
      - geneId (e.g., ENSG...)
      - symbol (Must be a specific GlycoRNA candidate)
      - tumorExpression (Log2 CPM, approx range 2-15)
      - normalExpression (Log2 CPM, approx range 2-15)
      - foldChange (calculate roughly 2^(tumor - normal))
      - pValue (statistical significance, range 0 to 1, focus on <0.05)
      - fdr (False Discovery Rate)
      - evidence (Reference 'GlycoRNA DB' and specific cell lines if applicable, e.g., "GlycoRNA DB (HeLa), Ac4ManNAz+")
      - localization (e.g., "Cell Surface", "Membrane Fraction")
      
      Return ONLY the JSON array.
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
    // Force the category to match the requested one (schema validation is loose on enums)
    return data.map((item: any) => ({ ...item, category: rnaCategory }));

  } catch (error) {
    console.error("Error fetching expression data:", error);
    throw new Error("Failed to retrieve analysis data.");
  }
};

export const fetchSurvivalAnalysis = async (
  symbol: string,
  tumorCode: string
): Promise<SurvivalAnalysisResult> => {
  try {
    const prompt = `
      Perform a simulated Kaplan-Meier survival analysis for the GlycoRNA '${symbol}' in TCGA-${tumorCode}.
      Assume the data is split into High Expression vs Low Expression groups.
      
      Generate:
      1. Statistical stats (Log-rank P-value, Hazard Ratio).
      2. A brief biological interpretation (1 sentence) of whether this GlycoRNA is a risk factor or protective.
      3. A series of data points for a stepped survival curve (time in months 0-120, probability 1.0 down to 0).
      
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
                  group: { type: Type.STRING }, // "High Expression" or "Low Expression"
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error fetching survival analysis:", error);
    throw new Error("Failed to perform survival analysis.");
  }
};