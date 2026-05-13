"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";

/* ─── Tipos ── */
type Size = "S" | "M" | "L";
type Category = "Todo" | "Serie A" | "Serie B" | "Serie C" | "Edición Especial";
type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

interface Product {
  id: number;
  name: string;
  subtitle: string;
  tags: string[];
  category: Exclude<Category, "Todo">;
  prices: Record<Size, number>;
  badge?: string;
}

/* ─── Datos ── */
const PRODUCTS: Product[] = [
  { id: 1, name: "Modelo 01", subtitle: "Colección Principal", tags: ["Clásico", "Versátil", "Premium"], category: "Serie A", prices: { S: 45, M: 80, L: 140 }, badge: "Más vendido" },
  { id: 2, name: "Modelo 02", subtitle: "Colección Principal", tags: ["Intenso", "Sofisticado", "Duradero"], category: "Serie A", prices: { S: 52, M: 90, L: 155 } },
  { id: 3, name: "Modelo 03", subtitle: "Colección Premium", tags: ["Fresco", "Moderno", "Único"], category: "Serie B", prices: { S: 60, M: 105, L: 180 }, badge: "Nuevo" },
  { id: 4, name: "Modelo 04", subtitle: "Colección Premium", tags: ["Oscuro", "Profundo", "Exclusivo"], category: "Serie B", prices: { S: 55, M: 95, L: 162 } },
  { id: 5, name: "Modelo 05", subtitle: "Colección Selecta", tags: ["Elegante", "Refinado", "Atemporal"], category: "Serie C", prices: { S: 70, M: 120, L: 210 } },
  { id: 6, name: "Modelo 06", subtitle: "Edición Limitada", tags: ["Raro", "Coleccionable", "Especial"], category: "Edición Especial", prices: { S: 90, M: 155, L: 270 }, badge: "Edición limitada" },
  { id: 7, name: "Modelo 07", subtitle: "Colección Principal", tags: ["Natural", "Puro", "Fresco"], category: "Serie A", prices: { S: 40, M: 72, L: 125 } },
  { id: 8, name: "Modelo 08", subtitle: "Colección Selecta", tags: ["Cálido", "Envolvente", "Íntimo"], category: "Serie C", prices: { S: 65, M: 112, L: 195 } },
  { id: 9, name: "Modelo 09", subtitle: "Edición Especial", tags: ["Atrevido", "Vanguardista", "Único"], category: "Edición Especial", prices: { S: 85, M: 145, L: 250 }, badge: "Agotándose" },
  { id: 10, name: "Modelo 10", subtitle: "Colección Principal", tags: ["Suave", "Delicado", "Ligero"], category: "Serie A", prices: { S: 38, M: 68, L: 115 } },
  { id: 11, name: "Modelo 11", subtitle: "Colección Premium", tags: ["Potente", "Persistente", "Bold"], category: "Serie B", prices: { S: 58, M: 100, L: 170 }, badge: "Nuevo" },
  { id: 12, name: "Modelo 12", subtitle: "Colección Selecta", tags: ["Mineral", "Frío", "Preciso"], category: "Serie C", prices: { S: 72, M: 125, L: 215 } },
];

const CATEGORIES: Category[] = ["Todo", "Serie A", "Serie B", "Serie C", "Edición Especial"];
const SIZES: Size[] = ["S", "M", "L"];
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevancia", label: "Relevancia" },
  { key: "precio-asc", label: "Precio: menor a mayor" },
  { key: "precio-desc", label: "Precio: mayor a menor" },
  { key: "nombre", label: "Nombre A–Z" },
];

const CAT_COLOR: Record<string, string> = {
  "Serie A": "#2a5c45",
  "Serie B": "#1a3a5c",
  "Serie C": "#5c3a1a",
  "Edición Especial": "#5c1a3a",
};

