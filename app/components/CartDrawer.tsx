"use client";

import { useEffect, useState } from "react";
import { useCart, CartItem, Size } from "../context/CartContext";

const WA_NUMBER = "523310456114";
const SIZE_NAME: Record<Size, string> = { S: "Pequeño", M: "Mediano", L: "Grande" };

function buildMessage(items: CartItem[], total: number): string {
  const lines = [
    "¡Hola! Me gustaría hacer el siguiente pedido:",
    "",
    ...items.map(
      (i) =>
        `• ${i.name} (${i.size} — ${SIZE_NAME[i.size]}) x${i.qty}  →  $${(
          i.price * i.qty
        ).toLocaleString("es-MX")}`
    ),
    "",
    "────────────────────",
    `TOTAL: $${total.toLocaleString("es-MX")}`,
    "",
    "¿Podrías confirmarme disponibilidad y datos de envío? ¡Gracias!",
  ];
  return lines.join("\n");
}

export default function CartDrawer() {
  const { items, remove, updateQty, clear, total, count, isOpen, closeCart } =
    useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, closeCart]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  if (!mounted) return null;

  const sendWhatsApp = () => {
    const msg = buildMessage(items, total);
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? "visible" : ""}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="cart-header">
          <div>
            <p className="cart-eyebrow">Tu selección</p>
            <h2 className="cart-title">
              Pedido
              {count > 0 && (
                <span className="cart-count-badge">{count}</span>
              )}
            </h2>
          </div>
          <button className="cart-close" onClick={closeCart} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">◈</span>
              <p className="cart-empty-msg">Tu pedido está vacío</p>
              <p className="cart-empty-sub">
                Agregá productos desde el catálogo.
              </p>
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="cart-item"
                >
                  <div className="cart-item-top">
                    <div>
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-meta">
                        {item.size} — {SIZE_NAME[item.size]} · ${item.price} c/u
                      </p>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => remove(item.productId, item.size)}
                      aria-label="Quitar"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.qty - 1)
                        }
                      >
                        −
                      </button>
                      <span className="qty-val">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          updateQty(item.productId, item.size, item.qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-subtotal">
                      ${(item.price * item.qty).toLocaleString("es-MX")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer con total y WhatsApp */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>
                  {count} {count === 1 ? "producto" : "productos"}
                </span>
                <span>${total.toLocaleString("es-MX")}</span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span className="cart-total-price">
                  ${total.toLocaleString("es-MX")}
                </span>
              </div>
            </div>

            <p className="cart-note">
              Al continuar se abrirá WhatsApp con el detalle de tu pedido.
            </p>

            <button className="btn-whatsapp" onClick={sendWhatsApp}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Finalizar por WhatsApp
            </button>

            <button className="btn-clear-cart" onClick={clear}>
              Vaciar pedido
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
