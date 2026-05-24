"use client";
import { useState, useEffect, useRef } from "react";

type View = "landing" | "analyzer" | "history";

interface Category {
  name: string;
  amount: number;
}

interface AnalysisData {
  totalIn: number;
  totalOut: number;
  balance: number;
  categories: Category[];
  unusual: string;
  tips: string[];
}

interface HistoryEntry {
  id: string;
  filename: string;
  analyzedAt: string;
  data: AnalysisData;
}

interface Message {
  role: "user" | "ai";
  text: string;
}

const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

const Icons = {
  upload: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  file: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  folder: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  chevronDown: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  close: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  speed: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  chart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bulb: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
  history: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>,
  lock: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  chat: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

function AnalysisResult({ data }: { data: AnalysisData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-5">
        <div style={{ background: "#0a1a12", border: "1px solid #064e3b" }} className="rounded-3xl p-8">
          <p style={{ color: "#6ee7b7" }} className="text-xs font-bold uppercase tracking-widest mb-4">Total Income</p>
          <p style={{ color: "#10b981" }} className="text-4xl font-black">₹{data.totalIn.toLocaleString()}</p>
        </div>
        <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d" }} className="rounded-3xl p-8">
          <p style={{ color: "#fca5a5" }} className="text-xs font-bold uppercase tracking-widest mb-4">Total Expenses</p>
          <p style={{ color: "#ef4444" }} className="text-4xl font-black">₹{data.totalOut.toLocaleString()}</p>
        </div>
        <div style={{ background: "#0d0d1f", border: "1px solid #3730a3" }} className="rounded-3xl p-8">
          <p style={{ color: "#a5b4fc" }} className="text-xs font-bold uppercase tracking-widest mb-4">Net Balance</p>
          <p style={{ color: "#818cf8" }} className="text-4xl font-black">₹{data.balance.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-10">
        <p style={{ color: "#4b5563" }} className="text-sm font-bold uppercase tracking-widest mb-10">Spending Breakdown</p>
        <div className="space-y-8">
          {data.categories.map((cat, i) => {
            const pct = Math.round((cat.amount / data.totalOut) * 100);
            const color = colors[i % colors.length];
            return (
              <div key={i}>
                <div className="flex justify-between mb-3">
                  <span className="text-lg font-bold text-white">{cat.name}</span>
                  <div className="flex items-center gap-4">
                    <span style={{ color: "#9ca3af" }} className="text-lg">₹{cat.amount.toLocaleString()}</span>
                    <span style={{ background: `${color}20`, color, border: `1px solid ${color}50` }} className="text-sm px-3 py-1 rounded-full font-black">{pct}%</span>
                  </div>
                </div>
                <div style={{ background: "#1a1a2e" }} className="w-full rounded-full h-4">
                  <div className="h-4 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-8">
          <p style={{ color: "#f59e0b" }} className="text-xs font-bold uppercase tracking-widest mb-5">Unusual Transactions</p>
          <p style={{ color: "#d1d5db" }} className="text-base leading-8">{data.unusual}</p>
        </div>
        <div style={{ background: "linear-gradient(135deg, #1e1b4b, #2d1b69)", border: "1px solid #4338ca44" }} className="rounded-3xl p-8">
          <p style={{ color: "#a78bfa" }} className="text-xs font-bold uppercase tracking-widest mb-5">Recommendations</p>
          <ul className="space-y-3">
            {data.tips?.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span style={{ color: "#a78bfa", marginTop: "4px", flexShrink: 0 }}>{Icons.arrow}</span>
                <span style={{ color: "#e2e8f0" }} className="text-base leading-7">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ChatBox({ data }: { data: AnalysisData }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I have analyzed your statement. Ask me anything about your finances!" }
  ]);
  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChat = async () => {
    if (!question.trim()) return;
    const userMsg = question.trim();
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, data }),
      });
      const json = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: json.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, could not get a response." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span style={{ color: "#818cf8" }}>{Icons.chat}</span>
        <p style={{ color: "#4b5563" }} className="text-sm font-bold uppercase tracking-widest">
          Ask About Your Statement
        </p>
      </div>

      <div style={{ background: "#0a0a0f", border: "1px solid #1a1a2e", height: "320px" }} className="rounded-2xl p-6 overflow-y-auto mb-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              style={{
                background: msg.role === "user" ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#1e1e30",
                color: "#fff",
                maxWidth: "75%",
              }}
              className="px-5 py-3 rounded-2xl text-sm leading-7"
            >
              {msg.text}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div style={{ background: "#1e1e30" }} className="px-5 py-4 rounded-2xl">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleChat()}
          placeholder="e.g. Where am I overspending?"
          style={{ background: "#0d0d14", border: "1px solid #2a2a40", color: "#fff" }}
          className="flex-1 px-5 py-4 rounded-2xl text-base outline-none placeholder-gray-700"
        />
        <button
          onClick={handleChat}
          disabled={chatLoading || !question.trim()}
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
          className="px-8 py-4 rounded-2xl font-black text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function LandingPage({ setView }: { setView: (v: View) => void }) {
  const features = [
    { icon: Icons.speed,   title: "Instant Analysis",      desc: "Upload your CSV and get a complete financial breakdown in under 10 seconds." },
    { icon: Icons.chart,   title: "Smart Categorisation",  desc: "Transactions are automatically grouped into categories like Food, Rent, and Shopping." },
    { icon: Icons.search,  title: "Anomaly Detection",     desc: "The AI flags high-value or irregular transactions so nothing slips past you." },
    { icon: Icons.bulb,    title: "Savings Tips",          desc: "Receive five personalised recommendations based on your actual spending behaviour." },
    { icon: Icons.history, title: "Analysis History",      desc: "Every report is saved automatically so you can revisit and compare past statements." },
    { icon: Icons.lock,    title: "Private by Design",     desc: "Files are processed on your local server and deleted immediately after analysis." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-black text-white mb-5 leading-tight">
          Know exactly where
          <br />
          <span style={{ color: "#818cf8" }}>your money goes.</span>
        </h1>
        <p style={{ color: "#6b7280" }} className="text-xl max-w-xl mx-auto leading-8">
          Upload any bank statement in CSV format and receive a detailed AI-powered breakdown in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setView("analyzer")}
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", fontSize: "16px" }}
            className="px-10 py-4 rounded-2xl font-black text-white hover:opacity-90 transition-all tracking-wide flex items-center gap-3"
          >
            Get Started
            <span>{Icons.arrow}</span>
          </button>
          <button
            onClick={() => setView("history")}
            style={{ background: "transparent", border: "1px solid #1e1e30", color: "#6b7280", fontSize: "15px" }}
            className="px-8 py-4 rounded-2xl font-bold hover:border-indigo-700 transition-all"
          >
            View History
          </button>
        </div>
      </div>

      <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-8 mb-8">
        <div className="grid grid-cols-3">
          {[
            { value: "< 10s", label: "Analysis Time",      color: "#10b981" },
            { value: "100%",  label: "Private & Local",    color: "#818cf8" },
            { value: "5+",    label: "Spending Categories", color: "#f59e0b" },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: i < 2 ? "1px solid #1e1e30" : "none" }} className="text-center px-8">
              <p style={{ color: s.color, fontSize: "34px", fontWeight: 900, lineHeight: 1.15 }}>{s.value}</p>
              <p style={{ color: "#4b5563", fontSize: "12px", marginTop: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-10 mb-8">
        <p style={{ color: "#4b5563" }} className="text-sm font-bold uppercase tracking-widest mb-8">Platform Capabilities</p>
        <div className="grid grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} style={{ background: "#0d0d14", border: "1px solid #1a1a2e" }} className="rounded-2xl p-6 hover:border-indigo-900 transition-all">
              <div style={{ color: "#818cf8", marginBottom: "14px" }}>{f.icon}</div>
              <p className="text-white font-bold mb-2" style={{ fontSize: "15px" }}>{f.title}</p>
              <p style={{ color: "#6b7280", fontSize: "13px", lineHeight: "1.7" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #2d1b69)", border: "1px solid #4338ca44" }} className="rounded-3xl p-10 text-center">
        <p style={{ color: "#a78bfa" }} className="text-xs font-bold uppercase tracking-widest mb-4">Ready to Begin</p>
        <h2 className="text-4xl font-black text-white mb-3">Upload your first statement</h2>
        <p style={{ color: "#a5b4fc", marginBottom: "28px", fontSize: "16px" }}>Analysis completes in under 30 seconds.</p>
        <button
          onClick={() => setView("analyzer")}
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", fontSize: "16px" }}
          className="px-10 py-4 rounded-2xl font-black text-white hover:opacity-90 transition-all tracking-wide inline-flex items-center gap-3"
        >
          Get Started
          <span>{Icons.arrow}</span>
        </button>
      </div>
    </div>
  );
}

function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!file) { setError("Please select a CSV file."); return; }
    setLoading(true); setError(""); setData(null);
    const formData = new FormData();
    formData.append("statement", file);
    try {
      const res = await fetch("http://localhost:3001/analyze", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError("The AI could not parse this statement. Please try again.");
    } catch {
      setError("Could not connect to the server. Ensure the backend is running on port 3001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-black text-white mb-5 leading-tight">
          Bank Statement
          <br />
          <span style={{ color: "#818cf8" }}>Analyzer</span>
        </h1>
        <p style={{ color: "#6b7280" }} className="text-xl max-w-xl mx-auto leading-8">
          Upload any bank statement in CSV format and get a detailed financial breakdown in seconds.
        </p>
      </div>

      <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-10 mb-10">
        <p style={{ color: "#4b5563" }} className="text-sm font-bold uppercase tracking-widest mb-6">Upload Statement</p>
        <div style={{ border: "2px dashed #2a2a40", background: "#0d0d14" }} className="rounded-2xl p-10 text-center">
          <div style={{ color: "#2a2a40", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            {Icons.upload}
          </div>
          <p style={{ color: "#6b7280" }} className="text-sm mb-5">CSV files only</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setError(""); setData(null); }}
            className="block w-full text-base cursor-pointer"
            style={{ color: "#9ca3af" }}
          />
          {file && (
            <p className="mt-4 text-base font-semibold" style={{ color: "#10b981" }}>
              {file.name} — ready to analyze
            </p>
          )}
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            background: loading ? "#1e1e30" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "white",
            fontSize: "17px",
          }}
          className="mt-8 w-full py-5 rounded-2xl font-black transition-all hover:opacity-90 disabled:cursor-not-allowed tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing your statement...
            </span>
          ) : "Run Analysis"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", color: "#f87171" }} className="mb-8 p-5 rounded-2xl text-base">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <AnalysisResult data={data} />
          <ChatBox data={data} />
        </div>
      )}
    </div>
  );
}

