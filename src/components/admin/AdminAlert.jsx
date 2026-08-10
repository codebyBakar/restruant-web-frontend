import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { CheckCircle, Info, Lock, Trash, XCircle } from "phosphor-react";
import { AdminAlertContext } from "./adminAlertContext.js";

const TONE_STYLES = {
  danger: { bg: "#fdecea", color: "#c0392b", Icon: Trash },
  critical: { bg: "rgba(194,65,12,0.12)", color: "var(--paprika)", Icon: Lock },
  success: { bg: "rgba(75,123,91,0.15)", color: "#4b7b5b", Icon: CheckCircle },
  error: { bg: "#fdecea", color: "#c0392b", Icon: XCircle },
  info: { bg: "rgba(37,99,235,0.12)", color: "#2563eb", Icon: Info },
};

export default function AdminAlertProvider({ children }) {
  const [modal, setModal] = useState(null);
  const resolveRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const close = useCallback((result) => {
    clearTimeout(timerRef.current);
    setModal(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  }, []);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setModal({ kind: "confirm", tone: "danger", confirmLabel: "Confirm", cancelLabel: "Cancel", ...opts });
      }),
    []
  );

  const notify = useCallback((opts) => {
    setModal({ kind: "notify", tone: "info", ...opts });
  }, []);

  useEffect(() => {
    if (modal?.kind === "notify") {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => close(true), 3000);
    }
  }, [modal, close]);

  const tone = modal ? TONE_STYLES[modal.tone] || TONE_STYLES.info : TONE_STYLES.info;
  const ToneIcon = tone.Icon;

  const contextValue = useMemo(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <AdminAlertContext.Provider value={contextValue}>
      {children}

      <AnimatePresence>
        {modal && (
          <m.div
            className="admin-alert-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={modal.kind === "notify" ? () => close(true) : undefined}
          >
            <m.div
              className="admin-alert-card"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-alert-icon" style={{ background: tone.bg, color: tone.color }}>
                <ToneIcon size={28} weight="fill" />
              </div>
              {modal.title && <div className="admin-alert-title">{modal.title}</div>}
              {modal.message && <div className="admin-alert-message">{modal.message}</div>}
              {modal.kind === "confirm" ? (
                <div className="admin-alert-actions">
                  <button className="admin-alert-btn admin-alert-btn--ghost" onClick={() => close(false)}>
                    {modal.cancelLabel}
                  </button>
                  <button className="admin-alert-btn admin-alert-btn--danger" onClick={() => close(true)}>
                    {modal.confirmLabel}
                  </button>
                </div>
              ) : (
                <div className="admin-alert-actions">
                  <button className="admin-alert-btn admin-alert-btn--primary" onClick={() => close(true)}>
                    OK
                  </button>
                </div>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-alert-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(20, 14, 10, 0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .admin-alert-card {
          width: min(420px, 92vw);
          background: #fff;
          border-radius: 20px;
          padding: 30px 28px 26px;
          text-align: center;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
          font-family: "Manrope", sans-serif;
        }
        .admin-alert-icon {
          width: 64px; height: 64px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .admin-alert-title { font-size: 20px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
        .admin-alert-message { font-size: 14px; color: var(--ink-soft); line-height: 1.6; margin-bottom: 22px; }
        .admin-alert-actions { display: flex; gap: 16px; justify-content: center; }
        .admin-alert-btn {
          padding: 11px 22px; border-radius: 12px; font-size: 14px; font-weight: 700;
          cursor: pointer; border: none; font-family: inherit; min-width: 112px;
        }
        .admin-alert-btn--ghost { background: #fff; color: var(--ink); border: 1.5px solid var(--line); }
        .admin-alert-btn--danger { background: #c0392b; color: #fff; }
        .admin-alert-btn--primary { background: var(--paprika); color: #fff; }
      `}</style>
    </AdminAlertContext.Provider>
  );
}
