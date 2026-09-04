import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronDown,
  FileArchive,
  FileText,
  FolderSearch,
  LockKeyhole,
  Menu,
  Search,
  Send,
  Share2,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";
import "../lib/scrollcraft/scrollcraft.css";
import "../lib/scrollcraft/scrollcraft.js";
import { ThemeToggle } from "../components/app/ThemeToggle";
import { calculateEstimate } from "../services/printService";
import { formatPaise } from "../utils/currency";

const styles = `
.costly-landing {
  --cl-bg: #f6f1e6;
  --cl-bg-deep: #ebe2d0;
  --cl-panel: rgba(255, 251, 242, 0.78);
  --cl-panel-strong: rgba(255, 251, 242, 0.94);
  --cl-ink: #17120d;
  --cl-muted: #736959;
  --cl-line: rgba(28, 23, 15, 0.14);
  --cl-line-strong: rgba(28, 23, 15, 0.24);
  --cl-accent: #d9472b;
  --cl-accent-soft: rgba(217, 71, 43, 0.14);
  --cl-good: #317454;
  --cl-blue: #315f86;
  --cl-violet: #70528f;
  --cl-shadow: 0 24px 80px rgba(45, 31, 16, 0.18);
  min-height: 100vh;
  overflow-x: clip;
  background:
    radial-gradient(80rem 44rem at 74% -10%, rgba(217, 71, 43, 0.16), transparent 58%),
    linear-gradient(180deg, var(--cl-bg), var(--cl-bg-deep) 38%, var(--cl-bg) 100%);
  color: var(--cl-ink);
  cursor: default;
}
[data-theme="dark"] .costly-landing {
  --cl-bg: #090b10;
  --cl-bg-deep: #10131c;
  --cl-panel: rgba(18, 22, 32, 0.72);
  --cl-panel-strong: rgba(17, 21, 31, 0.94);
  --cl-ink: #f5efe4;
  --cl-muted: #a79d90;
  --cl-line: rgba(245, 239, 228, 0.12);
  --cl-line-strong: rgba(245, 239, 228, 0.22);
  --cl-accent: #f26a3d;
  --cl-accent-soft: rgba(242, 106, 61, 0.15);
  --cl-good: #7ab089;
  --cl-blue: #7aa3cc;
  --cl-violet: #b09ad0;
  --cl-shadow: 0 28px 90px rgba(0, 0, 0, 0.42);
  background:
    radial-gradient(74rem 38rem at 74% -10%, rgba(242, 106, 61, 0.15), transparent 58%),
    radial-gradient(54rem 36rem at 12% 8%, rgba(122, 163, 204, 0.12), transparent 62%),
    linear-gradient(180deg, var(--cl-bg), var(--cl-bg-deep) 42%, var(--cl-bg) 100%);
}
.costly-landing a { text-decoration: none; }
.cl-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  z-index: 0;
  background-image:
    linear-gradient(var(--cl-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--cl-line) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, black, transparent 72%);
}
.cl-nav {
  position: fixed;
  inset: 16px 16px auto;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--cl-line);
  background: color-mix(in oklab, var(--cl-bg) 84%, transparent);
  backdrop-filter: blur(18px);
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.cl-brand { display: inline-flex; align-items: center; gap: 10px; color: var(--cl-ink); font-weight: 800; letter-spacing: 0; }
.cl-brand-mark { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 7px; background: var(--cl-accent); color: white; }
.cl-nav-links { display: flex; align-items: center; gap: 22px; color: var(--cl-muted); font: 700 11px var(--sc-font-mono); text-transform: uppercase; letter-spacing: 0.08em; }
.cl-nav-links a:hover { color: var(--cl-ink); }
.cl-nav-actions { display: flex; align-items: center; gap: 8px; }
.cl-link { color: var(--cl-muted); padding: 8px 10px; border-radius: 6px; font-size: 14px; font-weight: 650; transition: color 160ms, background 160ms; }
.cl-link:hover { color: var(--cl-ink); background: var(--cl-panel); }
.cl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  border: 1px solid var(--cl-line-strong);
  border-radius: 7px;
  padding: 10px 15px;
  color: var(--cl-ink);
  background: var(--cl-panel);
  font-weight: 750;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease;
}
.cl-button:hover { transform: translateY(-1px); border-color: color-mix(in oklab, var(--cl-accent) 48%, var(--cl-line)); }
.cl-button:active { transform: translateY(0) scale(0.98); }
.cl-button--primary { border-color: var(--cl-accent); background: var(--cl-accent); color: #fff; }
.cl-menu-button { display: none; border: 0; background: transparent; color: var(--cl-ink); padding: 8px; }
.cl-mobile-menu { display: none; }
.cl-section { position: relative; z-index: 1; padding: clamp(5rem, 10vw, 9rem) clamp(1.1rem, 4vw, 4rem); }
.cl-wrap { width: min(1180px, 100%); margin: 0 auto; }
.cl-kicker { color: var(--cl-accent); font: 800 11px var(--sc-font-mono); letter-spacing: 0.12em; text-transform: uppercase; }
.cl-title { margin: 12px 0 0; font-size: clamp(2.3rem, 6vw, 6.7rem); line-height: 0.94; letter-spacing: 0; font-weight: 850; max-width: 980px; }
.cl-subtitle { max-width: 620px; margin-top: 22px; color: var(--cl-muted); font-size: clamp(1rem, 1.8vw, 1.25rem); line-height: 1.55; }
.cl-hero {
  position: relative;
  min-height: 100svh;
  padding: 108px clamp(1rem, 4vw, 4rem) 54px;
  display: grid;
  place-items: center;
  overflow: clip;
  perspective: 1200px;
}
.cl-hero::before {
  content: "";
  position: absolute;
  inset: 78px 16px 16px;
  border: 1px solid var(--cl-line);
  border-radius: 10px;
  background:
    radial-gradient(circle at calc(50% + var(--px, 0) * 18%) calc(42% + var(--py, 0) * 14%), var(--cl-accent-soft), transparent 28%),
    linear-gradient(120deg, transparent 0 46%, color-mix(in oklab, var(--cl-accent) 18%, transparent) 47% 48%, transparent 49% 100%);
  opacity: 0.68;
  pointer-events: none;
}
.cl-hero::after {
  content: "";
  position: absolute;
  inset: 78px 16px 16px;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent, color-mix(in oklab, var(--cl-accent) 58%, transparent), transparent),
    linear-gradient(180deg, transparent, color-mix(in oklab, var(--cl-ink) 10%, transparent), transparent);
  background-size: 42% 1px, 1px 38%;
  background-position:
    calc(46% + var(--px, 0) * 7%) calc(44% + var(--py, 0) * 10%),
    calc(68% + var(--px, 0) * 8%) calc(42% + var(--py, 0) * 8%);
  background-repeat: no-repeat;
  opacity: 0.56;
}
.cl-hero-grid { width: min(1220px, 100%); display: grid; grid-template-columns: minmax(0, 1fr) minmax(360px, 0.78fr); gap: clamp(2rem, 6vw, 5rem); align-items: center; }
.cl-hero-copy { position: relative; z-index: 4; }
.cl-hero-title { font-size: clamp(3rem, 8vw, 8.6rem); line-height: 0.9; letter-spacing: 0; font-weight: 900; max-width: 860px; margin: 0; }
.cl-hero-title span { color: var(--cl-accent); }
.cl-hero-lede { color: var(--cl-muted); max-width: 560px; font-size: clamp(1rem, 1.7vw, 1.2rem); line-height: 1.6; margin: 24px 0 0; }
.cl-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 34px; }
.cl-format-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 26px; }
.cl-format { border: 1px solid var(--cl-line); background: var(--cl-panel); color: var(--cl-muted); border-radius: 6px; padding: 5px 8px; font: 800 11px var(--sc-font-mono); }
.cl-format:nth-child(1) { color: var(--cl-accent); }
.cl-format:nth-child(2) { color: var(--cl-blue); }
.cl-format:nth-child(3) { color: var(--cl-good); }
.cl-format:nth-child(4) { color: var(--cl-violet); }
.cl-document-space { min-height: 600px; position: relative; transform-style: preserve-3d; }
.cl-document-space::before {
  content: "";
  position: absolute;
  inset: 14% 2% 8%;
  border: 1px solid var(--cl-line);
  border-radius: 50%;
  transform: rotateX(68deg) rotateZ(calc(var(--px, 0) * 8deg));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--cl-accent) 18%, transparent);
  opacity: 0.72;
}
.cl-document-space::after {
  content: "";
  position: absolute;
  left: 12%;
  right: 6%;
  top: 50%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cl-line-strong), var(--cl-accent), transparent);
  transform: translateY(-50%) rotate(-10deg);
  opacity: 0.76;
}
.cl-orbit { position: absolute; inset: -10% -12%; transform-style: preserve-3d; transform: rotateX(calc(var(--py, 0) * -8deg)) rotateY(calc(var(--px, 0) * 10deg)); transition: transform 120ms linear; }
.cl-float-doc {
  position: absolute;
  pointer-events: none;
  width: var(--w, 142px);
  min-height: var(--h, 188px);
  padding: 12px;
  border: 1px solid var(--cl-line);
  border-radius: 8px;
  background: var(--cl-panel);
  box-shadow: var(--cl-shadow);
  transform: translate3d(var(--repel-x, 0px), var(--repel-y, 0px), 0)
    translate3d(calc(var(--px, 0) * var(--mx, 0px)), calc(var(--py, 0) * var(--my, 0px)), var(--depth, 0px))
    rotateZ(var(--r, 0deg));
  --repel-x: 0px;
  --repel-y: 0px;
  will-change: transform;
  transition: --repel-x 320ms cubic-bezier(0.2, 0.8, 0.2, 1), --repel-y 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
  animation: cl-drift var(--dur, 11s) ease-in-out infinite alternate;
}
.cl-float-doc::before { content: ""; display: block; height: 9px; width: 42%; border-radius: 99px; background: currentColor; opacity: 0.52; margin-bottom: 14px; }
.cl-float-doc::after { content: ""; display: block; height: 52px; margin-top: 16px; border: 1px solid var(--cl-line); border-radius: 5px; background: linear-gradient(135deg, transparent 42%, currentColor 43% 46%, transparent 47%); opacity: 0.28; }
.cl-float-doc small { display: block; color: currentColor; font: 850 11px var(--sc-font-mono); letter-spacing: 0.06em; }
.cl-float-doc i { display: block; height: 1px; background: var(--cl-line-strong); margin: 8px 0; opacity: 0.85; }
.doc-a { left: 3%; top: 9%; color: var(--cl-accent); --w: 132px; --h: 180px; --r: -9deg; --mx: -26px; --my: 16px; --depth: -80px; --dur: 12s; }
.doc-b { right: 8%; top: 4%; color: var(--cl-blue); --w: 168px; --h: 122px; --r: 7deg; --mx: 18px; --my: -18px; --depth: 60px; --dur: 10s; }
.doc-c { left: 0; bottom: 13%; color: var(--cl-good); --w: 178px; --h: 126px; --r: 6deg; --mx: 30px; --my: 8px; --depth: -30px; --dur: 13s; }
.doc-d { right: 0; bottom: 5%; color: var(--cl-violet); --w: 136px; --h: 184px; --r: -5deg; --mx: -22px; --my: 24px; --depth: -120px; --dur: 11s; }
.doc-e { right: 32%; top: 36%; color: var(--cl-muted); --w: 110px; --h: 150px; --r: 13deg; --mx: 14px; --my: -16px; --depth: -180px; --dur: 14s; opacity: 0.62; }
.doc-f { left: 30%; top: -2%; color: var(--cl-good); --w: 116px; --h: 86px; --r: -2deg; --mx: -12px; --my: -18px; --depth: 90px; --dur: 9s; }
.doc-g { left: 39%; bottom: -2%; color: var(--cl-blue); --w: 138px; --h: 92px; --r: 4deg; --mx: 20px; --my: 12px; --depth: 120px; --dur: 12s; }
.doc-h { right: 18%; bottom: 29%; color: var(--cl-accent); --w: 98px; --h: 128px; --r: -14deg; --mx: -16px; --my: 22px; --depth: -70px; --dur: 10s; opacity: 0.72; }
@keyframes cl-drift { from { translate: 0 -8px; } to { translate: 0 10px; } }
.cl-signal {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--cl-line);
  border-radius: 999px;
  background: var(--cl-panel);
  color: var(--cl-muted);
  padding: 6px 9px;
  font: 800 10px var(--sc-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 10px 32px rgba(0,0,0,.12);
  transform: translate3d(calc(var(--px, 0) * var(--mx, 0px)), calc(var(--py, 0) * var(--my, 0px)), 0);
}
.signal-a { right: 11%; top: 28%; --mx: -18px; --my: 12px; }
.signal-b { left: 14%; top: 43%; --mx: 20px; --my: -12px; }
.signal-c { right: 25%; bottom: 18%; --mx: 14px; --my: 18px; }
.cl-signal::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--cl-accent); box-shadow: 0 0 0 5px var(--cl-accent-soft); }
.cl-protagonist {
  position: absolute;
  inset: 50% auto auto 50%;
  width: min(360px, 78vw);
  transform: translate(-50%, -50%) rotateX(8deg) rotateY(calc(var(--px, 0) * -8deg));
  border: 1px solid var(--cl-line-strong);
  border-radius: 10px;
  background: var(--cl-panel-strong);
  box-shadow: var(--cl-shadow);
  overflow: hidden;
}
.cl-doc-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; border-bottom: 1px solid var(--cl-line); }
.cl-file-name { min-width: 0; }
.cl-file-name b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px; }
.cl-file-name span, .cl-meta-label { color: var(--cl-muted); font: 750 10px var(--sc-font-mono); text-transform: uppercase; letter-spacing: 0.1em; }
.cl-file-badge { border: 1px solid var(--cl-accent); color: var(--cl-accent); border-radius: 6px; padding: 5px 7px; font: 850 11px var(--sc-font-mono); }
.cl-doc-body { padding: 18px; }
.cl-lines { display: grid; gap: 9px; margin-bottom: 18px; }
.cl-lines span { height: 7px; border-radius: 99px; background: color-mix(in oklab, var(--cl-ink) 16%, transparent); }
.cl-lines span:nth-child(2) { width: 76%; }
.cl-lines span:nth-child(3) { width: 56%; }
.cl-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.cl-meta { border: 1px solid var(--cl-line); border-radius: 7px; padding: 10px; background: color-mix(in oklab, var(--cl-panel) 76%, transparent); }
.cl-meta strong { display: block; margin-top: 4px; font: 850 18px var(--sc-font-display); color: var(--cl-ink); }
.cl-cost-strip { margin-top: 14px; border-radius: 8px; background: var(--cl-accent); color: #fff; padding: 14px; display: flex; align-items: end; justify-content: space-between; }
.cl-cost-strip strong { font-size: 30px; line-height: 1; }
.cl-scroll-hint { position: absolute; left: 50%; bottom: 22px; translate: -50% 0; color: var(--cl-muted); display: grid; place-items: center; gap: 6px; font: 700 11px var(--sc-font-mono); letter-spacing: 0.1em; text-transform: uppercase; }
.cl-pinned { position: relative; }
.cl-stage-content { min-height: 100svh; display: grid; place-items: center; padding: 82px clamp(1rem, 4vw, 4rem) 42px; overflow: hidden; box-sizing: border-box; }
.cl-stage-inner { width: min(1180px, 100%); display: grid; grid-template-columns: 0.86fr 1.14fr; gap: clamp(2rem, 6vw, 5rem); align-items: center; }
.cl-stage-copy { z-index: 3; }
.cl-stage-copy h2 { margin: 12px 0 0; font-size: clamp(2.4rem, 5vw, 5.8rem); line-height: 0.95; letter-spacing: 0; }
.cl-stage-copy p { color: var(--cl-muted); max-width: 520px; line-height: 1.55; }
.cl-problem-visual { position: relative; min-height: 520px; }
.cl-question-stack { position: absolute; inset: 8% auto auto 0; display: grid; gap: 14px; width: min(360px, 88vw); z-index: 3; }
.cl-question { border-left: 2px solid var(--cl-line-strong); padding: 14px 0 14px 18px; color: var(--cl-muted); font-size: clamp(1.25rem, 2.8vw, 2.6rem); line-height: 1.05; font-weight: 800; background: linear-gradient(90deg, color-mix(in oklab, var(--cl-bg) 92%, transparent), transparent); }
.cl-problem-sheet {
  position: absolute;
  right: 7%;
  top: 11%;
  width: min(330px, 72vw);
  min-height: 420px;
  border: 1px solid var(--cl-line-strong);
  border-radius: 9px;
  background: var(--cl-panel-strong);
  box-shadow: var(--cl-shadow);
  transform: rotate(calc(-5deg + var(--sc-p, 0) * 7deg)) translateY(calc((0.5 - var(--sc-p, 0)) * 42px));
}
.cl-paper-stack { position: absolute; right: 0; bottom: 5%; width: 210px; height: 150px; transform: translateX(calc(var(--sc-p, 0) * -34px)); }
.cl-paper-stack span { position: absolute; inset: auto 0 0; height: 98px; border: 1px solid var(--cl-line); border-radius: 7px; background: var(--cl-panel); box-shadow: 0 10px 26px rgba(0,0,0,.08); transform: translateY(calc(var(--i) * -16px)) rotate(calc(var(--i) * -1deg)); }
.cl-receipt { position: absolute; left: 12%; bottom: 9%; width: 210px; border: 1px dashed var(--cl-line-strong); border-radius: 7px; background: var(--cl-panel); padding: 16px; font-family: var(--sc-font-mono); transform: rotate(-4deg); }
.cl-receipt div { display: flex; justify-content: space-between; gap: 14px; padding: 7px 0; border-bottom: 1px solid var(--cl-line); color: var(--cl-muted); font-size: 11px; }
.cl-receipt strong { color: var(--cl-accent); font-size: 24px; }
.cl-settle { margin-top: 26px; display: inline-flex; align-items: center; gap: 9px; color: var(--cl-ink); font-weight: 800; }
.cl-solution-field { position: relative; min-height: 470px; display: grid; place-items: center; }
.cl-capability-ring { position: relative; width: min(540px, 92vw); aspect-ratio: 1; border: 1px solid var(--cl-line); border-radius: 50%; }
.cl-capability-ring::before, .cl-capability-ring::after { content: ""; position: absolute; inset: 13%; border: 1px solid var(--cl-line); border-radius: 50%; }
.cl-capability-ring::after { inset: 29%; border-color: var(--cl-line-strong); }
.cl-core-doc { position: absolute; inset: 50% auto auto 50%; translate: -50% -50%; width: 210px; border: 1px solid var(--cl-line-strong); border-radius: 9px; background: var(--cl-panel-strong); box-shadow: var(--cl-shadow); padding: 18px; z-index: 2; }
.cl-core-doc strong { display: block; font-size: 24px; margin-top: 10px; }
.cl-node { position: absolute; display: flex; align-items: center; gap: 8px; border: 1px solid var(--cl-line); border-radius: 7px; background: var(--cl-panel-strong); padding: 10px 12px; font: 800 12px var(--sc-font-mono); color: var(--cl-ink); box-shadow: 0 12px 36px rgba(0,0,0,.1); }
.node-1 { left: 50%; top: -3%; translate: -50% 0; }
.node-2 { right: -6%; top: 28%; }
.node-3 { right: 6%; bottom: 10%; }
.node-4 { left: 5%; bottom: 10%; }
.node-5 { left: -7%; top: 28%; }
.cl-capability-list { display: grid; gap: 14px; margin-top: 30px; }
.cl-capability-list div { border-top: 1px solid var(--cl-line); padding-top: 14px; display: grid; grid-template-columns: 150px 1fr; gap: 18px; }
.cl-capability-list b { color: var(--cl-ink); }
.cl-capability-list span { color: var(--cl-muted); }
.cl-pipeline { display: grid; gap: 0; margin-top: 54px; border-top: 1px solid var(--cl-line); border-bottom: 1px solid var(--cl-line); }
.cl-pipe-step { display: grid; grid-template-columns: 92px 1fr minmax(220px, 0.58fr); gap: 24px; align-items: center; padding: clamp(1rem, 3vw, 1.8rem) 0; border-top: 1px solid var(--cl-line); }
.cl-pipe-step:first-child { border-top: 0; }
.cl-pipe-step em { color: var(--cl-accent); font: normal 850 13px var(--sc-font-mono); }
.cl-pipe-step h3 { margin: 0; font-size: clamp(1.5rem, 3vw, 3rem); letter-spacing: 0; }
.cl-pipe-step p { margin: 0; color: var(--cl-muted); line-height: 1.5; }
.cl-pipe-chip { justify-self: end; border: 1px solid var(--cl-line); background: var(--cl-panel); border-radius: 7px; padding: 10px 12px; color: var(--cl-muted); font: 750 12px var(--sc-font-mono); }
.cl-print-peak { min-height: 100svh; display: grid; place-items: center; padding: 76px clamp(1rem, 4vw, 4rem); overflow: hidden; }
.cl-print-peak::before { content: ""; position: absolute; inset: 10% 6%; background: radial-gradient(circle at 50% 50%, var(--cl-accent-soft), transparent 64%); opacity: calc(0.35 + var(--sc-p, 0) * 0.6); }
.cl-print-grid { position: relative; width: min(1120px, 100%); display: grid; grid-template-columns: 0.9fr 1.1fr; gap: clamp(2rem, 7vw, 5rem); align-items: center; }
.cl-equation { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.cl-eq-box { min-height: 152px; border: 1px solid var(--cl-line); border-radius: 8px; background: var(--cl-panel); padding: 18px; display: grid; align-content: end; transform: translateY(calc((1 - var(--sc-p, 0)) * 18px)); }
.cl-eq-box small { color: var(--cl-muted); font: 800 11px var(--sc-font-mono); letter-spacing: 0.08em; text-transform: uppercase; }
.cl-eq-box strong { display: block; margin-top: 8px; font-size: clamp(2.4rem, 6vw, 5rem); line-height: 0.9; color: var(--cl-ink); }
.cl-eq-box.cl-total { grid-column: 1 / -1; min-height: 190px; border-color: var(--cl-accent); background: linear-gradient(135deg, var(--cl-accent-soft), var(--cl-panel-strong)); }
.cl-eq-box.cl-total strong { color: var(--cl-accent); font-size: clamp(4rem, 10vw, 9rem); }
.cl-sheet-visual { position: relative; height: min(430px, 62vw); perspective: 1200px; }
.cl-sheet-visual span { position: absolute; left: 50%; top: 50%; width: 210px; height: 288px; border: 1px solid var(--cl-line-strong); border-radius: 8px; background: var(--cl-panel-strong); box-shadow: var(--cl-shadow); transform: translate(-50%, -50%) rotate(calc((var(--i) - 3) * 7deg * var(--sc-p, 0))) translateX(calc((var(--i) - 3) * 36px * var(--sc-p, 0))) translateY(calc((var(--i) - 3) * -10px * var(--sc-p, 0))); padding: 16px; display: flex; flex-direction: column; gap: 8px; overflow: hidden; z-index: calc(10 - var(--i, 0)); opacity: calc(0.4 + 0.6 * var(--sc-p, 0)); }
.cl-sheet-visual span:nth-child(odd) { background: color-mix(in oklab, var(--cl-panel-strong) 80%, var(--cl-accent-soft)); }
.cl-sheet-head { display: flex; align-items: center; justify-content: space-between; font: 850 11px var(--sc-font-mono); color: var(--cl-ink); letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid var(--cl-line-strong); padding-bottom: 8px; }
.cl-sheet-head b { color: var(--cl-accent); font-weight: 850; }
.cl-sheet-line { height: 6px; border-radius: 99px; background: color-mix(in oklab, var(--cl-ink) 52%, transparent); }
.cl-sheet-line.short { width: 60%; }
.cl-sheet-line.tiny { width: 38%; }
.cl-sheet-line.accent { background: var(--cl-accent); opacity: 0.95; width: 70%; height: 6px; }
.cl-sheet-block { height: 30px; border: 1px solid var(--cl-line-strong); border-radius: 5px; background: linear-gradient(135deg, color-mix(in oklab, var(--cl-ink) 32%, transparent), color-mix(in oklab, var(--cl-accent) 22%, transparent) 60%, transparent); margin-top: 4px; }
.cl-sheet-foot { margin-top: auto; padding-top: 8px; border-top: 1px solid var(--cl-line); display: flex; align-items: center; justify-content: space-between; font: 800 9px var(--sc-font-mono); color: var(--cl-ink); letter-spacing: 0.12em; text-transform: uppercase; }
.cl-action { display: grid; grid-template-columns: 1fr 0.9fr; gap: clamp(2rem, 7vw, 5rem); align-items: center; }
.cl-action-rail { position: relative; min-height: 430px; }
.cl-action-card { position: absolute; border: 1px solid var(--cl-line); background: var(--cl-panel-strong); border-radius: 8px; padding: 14px; box-shadow: var(--cl-shadow); width: min(270px, 72vw); }
.cl-action-card h3 { margin: 10px 0 4px; font-size: 20px; }
.cl-action-card p { margin: 0; color: var(--cl-muted); font-size: 13px; line-height: 1.45; }
.card-upload { left: 4%; top: 0; }
.card-analysis { right: 4%; top: 16%; }
.card-library { left: 0; bottom: 18%; }
.card-share { right: 2%; bottom: 0; }
.cl-community-panel { margin-top: 46px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: stretch; }
.cl-message { border: 1px solid var(--cl-line); background: var(--cl-panel); border-radius: 8px; padding: 18px; }
.cl-message small { color: var(--cl-muted); font: 800 11px var(--sc-font-mono); text-transform: uppercase; letter-spacing: 0.1em; }
.cl-message p { margin: 10px 0 0; font-size: clamp(1.3rem, 2.8vw, 2.4rem); line-height: 1.08; font-weight: 800; color: var(--cl-ink); }
.cl-final { min-height: 100svh; display: grid; place-items: center; padding: 76px clamp(1rem, 4vw, 4rem) 32px; text-align: center; }
.cl-final-card { width: min(620px, 100%); margin: 0 auto 38px; border: 1px solid var(--cl-line-strong); border-radius: 10px; background: var(--cl-panel-strong); box-shadow: var(--cl-shadow); padding: clamp(1rem, 4vw, 2rem); text-align: left; }
.cl-final-card .cl-meta-grid { grid-template-columns: repeat(4, 1fr); }
.cl-final h2 { margin: 0; font-size: clamp(2.7rem, 7vw, 7rem); line-height: 0.92; letter-spacing: 0; }
.cl-final p { margin: 20px auto 0; max-width: 620px; color: var(--cl-muted); }
.cl-footer { border-top: 1px solid var(--cl-line); margin-top: 70px; padding-top: 24px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--cl-muted); font: 700 12px var(--sc-font-mono); }
@media (max-width: 920px) {
  .cl-nav { inset: 10px 10px auto; }
  .cl-nav-links, .cl-nav-actions .cl-link, .cl-nav-actions .cl-button:not(.cl-button--primary) { display: none; }
  .cl-menu-button { display: inline-grid; place-items: center; }
  .cl-mobile-menu { display: grid; gap: 8px; position: fixed; z-index: 90; inset: 66px 10px auto; border: 1px solid var(--cl-line); background: var(--cl-panel-strong); backdrop-filter: blur(18px); border-radius: 8px; padding: 12px; box-shadow: var(--cl-shadow); }
  .cl-mobile-menu a, .cl-mobile-menu button { justify-content: flex-start; }
  .cl-hero { padding-top: 92px; align-items: start; }
  .cl-hero-grid, .cl-stage-inner, .cl-print-grid, .cl-action { grid-template-columns: 1fr; }
  .cl-hero-grid { gap: 1.6rem; }
  .cl-document-space { min-height: 360px; }
  .doc-b, .doc-c, .doc-d, .doc-e, .doc-f, .doc-g, .doc-h { display: none; }
  .doc-a, .doc-b { display: block; transform: translate3d(0,0,0) translate3d(calc(var(--px, 0) * var(--mx, 0px)), calc(var(--py, 0) * var(--my, 0px)), var(--depth, 0px)) rotateZ(var(--r)) translate3d(var(--repel-x, 0px), var(--repel-y, 0px), 0); scale: 0.78; opacity: 0.72; }
  .cl-protagonist { width: min(312px, 82vw); }
  .cl-stage-content { min-height: 100svh; align-items: start; padding-top: 86px; }
  .cl-problem-visual { min-height: 420px; }
  .cl-question-stack { position: relative; width: 100%; inset: auto; }
  .cl-question { font-size: clamp(1.25rem, 7vw, 2.3rem); background: transparent; }
  .cl-problem-sheet { right: 0; top: 42%; width: min(280px, 66vw); min-height: 310px; opacity: 0.78; }
  .cl-receipt { left: 0; bottom: 2%; scale: 0.86; transform-origin: left bottom; }
  .cl-capability-list div, .cl-pipe-step { grid-template-columns: 1fr; gap: 8px; }
  .cl-pipe-chip { justify-self: start; }
  .cl-equation { grid-template-columns: 1fr; }
  .cl-sheet-visual { height: 330px; order: -1; }
  .cl-sheet-visual span { width: 132px; height: 188px; }
  .cl-action-rail { min-height: auto; }
  .cl-action-card { position: relative; inset: auto; width: 100%; margin-bottom: 12px; }
  .cl-community-panel { grid-template-columns: 1fr; }
  .cl-final-card .cl-meta-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .cl-title, .cl-hero-title, .cl-stage-copy h2, .cl-final h2 { letter-spacing: 0; }
  .cl-button { width: 100%; }
  .cl-nav-actions .cl-button--primary { display: none; }
  .cl-hero-actions { width: 100%; }
  .cl-hero-title { font-size: clamp(2.65rem, 16vw, 4.4rem); }
  .cl-hero-lede { margin-top: 16px; }
  .cl-document-space { min-height: 300px; }
  .cl-document-space::before { inset: 20% 0 12%; }
  .doc-a, .doc-b { display: none; }
  .cl-signal { display: none; }
  .cl-format-row { max-width: 270px; }
  .cl-protagonist { font-size: 13px; }
  .cl-meta-grid { grid-template-columns: 1fr 1fr; }
  .cl-capability-ring { scale: 0.84; margin: -34px auto; }
  .cl-node { font-size: 10px; padding: 8px; }
  .node-2 { right: -9%; }
  .node-5 { left: -10%; }
  .cl-section { padding-inline: 1rem; }
}
@media (prefers-reduced-motion: reduce) {
  .costly-landing *, .costly-landing *::before, .costly-landing *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  .cl-orbit, .cl-float-doc, .cl-protagonist, .cl-problem-sheet, .cl-eq-box { transform: none !important; }
}
`;

