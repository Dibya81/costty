import { useEffect, useRef, useState } from "react";
import "../lib/scrollcraft/scrollcraft.css";
import "../lib/scrollcraft/scrollcraft.js";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  ScanSearch,
  Calculator,
  Users,
  Check,
  Copy,
  Terminal,
  FileSpreadsheet,
  Presentation,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Code2,
  FileCode,
  Sliders,
  Layers,
  AlertCircle,
  Clock,
  TrendingDown,
  Lock,
  Zap,
} from "lucide-react";
import { formatPaise } from "../utils/currency";

const TOKENS = `
:root {
  --sc-canvas:      #080A10;
  --sc-surface:     #111422;
  --sc-surface-raised: #181C2E;
  --sc-ink:         #F3F4F6;
  --sc-ink-soft:    #94A3B8;
  --sc-accent:      #F97316;
  --sc-accent-glow: rgba(249, 115, 22, 0.25);
  --sc-accent-ink:  #FFFFFF;

  --sc-hairline:        rgba(255, 255, 255, 0.08);
  --sc-hairline-strong: rgba(255, 255, 255, 0.16);

  --sc-font-display: "Archivo", system-ui, sans-serif;
  --sc-font-text:    "IBM Plex Sans", system-ui, sans-serif;
  --sc-font-mono:    "IBM Plex Mono", ui-monospace, monospace;

  --sc-shadow-color: 220 40% 2%;
  --sc-e1: 0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3);
  --sc-e2: 0 12px 36px -4px rgba(0, 0, 0, 0.6), 0 0 20px 0 var(--sc-accent-glow);
}
`;

function mountSc(root: HTMLElement) {
  if (typeof window !== "undefined" && (window as any).ScrollCraft) {
    (window as any).ScrollCraft.mount(root);
  }
}

/* -----------------------------------------------------------------------
   Brand Wordmark Component: COSTlY
   ----------------------------------------------------------------------- */
function CostlyLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";
  const iconSize = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-6 w-6" : "h-7 w-7";

  return (
    <div className={`flex items-center gap-2 font-display font-extrabold tracking-tight ${textSize} text-white`}>
      <div className={`${iconSize} rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30`}>
        <Calculator className="h-4 w-4" />
      </div>
      <span>
        COST<span className="text-orange-500">lY</span>
      </span>
    </div>
  );
}

/* -----------------------------------------------------------------------
   Custom Ring Cursor Component
   ----------------------------------------------------------------------- */
function CustomRingCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const target = e.target as HTMLElement | null;
      if (target && target.closest("a, button, input, select, .interactive-card")) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let raf: number;
    const loop = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.15;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.current.x - 18}px, ${pos.current.y - 18}px, 0) scale(${
          hovered ? 1.6 : 1
        })`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [hovered]);

  return (
    <>
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 h-9 w-9 rounded-full border border-amber-500/70 transition-transform ease-out ${
          hovered ? "bg-amber-500/10 border-amber-400" : ""
        }`}
        style={{ willChange: "transform" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-50 -ml-1 -mt-1 h-2 w-2 rounded-full bg-amber-400"
        style={{ willChange: "transform" }}
      />
    </>
  );
}

/* -----------------------------------------------------------------------
   3D BACKGROUND #1: File 3D Cursor-Reactive Canvas (Hero Section Only)
   ----------------------------------------------------------------------- */
function File3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", onResize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / width;
      mouseRef.current.targetY = (e.clientY - rect.top) / height;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Create 3D Floating File Nodes
    const nodesCount = 50;
    const nodes: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      type: string;
    }[] = [];

    const types = ["PDF", "DOCX", "XLSX", "PPTX", "FILE"];

    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 700 + 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 3,
        type: types[i % types.length],
      });
    }

    let animationFrameId: number;

    const render = () => {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const rotY = (mouseRef.current.x - 0.5) * 1.0;
      const rotX = (mouseRef.current.y - 0.5) * 1.0;

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      const projected: { x: number; y: number; scale: number; type: string }[] = [];

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        if (Math.abs(node.x) > width) node.vx *= -1;
        if (Math.abs(node.y) > height) node.vy *= -1;
        if (node.z < 50 || node.z > 850) node.vz *= -1;

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;
        let y1 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        const scale = Math.max(0.1, fov / Math.max(1, fov + z2));
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;
        const radius = Math.max(0.1, node.size * scale);

        projected.push({ x: px, y: py, scale, type: node.type });

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = node.type === "PDF" ? "rgba(249, 115, 22, 0.9)" : "rgba(148, 163, 184, 0.4)";
          ctx.fill();
        }
      });

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.15 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />;
}

