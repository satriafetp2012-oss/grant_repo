import React, { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Plus, Check, AlertTriangle } from "lucide-react";
import { RawGrantEntry, Language } from "../types/grants";
import { MONTHS_SHORT, STATUS_LABELS, ROLE_LABELS, UI_TEXT } from "../utils/i18n";
import { classifyOrganizationGroup } from "../data/grantsData";

interface GrantCardProps {
  grant: RawGrantEntry;
  lang: Language;
  isTracked: boolean;
  onTrack: (grantId: string) => void;
  defaultExpanded?: boolean;
}

export function daysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(deadline + "T00:00:00");
  if (isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

export function formatDeadlineDate(deadline: string | null, lang: Language): string {
  if (!deadline) return "";
  const d = new Date(deadline + "T00:00:00");
  if (isNaN(d.getTime())) return deadline;
  return `${d.getDate()} ${MONTHS_SHORT[lang][d.getMonth()]} ${d.getFullYear()}`;
}

export const GrantCard: React.FC<GrantCardProps> = ({
  grant,
  lang,
  isTracked,
  onTrack,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const t = UI_TEXT[lang];
  const days = daysUntilDeadline(grant.dl);
  const isPast = days !== null && days < 0;
  const orgGroup = classifyOrganizationGroup(grant);
  const grantId = grant.id || grant.n;

  const renderCountdownColumn = () => {
    if (days !== null && days >= 0) {
      const colorClass =
        days <= 30
          ? "text-[var(--crit)]"
          : days <= 90
          ? "text-[var(--warn)]"
          : "text-[var(--accent)]";
      return (
        <div className="text-center pt-0.5">
          <div className={`font-mono tabular-nums text-xl font-semibold leading-none ${colorClass}`}>
            {days}
          </div>
          <span className="block text-[11px] text-[var(--faint)] mt-1">
            {t.daysLeft}
          </span>
        </div>
      );
    }
    if (days !== null && days < 0) {
      return (
        <div className="text-center pt-0.5">
          <div className="font-mono tabular-nums text-xs text-[var(--faint)] leading-tight">
            {-days}d
          </div>
          <span className="block text-[11px] text-[var(--faint)] mt-1">
            {t.daysPast}
          </span>
        </div>
      );
    }
    if (grant.win && grant.win.length >= 10) {
      return (
        <div className="text-center pt-0.5">
          <div className="font-mono text-xs text-[var(--accent)] font-medium leading-tight">
            {t.rollingTag}
          </div>
          <span className="block text-[11px] text-[var(--faint)] mt-1">
            {t.rollingYear}
          </span>
        </div>
      );
    }
    if (grant.win && grant.win.length > 0) {
      const sorted = [...grant.win].sort((a, b) => a - b);
      const winStr =
        sorted.length > 3
          ? `${MONTHS_SHORT[lang][sorted[0] - 1]}–${MONTHS_SHORT[lang][sorted[sorted.length - 1] - 1]}`
          : sorted.map((m) => MONTHS_SHORT[lang][m - 1]).join(" · ");
      return (
        <div className="text-center pt-0.5">
          <div className="font-mono text-xs text-[var(--ink-2)] leading-tight">
            {winStr}
          </div>
          <span className="block text-[11px] text-[var(--faint)] mt-1">
            {t.cycleTag}
          </span>
        </div>
      );
    }
    return (
      <div className="text-center pt-0.5">
        <div className="font-mono text-xs text-[var(--faint)]">—</div>
        <span className="block text-[11px] text-[var(--faint)] mt-1">
          {t.irregularTag}
        </span>
      </div>
    );
  };

  const statusText = isPast
    ? STATUS_LABELS[lang].past
    : STATUS_LABELS[lang][grant.st] || grant.st;
  const roleText = ROLE_LABELS[lang][grant.el] || grant.el;

  return (
    <article
      id={`grant-${grantId}`}
      className="bg-[var(--surface)] border border-[var(--line)] rounded-[10px] overflow-hidden transition-colors"
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        className="w-full text-left grid grid-cols-[76px_1fr_auto] gap-4 items-start p-4 cursor-pointer hover:bg-[var(--surface-2)] transition-colors"
      >
        {renderCountdownColumn()}

        <div className="min-w-0">
          <div className="font-display font-semibold text-[15.5px] leading-snug text-[var(--ink)]">
            {grant.n}
          </div>
          <div className="text-[13px] text-[var(--muted)] mt-0.5">
            {grant.f}
            {grant.reg ? ` · ${grant.reg}` : ""}
            {orgGroup ? ` · ${orgGroup}` : ""}
          </div>

          {/* Unboxed clean inline metadata per Zero-Pill Discipline */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-[var(--muted)]">
            <span
              className={
                isPast
                  ? "text-[var(--faint)] font-medium"
                  : grant.st === "live"
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--info)] font-medium"
              }
            >
              {statusText}
            </span>
            <span aria-hidden="true">·</span>
            <span
              className={
                grant.el === "lead"
                  ? "text-[var(--accent)] font-medium"
                  : grant.el === "partner"
                  ? "text-[var(--warn)] font-medium"
                  : "text-[var(--ink-2)]"
              }
            >
              {roleText}
            </span>
            {(grant.domains || []).map((dom) => (
              <React.Fragment key={dom}>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--ink-2)] font-medium">{dom}</span>
              </React.Fragment>
            ))}
            {(grant.th || []).slice(0, 3).map((th) => (
              <React.Fragment key={th}>
                <span aria-hidden="true">/</span>
                <span>{th}</span>
              </React.Fragment>
            ))}
            {isTracked && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--accent)] font-semibold">
                  ✓ {t.inPipelineTag}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="font-mono tabular-nums text-xs text-[var(--ink-2)] text-right max-w-[220px]">
            {grant.amt || "—"}
          </div>
          {grant.dl && (
            <div className="font-mono tabular-nums text-xs text-[var(--muted)]">
              {formatDeadlineDate(grant.dl, lang)}
            </div>
          )}
          <span className="text-[var(--faint)] mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--line-soft)] bg-[var(--surface-2)] px-4 py-4 text-[14px]">
          {grant.warn && (
            <div className="flex items-start gap-2.5 bg-[var(--warn-soft)] border border-[var(--warn-line)] text-[var(--warn)] px-3.5 py-2.5 rounded-lg text-[13px] mb-3.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{grant.warn}</span>
            </div>
          )}

          <dl className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-2 mb-4">
            <dt className="text-xs font-semibold text-[var(--faint)]">
              {t.aboutLabel}
            </dt>
            <dd className="text-[var(--ink-2)] m-0">{grant.d || "—"}</dd>

            <dt className="text-xs font-semibold text-[var(--faint)]">
              {t.eligibilityLabel}
            </dt>
            <dd className="text-[var(--ink-2)] m-0">{grant.eln || "—"}</dd>

            <dt className="text-xs font-semibold text-[var(--faint)]">
              {t.deadlineLabel}
            </dt>
            <dd className="text-[var(--ink-2)] m-0">
              {grant.dl && (
                <strong className="font-mono tabular-nums mr-1.5">
                  {formatDeadlineDate(grant.dl, lang)}.
                </strong>
              )}
              {grant.dlnote || (grant.dl ? "" : "—")}
            </dd>

            <dt className="text-xs font-semibold text-[var(--faint)]">
              {t.amountLabel}
            </dt>
            <dd className="font-mono tabular-nums text-[13px] text-[var(--ink-2)] m-0">
              {grant.amt || "—"}
            </dd>

            <dt className="text-xs font-semibold text-[var(--faint)]">
              {t.themesLabel}
            </dt>
            <dd className="text-[var(--ink-2)] m-0">
              {[...(grant.domains || []), ...(grant.th || [])].join(" · ") || "—"}
            </dd>

            {grant.on && (
              <>
                <dt className="text-xs font-semibold text-[var(--faint)]">
                  {t.oppNumberLabel}
                </dt>
                <dd className="font-mono tabular-nums text-xs text-[var(--ink-2)] m-0">
                  {grant.on}
                </dd>
              </>
            )}
          </dl>

          <div className="flex flex-wrap items-center gap-2.5">
            {grant.u && (
              <a
                href={grant.u}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--accent-line)] hover:text-[var(--ink)] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.openOfficialPage}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onTrack(grantId)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isTracked
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]"
                  : "bg-[var(--accent)] text-white dark:text-[#06201B] border border-[var(--accent)] hover:brightness-105"
              }`}
            >
              {isTracked ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.alreadyInPipeline}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.trackInPipeline}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