function mountSc(root: HTMLElement) {
  if (typeof window !== "undefined" && window.ScrollCraft) {
    window.ScrollCraft.mount(root, { lerp: 0.16 });
  }
}

function usePointerVars(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const onMove = (event: MouseEvent) => {
      tx = (event.clientX / window.innerWidth - 0.5) * 2;
      ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      root.style.setProperty("--px", x.toFixed(3));
      root.style.setProperty("--py", y.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

function CostlyLogo() {
  return (
    <Link to="/" className="cl-brand" aria-label="COSTTY home">
      <span className="cl-brand-mark">
        <Calculator size={16} />
      </span>
      <span>COSTTY</span>
    </Link>
  );
}

function Navigation() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <header className="cl-nav">
        <CostlyLogo />
        <nav className="cl-nav-links" aria-label="Landing page">
          <a href="#intelligence">Intelligence</a>
          <a href="#cost-engine">Cost Engine</a>
          <a href="#platform">Platform</a>
          <a href="#community">Community</a>
        </nav>
        <div className="cl-nav-actions">
          <ThemeToggle compact />
          <Link className="cl-link" to="/login">Sign In</Link>
          <Link className="cl-button cl-button--primary" to="/register">
            Get Started <ArrowRight size={15} />
          </Link>
          <button className="cl-menu-button" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {open ? (
        <nav className="cl-mobile-menu" aria-label="Mobile landing page">
          <a onClick={close} className="cl-link" href="#intelligence">Intelligence</a>
          <a onClick={close} className="cl-link" href="#cost-engine">Cost Engine</a>
          <a onClick={close} className="cl-link" href="#platform">Platform</a>
          <a onClick={close} className="cl-link" href="#community">Community</a>
          <Link onClick={close} className="cl-link" to="/login">Sign In</Link>
          <Link onClick={close} className="cl-button cl-button--primary" to="/register">Get Started</Link>
        </nav>
      ) : null}
    </>
  );
}

function FloatingDocument({
  className,
  label,
  mouseX,
  mouseY,
}: {
  className: string;
  label: string;
  mouseX: number;
  mouseY: number;
}) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    if (mouseX < -100) {
      el.style.setProperty("--repel-x", "0px");
      el.style.setProperty("--repel-y", "0px");
      return;
    }

    const rafId = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 240;
      const strength = Math.max(0, 1 - dist / maxDist);
      el.style.setProperty("--repel-x", `${-dx * strength * 0.4}px`);
      el.style.setProperty("--repel-y", `${-dy * strength * 0.4}px`);
    });
    return () => cancelAnimationFrame(rafId);
  }, [mouseX, mouseY]);

  return (
    <div ref={elRef} className={`cl-float-doc ${className}`} aria-hidden="true">
      <small>{label}</small>
      <i />
      <i />
      <i />
    </div>
  );
}

