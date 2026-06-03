import React, { useEffect, useState } from "react";
import { useAuth } from "../useAuth.jsx";
import { colors, font, radius, shadow, makeBtn } from "../theme.js";

const LOW_STOCK  = 5;

/* ── Shared UI ── */
const Card = ({ children, style }) => (
  <div style={{ background: colors.white, borderRadius: radius.xl, border: `1px solid ${colors.gray200}`, boxShadow: shadow.sm, ...style }}>
    {children}
  </div>
);

const KPI = ({ icon, label, value, sub, color }) => (
  <Card style={{ padding: "18px 20px" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.gray500 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: font.weight.extrabold, color: colors.gray900, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ margin: "5px 0 0", fontSize: font.size.xs, color: colors.gray400 }}>{sub}</p>}
      </div>
      <div style={{ width: 42, height: 42, borderRadius: radius.lg, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
        {icon}
      </div>
    </div>
  </Card>
);

const rules = {
  name:     (v) => !v.trim() ? "Requis" : v.trim().length < 2 ? "Min 2 car." : v.trim().length > 100 ? "Max 100 car." : "",
  price:    (v) => isNaN(v) || Number(v) <= 0 ? "Prix > 0" : "",
  quantity: (v) => isNaN(v) || Number(v) < 0 ? "Qté ≥ 0" : !Number.isInteger(Number(v)) ? "Entier" : "",
  description: (v) => v.length > 500 ? "Max 500 car." : "",
  image:    (f) => !f ? "" : !["image/jpeg","image/png","image/webp"].includes(f.type) ? "JPEG/PNG/WebP" : f.size > 5*1024*1024 ? "Max 5 Mo" : "",
};
const FIELDS = ["name","price","quantity","description","image"];

function useProductForm(init = { name:"", description:"", price:"", quantity:"", category:"" }) {
  const [form, setForm]       = useState(init);
  const [touched, setTouched] = useState({});
  const [imgFile, setImgFile] = useState(null);
  const err     = (f) => !touched[f] ? "" : f==="image" ? rules.image(imgFile) : rules[f]?.(form[f]) ?? "";
  const hasErrors = () => FIELDS.some((f) => f==="image" ? rules.image(imgFile) : rules[f]?.(form[f]));
  const change  = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const blur    = (f) => () => setTouched((p) => ({ ...p, [f]: true }));
  const changeImg = (e) => { setImgFile(e.target.files[0]||null); setTouched((p)=>({...p,image:true})); };
  const touchAll  = () => { const t={}; FIELDS.forEach((f)=>(t[f]=true)); setTouched(t); };
  const reset     = (v=init) => { setForm(v); setTouched({}); setImgFile(null); };
  return { form, setForm, imgFile, err, hasErrors, change, blur, changeImg, touchAll, reset };
}

const inp = (e) => ({
  padding: "9px 12px", fontSize: font.size.base, borderRadius: radius.md,
  border: `1.5px solid ${e ? colors.danger : colors.gray200}`,
  outline: "none", fontFamily: font.family, width: "100%", boxSizing: "border-box",
  transition: "border-color .15s",
});

function Field({ label, error, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.gray700 }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 11, color: colors.danger }}>⚠ {error}</span>}
    </div>
  );
}