/* -----------------------------------------------------------------------
   3D BACKGROUND #2: Full-Page Cost & Currency Floating Canvas
   ----------------------------------------------------------------------- */
function Cost3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const symbols = ["₹", "$", "€", "%", "0.00", "COST", "API"];
    const particlesCount = 40;
    const particles: {
      x: number;
      y: number;
      z: number;
      vy: number;
      vx: number;
      symbol: string;
      alpha: number;
    }[] = [];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 100,
        vy: -0.3 - Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        symbol: symbols[i % symbols.length],
        alpha: Math.random() * 0.35 + 0.15,
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;

        if (p.y < -50) {
          p.y = height + 50;
          p.x = Math.random() * width;
        }
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;

        const scale = 300 / (300 + p.z);
        const fontSize = Math.max(10, Math.round(18 * scale));

        ctx.font = `600 ${fontSize}px IBM Plex Mono, monospace`;
        ctx.fillStyle = p.symbol === "₹" ? `rgba(249, 115, 22, ${p.alpha})` : `rgba(148, 163, 184, ${p.alpha * 0.6})`;
        ctx.fillText(p.symbol, p.x, p.y);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
}

/* -----------------------------------------------------------------------
   Interactive Intake Demo Component (Hero)
   ----------------------------------------------------------------------- */
