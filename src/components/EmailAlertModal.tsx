import React, { useState, useMemo } from "react";
import {
  X,
  Bell,
  Mail,
  Plus,
  Trash2,
  Copy,
  Download,
  Check,
  Send,
  Filter,
} from "lucide-react";
import {
  AlertRule,
  RawGrantEntry,
  Language,
  ResearchDomain,
  GrantOrigin,
  EligibilityRole,
} from "../types/grants";
import { daysUntilDeadline, formatDeadlineDate } from "./GrantCard";

interface EmailAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  rules: AlertRule[];
  grants: RawGrantEntry[];
  onAddRule: (rule: AlertRule) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onTrackGrant: (grantId: string) => void;
  trackedIds: Set<string>;
}

export function matchGrantToRule(grant: RawGrantEntry, rule: AlertRule): boolean {
  if (!rule.enabled) return false;

  if (rule.onlyOpenOrSoon) {
    const days = daysUntilDeadline(grant.dl);
    const nowMonth = new Date().getMonth() + 1;
    const nextMonths = [nowMonth, (nowMonth % 12) + 1, ((nowMonth + 1) % 12) + 1];
    const isOpen = (days !== null && days >= 0) || grant.st === "live";
    const isSoon = (grant.win || []).some((m) => nextMonths.includes(m));
    if (!isOpen && !isSoon) return false;
  }

  if (rule.origins.length > 0 && !rule.origins.includes(grant.o)) {
    return false;
  }

  if (rule.roles.length > 0 && !rule.roles.includes(grant.el)) {
    return false;
  }

  if (rule.domains.length > 0) {
    const gDomains = grant.domains || [];
    if (!rule.domains.some((d) => gDomains.includes(d))) {
      return false;
    }
  }

  if (rule.keywords.length > 0) {
    const hay = `${grant.n} ${grant.f} ${grant.d} ${grant.eln} ${grant.reg} ${(
      grant.th || []
    ).join(" ")}`.toLowerCase();
    const matchesKeyword = rule.keywords.some((kw) =>
      hay.includes(kw.toLowerCase().trim())
    );
    if (!matchesKeyword) return false;
  }

  return true;
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({
  isOpen,
  onClose,
  lang,
  rules,
  grants,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onTrackGrant,
  trackedIds,
}) => {
  const [activeTab, setActiveTab] = useState<"matches" | "rules" | "digest">("matches");
  const [ruleName, setRuleName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("satriafetp2012@gmail.com");
  const [frequency, setFrequency] = useState<"instant" | "weekly" | "monthly">("weekly");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<ResearchDomain[]>([
    "Health",
    "Social Science",
    "Road Safety",
  ]);
  const [selectedOrigins, setSelectedOrigins] = useState<GrantOrigin[]>(["IDN", "INT"]);
  const [selectedRoles, setSelectedRoles] = useState<EligibilityRole[]>(["lead", "partner", "fellowship"]);
  const [onlyOpenOrSoon, setOnlyOpenOrSoon] = useState(true);
  const [copiedDigest, setCopiedDigest] = useState(false);

  const matchedGrantsWithRules = useMemo(() => {
    const map = new Map<string, { grant: RawGrantEntry; matchedBy: string[] }>();
    for (const g of grants) {
      const gid = g.id || g.n;
      for (const r of rules) {
        if (matchGrantToRule(g, r)) {
          const existing = map.get(gid);
          if (existing) {
            existing.matchedBy.push(r.name);
          } else {
            map.set(gid, { grant: g, matchedBy: [r.name] });
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const da = daysUntilDeadline(a.grant.dl) ?? 999;
      const db = daysUntilDeadline(b.grant.dl) ?? 999;
      return da - db;
    });
  }, [grants, rules]);

  if (!isOpen) return null;

  const toggleItem = <T,>(arr: T[], val: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;
    const kwList = keywordsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: ruleName.trim(),
      recipientEmail: recipientEmail.trim() || "researcher@ugm.ac.id",
      frequency,
      keywords: kwList,
      domains: selectedDomains,
      origins: selectedOrigins,
      roles: selectedRoles,
      onlyOpenOrSoon,
      enabled: true,
      createdAt: Date.now(),
    };
    onAddRule(newRule);
    setRuleName("");
    setKeywordsInput("");
    setActiveTab("matches");
  };

  const primaryEmail =
    rules.find((r) => r.enabled && r.recipientEmail)?.recipientEmail ||
    recipientEmail ||
    "satriafetp2012@gmail.com";

  const generatePlainTextDigest = () => {
    const header =
      lang === "id"
        ? `GRANT RADAR ID — BULETIN PERINGATAN PENDANAAN RISET\nTanggal: ${new Date().toLocaleDateString("id-ID")}\nPenerima: ${primaryEmail}\nTotal Peluang Cocok: ${matchedGrantsWithRules.length}\n============================================================\n\n`
        : `GRANT RADAR ID — RESEARCH FUNDING ALERT DIGEST\nDate: ${new Date().toLocaleDateString("en-US")}\nRecipient: ${primaryEmail}\nTotal Matching Opportunities: ${matchedGrantsWithRules.length}\n============================================================\n\n`;

    const body = matchedGrantsWithRules
      .slice(0, 20)
      .map(({ grant, matchedBy }, idx) => {
        const dlText = grant.dl
          ? `${formatDeadlineDate(grant.dl, lang)} (${daysUntilDeadline(grant.dl)}d)`
          : grant.dlnote || "Recurring / Rolling";
        return `${idx + 1}. ${grant.n}\n   Funder: ${grant.f} (${grant.reg || grant.o})\n   Domains: ${(grant.domains || []).join(", ")}\n   Award: ${grant.amt || "See portal"}\n   Deadline: ${dlText}\n   Matched Alert Rule: ${matchedBy.join(", ")}\n   Official Link: ${grant.u}\n`;
      })
      .join("\n");

    return header + body;
  };

  const handleCopyDigest = async () => {
    try {
      await navigator.clipboard.writeText(generatePlainTextDigest());
      setCopiedDigest(true);
      setTimeout(() => setCopiedDigest(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleDownloadEml = () => {
    const subject =
      lang === "id"
        ? `[Grant Radar ID] ${matchedGrantsWithRules.length} Peluang Hibah Riset Baru (Kesehatan, Sosial & Keselamatan Jalan)`
        : `[Grant Radar ID] ${matchedGrantsWithRules.length} Matching Research Grant Opportunities`;
    const textBody = generatePlainTextDigest();
    const emlContent = [
      `To: ${primaryEmail}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      textBody,
    ].join("\r\n");

    const blob = new Blob([emlContent], { type: "message/rfc822;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grant-radar-email-alert.eml";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleMailto = () => {
    const subject = encodeURIComponent(
      lang === "id"
        ? `[Grant Radar ID] ${matchedGrantsWithRules.length} Peluang Hibah Riset Cocok`
        : `[Grant Radar ID] ${matchedGrantsWithRules.length} Matching Grant Opportunities`
    );
    const body = encodeURIComponent(generatePlainTextDigest().slice(0, 1800));
    window.location.href = `mailto:${encodeURIComponent(primaryEmail)}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[var(--accent)]" />
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                {lang === "id"
                  ? "Sistem Peringatan Email Otomatis & Notifikasi"
                  : "Automated Email Alerts & Notification Center"}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {lang === "id"
                  ? "Saring otomatis peluang pendanaan berdasarkan kata kunci riset, domain, dan kriteria geografis."
                  : "Automatically match funding opportunities by research keywords, domains, and geographic criteria."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[var(--surface-2)] border-b border-[var(--line-soft)]">
          <button
            type="button"
            onClick={() => setActiveTab("matches")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "matches"
                ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {lang === "id" ? "Peluang Cocok" : "Matched Grants"} (
            <span className="font-mono tabular-nums">{matchedGrantsWithRules.length}</span>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "rules"
                ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {lang === "id" ? "Aturan Langganan Alert" : "Alert Rules & Keywords"} (
            <span className="font-mono tabular-nums">{rules.length}</span>)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("digest")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "digest"
                ? "bg-[var(--accent)] text-white dark:text-[#06201B]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {lang === "id" ? "Pratinjau & Ekspor Buletin Email" : "Email Digest Preview & Export"}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "matches" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-[var(--muted)]">
                  {lang === "id"
                    ? `Menampilkan ${matchedGrantsWithRules.length} skema hibah yang cocok dengan aturan peringatan aktif Anda.`
                    : `Showing ${matchedGrantsWithRules.length} grant schemes matching your active alert rules.`}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("digest")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] text-xs font-medium cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {lang === "id" ? "Buka Buletin Email" : "Preview Email Digest"}
                  </span>
                </button>
              </div>

              {matchedGrantsWithRules.length === 0 ? (
                <div className="text-center py-10 text-sm text-[var(--muted)]">
                  {lang === "id"
                    ? "Belum ada skema yang cocok. Tambahkan atau aktifkan aturan peringatan di tab Aturan Langganan Alert."
                    : "No matching grants found. Add or enable an alert rule in the Alert Rules tab."}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {matchedGrantsWithRules.map(({ grant, matchedBy }) => {
                    const gid = grant.id || grant.n;
                    const tracked = trackedIds.has(gid);
                    const days = daysUntilDeadline(grant.dl);
                    return (
                      <div
                        key={gid}
                        className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-display font-semibold text-sm text-[var(--ink)]">
                            {grant.n}
                          </div>
                          <div className="text-xs text-[var(--muted)] mt-0.5">
                            {grant.f} · {grant.reg || grant.o} ·{" "}
                            <span className="font-mono tabular-nums">{grant.amt || "—"}</span>
                          </div>
                          <div className="text-[11px] text-[var(--accent)] mt-1">
                            {lang === "id" ? "Cocok dengan aturan:" : "Matched rule:"}{" "}
                            {matchedBy.join(" · ")}
                            {grant.dl && (
                              <>
                                {" · "}
                                <span className="font-mono tabular-nums">
                                  {formatDeadlineDate(grant.dl, lang)}
                                  {days !== null && days >= 0 ? ` (${days}d)` : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {grant.u && (
                            <a
                              href={grant.u}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink-2)] hover:text-[var(--ink)] whitespace-nowrap"
                            >
                              {lang === "id" ? "Portal ↗" : "Portal ↗"}
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onTrackGrant(gid)}
                            className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer whitespace-nowrap ${
                              tracked
                                ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]"
                                : "bg-[var(--accent)] text-white dark:text-[#06201B]"
                            }`}
                          >
                            {tracked
                              ? lang === "id"
                                ? "✓ Di Pipeline"
                                : "✓ Tracked"
                              : lang === "id"
                              ? "+ Pipeline"
                              : "+ Track"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "rules" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Existing rules */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-sm text-[var(--ink)]">
                  {lang === "id" ? "Aturan Peringatan Aktif" : "Configured Alert Subscriptions"}
                </h3>
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display font-semibold text-sm text-[var(--ink)]">
                          {r.name}
                        </div>
                        <div className="text-xs text-[var(--muted)] font-mono">
                          {r.recipientEmail} · {r.frequency}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleRule(r.id)}
                          className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                            r.enabled
                              ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]"
                              : "bg-[var(--surface)] text-[var(--faint)] border border-[var(--line)]"
                          }`}
                        >
                          {r.enabled
                            ? lang === "id"
                              ? "Aktif"
                              : "Active"
                            : lang === "id"
                            ? "Nonaktif"
                            : "Paused"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRule(r.id)}
                          className="p-1 text-[var(--muted)] hover:text-[var(--crit)] cursor-pointer"
                          title="Delete rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--ink-2)]">
                      <span>{r.domains.join(" · ") || "All Domains"}</span>
                      {" · "}
                      <span>
                        {r.origins
                          .map((o) => (o === "IDN" ? "Indonesia" : "International"))
                          .join(", ")}
                      </span>
                      {r.keywords.length > 0 && (
                        <>
                          {" · "}
                          <span className="font-mono text-[11px] text-[var(--accent)]">
                            [{r.keywords.join(", ")}]
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Create new rule form */}
              <form
                onSubmit={handleCreateRule}
                className="p-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] space-y-3.5"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="font-display font-semibold text-sm text-[var(--ink)]">
                    {lang === "id"
                      ? "Buat Aturan Peringatan Email Baru"
                      : "Create New Email Alert Rule"}
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                    {lang === "id" ? "Nama Aturan Alert" : "Alert Rule Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder={
                      lang === "id"
                        ? "Mis. Keselamatan Jalan & Kesehatan Kota ASEAN"
                        : "e.g., ASEAN Road Safety & Urban Health"
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                      {lang === "id" ? "Email Penerima" : "Recipient Email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                      {lang === "id" ? "Frekuensi Buletin" : "Digest Frequency"}
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) =>
                        setFrequency(e.target.value as "instant" | "weekly" | "monthly")
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                    >
                      <option value="instant">
                        {lang === "id" ? "Instan (Real-time)" : "Instant (Real-time)"}
                      </option>
                      <option value="weekly">
                        {lang === "id" ? "Ringkasan Mingguan" : "Weekly Digest"}
                      </option>
                      <option value="monthly">
                        {lang === "id" ? "Ringkasan Bulanan" : "Monthly Digest"}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                    {lang === "id"
                      ? "Kata Kunci Riset (pisahkan dengan koma, opsional)"
                      : "Research Keywords (comma-separated, optional)"}
                  </label>
                  <input
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="e.g., road safety, UGM, BIMA, HSP, dengue, social policy, WHO"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--faint)] mb-1.5">
                    {lang === "id" ? "Domain Riset" : "Research Domains"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["Health", "Social Science", "Road Safety"] as ResearchDomain[]).map(
                      (dom) => (
                        <button
                          key={dom}
                          type="button"
                          onClick={() => toggleItem(selectedDomains, dom, setSelectedDomains)}
                          className={`px-3 py-1 rounded-md text-xs font-medium border cursor-pointer ${
                            selectedDomains.includes(dom)
                              ? "bg-[var(--accent)] text-white dark:text-[#06201B] border-[var(--accent)]"
                              : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)]"
                          }`}
                        >
                          {dom}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--faint)] mb-1.5">
                    {lang === "id" ? "Cakupan Geografis" : "Geographic Criteria"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["IDN", lang === "id" ? "Nasional & Lokal UGM" : "Indonesia & UGM"],
                        ["INT", lang === "id" ? "Internasional & ASEAN" : "International & ASEAN"],
                      ] as [GrantOrigin, string][]
                    ).map(([code, label]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleItem(selectedOrigins, code, setSelectedOrigins)}
                        className={`px-3 py-1 rounded-md text-xs font-medium border cursor-pointer ${
                          selectedOrigins.includes(code)
                            ? "bg-[var(--accent)] text-white dark:text-[#06201B] border-[var(--accent)]"
                            : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[var(--ink-2)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyOpenOrSoon}
                    onChange={(e) => setOnlyOpenOrSoon(e.target.checked)}
                  />
                  <span>
                    {lang === "id"
                      ? "Hanya sertakan skema yang sedang terbuka atau segera buka dalam 3 bulan"
                      : "Only alert on currently open calls or schemes reopening within 3 months"}
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-semibold hover:brightness-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {lang === "id" ? "Simpan Aturan Peringatan" : "Save Alert Subscription"}
                  </span>
                </button>
              </form>
            </div>
          )}

          {activeTab === "digest" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--surface-2)] p-3.5 rounded-lg border border-[var(--line)]">
                <div className="text-xs text-[var(--ink-2)]">
                  <span className="font-semibold">
                    {lang === "id" ? "Tujuan Pengiriman:" : "Digest Recipient:"}
                  </span>{" "}
                  <span className="font-mono">{primaryEmail}</span> ·{" "}
                  <span className="font-mono tabular-nums">
                    {matchedGrantsWithRules.length}
                  </span>{" "}
                  {lang === "id" ? "peluang cocok" : "matching grants"}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDigest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    {copiedDigest ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{lang === "id" ? "Tersalin" : "Copied"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === "id" ? "Salin Teks Email" : "Copy Digest Text"}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadEml}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === "id" ? "Unduh File .EML" : "Download .EML"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleMailto}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-medium cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === "id" ? "Kirim via Aplikasi Email" : "Open in Email Client"}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] font-mono text-xs text-[var(--ink-2)] whitespace-pre-wrap overflow-x-auto max-h-[380px]">
                {generatePlainTextDigest()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