export default function VendeurPage() {
  const { token } = useAuth();
  const [tab, setTab]       = useState("dashboard");
  const [message, setMessage] = useState({ text:"", ok:true });
  const flash = (text, ok=true) => setMessage({ text, ok });

  // Products
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [editingId,    setEditingId]    = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const create = useProductForm();
  const edit   = useProductForm();

  // Dashboard stats
  const [stats, setStats] = useState(null);

  // Categories from admin
  const [categories, setCategories] = useState([]);

  // Delivery requests
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [deliveryMsg,      setDeliveryMsg]      = useState("");

  const h = { Authorization: `Bearer ${token}` };

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/products/mine", { headers: h });
      if (!res.ok) throw new Error(await res.text());
      setProducts(await res.json());
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/products/vendeur-stats", { headers: h });
      if (res.ok) setStats(await res.json());
    } catch(e) { console.error(e); }
  };

  const fetchDeliveryRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/deliveries/vendeur-requests", { headers: h });
      if (res.ok) setDeliveryRequests(await res.json());
    } catch(e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchMyProducts(); fetchStats(); fetchDeliveryRequests(); fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); create.touchAll();
    if (create.hasErrors()) return;
    try {
      const fd = new FormData();
      Object.entries(create.form).forEach(([k,v]) => fd.append(k, v));
      if (create.imgFile) fd.append("image", create.imgFile);
      const res = await fetch("http://localhost:5000/products", { method:"POST", headers: h, body: fd });
      if (!res.ok) throw new Error(await res.text());
      flash("Produit soumis — en attente de validation admin");
      create.reset(); fetchMyProducts(); fetchStats();
    } catch(e) { flash(e.message, false); }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setCurrentImage(p.image || null);
    edit.reset({ name: p.name, description: p.description||"", price: String(p.price), quantity: String(p.quantity), category: p.category||"" });
  };

  const handleEdit = async (e) => {
    e.preventDefault(); edit.touchAll();
    if (edit.hasErrors()) return;
    try {
      const fd = new FormData();
      Object.entries(edit.form).forEach(([k,v]) => fd.append(k, v));
      if (edit.imgFile) fd.append("image", edit.imgFile);
      const res = await fetch(`http://localhost:5000/products/${editingId}`, { method:"PUT", headers: h, body: fd });
      if (!res.ok) throw new Error(await res.text());
      flash("Produit modifié"); setEditingId(null); fetchMyProducts(); fetchStats();
    } catch(e) { flash(e.message, false); }
  };

  const handleDeliveryAction = async (id, action) => {
    setDeliveryMsg("");
    try {
      const res = await fetch(`http://localhost:5000/deliveries/${id}/vendeur-${action}`, { method:"PUT", headers: h });
      if (!res.ok) throw new Error(await res.text());
      setDeliveryMsg(action==="approve" ? "Livraison approuvée" : "Livraison refusée");
      fetchDeliveryRequests();
    } catch(e) { setDeliveryMsg(`Erreur : ${e.message}`); }
  };

  const statusLabel = { pending:"En attente", approved:"Approuvé", rejected:"Refusé" };
  const statusColor = { pending: colors.accent, approved: colors.primary, rejected: colors.danger };

  const TABS = [
    { id:"dashboard", icon:"📊", label:"Tableau de bord" },
    { id:"products",  icon:"📦", label:"Mes produits" },
    { id:"deliveries",icon:"🚚", label:`Livraisons${deliveryRequests.length > 0 ? ` (${deliveryRequests.length})` : ""}` },
  ];

  return (
    <div style={{ maxWidth: 1000, margin:"0 auto", padding:"28px 24px", fontFamily: font.family }}>
      <h1 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.gray900, marginBottom: 4 }}>
        Espace Vendeur
      </h1>
      <p style={{ color: colors.gray500, fontSize: font.size.base, marginBottom: 24 }}>
        Gérez vos produits et suivez vos ventes.
      </p>

      {message.text && (
        <div style={{
          padding: "10px 14px", borderRadius: radius.md, marginBottom: 18, fontSize: font.size.sm,
          background: message.ok ? colors.primaryLight : colors.dangerLight,
          color: message.ok ? colors.primaryDark : colors.dangerDark,
          borderLeft: `3px solid ${message.ok ? colors.primary : colors.danger}`,
        }}>{message.text}</div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, borderBottom:`2px solid ${colors.gray200}`, marginBottom:24 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"10px 18px", border:"none", cursor:"pointer",
            background:"none", fontFamily: font.family,
            fontSize: font.size.base, fontWeight: font.weight.semibold,
            color: tab===t.id ? colors.primary : colors.gray500,
            borderBottom:`2px solid ${tab===t.id ? colors.primary : "transparent"}`,
            marginBottom:-2, transition:"color .15s",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════ TAB : DASHBOARD ════ */}
      {tab==="dashboard" && (
        <div>
          {!stats ? (
            <p style={{ color: colors.gray400 }}>Chargement…</p>
          ) : (
            <>
              {/* KPI cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
                <KPI icon="📦" label="Produits approuvés" value={stats.summary.approved} sub={`${stats.summary.pending} en attente`} color={colors.primary} />
                <KPI icon="🧾" label="Réservations totales" value={stats.summary.total_reservations} color={colors.info} />
                <KPI icon="💰" label="Revenu estimé" value={`${Number(stats.summary.estimated_revenue).toFixed(2)} DT`} color={colors.accent} />
                <KPI icon="⚠️" label="Stock faible" value={stats.summary.low_stock_count} sub={`< ${LOW_STOCK} unités`} color={colors.danger} />
              </div>

              {/* Top products */}
              <Card style={{ padding:"20px 22px", marginBottom:16 }}>
                <p style={{ fontWeight: font.weight.bold, fontSize: font.size.lg, color: colors.gray800, margin:"0 0 16px" }}>
                  Produits les plus vendus
                </p>
                {stats.products.filter((p) => p.reserved_qty > 0).length === 0 ? (
                  <p style={{ color: colors.gray400, fontSize: font.size.sm }}>Aucune réservation pour le moment.</p>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {stats.products.filter((p) => p.reserved_qty > 0).slice(0,5).map((p, i) => {
                      const max = stats.products[0]?.reserved_qty || 1;
                      return (
                        <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ width:20, fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.gray400, textAlign:"center" }}>{i+1}</span>
                          {p.image && <img src={p.image} alt="" style={{ width:36, height:36, borderRadius:radius.md, objectFit:"cover", flexShrink:0 }} />}
                          <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.gray800, minWidth:140 }}>{p.name}</span>
                          <div style={{ flex:1, height:8, background: colors.gray100, borderRadius:999, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${(p.reserved_qty/max)*100}%`, background: colors.primary, borderRadius:999 }} />
                          </div>
                          <span style={{ fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.primary, minWidth:50, textAlign:"right" }}>
                            {p.reserved_qty} vendus
                          </span>
                          <span style={{ fontSize: font.size.sm, color: colors.gray400, minWidth:70, textAlign:"right" }}>
                            {Number(p.revenue).toFixed(2)} DT
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Low stock alerts */}
              {stats.products.filter((p) => p.quantity < LOW_STOCK && p.status==="approved").length > 0 && (
                <Card style={{ padding:"18px 22px", border:`2px solid ${colors.danger}22` }}>
                  <p style={{ fontWeight: font.weight.bold, fontSize: font.size.lg, color: colors.danger, margin:"0 0 14px" }}>
                    ⚠️ Alertes stock faible
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {stats.products.filter((p) => p.quantity < LOW_STOCK && p.status==="approved").map((p) => (
                      <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 12px", background: colors.dangerLight, borderRadius: radius.md }}>
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <span style={{ flex:1, fontWeight: font.weight.semibold, color: colors.gray800 }}>{p.name}</span>
                        <span style={{ fontSize: font.size.sm, fontWeight: font.weight.bold, color: colors.danger }}>
                          {p.quantity} unité{p.quantity !== 1 ? "s" : ""} restante{p.quantity !== 1 ? "s" : ""}
                        </span>
                        <button onClick={() => { setTab("products"); startEdit(p); }} style={{ ...makeBtn("danger","sm"), fontSize:11 }}>
                          Modifier
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ════ TAB : PRODUCTS ════ */}
      {tab==="products" && (
        <div>
          {/* Create form */}
          <Card style={{ padding:"22px 24px", marginBottom:24 }}>
            <p style={{ fontWeight: font.weight.bold, fontSize: font.size.xl, color: colors.gray900, margin:"0 0 16px" }}>
              Soumettre un nouveau produit
            </p>
            <p style={{ color: colors.gray500, fontSize: font.size.sm, margin:"0 0 16px" }}>
              Votre produit sera visible après validation par un administrateur.
            </p>
            <form onSubmit={handleCreate} noValidate style={{ display:"flex", flexDirection:"column", gap:14, maxWidth:480 }}>
              <Field label="Nom *" error={create.err("name")}>
                <input placeholder="ex : Tomates fraîches" value={create.form.name} onChange={create.change("name")} onBlur={create.blur("name")} style={inp(create.err("name"))} />
              </Field>
              <Field label="Description" error={create.err("description")}>
                <input placeholder="Optionnel, max 500 car." value={create.form.description} onChange={create.change("description")} onBlur={create.blur("description")} style={inp(create.err("description"))} />
              </Field>
              <Field label="Catégorie">
                <select value={create.form.category} onChange={create.change("category")} style={{ ...inp(false), color: create.form.category ? colors.gray900 : colors.gray400 }}>
                  <option value="">— Choisir une catégorie —</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </Field>
              <div style={{ display:"flex", gap:12 }}>
                <Field label="Prix (DT) *" error={create.err("price")}>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={create.form.price} onChange={create.change("price")} onBlur={create.blur("price")} style={inp(create.err("price"))} />
                </Field>
                <Field label="Quantité *" error={create.err("quantity")}>
                  <input type="number" min="0" placeholder="0" value={create.form.quantity} onChange={create.change("quantity")} onBlur={create.blur("quantity")} style={inp(create.err("quantity"))} />
                </Field>
              </div>
              <Field label="Image (JPEG / PNG / WebP — max 5 Mo)" error={create.err("image")}>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={create.changeImg} />
              </Field>
              <button type="submit" style={{ ...makeBtn("primary","md"), alignSelf:"flex-start" }}>Soumettre le produit</button>
            </form>
          </Card>

          {/* Products table */}
          <Card>
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${colors.gray100}`, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontWeight: font.weight.bold, fontSize: font.size.xl, color: colors.gray900 }}>
                Mes produits
              </span>
              <span style={{ background: colors.gray100, color: colors.gray600, fontSize: font.size.xs, fontWeight: font.weight.bold, padding:"2px 8px", borderRadius:999 }}>
                {products.length}
              </span>
            </div>
            {loading ? <p style={{ padding:"20px", color: colors.gray400 }}>Chargement…</p> : products.length === 0 ? (
              <p style={{ padding:"40px", textAlign:"center", color: colors.gray400 }}>Aucun produit soumis pour le moment.</p>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background: colors.gray50 }}>
                    {["Image","Nom","Catégorie","Prix","Stock","Statut","Actions"].map((h) => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:colors.gray500, textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:`1px solid ${colors.gray200}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr onMouseEnter={(e)=>e.currentTarget.style.background=colors.gray50} onMouseLeave={(e)=>e.currentTarget.style.background=""}>
                        <td style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.gray100}`, verticalAlign:"middle" }}>
                          {p.image ? <img src={p.image} alt="" style={{ width:48, height:36, objectFit:"cover", borderRadius:radius.md }} /> : "—"}
                        </td>
                        <td style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.gray100}`, verticalAlign:"middle", fontWeight:600, color:colors.gray900 }}>{p.name}</td>
                        <td style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.gray100}`, verticalAlign:"middle" }}>
                          {p.category ? (
                            <span style={{ background: colors.primaryLight, color: colors.primaryDark, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:999 }}>{p.category}</span>
                          ) : <span style={{ color:colors.gray300 }}>—</span>}
                        </td>
                        <td style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.gray100}`, verticalAlign:"middle" }}>{p.price} DT</td>
                        <td style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.gray100}`, verticalAlign:"middle" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontWeight: p.quantity < LOW_STOCK ? font.weight.bold : font.weight.normal, color: p.quantity < LOW_STOCK ? colors.danger : colors.gray700 }}>
                              {p.quantity}
                            </span>
                            {p.quantity < LOW_STOCK && p.status==="approved" && (
                              <span style={{ background: colors.dangerLight, color: colors.danger, fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:999, whiteSpace:"nowrap" }}>
                                ⚠ Faible
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.gray100}`, verticalAlign:"middle" }}>
                          <span style={{ padding:"3px 10px", borderRadius:12, fontSize:12, fontWeight:"bold", background:(statusColor[p.status]||colors.gray400)+"22", color:statusColor[p.status]||colors.gray400 }}>
                            {statusLabel[p.status]||p.status}
                          </span>
                        </td>
                        <td style={{ padding:"10px 14px", borderBottom:`1px solid ${colors.gray100}`, verticalAlign:"middle" }}>
                          <button onClick={() => editingId===p.id ? setEditingId(null) : startEdit(p)} style={{ ...makeBtn("ghost","sm"), fontSize:12 }}>
                            {editingId===p.id ? "Fermer" : "Modifier"}
                          </button>
                        </td>
                      </tr>

                      {editingId===p.id && (
                        <tr>
                          <td colSpan={7} style={{ padding:"18px 22px", background:colors.gray50, borderBottom:`1px solid ${colors.gray200}` }}>
                            <form onSubmit={handleEdit} noValidate style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:480 }}>
                              <Field label="Nom *" error={edit.err("name")}>
                                <input value={edit.form.name} onChange={edit.change("name")} onBlur={edit.blur("name")} style={inp(edit.err("name"))} />
                              </Field>
                              <Field label="Description" error={edit.err("description")}>
                                <input value={edit.form.description} onChange={edit.change("description")} onBlur={edit.blur("description")} style={inp(edit.err("description"))} />
                              </Field>
                              <Field label="Catégorie">
                                <select value={edit.form.category} onChange={edit.change("category")} style={inp(false)}>
                                  <option value="">— Aucune catégorie —</option>
                                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                              </Field>
                              <div style={{ display:"flex", gap:12 }}>
                                <Field label="Prix (DT) *" error={edit.err("price")}>
                                  <input type="number" step="0.01" min="0" value={edit.form.price} onChange={edit.change("price")} onBlur={edit.blur("price")} style={inp(edit.err("price"))} />
                                </Field>
                                <Field label="Quantité *" error={edit.err("quantity")}>
                                  <input type="number" min="0" value={edit.form.quantity} onChange={edit.change("quantity")} onBlur={edit.blur("quantity")} style={inp(edit.err("quantity"))} />
                                </Field>
                              </div>
                              <div>
                                <label style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.gray700, display:"block", marginBottom:6 }}>
                                  Image
                                </label>
                                {currentImage && !edit.imgFile && (
                                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                                    <img
                                      src={currentImage}
                                      alt="Image actuelle"
                                      style={{ width:64, height:48, objectFit:"cover", borderRadius:radius.md, border:`1px solid ${colors.gray200}` }}
                                    />
                                    <span style={{ fontSize:font.size.xs, color:colors.gray400 }}>Image actuelle — choisissez un fichier pour la remplacer</span>
                                  </div>
                                )}
                                {edit.imgFile && (
                                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                                    <img
                                      src={URL.createObjectURL(edit.imgFile)}
                                      alt="Nouvelle image"
                                      style={{ width:64, height:48, objectFit:"cover", borderRadius:radius.md, border:`1px solid ${colors.primary}` }}
                                    />
                                    <span style={{ fontSize:font.size.xs, color:colors.primaryDark }}>Nouvelle image sélectionnée</span>
                                  </div>
                                )}
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={edit.changeImg} />
                                {edit.err("image") && <span style={{ fontSize:11, color:colors.danger }}>⚠ {edit.err("image")}</span>}
                              </div>
                              <div style={{ display:"flex", gap:8 }}>
                                <button type="submit" style={makeBtn("primary","sm")}>Enregistrer</button>
                                <button type="button" onClick={() => setEditingId(null)} style={makeBtn("ghost","sm")}>Annuler</button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      {/* ════ TAB : DELIVERIES ════ */}
      {tab==="deliveries" && (
        <div>
          <p style={{ fontSize: font.size.base, color: colors.gray500, marginBottom:16 }}>
            Demandes de livraison en attente pour vos produits.
          </p>
          {deliveryMsg && (
            <div style={{ padding:"10px 14px", borderRadius:radius.md, marginBottom:14, fontSize:font.size.sm,
              background: deliveryMsg.startsWith("Erreur") ? colors.dangerLight : colors.primaryLight,
              color: deliveryMsg.startsWith("Erreur") ? colors.dangerDark : colors.primaryDark,
              borderLeft:`3px solid ${deliveryMsg.startsWith("Erreur") ? colors.danger : colors.primary}`,
            }}>{deliveryMsg}</div>
          )}
          {deliveryRequests.length === 0 ? (
            <Card style={{ padding:"48px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
              <p style={{ color:colors.gray400, margin:0 }}>Aucune demande en attente.</p>
            </Card>
          ) : (
            <Card>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:colors.gray50 }}>
                  {["#","Produit","Client","Quantité","Date","Actions"].map((h) => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:colors.gray500, textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:`1px solid ${colors.gray200}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {deliveryRequests.map((d) => (
                    <tr key={d.id} onMouseEnter={(e)=>e.currentTarget.style.background=colors.gray50} onMouseLeave={(e)=>e.currentTarget.style.background=""}>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${colors.gray100}`, color:colors.gray400, fontSize:12 }}>#{d.id}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${colors.gray100}`, fontWeight:600, color:colors.gray900 }}>{d.product_name}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${colors.gray100}` }}>{d.client_name}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${colors.gray100}` }}>{d.quantity}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${colors.gray100}`, fontSize:12, color:colors.gray500 }}>{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding:"12px 14px", borderBottom:`1px solid ${colors.gray100}` }}>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={() => handleDeliveryAction(d.id,"approve")} style={{ ...makeBtn("primary","sm"), fontSize:12 }}>✓ Approuver</button>
                          <button onClick={() => handleDeliveryAction(d.id,"reject")}  style={{ ...makeBtn("danger","sm"), fontSize:12 }}>✗ Refuser</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
