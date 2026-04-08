import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  BrainCircuit, 
  CheckCircle2, 
  Download, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Database,
  PieChart,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// --- Types ---
interface Analysis {
  problemType: string;
  targetColumn: string;
  preprocessing: string[];
  featureEngineering: string[];
  recommendedModel: string;
  reasoning: string;
  hyperparameters: any;
}

interface Summary {
  columns: string[];
  shape: number[];
  dtypes: string[];
  missingValues: number[];
  head: any[];
  describe: any[];
}

interface Results {
  model: string;
  metrics: {
    accuracy?: number;
    f1?: number;
    precision?: number;
    rmse?: number;
    r2?: number;
  };
  featureImportance: { name: string; importance: number }[];
}

interface Insights {
  insights: string[];
  summary: string;
  recommendations: string[];
}

// --- Components ---

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Upload', 'Analyze', 'Train', 'Report'];
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
              idx <= currentStep ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-400'
            }`}>
              {idx < currentStep ? <CheckCircle2 size={20} /> : <span>{idx + 1}</span>}
            </div>
            <span className={`mt-2 text-xs font-medium ${idx <= currentStep ? 'text-indigo-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${idx < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    summary: Summary;
    analysis: Analysis;
    correlation: any;
    results?: Results;
    insights?: Insights;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const result = await response.json();
      setData(result);
      setStep(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: data.analysis,
          summary: data.summary
        }),
      });

      if (!response.ok) throw new Error('Training failed');

      const result = await response.json();
      setData({ ...data, ...result });
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!data || !data.results || !data.insights) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Autonomous Data Analysis Report', 20, 20);
    
    doc.setFontSize(14);
    doc.text('Dataset Overview', 20, 40);
    doc.setFontSize(10);
    doc.text(`Rows: ${data.summary.shape[0]}, Columns: ${data.summary.shape[1]}`, 20, 50);
    
    doc.setFontSize(14);
    doc.text('Model Performance', 20, 70);
    doc.setFontSize(10);
    doc.text(`Model: ${data.results.model}`, 20, 80);
    Object.entries(data.results.metrics).forEach(([key, val], idx) => {
      doc.text(`${key}: ${(val as number).toFixed(4)}`, 20, 90 + (idx * 10));
    });

    doc.setFontSize(14);
    doc.text('Key Insights', 20, 130);
    doc.setFontSize(10);
    data.insights.insights.forEach((insight, idx) => {
      doc.text(`• ${insight}`, 20, 140 + (idx * 10));
    });

    doc.save('analysis_report.pdf');
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="text-white" size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">AutoIntel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">v1.0.0 Production</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          {/* Step 0: Upload */}
          {step === 0 && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center hover:border-indigo-400 transition-colors group relative overflow-hidden">
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".csv,.xlsx,.xls"
                />
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="text-indigo-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Upload your dataset</h2>
                <p className="text-slate-500 mb-8">Support for CSV and Excel files up to 10MB</p>
                <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1"><FileText size={16} /> CSV</div>
                  <div className="flex items-center gap-1"><Database size={16} /> Excel</div>
                </div>
              </div>
              {loading && (
                <div className="mt-8 flex items-center justify-center gap-3 text-indigo-600 font-medium">
                  <Loader2 className="animate-spin" />
                  Processing and validating data...
                </div>
              )}
              {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Analyze */}
          {step === 1 && data && (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Data Overview */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Database className="text-indigo-600" size={20} />
                        Dataset Summary
                      </h3>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                        {data.summary.shape[0]} Rows × {data.summary.shape[1]} Cols
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                      {data.summary.columns.slice(0, 4).map((col, idx) => (
                        <div key={col} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{col}</p>
                          <p className="text-sm font-mono text-slate-700">{data.summary.dtypes[idx]}</p>
                        </div>
                      ))}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {data.summary.columns.slice(0, 5).map(col => (
                              <th key={col} className="pb-3 font-bold text-slate-400 uppercase text-[10px] tracking-widest">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.summary.head.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0">
                              {data.summary.columns.slice(0, 5).map(col => (
                                <td key={col} className="py-3 font-mono text-slate-600">{row[col]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* AutoML Intelligence */}
                  <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <BrainCircuit size={120} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="px-2 py-1 bg-indigo-500 rounded text-[10px] font-bold uppercase tracking-widest">AutoML Engine</div>
                        <h3 className="text-xl font-bold">Intelligence Report</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-indigo-300 text-sm font-bold uppercase mb-2">Problem Type</p>
                          <p className="text-2xl font-bold mb-4">{data.analysis.problemType}</p>
                          <p className="text-indigo-100 text-sm leading-relaxed">{data.analysis.reasoning}</p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-indigo-300 text-sm font-bold uppercase mb-2">Target Column</p>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-mono">{data.analysis.targetColumn}</span>
                          </div>
                          <div>
                            <p className="text-indigo-300 text-sm font-bold uppercase mb-2">Recommended Model</p>
                            <span className="px-3 py-1 bg-indigo-500 rounded-full text-sm font-bold">{data.analysis.recommendedModel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar: Preprocessing & Actions */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-700">
                      <Activity className="text-indigo-600" size={18} />
                      Preprocessing Plan
                    </h3>
                    <ul className="space-y-3">
                      {data.analysis.preprocessing.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={handleTrain}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} />}
                    {loading ? 'Training Models...' : 'Execute AutoML Pipeline'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === 2 && data && data.results && data.insights && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Metrics */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(data.results.metrics).map(([key, val]) => (
                      <div key={key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">{key}</p>
                        <p className="text-3xl font-bold text-indigo-600">{(val as number).toFixed(3)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Feature Importance Chart */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
                      <BarChart3 className="text-indigo-600" size={20} />
                      Feature Importance (SHAP)
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.results.featureImportance} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: 500 }} />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                            {data.results.featureImportance.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Insights Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-700">
                      <PieChart className="text-indigo-600" size={18} />
                      Key Insights
                    </h3>
                    <div className="space-y-4">
                      {data.insights.insights.map((insight, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={generateReport}
                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download PDF Report
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Final */}
          {step === 3 && (
            <motion.div 
              key="final"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Analysis Complete!</h2>
              <p className="text-slate-500 mb-12 max-w-md mx-auto">
                Your production-grade analysis report has been generated and downloaded. 
                You can now start a new analysis or explore the results.
              </p>
              <button 
                onClick={() => setStep(0)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Start New Analysis
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2026 AutoIntel Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">API Status</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