function InteractiveIntakeDemo() {
  const [selectedDoc, setSelectedDoc] = useState<"pdf" | "docx" | "xlsx" | "pptx">("pdf");

  const sampleDocs = {
    pdf: {
      name: "Q3_Financial_Audit_Report.pdf",
      size: "4.8 MB",
      pages: 142,
      category: "PDF Document",
      mime: "application/pdf",
      bwSides: 284,
      colorSides: 0,
      estCost: formatPaise(284 * 250),
      badgeColor: "border-orange-500/40 text-orange-400 bg-orange-500/10",
      details: ["Searchable OCR text", "142 pages (Duplex)", "Extracts tables & metadata"],
    },
    docx: {
      name: "Product_Specs_v2.docx",
      size: "2.1 MB",
      pages: 45,
      category: "Microsoft Word",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      bwSides: 90,
      colorSides: 0,
      estCost: formatPaise(90 * 250),
      badgeColor: "border-blue-500/40 text-blue-400 bg-blue-500/10",
      details: ["Typography parsed", "90 printed sides", "Heading hierarchy extracted"],
    },
    xlsx: {
      name: "Annual_Budget_2026.xlsx",
      size: "6.4 MB",
      pages: 18,
      category: "Microsoft Excel",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      bwSides: 0,
      colorSides: 36,
      estCost: formatPaise(36 * 800),
      badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      details: ["3 Worksheets detected", "Color grid enabled", "Print area formatted"],
    },
    pptx: {
      name: "Investor_Deck_Final.pptx",
      size: "12.3 MB",
      pages: 28,
      category: "Microsoft PowerPoint",
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      bwSides: 0,
      colorSides: 56,
      estCost: formatPaise(56 * 800),
      badgeColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      details: ["28 High-res slides", "Full Color output", "Aspect ratio 16:9"],
    },
  };

  const current = sampleDocs[selectedDoc];

  return (
    <div className="interactive-card rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300">Live Intake Inspector</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          API Ready
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {(["pdf", "docx", "xlsx", "pptx"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedDoc(type)}
            className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs font-mono uppercase transition ${
              selectedDoc === type
                ? "border-orange-500 bg-orange-500/15 text-orange-300 shadow-sm"
                : "border-white/5 bg-slate-800/50 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <span className="font-bold">{type}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg border p-2.5 ${current.badgeColor}`}>
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-slate-100 text-sm">{current.name}</h4>
                <p className="font-mono text-[11px] text-slate-400">{current.mime}</p>
              </div>
            </div>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono ${current.badgeColor}`}>
              {current.category}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">FILE SIZE</span>
              <span className="text-slate-200">{current.size}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PAGES</span>
              <span className="text-slate-200">{current.pages} pages</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ESTIMATED COST</span>
              <span className="text-orange-400 font-bold">{current.estCost}</span>
            </div>
          </div>
        </div>

        <ul className="space-y-2 text-xs font-mono text-slate-400">
          {current.details.map((detail, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   Storytelling Component for Section 2: Friction vs COSTlY Comparison
   ----------------------------------------------------------------------- */
function StorytellingProblemComparison() {
  const [activeTab, setActiveTab] = useState<"old" | "costly">("costly");
  const [userPages, setUserPages] = useState(150);

  const oldCost = userPages * 5 * 100;
  const costlyCost = userPages * 2 * 250;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-orange-400">Section 02 · Storytelling Friction Engine</span>
          <h3 className="font-display font-bold text-2xl text-white">Traditional Print Counter vs COSTlY Engine</h3>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-slate-950 p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab("old")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "old" ? "bg-red-500/20 text-red-400 border border-red-500/30 font-bold" : "text-slate-400"
            }`}
          >
            Old Print Counter
          </button>
          <button
            onClick={() => setActiveTab("costly")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "costly" ? "bg-orange-500 text-white font-bold" : "text-slate-400"
            }`}
          >
            COSTlY REST API
          </button>
        </div>
      </div>

      {activeTab === "old" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h4 className="font-bold text-slate-200 text-sm">Unpriced Counter Surprise</h4>
            <p className="text-slate-400 text-xs">You submit files blind. The total price is revealed only when printing completes.</p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-2">
            <Clock className="h-5 w-5 text-red-400" />
            <h4 className="font-bold text-slate-200 text-sm">3 Separate Manual Steps</h4>
            <p className="text-slate-400 text-xs">Upload on email, verify in person, pay via separate apps with no history.</p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <h4 className="font-bold text-slate-200 text-sm">Arbitrary Pricing Marks</h4>
            <p className="text-slate-400 text-xs">Simplex/duplex billed at random rates with no itemized calculation receipt.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h4 className="font-bold text-slate-200 text-sm">Upfront Price Guarantee</h4>
            <p className="text-slate-400 text-xs">REST API calculates itemized costs down to the paise before printing.</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <h4 className="font-bold text-slate-200 text-sm">Automated Document Intake</h4>
            <p className="text-slate-400 text-xs">Identifies PDF, Word, Excel, PPTX, page counts, color ratios in milliseconds.</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
            <Lock className="h-5 w-5 text-emerald-400" />
            <h4 className="font-bold text-slate-200 text-sm">Permanent History &amp; Share</h4>
            <p className="text-slate-400 text-xs">Save estimates, generate share links with permission levels and expiry timers.</p>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex justify-between font-mono text-xs">
            <span className="text-slate-400">Your Average Semester Pages</span>
            <span className="text-orange-400 font-bold">{userPages} pages</span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            value={userPages}
            onChange={(e) => setUserPages(Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">UNPRICED SHOP</span>
            <span className="text-red-400 font-bold text-lg">{formatPaise(oldCost)}</span>
          </div>
          <div className="text-orange-400 text-xl font-bold">→</div>
          <div>
            <span className="text-slate-500 block text-[10px]">COSTlY REST API</span>
            <span className="text-emerald-400 font-bold text-lg">{formatPaise(costlyCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   Storytelling Component for Section 3: Document Processing Pipeline
   ----------------------------------------------------------------------- */
function StorytellingPipelineInspector() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: "01",
      title: "File Intake & MIME Verification",
      icon: FileCode,
      desc: "Validates binary header signatures for PDF, DOCX, XLSX, and PPTX formats, rejecting corrupt uploads.",
      output: "MIME: application/pdf · Validation: PASSED · Size: 4.8MB",
    },
    {
      num: "02",
      title: "Layout & OCR Extraction",
      icon: ScanSearch,
      desc: "Parses text streams, extracts headings, counts vector elements, and detects embedded raster graphics.",
      output: "Words: 34,200 · Headings: 18 · OCR Status: Searchable",
    },
    {
      num: "03",
      title: "Physical Sheet & Color Counter",
      icon: Layers,
      desc: "Calculates duplex vs. simplex physical sheet requirements and flags color vs black & white pages.",
      output: "Physical Sheets: 71 (Duplex) · B&W Sides: 142 · Color: 0",
    },
    {
      num: "04",
      title: "Cost Calculation & API Payload",
      icon: Terminal,
      desc: "Applies pricing rules (₹2.50/side B&W) and returns structured JSON payload with HTTP 200 OK.",
      output: "Calculated Cost: ₹355.00 · Currency: INR · Status: 200 OK",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-8 shadow-2xl space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="font-mono text-xs uppercase tracking-widest text-orange-400">Section 03 · Storytelling Pipeline</span>
        <h3 className="font-display font-bold text-2xl text-white">Inside the COSTlY Document Intelligence Engine</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = activeStep === idx + 1;
          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx + 1)}
              className={`rounded-xl border p-5 text-left transition relative ${
                isActive
                  ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                  : "border-white/5 bg-slate-950/60 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-orange-400">{s.num}</span>
                <Icon className={`h-5 w-5 ${isActive ? "text-orange-400" : "text-slate-500"}`} />
              </div>
              <h4 className="font-display font-bold text-slate-100 text-sm mb-1">{s.title}</h4>
              <p className="text-slate-400 text-xs line-clamp-2">{s.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-orange-500/30 bg-slate-950 p-6 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-white/10 pb-2">
          <span>PIPELINE STAGE {steps[activeStep - 1].num} EXECUTION LOG</span>
          <span className="text-emerald-400">STATUS: ACTIVE</span>
        </div>
        <p className="text-orange-300 font-bold">{steps[activeStep - 1].output}</p>
        <p className="text-slate-400">{steps[activeStep - 1].desc}</p>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   Storytelling Component for Section 6: Feature Explorer & Live Tour
   ----------------------------------------------------------------------- */
function StorytellingFeatureExplorer() {
  const [filter, setFilter] = useState<"all" | "engine" | "api" | "vault">("all");

  const features = [
    {
      cat: "engine",
      title: "Automatic File Classification",
      desc: "Identifies document formats automatically and categorizes content structure without manual tags.",
      badge: "INTAKE ENGINE",
      icon: ScanSearch,
    },
    {
      cat: "engine",
      title: "Precise Pricing Engine",
      desc: "Handles complex pricing scenarios: duplex discounting, B&W vs color pages, volume copies, and custom rates.",
      badge: "CALCULATOR",
      icon: Calculator,
    },
    {
      cat: "api",
      title: "Developer REST API",
      desc: "Clean RESTful JSON API endpoints with bearer token auth, webhooks, and client SDK compatibility.",
      badge: "REST API",
      icon: Terminal,
    },
    {
      cat: "vault",
      title: "Secure File Sharing",
      desc: "Generate links with view/edit permissions, expiry timers, password protection, and access tracking.",
      badge: "SECURITY",
      icon: ShieldCheck,
    },
    {
      cat: "vault",
      title: "Community Exchange",
      desc: "Request hard-to-find documents, offer study materials, and track fulfilled document exchanges.",
      badge: "COMMUNITY",
      icon: Users,
    },
    {
      cat: "engine",
      title: "Estimate History & Logs",
      desc: "Keep a permanent log of all your previous print estimates, document analysis, and shared links.",
      badge: "AUDIT LOGS",
      icon: Layers,
    },
  ];

  const filtered = filter === "all" ? features : features.filter((f) => f.cat === filter);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-xs">
        {(["all", "engine", "api", "vault"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg border uppercase tracking-wider transition ${
              filter === cat
                ? "border-orange-500 bg-orange-500/20 text-orange-300 font-bold"
                : "border-white/10 bg-slate-900/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat === "all" ? "All Platform Features" : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4 hover:border-orange-500/50 transition group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-mono text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  {f.badge}
                </span>
              </div>
              <h4 className="font-display font-bold text-xl text-white">{f.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   Interactive Print Cost Calculator & REST API Code Viewer
   ----------------------------------------------------------------------- */
function InteractivePrintApiShowcase() {
  const [pages, setPages] = useState(120);
  const [copies, setCopies] = useState(3);
  const [colorMode, setColorMode] = useState<"bw" | "color">("bw");
  const [sidedness, setSidedness] = useState<"duplex" | "simplex">("duplex");
  const [activeTab, setActiveTab] = useState<"curl" | "json" | "python">("json");
  const [copied, setCopied] = useState(false);

  const sides = sidedness === "duplex" ? pages * 2 : pages;
  const ratePaise = colorMode === "color" ? 800 : 250;
  const totalPaise = sides * copies * ratePaise;
  const formattedCost = formatPaise(totalPaise);

  const jsonSnippet = `{
  "request": {
    "document": "analysis_report.pdf",
    "pageCount": ${pages},
    "copies": ${copies},
    "colorMode": "${colorMode}",
    "sidedness": "${sidedness}"
  },
  "estimate": {
    "totalSides": ${sides * copies},
    "ratePerSidePaise": ${ratePaise},
    "currency": "INR",
    "totalCostFormatted": "${formattedCost}"
  },
  "status": 200
}`;

  const curlSnippet = `curl -X POST https://api.costly.app/v1/estimates/calculate \\
  -H "Authorization: Bearer sec_live_key_9948" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pages": ${pages},
    "copies": ${copies},
    "colorMode": "${colorMode}",
    "sidedness": "${sidedness}"
  }'`;

  const pythonSnippet = `import requests

res = requests.post(
    "https://api.costly.app/v1/estimates/calculate",
    headers={"Authorization": "Bearer sec_live_key_9948"},
    json={
        "pages": ${pages},
        "copies": ${copies},
        "colorMode": "${colorMode}",
        "sidedness": "${sidedness}"
    }
)
print(res.json()["estimate"]["totalCostFormatted"]) # -> ${formattedCost}`;

  const getActiveCode = () => {
    if (activeTab === "curl") return curlSnippet;
    if (activeTab === "python") return pythonSnippet;
    return jsonSnippet;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-8 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sliders className="h-5 w-5 text-orange-400" />
            <h3 className="font-display font-bold text-xl text-slate-100">Live Print Cost Engine</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase tracking-wide">Document Pages</span>
                <span className="text-orange-400 font-bold">{pages} pages</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase tracking-wide">Number of Copies</span>
                <span className="text-orange-400 font-bold">{copies} copies</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Color Mode
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-slate-950/80 p-1">
                  <button
                    onClick={() => setColorMode("bw")}
                    className={`rounded py-1.5 text-xs font-mono transition ${
                      colorMode === "bw" ? "bg-orange-500 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    B&amp;W
                  </button>
                  <button
                    onClick={() => setColorMode("color")}
                    className={`rounded py-1.5 text-xs font-mono transition ${
                      colorMode === "color" ? "bg-orange-500 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Color
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Sidedness
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-slate-950/80 p-1">
                  <button
                    onClick={() => setSidedness("duplex")}
                    className={`rounded py-1.5 text-xs font-mono transition ${
                      sidedness === "duplex" ? "bg-orange-500 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Duplex
                  </button>
                  <button
                    onClick={() => setSidedness("simplex")}
                    className={`rounded py-1.5 text-xs font-mono transition ${
                      sidedness === "simplex" ? "bg-orange-500 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Simplex
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-orange-500/30 bg-orange-500/10 p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-300 block">
              Calculated Total Cost
            </span>
            <span className="text-3xl font-display font-extrabold text-orange-400">{formattedCost}</span>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400">
            <div>{sides * copies} total sides</div>
            <div>₹{colorMode === "color" ? "8.00" : "2.50"} per side</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950 backdrop-blur-xl p-6 flex flex-col justify-between shadow-2xl font-mono">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-orange-400" />
              <span className="text-xs uppercase tracking-wide text-slate-300">REST API Playground</span>
            </div>

            <div className="flex items-center gap-2">
              {(["json", "curl", "python"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1 text-[10px] uppercase rounded border transition ${
                    activeTab === tab
                      ? "border-orange-500/50 bg-orange-500/20 text-orange-300"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button
                onClick={handleCopy}
                className="ml-2 p-1.5 text-slate-400 hover:text-orange-400 transition"
                title="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <pre className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-white/5 overflow-x-auto leading-relaxed">
            <code>{getActiveCode()}</code>
          </pre>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <span>Endpoint: POST /v1/estimates/calculate</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 200 OK (34ms)
          </span>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
   The Refactored COSTlY Landing Page
   ----------------------------------------------------------------------- */
export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    mountSc(rootRef.current);
  }, []);

  return (
    <>
      <style>{TOKENS}</style>
      <CustomRingCursor />

      {/* 3D BACKGROUND #2: Persistent Full-Page Floating Cost & Currency Canvas */}
      <Cost3DCanvas />

      <div
        ref={rootRef}
        className="landing-root relative z-10 min-h-screen bg-[#080A10] text-slate-100 overflow-x-hidden selection:bg-orange-500 selection:text-white"
      >
        {/* ──── SECTION 1: HERO (3D Background #1: File 3D Canvas) ──── */}
        <section data-sc-act="flow" className="relative pt-8 pb-20 lg:pt-12 lg:pb-32 overflow-hidden border-b border-white/10">
          {/* 3D BACKGROUND #1: File 3D Cursor-Reactive Canvas */}
          <File3DCanvas />

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <header className="flex items-center justify-between py-4 mb-16 border-b border-white/10">
              <CostlyLogo size="md" />

              <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-slate-400">
                <a href="#intelligence" className="hover:text-white transition">Intelligence</a>
                <a href="#calculator" className="hover:text-white transition">Cost Engine</a>
                <a href="#api" className="hover:text-white transition">REST API</a>
                <a href="#features" className="hover:text-white transition">Features</a>
                <a href="#community" className="hover:text-white transition">Community</a>
              </nav>

              <div className="flex items-center gap-3">
                <Link to="/login" className="text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white px-3 py-2">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-mono text-orange-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>COSTlY Document Intelligence &amp; Print Pricing API</span>
                </div>

                <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white">
                  Know what you&apos;re printing <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-amber-200">
                    before you print it.
                  </span>
                </h1>

                <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
                  COSTlY reads any document (PDF, Word, Excel, PowerPoint), extracts key metadata, classifies categories, and calculates itemized print costs via REST API — before you touch the printer.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-display font-bold text-white shadow-xl shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition"
                  >
                    Start Estimating Free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#api"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-900/80 px-6 py-3.5 text-sm font-display font-medium text-slate-300 hover:border-white/30 hover:text-white transition"
                  >
                    Explore REST API <Code2 className="h-4 w-4 text-orange-400" />
                  </a>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center gap-3 flex-wrap text-xs font-mono text-slate-400">
                  <span className="text-slate-500 uppercase tracking-wide text-[10px]">Supported Formats:</span>
                  <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-orange-400">PDF</span>
                  <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-400">DOCX</span>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">XLSX</span>
                  <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-purple-400">PPTX</span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <InteractiveIntakeDemo />
              </div>
            </div>
          </div>
        </section>

        {/* ──── SECTION 2: STORYTELLING PROBLEM vs COSTlY ──── */}
        <section className="py-20 lg:py-32 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="max-w-3xl">
              <span className="font-mono text-xs uppercase tracking-widest text-orange-400">Section 02 · Storytelling Friction Engine</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white mt-3 leading-tight">
                Say goodbye to arbitrary print counters and mystery pricing.
              </h2>
            </div>

            <StorytellingProblemComparison />
          </div>
        </section>

        {/* ──── SECTION 3: STORYTELLING DOCUMENT PIPELINE & CLASSIFICATION ──── */}
        <section id="intelligence" className="py-20 lg:py-32 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-orange-400">Section 03 · Storytelling Pipeline</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
                How COSTlY analyzes and classifies documents in 4 stages.
              </h2>
            </div>

            <StorytellingPipelineInspector />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
              <div className="rounded-2xl border border-orange-500/30 bg-slate-900/80 p-6 space-y-4 relative overflow-hidden group hover:border-orange-500 transition">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-orange-400">PDF</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">PDF Documents</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Extracts page counts, text density, embedded font vectors, and identifies scanned vs searchable content.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-500/30 bg-slate-900/80 p-6 space-y-4 relative overflow-hidden group hover:border-blue-500 transition">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <FileCode className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-400">DOCX</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">Microsoft Word</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Parses document sections, estimates printed physical pages, counts inline images, and extracts heading trees.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-6 space-y-4 relative overflow-hidden group hover:border-emerald-500 transition">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">XLSX</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">Microsoft Excel</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Detects active worksheets, calculates printable grid boundaries, and separates B&amp;W tables from color charts.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 p-6 space-y-4 relative overflow-hidden group hover:border-purple-500 transition">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Presentation className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-purple-400">PPTX</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">PowerPoint Decks</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Evaluates total slide deck count, slide aspect ratio (16:9 vs 4:3), and calculates color vs B&amp;W slide ratio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──── SECTION 4: LIVE COST CALCULATOR & REST API ──── */}
        <section id="calculator" className="py-20 lg:py-32 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-orange-400">Print Engine &amp; Developer API</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
                Test the COSTlY Calculation REST API
              </h2>
            </div>

            <div id="api">
              <InteractivePrintApiShowcase />
            </div>
          </div>
        </section>

        {/* ──── SECTION 5: 4-STEP WORKFLOW ──── */}
        <section className="py-20 lg:py-32 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-orange-400">How COSTlY Works</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
                One document. Four automated steps.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-3">
                <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">Step 01</span>
                <h3 className="font-display font-bold text-xl text-white">Upload Document</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Drag and drop PDF, Word, Excel, or PowerPoint files directly into the web application or upload via REST API.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-3">
                <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">Step 02</span>
                <h3 className="font-display font-bold text-xl text-white">Extract &amp; Classify</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  COSTlY reads metadata, identifies MIME type, parses page counts, and classifies the document into categories.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-3">
                <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">Step 03</span>
                <h3 className="font-display font-bold text-xl text-white">Calculate Price</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The calculation engine applies current rates (B&amp;W ₹2.50/side, Color ₹8.00/side, Duplex/Simplex) for total cost.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-3">
                <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">Step 04</span>
                <h3 className="font-display font-bold text-xl text-white">Share &amp; Print</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Generate secure share links with expiry dates, or send the estimate directly to your library or print queue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──── SECTION 6: STORYTELLING FEATURE EXPLORER ──── */}
        <section id="features" className="py-20 lg:py-32 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-orange-400">Section 06 · Storytelling Feature Explorer</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">
                Everything you need for document intelligence.
              </h2>
            </div>

            <StorytellingFeatureExplorer />
          </div>
        </section>

        {/* ──── SECTION 7: COMMUNITY EXCHANGE ──── */}
        <section id="community" className="py-20 lg:py-32 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="font-mono text-xs uppercase tracking-widest text-orange-400">Community Module</span>
                <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white leading-tight">
                  Someone has the document. <br />
                  <span className="text-orange-400">Ask for it here.</span>
                </h2>
                <p className="text-slate-400 text-base leading-relaxed">
                  Post what you&apos;re looking for, tag by subject, and offer files you hold. When a user fulfills your request, the request closes and the document is shared instantly.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <span className="font-display font-extrabold text-2xl text-white block">Open</span>
                    <span className="font-mono text-xs text-slate-500">Public requests</span>
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-2xl text-white block">Fulfilled</span>
                    <span className="font-mono text-xs text-slate-500">Shared files</span>
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-2xl text-white block">Free</span>
                    <span className="font-mono text-xs text-slate-500">To ask &amp; offer</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-mono text-xs uppercase text-slate-400">Live Community Requests</span>
                  <span className="text-xs font-mono text-orange-400">4 Active</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-bold">CS301_Data_Structures_Exam_2025.pdf</span>
                      <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px]">FULFILLED</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Requested by @alex_m · 142 pages · B&amp;W</p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-bold">Organic_Chemistry_Lab_Manual.docx</span>
                      <span className="rounded bg-orange-500/10 text-orange-400 px-2 py-0.5 text-[10px]">OPEN</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Requested by @sarah_k · 58 pages · Color</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──── SECTION 8: CALL TO ACTION & FOOTER ──── */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-950 to-black">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
            <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
              Your document library &amp; print cost API starts here.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
              Free to register. No credit card required. Classify files, calculate costs, and share link previews in seconds.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-display font-bold text-white shadow-xl shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <footer className="mt-24 border-t border-white/10 pt-12 pb-8 max-w-7xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
              <CostlyLogo size="sm" />
              <p>Document Intelligence · Print Cost Estimation REST API</p>
              <p>Rates: B&amp;W ₹2.50/side · Color ₹8.00/side</p>
            </div>
          </footer>
        </section>
      </div>
    </>
  );
}

export default Landing;
