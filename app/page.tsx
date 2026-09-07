"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function LetterheadPage() {
  // Letter state
  const [refNo, setRefNo] = useState("ZN/2026/08/042");
  const [date, setDate] = useState("August 31, 2026");
  const [recipient, setRecipient] = useState(
    "The Managing Director\nGlobal Enterprise Solutions Pvt. Ltd.\nCorporate Towers, Sector 62\nNoida, Uttar Pradesh — 201301"
  );
  const [subject, setSubject] = useState(
    "Proposal for Digital Marketing, Strategic Growth & Marketplace Expansion"
  );
  const [bodyText, setBodyText] = useState(
    "Dear Sir/Madam,\n\nWe are pleased to submit our comprehensive business proposal for digital marketing and strategic growth services. At Zivic Nexus, we specialize in delivering high-impact marketing frameworks, end-to-end digital campaigns, and technological infrastructures designed to accelerate enterprise market leadership.\n\nOur team has analyzed your requirements and tailored a phased roadmap that ensures measurable ROI, enhanced brand presence, and seamless customer acquisition.\n\nWe look forward to partnering with your esteemed organization."
  );
  const [includeSignature, setIncludeSignature] = useState(true);


  // Reliable print handler
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.focus();
      setTimeout(() => {
        window.print();
      }, 50);
    }
  };

  // Keyboard shortcut Ctrl+P / Cmd+P support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Quick actions
  const handleClear = () => {
    setRefNo("");
    setDate("");
    setRecipient("");
    setSubject("");
    setBodyText("");
  };

  const handleSample = () => {
    setRefNo("ZN/2026/08/042");
    setDate("August 31, 2026");
    setRecipient(
      "The Managing Director\nGlobal Enterprise Solutions Pvt. Ltd.\nCorporate Towers, Sector 62\nNoida, Uttar Pradesh — 201301"
    );
    setSubject(
      "Proposal for Digital Marketing, Strategic Growth & Marketplace Expansion"
    );
    setBodyText(
      "Dear Sir/Madam,\n\nWe are pleased to submit our comprehensive business proposal for digital marketing and strategic growth services. At Zivic Nexus, we specialize in delivering high-impact marketing frameworks, end-to-end digital campaigns, and technological infrastructures designed to accelerate enterprise market leadership.\n\nOur team has analyzed your requirements and tailored a phased roadmap that ensures measurable ROI, enhanced brand presence, and seamless customer acquisition.\n\nWe look forward to partnering with your esteemed organization."
    );
    setIncludeSignature(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start print:p-0 print:m-0 print:bg-white print-wrapper overflow-x-hidden">
      {/* Top Controls Toolbar (Hidden during print) */}
      <header className="no-print w-full max-w-[210mm] mb-4 sm:mb-6 bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-3">
        {/* Top Row: Brand & Info */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#C0272D] to-[#F7941D] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-900/30 shrink-0">
              ZN
            </div>
            <div>
              <h1 className="text-white font-bold text-sm sm:text-base leading-tight">
                Zivic Nexus Letterhead
              </h1>
              <p className="text-slate-400 text-[11px] sm:text-xs">
                Click & edit fields • A4 Print Ready
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Row: Action Buttons */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-1 border-t border-slate-800/80">
          {/* Signature Toggle */}
          <button
            type="button"
            onClick={() => setIncludeSignature(!includeSignature)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              includeSignature
                ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <span>✍️ Sig:</span>
            <span className="font-bold">{includeSignature ? "ON" : "OFF"}</span>
          </button>

          {/* Fill Sample Button */}
          <button
            type="button"
            onClick={handleSample}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            Sample
          </button>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            Clear
          </button>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C0272D] via-[#D83A41] to-[#F7941D] hover:from-[#A0181E] hover:to-[#E07D0C] text-white shadow-lg shadow-red-900/40 hover:shadow-red-900/60 transition-all cursor-pointer transform active:scale-95 shrink-0"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span>Print / PDF</span>
          </button>
        </div>
      </header>

      {/* Mobile: horizontally scrollable so full A4 is accessible. Desktop: centered. */}
      <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex justify-start sm:justify-center" style={{ minWidth: "210mm" }}>
          {/* A4 Letterhead Container (210mm x 297mm) */}
          <main
            className="a4-container relative flex flex-col justify-between overflow-hidden bg-white text-slate-900 shadow-2xl font-sans"
            style={{ width: "210mm", height: "297mm", minHeight: "297mm", maxHeight: "297mm" }}
          >
            {/* ========================================================================= */}
            {/* 1. TOP SECTION (Top Gradient Accent + Header Details + Divider)           */}
            {/* ========================================================================= */}
            <section className="relative w-full z-10 flex flex-col">
              {/* Top Geometric Angular Banner (Dark Red + Bright Orange Angular Accent) */}
              <div className="relative w-full h-[38px] overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1000 45"
                  preserveAspectRatio="none"
                >
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

                  {/* Main Maroon Bar spanning top left */}
                  <polygon points="0,0 820,0 770,45 0,45" fill="url(#topMaroonGrad)" />
                  {/* Intermediate Dark Crimson Slice */}
                  <polygon points="820,0 870,0 820,45 770,45" fill="#750E12" />
                  {/* Bright Orange Angular Wedge on Top Right */}
                  <polygon points="870,0 1000,0 1000,45 820,45" fill="url(#topOrangeGrad)" />
                </svg>
              </div>

              {/* Header Content Grid */}
              <div className="pt-4 pb-3 px-8 flex items-stretch justify-between gap-6">
                {/* Left Header Area: Logo + Name + Taglines */}
                <div className="flex-1 flex flex-col justify-between pr-2">
                  {/* Logo & Company Name Side-by-Side */}
                  <div className="flex items-center gap-4">
                    {/* Official ZN Emblem */}
                    <div className="relative w-[86px] h-[52px] shrink-0">
                      <Image
                        src="/logo_clean.png"
                        alt="Zivic Nexus Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Official 3D Fiery Metallic "ZIVIC NEXUS" Text */}
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

                  {/* Tagline: CONNECT · GROW · THRIVE */}
                  <div className="mt-2.5 pl-1.5">
                    <p className="text-[12px] font-bold text-[#550C0E] tracking-[0.28em] uppercase font-['Montserrat']">
                      CONNECT &nbsp;·&nbsp; GROW &nbsp;·&nbsp; THRIVE
                    </p>
                  </div>

                  {/* Sub-tagline: DIGITAL PLATFORM FOR BUSINESS GROWTH (Flanked with Red Lines) */}
                  <div className="mt-3 flex items-center gap-3 pl-1">
                    <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                    <span className="text-[10px] font-black text-[#C0272D] tracking-wider uppercase whitespace-nowrap font-['Montserrat']">
                      DIGITAL PLATFORM FOR BUSINESS GROWTH
                    </span>
                    <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                  </div>
                </div>

                {/* Vertical Red Divider */}
                <div className="w-[1.5px] bg-[#C0272D] shrink-0 self-stretch my-1" />

                {/* Right Header Area: Contact Information with Red Circular Badge Icons */}
                <div className="w-[230px] shrink-0 flex flex-col justify-center gap-2 pl-2 font-['Montserrat',sans-serif]">
                  {/* 📍 Address */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </div>
                    <div className="text-[10px] leading-tight text-slate-800">
                      <p className="font-bold text-[11px] text-black tracking-tight">568/390</p>
                      <p className="text-slate-800 font-medium tracking-normal">Om Nagar, Kailashpuri,</p>
                      <p className="text-slate-800 font-medium tracking-normal">Alambagh, Lucknow — 226005</p>
                    </div>
                  </div>

                  {/* 📞 Phone */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.053 15.053 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                      </svg>
                    </div>
                    <div className="text-[10.5px]">
                      <span className="font-bold text-[#C0272D]">Ph: </span>
                      <span className="font-medium text-slate-800">9115233773</span>
                    </div>
                  </div>

                  {/* 🖹 GSTIN */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    </div>
                    <div className="text-[10.5px]">
                      <span className="font-bold text-[#C0272D]">GSTIN: </span>
                      <span className="font-medium text-slate-800">09LQGPS0132J1ZH</span>
                    </div>
                  </div>

                  {/* ✉ Email */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#C0272D] flex items-center justify-center shrink-0 shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <div className="text-[10px]">
                      <span className="font-bold text-[#C0272D]">Email: </span>
                      <span className="font-medium text-slate-800">zivicnexus@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-width Red Separator Line below Header */}
              <div className="w-full h-[2.5px] bg-[#C0272D]" />
            </section>

            {/* ========================================================================= */}
            {/* 2. BODY SECTION (Clean Form Fields + Center Watermark + Signature)         */}
            {/* ========================================================================= */}
            <section className="relative flex-1 px-10 py-5 z-10 flex flex-col justify-between">
              {/* Centered Translucent Watermark (Official ZN Logo) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <div className="relative w-[460px] h-[300px] opacity-[0.08]">
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
                {/* Row 1: Ref. No. (Left) & Date (Right) */}
                <div className="flex items-center justify-between gap-6 pb-3">
                  {/* Ref. No. */}
                  <div className="flex items-center gap-2 flex-1 max-w-[320px]">
                    <span className="font-bold text-[11.5px] text-black whitespace-nowrap font-['Montserrat']">
                      Ref. No. :
                    </span>
                    {/* On screen input */}
                    <input
                      type="text"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      placeholder="_______________________"
                      className="print:hidden flex-1 text-[11.5px] text-slate-800 border-b border-slate-300 focus:border-[#C0272D] bg-transparent focus:outline-none px-1 py-0.5 font-medium transition-colors"
                    />
                    {/* Print view */}
                    <span className="hidden print:inline text-[11.5px] font-medium text-slate-900">
                      {refNo}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-end gap-2 w-[240px]">
                    <span className="font-bold text-[11.5px] text-black whitespace-nowrap font-['Montserrat']">
                      Date :
                    </span>
                    {/* On screen input */}
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="___________________"
                      className="print:hidden flex-1 text-[11.5px] text-slate-800 border-b border-slate-300 focus:border-[#C0272D] bg-transparent focus:outline-none px-1 py-0.5 font-medium text-right transition-colors"
                    />
                    {/* Print view */}
                    <span className="hidden print:inline text-[11.5px] font-medium text-slate-900 text-right">
                      {date}
                    </span>
                  </div>
                </div>

                {/* Row 2: To, */}
                <div className="pt-1.5">
                  <span className="font-bold text-[12px] text-black font-['Montserrat']">
                    To,
                  </span>
                </div>

                {/* Recipient Address Area (Clean, open typing area without lines) */}
                <div className="pt-1 pb-2.5">
                  {/* Screen editable textarea with scrollbars completely hidden */}
                  <textarea
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    rows={3}
                    placeholder="Recipient Name, Designation & Address..."
                    className="print:hidden w-full max-w-[420px] text-[11px] leading-[19px] text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 rounded-md p-1 focus:outline-none font-medium resize-none transition-all placeholder:italic placeholder:text-slate-400 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />
                  {/* Print view pure text without any scrollbars or borders */}
                  <div className="hidden print:block whitespace-pre-wrap text-[11px] leading-[19px] text-slate-800 font-medium">
                    {recipient}
                  </div>
                </div>

                {/* Row 3: Subject : */}
                <div className="pt-1 pb-2.5 flex items-center gap-2.5">
                  <span className="font-bold text-[11.5px] text-black whitespace-nowrap font-['Montserrat']">
                    Subject :
                  </span>
                  {/* Screen input */}
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter document subject here..."
                    className="print:hidden flex-1 text-[11.5px] text-slate-900 border-b border-slate-300 focus:border-[#C0272D] bg-transparent focus:outline-none px-1 py-0.5 font-bold transition-colors placeholder:font-normal placeholder:italic placeholder:text-slate-400"
                  />
                  {/* Print view */}
                  <span className="hidden print:inline text-[11.5px] font-bold text-slate-900">
                    {subject}
                  </span>
                </div>

                {/* Main Letter Body Space */}
                <div className="pt-1">
                  {/* Screen editable textarea with scrollbars completely hidden */}
                  <textarea
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={8}
                    placeholder="Type your letter content here..."
                    className="print:hidden w-full text-[11.5px] leading-relaxed text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 rounded-lg p-1.5 focus:outline-none font-sans resize-none transition-all placeholder:italic placeholder:text-slate-400 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />
                  {/* Print view pure text typography */}
                  <div className="hidden print:block whitespace-pre-wrap text-[11.5px] leading-relaxed text-slate-800 font-sans">
                    {bodyText}
                  </div>
                </div>
              </div>

              {/* Signature & Sign-off Section (Bottom Right) */}
              <div className="relative z-10 flex items-end justify-between pt-3 pb-1">
                {/* Left side sign-off */}
                <div className="text-[11px] text-slate-600 font-medium">
                  <p>Warm regards,</p>
                </div>

                {/* Right side Official Signature Stamp */}
                {includeSignature && (
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-[155px] h-[72px] shrink-0 mb-0.5">
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
              {/* Website Divider with Center Globe & URL */}
              <div className="px-8 pb-3 flex items-center justify-center gap-3">
                {/* Left Flanking Line with Start Dot */}
                <div className="flex-1 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0272D]" />
                  <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                </div>

                {/* Globe Icon + Web Address */}
                <div className="flex items-center gap-2 px-3">
                  <svg
                    className="w-4 h-4 text-[#C0272D]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                    <path
                      strokeWidth="1.8"
                      d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                    />
                  </svg>
                  <span className="font-bold text-[13px] text-[#C0272D] tracking-wide font-['Montserrat']">
                    www.zivicnexus.com
                  </span>
                </div>

                {/* Right Flanking Line with End Dot */}
                <div className="flex-1 flex items-center">
                  <div className="h-[1.5px] flex-1 bg-[#C0272D]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0272D]" />
                </div>
              </div>

              {/* Bottom Geometric Chevron Banner (Dark Maroon, Crimson, Orange Chevrons) */}
              <div className="relative w-full h-[32px] overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1000 40"
                  preserveAspectRatio="none"
                >
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

                  {/* Base Dark Maroon Full Strip */}
                  <rect x="0" y="0" width="1000" height="40" fill="#5A0205" />

                  {/* Left Orange Chevron Corner */}
                  <polygon points="0,0 150,0 100,40 0,40" fill="url(#footerOrangeGrad)" />

                  {/* Center Crimson Angled Trapezoid */}
                  <polygon
                    points="140,0 860,0 820,40 90,40"
                    fill="url(#footerCenterGrad)"
                  />

                  {/* Right Orange Chevron Corner */}
                  <polygon
                    points="850,0 1000,0 1000,40 810,40"
                    fill="url(#footerOrangeGrad)"
                  />
                </svg>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
