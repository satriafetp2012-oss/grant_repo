import React, { useState } from "react";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Ban,
  Globe2,
  CalendarDays,
  Loader2,
  Plus,
} from "lucide-react";
import {
  ExcludedFunder,
  Language,
  PortalEntry,
  RawGrantEntry,
  WatchEntry,
} from "../types/grants";
import { MONTHS_LONG, UI_TEXT } from "../utils/i18n";

interface CyclesAndPortalsViewProps {
  lang: Language;
  grants: RawGrantEntry[];
  portals: PortalEntry[];
  excluded: ExcludedFunder[];
  watchlist: WatchEntry[];
  checks: Record<string, { by: string; ts: number }>;
  onMarkChecked: (key: string, byName: string) => void;
  onAddFeedGrantToPipeline: (item: {
    title: string;
    agency: string;
    closeDate: string;
    url: string;
  }) => void;
}

export const CyclesAndPortalsView: React.FC<CyclesAndPortalsViewProps> = ({
  lang,
  grants,
  portals,
  excluded,
  watchlist,
  checks,
  onMarkChecked,
  onAddFeedGrantToPipeline,
}) => {
  const t = UI_TEXT[lang];
  const currentMonthIdx = new Date().getMonth();
  const [probing, setProbing] = useState(false);
  const [probeKeyword, setProbeKeyword] = useState("public health road safety social science");
  const [probeResults, setProbeResults] = useState<
    | {
        source: string;
        ok: boolean;
        count: number;
        items: { title: string; agency: string; closeDate: string; url: string }[];
        error?: string;
      }[]
    | null
  >(null);
  const [addedFeedUrls, setAddedFeedUrls] = useState<Set<string>>(new Set());
  const [checkerName, setCheckerName] = useState("Tim Peneliti");

  const runLiveFeedProbe = async () => {
    setProbing(true);
    try {
      const res = await fetch("/api/feeds/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: probeKeyword }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        setProbeResults(data.results);
      }
    } catch {
      setProbeResults([]);
    } finally {
      setProbing(false);
    }
  };

  // Group portals by category
  const portalGroups = portals.reduce<Record<string, PortalEntry[]>>((acc, p) => {
    acc[p.g] = acc[p.g] || [];
    acc[p.g].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {/* 1. 12-Month Seasonal Opening Cycle Calendar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[var(--accent)]" />
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                {t.cycleTitle}
              </h2>
            </div>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-4xl">
              {t.cycleSub}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--ink-2)] shrink-0">
            <span>
              <strong className="text-[var(--warn)]">[IDN]</strong>{" "}
              {lang === "id" ? "Nasional & UGM" : "Indonesia & UGM"}
            </span>
            <span>
              <strong className="text-[var(--accent)]">[INT]</strong>{" "}
              {lang === "id" ? "Internasional & ASEAN" : "International & ASEAN"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MONTHS_LONG[lang].map((monthName, idx) => {
            const mNum = idx + 1;
            const isCurrent = idx === currentMonthIdx;
            const monthGrants = grants
              .filter((g) => g.win && g.win.includes(mNum))
              .sort((a, b) =>
                a.o === b.o ? (a.n < b.n ? -1 : 1) : a.o === "IDN" ? -1 : 1
              );

            return (
              <div
                key={monthName}
                className={`bg-[var(--surface)] rounded-xl p-3.5 border transition-colors ${
                  isCurrent
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent-line)]"
                    : "border-[var(--line)]"
                }`}
              >
                <div className="flex items-baseline justify-between mb-2.5 pb-1.5 border-b border-[var(--line-soft)]">
                  <h3 className="font-display font-bold text-sm text-[var(--ink)]">
                    {monthName}
                    {isCurrent && (
                      <span className="ml-1.5 text-[11px] font-normal text-[var(--accent)]">
                        ({lang === "id" ? "Bulan ini" : "Current"})
                      </span>
                    )}
                  </h3>
                  <span className="font-mono tabular-nums text-xs text-[var(--faint)]">
                    {monthGrants.length}
                  </span>
                </div>

                {monthGrants.length === 0 ? (
                  <p className="text-xs text-[var(--faint)] italic">
                    {lang === "id" ? "Tidak ada jendela rutin" : "No fixed cycle"}
                  </p>
                ) : (
                  <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {monthGrants.map((g) => (
                      <li
                        key={g.id || g.n}
                        className="text-xs text-[var(--ink-2)] leading-snug flex items-baseline gap-1.5"
                      >
                        <span
                          className={`font-mono text-[10px] font-semibold shrink-0 ${
                            g.o === "IDN" ? "text-[var(--warn)]" : "text-[var(--accent)]"
                          }`}
                        >
                          {g.o}
                        </span>
                        <span>{g.n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Live Open-API Feed Prober (Grants.gov, UKRI, EU Horizon) */}
      <section className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-display font-bold text-base text-[var(--ink)]">
                {lang === "id"
                  ? "Penarik Umpan API Terbuka (Grants.gov, UKRI, EU Horizon)"
                  : "Live Open-API Grant Feed Prober (Grants.gov, UKRI, EU Horizon)"}
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {lang === "id"
                ? "Tarik panggilan terbaru secara langsung melalui server proxy bebas-CORS dan masukkan ke pipeline tim."
                : "Fetch live opportunities via our server-side proxy and add matches directly to your team pipeline."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={probeKeyword}
              onChange={(e) => setProbeKeyword(e.target.value)}
              placeholder="Keywords…"
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] min-w-[210px]"
            />
            <button
              type="button"
              onClick={runLiveFeedProbe}
              disabled={probing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {probing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === "id" ? "Menghubungi API…" : "Probing APIs…"}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === "id" ? "Tarik Umpan Terbaru" : "Fetch Live Feeds"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {probeResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            {probeResults.map((res) => (
              <div
                key={res.source}
                className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-2">
                  <span className="font-display font-semibold text-xs text-[var(--ink)]">
                    {res.source}
                  </span>
                  <span className="font-mono tabular-nums text-xs text-[var(--accent)]">
                    {res.ok ? `${res.count} hits` : "Offline"}
                  </span>
                </div>
                {res.items.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">
                    {res.error || "No items returned."}
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {res.items.map((it, idx) => {
                      const isAdded = addedFeedUrls.has(it.url + it.title);
                      return (
                        <li
                          key={idx}
                          className="text-xs bg-[var(--surface)] p-2.5 rounded border border-[var(--line-soft)] space-y-1"
                        >
                          <a
                            href={it.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--ink)] hover:text-[var(--accent)] hover:underline block leading-snug"
                          >
                            {it.title} ↗
                          </a>
                          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1">
                            <span>
                              {it.agency}
                              {it.closeDate ? ` · ${it.closeDate}` : ""}
                            </span>
                            <button
                              type="button"
                              disabled={isAdded}
                              onClick={() => {
                                onAddFeedGrantToPipeline(it);
                                setAddedFeedUrls((prev) =>
                                  new Set(prev).add(it.url + it.title)
                                );
                              }}
                              className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold hover:underline cursor-pointer disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isAdded ? "Added" : "Pipeline"}</span>
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Manual Portal Verification Watchlist */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-base text-[var(--ink)]">
              {lang === "id"
                ? "Daftar Cek Verifikasi Portal Pemberi Dana"
                : "Manual Funder Portal Verification Watchlist"}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              {lang === "id"
                ? "Tandai setelah portal resmi dibuka agar anggota tim tahu kapan terakhir kali jadwal diperiksa."
                : "Log when official portals were last inspected so your research team stays coordinated."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--faint)]">
              {lang === "id" ? "Pemeriksa:" : "Reviewer:"}
            </label>
            <input
              type="text"
              value={checkerName}
              onChange={(e) => setCheckerName(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {watchlist.map((w) => {
            const c = checks[w.k];
            const daysAgo = c
              ? Math.max(0, Math.round((Date.now() - c.ts) / 86400000))
              : null;

            return (
              <div
                key={w.k}
                className={`bg-[var(--surface)] rounded-xl p-3.5 border flex flex-col justify-between gap-2.5 ${
                  c ? "border-[var(--accent-line)]" : "border-[var(--line)]"
                }`}
              >
                <div>
                  <a
                    href={w.u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display font-semibold text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{w.n}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-xs text-[var(--muted)] mt-1">{w.why}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--line-soft)]">
                  <button
                    type="button"
                    onClick={() => onMarkChecked(w.k, checkerName)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>
                      {c
                        ? lang === "id"
                          ? "Tandai Ulang"
                          : "Re-verify"
                        : lang === "id"
                        ? "Tandai Sudah Dicek"
                        : "Mark Checked"}
                    </span>
                  </button>
                  {c && (
                    <span className="font-mono tabular-nums text-[11px] text-[var(--accent)]">
                      ✓ {c.by} · {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Official Portals Directory */}
      <section className="space-y-4">
        <h3 className="font-display font-bold text-base text-[var(--ink)]">
          {lang === "id"
            ? "Direktori Portal Resmi Nasional, UGM & Internasional"
            : "Official National, UGM & International Funding Portals"}
        </h3>
        {Object.entries(portalGroups).map(([groupName, list]) => (
          <div key={groupName} className="space-y-2">
            <div className="text-xs font-semibold text-[var(--faint)]">
              {groupName}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {list.map((p) => (
                <div
                  key={p.n}
                  className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-3.5"
                >
                  <a
                    href={p.u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display font-semibold text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{p.n}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-xs text-[var(--muted)] mt-1">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 5. Confirmed Exclusions */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Ban className="w-4 h-4 text-[var(--crit)]" />
          <h3 className="font-display font-bold text-base text-[var(--ink)]">
            {lang === "id"
              ? "Pengecualian Terkonfirmasi (Skema yang TIDAK Berlaku untuk Indonesia)"
              : "Confirmed Exclusions (Funders & Calls Ineligible for Indonesia)"}
          </h3>
        </div>
        <p className="text-xs text-[var(--muted)] max-w-4xl">
          {lang === "id"
            ? "Daftar ini mencegah tim peneliti menghabiskan berminggu-minggu menyusun proposal pada skema yang secara hukum atau geografis mengecualikan Indonesia (mis. aturan G20 UMIC pada Fogarty K43/D43 atau pembatasan 13 negara fokus BIGRS)."
            : "Prevents research teams from wasting weeks on calls that structurally exclude Indonesia (e.g., Fogarty G20 UMIC training exclusions or BIGRS 13-country focus bars)."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {excluded.map((ex) => (
            <div
              key={ex.n}
              className="bg-[var(--surface)] border border-[var(--crit-line)] rounded-xl p-4 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold text-sm text-[var(--ink)]">
                  {ex.n}
                </h4>
                <a
                  href={ex.u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline shrink-0"
                >
                  {lang === "id" ? "Sumber ↗" : "Source ↗"}
                </a>
              </div>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">{ex.why}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
