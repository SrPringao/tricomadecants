"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const FEATURES = [
  {
    n: "01",
    title: "Elegí tu presentación",
    body: "Cada producto está disponible en tres tamaños: S, M y L. Probá antes de comprometerte con el grande.",
  },
  {
    n: "02",
    title: "Filtrá por serie",
    body: "Organizamos el catálogo en series para que encuentres rápido lo que buscás.",
  },
  {
    n: "03",
    title: "Recibís en casa",
    body: "Cada pedido viaja protegido y sellado. Listo para usar ni bien lo abrís.",
  },
];

export default function Home() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () =>
      navRef.current?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ── NAV ── */}
      <nav ref={navRef}>
        <div className="nav-brand">
          <span className="brand-mark">◈</span>
          <div>
            <div className="logo-text">Catálogo</div>
            <div className="logo-sub">Colección 2025</div>
          </div>
        </div>
        <div className="nav-links">
          <Link href="/catalogo" className="nav-link">Productos</Link>
          <a href="#como-funciona" className="nav-link">Cómo funciona</a>
        </div>
        <Link href="/catalogo" className="btn-nav">Ver catálogo</Link>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="grid-cell" />
          ))}
        </div>
        <div className="hero-content">
          <p className="hero-kicker reveal">Colección 2025</p>
          <h1 className="hero-h1 reveal d1">
            Tu catálogo,<br /><em>a tu medida.</em>
          </h1>
          <p className="hero-body reveal d2">
            Explorá cada producto en el tamaño que necesitás.
            Sin comprometerte con más de lo que querés.
          </p>
          <div className="hero-actions reveal d3">
            <Link href="/catalogo" className="btn-primary">Ver catálogo completo</Link>
            <a href="#como-funciona" className="btn-ghost">Cómo funciona</a>
          </div>
        </div>

        <div className="hero-pills reveal d4" aria-hidden="true">
          <span className="pill-tag">S</span>
          <span className="pill-sep">·</span>
          <span className="pill-tag">M</span>
          <span className="pill-sep">·</span>
          <span className="pill-tag">L</span>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="features-section">
        {FEATURES.map((f, i) => (
          <div key={f.n} className={`feature reveal d${i + 1}`}>
            <p className="feature-n">{f.n}</p>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-body">{f.body}</p>
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="cta-section reveal">
        <p className="cta-label">Comenzá ahora</p>
        <h2 className="cta-title">¿Listo para explorar?</h2>
        <Link href="/catalogo" className="btn-primary">Ir al catálogo →</Link>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-left">
          <span className="brand-mark footer-mark">◈</span>
          <span className="footer-copy">© 2025 Catálogo. Todos los derechos reservados.</span>
        </div>
        <Link href="/catalogo" className="btn-nav">Ver productos</Link>
      </footer>
    </>
  );
}
