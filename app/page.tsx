"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

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

// Generates reference number in format: ZVN<YYYY><MM><DD><counter starting from 1000>
function generateRefNo(dateInput?: string, count: number = 0): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const month = String(isNaN(d.getMonth()) ? new Date().getMonth() + 1 : d.getMonth() + 1).padStart(2, "0");
  const day = String(isNaN(d.getDate()) ? new Date().getDate() : d.getDate()).padStart(2, "0");
  const serial = 1000 + count;
  return `ZVN${year}${month}${day}${serial}`;
}

export default function LetterheadPage() {
  const todayStr = new Date().toISOString().split("T")[0];

  // Current active letter state
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [date, setDate] = useState(todayStr);
  const [refNo, setRefNo] = useState(() => generateRefNo(todayStr, 0));
  const [recipient, setRecipient] = useState(
    "The Risk & Compliance Division / Merchant Underwriting\nRazorpay Software Private Limited\nSJR Cyber, 1st Floor, 22 Laskar-Hosur Road,\nAdugodi, Bengaluru, Karnataka – 560030"
  );
  const [subject, setSubject] = useState(
    "Formal Clarification & Undertaking: Operational Architecture (B2B/B2C), Platform as a Service, and Gateway Usage (Ph: 9115233773 | zivicnexus.com)"
  );
  const [bodyText, setBodyText] = useState(
    `Dear Razorpay Compliance Team,

With reference to your communication regarding our merchant account (Phone: 9115233773) and the operational scope of our platform (https://zivicnexus.com), we are pleased to provide this comprehensive declaration detailing our business model, Platform-as-a-Service architecture, and payment gateway utilization.

1. OPERATIONAL ARCHITECTURE: B2B AND B2C MODELS
Zivic Nexus operates as a dual-sided service marketplace and Platform-as-a-Service (PaaS). Our platform accommodates both B2B and B2C engagements through distinct operational pathways:
• How the Platform Functions as B2B:
  (a) Inter-Business Discovery: Corporate entities and enterprises utilize the platform to discover, vet, and contract specialized B2B service providers (e.g., commercial event management, digital marketing, corporate branding, and enterprise IT).
  (b) Web Applications & Digital Solutions: Zivic Nexus directly designs and develops custom websites, web applications, and digital infrastructure for MSMEs and corporate clients.
• How the Platform Functions as B2C:
  Individual retail consumers (seeking wedding planners, personal event coordinators, creative designers, or photographers) interact with our platform through two transparent engagement models:
  - Model A (Direct Vendor Connection): The client freely browses and directly contacts registered individual vendors. In this model, Zivic Nexus charges ZERO platform fees and ZERO commission from the client, and ZERO fee from the vendor. This direct interaction is 100% free of charge.
  - Model B (Managed Direct Fulfillment by Zivic Nexus): A client may opt to assign their inquiry directly to Zivic Nexus. In this managed model, Zivic Nexus takes complete end-to-end contractual responsibility for the quality and delivery of the service, coordinating execution with verified registered vendors in the background. Zivic Nexus provides complete project governance, structured documentation, and statutory Rule 46 GST tax invoices directly to the client, providing consumers with an effortless, fully accountable service experience.
• Platform as a Service (PaaS) & Business Aid Tools:
  For clients, Zivic Nexus is a Platform as a Service with zero platform fees. For registered service providers, the platform acts as an operational hub offering business aid tools—including AI inquiry management, business health diagnostics, client proposal generators, and digital presence tools.

2. MULTI-CATEGORY MARKETPLACE CONVENIENCE
To ensure effortless navigation for our users, Zivic Nexus organizes vendors into distinct service categories (Event Management, Creative Solutions, Web Development, Digital Marketing, etc.). We welcome diverse qualified service providers to participate on the platform. While Event Marketing & Digital Solutions is currently our most active dominating vertical, the underlying business model, fee structure, payment workflows, and compliance procedures remain identical across all categories. The categorization exists solely for client search convenience.

3. TWO-TIER VERIFICATION SYSTEM FOR CLIENTS AND VENDORS
Trust and consumer safety are core to our platform:
• Tier 1 (Mandatory Verification for All Users): Every client and vendor interacting on our platform must be authenticated via dual-factor verification (verified email address and active WhatsApp mobile OTP confirmation).
• Tier 2 (Advanced Identity Verification): We provide an optional, non-mandatory second layer of trust verification for both vendors and clients. Under this tier, identity documents are cross-verified against a live facial photo by platform administrators to award verified trust badges. In strict adherence to data privacy standards (DPDP Act, 2023), identity documents are instantly and permanently purged from our servers immediately following administrative review.

4. MARKET OPPORTUNITY & AI LEAD DISCOVERY WORKFLOW
Regarding the opportunity and lead discovery features available on our platform:
• Nature of Inquiries: Leads pertain strictly to genuine commercial service requirements, such as event planning, web development, and digital marketing contracts.
• Transparent AI + Human Discovery Workflow:
  (a) Contextual Search Query Generation: Our AI analyzes a vendor’s profile, service niche, and business analytics to formulate intelligent search queries for publicly advertised business requirements.
  (b) Public Job Sourcing: Using these targeted queries, the platform scans publicly accessible online channels and open business forums where clients have posted public requests for work.
  (c) Mandatory Human Review & Filtering: Automated search results are never passed directly to vendors. An internal human review team manually examines every identified opportunity to verify authenticity, filter out spam or duplicates, and confirm legitimacy.
  (d) Secure Delivery to Verified Vendors: Only after passing human verification is the opportunity shared with the subscribed, double-verified vendor via secure email/WhatsApp notification.
  (e) Direct Inquiries: In addition, vendors receive direct, authenticated inquiries submitted directly by verified clients on our platform.
• Non-Distribution Assurance: We do not sell, scrape, or distribute telemarketing databases, cold-calling lists, or private personal data to external parties.

5. WEB DESIGN & MANAGED DIGITAL SERVICES
Zivic Nexus operates an in-house digital production division providing custom web development, web application engineering, and managed cloud infrastructure for businesses and entrepreneurs. The Razorpay payment gateway is utilized to collect milestone-based project payments and hosting care plan fees, all backed by official GST tax invoices under GSTIN: 09LQGPS0132J1ZH.

6. PAYMENT GATEWAY UTILIZATION SUMMARY
The payment gateway is deployed strictly for:
(a) Vendor SaaS Subscriptions: Tiered recurring packages (Growth Pro, Premium, Titan, and Elite) granting access to software features, business aid tools, and inquiry management.
(b) Pay-As-You-Go Usage: One-time micro-credits for on-demand AI business analysis and market discovery runs.
(c) Managed Web Design & Digital Services: Project milestone payments for contracted web application development and digital execution.
(Note: As emphasized, direct client-to-vendor inquiries incur zero platform fees or transaction charges.)

7. COMMITMENT TO COMPLIANCE & OPEN COLLABORATION
Zivic Nexus is in an active, dynamic development stage. We hold the utmost respect for Razorpay’s risk governance, compliance mandates, and merchant onboarding guidelines. If your underwriting or compliance team recommends any specific adjustments to our website disclosures, tier nomenclature, or feature presentation, our management team is fully receptive, cooperative, and committed to executing them promptly.

We kindly request you to record this operational declaration and continue our active payment gateway processing.`
  );
  const [includeSignature, setIncludeSignature] = useState(true);
  const [density, setDensity] = useState<"normal" | "compact" | "ultra-compact">("normal");

  // Cloud & UI State
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // Print handler
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 50);
    }
  };

  // Keyboard shortcuts (Ctrl+P for print, Ctrl+S for save)
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
        // If this is a fresh unsaved letter, dynamically update counter based on saved count
        if (!currentId) {
          setRefNo(generateRefNo(date, data.letters.length));
        }
      } else if (!data.success && data.error) {
        setSaveError(data.error);
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

  // Update date and regenerate refNo if new document
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (!currentId) {
      setRefNo(generateRefNo(newDate, savedLetters.length));
    }
  };

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
          category: "GENERAL",
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
      setTimeout(() => setSaveStatus("idle"), 5000);
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
    setRefNo(item.refNo || generateRefNo(item.date, 0));
    setDate(item.date || "");
    setRecipient(item.recipient || "");
    setSubject(item.subject || "");
    setBodyText(item.bodyText || "");
    setIncludeSignature(item.includeSignature !== false);
    setShowHistoryModal(false);
  };

  // Clear to new blank letter with automated ZVN<YYYY><MM><DD><counter>
  const handleNewLetter = () => {
    setCurrentId(null);
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setRefNo(generateRefNo(today, savedLetters.length));
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
        return "text-[9px] leading-[13.5px]";
      case "compact":
        return "text-[10px] leading-[15.5px]";
      default:
        return "text-[11.5px] leading-relaxed";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-3 sm:py-5 px-2 sm:px-4 flex flex-col items-center justify-start print:p-0 print:m-0 print:bg-white print-wrapper overflow-x-hidden">
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
                  Multi-Page A4 Ready
                </span>
              </div>
              <p className="text-slate-400 text-[11px] sm:text-xs">
                {currentId ? (
                  <span className="text-blue-400">Editing saved document in cloud</span>
                ) : (
                  <span>Auto-generated Ref No: <strong className="text-white font-mono">{refNo}</strong></span>
                )}
              </p>
            </div>
          </div>

          {/* Cloud Save Status */}
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-xs text-amber-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving to Cloud...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                ✓ Saved to Firebase
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-xs text-red-400 font-medium max-w-xs truncate" title={saveError || ""}>
                {saveError?.includes("credentials not found") ? "Configure Firebase on Vercel" : saveError}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          {/* Left Actions */}
          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Saved Letters Archive Button */}
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
              <span>Saved Letters ({savedLetters.length})</span>
            </button>

            {/* New Blank Letter */}
            <button
              type="button"
              onClick={handleNewLetter}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            >
              New Blank Letter
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text Size Control */}
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
                Ultra-Fit
              </button>
            </div>

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

      {/* A4 Letterhead Preview Container (Auto-expanding multi-page) */}
      <div className="w-full overflow-x-auto pb-8 custom-scrollbar">
        <div className="flex justify-start sm:justify-center" style={{ minWidth: "210mm" }}>
          {/* Main A4 Document Sheet (Auto height for seamless multi-page pagination) */}
          <main
            className="a4-container relative flex flex-col justify-between bg-white text-slate-900 shadow-2xl font-sans print:shadow-none print:border-none"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            {/* Watermark in center of sheet / repeated on all printed pages */}
            <div className="watermark-container pointer-events-none select-none">
              <div className="relative w-[420px] h-[270px] opacity-[0.06] print:opacity-[0.05]">
                <Image
                  src="/logo_clean.png"
                  alt="ZN Watermark"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 1. TOP SECTION (Header - Stays on Page 1)                                  */}
            {/* ========================================================================= */}
            <section className="letter-header relative w-full z-10 flex flex-col print:break-inside-avoid">
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
            {/* 2. BODY SECTION (Auto Multi-Page Pagination Flow)                         */}
            {/* ========================================================================= */}
            <section className="letter-body relative flex-1 px-8 py-3 z-10 flex flex-col justify-between print:break-inside-auto">
              {/* Form Fields & Content */}
              <div className="relative z-10 flex flex-col">
                {/* Row 1: Strict ZVN<YYYY><MM><DD><counter> Ref. No. & Date */}
                <div className="flex items-center justify-between gap-6 pb-2 print:break-inside-avoid">
                  <div className="flex items-center gap-2 flex-1 max-w-[340px]">
                    <span className="font-bold text-[11px] text-black whitespace-nowrap font-['Montserrat']">
                      Ref. No. :
                    </span>
                    <span className="text-[11px] font-semibold text-slate-900 font-mono tracking-wider select-all px-1 py-0.5">
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
                      onChange={(e) => handleDateChange(e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className="print:hidden flex-1 text-[11px] text-slate-800 border-b border-slate-300 focus:border-[#C0272D] bg-transparent focus:outline-none px-1 py-0.5 font-medium text-right transition-colors"
                    />
                    <span className="hidden print:inline text-[11px] font-medium text-slate-900 text-right">
                      {date}
                    </span>
                  </div>
                </div>

                {/* Row 2: To, & Recipient */}
                <div className="pt-0.5 print:break-inside-avoid">
                  <span className="font-bold text-[11px] text-black font-['Montserrat']">
                    To,
                  </span>
                </div>
                <div className="pt-0.5 pb-1.5 print:break-inside-avoid">
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
                <div className="pt-0.5 pb-1.5 flex items-start gap-2 print:break-inside-avoid">
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

                {/* Main Letter Body Space */}
                <div className="pt-1">
                  {/* Screen Editable Textarea with auto expandable min-height */}
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={18}
                    placeholder="Type your letter content here..."
                    className={`print:hidden w-full min-h-[380px] ${getBodyTypography()} text-slate-800 bg-transparent border border-slate-200 hover:border-slate-300 focus:border-slate-400 rounded-lg p-2 focus:outline-none font-sans resize-y transition-all placeholder:italic placeholder:text-slate-400`}
                  />
                  {/* Print View: Continuous paragraph flow that naturally breaks into Page 2, Page 3 */}
                  <div className={`hidden print:block whitespace-pre-wrap ${getBodyTypography()} text-slate-800 font-sans print:break-words print:break-inside-auto`}>
                    {bodyText}
                  </div>
                </div>
              </div>

            </section>

            {/* ========================================================================= */}
            {/* 3. RUNNING BOTTOM FOOTER (Signature + Stamp + Bottom Banner)              */}
            {/* Fixed at the bottom of EVERY printed page, anchored at bottom on screen   */}
            {/* ========================================================================= */}
            <footer className="letter-running-footer relative w-full z-20 flex flex-col justify-end">
              {/* Sign-off & Proprietor Stamp */}
              <div className="letter-signature px-8 pb-1.5 flex items-end justify-between">
                <div className="text-[10px] text-slate-700 font-medium leading-tight">
                  <p className="font-semibold text-slate-800">Sincerely,</p>
                  <p className="font-bold text-black mt-0.5">For Zivic Nexus</p>
                  <p className="text-[9px] text-slate-500">Authorized Signatory / Proprietor</p>
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

              {/* Official Website Divider & Chevron Banner */}
              <div className="letter-footer relative w-full flex flex-col">
                <div className="px-8 pb-1.5 flex items-center justify-center gap-3">
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
              </div>
            </footer>
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
                  <h2 className="text-white font-bold text-base">Saved Letterheads (Cloud Archive)</h2>
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
