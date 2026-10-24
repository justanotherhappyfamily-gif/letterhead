"use client";

import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TEMPLATES } from "@/lib/templates";

export interface SavedLetter {
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

// Calculate digital root (sum of digits repeatedly until single digit)
function getDigitalRoot(numStr: string): number {
  let sum = numStr.split("").reduce((acc, ch) => acc + (parseInt(ch, 10) || 0), 0);
  while (sum >= 10) {
    sum = String(sum).split("").reduce((acc, ch) => acc + (parseInt(ch, 10) || 0), 0);
  }
  return sum;
}

// Generates encrypted, pseudo-random reference number following mathematical formula:
// Format: ZVN<YYYY><MM><DD><d1d2><CHAR><d3d4> (e.g. ZVN2026102433G28)
function generateEncryptedRefNo(dateInput?: string, timestampInput?: number): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const month = String(isNaN(d.getMonth()) ? new Date().getMonth() + 1 : d.getMonth() + 1).padStart(2, "0");
  const day = String(isNaN(d.getDate()) ? new Date().getDate() : d.getDate()).padStart(2, "0");

  const dateStr = `${year}${month}${day}`;
  const dateNum = parseInt(dateStr, 10);

  const digitalRoot = getDigitalRoot(dateStr);

  const ts = timestampInput !== undefined ? timestampInput : Date.now();
  const last3 = String(ts).slice(-3);
  const ts3 = parseInt(last3, 10) || 123;

  const x = (ts3 / 7) + digitalRoot;
  const product = Math.floor(dateNum * x);
  const last4 = String(product).slice(-4).padStart(4, "0");

  // Non-linear mathematical calculation for uppercase ASCII character (65 to 90 -> 'A' to 'Z')
  const seed = (product * digitalRoot) + (ts3 * 31) + (dateNum % 997);
  const asciiCode = 65 + (Math.abs(Math.floor(seed)) % 26);
  const char = String.fromCharCode(asciiCode);

  // Insert uppercase English character in between the 4 digits (d1 d2 + char + d3 d4)
  const d1d2 = last4.slice(0, 2);
  const d3d4 = last4.slice(2, 4);
  const finalSuffix = `${d1d2}${char}${d3d4}`;

  return `ZVN${dateStr}${finalSuffix}`;
}

