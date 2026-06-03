import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { useAuth } from "./useAuth.jsx";

// ── Design tokens ──
const C = {
  primary: "#16a34a", primaryL: "#dcfce7", primaryD: "#15803d",
  blue: "#3b82f6", blueL: "#dbeafe",
  amber: "#f59e0b", amberL: "#fef3c7",
  purple: "#8b5cf6", purpleL: "#ede9fe",
  red: "#ef4444", redL: "#fee2e2",
  gray50: "#f9fafb", gray100: "#f3f4f6", gray200: "#e5e7eb",
  gray400: "#9ca3af", gray500: "#6b7280", gray600: "#4b5563",
  gray700: "#374151", gray800: "#1f2937", gray900: "#111827",
  white: "#ffffff",
};

const STATUS_DELIVERY = {
  awaiting_vendeur: { label: "Attente vendeur", color: C.amber },
  pending:          { label: "Attente livreur", color: C.blue },
  rejected:         { label: "Refusée",          color: C.red },
  accepted:         { label: "Livreur assigné",  color: C.purple },
  in_progress:      { label: "En cours",          color: "#f97316" },
  delivered:        { label: "Livrée",            color: C.primary },
};

const STATUS_PRODUCT = {
  pending:  { label: "En attente", color: C.amber },
  approved: { label: "Approuvé",   color: C.primary },
  rejected: { label: "Refusé",     color: C.red },
};

const ROLE_COLOR = {
  admin: C.red, vendeur: C.blue, livreur: C.amber, client: C.primary,
};

// ── Shared UI ──
const Badge = ({ label, color }) => (
  <span style={{
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: 999,
    fontSize: 12, fontWeight: 600,
    background: color + "22", color,
  }}>{label}</span>
);

const Card = ({ children, style }) => (
  <div style={{
    background: C.white, borderRadius: 16,
    border: `1px solid ${C.gray200}`,
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    ...style,
  }}>{children}</div>
);

const SectionTitle = ({ icon, title, count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
    <span style={{ fontSize: 22 }}>{icon}</span>
    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.gray900, margin: 0 }}>{title}</h2>
    {count !== undefined && (
      <span style={{
        background: C.gray100, color: C.gray600,
        fontSize: 12, fontWeight: 700,
        padding: "2px 8px", borderRadius: 999,
      }}>{count}</span>
    )}
  </div>
);

const Th = ({ children }) => (
  <th style={{
    padding: "10px 14px", textAlign: "left",
    fontSize: 11, fontWeight: 700, color: C.gray500,
    textTransform: "uppercase", letterSpacing: "0.06em",
    background: C.gray50, borderBottom: `1px solid ${C.gray200}`,
  }}>{children}</th>
);

const Td = ({ children, style }) => (
  <td style={{ padding: "12px 14px", fontSize: 14, color: C.gray700, borderBottom: `1px solid ${C.gray100}`, verticalAlign: "middle", ...style }}>{children}</td>
);

const ActionBtn = ({ onClick, color = C.blue, children }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 6, border: "none",
    background: color + "18", color, fontSize: 12, fontWeight: 600,
    cursor: "pointer", transition: "background .15s",
  }}
    onMouseEnter={(e) => e.currentTarget.style.background = color + "30"}
    onMouseLeave={(e) => e.currentTarget.style.background = color + "18"}
  >{children}</button>
);

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: C.gray400 }}>
    <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
    <p style={{ fontSize: 14, margin: 0 }}>{text}</p>
  </div>
);

// ── Product form hook ──
const rules = {
  name:        (v) => !v.trim() ? "Requis" : v.trim().length < 2 ? "Min 2 car." : "",
  price:       (v) => isNaN(v) || Number(v) <= 0 ? "Prix > 0" : "",
  quantity:    (v) => isNaN(v) || Number(v) < 0 ? "Qté ≥ 0" : "",
  description: (v) => v.length > 500 ? "Max 500 car." : "",
  image:       (f) => !f ? "" : !["image/jpeg","image/png","image/webp"].includes(f.type) ? "JPEG/PNG/WebP" : f.size > 5*1024*1024 ? "Max 5 Mo" : "",
};
const FIELDS = ["name", "price", "quantity", "description", "image"];

