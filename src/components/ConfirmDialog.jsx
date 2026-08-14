import { AnimatePresence, m } from "framer-motion";
import { X } from "phosphor-react";

// Centered confirmation popup for the customer side (replaces window.confirm).
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            role="button"
            aria-label="Close dialog"
            style={{ position: "fixed", inset: 0, background: "rgba(33,23,17,0.5)", zIndex: 500 }}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 350 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
              width: "min(420px, calc(100vw - 40px))",
              background: "var(--cream)",
              borderRadius: 22,
              padding: "24px 26px 22px",
              zIndex: 501,
              boxShadow: "0 24px 60px rgba(33,23,17,0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <h3 style={{ fontSize: 19, margin: 0 }}>{title}</h3>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close dialog"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 2, display: "inline-flex" }}
              >
                <X size={20} />
              </button>
            </div>
            {message && (
              <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: "0 0 24px" }}>
                {message}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button
                type="button"
                className="btn"
                onClick={onConfirm}
                style={{ background: tone === "danger" ? "#c0392b" : "var(--paprika)", color: "#fff" }}
              >
                {confirmLabel}
              </button>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
