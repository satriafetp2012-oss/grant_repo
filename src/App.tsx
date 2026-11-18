import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Bell,
  Download,
  Upload,
  Sun,
  Moon,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import {
  GRANTS,
  EXCLUDED,
  PORTALS,
  WATCH,
  classifyOrganizationGroup,
  slugifyGrant,
} from "./data/grantsData";
import {
  AlertRule,
  EligibilityRole,
  GrantOrigin,
  GrantStatus,
  Language,
  PipelineItem,
  PipelineStage,
  RawGrantEntry,
  ResearchDomain,
  TrackerState,
} from "./types/grants";
import {
  MONTHS_SHORT,
  PIPELINE_STAGES,
  ROLE_LABELS,
  STATUS_LABELS,
  UI_TEXT,
} from "./utils/i18n";
import {
  GrantCard,
  daysUntilDeadline,
  formatDeadlineDate,
} from "./components/GrantCard";
import { EmailAlertModal, matchGrantToRule } from "./components/EmailAlertModal";
import { GuidelineExplorer } from "./components/GuidelineExplorer";
import { PipelineBoard } from "./components/PipelineBoard";
import { CyclesAndPortalsView } from "./components/CyclesAndPortalsView";

const STORAGE_KEY = "grant-radar-id-state-v2";

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: "default-idn-ugm",
    name: "Hibah Nasional & Internal UGM (BIMA, Hiliriset, LPDP, BRIN, UGM)",
    recipientEmail: "satriafetp2012@gmail.com",
    frequency: "weekly",
    keywords: ["UGM", "BIMA", "Hiliriset", "LPDP", "BRIN", "RIIM", "RTA"],
    domains: ["Health", "Social Science", "Road Safety"],
    origins: ["IDN"],
    roles: ["lead", "fellowship", "partner"],
    onlyOpenOrSoon: true,
    enabled: true,
    createdAt: 1730000000000,
  },
  {
    id: "default-road-safety",
    name: "Road Safety, Injury & Urban Mobility (ASEAN, Bloomberg, Botnar)",
    recipientEmail: "satriafetp2012@gmail.com",
    frequency: "weekly",
    keywords: [],
    domains: ["Road Safety"],
    origins: ["IDN", "INT"],
    roles: ["lead", "partner", "institution", "fellowship"],
    onlyOpenOrSoon: false,
    enabled: true,
    createdAt: 1730000001000,
  },
  {
    id: "default-intl-health-social",
    name: "Global Health & Social Science (WHO, HSP, UKRI, CDC, Wellcome)",
    recipientEmail: "satriafetp2012@gmail.com",
    frequency: "weekly",
    keywords: ["WHO", "HSP", "UKRI", "CDC", "Wellcome", "ESRC", "NIH"],
    domains: ["Health", "Social Science"],
    origins: ["INT", "IDN"],
    roles: ["lead", "partner", "fellowship"],
    onlyOpenOrSoon: true,
    enabled: true,
    createdAt: 1730000002000,
  },
];

const DEFAULT_PIPELINE_ITEMS: Record<string, PipelineItem> = {
  [slugifyGrant("LPPM UGM — Program Rekognisi Tugas Akhir (RTA)")]: {
    s: "prep",
    owner: "Tim Riset UGM",
    note: "Siapkan draf manuskrip bersama mahasiswa bimbingan untuk pembukaan SIMASTER.",
    ts: Date.now() - 86400000 * 3,
    tasks: [
      { id: "tk-1", text: "Konfirmasi NIM & surat kesediaan mahasiswa di SIMASTER", done: true },
      { id: "tk-2", text: "Susun RAB sesuai plafon RTA UGM (Rp 12–20 juta)", done: false },
    ],
  },
  [slugifyGrant("Penelitian Fundamental (PF) — BIMA Kemdiktisaintek")]: {
    s: "watch",
    owner: "Ketua Peneliti",
    note: "Sinkronisasi skor SINTA & PDDIKTI sebelum jendela BIMA ditutup akhir Desember.",
    ts: Date.now() - 86400000 * 2,
    tasks: [
      { id: "tk-3", text: "Cek pemenuhan luaran hibah sebelumnya di BIMA", done: true },
      { id: "tk-4", text: "Finalisasi substansi TKT 1–3 & persetujuan LPPM", done: false },
    ],
  },
  [slugifyGrant("HSP — Health Security Futures Fellowships & Biosecurity Challenge Grants (Indonesia)")]: {
    s: "watch",
    owner: "Tim Epidemiologi / One Health",
    note: "Cocok untuk surveilans laboratorium dan biosekuriti di Indonesia.",
    ts: Date.now() - 86400000,
  },
};