function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/history")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setHistory(json.history);
        else setError("Could not load history.");
      })
      .catch(() => setError("Could not connect to the server. Ensure the backend is running on port 3001."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:3001/history/${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-black text-white mb-5 leading-tight">
          Analysis
          <br />
          <span style={{ color: "#818cf8" }}>History</span>
        </h1>
        <p style={{ color: "#6b7280" }} className="text-xl max-w-xl mx-auto leading-8">
          All past statement analyses, saved automatically after every run.
        </p>
      </div>

      {loading && (
        <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-10 flex items-center justify-center gap-4">
          <span className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span style={{ color: "#6b7280" }} className="text-base font-semibold">Loading history...</span>
        </div>
      )}

      {error && (
        <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", color: "#f87171" }} className="p-5 rounded-2xl text-base">
          {error}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div style={{ background: "#13131a", border: "1px solid #1e1e30" }} className="rounded-3xl p-16 text-center">
          <div style={{ color: "#2a2a40", display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            {Icons.folder}
          </div>
          <p style={{ color: "#6b7280", fontSize: "18px", fontWeight: 700 }}>No analyses found</p>
          <p style={{ color: "#374151", fontSize: "14px", marginTop: "8px" }}>Run your first analysis to see results here.</p>
        </div>
      )}

      <div className="space-y-4">
        {history.map((entry) => {
          const isOpen = expanded === entry.id;
          const savingsRate = entry.data.totalIn > 0
            ? Math.round(((entry.data.totalIn - entry.data.totalOut) / entry.data.totalIn) * 100)
            : 0;

          return (
            <div
              key={entry.id}
              style={{ background: "#13131a", border: `1px solid ${isOpen ? "#4338ca" : "#1e1e30"}` }}
              className="rounded-3xl overflow-hidden transition-all"
            >
              <div
                className="flex items-center justify-between px-8 py-6 cursor-pointer hover:bg-white hover:bg-opacity-5 transition-all"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                <div className="flex items-center gap-5">
                  <div style={{ background: "#0d0d14", border: "1px solid #1a1a2e", width: "46px", height: "46px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563" }}>
                    {Icons.file}
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{entry.filename}</p>
                    <p style={{ color: "#4b5563", fontSize: "13px" }}>
                      {new Date(entry.analyzedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p style={{ color: "#10b981", fontWeight: 800, fontSize: "15px" }}>₹{entry.data.totalIn.toLocaleString()}</p>
                      <p style={{ color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Income</p>
                    </div>
                    <div style={{ width: "1px", height: "28px", background: "#1e1e30" }} />
                    <div className="text-right">
                      <p style={{ color: "#ef4444", fontWeight: 800, fontSize: "15px" }}>₹{entry.data.totalOut.toLocaleString()}</p>
                      <p style={{ color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Spent</p>
                    </div>
                    <div style={{ width: "1px", height: "28px", background: "#1e1e30" }} />
                    <div className="text-right">
                      <p style={{ color: "#818cf8", fontWeight: 800, fontSize: "15px" }}>{savingsRate}%</p>
                      <p style={{ color: "#374151", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Saved</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                    style={{ color: "#374151", border: "1px solid #1e1e30", background: "transparent", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}
                    className="hover:border-red-800 hover:text-red-400 transition-all"
                  >
                    {Icons.close}
                  </button>

                  <span style={{ color: "#4b5563", display: "flex", alignItems: "center", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    {Icons.chevronDown}
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="px-8 pb-8">
                  <div style={{ borderTop: "1px solid #1e1e30", paddingTop: "28px" }}>
                    <AnalysisResult data={entry.data} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Navbar({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <nav style={{ borderBottom: "1px solid #1a1a2e" }} className="px-10 py-5 flex items-center justify-between">
      <button onClick={() => setView("landing")} className="flex items-center gap-3">
        <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }} className="w-10 h-10 rounded-xl flex items-center justify-center">
          <span className="text-white font-black text-base">IQ</span>
        </div>
        <span className="font-black text-white text-2xl tracking-tight">
          Statement<span style={{ color: "#818cf8" }}>IQ</span>
        </span>
      </button>

      <div className="flex items-center gap-2">
        {(["analyzer", "history"] as View[]).map((v) => {
          const labels: Record<string, string> = { analyzer: "Analyze", history: "History" };
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: active ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "transparent",
                color: active ? "#fff" : "#6b7280",
                border: active ? "none" : "1px solid #1e1e30",
                fontSize: "14px",
              }}
              className="px-5 py-2 rounded-xl font-bold transition-all hover:opacity-80"
            >
              {labels[v]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("landing");

  return (
    <div className="min-h-screen font-sans" style={{ background: "#0a0a0f", color: "#fff" }}>
      <Navbar view={view} setView={setView} />
      {view === "landing"  && <LandingPage  setView={setView} />}
      {view === "analyzer" && <AnalyzerPage />}
      {view === "history"  && <HistoryPage />}
    </div>
  );
}