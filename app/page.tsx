"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { TEMPLATES, LetterTemplate } from "@/lib/templates";

interface SavedLetter {
  id: string;
  refNo: string;
  date: string;
  recipient: string;
  subject: string;
  bodyText: string;
  includeSignature: boolean;
  category?: string;
  updatedAt?: string;
  createdAt?: string;
}

export default function LetterheadPage() {
  // Current active letter state
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [refNo, setRefNo] = useState("ZN/COMPL/RZP/2026/10-01");
  const [date, setDate] = useState("2026-10-24");
  const [recipient, setRecipient] = useState(TEMPLATES[0].recipient);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [bodyText, setBodyText] = useState(TEMPLATES[0].bodyText);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [density, setDensity] = useState<"normal" | "compact" | "ultra-compact">("ultra-compact");

  // Cloud & UI State
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [, startTransition] = useTransition();

  // Print handler
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 50);
    }
  };

  // Keyboard shortcuts (Ctrl+P / Cmd+P for print, Ctrl+S / Cmd+S for save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handlePrint();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveToCloud();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentId, refNo, date, recipient, subject, bodyText, includeSignature]);

  // Load saved letters from Firebase
  const fetchSavedLetters = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/letters");
      const data = await res.json();
      if (data.success && Array.isArray(data.letters)) {
        setSavedLetters(data.letters);
      }
    } catch (err) {
      console.error("Failed to load letters from Firebase:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchSavedLetters();
  }, []);

  // Save to Firebase Cloud
  const handleSaveToCloud = async () => {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentId || undefined,
          refNo,
          date,
          recipient,
          subject,
          bodyText,
          includeSignature,
          category: subject.toLowerCase().includes("compliance") ? "COMPLIANCE" : "GENERAL",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("saved");
        if (data.letter?.id) {
          setCurrentId(data.letter.id);
        }
        fetchSavedLetters();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setSaveError(err.message || "Could not save to Firebase");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  // Delete a saved letter from Firebase
  const handleDeleteLetter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved letterhead from Firebase?")) {
      return;
    }
    try {
      const res = await fetch(`/api/letters/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSavedLetters((prev) => prev.filter((l) => l.id !== id));
        if (currentId === id) {
          setCurrentId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete letter:", err);
    }
  };

  // Load a selected letter into editor
  const handleLoadLetter = (item: SavedLetter) => {
    setCurrentId(item.id);
    setRefNo(item.refNo || "");
    setDate(item.date || "");
    setRecipient(item.recipient || "");
    setSubject(item.subject || "");
    setBodyText(item.bodyText || "");
    setIncludeSignature(item.includeSignature !== false);
    // Estimate density based on length
    if ((item.bodyText || "").length > 2500) {
      setDensity("ultra-compact");
    } else if ((item.bodyText || "").length > 1200) {
      setDensity("compact");
    } else {
      setDensity("normal");
    }
    setShowHistoryModal(false);
  };

  // Apply a template
  const handleApplyTemplate = (tpl: LetterTemplate) => {
    setCurrentId(null);
    setRefNo(`${tpl.refNoPrefix}/2026/10-01`);
    setDate(new Date().toISOString().split("T")[0]);
    setRecipient(tpl.recipient);
    setSubject(tpl.subject);
    setBodyText(tpl.bodyText);
    setIncludeSignature(tpl.includeSignature);
    setDensity(tpl.density);
  };

  // Clear to new blank letter
  const handleNewLetter = () => {
    setCurrentId(null);
    setRefNo(`ZN/GEN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}-01`);
    setDate(new Date().toISOString().split("T")[0]);
    setRecipient("");
    setSubject("");
    setBodyText("");
    setIncludeSignature(true);
    setDensity("normal");
  };

  // Filtered letters for history search
  const filteredLetters = savedLetters.filter((item) => {
    const q = historySearch.toLowerCase();
    return (
      (item.refNo || "").toLowerCase().includes(q) ||
      (item.subject || "").toLowerCase().includes(q) ||
      (item.recipient || "").toLowerCase().includes(q)
    );
  });

  // Dynamic typography classes according to density
  const getRecipientTypography = () => {
    switch (density) {
      case "ultra-compact":
        return "text-[9.5px] leading-[14px]";
      case "compact":
        return "text-[10px] leading-[16px]";
      default:
        return "text-[11px] leading-[19px]";
    }
  };

  const getBodyTypography = () => {
    switch (density) {
      case "ultra-compact":
        return "text-[8.5px] leading-[12.5px]";
      case "compact":
        return "text-[10px] leading-[15px]";
      default:
        return "text-[11.5px] leading-relaxed";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center justify-start print:p-0 print:m-0 print:bg-white print-wrapper overflow-x-hidden">
      {/* Top Controls Toolbar (Hidden during print) */}
      <header className="no-print w-full max-w-[210mm] mb-4 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3">
        {/* Top Row: Brand & Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#C0272D] to-[#F7941D] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-900/30 shrink-0">
              ZN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-bold text-sm sm:text-base leading-tight">
                  Zivic Nexus Official Letterhead
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firebase Cloud Active
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs">
                {currentId ? (
                  <span className="text-blue-400">Editing saved letter in Firebase</span>
                ) : (
                  <span>New uncommitted document • Click to edit fields</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Info & Cloud Save Status */}
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-xs text-amber-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving to Firebase...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Saved to Firebase
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-xs text-red-400 font-semibold">
                {saveError || "Save failed"}
              </span>
            )}
          </div>
        </div>

        {/* Middle Row: Templates & Text Size Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Templates Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Template:</span>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {tpl.name}
              </button>
            ))}
          </div>

          {/* Text Density Control (Critical for 1-page A4 fitting) */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] px-1.5 font-medium">Text Size:</span>
            <button
              type="button"
              onClick={() => setDensity("normal")}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                density === "normal"
                  ? "bg-[#C0272D] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                density === "compact"
                  ? "bg-[#C0272D] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setDensity("ultra-compact")}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                density === "ultra-compact"
                  ? "bg-[#C0272D] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Ultra-Fit (Long Letters)
            </button>
          </div>
        </div>

        {/* Bottom Row: Actions (Save, Archive, Sig, New, Print) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            {/* Save to Cloud Button */}
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{currentId ? "Update in Cloud" : "Save to Cloud"}</span>
            </button>

            {/* History / Archive Drawer Button */}
            <button
              type="button"
              onClick={() => {
                fetchSavedLetters();
                setShowHistoryModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Archive ({savedLetters.length})</span>
            </button>

            {/* New Blank Letter */}
            <button
              type="button"
              onClick={handleNewLetter}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              New Blank
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Signature Toggle */}
            <button
              type="button"
              onClick={() => setIncludeSignature(!includeSignature)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                includeSignature
                  ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span>✍️ Sig:</span>
              <span className="font-bold">{includeSignature ? "ON" : "OFF"}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C0272D] via-[#D83A41] to-[#F7941D] hover:from-[#A0181E] hover:to-[#E07D0C] text-white shadow-lg shadow-red-900/40 hover:shadow-red-900/60 transition-all cursor-pointer transform active:scale-95"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* A4 Letterhead Preview Container */}
      <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
        <div className="flex justify-start sm:justify-center" style={{ minWidth: "210mm" }}>
          {/* A4 Sheet (210mm x 297mm) */}
          <main
            className="a4-container relative flex flex-col justify-between overflow-hidden bg-white text-slate-900 shadow-2xl font-sans"
            style={{ width: "210mm", height: "297mm", minHeight: "297mm", maxHeight: "297mm" }}
          >
            {/* ========================================================================= */}
            {/* 1. TOP SECTION (Top Gradient Banner + Header Contact Grid)                */}
            {/* ========================================================================= */}
            <section className="relative w-full z-10 flex flex-col">
              {/* Top Geometric Angular Banner */}
              <div className="relative w-full h-[38px] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 1000 45" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="topMaroonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#550000" />
                      <stop offset="70%" stopColor="#8C1318" />
                      <stop offset="100%" stopColor="#B31D24" />
                    </linearGradient>
                    <linearGradient id="topOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E65100" />
                      <stop offset="50%" stopColor="#F7941D" />
                      <stop offset="100%" stopColor="#FFA726" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,0 820,0 770,45 0,45" fill="url(#topMaroonGrad)" />
                  <polygon points="820,0 870,0 820,45 770,45" fill="#750E12" />
                  <polygon points="870,0 1000,0 1000,45 820,45" fill="url(#topOrangeGrad)" />
                </svg>
              </div>

              {/* Header Content Grid */}
              <div className="pt-3 pb-2 px-8 flex items-stretch justify-between gap-6">
                {/* Left Header Area: Logo + Name + Taglines */}
                <div className="flex-1 flex flex-col justify-between pr-2">
                  <div className="flex items-center gap-4">
                    <div className="relative w-[86px] h-[52px] shrink-0">
                      <Image
                        src="/logo_clean.png"
                        alt="Zivic Nexus Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="relative w-[235px] h-[40px] shrink-0">
                      <Image
                        src="/text_clean.png"
                        alt="Zivic Nexus"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>

                  <div className="mt-2 pl-1.5">
                    <p className="text-[11.5px] font-bold text-[#550C0E] tracking-[0.28em] uppercase font-['Montserrat']">
                      CONNECT &nbsp;·&nbsp; GROW &nbsp;·&nbsp; THRIVE
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 pl-1">
                    <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                    <span className="text-[9.5px] font-black text-[#C0272D] tracking-wider uppercase whitespace-nowrap font-['Montserrat']">
                      DIGITAL PLATFORM FOR BUSINESS GROWTH
                    </span>
                    <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                  </div>
                </div>

                {/* Vertical Red Divider */}
                <div className="w-[1.5px] bg-[#C0272D] shrink-0 self-stretch my-1" />

                {/* Right Header Area: Contact Details */}
                <div className="w-[230px] shrink-0 flex flex-col justify-center gap-1.5 pl-2 font-['Montserrat',sans-serif]">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </div>
                    <div className="text-[9.5px] leading-tight text-slate-800">
                      <p className="font-bold text-[10.5px] text-black tracking-tight">568/390</p>
                      <p className="text-slate-800 font-medium tracking-normal">Om Nagar, Kailashpuri,</p>
                      <p className="text-slate-800 font-medium tracking-normal">Alambagh, Lucknow — 226005</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.053 15.053 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                      </svg>
                    </div>
                    <div className="text-[10px]">
                      <span className="font-bold text-[#C0272D]">Ph: </span>
                      <span className="font-medium text-slate-800">9115233773</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    </div>
                    <div className="text-[10px]">
                      <span className="font-bold text-[#C0272D]">GSTIN: </span>
                      <span className="font-medium text-slate-800">09LQGPS0132J1ZH</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <div className="text-[9.5px]">
                      <span className="font-bold text-[#C0272D]">Email: </span>
                      <span className="font-medium text-slate-800">zivicnexus@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-width Red Separator Line */}
              <div className="w-full h-[2px] bg-[#C0272D]" />
            </section>

            {/* ========================================================================= */}
            {/* 2. BODY SECTION (Form Fields + Watermark + Main Text + Signature)          */}
            {/* ========================================================================= */}
            <section className="relative flex-1 px-8 py-3 z-10 flex flex-col justify-between overflow-hidden">
              {/* Centered Translucent Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <div className="relative w-[420px] h-[270px] opacity-[0.06]">
                  <Image
                    src="/logo_clean.png"
                    alt="ZN Watermark"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Top Form Fields */}
              <div className="relative z-10 flex flex-col">
                {/* Row 1: Ref. No. & Date */}
                <div className="flex items-center justify-between gap-6 pb-2">
                  <div className="flex items-center gap-2 flex-1 max-w-[340px]">
                    <span className="font-bold text-[11px] text-black whitespace-nowrap font-['Montserrat']">
                      Ref. No. :
                    </span>
                    <input
                      type="text"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      placeholder="ZN/COMPL/..."
                      className="print:hidden flex-1 text-[11px] text-slate-800 border-b border-slate-300 focus:border-[#C0272D] bg-transparent focus:outline-none px-1 py-0.5 font-medium transition-colors"
                    />
                    <span className="hidden print:inline text-[11px] font-medium text-slate-900">
                      {refNo}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 w-[220px]">
                    <span className="font-bold text-[11px] text-black whitespace-nowrap font-['Montserrat']">
                      Date :
                    </span>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className="print:hidden flex-1 text-[11px] text-slate-800 border-b border-slate-300 focus:border-[#C0272D] bg-transparent focus:outline-none px-1 py-0.5 font-medium text-right transition-colors"
                    />
                    <span className="hidden print:inline text-[11px] font-medium text-slate-900 text-right">
                      {date}
                    </span>
                  </div>
                </div>

                {/* Row 2: To, & Recipient */}
                <div className="pt-0.5">
                  <span className="font-bold text-[11px] text-black font-['Montserrat']">
                    To,
                  </span>
                </div>
                <div className="pt-0.5 pb-1.5">
                  <textarea
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    rows={density === "ultra-compact" ? 2 : 3}
                    placeholder="Recipient Name, Designation & Address..."
                    className={`print:hidden w-full max-w-[480px] ${getRecipientTypography()} text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 rounded-md p-0.5 focus:outline-none font-medium resize-none transition-all placeholder:italic placeholder:text-slate-400 overflow-hidden`}
                  />
                  <div className={`hidden print:block whitespace-pre-wrap ${getRecipientTypography()} text-slate-800 font-medium`}>
                    {recipient}
                  </div>
                </div>

                {/* Row 3: Subject : */}
                <div className="pt-0.5 pb-1.5 flex items-start gap-2">
                  <span className="font-bold text-[11px] text-black whitespace-nowrap font-['Montserrat'] mt-0.5">
                    Subject :
                  </span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter document subject here..."
                    className="print:hidden flex-1 text-[11px] text-slate-900 border-b border-slate-300 focus:border-[#C0272D] bg-transparent focus:outline-none px-1 py-0.5 font-bold transition-colors placeholder:font-normal placeholder:italic placeholder:text-slate-400"
                  />
                  <span className="hidden print:inline text-[11px] font-bold text-slate-900">
                    {subject}
                  </span>
                </div>

                {/* Main Letter Body */}
                <div className="pt-0.5">
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={density === "ultra-compact" ? 22 : 12}
                    placeholder="Type your letter content here..."
                    className={`print:hidden w-full ${getBodyTypography()} text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 rounded-lg p-1 focus:outline-none font-sans resize-none transition-all placeholder:italic placeholder:text-slate-400 overflow-hidden`}
                  />
                  <div className={`hidden print:block whitespace-pre-wrap ${getBodyTypography()} text-slate-800 font-sans`}>
                    {bodyText}
                  </div>
                </div>
              </div>

              {/* Sign-off Section */}
              <div className="relative z-10 flex items-end justify-between pt-1 pb-0.5">
                <div className="text-[10px] text-slate-600 font-medium">
                  <p>Sincerely,</p>
                  <p className="font-bold text-black mt-0.5">For Zivic Nexus</p>
                </div>

                {includeSignature && (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-[130px] h-[55px] shrink-0">
                      <Image
                        src="/prop_sig_clean.png"
                        alt="Zivic Nexus Proprietor Signature"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ========================================================================= */}
            {/* 3. FOOTER SECTION (Website Banner + Bottom Geometric Banner)              */}
            {/* ========================================================================= */}
            <section className="relative w-full z-10 flex flex-col">
              {/* Website Divider */}
              <div className="px-8 pb-2 flex items-center justify-center gap-3">
                <div className="flex-1 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0272D]" />
                  <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                </div>
                <div className="flex items-center gap-2 px-3">
                  <svg className="w-3.5 h-3.5 text-[#C0272D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                    <path strokeWidth="1.8" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                  <span className="font-bold text-[12px] text-[#C0272D] tracking-wide font-['Montserrat']">
                    www.zivicnexus.com
                  </span>
                </div>
                <div className="flex-1 flex items-center">
                  <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0272D]" />
                </div>
              </div>

              {/* Bottom Geometric Chevron Banner */}
              <div className="relative w-full h-[28px] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 1000 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="footerOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E65100" />
                      <stop offset="50%" stopColor="#F7941D" />
                      <stop offset="100%" stopColor="#FFA726" />
                    </linearGradient>
                    <linearGradient id="footerCenterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#750E12" />
                      <stop offset="50%" stopColor="#B31D24" />
                      <stop offset="100%" stopColor="#750E12" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="1000" height="40" fill="#5A0205" />
                  <polygon points="0,0 150,0 100,40 0,40" fill="url(#footerOrangeGrad)" />
                  <polygon points="140,0 860,0 820,40 90,40" fill="url(#footerCenterGrad)" />
                  <polygon points="850,0 1000,0 1000,40 810,40" fill="url(#footerOrangeGrad)" />
                </svg>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SAVED LETTERS ARCHIVE MODAL (Firebase Firestore)                       */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  📁
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">Saved Letterheads (Firebase)</h2>
                  <p className="text-slate-400 text-xs">Browse, edit, or delete previously generated letters</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by Ref. No., Subject, or Recipient..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Letters List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading letters from Firebase...
                </div>
              ) : filteredLetters.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  {historySearch ? "No letters match your search." : "No letters saved yet in Firebase."}
                </div>
              ) : (
                filteredLetters.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadLetter(item)}
                    className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-3 flex items-start justify-between gap-4 cursor-pointer transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {item.refNo || "No Ref. No."}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.date || "No date"}
                        </span>
                        {item.updatedAt && (
                          <span className="text-[10px] text-slate-500">
                            • updated {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-xs truncate group-hover:text-blue-300 transition-colors">
                        {item.subject || "Untitled Letter"}
                      </h3>
                      <p className="text-slate-400 text-[11px] truncate mt-0.5">
                        To: {item.recipient ? item.recipient.split("\n")[0] : "No recipient"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLetter(item.id, e)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                        title="Delete from Firebase"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <span className="text-slate-500 text-xs">
                Total letters: {savedLetters.length}
              </span>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
