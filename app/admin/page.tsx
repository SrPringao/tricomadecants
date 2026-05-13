"use client";

import { useState, useRef, useEffect } from "react";

/* ─── Tipos ── */
type Size = "S" | "M" | "L";
type Category = "Serie A" | "Serie B" | "Serie C" | "Edición Especial";

interface Product {
  id: number;
  name: string;
  subtitle: string;
  category: Category;
  tags: string;
  prices: Record<Size, number | "">;
  active: boolean;
  createdAt: string;
}

const CATEGORIES: Category[] = ["Serie A", "Serie B", "Serie C", "Edición Especial"];

const CAT_COLOR: Record<Category, string> = {
  "Serie A": "#2a5c45",
  "Serie B": "#1a3a5c",
  "Serie C": "#7a4a1a",
  "Edición Especial": "#6b1a3a",
};

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Modelo 01", subtitle: "Colección Principal", category: "Serie A", tags: "Clásico, Versátil, Premium", prices: { S: 45, M: 80, L: 140 }, active: true, createdAt: "2025-01-10" },
  { id: 2, name: "Modelo 02", subtitle: "Colección Principal", category: "Serie A", tags: "Intenso, Sofisticado, Duradero", prices: { S: 52, M: 90, L: 155 }, active: true, createdAt: "2025-01-10" },
  { id: 3, name: "Modelo 03", subtitle: "Colección Premium", category: "Serie B", tags: "Fresco, Moderno, Único", prices: { S: 60, M: 105, L: 180 }, active: true, createdAt: "2025-01-15" },
  { id: 4, name: "Modelo 04", subtitle: "Colección Premium", category: "Serie B", tags: "Oscuro, Profundo, Exclusivo", prices: { S: 55, M: 95, L: 162 }, active: false, createdAt: "2025-01-15" },
  { id: 5, name: "Modelo 05", subtitle: "Colección Selecta", category: "Serie C", tags: "Elegante, Refinado, Atemporal", prices: { S: 70, M: 120, L: 210 }, active: true, createdAt: "2025-02-01" },
  { id: 6, name: "Modelo 06", subtitle: "Edición Limitada", category: "Edición Especial", tags: "Raro, Coleccionable, Especial", prices: { S: 90, M: 155, L: 270 }, active: true, createdAt: "2025-02-14" },
];

const EMPTY_PRODUCT: Omit<Product, "id" | "createdAt"> = {
  name: "",
  subtitle: "",
  category: "Serie A",
  tags: "",
  prices: { S: "", M: "", L: "" },
  active: true,
};

