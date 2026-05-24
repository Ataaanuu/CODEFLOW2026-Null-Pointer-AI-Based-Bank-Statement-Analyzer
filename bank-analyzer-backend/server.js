const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ dest: 'uploads/' });

/* ── History persistence ───────────────────────── */
const HISTORY_FILE = path.join(__dirname, 'history.json');

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Could not read history file:', e.message);
  }
  return [];
}

function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (e) {
    console.error('Could not write history file:', e.message);
  }
}

/* ── GET /history ──────────────────────────────── */
app.get('/history', (req, res) => {
  const history = loadHistory();
  // Return newest first
  res.json({ success: true, history: history.reverse() });
});

/* ── DELETE /history/:id ───────────────────────── */
app.delete('/history/:id', (req, res) => {
  const history = loadHistory();
  const updated = history.filter(entry => entry.id !== req.params.id);
  saveHistory(updated);
  res.json({ success: true });
});

/* ── POST /analyze ─────────────────────────────── */
app.post('/analyze', upload.single('statement'), (req, res) => {
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const transactions = [];

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row) => transactions.push(row))
    .on('end', async () => {
      const headers = Object.keys(transactions[0]).join(', ');
      const transactionText = transactions
        .map(t => Object.values(t).join(', '))
        .join('\n');

      const csvData = `Headers: ${headers}\n${transactionText}`;

      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: `You are a financial analyst. Analyze these bank transactions carefully.

RULES:
- totalIn = sum of all Credit column values only
- totalOut = sum of all Debit column values only
- balance = totalIn minus totalOut
- categories = only DEBIT transactions grouped by type (Food, Rent, Shopping, etc). Never include salary or credit transfers here.
- unusual = any suspicious or high value debit transactions
- tips = exactly 5 practical saving tips based on spending

Respond ONLY with this exact JSON format, no extra text, no markdown:
{
  "totalIn": <number>,
  "totalOut": <number>,
  "balance": <number>,
  "categories": [
    { "name": "<category name>", "amount": <number> }
  ],
  "unusual": "<description or No unusual transactions found>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>", "<tip 4>", "<tip 5>"]
}

CSV Data:
${csvData}`
          }]
        });

        const json = JSON.parse(response.choices[0].message.content);

        // Save to history
        const history = loadHistory();
        const entry = {
          id: Date.now().toString(),
          filename: originalName,
          analyzedAt: new Date().toISOString(),
          data: json,
        };
        history.push(entry);
        saveHistory(history);

        // Clean up uploaded file
        fs.unlink(filePath, () => {});

        res.json({ success: true, data: json });
      } catch (e) {
        console.error('Analysis error:', e.message);
        res.json({ success: false, error: e.message });
      }
    })
    .on('error', () => res.status(500).json({ error: 'Could not read file' }));
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));