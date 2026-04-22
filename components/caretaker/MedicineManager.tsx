"use client";

import { useState } from "react";
import type { Medicine } from "@/lib/types";

interface Props {
  elderId: string;
  medicines: Medicine[];
  onChange: () => void;
}

interface MedicineForm {
  name: string;
  dosage: string;
  quantity: string;
  frequency: string;
  times: string;
  instructions: string;
  with_food: boolean;
}

const emptyForm: MedicineForm = {
  name: "",
  dosage: "",
  quantity: "1 tablet",
  frequency: "once daily",
  times: "08:00",
  instructions: "",
  with_food: false,
};

export default function MedicineManager({ elderId, medicines, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicineForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function startAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(med: Medicine) {
    setForm({
      name: med.name,
      dosage: med.dosage,
      quantity: med.quantity,
      frequency: med.frequency,
      times: med.times?.[0] ?? "08:00",
      instructions: med.instructions ?? "",
      with_food: med.with_food,
    });
    setEditingId(med.id);
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.dosage) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        times: form.times ? [form.times] : [],
        elderId,
      };

      if (editingId) {
        await fetch(`/api/medicine/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/medicine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      onChange();
    } catch (err) {
      console.error("Failed to save medicine:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this medicine?")) return;

    setDeleting(id);
    try {
      await fetch(`/api/medicine/${id}`, { method: "DELETE" });
      onChange();
    } catch (err) {
      console.error("Failed to delete medicine:", err);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="card-vintage p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💊</span>
          <div>
            <p className="mono-label">Manage Medicines</p>
            <p className="text-[var(--brown-light)] text-xs">{medicines.length} on record</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="mono-label px-3 py-1.5 rounded-full border-2 border-[var(--terracotta)] text-[var(--terracotta)]"
            style={{ background: "transparent" }}
          >
            + Add
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4 p-4 rounded-xl border-2" style={{ background: "var(--cream)", borderColor: "var(--card-border)" }}>
          <div>
            <label className="mono-label text-xs">Medicine Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Metformin"
              className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-[var(--card-border)] text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mono-label text-xs">Dosage *</label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g., 500mg"
                className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-[var(--card-border)] text-sm"
                required
              />
            </div>
            <div>
              <label className="mono-label text-xs">Quantity</label>
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g., 1 tablet"
                className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-[var(--card-border)] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mono-label text-xs">Frequency</label>
              <input
                type="text"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                placeholder="e.g., twice daily"
                className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-[var(--card-border)] text-sm"
              />
            </div>
            <div>
              <label className="mono-label text-xs">Time</label>
              <input
                type="time"
                value={form.times}
                onChange={(e) => setForm({ ...form, times: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-[var(--card-border)] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mono-label text-xs">Instructions</label>
            <input
              type="text"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="e.g., after breakfast"
              className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-[var(--card-border)] text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.with_food}
              onChange={(e) => setForm({ ...form, with_food: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="mono-label text-xs">Take with food</span>
          </label>

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-4 rounded-lg bg-[var(--sage)] text-white font-semibold text-sm disabled:opacity-50"
            >
              {saving ? "..." : editingId ? "Update" : "Add Medicine"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="py-2 px-4 rounded-lg border-2 border-[var(--card-border)] font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Medicine List */}
      {medicines.length === 0 && !showForm ? (
        <p className="text-sm text-[var(--brown-light)] italic text-center py-3">
          No medicines yet. Add one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {medicines.map((med) => (
            <div
              key={med.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 border-2 border-[var(--card-border)]"
              style={{ background: "var(--cream)" }}
            >
              <span className="text-lg shrink-0">💊</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--brown)] text-sm leading-tight truncate">
                  {med.name} {med.dosage}
                </p>
                <p className="mono-label text-xs">
                  {med.quantity} · {med.frequency}
                  {med.times?.[0] ? ` · ${med.times[0]}` : ""}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => startEdit(med)}
                  className="p-2 rounded-lg border border-[var(--card-border)] text-xs"
                  style={{ background: "var(--cream-light)" }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  disabled={deleting === med.id}
                  className="p-2 rounded-lg border border-[var(--card-border)] text-xs disabled:opacity-50"
                  style={{ background: "#FDECEA" }}
                >
                  {deleting === med.id ? "..." : "🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
