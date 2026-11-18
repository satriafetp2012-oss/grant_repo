import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckSquare,
  Square,
  Calendar,
  User,
  X,
} from "lucide-react";
import {
  Language,
  PipelineItem,
  PipelineStage,
  RawGrantEntry,
  ResearchDomain,
} from "../types/grants";
import { PIPELINE_STAGES, UI_TEXT } from "../utils/i18n";
import { daysUntilDeadline, formatDeadlineDate } from "./GrantCard";
import { slugifyGrant } from "../data/grantsData";

interface PipelineBoardProps {
  lang: Language;
  items: Record<string, PipelineItem>;
  allGrants: RawGrantEntry[];
  onUpdateStage: (grantId: string, stage: PipelineStage) => void;
  onUpdateItem: (grantId: string, updated: PipelineItem) => void;
  onDeleteItem: (grantId: string) => void;
  onAddCustomGrant: (grant: RawGrantEntry, item: PipelineItem) => void;
  onSyncCustomGrant: (grant: RawGrantEntry) => void;
}

const DEFAULT_CHECKLIST_TEMPLATES: Record<Language, string[]> = {
  id: [
    "Verifikasi syarat kelayakan ketua (NIDN/SINTA atau status LMIC/DAC)",
    "Konfirmasi surat kesediaan mitra / co-lead",
    "Susun draf substansi & Rencana Anggaran Biaya (RAB)",
    "Urus pengantar LPPM / persetujuan dekan",
    "Ajukan kaji etik (Ethical Clearance) bila subjek manusia",
  ],
  en: [
    "Verify Lead PI eligibility (NIDN/SINTA or LMIC/DAC rules)",
    "Secure partner / international co-lead commitment letter (LoI)",
    "Draft technical narrative & line-item budget (RAB)",
    "Obtain institutional LPPM / Dean endorsement",
    "Submit IRB / Ethical Clearance application",
  ],
};

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  lang,
  items,
  allGrants,
  onUpdateStage,
  onUpdateItem,
  onDeleteItem,
  onAddCustomGrant,
  onSyncCustomGrant,
}) => {
  const t = UI_TEXT[lang];
  const [modalMode, setModalMode] = useState<"closed" | "add" | "edit">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal fields
  const [name, setName] = useState("");
  const [funder, setFunder] = useState("");
  const [deadline, setDeadline] = useState("");
  const [url, setUrl] = useState("");
  const [amount, setAmount] = useState("");
  const [domain, setDomain] = useState<ResearchDomain>("Health");
  const [owner, setOwner] = useState("");
  const [note, setNote] = useState("");
  const [newTaskText, setNewTaskText] = useState("");

  const findGrant = (id: string) => allGrants.find((g) => (g.id || g.n) === id);

  const openAddModal = () => {
    setModalMode("add");
    setEditingId(null);
    setName("");
    setFunder("");
    setDeadline("");
    setUrl("");
    setAmount("");
    setDomain("Health");
    setOwner("");
    setNote("");
  };

  const openEditModal = (grantId: string) => {
    const g = findGrant(grantId);
    const it = items[grantId];
    if (!g || !it) return;
    setModalMode("edit");
    setEditingId(grantId);
    setName(g.n);
    setFunder(g.f || "");
    setDeadline(g.dl || "");
    setUrl(g.u || "");
    setAmount(g.amt || "");
    setDomain((g.domains && g.domains[0]) || "Health");
    setOwner(it.owner || "");
    setNote(it.note || "");
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalMode === "edit" && editingId) {
      const g = findGrant(editingId);
      const existing = items[editingId];
      if (g && g.custom) {
        onSyncCustomGrant({
          ...g,
          n: name.trim(),
          f: funder.trim() || "Custom Funder",
          dl: deadline || null,
          u: url.trim(),
          amt: amount.trim(),
          domains: [domain],
        });
      }
      onUpdateItem(editingId, {
        ...existing,
        owner: owner.trim(),
        note: note.trim(),
        ts: Date.now(),
      });
    } else {
      const customId = `${slugifyGrant(name)}-custom-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const newGrant: RawGrantEntry = {
        id: customId,
        n: name.trim(),
        f: funder.trim() || (lang === "id" ? "Ditambahkan Tim" : "Team Custom"),
        o: "IDN",
        reg: "Custom",
        th: [domain],
        domains: [domain],
        amt: amount.trim(),
        dl: deadline || null,
        dlnote: "",
        st: "live",
        el: "lead",
        eln: "",
        d: note.trim(),
        u: url.trim(),
        win: [],
        custom: true,
      };
      const newItem: PipelineItem = {
        s: "watch",
        owner: owner.trim(),
        note: note.trim(),
        ts: Date.now(),
        tasks: DEFAULT_CHECKLIST_TEMPLATES[lang].map((txt, idx) => ({
          id: `t-${idx}-${Date.now()}`,
          text: txt,
          done: false,
        })),
      };
      onAddCustomGrant(newGrant, newItem);
    }
    setModalMode("closed");
  };

  const handleToggleTask = (grantId: string, taskId: string) => {
    const it = items[grantId];
    if (!it) return;
    const tasks = (it.tasks || []).map((tk) =>
      tk.id === taskId ? { ...tk, done: !tk.done } : tk
    );
    onUpdateItem(grantId, { ...it, tasks, ts: Date.now() });
  };

  const handleSeedDefaultTasks = (grantId: string) => {
    const it = items[grantId];
    if (!it) return;
    const tasks = DEFAULT_CHECKLIST_TEMPLATES[lang].map((txt, idx) => ({
      id: `t-${idx}-${Date.now()}`,
      text: txt,
      done: false,
    }));
    onUpdateItem(grantId, { ...it, tasks, ts: Date.now() });
  };

  const handleAddTaskToEditing = () => {
    if (!editingId || !newTaskText.trim()) return;
    const it = items[editingId];
    if (!it) return;
    const nextTasks = [
      ...(it.tasks || []),
      { id: `t-${Date.now()}`, text: newTaskText.trim(), done: false },
    ];
    onUpdateItem(editingId, { ...it, tasks: nextTasks, ts: Date.now() });
    setNewTaskText("");
  };

  const handleRemoveTask = (grantId: string, taskId: string) => {
    const it = items[grantId];
    if (!it) return;
    const nextTasks = (it.tasks || []).filter((tk) => tk.id !== taskId);
    onUpdateItem(grantId, { ...it, tasks: nextTasks, ts: Date.now() });
  };

  const entries = Object.entries(items)
    .map(([id, v]) => ({ id, v, g: findGrant(id) }))
    .filter((x): x is { id: string; v: PipelineItem; g: RawGrantEntry } => Boolean(x.g));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            {t.pipelineTitle}
          </h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">{t.pipelineSub}</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-semibold hover:brightness-105 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCustomGrant}</span>
        </button>
      </div>

      {/* 5-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {PIPELINE_STAGES.map((stage) => {
          const colItems = entries
            .filter((x) => (x.v.s || "watch") === stage.k)
            .sort((a, b) =>
              (a.g.dl || "9999-12-31") < (b.g.dl || "9999-12-31") ? -1 : 1
            );

          return (
            <div
              key={stage.k}
              className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl p-3 min-h-[260px] flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--line-soft)]">
                <h3 className="font-display text-xs font-semibold text-[var(--ink-2)]">
                  {lang === "id" ? stage.id : stage.en}
                </h3>
                <span className="font-mono tabular-nums text-xs text-[var(--faint)] font-medium">
                  {colItems.length}
                </span>
              </div>

              {colItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--faint)]">
                  {lang === "id" ? "Belum ada skema" : "No grants in stage"}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {colItems.map(({ id, v, g }) => {
                    const days = daysUntilDeadline(g.dl);
                    const tasks = v.tasks || [];
                    const doneCount = tasks.filter((tk) => tk.done).length;

                    return (
                      <div
                        key={id}
                        className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-3 space-y-2"
                      >
                        <div className="font-display font-semibold text-[13.5px] leading-snug text-[var(--ink)]">
                          {g.n}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {g.f}
                          {g.amt ? ` · ${g.amt}` : ""}
                        </div>

                        {g.dl && (
                          <div
                            className={`flex items-center gap-1.5 font-mono tabular-nums text-xs ${
                              days !== null && days < 0
                                ? "text-[var(--faint)]"
                                : days !== null && days <= 30
                                ? "text-[var(--crit)] font-semibold"
                                : days !== null && days <= 90
                                ? "text-[var(--warn)] font-medium"
                                : "text-[var(--accent)]"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {formatDeadlineDate(g.dl, lang)}
                              {days !== null && days >= 0
                                ? ` · ${days} ${t.daysLeft}`
                                : ""}
                            </span>
                          </div>
                        )}

                        {v.owner && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--ink-2)]">
                            <User className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                            <span>{v.owner}</span>
                          </div>
                        )}

                        {v.note && (
                          <div className="text-xs text-[var(--ink-2)] bg-[var(--surface-2)] px-2.5 py-1.5 rounded border border-[var(--line-soft)] whitespace-pre-wrap">
                            {v.note}
                          </div>
                        )}

                        {/* Checklist preview */}
                        {tasks.length > 0 ? (
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-mono tabular-nums">
                              <span>
                                {lang === "id" ? "Checklist Proposal" : "Checklist"}
                              </span>
                              <span>
                                {doneCount}/{tasks.length}
                              </span>
                            </div>
                            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                              {tasks.map((tk) => (
                                <button
                                  key={tk.id}
                                  type="button"
                                  onClick={() => handleToggleTask(id, tk.id)}
                                  className="w-full flex items-start gap-1.5 text-left text-[11.5px] text-[var(--ink-2)] hover:text-[var(--ink)] cursor-pointer"
                                >
                                  {tk.done ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-[var(--faint)] shrink-0 mt-0.5" />
                                  )}
                                  <span className={tk.done ? "line-through text-[var(--faint)]" : ""}>
                                    {tk.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSeedDefaultTasks(id)}
                            className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer"
                          >
                            {lang === "id"
                              ? "+ Muat daftar periksa dokumen standar"
                              : "+ Load standard submission checklist"}
                          </button>
                        )}

                        {/* Card Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-[var(--line-soft)]">
                          <select
                            aria-label="Pipeline stage"
                            value={v.s || "watch"}
                            onChange={(e) =>
                              onUpdateStage(id, e.target.value as PipelineStage)
                            }
                            className="text-xs px-2 py-1 rounded border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                          >
                            {PIPELINE_STAGES.map((st) => (
                              <option key={st.k} value={st.k}>
                                {lang === "id" ? st.id : st.en}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(id)}
                              className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                              title={lang === "id" ? "Edit catatan & PIC" : "Edit notes & owner"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {g.u && (
                              <a
                                href={g.u}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-[var(--muted)] hover:text-[var(--accent)]"
                                title={t.openOfficialPage}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteItem(id)}
                              className="p-1 text-[var(--muted)] hover:text-[var(--crit)] cursor-pointer"
                              title={lang === "id" ? "Hapus dari pipeline" : "Remove from pipeline"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalMode !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--line-soft)] pb-3">
              <h3 className="font-display font-bold text-base text-[var(--ink)]">
                {modalMode === "add"
                  ? lang === "id"
                    ? "Tambah Hibah Sendiri ke Pipeline"
                    : "Add Custom Grant to Pipeline"
                  : name}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode("closed")}
                className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3">
              {(modalMode === "add" || (editingId && findGrant(editingId)?.custom)) && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                      {lang === "id" ? "Nama Skema Hibah" : "Grant Scheme Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                        {lang === "id" ? "Pemberi Dana" : "Funder Organization"}
                      </label>
                      <input
                        type="text"
                        value={funder}
                        onChange={(e) => setFunder(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                        {lang === "id" ? "Domain Utama" : "Primary Domain"}
                      </label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value as ResearchDomain)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                      >
                        <option value="Health">Health</option>
                        <option value="Social Science">Social Science</option>
                        <option value="Road Safety">Road Safety</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                        {lang === "id" ? "Tenggat (Opsional)" : "Deadline (Optional)"}
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                        {lang === "id" ? "Nilai Hibah" : "Award Value"}
                      </label>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g., Rp 150.000.000"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                      {lang === "id" ? "Tautan Resmi (Opsional)" : "Official URL (Optional)"}
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                  {lang === "id"
                    ? "Penanggung Jawab Tim (Ketua / PIC)"
                    : "Team Lead / Owner (PIC)"}
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder={lang === "id" ? "Nama peneliti / anggota tim" : "Researcher name"}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--faint)] mb-1">
                  {lang === "id" ? "Catatan Strategi & Mitra" : "Proposal Notes & Partner Status"}
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                />
              </div>

              {modalMode === "edit" && editingId && (
                <div className="space-y-2 pt-2 border-t border-[var(--line-soft)]">
                  <label className="block text-xs font-semibold text-[var(--faint)]">
                    {lang === "id" ? "Checklist Tugas Pengajuan" : "Submission Checklist Tasks"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder={
                        lang === "id"
                          ? "Tambah sub-tugas baru…"
                          : "Add checklist item…"
                      }
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddTaskToEditing}
                      className="px-3 py-1.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {(items[editingId]?.tasks || []).map((tk) => (
                      <div
                        key={tk.id}
                        className="flex items-center justify-between gap-2 text-xs bg-[var(--surface-2)] px-2.5 py-1.5 rounded"
                      >
                        <span className={tk.done ? "line-through text-[var(--faint)]" : ""}>
                          {tk.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(editingId, tk.id)}
                          className="text-[var(--muted)] hover:text-[var(--crit)] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalMode("closed")}
                  className="px-3.5 py-2 rounded-lg border border-[var(--line)] text-xs font-medium text-[var(--ink-2)] cursor-pointer"
                >
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white dark:text-[#06201B] text-xs font-semibold cursor-pointer"
                >
                  {lang === "id" ? "Simpan" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
