"use client";

import { useState, useEffect, useCallback } from "react";
import { products } from "@/lib/products";
import { BRAND } from "@/config/brand";

type Order = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  industry: string;
  street: string;
  city: string;
  postal: string;
  country: string;
  pay_method: string;
  crypto_coin: string | null;
  items: { id: string; name: string; unit: string; price: number; qty: number }[];
  total: number;
  status: string;
  // Null on orders placed before deploy/migrations/001_research_intent.sql was applied.
  research_intent: string | null;
  terms_accepted: boolean | null;
};

type StockRow = { variant_id: string; quantity: number; updated_at: string };

type ReviewRow = {
  id: string;
  name: string;
  location: string;
  product: string;
  rating: number;
  body: string;
  date_label: string;
  approved: boolean;
  created_at: string;
  // Set when the reviewer proved order ownership at submit time; null otherwise.
  // Null on rows created before deploy/migrations/002_review_order_link.sql.
  order_id: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "rgba(245,158,11,0.15)",
  paid:      "rgba(34,197,94,0.15)",
  shipped:   "rgba(59,130,246,0.15)",
  cancelled: "rgba(239,68,68,0.15)",
};
const STATUS_TEXT: Record<string, string> = {
  pending: "#d97706", paid: "#16a34a", shipped: "#2563eb", cancelled: "#dc2626",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
}

// Build a lookup: variantId → productName
const VARIANT_NAME: Record<string, string> = {};
for (const p of products) VARIANT_NAME[p.id] = `${p.name} ${p.unit}`;

