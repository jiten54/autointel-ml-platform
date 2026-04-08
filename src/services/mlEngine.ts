import { GoogleGenAI, Type } from "@google/genai";

export interface DataSummary {
  columns: string[];
  shape: number[];
  dtypes: string[];
  missingValues: number[];
  head: any[];
  describe: any[];
}

export class MLEngine {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeDataset(summary: DataSummary) {
    const prompt = `
      You are a Senior Data Scientist. Analyze this dataset summary and provide:
      1. Problem Type: Is it Classification or Regression?
      2. Target Column: Which column is likely the target?
      3. Preprocessing Steps: What cleaning is needed?
      4. Feature Engineering: Suggested new features.
      5. Best Model: Recommended ML model (Random Forest, XGBoost, etc.) and why.
      6. Hyperparameters: Suggested tuning parameters.

      Dataset Summary:
      - Columns: ${summary.columns.join(', ')}
      - Shape: ${summary.shape[0]} rows, ${summary.shape[1]} columns
      - Missing Values: ${JSON.stringify(summary.missingValues)}
      - Sample Data (Head): ${JSON.stringify(summary.head)}
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemType: { type: Type.STRING },
            targetColumn: { type: Type.STRING },
            preprocessing: { type: Type.ARRAY, items: { type: Type.STRING } },
            featureEngineering: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedModel: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            hyperparameters: { type: Type.OBJECT, properties: {} }
          },
          required: ["problemType", "targetColumn", "preprocessing", "recommendedModel"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async generateInsights(summary: DataSummary, modelResults: any) {
    const prompt = `
      Based on the dataset summary and model results, provide 5 key business insights and a summary report.
      
      Dataset: ${JSON.stringify(summary.describe)}
      Model Performance: ${JSON.stringify(modelResults)}
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    return JSON.parse(response.text);
  }
}
