import { Language, GrantStatus, EligibilityRole, PipelineStage } from "../types/grants";

export const MONTHS_LONG: Record<Language, string[]> = {
  id: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};

export const MONTHS_SHORT: Record<Language, string[]> = {
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

export const STATUS_LABELS: Record<Language, Record<GrantStatus | "past", string>> = {
  id: {
    live: "Terbuka",
    recurring: "Siklus Berulang",
    closed: "Putaran Ditutup",
    paused: "Sedang Jeda",
    invite: "Undangan",
    institution: "Institusional",
    resource: "Sumber Daya",
    past: "Tenggat Lewat"
  },
  en: {
    live: "Open Now",
    recurring: "Recurring Cycle",
    closed: "Cycle Closed",
    paused: "Paused",
    invite: "Invite Only",
    institution: "Institutional",
    resource: "Resource / Data",
    past: "Past Deadline"
  }
};

export const ROLE_LABELS: Record<Language, Record<EligibilityRole, string>> = {
  id: {
    lead: "Bisa Memimpin (Lead PI)",
    partner: "Mitra / Co-Lead",
    fellowship: "Fellowship / Individu",
    institution: "Melalui Institusi",
    ineligible: "Tidak Memenuhi Syarat"
  },
  en: {
    lead: "Can Lead (Prime PI)",
    partner: "Partner / Co-Lead",
    fellowship: "Fellowship / Individual",
    institution: "Institutional Route",
    ineligible: "Ineligible"
  }
};

export const PIPELINE_STAGES: { k: PipelineStage; id: string; en: string }[] = [
  { k: "watch", id: "Dipantau", en: "Watched" },
  { k: "prep", id: "Disiapkan", en: "Preparing" },
  { k: "submitted", id: "Diajukan", en: "Submitted" },
  { k: "awarded", id: "Didanai", en: "Awarded" },
  { k: "rejected", id: "Tidak Didanai", en: "Declined" }
];

export const UI_TEXT = {
  id: {
    brandSubtitle:
      "Basis data terpusat hibah Kesehatan, Ilmu Sosial & Keselamatan Jalan — Nasional (BIMA, LPDP, BRIN, Hiliriset, UGM) & Internasional (WHO, HSP, UKRI, CDC, USA, ASEAN, Wellcome).",
    navRadar: "Radar",
    navDatabase: "Basis Data",
    navGuidelines: "Panduan",
    navPipeline: "Pipeline",
    navCycles: "Siklus & Portal",
    ctaAlerts: "Peringatan Email",
    statOpenCalls: "panggilan dengan tenggat aktif",
    statClosing30: "tutup dalam ≤ 30 hari",
    statClosing90: "tutup dalam ≤ 90 hari",
    statLeadEligible: "bisa dipimpin langsung Indonesia",
    statInPipeline: "dilacak di pipeline tim",
    statAlertMatches: "cocok dengan aturan email alert",
    timelineEyebrow: "Horizon Tenggat 12 Bulan ke Depan",
    todayLabel: "hari ini",
    openNowTitle: "Sedang Terbuka & Aktif",
    openNowSub:
      "Skema dengan tenggat pasti yang masih terbuka atau panggilan bergulir sepanjang tahun, diurutkan menurut urgensi tanggal tutup.",
    reopeningSoonTitle: "Segera Dibuka Kembali (3 Bulan ke Depan)",
    reopeningSoonSub:
      "Skema berulang yang jendela siklusnya jatuh pada bulan ini hingga dua bulan ke depan — waktu terbaik menyiapkan proposal dan kemitraan.",
    searchPlaceholder:
      "Cari nama skema, pemberi dana (WHO, HSP, BIMA, LPDP, BRIN, UGM, UKRI, ASEAN), tema, atau nomor NOFO…",
    resetFilters: "Reset Filter",
    exportCsv: "Unduh CSV",
    exportJson: "Cadangkan JSON",
    importJson: "Impor JSON",
    daysLeft: "hari lagi",
    daysPast: "hari lewat",
    rollingYear: "sepanjang tahun",
    rollingTag: "bergulir",
    cycleTag: "siklus",
    irregularTag: "tak tetap",
    inPipelineTag: "Di Pipeline",
    trackInPipeline: "+ Lacak di Pipeline",
    alreadyInPipeline: "Sudah di Pipeline",
    openOfficialPage: "Buka Halaman Resmi",
    aboutLabel: "Cakupan",
    eligibilityLabel: "Kelayakan Indonesia",
    deadlineLabel: "Tenggat & Siklus",
    amountLabel: "Nilai Pendanaan",
    themesLabel: "Tema & Domain",
    oppNumberLabel: "Nomor Peluang",
    addCustomGrant: "+ Tambah Hibah Sendiri",
    pipelineTitle: "Dashboard Pipeline Aplikasi & Tenggat Tim",
    pipelineSub:
      "Kelola progres penyusunan proposal, daftar periksa dokumen (checklist), penanggung jawab (PIC), dan tenggat waktu aplikasi.",
    guidelinesTitle: "Pencarian Panduan (Guidelines) & Analisis Kelayakan AI",
    guidelinesSub:
      "Telusuri ringkasan terstruktur buku panduan resmi (BIMA, Hiliriset, LPDP, BRIN, UGM, UKRI, NIH, WHO, HSP) atau gunakan Pencarian Web Langsung berbantuan AI untuk memverifikasi aturan terbaru.",
    aiSearchTitle: "Pencarian Panduan & Kelayakan Langsung (Google Search Grounding)",
    aiSearchPlaceholder:
      "Contoh: Apa syarat TKT dan mitra industri untuk Hiliriset SINERGI Kemdiktisaintek? Atau: Apakah HSP membuka hibah biosekuriti untuk universitas Indonesia?",
    aiSearchBtn: "Cari Panduan Resmi",
    aiSearching: "Menelusuri panduan resmi…",
    cycleTitle: "Kalender Siklus Tahunan, Umpan API Langsung & Pengecualian",
    cycleSub:
      "Bulan-bulan ketika tiap skema biasanya membuka pendaftaran. Siklus nasional Indonesia (BIMA DPPM & BRIN) memuncak pada November–Desember, sedangkan hibah internal UGM dibuka Januari–Maret.",
  },
  en: {
    brandSubtitle:
      "Centralized database for Health, Social Science & Road Safety grants — Indonesian (BIMA, LPDP, BRIN, Hiliriset, UGM) & International (WHO, HSP, UKRI, CDC, USA, ASEAN, Wellcome).",
    navRadar: "Radar",
    navDatabase: "Database",
    navGuidelines: "Guidelines",
    navPipeline: "Pipeline",
    navCycles: "Cycles & Portals",
    ctaAlerts: "Email Alerts",
    statOpenCalls: "calls with active deadlines",
    statClosing30: "closing within ≤ 30 days",
    statClosing90: "closing within ≤ 90 days",
    statLeadEligible: "Indonesia Lead-PI eligible",
    statInPipeline: "tracked in team pipeline",
    statAlertMatches: "matching email alert rules",
    timelineEyebrow: "12-Month Upcoming Deadline Horizon",
    todayLabel: "today",
    openNowTitle: "Currently Open & Active Calls",
    openNowSub:
      "Calls with confirmed upcoming deadlines or permanently open rolling windows, sorted by closing urgency.",
    reopeningSoonTitle: "Reopening Soon (Next 3 Months)",
    reopeningSoonSub:
      "Recurring schemes whose historical opening window falls within the next three months — start preparing proposals and partner letters now.",
    searchPlaceholder:
      "Search scheme name, funder (WHO, HSP, BIMA, LPDP, BRIN, UGM, UKRI, ASEAN), keywords, or NOFO ID…",
    resetFilters: "Reset Filters",
    exportCsv: "Export CSV",
    exportJson: "Backup JSON",
    importJson: "Import JSON",
    daysLeft: "days left",
    daysPast: "days ago",
    rollingYear: "year-round",
    rollingTag: "rolling",
    cycleTag: "cycle",
    irregularTag: "irregular",
    inPipelineTag: "In Pipeline",
    trackInPipeline: "+ Track in Pipeline",
    alreadyInPipeline: "In Pipeline",
    openOfficialPage: "Official Portal",
    aboutLabel: "Scope",
    eligibilityLabel: "Indonesia Eligibility",
    deadlineLabel: "Deadline & Cycle",
    amountLabel: "Award Value",
    themesLabel: "Domains & Themes",
    oppNumberLabel: "Opportunity ID",
    addCustomGrant: "+ Add Custom Grant",
    pipelineTitle: "Personalized Application Pipeline & Deadline Dashboard",
    pipelineSub:
      "Track proposal preparation stages, submission requirement checklists, team owners, and upcoming deadlines.",
    guidelinesTitle: "Grant Guideline Library & Live AI Eligibility Finder",
    guidelinesSub:
      "Browse structured requirement breakdowns (BIMA, Hiliriset, LPDP, BRIN, UGM, UKRI, NIH, WHO, HSP) or run a live Google-grounded search to verify specific call guidelines.",
    aiSearchTitle: "AI-Assisted Live Guideline & Eligibility Search (Google Search Grounded)",
    aiSearchPlaceholder:
      "e.g., What are the TKT and partner requirements for Kemdiktisaintek Hiliriset SINERGI? Or: Does HSP have open biosecurity grants for Indonesia?",
    aiSearchBtn: "Search Official Guidelines",
    aiSearching: "Searching official guidelines…",
    cycleTitle: "Annual Opening Cycle Calendar, Live API Feeds & Exclusions",
    cycleSub:
      "Months when each scheme typically opens. Indonesian national schemes (BIMA DPPM & BRIN) peak in November–December, while UGM internal grants open January–March.",
  }
};
