export interface LetterTemplate {
  id: string;
  name: string;
  category: string;
  refNoPrefix: string;
  subject: string;
  recipient: string;
  bodyText: string;
  includeSignature: boolean;
  density: "normal" | "compact" | "ultra-compact";
}

export const TEMPLATES: LetterTemplate[] = [
  {
    id: "razorpay-compliance",
    name: "Razorpay Compliance & Undertaking",
    category: "COMPLIANCE",
    refNoPrefix: "ZN/COMPL/RZP",
    subject: "Formal Clarification & Undertaking: Operational Architecture (B2B/B2C), Platform as a Service, and Gateway Usage (Ph: 9115233773 | zivicnexus.com)",
    recipient: "The Risk & Compliance Division / Merchant Underwriting\nRazorpay Software Private Limited\nSJR Cyber, 1st Floor, 22 Laskar-Hosur Road,\nAdugodi, Bengaluru, Karnataka – 560030",
    bodyText: `Dear Razorpay Compliance Team,

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

We kindly request you to record this operational declaration and continue our active payment gateway processing.

Sincerely,

For Zivic Nexus
Authorized Signatory
Designation: Founder & Managing Director
Phone: +91-9115233773
Email: zivicnexus@gmail.com
Website: https://zivicnexus.com
Registered Address: 568/390, Om Nagar, Kailashpuri, Alambagh, Lucknow – 226005`,
    includeSignature: true,
    density: "ultra-compact",
  },
  {
    id: "sample-proposal",
    name: "Strategic Growth Proposal",
    category: "PROPOSAL",
    refNoPrefix: "ZN/PROP",
    subject: "Proposal for Digital Marketing, Strategic Growth & Marketplace Expansion",
    recipient: "The Managing Director\nGlobal Enterprise Solutions Pvt. Ltd.\nCorporate Towers, Sector 62\nNoida, Uttar Pradesh — 201301",
    bodyText: `Dear Sir/Madam,

We are pleased to submit our comprehensive business proposal for digital marketing and strategic growth services. At Zivic Nexus, we specialize in delivering high-impact marketing frameworks, end-to-end digital campaigns, and technological infrastructures designed to accelerate enterprise market leadership.

Our team has analyzed your requirements and tailored a phased roadmap that ensures measurable ROI, enhanced brand presence, and seamless customer acquisition.

Key Deliverables:
1. Omnichannel Brand Architecture & Market Positioning
2. Conversational Lead Funnel Deployment & CRM Automation
3. High-Converting Web Application Development & Edge Hosting
4. Dedicated Account Management & Transparent Milestone Reporting

We look forward to partnering with your esteemed organization.`,
    includeSignature: true,
    density: "normal",
  },
  {
    id: "vendor-offer",
    name: "Vendor Partnership Agreement",
    category: "PARTNERSHIP",
    refNoPrefix: "ZN/VEND",
    subject: "Letter of Onboarding & Verified Vendor Partnership Agreement",
    recipient: "The Proprietor / Director\nPartner Services Ltd.\nLucknow, Uttar Pradesh",
    bodyText: `Dear Partner,

We are pleased to formally welcome you as an authorized verified vendor partner on the Zivic Nexus platform.

Following your verification review, your business profile has been accredited with our verified trust badge. You now possess full access to our business aid tools, AI-assisted opportunity discovery radar, and verified client inquiry board.

Terms of Partnership:
• Direct Client Engagements: Inquiries received directly from clients through your profile incur zero platform commission.
• Quality & Service SLA: Partner agrees to maintain prompt professional communication, quality standards, and ethical business conduct.
• Confidentiality & Data Protection: Client contact details shared on the platform must be utilized solely for fulfilling quoted services and treated in strict accordance with the DPDP Act, 2023.

We anticipate a fruitful, long-term collaboration.`,
    includeSignature: true,
    density: "compact",
  },
];