export default function App() {
  const [lang, setLang] = useState<Language>("id");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<
    "radar" | "database" | "guidelines" | "pipeline" | "cycles"
  >("radar");
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Global quick domain filter
  const [globalDomain, setGlobalDomain] = useState<ResearchDomain | "ALL">("ALL");

  // Search & multi-facet state in Database view
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrigins, setSelectedOrigins] = useState<Set<GrantOrigin>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<GrantStatus>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<EligibilityRole>>(new Set());
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persistent state
  const [trackerState, setTrackerState] = useState<TrackerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          items: parsed.items || DEFAULT_PIPELINE_ITEMS,
          custom: parsed.custom || [],
          checks: parsed.checks || {},
          alerts: parsed.alerts || DEFAULT_ALERT_RULES,
          dismissedMatches: parsed.dismissedMatches || [],
          v: 2,
          ts: parsed.ts || Date.now(),
        };
      }
    } catch {
      // ignore parse error
    }
    return {
      items: DEFAULT_PIPELINE_ITEMS,
      custom: [],
      checks: {},
      alerts: DEFAULT_ALERT_RULES,
      dismissedMatches: [],
      v: 2,
      ts: Date.now(),
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerState));
    } catch {
      // ignore storage quota errors
    }
  }, [trackerState]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const t = UI_TEXT[lang];

  // Merged catalog: curated + custom team grants
  const allGrants = useMemo<RawGrantEntry[]>(() => {
    return [
      ...GRANTS,
      ...trackerState.custom.map((c) => ({ ...c, custom: true })),
    ];
  }, [trackerState.custom]);

  // Domain-filtered base grants
  const domainFilteredGrants = useMemo(() => {
    if (globalDomain === "ALL") return allGrants;
    return allGrants.filter((g) => (g.domains || []).includes(globalDomain));
  }, [allGrants, globalDomain]);

  // Tracked IDs set
  const trackedIds = useMemo(
    () => new Set(Object.keys(trackerState.items)),
    [trackerState.items]
  );

  // Alert rule matches count
  const matchedAlertGrantIds = useMemo(() => {
    const matched = new Set<string>();
    for (const g of allGrants) {
      const gid = g.id || g.n;
      for (const r of trackerState.alerts) {
        if (matchGrantToRule(g, r)) {
          matched.add(gid);
          break;
        }
      }
    }
    return matched;
  }, [allGrants, trackerState.alerts]);

  // Radar subsets
  const openDatedGrants = useMemo(() => {
    return domainFilteredGrants
      .filter((g) => {
        const d = daysUntilDeadline(g.dl);
        return (d !== null && d >= 0) || (g.st === "live" && !g.dl);
      })
      .sort((a, b) => {
        const da = daysUntilDeadline(a.dl) ?? 9999;
        const db = daysUntilDeadline(b.dl) ?? 9999;
        return da - db;
      });
  }, [domainFilteredGrants]);

  const reopeningSoonGrants = useMemo(() => {
    const nowM = new Date().getMonth() + 1;
    const next3 = [nowM, (nowM % 12) + 1, ((nowM + 1) % 12) + 1];
    return domainFilteredGrants
      .filter((g) => {
        const d = daysUntilDeadline(g.dl);
        const alreadyOpenDated = d !== null && d >= 0;
        if (alreadyOpenDated) return false;
        if (g.st === "resource" || g.st === "invite") return false;
        return (g.win || []).some((m) => next3.includes(m));
      })
      .sort((a, b) => (a.o === b.o ? 0 : a.o === "IDN" ? -1 : 1));
  }, [domainFilteredGrants]);

  // Facet options for Database view
  const organizationOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of domainFilteredGrants) {
      const grp = classifyOrganizationGroup(g);
      counts.set(grp, (counts.get(grp) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [domainFilteredGrants]);

  const themeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of domainFilteredGrants) {
      for (const th of g.th || []) {
        set.add(th);
      }
    }
    return Array.from(set).sort();
  }, [domainFilteredGrants]);

  // Filtered grants for Database view
  const searchedGrants = useMemo(() => {
    return domainFilteredGrants
      .filter((g) => {
        if (selectedOrigins.size > 0 && !selectedOrigins.has(g.o)) return false;
        if (selectedStatuses.size > 0 && !selectedStatuses.has(g.st)) return false;
        if (selectedRoles.size > 0 && !selectedRoles.has(g.el)) return false;
        if (selectedOrgs.size > 0 && !selectedOrgs.has(classifyOrganizationGroup(g))) {
          return false;
        }
        if (
          selectedThemes.size > 0 &&
          !(g.th || []).some((th) => selectedThemes.has(th))
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const hay = [
            g.n,
            g.f,
            g.d,
            g.eln,
            g.amt,
            g.dlnote,
            g.reg,
            g.on,
            ...(g.domains || []),
            ...(g.th || []),
          ]
            .join(" ")
            .toLowerCase();
          const words = searchQuery.toLowerCase().trim().split(/\s+/);
          if (!words.every((w) => hay.includes(w))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = daysUntilDeadline(a.dl);
        const db = daysUntilDeadline(b.dl);
        const rankA = da !== null && da >= 0 ? 0 : a.st === "live" ? 1 : a.st === "recurring" ? 2 : 3;
        const rankB = db !== null && db >= 0 ? 0 : b.st === "live" ? 1 : b.st === "recurring" ? 2 : 3;
        if (rankA !== rankB) return rankA - rankB;
        if (da !== null && db !== null && da >= 0 && db >= 0) return da - db;
        return a.n.localeCompare(b.n);
      });
  }, [
    domainFilteredGrants,
    selectedOrigins,
    selectedStatuses,
    selectedRoles,
    selectedOrgs,
    selectedThemes,
    searchQuery,
  ]);

  // Handlers
  const handleTrackGrant = (grantId: string) => {
    setTrackerState((prev) => {
      if (prev.items[grantId]) return prev;
      return {
        ...prev,
        ts: Date.now(),
        items: {
          ...prev.items,
          [grantId]: {
            s: "watch",
            owner: "",
            note: "",
            ts: Date.now(),
          },
        },
      };
    });
  };

  const handleUpdateStage = (grantId: string, stage: PipelineStage) => {
    setTrackerState((prev) => {
      const existing = prev.items[grantId];
      if (!existing) return prev;
      return {
        ...prev,
        ts: Date.now(),
        items: {
          ...prev.items,
          [grantId]: { ...existing, s: stage, ts: Date.now() },
        },
      };
    });
  };

  const handleUpdatePipelineItem = (grantId: string, updated: PipelineItem) => {
    setTrackerState((prev) => ({
      ...prev,
      ts: Date.now(),
      items: {
        ...prev.items,
        [grantId]: updated,
      },
    }));
  };

  const handleDeletePipelineItem = (grantId: string) => {
    setTrackerState((prev) => {
      const next = { ...prev.items };
      delete next[grantId];
      return {
        ...prev,
        ts: Date.now(),
        items: next,
      };
    });
  };

  const handleAddCustomGrant = (grant: RawGrantEntry, item: PipelineItem) => {
    const gid = grant.id || slugifyGrant(grant.n);
    setTrackerState((prev) => ({
      ...prev,
      ts: Date.now(),
      custom: [...prev.custom, { ...grant, id: gid }],
      items: {
        ...prev.items,
        [gid]: item,
      },
    }));
  };

  const handleSyncCustomGrant = (updatedGrant: RawGrantEntry) => {
    setTrackerState((prev) => ({
      ...prev,
      ts: Date.now(),
      custom: prev.custom.map((c) => (c.id === updatedGrant.id ? updatedGrant : c)),
    }));
  };

  const handleAddAlertRule = (rule: AlertRule) => {
    setTrackerState((prev) => ({
      ...prev,
      ts: Date.now(),
      alerts: [rule, ...prev.alerts],
    }));
  };

  const handleToggleAlertRule = (id: string) => {
    setTrackerState((prev) => ({
      ...prev,
      ts: Date.now(),
      alerts: prev.alerts.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    }));
  };

  const handleDeleteAlertRule = (id: string) => {
    setTrackerState((prev) => ({
      ...prev,
      ts: Date.now(),
      alerts: prev.alerts.filter((r) => r.id !== id),
    }));
  };

  const handleMarkPortalChecked = (key: string, byName: string) => {
    setTrackerState((prev) => ({
      ...prev,
      ts: Date.now(),
      checks: {
        ...prev.checks,
        [key]: { by: byName || "Tim", ts: Date.now() },
      },
    }));
  };

  const handleAddFeedGrantToPipeline = (feedItem: {
    title: string;
    agency: string;
    closeDate: string;
    url: string;
  }) => {
    const id = `${slugifyGrant(feedItem.title)}-feed-${Math.random()
      .toString(36)
      .slice(2, 5)}`;
    const isIso = /^\d{4}-\d{2}-\d{2}$/.test(feedItem.closeDate);
    const customGrant: RawGrantEntry = {
      id,
      n: feedItem.title,
      f: feedItem.agency || "Live API Feed",
      o: "INT",
      reg: "Global",
      th: ["Live API Feed"],
      domains: ["Health"],
      amt: "",
      dl: isIso ? feedItem.closeDate : null,
      dlnote: !isIso ? feedItem.closeDate : "",
      st: "live",
      el: "lead",
      eln: "Pulled from live API feed — verify Indonesian prime/partner eligibility on official portal.",
      d: "Imported from live open-API grant feed.",
      u: feedItem.url,
      win: [],
      custom: true,
    };
    handleAddCustomGrant(customGrant, {
      s: "watch",
      owner: "",
      note: "Imported from live API feed.",
      ts: Date.now(),
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "Scheme Name",
      "Funder",
      "Origin",
      "Region",
      "Domains",
      "Status",
      "Indonesia Role",
      "Opportunity ID",
      "Award Amount",
      "Deadline",
      "Deadline Note",
      "Themes",
      "Eligibility Details",
      "Official URL",
      "Pipeline Stage",
      "Team Owner",
      "Team Notes",
    ];
    const rows = [headers];
    for (const g of searchedGrants) {
      const gid = g.id || g.n;
      const pipe = trackerState.items[gid];
      const stageObj = pipe
        ? PIPELINE_STAGES.find((p) => p.k === pipe.s)
        : undefined;
      rows.push([
        g.n,
        g.f,
        g.o === "IDN" ? "Indonesia / UGM" : "International",
        g.reg || "",
        (g.domains || []).join("; "),
        STATUS_LABELS[lang][g.st] || g.st,
        ROLE_LABELS[lang][g.el] || g.el,
        g.on || "",
        g.amt || "",
        g.dl || "",
        g.dlnote || "",
        (g.th || []).join("; "),
        g.eln || "",
        g.u || "",
        stageObj ? (lang === "id" ? stageObj.id : stageObj.en) : "",
        pipe?.owner || "",
        pipe?.note || "",
      ]);
    }
    const csvContent =
      "\uFEFF" +
      rows
        .map((r) =>
          r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grant-radar-id-export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  // JSON Backup Export
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(trackerState, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grant-radar-workspace-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  // JSON Import
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === "object") {
          setTrackerState((prev) => ({
            ...prev,
            items: parsed.items || prev.items,
            custom: parsed.custom || prev.custom,
            checks: parsed.checks || prev.checks,
            alerts: parsed.alerts || prev.alerts,
            ts: Date.now(),
          }));
        }
      } catch {
        // ignore invalid file
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleSetFacet = <T,>(
    setObj: Set<T>,
    val: T,
    setter: React.Dispatch<React.SetStateAction<Set<T>>>
  ) => {
    const next = new Set(setObj);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    setter(next);
  };

  const resetAllDatabaseFilters = () => {
    setSearchQuery("");
    setSelectedOrigins(new Set());
    setSelectedStatuses(new Set());
    setSelectedRoles(new Set());
    setSelectedOrgs(new Set());
    setSelectedThemes(new Set());
  };

  // KPI metrics
  const closing30Count = openDatedGrants.filter((g) => {
    const d = daysUntilDeadline(g.dl);
    return d !== null && d >= 0 && d <= 30;
  }).length;
  const closing90Count = openDatedGrants.filter((g) => {
    const d = daysUntilDeadline(g.dl);
    return d !== null && d >= 0 && d <= 90;
  }).length;
  const leadEligibleCount = domainFilteredGrants.filter(
    (g) => g.el === "lead"
  ).length;

  // Timeline pins (within 365 days)
  const timelinePins = useMemo(() => {
    return openDatedGrants.filter((g) => {
      const d = daysUntilDeadline(g.dl);
      return d !== null && d >= 0 && d <= 365;
    });
  }, [openDatedGrants]);

  const timelineMonths = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const out: { label: string; leftPct: number }[] = [];
    for (let i = 0; i <= 12; i++) {
      const dt = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const offsetDays = Math.round((dt.getTime() - now.getTime()) / 86400000);
      if (offsetDays < 0 || offsetDays > 365) continue;
      const lbl = `${MONTHS_SHORT[lang][dt.getMonth()]}${
        dt.getMonth() === 0 ? " '" + String(dt.getFullYear()).slice(2) : ""
      }`;
      out.push({
        label: lbl,
        leftPct: 5 + (offsetDays / 365) * 90,
      });
    }
    return out;
  }, [lang]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      {/* ── TOP HEADER BAR (Strict 3-Zone Contract) ── */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)]">
        <div className="max-w-[1360px] mx-auto px-5 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#radar"
            onClick={(e) => {
              e.preventDefault();
              setActiveView("radar");
            }}
            className="font-display text-lg font-bold tracking-tight text-[var(--ink)] whitespace-nowrap shrink-0"
          >
            Grant Radar ID
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="flex items-center gap-6 overflow-x-auto text-sm font-medium text-[var(--muted)]"
          >
            {(
              [
                ["radar", t.navRadar, openDatedGrants.length],
                ["database", t.navDatabase, domainFilteredGrants.length],
                ["guidelines", t.navGuidelines, null],
                ["pipeline", t.navPipeline, trackedIds.size],
                ["cycles", t.navCycles, null],
              ] as const
            ).map(([key, label, count]) => {
              const isCurrent = activeView === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveView(key)}
                  className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurrent
                      ? "border-[var(--accent)] text-[var(--ink)] font-semibold"
                      : "border-transparent hover:text-[var(--ink)]"
                  }`}
                >
                  <span>{label}</span>
                  {count !== null && (
                    <span className="ml-1.5 font-mono tabular-nums text-xs text-[var(--faint)]">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action Button (Email Alerts) */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setAlertModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-semibold hover:brightness-105 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{t.ctaAlerts}</span>
              <span className="font-mono tabular-nums opacity-90">
                ({matchedAlertGrantIds.size})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── WORKSPACE CONTEXT & UTILITY STRIP (Below Header) ── */}
      <div className="bg-[var(--surface-2)] border-b border-[var(--line-soft)]">
        <div className="max-w-[1360px] mx-auto px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Domain Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--faint)] mr-1">
              {lang === "id" ? "Fokus Domain:" : "Domain Scope:"}
            </span>
            {(["ALL", "Health", "Social Science", "Road Safety"] as const).map(
              (dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setGlobalDomain(dom)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    globalDomain === dom
                      ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                      : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)]"
                  }`}
                >
                  {dom === "ALL"
                    ? lang === "id"
                      ? "Semua Domain (125+)"
                      : "All Domains (125+)"
                    : dom === "Health"
                    ? lang === "id"
                      ? "Kesehatan & Medis"
                      : "Health & Medicine"
                    : dom === "Social Science"
                    ? lang === "id"
                      ? "Ilmu Sosial & Kebijakan"
                      : "Social Science & Policy"
                    : lang === "id"
                    ? "Keselamatan Jalan & Cedera"
                    : "Road Safety & Injury"}
                </button>
              )
            )}
          </div>

          {/* Language, Theme & Data Portability Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bilingual ID / EN Switch */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  lang === "id"
                    ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  lang === "en"
                    ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer whitespace-nowrap"
              title="Toggle theme"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[var(--warn)]" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[var(--info)]" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t.exportCsv}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportJson}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.importJson}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportJson}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="max-w-[1360px] w-full mx-auto px-5 py-6 flex-1">
        {/* ─────────── 1. RADAR VIEW ─────────── */}
        {activeView === "radar" && (
          <div className="space-y-7">
            <p className="text-sm text-[var(--muted)]">{t.brandSubtitle}</p>

            {/* KPI Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3.5">
                <div className="font-mono tabular-nums text-2xl font-semibold text-[var(--accent)]">
                  {openDatedGrants.length}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {t.statOpenCalls}
                </div>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3.5">
                <div className="font-mono tabular-nums text-2xl font-semibold text-[var(--crit)]">
                  {closing30Count}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {t.statClosing30}
                </div>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3.5">
                <div className="font-mono tabular-nums text-2xl font-semibold text-[var(--warn)]">
                  {closing90Count}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {t.statClosing90}
                </div>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3.5">
                <div className="font-mono tabular-nums text-2xl font-semibold text-[var(--info)]">
                  {leadEligibleCount}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {t.statLeadEligible}
                </div>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActiveView("pipeline")}
                className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent-line)] rounded-xl p-3.5 cursor-pointer transition-colors"
              >
                <div className="font-mono tabular-nums text-2xl font-semibold text-[var(--ink)]">
                  {trackedIds.size}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {t.statInPipeline} ↗
                </div>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setAlertModalOpen(true)}
                className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent-line)] rounded-xl p-3.5 cursor-pointer transition-colors"
              >
                <div className="font-mono tabular-nums text-2xl font-semibold text-[var(--accent)]">
                  {matchedAlertGrantIds.size}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {t.statAlertMatches} ↗
                </div>
              </div>
            </div>

            {/* 12-Month Visual Pin Timeline */}
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 overflow-x-auto">
              <div className="text-xs font-semibold text-[var(--faint)] mb-3">
                {t.timelineEyebrow}
              </div>
              <div className="min-w-[820px]">
                <div className="relative h-[196px] mt-2">
                  {/* Axis line */}
                  <div className="absolute left-0 right-0 bottom-[26px] h-px bg-[var(--line)]" />
                  {/* Today marker */}
                  <div
                    className="absolute bottom-[26px] top-0 w-px bg-[var(--accent)] opacity-50"
                    style={{ left: "5%" }}
                  >
                    <span className="absolute -top-1 left-1.5 whitespace-nowrap text-[10px] font-semibold text-[var(--accent)]">
                      {t.todayLabel}
                    </span>
                  </div>

                  {/* Month ticks */}
                  {timelineMonths.map((m, idx) => (
                    <div
                      key={idx}
                      className="absolute bottom-0 -translate-x-1/2 text-center text-[11px] text-[var(--faint)] font-mono"
                      style={{ left: `${m.leftPct.toFixed(2)}%` }}
                    >
                      <i className="block w-px h-1.5 bg-[var(--line)] mx-auto mb-1" />
                      {m.label}
                    </div>
                  ))}

                  {/* Grant deadline pins */}
                  {timelinePins.map((g, idx) => {
                    const days = daysUntilDeadline(g.dl) ?? 0;
                    const leftPct = 5 + (days / 365) * 90;
                    const stemHeight = 14 + (idx % 6) * 24;
                    const dotColor =
                      days <= 30
                        ? "bg-[var(--crit)]"
                        : days <= 90
                        ? "bg-[var(--warn)]"
                        : "bg-[var(--accent)]";
                    const gid = g.id || g.n;

                    return (
                      <a
                        key={gid}
                        href={`#grant-${gid}`}
                        title={`${g.n} — ${formatDeadlineDate(g.dl, lang)}`}
                        className="absolute bottom-[26px] -translate-x-1/2 flex flex-col items-center group"
                        style={{ left: `${leftPct.toFixed(2)}%` }}
                      >
                        <div className="text-[10px] w-28 text-center text-[var(--ink-2)] group-hover:text-[var(--accent)] leading-tight bg-[var(--surface)] px-1 py-0.5 mb-0.5 rounded line-clamp-2">
                          {g.n}
                        </div>
                        <div
                          className="w-px bg-[var(--line)]"
                          style={{ height: `${stemHeight}px` }}
                        />
                        <div
                          className={`w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)] -mb-0.5 ${dotColor}`}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Open & Active Calls */}
            <section className="space-y-3">
              <div>
                <h2 className="font-display text-base font-bold text-[var(--ink)]">
                  {t.openNowTitle} ({openDatedGrants.length})
                </h2>
                <p className="text-xs text-[var(--muted)]">{t.openNowSub}</p>
              </div>
              <div className="space-y-2.5">
                {openDatedGrants.map((g) => {
                  const gid = g.id || g.n;
                  return (
                    <GrantCard
                      key={gid}
                      grant={g}
                      lang={lang}
                      isTracked={trackedIds.has(gid)}
                      onTrack={handleTrackGrant}
                    />
                  );
                })}
              </div>
            </section>

            {/* Reopening Soon (Next 3 Months) */}
            <section className="space-y-3 pt-4">
              <div>
                <h2 className="font-display text-base font-bold text-[var(--ink)]">
                  {t.reopeningSoonTitle} ({reopeningSoonGrants.length})
                </h2>
                <p className="text-xs text-[var(--muted)]">{t.reopeningSoonSub}</p>
              </div>
              <div className="space-y-2.5">
                {reopeningSoonGrants.map((g) => {
                  const gid = g.id || g.n;
                  return (
                    <GrantCard
                      key={gid}
                      grant={g}
                      lang={lang}
                      isTracked={trackedIds.has(gid)}
                      onTrack={handleTrackGrant}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ─────────── 2. SEARCHABLE DATABASE VIEW ─────────── */}
        {activeView === "database" && (
          <div className="space-y-5">
            {/* Search & Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label="Search grants"
                className="flex-1 min-w-[240px] px-3.5 py-2.5 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
              />
              <button
                type="button"
                onClick={resetAllDatabaseFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetFilters}</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{t.exportCsv}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">
              {/* Left Multi-Facet Filter Rail */}
              <aside className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 space-y-5 lg:sticky lg:top-20">
                {/* Funder / Organization Group */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--faint)]">
                    {lang === "id"
                      ? "Organisasi / Pemberi Dana"
                      : "Funder Organization"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {organizationOptions.map(([org, cnt]) => {
                      const active = selectedOrgs.has(org);
                      return (
                        <button
                          key={org}
                          type="button"
                          onClick={() =>
                            toggleSetFacet(selectedOrgs, org, setSelectedOrgs)
                          }
                          className={`px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                            active
                              ? "bg-[var(--accent)] text-white dark:text-[#06201B] border-[var(--accent)] font-medium"
                              : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {org}{" "}
                          <span className="font-mono tabular-nums opacity-75">
                            ({cnt})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Geographic Origin */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--faint)]">
                    {lang === "id" ? "Asal Pendanaan" : "Geographic Origin"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["IDN", lang === "id" ? "Nasional & UGM" : "Indonesia & UGM"],
                        ["INT", lang === "id" ? "Internasional" : "International"],
                      ] as [GrantOrigin, string][]
                    ).map(([code, lbl]) => {
                      const active = selectedOrigins.has(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() =>
                            toggleSetFacet(
                              selectedOrigins,
                              code,
                              setSelectedOrigins
                            )
                          }
                          className={`px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                            active
                              ? "bg-[var(--accent)] text-white dark:text-[#06201B] border-[var(--accent)] font-medium"
                              : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Indonesian Eligibility Role */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--faint)]">
                    {lang === "id" ? "Peran Indonesia" : "Indonesian Eligibility Role"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      ["lead", "partner", "fellowship", "institution"] as EligibilityRole[]
                    ).map((role) => {
                      const active = selectedRoles.has(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() =>
                            toggleSetFacet(selectedRoles, role, setSelectedRoles)
                          }
                          className={`px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                            active
                              ? "bg-[var(--accent)] text-white dark:text-[#06201B] border-[var(--accent)] font-medium"
                              : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {ROLE_LABELS[lang][role]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Call Status */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--faint)]">
                    {lang === "id" ? "Status Panggilan" : "Call Status"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        "live",
                        "recurring",
                        "closed",
                        "paused",
                        "invite",
                        "institution",
                        "resource",
                      ] as GrantStatus[]
                    ).map((st) => {
                      const active = selectedStatuses.has(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            toggleSetFacet(
                              selectedStatuses,
                              st,
                              setSelectedStatuses
                            )
                          }
                          className={`px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                            active
                              ? "bg-[var(--accent)] text-white dark:text-[#06201B] border-[var(--accent)] font-medium"
                              : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {STATUS_LABELS[lang][st]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Themes */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--faint)]">
                    {lang === "id" ? "Sub-Tema Riset" : "Research Sub-Themes"} (
                    {themeOptions.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
                    {themeOptions.map((th) => {
                      const active = selectedThemes.has(th);
                      return (
                        <button
                          key={th}
                          type="button"
                          onClick={() =>
                            toggleSetFacet(selectedThemes, th, setSelectedThemes)
                          }
                          className={`px-2.5 py-1 rounded-md text-xs border transition-colors cursor-pointer ${
                            active
                              ? "bg-[var(--accent)] text-white dark:text-[#06201B] border-[var(--accent)] font-medium"
                              : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {th}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Results Column */}
              <div className="space-y-3">
                <div className="text-xs text-[var(--muted)] font-mono tabular-nums">
                  {lang === "id"
                    ? `Menampilkan ${searchedGrants.length} dari ${domainFilteredGrants.length} skema pendanaan`
                    : `Showing ${searchedGrants.length} of ${domainFilteredGrants.length} grant schemes`}
                </div>

                {searchedGrants.length === 0 ? (
                  <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-10 text-center space-y-2">
                    <p className="text-sm text-[var(--muted)]">
                      {lang === "id"
                        ? "Tidak ada skema hibah yang cocok dengan kombinasi filter Anda."
                        : "No grant schemes match your current filter selection."}
                    </p>
                    <button
                      type="button"
                      onClick={resetAllDatabaseFilters}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-semibold cursor-pointer"
                    >
                      {t.resetFilters}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchedGrants.map((g) => {
                      const gid = g.id || g.n;
                      return (
                        <GrantCard
                          key={gid}
                          grant={g}
                          lang={lang}
                          isTracked={trackedIds.has(gid)}
                          onTrack={handleTrackGrant}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── 3. GUIDELINES VIEW ─────────── */}
        {activeView === "guidelines" && <GuidelineExplorer lang={lang} />}

        {/* ─────────── 4. PIPELINE VIEW ─────────── */}
        {activeView === "pipeline" && (
          <PipelineBoard
            lang={lang}
            items={trackerState.items}
            allGrants={allGrants}
            onUpdateStage={handleUpdateStage}
            onUpdateItem={handleUpdatePipelineItem}
            onDeleteItem={handleDeletePipelineItem}
            onAddCustomGrant={handleAddCustomGrant}
            onSyncCustomGrant={handleSyncCustomGrant}
          />
        )}

        {/* ─────────── 5. CYCLES & PORTALS VIEW ─────────── */}
        {activeView === "cycles" && (
          <CyclesAndPortalsView
            lang={lang}
            grants={domainFilteredGrants}
            portals={PORTALS}
            excluded={EXCLUDED}
            watchlist={WATCH}
            checks={trackerState.checks}
            onMarkChecked={handleMarkPortalChecked}
            onAddFeedGrantToPipeline={handleAddFeedGrantToPipeline}
          />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--line)] bg-[var(--surface)] mt-14 py-6">
        <div className="max-w-[1360px] mx-auto px-5 text-xs text-[var(--faint)] space-y-2">
          <p className="max-w-4xl">
            <strong className="text-[var(--ink-2)]">Grant Radar ID</strong> —{" "}
            {lang === "id"
              ? "Basis data terkurasi skema pendanaan riset Kesehatan, Ilmu Sosial & Keselamatan Jalan (BIMA Kemdiktisaintek, Hiliriset, LPDP, BRIN, UGM, WHO/TDR, HSP, UKRI, CDC, NIH, ASEAN, Wellcome). Selalu verifikasi buku panduan resmi terbaru sebelum menyusun anggaran."
              : "Curated database of Health, Social Science & Road Safety funding schemes (BIMA Kemdiktisaintek, Hiliriset, LPDP, BRIN, UGM, WHO/TDR, HSP, UKRI, CDC, NIH, ASEAN, Wellcome). Always verify official call guidelines prior to budget submission."}
          </p>
        </div>
      </footer>

      {/* ── AUTOMATED EMAIL ALERT MODAL ── */}
      <EmailAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        lang={lang}
        rules={trackerState.alerts}
        grants={allGrants}
        onAddRule={handleAddAlertRule}
        onToggleRule={handleToggleAlertRule}
        onDeleteRule={handleDeleteAlertRule}
        onTrackGrant={handleTrackGrant}
        trackedIds={trackedIds}
      />
    </div>
  );
}
