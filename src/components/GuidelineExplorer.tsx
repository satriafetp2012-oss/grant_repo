import React, { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  BookOpen,
  Globe,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { GUIDELINES_LIBRARY } from "../data/guidelinesData";
import { Language, ResearchDomain } from "../types/grants";
import { UI_TEXT } from "../utils/i18n";

interface GuidelineExplorerProps {
  lang: Language;
}

const SAMPLE_AI_QUERIES: Record<Language, string[]> = {
  id: [
    "Syarat TKT, SINTA score, dan kuota proposal BIMA Kemdiktisaintek (PF, Terapan, RIKUB)",
    "Bagaimana cara universitas Indonesia melamar NIH setelah penghapusan subaward asing (PF5/RF2)?",
    "Peluang hibah Health Security Partners (HSP) biosekuriti & One Health untuk peneliti Indonesia",
    "Panduan Hibah Dana Masyarakat FK-KMK UGM & Rekognisi Tugas Akhir (RTA) UGM",
    "Aturan Co-Lead Internasional 100% DAC pada hibah UKRI (MRC & ESRC Social Science)",
    "Syarat dan cakupan hibah riset keselamatan jalan ASEAN NCAP ANCHOR & Bloomberg BICI",
  ],
  en: [
    "BIMA Kemdiktisaintek TKT, SINTA score, and proposal quota rules (PF, Applied, RIKUB)",
    "How do Indonesian universities apply for NIH grants under the new PF5/RF2 linked award rule?",
    "Health Security Partners (HSP) biosecurity and One Health grant guidelines for Indonesia",
    "UGM Internal Grants: FK-KMK Dana Masyarakat, Teuku Jacob Fellowship & LPPM RTA guidelines",
    "UKRI 100% OECD DAC International Co-Lead funding rules for MRC & ESRC Social Science",
    "ASEAN NCAP ANCHOR & Bloomberg BICI road safety grant requirements for Indonesian teams",
  ],
};

export const GuidelineExplorer: React.FC<GuidelineExplorerProps> = ({ lang }) => {
  const t = UI_TEXT[lang];
  const [libraryFilter, setLibraryFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState<ResearchDomain | "ALL">("ALL");
  const [originFilter, setOriginFilter] = useState<"ALL" | "IDN" | "INT">("ALL");

  // AI Grounded Guideline Search state
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    answer: string;
    sources: { title: string; uri: string }[];
    timestamp: string;
  } | null>(null);

  const filteredGuidelines = useMemo(() => {
    return GUIDELINES_LIBRARY.filter((item) => {
      if (originFilter !== "ALL" && item.origin !== originFilter) return false;
      if (domainFilter !== "ALL" && !item.domains.includes(domainFilter)) return false;
      if (libraryFilter.trim()) {
        const hay = `${item.funder} ${item.schemeName} ${item.eligibilitySummaryId} ${item.eligibilitySummaryEn} ${item.requirementsId.join(" ")} ${item.requirementsEn.join(" ")}`.toLowerCase();
        if (!hay.includes(libraryFilter.toLowerCase().trim())) return false;
      }
      return true;
    });
  }, [libraryFilter, domainFilter, originFilter]);

  const runLiveGuidelineSearch = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/guidelines/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          lang,
          domainFilter: domainFilter === "ALL" ? "" : domainFilter,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch live guidelines.");
      }
      setAiResult(data);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Unable to complete live guideline search."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-lg font-bold text-[var(--ink)]">
          {t.guidelinesTitle}
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-4xl">
          {t.guidelinesSub}
        </p>
      </div>

      {/* Live AI-Assisted Guideline & Eligibility Search Box */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="font-display font-semibold text-base text-[var(--ink)]">
              {t.aiSearchTitle}
            </h3>
          </div>
          <span className="text-xs text-[var(--faint)] font-mono">
            Google Search Grounded · NOFO / Panduan Analyzer
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runLiveGuidelineSearch(aiQuery);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <input
            type="search"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder={t.aiSearchPlaceholder}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-semibold hover:brightness-105 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.aiSearching}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{t.aiSearchBtn}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick example queries */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--faint)] mr-1">
            {lang === "id" ? "Pertanyaan populer:" : "Quick queries:"}
          </span>
          {SAMPLE_AI_QUERIES[lang].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setAiQuery(q);
                runLiveGuidelineSearch(q);
              }}
              className="text-xs px-2.5 py-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:border-[var(--accent-line)] hover:text-[var(--ink)] transition-colors cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {aiError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-[var(--crit-line)] bg-[var(--crit-soft)] text-[var(--crit)] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{aiError}</span>
          </div>
        )}

        {aiResult && (
          <div className="p-4 rounded-lg border border-[var(--accent-line)] bg-[var(--surface-2)] space-y-3">
            <div className="text-sm text-[var(--ink)] whitespace-pre-wrap leading-relaxed">
              {aiResult.answer}
            </div>
            {aiResult.sources && aiResult.sources.length > 0 && (
              <div className="pt-3 border-t border-[var(--line-soft)]">
                <div className="text-xs font-semibold text-[var(--faint)] mb-1.5">
                  {lang === "id"
                    ? "Sumber Web Resmi yang Dirujuk:"
                    : "Verified Official Web Sources:"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiResult.sources.map((s) => (
                    <a
                      key={s.uri}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline bg-[var(--surface)] px-2.5 py-1 rounded border border-[var(--line)]"
                    >
                      <span className="truncate max-w-[260px]">{s.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Built-in Structured Guideline Library Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-display font-semibold text-base text-[var(--ink)]">
            {lang === "id"
              ? "Pustaka Ringkasan Panduan Resmi Terkurasi"
              : "Curated Official Grant Guideline Repository"}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={libraryFilter}
            onChange={(e) => setLibraryFilter(e.target.value)}
            placeholder={
              lang === "id"
                ? "Saring pustaka panduan (mis. BIMA, UGM, LPDP, NIH)…"
                : "Filter guideline library (e.g., BIMA, UGM, LPDP, NIH)…"
            }
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] min-w-[220px]"
          />
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
            {(["ALL", "IDN", "INT"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOriginFilter(o)}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  originFilter === o
                    ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {o === "ALL"
                  ? lang === "id"
                    ? "Semua"
                    : "All"
                  : o === "IDN"
                  ? "Indonesia & UGM"
                  : "International"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
            {(["ALL", "Health", "Social Science", "Road Safety"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomainFilter(d)}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                  domainFilter === d
                    ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {d === "ALL" ? (lang === "id" ? "Semua Domain" : "All Domains") : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guideline Cards */}
      <div className="space-y-4">
        {filteredGuidelines.map((g) => {
          const reqs = lang === "id" ? g.requirementsId : g.requirementsEn;
          const docs = lang === "id" ? g.documentsId : g.documentsEn;
          const summary = lang === "id" ? g.eligibilitySummaryId : g.eligibilitySummaryEn;

          return (
            <div
              key={g.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[var(--line-soft)] pb-3.5">
                <div>
                  <div className="text-xs text-[var(--accent)] font-semibold">
                    {g.funder} · {g.origin === "IDN" ? "Indonesia" : "International"} ·{" "}
                    {g.domains.join(" / ")}
                  </div>
                  <h4 className="font-display font-bold text-base text-[var(--ink)] mt-0.5">
                    {g.schemeName}
                  </h4>
                </div>
                <a
                  href={g.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-2)] text-xs font-medium text-[var(--ink-2)] hover:border-[var(--accent-line)] hover:text-[var(--ink)] whitespace-nowrap shrink-0"
                >
                  <span>{g.portalName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Key parameter strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--surface-2)] p-3 rounded-lg border border-[var(--line-soft)] text-xs">
                <div>
                  <span className="block text-[var(--faint)] font-semibold">
                    {lang === "id" ? "Tingkat Kesiapterapan (TKT / TRL)" : "Readiness Level (TKT / TRL)"}
                  </span>
                  <span className="font-mono text-[var(--ink-2)] mt-0.5 block">
                    {g.tktRange}
                  </span>
                </div>
                <div>
                  <span className="block text-[var(--faint)] font-semibold">
                    {lang === "id" ? "Plafon Anggaran & Overhead" : "Budget & Indirect Cost Cap"}
                  </span>
                  <span className="font-mono tabular-nums text-[var(--ink-2)] mt-0.5 block">
                    {g.budgetCap} ({g.overheadCap})
                  </span>
                </div>
                <div>
                  <span className="block text-[var(--faint)] font-semibold">
                    {lang === "id" ? "Jendela Siklus Tahunan" : "Typical Opening Window"}
                  </span>
                  <span className="font-mono text-[var(--ink-2)] mt-0.5 block">
                    {g.cycleWindow}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[var(--ink-2)] leading-relaxed">{summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                    <span>
                      {lang === "id"
                        ? "Ketentuan Teknis & Kelayakan Utama"
                        : "Key Technical & Eligibility Rules"}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--ink-2)] pl-5 list-disc">
                    {reqs.map((r, i) => (
                      <li key={i} className="leading-relaxed">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]">
                    <FileText className="w-4 h-4 text-[var(--info)]" />
                    <span>
                      {lang === "id"
                        ? "Dokumen & Prasyarat Wajib"
                        : "Mandatory Submission Documents"}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--ink-2)] pl-5 list-disc">
                    {docs.map((d, i) => (
                      <li key={i} className="leading-relaxed">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