// Smart multi-page pagination algorithm
function paginateLetterText(
  bodyText: string,
  density: "normal" | "compact" | "ultra-compact",
  recipientLines: number
): string[] {
  // Capacity per page based on density (in estimated line units)
  let page1Capacity = 36;
  let page2Capacity = 48;
  if (density === "compact") {
    page1Capacity = 44;
    page2Capacity = 60;
  } else if (density === "ultra-compact") {
    page1Capacity = 54;
    page2Capacity = 72;
  }

  // Adjust Page 1 capacity based on recipient lines (default ~3 lines)
  page1Capacity = Math.max(20, Math.floor(page1Capacity - (recipientLines - 3) * 1.2));

  // Helper to estimate line count of a text block
  const estimateLines = (text: string): number => {
    const rawLines = text.split("\n");
    let total = 0;
    for (const line of rawLines) {
      if (line.trim().length === 0) {
        total += 0.5;
      } else {
        // Approximate ~85 characters per line at standard A4 width
        const wrapped = Math.ceil(line.length / 85);
        total += Math.max(1, wrapped);
      }
    }
    return total + 0.6; // paragraph spacing
  };

  // Helper to split an oversized paragraph by individual lines
  const splitLongPara = (para: string, maxCap: number): string[] => {
    const lines = para.split("\n");
    const subChunks: string[] = [];
    let curLines: string[] = [];
    let curCount = 0;

    for (const line of lines) {
      const lineCost = Math.max(1, Math.ceil((line.length || 1) / 85));
      if (curCount + lineCost > maxCap && curLines.length > 0) {
        subChunks.push(curLines.join("\n"));
        curLines = [line];
        curCount = lineCost;
      } else {
        curLines.push(line);
        curCount += lineCost;
      }
    }
    if (curLines.length > 0) subChunks.push(curLines.join("\n"));
    return subChunks.length > 0 ? subChunks : [para];
  };

  // 1. Split body by manual page break markers: ---page-break--- or [pagebreak]
  // We trim trailing empty sections so an accidental break at the very end doesn't spawn an empty page
  const rawSections = bodyText.split(/\s*---page-break---\s*|\s*\[pagebreak\]\s*/i);
  while (rawSections.length > 1 && rawSections[rawSections.length - 1].trim() === "") {
    rawSections.pop();
  }

  const finalPages: string[] = [];

  for (let sIdx = 0; sIdx < rawSections.length; sIdx++) {
    const sectionText = rawSections[sIdx];
    const paragraphs = sectionText.split(/\n\n+/).filter((p) => p.length > 0);

    if (paragraphs.length === 0) {
      if (finalPages.length === 0 || sIdx < rawSections.length - 1) {
        finalPages.push("");
      }
      continue;
    }

    let currentPageParagraphs: string[] = [];
    let currentLines = 0;

    for (const para of paragraphs) {
      const isFirstPage = finalPages.length === 0 && currentPageParagraphs.length === 0;
      const maxCapacity = isFirstPage ? page1Capacity : page2Capacity;
      const paraLines = estimateLines(para);

      if (paraLines > maxCapacity) {
        // If current page already has text, flush it first
        if (currentPageParagraphs.length > 0) {
          finalPages.push(currentPageParagraphs.join("\n\n"));
          currentPageParagraphs = [];
          currentLines = 0;
        }
        // Split this oversized paragraph into fitting pieces
        const subParas = splitLongPara(para, finalPages.length === 0 ? page1Capacity : page2Capacity);
        for (const sub of subParas) {
          const subLines = estimateLines(sub);
          const currentCap = (finalPages.length === 0 && currentPageParagraphs.length === 0) ? page1Capacity : page2Capacity;
          if (currentLines + subLines > currentCap && currentPageParagraphs.length > 0) {
            finalPages.push(currentPageParagraphs.join("\n\n"));
            currentPageParagraphs = [sub];
            currentLines = subLines;
          } else {
            currentPageParagraphs.push(sub);
            currentLines += subLines;
          }
        }
      } else if (currentLines + paraLines > maxCapacity && currentPageParagraphs.length > 0) {
        // Current page is full, push to pages and start new page
        finalPages.push(currentPageParagraphs.join("\n\n"));
        currentPageParagraphs = [para];
        currentLines = paraLines;
      } else {
        currentPageParagraphs.push(para);
        currentLines += paraLines;
      }
    }

    // Flush remaining paragraphs in this manual section
    if (currentPageParagraphs.length > 0) {
      finalPages.push(currentPageParagraphs.join("\n\n"));
    }
  }

  return finalPages.length > 0 ? finalPages : [""];
}