function ProtagonistDocument({ compact = false }: { compact?: boolean }) {
  const sample = calculateEstimate({ pageCount: 142, copies: 1, colorMode: "bw", sidedness: "duplex" });
  return (
    <div className="cl-protagonist" data-sc-tilt="4">
      <div className="cl-doc-head">
        <div className="cl-file-name">
          <span>{compact ? "Document" : "Unknown file resolved"}</span>
          <b>semester_notes.pdf</b>
        </div>
        <span className="cl-file-badge">PDF</span>
      </div>
      <div className="cl-doc-body">
        <div className="cl-lines">
          <span />
          <span />
          <span />
        </div>
        <div className="cl-meta-grid">
          <div className="cl-meta">
            <span className="cl-meta-label">Pages</span>
            <strong>142</strong>
          </div>
          <div className="cl-meta">
            <span className="cl-meta-label">Mode</span>
            <strong>B&amp;W</strong>
          </div>
          <div className="cl-meta">
            <span className="cl-meta-label">Sides</span>
            <strong>{sample.totalPrintedSides}</strong>
          </div>
          <div className="cl-meta">
            <span className="cl-meta-label">Sheets</span>
            <strong>{sample.totalPhysicalSheets}</strong>
          </div>
        </div>
        <div className="cl-cost-strip">
          <span className="cl-meta-label">Estimated cost</span>
          <strong>{formatPaise(sample.totalPaise)}</strong>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [mouseX, setMouseX] = useState(-9999);
  const [mouseY, setMouseY] = useState(-9999);

  const docDefs = [
    { cls: "doc-a", label: "PDF" },
    { cls: "doc-b", label: "DOCX" },
    { cls: "doc-c", label: "XLSX" },
    { cls: "doc-d", label: "PPTX" },
    { cls: "doc-e", label: "META" },
  ];

  return (
    <section className="cl-hero" data-sc-act="flow" data-sc-drift="#10131c">
      <div className="cl-hero-grid">
        <div className="cl-hero-copy">
          <p className="cl-kicker" data-sc-in>COSTTY document intelligence</p>
          <h1 className="cl-hero-title" data-sc-in>
            Know what you&apos;re printing <span>before</span> you print it.
          </h1>
          <p className="cl-hero-lede" data-sc-in>
            A document enters as a file. COSTTY turns it into type, metadata, page count, print configuration, cost,
            library context, and a shareable path forward.
          </p>
          <div className="cl-hero-actions" data-sc-in>
            <Link className="cl-button cl-button--primary" to="/register">
              Start Estimating <ArrowRight size={17} />
            </Link>
            <Link className="cl-button" to="/login">
              Sign In
            </Link>
          </div>
          <div className="cl-format-row" aria-label="Supported document formats" data-sc-in>
            {["PDF", "DOCX", "XLSX", "PPTX"].map((format) => <span className="cl-format" key={format}>{format}</span>)}
          </div>
        </div>
        <div
          className="cl-document-space"
          aria-hidden="true"
          onMouseMove={(e) => { setMouseX(e.clientX); setMouseY(e.clientY); }}
          onMouseLeave={() => { setMouseX(-9999); setMouseY(-9999); }}
        >
          <div className="cl-orbit">
            {docDefs.map(({ cls, label }) => (
              <FloatingDocument key={cls} className={cls} label={label} mouseX={mouseX} mouseY={mouseY} />
            ))}
          </div>
          <ProtagonistDocument />
        </div>
      </div>
      <div className="cl-scroll-hint">
        <span>Scroll the document</span>
        <ChevronDown size={16} />
      </div>
    </section>
  );
}

function ProblemStory() {
  return (
    <section id="problem" className="cl-pinned" data-sc-act="pin" data-sc-span="3" data-sc-dwell="0.18">
      <div className="sc-stage cl-stage-content">
        <div className="cl-stage-inner">
          <div className="cl-stage-copy">
            <p className="cl-kicker" data-sc-cue="0.02 0.22">The problem</p>
            <h2 data-sc-cue="0.05 0.48">A print job should not begin with uncertainty.</h2>
            <p data-sc-cue="0.22 0.72">
              Before the first page comes out, people are already guessing. Pages, copies, color mode, sidedness,
              physical sheets, total price. Small unknowns become an expensive surprise.
            </p>
            <span className="cl-settle" data-sc-cue="0.72 0.95">
              <CheckCircle2 size={18} /> There has to be a better way.
            </span>
          </div>
          <div className="cl-problem-visual" aria-hidden="true">
            <div className="cl-question-stack">
              <div className="cl-question" data-sc-cue="0.06 0.22">How many pages?</div>
              <div className="cl-question" data-sc-cue="0.22 0.4">Color or B&amp;W?</div>
              <div className="cl-question" data-sc-cue="0.38 0.58">Simplex or duplex?</div>
              <div className="cl-question" data-sc-cue="0.56 0.8">Is this the right price?</div>
            </div>
            <div className="cl-problem-sheet">
              <div className="cl-doc-head">
                <div className="cl-file-name">
                  <span>Unpriced document</span>
                  <b>notes_final.pdf</b>
                </div>
                <span className="cl-file-badge">?</span>
              </div>
              <div className="cl-doc-body">
                <div className="cl-lines"><span /><span /><span /></div>
                <div className="cl-meta-grid">
                  <div className="cl-meta"><span className="cl-meta-label">Pages</span><strong>?</strong></div>
                  <div className="cl-meta"><span className="cl-meta-label">Cost</span><strong>?</strong></div>
                </div>
              </div>
            </div>
            <div className="cl-paper-stack">
              {[0, 1, 2, 3].map((i) => <span key={i} style={{ "--i": i } as React.CSSProperties} />)}
            </div>
            <div className="cl-receipt">
              <div><span>Pages</span><span>unknown</span></div>
              <div><span>Rate</span><span>unclear</span></div>
              <div><span>Sides</span><span>maybe</span></div>
              <strong>₹ ?</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatCostlyDoes() {
  const capabilities = [
    ["Document Intelligence", "Identify formats, infer metadata, count pages, and classify documents."],
    ["Print Cost Engine", "Pages x copies x selected mode x rate per printed side."],
    ["File Management", "Upload, organize, search, download, rename, and delete documents."],
    ["File Sharing", "Share documents through permissioned links with expiration."],
    ["Community", "Request files, offer relevant documents, and fulfill requests."],
  ];
  return (
    <section id="intelligence" className="cl-section" data-sc-act="flow">
      <div className="cl-wrap">
        <p className="cl-kicker" data-sc-in>What COSTTY does</p>
        <h2 className="cl-title" data-sc-in>The same document, now understood.</h2>
        <p className="cl-subtitle" data-sc-in>
          COSTTY is not a stack of separate tools. It is one path from upload to confidence: understand the file,
          price the print, manage the document, share it, and discover what others can provide.
        </p>
        <div className="cl-stage-inner">
          <div className="cl-solution-field" data-sc-in>
            <div className="cl-capability-ring" aria-hidden="true">
              <div className="cl-core-doc">
                <FileText color="var(--cl-accent)" />
                <strong>DOCUMENT</strong>
                <span className="cl-meta-label">Intelligence begins here</span>
              </div>
              <span className="cl-node node-1"><Sparkles size={14} /> Identify</span>
              <span className="cl-node node-2"><Calculator size={14} /> Calculate</span>
              <span className="cl-node node-3"><FolderSearch size={14} /> Manage</span>
              <span className="cl-node node-4"><Share2 size={14} /> Share</span>
              <span className="cl-node node-5"><Users size={14} /> Discover</span>
            </div>
          </div>
          <div className="cl-capability-list" data-sc-stagger="70" data-sc-in>
            {capabilities.map(([title, body]) => (
              <div key={title}>
                <b>{title}</b>
                <span>{body}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformPipeline() {
  const steps = [
    ["01", "Upload", "PDF, DOCX, XLSX, and PPTX files enter the platform.", "file type"],
    ["02", "Analyze", "COSTTY reads file size, extension, content type, and document information.", "metadata"],
    ["03", "Classify", "The file is categorized so the library can stay searchable.", "category"],
    ["04", "Calculate", "Print settings become printed sides, physical sheets, and total cost.", "estimate"],
    ["05", "Manage", "Documents remain organized in folders with search and download.", "library"],
    ["06", "Share", "Links can carry permissions and expiration.", "secure link"],
    ["07", "Community", "Requests and offers help documents find the right person.", "fulfilled"],
  ];
  return (
    <section id="platform" className="cl-section" data-sc-act="flow">
      <div className="cl-wrap">
        <p className="cl-kicker" data-sc-in>The platform</p>
        <h2 className="cl-title" data-sc-in>One continuous system after upload.</h2>
        <div className="cl-pipeline" data-sc-stagger="50" data-sc-in>
          {steps.map(([num, title, body, chip]) => (
            <div className="cl-pipe-step" key={num}>
              <em>{num}</em>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
              <span className="cl-pipe-chip">{chip}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrintCostPeak() {
  const result = useMemo(
    () => calculateEstimate({ pageCount: 100, copies: 2, colorMode: "bw", sidedness: "duplex" }),
    []
  );
  return (
    <section id="cost-engine" className="cl-pinned" data-sc-act="pin" data-sc-span="2.7" data-sc-dwell="0.24">
      <div className="sc-stage cl-print-peak">
        <div className="cl-print-grid">
          <div className="cl-stage-copy">
            <p className="cl-kicker" data-sc-cue="0.04 0.22">Print cost transformation</p>
            <h2 data-sc-cue="0.08 0.5">The calculation becomes visible.</h2>
            <p data-sc-cue="0.28 0.78">
              100 pages. 2 copies. B&amp;W. Duplex. The price is based on printed sides, not a hidden duplex discount.
              Duplex changes the sheet count by placing two document pages on two sides of one sheet.
            </p>
            <p data-sc-cue="0.58 0.96">
              Current rates: B&amp;W ₹2.50 per printed side. Color ₹8.00 per printed side.
            </p>
          </div>
          <div>
            <div className="cl-sheet-visual" aria-hidden="true">
              {[
                { head: ["NOTES", "1 / 7"], lines: ["full", "full", "short", "full", "tiny", "full", "short"] },
                { head: ["CHAPTER 1", "2 / 7"], lines: ["full", "accent", "short", "block", "full", "tiny", "short"] },
                { head: ["FIG. 2.1", "3 / 7"], lines: ["block", "full", "short", "full", "tiny", "full", "short"] },
                { head: ["EQUATIONS", "4 / 7"], lines: ["full", "accent", "full", "block", "short", "full", "tiny"] },
                { head: ["DIAGRAM", "5 / 7"], lines: ["block", "block", "full", "short", "full", "tiny", "short"] },
                { head: ["REFS", "6 / 7"], lines: ["full", "short", "full", "short", "full", "short", "tiny"] },
                { head: ["END", "7 / 7"], lines: ["full", "short", "tiny", "full", "block", "short", "accent"] },
              ].map((sheet, i) => (
                <span key={i} style={{ "--i": i } as React.CSSProperties}>
                  <div className="cl-sheet-head">
                    <span>{sheet.head[0]}</span>
                    <b>{sheet.head[1]}</b>
                  </div>
                  {sheet.lines.map((kind, k) => {
                    if (kind === "block") return <div key={k} className="cl-sheet-block" />;
                    return <div key={k} className={`cl-sheet-line ${kind === "short" || kind === "tiny" || kind === "accent" ? kind : ""}`} />;
                  })}
                  <div className="cl-sheet-foot">
                    <span>costly · print preview</span>
                    <span>{sheet.head[1]}</span>
                  </div>
                </span>
              ))}
            </div>
            <div className="cl-equation" data-sc-cue="0.12 0.96">
              <div className="cl-eq-box">
                <small>Document pages</small>
                <strong>{result.pageCount}</strong>
              </div>
              <div className="cl-eq-box">
                <small>Printed sides</small>
                <strong>{result.totalPrintedSides}</strong>
              </div>
              <div className="cl-eq-box">
                <small>Physical sheets</small>
                <strong>{result.totalPhysicalSheets}</strong>
              </div>
              <div className="cl-eq-box cl-total">
                <small>Estimated cost</small>
                <strong>{formatPaise(result.totalPaise)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformAction() {
  return (
    <section id="community" className="cl-section" data-sc-act="flow">
      <div className="cl-wrap">
        <div className="cl-action">
          <div>
            <p className="cl-kicker" data-sc-in>Platform in action</p>
            <h2 className="cl-title" data-sc-in>A file moves through the whole ecosystem.</h2>
            <p className="cl-subtitle" data-sc-in>
              Upload, analysis, classification, estimation, library, sharing, and community are connected around the
              same document. The experience stays coherent because the document stays at the center.
            </p>
            <div className="cl-community-panel" data-sc-in>
              <div className="cl-message">
                <small>Request</small>
                <p>&ldquo;I need Python notes.&rdquo;</p>
              </div>
              <div className="cl-message">
                <small>Offer</small>
                <p>&ldquo;I have them.&rdquo;</p>
              </div>
            </div>
          </div>
          <div className="cl-action-rail" aria-hidden="true" data-sc-stagger="80" data-sc-in>
            <div className="cl-action-card card-upload">
              <Upload color="var(--cl-accent)" />
              <h3>Upload</h3>
              <p>A document enters the workspace.</p>
            </div>
            <div className="cl-action-card card-analysis">
              <Search color="var(--cl-blue)" />
              <h3>Analysis</h3>
              <p>Type, metadata, pages, and category become usable.</p>
            </div>
            <div className="cl-action-card card-library">
              <FileArchive color="var(--cl-good)" />
              <h3>Library</h3>
              <p>The file can be organized, searched, downloaded, or deleted.</p>
            </div>
            <div className="cl-action-card card-share">
              <Send color="var(--cl-violet)" />
              <h3>Shared</h3>
              <p>Permissions and expiration keep sharing intentional.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="cl-final" data-sc-act="flow">
      <div className="cl-wrap">
        <div className="cl-final-card" data-sc-tilt="3" data-sc-in>
          <div className="cl-doc-head">
            <div className="cl-file-name">
              <span>Completely understood</span>
              <b>semester_notes.pdf</b>
            </div>
            <LockKeyhole size={18} color="var(--cl-accent)" />
          </div>
          <div className="cl-doc-body">
            <div className="cl-meta-grid">
              <div className="cl-meta"><span className="cl-meta-label">Type</span><strong>PDF</strong></div>
              <div className="cl-meta"><span className="cl-meta-label">Pages</span><strong>142</strong></div>
              <div className="cl-meta"><span className="cl-meta-label">Mode</span><strong>B&amp;W</strong></div>
              <div className="cl-meta"><span className="cl-meta-label">Sides</span><strong>142</strong></div>
            </div>
            <div className="cl-cost-strip">
              <span className="cl-meta-label">Estimated cost</span>
              <strong>₹355</strong>
            </div>
          </div>
        </div>
        <p className="cl-kicker" data-sc-in>Resolution</p>
        <h2 data-sc-in>Know the real cost before you print.</h2>
        <p data-sc-in>
          Start with one document. Leave with the information, estimate, and confidence to manage it properly.
        </p>
        <div className="cl-hero-actions" style={{ justifyContent: "center" }} data-sc-in>
          <Link className="cl-button cl-button--primary" to="/register">
            Start Estimating <ArrowRight size={17} />
          </Link>
          <Link className="cl-button" to="/login">Sign In</Link>
        </div>
        <footer className="cl-footer">
          <CostlyLogo />
          <span>Document intelligence · Print cost estimation · File sharing · Community</span>
          <span>B&amp;W ₹2.50/side · Color ₹8.00/side</span>
        </footer>
      </div>
    </section>
  );
}

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  usePointerVars(rootRef);

  useEffect(() => {
    if (!rootRef.current) return;
    mountSc(rootRef.current);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <main ref={rootRef} className="costly-landing">
        <div className="cl-noise" aria-hidden="true" />
        <Navigation />
        <Hero />
        <ProblemStory />
        <WhatCostlyDoes />
        <PlatformPipeline />
        <PrintCostPeak />
        <PlatformAction />
        <FinalCTA />
      </main>
    </>
  );
}

export default Landing;
