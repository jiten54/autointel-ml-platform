# Autonomous Data Analysis & Intelligence Platform - System Design

## 1. Architecture Overview

The system follows a **Modular Pipeline Architecture**, separating data ingestion, processing, intelligence, and presentation.

### High-Level Flow
`User Upload` -> `Validation Service` -> `Preprocessing Engine` -> `AutoML Engine (Gemini-Powered)` -> `Evaluation & Insights` -> `Report Generation` -> `Interactive Dashboard`

## 2. Component Breakdown

### A. Data Ingestion & Validation (Backend)
- **Technology:** Node.js (Express), Multer.
- **Responsibility:** Securely handle file uploads (CSV, XLSX), validate schema, check for data corruption, and perform initial statistical profiling.
- **Contract:** Accepts `multipart/form-data`. Returns a `jobId` for async tracking.

### B. Preprocessing Engine (Backend)
- **Technology:** Danfo.js (Node.js equivalent of Pandas).
- **Responsibility:** 
  - Imputation of missing values (Mean/Median/Mode).
  - Categorical encoding (One-Hot, Label).
  - Feature scaling (Standardization/Normalization).
  - Outlier detection using Z-score or IQR.

### C. AutoML Engine (Intelligence Layer)
- **Technology:** Google Gemini API.
- **Responsibility:** 
  - **Meta-Learning:** Gemini analyzes the dataset summary (columns, types, distributions) to determine if it's a Classification or Regression problem.
  - **Model Selection:** Recommends the best model (Random Forest, XGBoost, etc.) based on data characteristics.
  - **Hyperparameter Suggestion:** Provides optimal ranges for tuning.

### D. Evaluation & Insights (Intelligence Layer)
- **Technology:** Gemini API + Custom Logic.
- **Responsibility:** 
  - Calculate metrics (RMSE, R2 for Regression; Accuracy, F1 for Classification).
  - Generate SHAP-like feature importance explanations.
  - Provide natural language summaries of "What the data tells us".

### E. Frontend Dashboard
- **Technology:** React, Tailwind CSS, Recharts, Framer Motion.
- **Responsibility:** 
  - Real-time progress tracking.
  - Interactive visualizations (Correlation matrices, Distribution plots, Performance curves).
  - One-click report download.

## 3. Data Contracts & Constraints

### Input Schema
- **Supported Formats:** `.csv`, `.xlsx`.
- **Max File Size:** 10MB (for this prototype).
- **Data Types:** Numeric, Categorical, DateTime.

### System Constraints
- **Stateless Execution:** Each job is processed in memory (or temporary disk) to ensure horizontal scalability.
- **Rate Limiting:** Gemini API quotas are managed via exponential backoff.

## 4. Scalability & MLOps
- **Modular Design:** Each phase is a separate class/module, allowing for independent testing and future microservice extraction.
- **Versioning:** Datasets and models are tagged with unique IDs for reproducibility.
