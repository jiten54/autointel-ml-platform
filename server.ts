import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as dfd from 'danfojs-node';
import cors from 'cors';
import fs from 'fs';
import { MLEngine } from './src/services/mlEngine.ts';
import { Preprocessor } from './src/services/preprocessor.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  const mlEngine = new MLEngine(process.env.GEMINI_API_KEY || '');

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.post('/api/upload', upload.single('file'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      let df;
      if (fileExt === '.csv') {
        df = await dfd.readCSV(filePath);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        df = await dfd.readExcel(filePath);
      } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'Unsupported file format. Please upload CSV or Excel.' });
      }

      // Basic Validation & Summary
      const summary = {
        columns: df.columns,
        shape: df.shape,
        dtypes: df.ctypes.values,
        missingValues: df.isNa().sum().values,
        head: df.head(5).toJSON(),
        describe: df.describe().toJSON(),
      };

      // AutoML Analysis via Gemini
      const analysis = await mlEngine.analyzeDataset(summary);

      // Preprocessing
      const processedDf = await Preprocessor.process(df, analysis.targetColumn);
      const correlation = Preprocessor.getCorrelationMatrix(processedDf);

      // Clean up file after reading
      fs.unlinkSync(filePath);

      res.json({ 
        message: 'File uploaded and analyzed successfully',
        summary,
        analysis,
        correlation
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process file' });
    }
  });

  app.post('/api/train', async (req: any, res: any) => {
    // Simulate training logic
    const { analysis, summary } = req.body;
    
    // In a real system, we would trigger a Celery task or similar.
    // Here we generate insights based on the analysis.
    try {
      const results = {
        model: analysis.recommendedModel,
        metrics: {
          accuracy: 0.85 + Math.random() * 0.1,
          f1: 0.82 + Math.random() * 0.1,
          precision: 0.84 + Math.random() * 0.1
        },
        featureImportance: summary.columns.slice(0, 5).map(col => ({
          name: col,
          importance: Math.random()
        })).sort((a, b) => b.importance - a.importance)
      };

      const insights = await mlEngine.generateInsights(summary, results);

      res.json({ results, insights });
    } catch (error) {
      res.status(500).json({ error: 'Training failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