// ── Password gate ─────────────────────────────────────────────────────────────
function LoginGate({ onAuth }: { onAuth: (token: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError("Wrong password."); return; }
    sessionStorage.setItem("admin_token", data.token);
    onAuth(data.token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
      <form onSubmit={submit} className="flex flex-col gap-4 w-full max-w-[320px] p-8 rounded-[20px]" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="text-[20px] font-semibold text-primary text-center">Admin</h1>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="rounded-[10px] px-4 py-3 text-[14px] outline-none"
          style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        {error && <p className="text-[13px] text-center" style={{ color: "#dc2626" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="py-3 rounded-full text-[14px] font-medium text-white border-none cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {loading ? "…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────
function OrdersTab({ token }: { token: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/orders", { headers });
    setOrders(await res.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setUpdating(null);
  };

  if (loading) return <p className="text-secondary text-[14px] p-6">Loading…</p>;
  if (!orders.length) return <p className="text-secondary text-[14px] p-6">No orders yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-[16px] overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          {/* Row summary */}
          <button
            onClick={() => setExpanded(expanded === o.id ? null : o.id)}
            className="w-full flex items-center gap-4 px-5 py-4 text-left border-none cursor-pointer"
            style={{ backgroundColor: "transparent" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[14px] font-semibold text-primary font-mono">{o.id}</span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: STATUS_COLORS[o.status] ?? "transparent", color: STATUS_TEXT[o.status] ?? "var(--text)" }}
                >
                  {o.status}
                </span>
              </div>
              <p className="text-[13px] text-secondary mt-0.5 truncate">
                {o.first_name} {o.last_name} · {o.email} · {fmtDate(o.created_at)}
              </p>
            </div>
            <span className="text-[16px] font-semibold text-primary shrink-0">${o.total.toFixed(2)}</span>
            <span className="text-secondary text-[12px] shrink-0">{expanded === o.id ? "▲" : "▼"}</span>
          </button>

          {/* Expanded detail */}
          {expanded === o.id && (
            <div className="px-5 pb-5 flex flex-col gap-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Customer</p>
                  <p className="text-[13px] text-primary">{o.first_name} {o.last_name}</p>
                  <p className="text-[13px] text-secondary">{o.email}</p>
                  <p className="text-[13px] text-secondary">{o.industry || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Ship To</p>
                  <p className="text-[13px] text-primary">{o.street}</p>
                  <p className="text-[13px] text-secondary">{o.city}, {o.postal}</p>
                  <p className="text-[13px] text-secondary">{o.country}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Items</p>
                <div className="flex flex-col gap-1">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[13px]">
                      <span className="text-primary">{item.name} <span className="text-secondary">({item.unit}) ×{item.qty}</span></span>
                      <span className="text-primary font-medium">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal record — the purchaser's own words about intended use, plus
                  whether they accepted the research-use declaration. */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Order Notes</p>
                <p className="text-[13px] text-primary whitespace-pre-wrap">{o.research_intent || "—"}</p>
                <p className="text-[12px] text-secondary mt-1">
                  Terms accepted: {o.terms_accepted ? "Yes" : o.terms_accepted === false ? "No" : "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Payment</p>
                <p className="text-[13px] text-primary capitalize">{o.pay_method}{o.crypto_coin ? ` — ${o.crypto_coin}` : ""}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {["pending", "paid", "shipped", "cancelled"].map((s) => (
                    <button
                      key={s}
                      disabled={o.status === s || updating === o.id}
                      onClick={() => setStatus(o.id, s)}
                      className="rounded-full px-4 py-1.5 text-[12px] font-medium border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed capitalize"
                      style={
                        o.status === s
                          ? { backgroundColor: STATUS_COLORS[s], color: STATUS_TEXT[s] }
                          : { backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Stock tab ─────────────────────────────────────────────────────────────────
function StockTab({ token }: { token: string }) {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch("/api/admin/stock", { headers })
      .then((r) => r.json())
      .then(setRows)
      .finally(() => setLoading(false));
  }, [token]);

  const save = async (variant_id: string) => {
    const qty = parseInt(editing[variant_id] ?? "0", 10);
    if (isNaN(qty) || qty < 0) return;
    setSaving(variant_id);
    await fetch("/api/admin/stock", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id, quantity: qty }),
    });
    setRows((prev) => prev.map((r) => (r.variant_id === variant_id ? { ...r, quantity: qty } : r)));
    setEditing((prev) => { const n = { ...prev }; delete n[variant_id]; return n; });
    setSaving(null);
  };

  if (loading) return <p className="text-secondary text-[14px] p-6">Loading…</p>;

  return (
    <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr style={{ backgroundColor: "var(--surface)" }}>
            <th className="text-left px-5 py-3 font-semibold text-secondary">Variant</th>
            <th className="text-center px-4 py-3 font-semibold text-secondary w-[100px]">Stock</th>
            <th className="text-right px-5 py-3 font-semibold text-secondary w-[140px]">Update</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const name = VARIANT_NAME[row.variant_id] ?? row.variant_id;
            const isDirty = row.variant_id in editing;
            const qty = row.quantity;
            const stockColor = qty === 0 ? "#dc2626" : qty <= 5 ? "#d97706" : "#16a34a";

            return (
              <tr key={row.variant_id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined, backgroundColor: "var(--bg)" }}>
                <td className="px-5 py-3 text-primary">{name}</td>
                <td className="px-4 py-3 text-center font-semibold" style={{ color: stockColor }}>{qty}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <input
                      type="number"
                      min="0"
                      value={isDirty ? editing[row.variant_id] : row.quantity}
                      onChange={(e) => setEditing((prev) => ({ ...prev, [row.variant_id]: e.target.value }))}
                      className="w-16 rounded-[8px] px-2 py-1 text-center text-[13px] outline-none"
                      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                    <button
                      onClick={() => save(row.variant_id)}
                      disabled={!isDirty || saving === row.variant_id}
                      className="rounded-full px-3 py-1 text-[12px] font-medium text-white border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {saving === row.variant_id ? "…" : "Save"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Reviews tab ───────────────────────────────────────────────────────────────
function ReviewCard({
  review: r,
  acting,
  onApprove,
  onDelete,
}: {
  review: ReviewRow;
  acting: string | null;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-[16px] p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[14px] font-semibold text-primary">{r.name}</span>
            {r.location && <span className="text-[12px] text-tertiary">{r.location}</span>}
            <span className="text-[11px] font-medium rounded-full px-2 py-0.5" style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-muted)" }}>
              {r.product}
            </span>
            <span className="text-[12px]" style={{ color: "#f59e0b" }}>{"★".repeat(r.rating)}</span>
            {/* Whether this review will carry a public "Verified Buyer" badge. */}
            {r.order_id && (
              <span className="text-[11px] font-semibold rounded-full px-2 py-0.5" style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#16a34a" }}>
                ✓ order {r.order_id}
              </span>
            )}
          </div>
          <p className="text-[13px] text-secondary leading-relaxed">{r.body}</p>
          <p className="text-[11px] text-tertiary mt-1">{r.date_label} · {fmtDate(r.created_at)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {!r.approved && (
            <button
              onClick={() => onApprove(r.id)}
              disabled={acting === r.id}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium text-white border-none cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: "#16a34a" }}
            >
              {acting === r.id ? "…" : "Approve"}
            </button>
          )}
          <button
            onClick={() => onDelete(r.id)}
            disabled={acting === r.id}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium border-none cursor-pointer disabled:opacity-40"
            style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#dc2626" }}
          >
            {acting === r.id ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewsTab({ token }: { token: string }) {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch("/api/admin/reviews", { headers })
      .then((r) => r.json())
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [token]);

  const approve = async (id: string) => {
    setActing(id);
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: true }),
    });
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)));
    setActing(null);
  };

  const remove = async (id: string) => {
    setActing(id);
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setActing(null);
  };

  if (loading) return <p className="text-secondary text-[14px] p-6">Loading…</p>;

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div className="flex flex-col gap-8">
      {pending.length > 0 && (
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#d97706" }}>
            Pending ({pending.length})
          </p>
          <div className="flex flex-col gap-3">
            {pending.map((r) => (
              <ReviewCard key={r.id} review={r} acting={acting} onApprove={approve} onDelete={remove} />
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          Published ({approved.length})
        </p>
        {approved.length === 0 ? (
          <p className="text-secondary text-[14px]">No approved reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {approved.map((r) => (
              <ReviewCard key={r.id} review={r} acting={acting} onApprove={approve} onDelete={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"orders" | "stock" | "reviews">("orders");

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token");
    if (t) setToken(t);
  }, []);

  if (!token) return <LoginGate onAuth={setToken} />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "var(--nav-bg)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-6">
          <span className="text-[16px] font-semibold text-primary">{BRAND.name} Admin</span>
          <div className="flex gap-1">
            {(["orders", "stock", "reviews"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-full text-[13px] font-medium border-none cursor-pointer capitalize"
                style={
                  tab === t
                    ? { backgroundColor: "var(--accent)", color: "#fff" }
                    : { backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("admin_token"); setToken(null); }}
          className="text-[13px] border-none cursor-pointer bg-transparent"
          style={{ color: "var(--text-muted)" }}
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        {tab === "orders" ? <OrdersTab token={token} /> : tab === "stock" ? <StockTab token={token} /> : <ReviewsTab token={token} />}
      </div>
    </div>
  );
}