export default function CatalogoPage() {
  const navRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("Todo");
  const [activeSize, setActiveSize] = useState<Size | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("relevancia");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, Size>>({});
  const [search, setSearch] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const { add, count, openCart } = useCart();

  useEffect(() => {
    const onScroll = () =>
      navRef.current?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getSize = (id: number): Size => selectedSizes[id] ?? "M";
  const setSize = (id: number, s: Size) =>
    setSelectedSizes((prev) => ({ ...prev, [id]: s }));

  const handleAdd = (product: Product) => {
    const sz = getSize(product.id);
    const key = `${product.id}-${sz}`;
    add({
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      size: sz,
      price: product.prices[sz],
    });
    setAddedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setAddedMap((prev) => ({ ...prev, [key]: false })), 1200);
  };

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const catOk = activeCategory === "Todo" || p.category === activeCategory;
      const searchOk =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return catOk && searchOk;
    });
    switch (sortKey) {
      case "precio-asc":
        list = [...list].sort((a, b) => a.prices[getSize(a.id)] - b.prices[getSize(b.id)]);
        break;
      case "precio-desc":
        list = [...list].sort((a, b) => b.prices[getSize(b.id)] - a.prices[getSize(a.id)]);
        break;
      case "nombre":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeSize, sortKey, search, selectedSizes]);

  return (
    <>
      {/* ── NAV ── */}
      <nav ref={navRef} className="cat-nav">
        <div className="nav-brand">
          <Link href="/" className="brand-back">← Inicio</Link>
          <span className="nav-sep">|</span>
          <span className="brand-mark small">◈</span>
          <div className="logo-text">Catálogo</div>
        </div>

        {/* Botón carrito */}
        <button className="cart-fab-nav" onClick={openCart} aria-label="Ver carrito">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{flexShrink:0}}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span>Carrito</span>
          {count > 0 && <span className="cart-nav-badge">{count}</span>}
        </button>
      </nav>

      <div className="cat-layout">
        {/* ── SIDEBAR ── */}
        <aside className="cat-sidebar">
          <div className="sidebar-section">
            <p className="sidebar-title">Buscar</p>
            <div className="search-wrap">
              <input
                type="text"
                className="search-input"
                placeholder="Nombre o característica…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-title">Serie</p>
            <div className="sidebar-pills">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`s-pill ${activeCategory === c ? "active" : ""}`}
                  onClick={() => setActiveCategory(c)}
                  style={
                    activeCategory === c && c !== "Todo"
                      ? { background: CAT_COLOR[c], borderColor: CAT_COLOR[c], color: "#fff" }
                      : {}
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-title">Presentación</p>
            <div className="sidebar-sizes">
              {SIZES.map((s) => (
                <button
                  key={s}
                  className={`size-toggle ${activeSize === s ? "active" : ""}`}
                  onClick={() => setActiveSize(activeSize === s ? null : s)}
                >
                  <span className="size-toggle-letter">{s}</span>
                  <span className="size-toggle-label">
                    {s === "S" ? "Pequeño" : s === "M" ? "Mediano" : "Grande"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-title">Rango de precio</p>
            <div className="price-range-info">
              <span>$38</span>
              <span className="price-dash">—</span>
              <span>$270</span>
            </div>
            <p className="price-note">Seleccioná una presentación para ver precios exactos</p>
          </div>

          {(activeCategory !== "Todo" || activeSize || search) && (
            <button
              className="clear-all"
              onClick={() => { setActiveCategory("Todo"); setActiveSize(null); setSearch(""); }}
            >
              Limpiar filtros
            </button>
          )}
        </aside>

        {/* ── MAIN ── */}
        <main className="cat-main">
          {/* Toolbar */}
          <div className="cat-toolbar">
            <div className="toolbar-left">
              <span className="toolbar-count">
                <strong>{filtered.length}</strong> productos
              </span>
              {activeCategory !== "Todo" && (
                <span className="active-filter-tag" style={{ background: CAT_COLOR[activeCategory] }}>
                  {activeCategory}
                  <button onClick={() => setActiveCategory("Todo")}>✕</button>
                </span>
              )}
              {activeSize && (
                <span className="active-filter-tag">
                  Tamaño {activeSize}
                  <button onClick={() => setActiveSize(null)}>✕</button>
                </span>
              )}
            </div>

            <div className="sort-wrap">
              <button className="sort-btn" onClick={() => setSortOpen(!sortOpen)}>
                <span>Ordenar: {SORT_OPTIONS.find(o => o.key === sortKey)?.label}</span>
                <span className={`sort-arrow ${sortOpen ? "open" : ""}`}>▾</span>
              </button>
              {sortOpen && (
                <div className="sort-dropdown">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      className={`sort-option ${sortKey === o.key ? "active" : ""}`}
                      onClick={() => { setSortKey(o.key); setSortOpen(false); }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="cat-grid">
              {filtered.map((item) => {
                const sz = getSize(item.id);
                const addedKey = `${item.id}-${sz}`;
                const justAdded = addedMap[addedKey];
                return (
                  <div key={item.id} className="pcard">
                    {item.badge && (
                      <span className="pcard-badge" style={{ background: CAT_COLOR[item.category] }}>
                        {item.badge}
                      </span>
                    )}

                    <div className="pcard-placeholder">
                      <span className="placeholder-letter">{item.name.split(" ")[1]}</span>
                      <div className="placeholder-bar" style={{ background: CAT_COLOR[item.category] }} />
                    </div>

                    <div className="pcard-body">
                      <div className="pcard-meta">
                        <span className="pcard-sub">{item.subtitle}</span>
                        <span
                          className="pcard-cat-dot"
                          style={{ background: CAT_COLOR[item.category] }}
                          title={item.category}
                        />
                      </div>
                      <h3 className="pcard-name">{item.name}</h3>
                      <div className="pcard-tags">
                        {item.tags.map((t) => (
                          <span key={t} className="tag">{t}</span>
                        ))}
                      </div>

                      {/* Selector de tamaño */}
                      <div className="size-row">
                        {SIZES.map((s) => (
                          <button
                            key={s}
                            className={`sz-btn ${sz === s ? "active" : ""} ${activeSize && activeSize !== s ? "dimmed" : ""}`}
                            onClick={() => setSize(item.id, s)}
                          >
                            {s}
                          </button>
                        ))}
                        <span className="size-price">${item.prices[sz]}</span>
                      </div>

                      <div className="pcard-footer">
                        <button
                          className={`btn-agregar ${justAdded ? "added" : ""}`}
                          onClick={() => handleAdd(item)}
                        >
                          {justAdded ? (
                            <><span className="btn-check">✓</span> Agregado</>
                          ) : (
                            <>+ Agregar al pedido</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-icon">◈</p>
              <p className="empty-msg">No hay productos con esos filtros.</p>
              <button
                className="btn-primary"
                onClick={() => { setActiveCategory("Todo"); setActiveSize(null); setSearch(""); }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Botón flotante del carrito (mobile/siempre visible) */}
      {count > 0 && (
        <button className="cart-float-btn" onClick={openCart}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span>Ver pedido ({count})</span>
        </button>
      )}

      {/* Drawer del carrito */}
      <CartDrawer />

      <footer>
        <div className="footer-left">
          <span className="brand-mark footer-mark">◈</span>
          <span className="footer-copy">© 2025 Catálogo. Todos los derechos reservados.</span>
        </div>
        <Link href="/" className="btn-nav">Volver al inicio</Link>
      </footer>
    </>
  );
}