function useProductForm(init = { name: "", description: "", price: "", quantity: "" }) {
  const [form, setForm]       = useState(init);
  const [touched, setTouched] = useState({});
  const [imgFile, setImgFile] = useState(null);
  const err     = (f) => !touched[f] ? "" : f === "image" ? rules.image(imgFile) : rules[f]?.(form[f]) ?? "";
  const hasErrors = () => FIELDS.some((f) => f === "image" ? rules.image(imgFile) : rules[f]?.(form[f]));
  const change  = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const blur    = (f) => () => setTouched((p) => ({ ...p, [f]: true }));
  const changeImg = (e) => { setImgFile(e.target.files[0] || null); setTouched((p) => ({ ...p, image: true })); };
  const touchAll  = () => { const t = {}; FIELDS.forEach((f) => (t[f] = true)); setTouched(t); };
  const reset     = (v = init) => { setForm(v); setTouched({}); setImgFile(null); };
  return { form, setForm, imgFile, err, hasErrors, change, blur, changeImg, touchAll, reset };
}

const inp = (e) => ({
  padding: "9px 12px", fontSize: 14, borderRadius: 8, width: "100%",
  boxSizing: "border-box", fontFamily: "inherit",
  border: `1.5px solid ${e ? C.red : C.gray200}`,
  outline: "none", transition: "border-color .15s",
});

