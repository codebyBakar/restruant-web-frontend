import { X } from "phosphor-react";
import { AnimatePresence, m } from "framer-motion";

export default function AdminModal({ open, onClose, title, children, width = 560 }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(33,23,17,0.5)", zIndex: 300 }} />
          <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 301 }}>
            <m.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              className="admin-modal-panel"
              style={{
                pointerEvents: "auto",
                background: "var(--cream)",
                borderRadius: 20,
                padding: 28,
                width: `min(${width}px, 92vw)`,
                maxHeight: "88vh",
                overflowY: "auto",
                boxShadow: "0 30px 70px rgba(0,0,0,.3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 20 }}>{title}</h3>
                <button onClick={onClose} style={{ background: "none", border: "none" }} aria-label="Close">
                  <X size={22} />
                </button>
              </div>
              {children}
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
