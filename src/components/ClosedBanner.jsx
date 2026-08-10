import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ShoppingBag, X } from "phosphor-react";
import { useSettings } from "../hooks/useSettings.js";
import { useStoreStatus } from "../hooks/useStoreStatus.js";
import { useUI } from "../context/UIContext.jsx";
import { storeClosedMessage } from "../utils/storeStatus.js";

export default function ClosedBanner() {
  const { settings } = useSettings();
  const { isOpen } = useStoreStatus();
  const { openCart } = useUI();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isOpen) setCollapsed(false);
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && !collapsed && (
          <m.div
            key="closed-banner-open"
            initial={{ x: 80, y: 12, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            role="alert"
            className="closed-banner"
          >
            <span className="closed-banner__main">
              <span className="closed-banner__dot" />
              <span className="closed-banner__text">{storeClosedMessage(settings)}</span>
            </span>
            <span className="closed-banner__actions">
              <button onClick={openCart} aria-label="Open cart" className="closed-banner__btn">
                <ShoppingBag size={17} />
              </button>
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Minimize closed banner"
                className="closed-banner__btn closed-banner__btn--ghost"
              >
                <X size={15} />
              </button>
            </span>
          </m.div>
        )}

        {!isOpen && collapsed && (
          <m.button
            key="closed-banner-mini"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            role="alert"
            aria-label="Restaurant closed, tap to expand"
            onClick={() => setCollapsed(false)}
            className="closed-banner-mini"
          >
            <span className="closed-banner__dot" />
            Closed
          </m.button>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes closePulse {
          0% { box-shadow: 0 0 0 0 rgba(224,82,58,0.55); }
          70% { box-shadow: 0 0 0 10px rgba(224,82,58,0); }
          100% { box-shadow: 0 0 0 0 rgba(224,82,58,0); }
        }
        .closed-banner {
          position: fixed;
          bottom: 20px;
          right: 24px;
          z-index: 180;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px 12px 18px;
          border-radius: 999px;
          background: #211711;
          color: var(--cream);
          box-shadow: 0 12px 32px rgba(0,0,0,0.28);
          border: 1px solid rgba(251,243,230,0.14);
          font-family: Manrope, sans-serif;
          width: max-content;
          max-width: calc(100vw - 48px);
          box-sizing: border-box;
        }
        .closed-banner__main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1 1 auto;
          min-width: 0;
        }
        .closed-banner__actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .closed-banner__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #e0523a;
          flex-shrink: 0;
          box-shadow: 0 0 0 0 rgba(224,82,58,0.5);
          animation: closePulse 1.4s ease-out infinite;
        }
        .closed-banner__text {
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.5;
          flex: 1 1 auto;
          min-width: 0;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .closed-banner__btn {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid rgba(251,243,230,0.25);
          background: rgba(251,243,230,0.08);
          color: var(--cream);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
        }
        .closed-banner__btn--ghost {
          background: transparent;
          color: rgba(251,243,230,0.75);
        }
        .closed-banner-mini {
          position: fixed;
          bottom: 20px;
          right: 24px;
          z-index: 180;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(251,243,230,0.18);
          background: #211711;
          color: var(--cream);
          font-family: Manrope, sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          box-shadow: 0 10px 26px rgba(0,0,0,0.28);
          cursor: pointer;
          box-sizing: border-box;
          max-width: calc(100vw - 48px);
        }
        @media (max-width: 689px) {
          .closed-banner {
            bottom: 12px;
            right: 12px;
            max-width: calc(100vw - 24px);
            border-radius: 16px;
            padding: 10px 12px;
            gap: 8px;
          }
          .closed-banner__main { gap: 8px; }
          .closed-banner__actions { gap: 6px; }
          .closed-banner__btn { width: 32px; height: 32px; }
          .closed-banner__text { font-size: 13px; }
          .closed-banner-mini { bottom: 12px; right: 12px; font-size: 12.5px; padding: 9px 14px; }
        }
      `}</style>
    </>
  );
}