// ════════════════════════════════════════════════
export default function AdminDashboard({ activeSection = "dashboard" }) {
  const { token } = useAuth();
  const [msg, setMsg] = useState({ text: "", ok: true });

  // Section data
  const [stats,           setStats]           = useState(null);
  const [products,        setProducts]        = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [roleRequests,    setRoleRequests]    = useState([]);
  const [deliveries,      setDeliveries]      = useState([]);
  const [users,           setUsers]           = useState([]);
  const [editingId,       setEditingId]       = useState(null);
  const [categories,      setCategories]      = useState([]);
  const [coupons,         setCoupons]         = useState([]);
  const [catName,         setCatName]         = useState("");
  const [couponCode,      setCouponCode]      = useState("");
  const [couponPct,       setCouponPct]       = useState("");

  const create = useProductForm();
  const edit   = useProductForm();

  const h = { "Authorization": `Bearer ${token}` };

  useEffect(() => { setEditingId(null); setMsg({ text: "", ok: true }); create.reset(); }, [activeSection]);

  const flash = (text, ok = true) => setMsg({ text, ok });

  // ── Fetchers ──
  const fetchStats           = () => fetch("http://localhost:5000/admin/stats",        { headers: h }).then((r) => r.ok ? r.json() : null).then(setStats);
  const fetchProducts        = () => fetch("http://localhost:5000/products/all",       { headers: h }).then((r) => r.ok ? r.json() : []).then(setProducts);
  const fetchPendingProducts = () => fetch("http://localhost:5000/products/pending",   { headers: h }).then((r) => r.ok ? r.json() : []).then(setPendingProducts);
  const fetchRoleRequests    = () => fetch("http://localhost:5000/users/role-requests",{ headers: h }).then((r) => r.ok ? r.json() : []).then(setRoleRequests);
  const fetchDeliveries      = () => fetch("http://localhost:5000/deliveries/all",     { headers: h }).then((r) => r.ok ? r.json() : []).then(setDeliveries);
  const fetchUsers           = () => fetch("http://localhost:5000/users",              { headers: h }).then((r) => r.ok ? r.json() : []).then(setUsers);
  const fetchCategories      = () => fetch("http://localhost:5000/admin/categories").then((r) => r.ok ? r.json() : []).then(setCategories);
  const fetchCoupons         = () => fetch("http://localhost:5000/admin/coupons",      { headers: h }).then((r) => r.ok ? r.json() : []).then(setCoupons);

  useEffect(() => {
    fetchStats(); fetchProducts(); fetchPendingProducts();
    fetchRoleRequests(); fetchDeliveries(); fetchUsers();
    fetchCategories(); fetchCoupons();
  }, []);

  // ── Category handlers ──
  const handleCreateCategory = async () => {
    if (!catName.trim()) return flash("Nom requis", false);
    const res = await fetch("http://localhost:5000/admin/categories", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName }),
    });
    if (!res.ok) { flash(await res.text(), false); return; }
    flash("Catégorie créée"); setCatName(""); fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    const res = await fetch(`http://localhost:5000/admin/categories/${id}`, { method: "DELETE", headers: h });
    if (!res.ok) { flash(await res.text(), false); return; }
    flash("Catégorie supprimée"); fetchCategories();
  };

  // ── Coupon handlers ──
  const handleCreateCoupon = async () => {
    if (!couponCode.trim()) return flash("Code requis", false);
    const pct = parseInt(couponPct, 10);
    if (isNaN(pct) || pct < 1 || pct > 100) return flash("Remise entre 1 et 100 %", false);
    const res = await fetch("http://localhost:5000/admin/coupons", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, discount_pct: pct }),
    });
    if (!res.ok) { flash(await res.text(), false); return; }
    flash("Coupon créé"); setCouponCode(""); setCouponPct(""); fetchCoupons();
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Supprimer ce coupon ?")) return;
    const res = await fetch(`http://localhost:5000/admin/coupons/${id}`, { method: "DELETE", headers: h });
    if (!res.ok) { flash(await res.text(), false); return; }
    flash("Coupon supprimé"); fetchCoupons();
  };

  // ── Product handlers ──
  const handleCreate = async (e) => {
    e.preventDefault(); create.touchAll();
    if (create.hasErrors()) return;
    const fd = new FormData();
    Object.entries(create.form).forEach(([k, v]) => fd.append(k, v));
    if (create.imgFile) fd.append("image", create.imgFile);
    const res = await fetch("http://localhost:5000/products", { method: "POST", headers: h, body: fd });
    if (!res.ok) { flash(await res.text(), false); return; }
    flash("Produit créé"); create.reset(); fetchProducts(); fetchStats();
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    edit.reset({ name: p.name, description: p.description || "", price: String(p.price), quantity: String(p.quantity), category: p.category || "" });
  };

  const handleEdit = async (e) => {
    e.preventDefault(); edit.touchAll();
    if (edit.hasErrors()) return;
    const fd = new FormData();
    Object.entries(edit.form).forEach(([k, v]) => fd.append(k, v));
    if (edit.imgFile) fd.append("image", edit.imgFile);
    const res = await fetch(`http://localhost:5000/products/${editingId}`, { method: "PUT", headers: h, body: fd });
    if (!res.ok) { flash(await res.text(), false); return; }
    flash("Produit modifié"); setEditingId(null); fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement ?")) return;
    const res = await fetch(`http://localhost:5000/products/${id}`, { method: "DELETE", headers: h });
    if (!res.ok) { flash(await res.text(), false); return; }
    flash("Supprimé"); fetchProducts(); fetchPendingProducts(); fetchStats();
  };

  const approveProduct = async (id) => {
    await fetch(`http://localhost:5000/products/${id}/approve`, { method: "PUT", headers: h });
    flash("Produit approuvé"); fetchPendingProducts(); fetchProducts(); fetchStats();
  };

  const rejectProduct = async (id) => {
    await fetch(`http://localhost:5000/products/${id}/reject`, { method: "PUT", headers: h });
    flash("Produit refusé"); fetchPendingProducts(); fetchProducts();
  };

  const approveRole = async (id) => {
    await fetch(`http://localhost:5000/users/role-requests/${id}/approve`, { method: "PUT", headers: h });
    flash("Rôle approuvé"); fetchRoleRequests(); fetchUsers(); fetchStats();
  };

  const rejectRole = async (id) => {
    await fetch(`http://localhost:5000/users/role-requests/${id}/reject`, { method: "PUT", headers: h });
    flash("Demande refusée"); fetchRoleRequests();
  };

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* Feedback */}
      {msg.text && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, marginBottom: 18, fontSize: 14,
          background: msg.ok ? C.primaryL : C.redL,
          color: msg.ok ? C.primaryD : C.red,
          borderLeft: `4px solid ${msg.ok ? C.primary : C.red}`,
        }}>{msg.text}</div>
      )}

      {/* ════ DASHBOARD ════ */}
      {activeSection === "dashboard" && <DashboardSection stats={stats} />}

      {/* ════ PRODUCTS ════ */}
      {activeSection === "products" && (
        <div>
          {/* Pending approvals */}
          {pendingProducts.length > 0 && (
            <Card style={{ marginBottom: 24, border: `2px solid ${C.amber}` }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.amberL}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>⏳</span>
                <span style={{ fontWeight: 700, color: C.amber, fontSize: 15 }}>
                  {pendingProducts.length} produit{pendingProducts.length > 1 ? "s" : ""} en attente d'approbation
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Vendeur</Th><Th>Nom</Th><Th>Prix</Th><Th>Stock</Th><Th>Actions</Th></tr></thead>
                <tbody>
                  {pendingProducts.map((p) => (
                    <tr key={p.id} style={{ transition: "background .1s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = C.gray50}
                      onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                      <Td>{p.seller_name}</Td>
                      <Td style={{ fontWeight: 600 }}>{p.name}</Td>
                      <Td>{p.price} DT</Td>
                      <Td>{p.quantity}</Td>
                      <Td><div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn onClick={() => approveProduct(p.id)} color={C.primary}>✓ Approuver</ActionBtn>
                        <ActionBtn onClick={() => rejectProduct(p.id)}  color={C.red}>✗ Refuser</ActionBtn>
                      </div></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Create form */}
          <Card style={{ marginBottom: 24, padding: "20px 24px" }}>
            <SectionTitle icon="➕" title="Ajouter un produit" />
            <form onSubmit={handleCreate} noValidate style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
              {[
                { f: "name",        label: "Nom *",           type: "text",   ph: "ex : Tomates fraîches" },
                { f: "description", label: "Description",     type: "text",   ph: "Optionnel" },
                { f: "price",       label: "Prix (DT) *",     type: "number", ph: "0.00" },
                { f: "quantity",    label: "Quantité *",      type: "number", ph: "0" },
              ].map(({ f, label, type, ph }) => (
                <div key={f}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.gray700, display: "block", marginBottom: 4 }}>{label}</label>
                  <input type={type} placeholder={ph} value={create.form[f]}
                    onChange={create.change(f)} onBlur={create.blur(f)}
                    style={inp(create.err(f))} />
                  {create.err(f) && <span style={{ fontSize: 11, color: C.red }}>⚠ {create.err(f)}</span>}
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.gray700, display: "block", marginBottom: 4 }}>Catégorie</label>
                <select value={create.form.category || ""} onChange={create.change("category")}
                  style={{ ...inp(false), width: "100%", boxSizing: "border-box" }}>
                  <option value="">— Choisir une catégorie —</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {categories.length === 0 && (
                  <span style={{ fontSize: 11, color: C.gray400 }}>Aucune catégorie — créez-en dans la section Catégories.</span>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.gray700, display: "block", marginBottom: 4 }}>Image</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={create.changeImg} />
              </div>
              <button type="submit" style={{
                padding: "10px 20px", background: C.primary, color: C.white,
                border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14,
                alignSelf: "flex-start",
              }}>Créer le produit</button>
            </form>
          </Card>

          {/* Products table */}
          <Card>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.gray100}` }}>
              <SectionTitle icon="📦" title="Tous les produits" count={products.length} />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Image</Th><Th>Nom</Th><Th>Prix</Th><Th>Stock</Th><Th>Statut</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr onMouseEnter={(e) => e.currentTarget.style.background = C.gray50}
                        onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                      <Td>{p.image ? <img src={p.image} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6 }} /> : "—"}</Td>
                      <Td style={{ fontWeight: 600 }}>{p.name}</Td>
                      <Td>{p.price} DT</Td>
                      <Td>{p.quantity}</Td>
                      <Td><Badge label={STATUS_PRODUCT[p.status]?.label || p.status} color={STATUS_PRODUCT[p.status]?.color || C.gray500} /></Td>
                      <Td><div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn onClick={() => editingId === p.id ? setEditingId(null) : startEdit(p)} color={C.blue}>
                          {editingId === p.id ? "Fermer" : "Modifier"}
                        </ActionBtn>
                        <ActionBtn onClick={() => handleDelete(p.id)} color={C.red}>Supprimer</ActionBtn>
                      </div></Td>
                    </tr>
                    {editingId === p.id && (
                      <tr><td colSpan={6} style={{ background: C.gray50, padding: "16px 20px", borderBottom: `1px solid ${C.gray200}` }}>
                        <form onSubmit={handleEdit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 }}>
                          {[
                            { f: "name", label: "Nom *", type: "text" },
                            { f: "description", label: "Description", type: "text" },
                            { f: "price", label: "Prix (DT) *", type: "number" },
                            { f: "quantity", label: "Quantité *", type: "number" },
                          ].map(({ f, label, type }) => (
                            <div key={f}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 3 }}>{label}</label>
                              <input type={type} value={edit.form[f]} onChange={edit.change(f)} onBlur={edit.blur(f)} style={inp(edit.err(f))} />
                            </div>
                          ))}
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 3 }}>Catégorie</label>
                            <select value={edit.form.category || ""} onChange={edit.change("category")}
                              style={{ ...inp(false), width: "100%", boxSizing: "border-box" }}>
                              <option value="">— Aucune catégorie —</option>
                              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>
                          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={edit.changeImg} />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" style={{ padding: "8px 16px", background: C.primary, color: C.white, border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Enregistrer</button>
                            <button type="button" onClick={() => setEditingId(null)} style={{ padding: "8px 16px", background: C.gray200, color: C.gray700, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Annuler</button>
                          </div>
                        </form>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <EmptyState icon="📦" text="Aucun produit" />}
          </Card>
        </div>
      )}

      {/* ════ ROLES ════ */}
      {activeSection === "roles" && (
        <div>
          <SectionTitle icon="👥" title="Demandes de rôle" count={roleRequests.length} />
          {roleRequests.length === 0 ? (
            <Card><EmptyState icon="✅" text="Aucune demande en attente" /></Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {roleRequests.map((r) => (
                <Card key={r.id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: ROLE_COLOR[r.pending_role] + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 700, color: ROLE_COLOR[r.pending_role],
                    }}>
                      {r.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: C.gray900 }}>{r.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: C.gray500 }}>{r.email}</p>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 11, color: C.gray400 }}>Rôle actuel</p>
                      <Badge label={r.role} color={ROLE_COLOR[r.role] || C.gray500} />
                    </div>
                    <div style={{ fontSize: 20, color: C.gray300 }}>→</div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 11, color: C.gray400 }}>Demande</p>
                      <Badge label={r.pending_role} color={ROLE_COLOR[r.pending_role] || C.blue} />
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <ActionBtn onClick={() => approveRole(r.id)} color={C.primary}>✓ Approuver</ActionBtn>
                      <ActionBtn onClick={() => rejectRole(r.id)}  color={C.red}>✗ Refuser</ActionBtn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ DELIVERIES ════ */}
      {activeSection === "deliveries" && (
        <div>
          <SectionTitle icon="🚚" title="Suivi des livraisons" count={deliveries.length} />
          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>#</Th><Th>Produit</Th><Th>Client</Th><Th>Vendeur</Th><Th>Livreur</Th><Th>Qté</Th><Th>Statut</Th><Th>Date</Th></tr></thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.gray50}
                    onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                    <Td style={{ color: C.gray400, fontSize: 12 }}>#{d.id}</Td>
                    <Td style={{ fontWeight: 600 }}>{d.product_name}</Td>
                    <Td>{d.client_name}</Td>
                    <Td>{d.vendeur_name}</Td>
                    <Td>{d.livreur_name || <span style={{ color: C.gray300 }}>—</span>}</Td>
                    <Td>{d.quantity}</Td>
                    <Td><Badge label={STATUS_DELIVERY[d.status]?.label || d.status} color={STATUS_DELIVERY[d.status]?.color || C.gray500} /></Td>
                    <Td style={{ fontSize: 12, color: C.gray500 }}>{new Date(d.created_at).toLocaleDateString("fr-FR")}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveries.length === 0 && <EmptyState icon="🚚" text="Aucune livraison enregistrée" />}
          </Card>
        </div>
      )}

      {/* ════ USERS ════ */}
      {activeSection === "users" && (
        <div>
          <SectionTitle icon="🧑" title="Utilisateurs" count={users.length} />
          <Card>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>#</Th><Th>Nom</Th><Th>Email</Th><Th>Rôle</Th><Th>Disponibilité</Th><Th>Demande en cours</Th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.gray50}
                    onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                    <Td style={{ color: C.gray400, fontSize: 12 }}>#{u.id}</Td>
                    <Td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                          background: (ROLE_COLOR[u.role] || C.gray400) + "22",
                          color: ROLE_COLOR[u.role] || C.gray500,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 13,
                        }}>{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </Td>
                    <Td style={{ color: C.gray500 }}>{u.email}</Td>
                    <Td><Badge label={u.role} color={ROLE_COLOR[u.role] || C.gray500} /></Td>
                    <Td>
                      {u.role === "livreur"
                        ? <Badge
                            label={u.available ? "Disponible" : "Indisponible"}
                            color={u.available ? C.primary : C.gray400}
                          />
                        : <span style={{ color: C.gray300, fontSize: 13 }}>—</span>}
                    </Td>
                    <Td>{u.pending_role
                      ? <Badge label={`→ ${u.pending_role}`} color={ROLE_COLOR[u.pending_role] || C.blue} />
                      : <span style={{ color: C.gray300, fontSize: 13 }}>—</span>}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <EmptyState icon="🧑" text="Aucun utilisateur" />}
          </Card>
        </div>
      )}

      {/* ════ CATEGORIES ════ */}
      {activeSection === "categories" && (
        <div>
          <SectionTitle icon="🏷️" title="Catégories" count={categories.length} />

          {/* Create */}
          <Card style={{ padding: "20px 24px", marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: C.gray800, marginBottom: 12 }}>Nouvelle catégorie</p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ex: Fruits, Légumes, Pain…"
                style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: "inherit" }}
                onKeyDown={async (e) => { if (e.key === "Enter") await handleCreateCategory(); }}
              />
              <ActionBtn onClick={handleCreateCategory} color={C.primary}>Ajouter</ActionBtn>
            </div>
          </Card>

          {/* List */}
          <Card>
            {categories.length === 0
              ? <EmptyState icon="🏷️" text="Aucune catégorie — créez-en une ci-dessus." />
              : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><Th>#</Th><Th>Nom</Th><Th>Action</Th></tr></thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}
                        onMouseEnter={(e) => e.currentTarget.style.background = C.gray50}
                        onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                        <Td style={{ color: C.gray400, fontSize: 12 }}>#{cat.id}</Td>
                        <Td style={{ fontWeight: 600 }}>{cat.name}</Td>
                        <Td>
                          <ActionBtn onClick={() => handleDeleteCategory(cat.id)} color={C.red}>Supprimer</ActionBtn>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
          </Card>
        </div>
      )}

      {/* ════ COUPONS ════ */}
      {activeSection === "coupons" && (
        <div>
          <SectionTitle icon="🎟️" title="Codes promo" count={coupons.length} />

          {/* Create */}
          <Card style={{ padding: "20px 24px", marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: C.gray800, marginBottom: 12 }}>Nouveau coupon</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Code (ex: ETE20)"
                style={{ flex: 2, minWidth: 140, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: "inherit" }}
              />
              <input
                type="number"
                value={couponPct}
                onChange={(e) => setCouponPct(e.target.value)}
                placeholder="% remise"
                min={1} max={100}
                style={{ width: 110, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: "inherit" }}
              />
              <ActionBtn onClick={handleCreateCoupon} color={C.primary}>Créer</ActionBtn>
            </div>
          </Card>

          {/* List */}
          <Card>
            {coupons.length === 0
              ? <EmptyState icon="🎟️" text="Aucun coupon — créez-en un ci-dessus." />
              : <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><Th>#</Th><Th>Code</Th><Th>Remise</Th><Th>Statut</Th><Th>Créé le</Th><Th>Action</Th></tr></thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id}
                        onMouseEnter={(e) => e.currentTarget.style.background = C.gray50}
                        onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                        <Td style={{ color: C.gray400, fontSize: 12 }}>#{c.id}</Td>
                        <Td><span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: C.gray900 }}>{c.code}</span></Td>
                        <Td><Badge label={`-${c.discount_pct}%`} color={C.primary} /></Td>
                        <Td><Badge label={c.active ? "Actif" : "Inactif"} color={c.active ? C.primary : C.gray400} /></Td>
                        <Td style={{ fontSize: 12, color: C.gray500 }}>{new Date(c.created_at).toLocaleDateString("fr-FR")}</Td>
                        <Td>
                          <ActionBtn onClick={() => handleDeleteCoupon(c.id)} color={C.red}>Supprimer</ActionBtn>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
          </Card>
        </div>
      )}

      {/* ════ EXPORT CSV ════ */}
      {activeSection === "export" && (
        <div>
          <SectionTitle icon="📤" title="Export CSV" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { label: "Utilisateurs",  icon: "🧑", url: "http://localhost:5000/admin/export/users",      file: "utilisateurs.csv" },
              { label: "Commandes",     icon: "📦", url: "http://localhost:5000/admin/export/orders",     file: "commandes.csv" },
              { label: "Livraisons",    icon: "🚚", url: "http://localhost:5000/admin/export/deliveries", file: "livraisons.csv" },
            ].map(({ label, icon, url, file }) => (
              <Card key={file} style={{ padding: "28px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
                <p style={{ fontWeight: 700, fontSize: 16, color: C.gray900, marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 12, color: C.gray500, marginBottom: 20 }}>Télécharger toutes les données au format CSV</p>
                <a
                  href={url}
                  download={file}
                  onClick={(e) => {
                    e.preventDefault();
                    fetch(url, { headers: h })
                      .then((r) => r.blob())
                      .then((blob) => {
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = file;
                        a.click();
                      });
                  }}
                  style={{
                    display: "inline-block", padding: "9px 20px",
                    background: C.primary, color: "#fff",
                    borderRadius: 8, fontSize: 13, fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Télécharger
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ════ DASHBOARD SECTION ════
function DashboardSection({ stats }) {
  if (!stats) return (
    <div style={{ textAlign: "center", padding: 60, color: C.gray400 }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
      <p>Chargement des statistiques…</p>
    </div>
  );

  // Computed totals
  const totalUsers     = stats.users.reduce((s, r) => s + r.count, 0);
  const totalProducts  = stats.products.reduce((s, r) => s + r.count, 0);
  const approvedProds  = stats.products.find((r) => r.status === "approved")?.count || 0;
  const pendingProds   = stats.products.find((r) => r.status === "pending")?.count  || 0;
  const totalDeliveries= stats.deliveries.reduce((s, r) => s + r.count, 0);
  const delivered      = stats.deliveries.find((r) => r.status === "delivered")?.count || 0;

  // Chart data
  const userChartData = stats.users.map((r) => ({ name: r.role, value: r.count, color: ROLE_COLOR[r.role] || C.gray400 }));
  const deliveryChartData = stats.deliveries.map((r) => ({
    name: STATUS_DELIVERY[r.status]?.label || r.status,
    value: r.count,
    color: STATUS_DELIVERY[r.status]?.color || C.gray400,
  }));
  const productChartData = stats.products.map((r) => ({
    name: STATUS_PRODUCT[r.status]?.label || r.status,
    value: r.count,
    fill: STATUS_PRODUCT[r.status]?.color || C.gray400,
  }));

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "👥", label: "Utilisateurs",      value: totalUsers,     sub: `${stats.users.find(r=>r.role==="client")?.count||0} clients`,  color: C.blue,   bg: C.blueL },
          { icon: "📦", label: "Produits approuvés",value: approvedProds,  sub: `${pendingProds} en attente`,                                    color: C.primary,bg: C.primaryL },
          { icon: "🚚", label: "Livraisons",        value: totalDeliveries,sub: `${delivered} livrées`,                                          color: C.purple, bg: C.purpleL },
          { icon: "⭐", label: "Note moyenne",      value: stats.ratings?.avg ? `${stats.ratings.avg}/5` : "—", sub: `${stats.ratings?.count||0} avis`, color: C.amber, bg: C.amberL },
        ].map((kpi) => (
          <Card key={kpi.label} style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: C.gray500 }}>{kpi.label}</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: C.gray900, lineHeight: 1 }}>{kpi.value}</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: C.gray400 }}>{kpi.sub}</p>
              </div>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>{kpi.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Users by role */}
        <Card style={{ padding: "20px 22px" }}>
          <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: C.gray800 }}>Répartition des rôles</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={userChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                {userChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Delivery status */}
        <Card style={{ padding: "20px 22px" }}>
          <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: C.gray800 }}>Statuts des livraisons</p>
          {deliveryChartData.length === 0 ? (
            <EmptyState icon="🚚" text="Aucune livraison" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deliveryChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {deliveryChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Reservations trend */}
        <Card style={{ padding: "20px 22px" }}>
          <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: C.gray800 }}>Réservations — 14 derniers jours</p>
          {stats.reservations_by_day.length === 0 ? (
            <EmptyState icon="🧾" text="Aucune réservation récente" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.reservations_by_day} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.gray400 }} />
                <YAxis tick={{ fontSize: 11, fill: C.gray400 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${C.gray200}` }} />
                <Area type="monotone" dataKey="count" name="Réservations" stroke={C.primary} strokeWidth={2} fill="url(#resGrad)" dot={{ r: 3, fill: C.primary }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Products by status */}
        <Card style={{ padding: "20px 22px" }}>
          <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: C.gray800 }}>Produits par statut</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productChartData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.gray400 }} />
              <YAxis tick={{ fontSize: 11, fill: C.gray400 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${C.gray200}` }} />
              <Bar dataKey="value" name="Produits" radius={[6, 6, 0, 0]}>
                {productChartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top products */}
      {stats.top_products?.length > 0 && (
        <Card style={{ padding: "20px 22px" }}>
          <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: C.gray800 }}>Top 5 produits les plus réservés</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.top_products.map((p, i) => {
              const max = stats.top_products[0].reservations || 1;
              const pct = (p.reservations / max) * 100;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.gray400, width: 18, textAlign: "center" }}>{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.gray800, minWidth: 150 }}>{p.name}</span>
                  <div style={{ flex: 1, height: 8, background: C.gray100, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: C.primary, borderRadius: 999, transition: "width .4s" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.primary, minWidth: 30, textAlign: "right" }}>{p.reservations}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