/* ─── Componente ── */
export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_PRODUCT>(EMPTY_PRODUCT);
  const [filterCat, setFilterCat] = useState<Category | "Todas">("Todas");
  const [filterActive, setFilterActive] = useState<"todos" | "activos" | "inactivos">("todos");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "del" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* Focus primer campo al abrir panel */
  useEffect(() => {
    if ((editing || isNew) && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [editing, isNew]);

  /* Cerrar panel con Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const openNew = () => {
    setForm({ ...EMPTY_PRODUCT, prices: { S: "", M: "", L: "" } });
    setEditing(null);
    setIsNew(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      subtitle: p.subtitle,
      category: p.category,
      tags: p.tags,
      prices: { ...p.prices },
      active: p.active,
    });
    setEditing(p);
    setIsNew(false);
  };

  const closePanel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const toggleActive = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const saveProduct = () => {
    if (!form.name.trim()) return;
    if (isNew) {
      const newP: Product = {
        ...form,
        id: Date.now(),
        createdAt: new Date().toISOString().split("T")[0],
        prices: {
          S: form.prices.S === "" ? 0 : Number(form.prices.S),
          M: form.prices.M === "" ? 0 : Number(form.prices.M),
          L: form.prices.L === "" ? 0 : Number(form.prices.L),
        },
      };
      setProducts((prev) => [newP, ...prev]);
      setToast({ msg: "Producto agregado", type: "ok" });
    } else if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                ...form,
                prices: {
                  S: form.prices.S === "" ? 0 : Number(form.prices.S),
                  M: form.prices.M === "" ? 0 : Number(form.prices.M),
                  L: form.prices.L === "" ? 0 : Number(form.prices.L),
                },
              }
            : p
        )
      );
      setToast({ msg: "Cambios guardados", type: "ok" });
    }
    closePanel();
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    setToast({ msg: "Producto eliminado", type: "del" });
    if (editing?.id === id) closePanel();
  };

  const filtered = products.filter((p) => {
    const catOk = filterCat === "Todas" || p.category === filterCat;
    const activeOk =
      filterActive === "todos" ||
      (filterActive === "activos" && p.active) ||
      (filterActive === "inactivos" && !p.active);
    const searchOk =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.toLowerCase().includes(search.toLowerCase());
    return catOk && activeOk && searchOk;
  });

  const stats = {
    total: products.length,
    activos: products.filter((p) => p.active).length,
    inactivos: products.filter((p) => !p.active).length,
  };

  const panelOpen = !!(editing || isNew);

  return (
    <div className="admin-root">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="a-logo">
          <span className="a-logo-mark">◈</span>
          <div>
            <p className="a-logo-title">Admin</p>
            <p className="a-logo-sub">Panel de gestión</p>
          </div>
        </div>

        <nav className="a-nav">
          <button className="a-nav-item active">
            <span className="a-nav-icon">▦</span>
            Productos
          </button>
          <button className="a-nav-item disabled" disabled title="Próximamente">
            <span className="a-nav-icon">◎</span>
            Pedidos
          </button>
          <button className="a-nav-item disabled" disabled title="Próximamente">
            <span className="a-nav-icon">◇</span>
            Configuración
          </button>
        </nav>

        <div className="a-sidebar-footer">
          <a href="/" className="a-back-link">← Ver sitio</a>
          <a href="/catalogo" className="a-back-link">Ver catálogo →</a>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Productos</h1>
            <p className="admin-subtitle">
              {stats.activos} activos · {stats.inactivos} inactivos · {stats.total} total
            </p>
          </div>
          <button className="btn-add" onClick={openNew}>
            <span>+</span> Agregar producto
          </button>
        </header>

        {/* Stats strip */}
        <div className="stats-strip">
          {CATEGORIES.map((c) => {
            const count = products.filter((p) => p.category === c).length;
            const activeCount = products.filter((p) => p.category === c && p.active).length;
            return (
              <div key={c} className="stat-chip" style={{ borderLeftColor: CAT_COLOR[c] }}>
                <p className="stat-chip-n">{count}</p>
                <p className="stat-chip-label">{c}</p>
                <p className="stat-chip-sub">{activeCount} activos</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <div className="filter-search-wrap">
            <span className="filter-icon">⌕</span>
            <input
              type="text"
              placeholder="Buscar producto…"
              className="filter-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="filter-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="filter-row">
            <div className="filter-group">
              {(["Todas", ...CATEGORIES] as (Category | "Todas")[]).map((c) => (
                <button
                  key={c}
                  className={`f-pill ${filterCat === c ? "active" : ""}`}
                  style={filterCat === c && c !== "Todas" ? { background: CAT_COLOR[c as Category], borderColor: CAT_COLOR[c as Category], color: "#fff" } : {}}
                  onClick={() => setFilterCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="filter-group">
              {(["todos", "activos", "inactivos"] as const).map((s) => (
                <button
                  key={s}
                  className={`f-pill status-pill ${filterActive === s ? "active" : ""} ${s}`}
                  onClick={() => setFilterActive(s)}
                >
                  {s === "todos" ? "Todos" : s === "activos" ? "● Activos" : "○ Inactivos"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Producto</th>
                <th>Serie</th>
                <th>Precio S</th>
                <th>Precio M</th>
                <th>Precio L</th>
                <th>Creado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="table-empty">
                    Sin productos con esos filtros
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={`table-row ${!p.active ? "inactive" : ""} ${editing?.id === p.id ? "selected" : ""}`}
                  onClick={() => openEdit(p)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className={`toggle-btn ${p.active ? "on" : "off"}`}
                      onClick={() => toggleActive(p.id)}
                      title={p.active ? "Desactivar" : "Activar"}
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </td>
                  <td>
                    <div className="table-name">{p.name}</div>
                    <div className="table-sub">{p.subtitle}</div>
                  </td>
                  <td>
                    <span className="cat-badge" style={{ background: CAT_COLOR[p.category] + "18", color: CAT_COLOR[p.category], borderColor: CAT_COLOR[p.category] + "40" }}>
                      {p.category}
                    </span>
                  </td>
                  <td className="price-cell">${p.prices.S}</td>
                  <td className="price-cell">${p.prices.M}</td>
                  <td className="price-cell">${p.prices.L}</td>
                  <td className="date-cell">{p.createdAt}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="row-edit" onClick={() => openEdit(p)} title="Editar">✎</button>
                      <button
                        className="row-delete"
                        onClick={() => setDeleteConfirm(p.id)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PANEL DE EDICIÓN ── */}
      <div className={`edit-panel ${panelOpen ? "open" : ""}`} ref={panelRef}>
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{isNew ? "Nuevo producto" : "Editar producto"}</p>
            <h2 className="panel-title">{isNew ? "Agregar" : form.name || "—"}</h2>
          </div>
          <button className="panel-close" onClick={closePanel}>✕</button>
        </div>

        <div className="panel-body">
          {/* Nombre */}
          <div className="field">
            <label className="field-label">Nombre del producto *</label>
            <input
              ref={nameRef}
              className="field-input"
              type="text"
              placeholder="Ej: Modelo 10"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Subtítulo */}
          <div className="field">
            <label className="field-label">Subtítulo / Colección</label>
            <input
              className="field-input"
              type="text"
              placeholder="Ej: Colección Premium"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            />
          </div>

          {/* Serie */}
          <div className="field">
            <label className="field-label">Serie</label>
            <div className="cat-selector">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`cat-option ${form.category === c ? "active" : ""}`}
                  style={form.category === c ? { background: CAT_COLOR[c], borderColor: CAT_COLOR[c], color: "#fff" } : {}}
                  onClick={() => setForm((f) => ({ ...f, category: c }))}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Precios */}
          <div className="field">
            <label className="field-label">Precios por presentación</label>
            <div className="prices-grid">
              {(["S", "M", "L"] as Size[]).map((sz) => (
                <div key={sz} className="price-field">
                  <div className="price-field-header">
                    <span className="price-size-letter">{sz}</span>
                    <span className="price-size-name">
                      {sz === "S" ? "Pequeño" : sz === "M" ? "Mediano" : "Grande"}
                    </span>
                  </div>
                  <div className="price-input-wrap">
                    <span className="price-symbol">$</span>
                    <input
                      className="price-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.prices[sz]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          prices: { ...f.prices, [sz]: e.target.value === "" ? "" : Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="field">
            <label className="field-label">Características <span className="field-hint">(separadas por coma)</span></label>
            <input
              className="field-input"
              type="text"
              placeholder="Ej: Fresco, Moderno, Duradero"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
            {form.tags && (
              <div className="tags-preview">
                {form.tags.split(",").filter(Boolean).map((t, i) => (
                  <span key={i} className="tag-preview">{t.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="field">
            <label className="field-label">Estado en el catálogo</label>
            <div className="status-toggle-wrap">
              <button
                className={`status-toggle-btn ${form.active ? "on" : "off"}`}
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
              >
                <span className="st-thumb" />
              </button>
              <div>
                <p className="status-toggle-label">{form.active ? "Visible en catálogo" : "Oculto del catálogo"}</p>
                <p className="status-toggle-sub">
                  {form.active
                    ? "Los clientes pueden verlo y pedirlo."
                    : "No aparece hasta que lo actives."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button className="btn-cancel" onClick={closePanel}>Cancelar</button>
          <button
            className="btn-save"
            onClick={saveProduct}
            disabled={!form.name.trim()}
          >
            {isNew ? "Agregar producto" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {panelOpen && <div className="panel-overlay" onClick={closePanel} />}

      {/* ── MODAL CONFIRM DELETE ── */}
      {deleteConfirm !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p className="modal-icon">⚠</p>
            <h3 className="modal-title">¿Eliminar producto?</h3>
            <p className="modal-body">
              Vas a eliminar <strong>{products.find((p) => p.id === deleteConfirm)?.name}</strong>.
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-delete" onClick={() => deleteProduct(deleteConfirm)}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === "ok" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
