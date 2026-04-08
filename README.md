# Autonomous Data Analysis & Intelligence Platform

A production-grade system that automatically transforms raw data into insights, models, and reports with minimal human intervention.

## 🔥 Core Features

- **AutoML Engine:** Powered by Google Gemini AI to automatically detect problem types, select models, and suggest hyperparameters.
- **Intelligent Preprocessing:** Automated missing value handling, categorical encoding, and feature scaling using Danfo.js.
- **Dynamic Visualizations:** Real-time data profiling and model performance dashboards using Recharts.
- **Automated Reporting:** One-click PDF report generation with key business insights and model metrics.
- **Production-Ready Backend:** Express.js server with secure file handling and async processing.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API Key

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, Multer, Danfo.js.
- **AI/ML:** Google Gemini API (@google/genai).
- **Reporting:** jsPDF, jsPDF-AutoTable.

## 🏗 System Architecture

The platform uses a modular pipeline:
1. **Ingestion:** Validates file format (CSV/Excel) and schema.
2. **Analysis:** Gemini analyzes data distributions and suggests the ML path.
3. **Preprocessing:** Automated cleaning and feature engineering.
4. **AutoML:** Model selection and training simulation.
5. **Insights:** Natural language explanation of results.
6. **Presentation:** Interactive dashboard and PDF export.

## 🛡 Security & Reliability

- **File Sandboxing:** Uploaded files are processed in a temporary directory and deleted immediately after analysis.
- **Input Validation:** Strict MIME type checking and schema validation.
- **Error Handling:** Centralized error boundary and API error responses.

## 📈 MLOps Strategy

- **Experiment Tracking:** Job IDs are used to track analysis runs.
- **Model Versioning:** (Planned) Integration with MLflow for model registry.
- **CI/CD:** Dockerized for seamless deployment to Cloud Run or AWS.

## 📄 License
Apache-2.0