export default function LetterheadPage() {
  const todayStr = new Date().toISOString().split("T")[0];

  // Current active letter state
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [date, setDate] = useState(todayStr);
  const [refNo, setRefNo] = useState(() => generateEncryptedRefNo(todayStr));
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
  const [density, setDensity] = useState<"normal" | "compact" | "ultra-compact">("compact");

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Editor Panel Expansion State
  const [showEditorPanel, setShowEditorPanel] = useState(true);

  // Cloud & UI State
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // Verification Modal State & Handlers
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyQuery, setVerifyQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ found: boolean; letter?: SavedLetter; error?: string } | null>(null);

  // Calculate paginated pages
  const recipientLineCount = recipient.split("\n").filter(Boolean).length;
  const pages = paginateLetterText(bodyText, density, recipientLineCount);
  const totalPages = pages.length;

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVerifyRefNo = async (queryToVerify?: string) => {
    const query = (queryToVerify ?? verifyQuery).trim().toUpperCase();
    if (!query) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`/api/letters/verify?refNo=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        if (data.found && data.letter) {
          setVerifyResult({ found: true, letter: data.letter });
        } else {
          setVerifyResult({ found: false });
        }
      } else {
        setVerifyResult({ found: false, error: data.error || "Verification check failed" });
      }
    } catch (err: any) {
      setVerifyResult({ found: false, error: err.message || "Failed to connect to verification registry" });
    } finally {
      setIsVerifying(false);
    }
  };

  const openVerificationFor = (targetRefNo: string) => {
    setVerifyQuery(targetRefNo);
    setShowVerifyModal(true);
    handleVerifyRefNo(targetRefNo);
  };

  // Check URL query parameters for ?verify=... on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const verifyParam = params.get("verify") || params.get("refNo");
      if (verifyParam) {
        openVerificationFor(verifyParam);
      }
    }
  }, []);

  // Browser Print handler (Ctrl+P or Print Button)
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 50);
    }
  };

  // Direct High-Resolution PDF Download Engine
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pageElements = document.querySelectorAll<HTMLElement>(".letterhead-pdf-page");
      if (!pageElements || pageElements.length === 0) {
        throw new Error("No letterhead pages found to export.");
      }

      // Initialize jsPDF with standard A4 portrait orientation (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        let imgData: string;
        try {
          // Primary engine: html-to-image for pristine vector-grade SVG gradients and crisp fonts
          imgData = await toPng(pageEl, {
            quality: 0.98,
            pixelRatio: 2.5, // 2.5x pixel ratio for 300 DPI razor-sharp print quality
            cacheBust: true,
            backgroundColor: "#ffffff",
            filter: (node) => {
              if (
                node instanceof HTMLElement &&
                (node.classList.contains("no-print") ||
                  node.getAttribute("data-no-export") === "true")
              ) {
                return false;
              }
              return true;
            },
          });
        } catch (captureErr) {
          console.warn("toPng fallback to html2canvas:", captureErr);
          // Fallback engine: html2canvas
          const canvas = await html2canvas(pageEl, {
            scale: 2.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            ignoreElements: (element) =>
              element.classList.contains("no-print") ||
              element.getAttribute("data-no-export") === "true",
          });
          imgData = canvas.toDataURL("image/png");
        }

        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }

        // Draw image edge-to-edge on A4 sheet
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
      }

      const safeRef = (refNo || "Letterhead").replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`${safeRef}_Official_Letterhead.pdf`);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert("Failed to export PDF: " + (err.message || "Unknown error"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Keyboard shortcuts (Ctrl+P for print, Ctrl+S for save, Ctrl+D for PDF download)
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
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        handleDownloadPdf();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentId, refNo, date, recipient, subject, bodyText, includeSignature, density]);

  // Load saved letters from Firebase
  const fetchSavedLetters = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/letters");
      const data = await res.json();
      if (data.success && Array.isArray(data.letters)) {
        setSavedLetters(data.letters);
      } else if (!data.success && data.error) {
        setSaveError(data.error);
      }
    } catch (err) {
      console.error("Failed to load letters from Firebase:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSavedLetters();
  }, []);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (!currentId) {
      setRefNo(generateEncryptedRefNo(newDate));
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
          category: "OFFICIAL_LETTER",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("saved");
        if (data.id) setCurrentId(data.id);
        fetchSavedLetters();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setSaveError(data.error || "Failed to save letter");
      }
    } catch (err: any) {
      setSaveStatus("error");
      setSaveError(err.message || "Network error while saving");
    }
  };

  // Load saved letter from archive into editor
  const handleLoadLetter = (item: SavedLetter) => {
    setCurrentId(item.id);
    setRefNo(item.refNo);
    setDate(item.date);
    setRecipient(item.recipient);
    setSubject(item.subject);
    setBodyText(item.bodyText);
    setIncludeSignature(item.includeSignature ?? true);
    setShowHistoryModal(false);
    setSaveStatus("idle");
  };

  // Delete saved letter from Firebase
  const handleDeleteLetter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved letterhead from the database?")) return;
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

  // Reset to blank letter
  const handleNewLetter = () => {
    const today = new Date().toISOString().split("T")[0];
    setCurrentId(null);
    setDate(today);
    setRefNo(generateEncryptedRefNo(today));
    setRecipient("");
    setSubject("");
    setBodyText("");
    setIncludeSignature(true);
    setSaveStatus("idle");
  };

  // Load predefined template
  const handleSelectTemplate = (templateId: string) => {
    const t = TEMPLATES.find((tpl) => tpl.id === templateId);
    if (!t) return;
    setCurrentId(null);
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setRefNo(generateEncryptedRefNo(today));
    setRecipient(t.recipient);
    setSubject(t.subject);
    setBodyText(t.bodyText);
    setIncludeSignature(t.includeSignature);
    setDensity(t.density);
  };

  // Insert manual page break marker into text at current cursor location
  const insertPageBreak = () => {
    if (bodyTextareaRef.current) {
      const el = bodyTextareaRef.current;
      const start = el.selectionStart ?? bodyText.length;
      const end = el.selectionEnd ?? bodyText.length;
      const before = bodyText.substring(0, start);
      const after = bodyText.substring(end);
      const marker = "\n\n---page-break---\n\n";
      const nextText = `${before}${marker}${after}`;
      setBodyText(nextText);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + marker.length, start + marker.length);
      }, 10);
    } else {
      setBodyText((prev) => prev + "\n\n---page-break---\n\n");
    }
  };

  const filteredLetters = savedLetters.filter((item) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      (item.refNo && item.refNo.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      (item.recipient && item.recipient.toLowerCase().includes(q))
    );
  });

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

  // =========================================================================
  // SUB-COMPONENTS: BANNERS, FOOTERS & HEADERS
  // =========================================================================

  const TopGeometricBanner = ({ height = 36 }: { height?: number }) => (
    <div className="relative w-full overflow-hidden shrink-0" style={{ height: `${height}px` }}>
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
  );

  const BottomChevronBanner = () => (
    <div className="relative w-full h-[28px] overflow-hidden shrink-0">
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
  );

  const WebsiteBar = () => (
    <div className="px-8 pb-1.5 flex items-center justify-center gap-3 shrink-0">
      <div className="flex-1 flex items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#C0272D]" />
        <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
      </div>
      <div className="flex items-center gap-2 px-3">
        <svg className="w-3.5 h-3.5 text-[#C0272D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
          <path strokeWidth="1.8" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className="font-bold text-[11.5px] text-[#C0272D] tracking-wide font-['Montserrat']">
          www.zivicnexus.com
        </span>
      </div>
      <div className="flex-1 flex items-center">
        <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#C0272D]" />
      </div>
    </div>
  );

  const Watermark = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
      <div className="relative w-[380px] h-[250px] opacity-[0.05]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_clean.png"
          alt="ZN Watermark"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );

  const FirstPageHeader = () => (
    <section className="relative w-full z-10 flex flex-col shrink-0">
      <TopGeometricBanner height={36} />

      {/* Header Content Grid */}
      <div className="pt-2.5 pb-2 px-8 flex items-stretch justify-between gap-6">
        {/* Left: Logo + Name + Taglines */}
        <div className="flex-1 flex flex-col justify-between pr-2">
          <div className="flex items-center gap-4">
            <div className="relative w-[82px] h-[50px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo_clean.png"
                alt="Zivic Nexus Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="relative w-[225px] h-[38px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/text_clean.png"
                alt="Zivic Nexus"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="mt-1.5 pl-1">
            <p className="text-[11px] font-bold text-[#550C0E] tracking-[0.28em] uppercase font-['Montserrat']">
              CONNECT &nbsp;·&nbsp; GROW &nbsp;·&nbsp; THRIVE
            </p>
          </div>

          <div className="mt-2 flex items-center gap-3 pl-1">
            <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
            <span className="text-[9px] font-black text-[#C0272D] tracking-wider uppercase whitespace-nowrap font-['Montserrat']">
              DIGITAL PLATFORM FOR BUSINESS GROWTH
            </span>
            <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
          </div>
        </div>

        {/* Vertical Red Divider */}
        <div className="w-[1.5px] bg-[#C0272D] shrink-0 self-stretch my-1" />

        {/* Right: Contact Details */}
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
  );

  const ContinuationHeader = ({ pageIndex }: { pageIndex: number }) => (
    <section className="relative w-full z-10 flex flex-col shrink-0">
      <TopGeometricBanner height={26} />
      <div className="pt-2 pb-1 px-8 flex items-center justify-between font-['Montserrat']">
        <div className="flex items-center gap-2">
          <span className="font-black text-[10.5px] text-[#C0272D] tracking-wider uppercase">
            ZIVIC NEXUS
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[9.5px] font-semibold text-slate-600 uppercase tracking-widest">
            CONTINUATION SHEET
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9.5px] font-semibold text-slate-700">
          <span>Ref: <strong className="font-mono text-black">{refNo}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-[#C0272D] font-bold">Page {pageIndex + 1} of {totalPages}</span>
        </div>
      </div>
      <div className="w-full h-[1.5px] bg-[#C0272D]" />
    </section>
  );

  const SignatureBlock = () => (
    <div className="w-full pb-1 pt-2 flex items-end justify-between shrink-0">
      <div className="text-[10px] text-slate-700 font-medium leading-tight">
        <p className="font-semibold text-slate-800">Sincerely,</p>
        <p className="font-bold text-black mt-0.5">For Zivic Nexus</p>
        <p className="text-[9px] text-slate-500">Authorized Signatory / Proprietor</p>
      </div>

      {includeSignature && (
        <div className="flex flex-col items-center text-center">
          <div className="relative w-[130px] h-[55px] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/prop_sig_clean.png"
              alt="Zivic Nexus Proprietor Signature"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 py-3 sm:py-5 px-2 sm:px-4 flex flex-col items-center justify-start print:p-0 print:m-0 print:bg-white print-wrapper overflow-x-hidden">
      {/* Top Controls Toolbar (Hidden during print) */}
      <header className="no-print w-full max-w-[210mm] mb-4 bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3">
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
                  {totalPages} {totalPages === 1 ? "Page" : "Pages"} A4 Clean Split
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

          {/* Cloud Save & PDF Status */}
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
                {saveError}
              </span>
            )}
            {pdfSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                ✓ Downloaded PDF
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          {/* Left Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Save to Cloud */}
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{currentId ? "Update Cloud" : "Save to Cloud"}</span>
            </button>

            {/* Saved Letters Archive */}
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
              <span>Saved ({savedLetters.length})</span>
            </button>

            {/* Verify Ref. No */}
            <button
              type="button"
              onClick={() => {
                setVerifyQuery(refNo);
                setShowVerifyModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Verify Ref</span>
            </button>

            {/* Template Selector */}
            <div className="flex items-center gap-1.5">
              <select
                onChange={(e) => {
                  if (e.target.value === "blank") {
                    handleNewLetter();
                  } else if (e.target.value) {
                    handleSelectTemplate(e.target.value);
                  }
                }}
                defaultValue=""
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="" disabled>Load Template...</option>
                <option value="razorpay-compliance">Razorpay Compliance (2 Pages)</option>
                <option value="sample-proposal">Strategic Growth Proposal (1 Page)</option>
                <option value="vendor-offer">Vendor Partnership Offer (1 Page)</option>
                <option value="blank">+ New Blank Letter</option>
              </select>
            </div>

            {/* Toggle Editor Panel */}
            <button
              type="button"
              onClick={() => setShowEditorPanel(!showEditorPanel)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{showEditorPanel ? "Hide Editor" : "Edit Content"}</span>
            </button>
          </div>

          {/* Right Actions: Text Density, Sig Toggle, PDF Download & Print */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text Density Control */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] px-1 font-medium">Density:</span>
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
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                includeSignature
                  ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span>✍️ Sig:</span>
              <span className="font-bold">{includeSignature ? "ON" : "OFF"}</span>
            </button>

            {/* Primary Action: Download Genuine PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C0272D] via-[#D83A41] to-[#F7941D] hover:from-[#A0181E] hover:to-[#E07D0C] text-white shadow-lg shadow-red-900/40 hover:shadow-red-900/60 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Official PDF</span>
                </>
              )}
            </button>

            {/* Browser Print Button (Ctrl+P) */}
            <button
              type="button"
              onClick={handlePrint}
              title="Browser Print (Ctrl+P)"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Document Composer / Editor Panel */}
      {showEditorPanel && (
        <section className="no-print w-full max-w-[210mm] mb-6 bg-slate-900 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>✏️ Document Editor</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                Live multi-page layout sync
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={insertPageBreak}
                title="Force a clean page break at this point in the letter"
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
              >
                <span>➕ Insert Page Break</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Date & Ref No */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold text-[11px]">Letter Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-semibold text-[11px]">Reference Number</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openVerificationFor(refNo)}
                    className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Verify in DB
                  </button>
                  <span className="text-slate-600 text-[10px]">•</span>
                  <button
                    type="button"
                    onClick={() => setRefNo(generateEncryptedRefNo(date))}
                    className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value.toUpperCase())}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Recipient */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-slate-400 font-semibold text-[11px]">Recipient Address (To,)</label>
              <textarea
                rows={3}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient Name, Designation & Address..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-orange-500 resize-none font-medium"
              />
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-slate-400 font-semibold text-[11px]">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Document Subject..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Letter Body */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 font-semibold text-[11px]">Letter Body Content</label>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{bodyText.length} characters</span>
                  <span>•</span>
                  <span>{bodyText.split(/\s+/).filter(Boolean).length} words</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{totalPages} A4 {totalPages === 1 ? "page" : "pages"}</span>
                </div>
              </div>
              <textarea
                ref={bodyTextareaRef}
                rows={12}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Type your official letterhead content here. Place cursor and click '➕ Insert Page Break' to split across pages cleanly."
                className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 font-mono text-xs leading-relaxed"
              />
            </div>
          </div>
        </section>
      )}

      {/* A4 Letterhead Preview Container (Discrete Multi-Page Sheets) */}
      <div className="w-full flex flex-col items-center gap-8 pb-12">
        {pages.map((pageContent, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === totalPages - 1;

          return (
            <div key={pageIndex} className="flex flex-col items-center">
              {/* Screen Page Badge */}
              <div className="no-print mb-2 flex items-center justify-between w-full max-w-[210mm] px-2 text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Official Sheet {pageIndex + 1} of {totalPages}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {isFirstPage ? "Primary Letterhead" : "Continuation Sheet"}
                </span>
              </div>

              {/* Exact A4 Sheet Page Container */}
              <div
                className="letterhead-pdf-page relative bg-white text-slate-900 shadow-2xl font-sans flex flex-col justify-between overflow-hidden"
                style={{ width: "210mm", height: "297mm", minHeight: "297mm", maxHeight: "297mm" }}
              >
                {/* Watermark in center of each page */}
                <Watermark />

                {/* Top Section Header */}
                {isFirstPage ? (
                  <FirstPageHeader />
                ) : (
                  <ContinuationHeader pageIndex={pageIndex} />
                )}

                {/* Body Content Section */}
                <section className="relative flex-1 px-8 py-2.5 z-10 flex flex-col justify-between overflow-hidden">
                  <div className="relative z-10 flex flex-col">
                    {/* First Page Metadata */}
                    {isFirstPage && (
                      <div className="flex flex-col pb-2">
                        {/* Ref No & Date */}
                        <div className="flex items-center justify-between gap-6 pb-2">
                          <div className="flex items-center gap-2 flex-1 max-w-[420px]">
                            <span className="font-bold text-[11px] text-black whitespace-nowrap font-['Montserrat']">
                              Ref. No. :
                            </span>
                            <span className="text-[11px] font-semibold text-slate-900 font-mono tracking-wider select-all px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded print:border-none print:p-0 print:bg-transparent">
                              {refNo}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2 w-[220px]">
                            <span className="font-bold text-[11px] text-black whitespace-nowrap font-['Montserrat']">
                              Date :
                            </span>
                            <span className="text-[11px] font-medium text-slate-900 text-right">
                              {date}
                            </span>
                          </div>
                        </div>

                        {/* To, & Recipient */}
                        <div className="pt-0.5">
                          <span className="font-bold text-[11px] text-black font-['Montserrat']">
                            To,
                          </span>
                        </div>
                        <div className="pt-0.5 pb-1.5">
                          <div className={`whitespace-pre-wrap ${getRecipientTypography()} text-slate-800 font-medium`}>
                            {recipient}
                          </div>
                        </div>

                        {/* Subject */}
                        <div className="pt-0.5 pb-1 flex items-start gap-2">
                          <span className="font-bold text-[11px] text-black whitespace-nowrap font-['Montserrat'] mt-0.5">
                            Subject :
                          </span>
                          <span className="text-[11px] font-bold text-slate-900 leading-snug">
                            {subject}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Page Letter Body Content */}
                    <div className="pt-1">
                      <div className={`whitespace-pre-wrap ${getBodyTypography()} text-slate-800 font-sans leading-relaxed`}>
                        {pageContent}
                      </div>
                    </div>
                  </div>

                  {/* Signature on Final Page only */}
                  {isLastPage && (
                    <SignatureBlock />
                  )}
                </section>

                {/* Running Bottom Footer (Always anchored at bottom of each page) */}
                <footer className="relative w-full z-20 flex flex-col justify-end shrink-0">
                  <WebsiteBar />
                  <BottomChevronBanner />
                </footer>
              </div>
            </div>
          );
        })}
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

      {/* ========================================================================= */}
      {/* 5. REF. NO. VERIFICATION TAB / MODAL (Official Database Authenticity)    */}
      {/* ========================================================================= */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-base shadow-sm">
                  🛡️
                </div>
                <div>
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    Official Letterhead Verification
                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Live Database Registry
                    </span>
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Verify the authenticity of any Zivic Nexus reference number against Firestore
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Search Bar */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Enter Reference Number to Verify
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={verifyQuery}
                      onChange={(e) => setVerifyQuery(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleVerifyRefNo();
                        }
                      }}
                      placeholder="e.g. ZVN2026102433G28"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-wider placeholder:text-slate-500 focus:outline-none transition-colors"
                    />
                    {verifyQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyQuery("");
                          setVerifyResult(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVerifyRefNo()}
                    disabled={isVerifying || !verifyQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isVerifying ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Checking...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Verify Ref. No.</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Verification Result Display */}
              {verifyResult && (
                <div className="transition-all animate-fadeIn">
                  {verifyResult.found && verifyResult.letter ? (
                    <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base shrink-0 border border-emerald-500/30">
                            ✓
                          </div>
                          <div>
                            <span className="text-emerald-400 font-bold text-sm tracking-wide flex items-center gap-1.5">
                              AUTHENTICATED OFFICIAL LETTERHEAD
                            </span>
                            <p className="text-emerald-300/80 text-[11px]">
                              Verified against Zivic Nexus official cloud registry
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          {verifyResult.letter.refNo}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-500/20 text-xs">
                        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Issue Date</span>
                          <span className="text-white font-medium">{verifyResult.letter.date || "Not recorded"}</span>
                        </div>
                        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Database Record ID</span>
                          <span className="text-slate-300 font-mono text-[11px] truncate block" title={verifyResult.letter.id}>
                            {verifyResult.letter.id}
                          </span>
                        </div>
                        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 sm:col-span-2">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Recipient</span>
                          <span className="text-white font-medium whitespace-pre-line line-clamp-2">
                            {verifyResult.letter.recipient || "Not specified"}
                          </span>
                        </div>
                        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 sm:col-span-2">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Subject</span>
                          <span className="text-white font-medium line-clamp-2">
                            {verifyResult.letter.subject || "Not specified"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (verifyResult.letter) {
                              handleLoadLetter(verifyResult.letter);
                              setShowVerifyModal(false);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>📄 Load into Editor</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-base shrink-0 border border-red-500/30">
                        ✕
                      </div>
                      <div>
                        <h3 className="text-red-400 font-bold text-sm tracking-wide">
                          UNVERIFIED / INVALID REFERENCE NUMBER
                        </h3>
                        <p className="text-red-300/80 text-xs mt-1 leading-relaxed">
                          The reference number <strong className="font-mono text-white">{verifyQuery}</strong> was NOT found in the Zivic Nexus official database.
                        </p>
                        <p className="text-slate-400 text-[11px] mt-1.5">
                          If this number appears on a physical or digital letterhead, it may be an unrecorded draft, forged, or unauthorized document.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Registered Letters in DB quick-list */}
              <div>
                <h4 className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Saved Letters in Registry ({savedLetters.length})</span>
                  <span className="text-[10px] font-normal lowercase text-slate-500">Click any Ref No to test verification</span>
                </h4>
                {savedLetters.length === 0 ? (
                  <p className="text-slate-500 text-xs py-2">No letterheads saved in the database yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {savedLetters.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setVerifyQuery(l.refNo || "");
                          handleVerifyRefNo(l.refNo || "");
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-[11px] shrink-0">
                            {l.refNo || "No Ref. No."}
                          </span>
                          <span className="text-slate-300 truncate text-[11px]">
                            {l.subject || "Untitled"}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px] shrink-0 pl-2">
                          {l.date}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">
                Cryptographic timestamp & digital root validation
              </span>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
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
