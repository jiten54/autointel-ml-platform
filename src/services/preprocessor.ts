import * as dfd from 'danfojs-node';

export class Preprocessor {
  static async process(df: dfd.DataFrame, targetCol: string) {
    // 1. Handle Missing Values
    let cleanDf = df.fillNa(0); // Simple imputation for now

    // 2. Encoding Categorical Data
    const columns = cleanDf.columns;
    for (const col of columns) {
      if (cleanDf[col].dtype === 'string' && col !== targetCol) {
        // Simple Label Encoding simulation or One-Hot
        // For now, let's just drop complex strings or assume they are categorical
      }
    }

    // 3. Scaling (Standardization)
    // Only for numeric columns
    
    return cleanDf;
  }

  static getCorrelationMatrix(df: dfd.DataFrame) {
    // Danfo.js has a corr method
    try {
      return df.corr().toJSON();
    } catch (e) {
      return {};
    }
  }
}
