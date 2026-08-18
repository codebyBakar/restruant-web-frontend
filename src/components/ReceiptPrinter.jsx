import { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, CircleNotch } from "phosphor-react";

/* ─── Context ─── */
const ReceiptPrinterContext = createContext(null);

function usePrinter(component) {
  const ctx = useContext(ReceiptPrinterContext);
  if (!ctx) throw new Error(`${component} must be used inside ReceiptPrinter.Root`);
  return ctx;
}

/* ─── Timing ─── */
const easeOut = [0.23, 1, 0.32, 1];
const easeInOut = [0.77, 0, 0.175, 1];

/* Receipt paper clip-path (zigzag bottom edge) */
const toothCount = 40;
const toothDepth = 4;
const toothPoints = Array.from({ length: toothCount * 2 }, (_, i) => {
  const x = 100 - ((i + 1) * 100) / (toothCount * 2);
  const y = i % 2 === 0 ? "100%" : `calc(100% - ${toothDepth}px)`;
  return `${x}% ${y}`;
}).join(", ");
const receiptClipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${toothDepth}px), ${toothPoints})`;

/* Stepped print keyframes */
const printKeyframes = [
  "translateY(calc(-100% + 2px))", "translateY(-91%)", "translateY(-91%)",
  "translateY(-81%)", "translateY(-81%)", "translateY(-70%)", "translateY(-70%)",
  "translateY(-58%)", "translateY(-58%)", "translateY(-45%)", "translateY(-45%)",
  "translateY(-32%)", "translateY(-32%)", "translateY(-20%)", "translateY(-20%)",
  "translateY(-10%)", "translateY(-10%)", "translateY(-3%)", "translateY(-3%)",
  "translateY(0%)",
];
const printTimes = [0, 0.075, 0.105, 0.18, 0.21, 0.285, 0.315, 0.39, 0.42, 0.495, 0.525, 0.6, 0.63, 0.705, 0.735, 0.81, 0.84, 0.915, 0.945, 1];

const statusLabels = {
  processing: "Processing your order",
  printing: "Printing your receipt",
  complete: "Order placed!",
};

/* ─── Root ─── */
function Root({ stage = "processing", children, className = "", ...props }) {
  const [ctx] = useState({ stage });
  ctx.stage = stage;

  return (
    <ReceiptPrinterContext.Provider value={ctx}>
      <section
        aria-label="Receipt printer"
        className={`rp-root ${className}`}
        {...props}
      >
        {children}
      </section>
      <style>{rpStyles}</style>
    </ReceiptPrinterContext.Provider>
  );
}

/* ─── Machine (the dark printer body) ─── */
function Machine({ children, className = "", ...props }) {
  return (
    <div className={`rp-machine ${className}`} {...props}>
      {children}
      <div className="rp-slot" />
    </div>
  );
}

/* ─── Header (logo + nav) ─── */
function Header({ children, className = "", ...props }) {
  return (
    <div className={`rp-header ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ─── Screen (shows order info + status) ─── */
function Screen({ children, className = "", ...props }) {
  return (
    <div className={`rp-screen ${className}`} {...props}>
      <div className="rp-screen-inner">{children}</div>
    </div>
  );
}

/* ─── Status indicator ─── */
function Status({ children, className = "" }) {
  const { stage } = usePrinter("ReceiptPrinter.Status");
  const isComplete = stage === "complete";

  return (
    <div className={`rp-status ${className}`}>
      <span className="rp-status-icon">
        <AnimatePresence initial={false} mode="sync">
          {isComplete ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.16, ease: easeOut }}
              style={{ display: "grid", placeItems: "center", color: "var(--mint)" }}
            >
              <CheckCircle size={18} weight="fill" />
            </motion.span>
          ) : (
            <motion.span
              key="spin"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.16, ease: easeOut }}
              style={{ display: "grid", placeItems: "center", color: "var(--ink-soft)" }}
            >
              <CircleNotch size={18} weight="bold" className="rp-spin" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <div className="rp-status-text" aria-live="polite">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: easeOut }}
            style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}
          >
            {children ?? statusLabels[stage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Output (receipt paper wrapper) ─── */
function Output({ children, className = "", ...props }) {
  const { stage } = usePrinter("ReceiptPrinter.Output");
  const isVisible = stage !== "processing";
  const isComplete = stage === "complete";
  const isPrinting = stage === "printing";

  return (
    <div className={`rp-output ${className}`} {...props}>
      {isVisible && <div className="rp-output-shadow" />}

      {/* Clip wrapper — clips paper during printing, opens on complete */}
      <div
        className="rp-output-clip"
        style={{
          maxHeight: isComplete ? "none" : isPrinting ? "18rem" : "0px",
          transition: isComplete ? "max-height 0.3s ease" : "none",
        }}
      >
        <motion.div
          animate={{
            opacity: isVisible ? 1 : 0,
            transform: isPrinting
              ? printKeyframes
              : isVisible
                ? "translateY(0%)"
                : "translateY(calc(-100% + 2px))",
          }}
          aria-hidden={!isComplete}
          className="rp-output-motion"
          initial={false}
          transition={{
            opacity: { duration: 0.16, ease: easeOut },
            transform: {
              duration: isPrinting ? 1.75 : 0,
              ease: isPrinting ? "linear" : easeInOut,
              times: isPrinting ? printTimes : undefined,
            },
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Paper (the actual receipt content) ─── */
function Paper({ children, className = "", ...props }) {
  return (
    <article className={`rp-paper ${className}`} style={{ clipPath: receiptClipPath }} {...props}>
      {children}
    </article>
  );
}

/* ─── Compound export ─── */
export const ReceiptPrinter = { Root, Machine, Header, Screen, Status, Output, Paper };

/* ─── CSS ─── */
const rpStyles = `
  .rp-root {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 380px;
    margin: 0 auto;
  }

  /* Machine body */
  .rp-machine {
    position: relative;
    z-index: 1;
    width: 100%;
    overflow: hidden;
    border-radius: 24px;
    border: 1.5px solid rgba(47,33,23,0.15);
    background: linear-gradient(180deg, #3a3027 0%, #2f2520 100%);
    padding: 12px 12px 20px;
    box-shadow:
      0 20px 36px -20px rgba(47,33,23,0.45),
      0 6px 14px -8px rgba(47,33,23,0.2),
      inset 0 1px 0 rgba(255,255,255,0.08),
      inset 0 -1px 0 rgba(0,0,0,0.2);
  }
  .rp-slot {
    position: absolute;
    inset-inline: 24px;
    bottom: 12px;
    z-index: 40;
    height: 8px;
    border-radius: 4px;
    background: #1a1310;
    border: 1px solid rgba(0,0,0,0.3);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
  }

  /* Header */
  .rp-header {
    position: relative;
    z-index: 10;
    display: flex;
    height: 44px;
    align-items: flex-start;
    justify-content: space-between;
  }

  /* Screen */
  .rp-screen {
    position: relative;
    z-index: 10;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.2);
    background: var(--cream, #fbf3e6);
    padding: 16px;
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.15);
  }
  .rp-screen-inner {
    position: relative;
    z-index: 10;
  }

  /* Status */
  .rp-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rp-status-icon {
    position: relative;
    display: grid;
    width: 20px;
    height: 20px;
    place-items: center;
    flex-shrink: 0;
  }
  .rp-status-text {
    display: grid;
    min-width: 0;
    flex: 1;
    align-items: center;
  }

  /* Spin animation */
  .rp-spin {
    animation: rp-spin 0.6s linear infinite;
  }
  @keyframes rp-spin {
    to { transform: rotate(360deg); }
  }

  /* Output wrapper — NO fixed height, NO overflow hidden */
  .rp-output {
    position: relative;
    z-index: 50;
    margin-top: -16px;
    width: calc(80% + 3rem);
    max-width: 100%;
    padding: 0 24px;
  }
  .rp-output-shadow {
    position: absolute;
    inset-inline: 24px;
    top: -4px;
    z-index: 20;
    height: 8px;
    background: rgba(47,33,23,0.5);
    filter: blur(6px);
    border-radius: 4px;
  }

  /* Clip wrapper — clips during printing, opens on complete */
  .rp-output-clip {
    overflow: hidden;
    position: relative;
    z-index: 10;
  }
  .rp-output-motion {
    position: relative;
    z-index: 10;
  }

  /* Paper */
  .rp-paper {
    position: relative;
    z-index: 10;
    min-height: 320px;
    background: #fffef9;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 120px 120px;
    padding: 28px 24px 32px;
    font-family: "Courier New", Courier, monospace;
    font-size: 12px;
    line-height: 1.55;
    color: var(--ink, #2f2117);
    box-shadow: 0 8px 24px rgba(47,33,23,0.18);
  }

  /* Receipt content classes */
  .rp-logo { text-align: center; margin-bottom: 6px; }
  .rp-logo img { max-width: 80px; max-height: 44px; object-fit: contain; display: block; margin: 0 auto; }
  .rp-site-name { font-size: 20px; font-weight: 800; text-align: center; letter-spacing: 0.06em; }
  .rp-tagline { text-align: center; font-size: 10px; letter-spacing: 0.02em; color: var(--ink-soft); }
  .rp-center { text-align: center; font-size: 11px; }
  .rp-divider { border-top: 1.5px dashed var(--ink, #2f2117); margin: 10px 0; }
  .rp-row { display: flex; justify-content: space-between; gap: 8px; margin: 2px 0; align-items: center; font-size: 12px; }
  .rp-col { display: flex; flex-direction: column; }
  .rp-total { font-size: 15px; margin: 4px 0; }
  .rp-total b { font-size: 15px; }
  .rp-barcode { margin-top: 10px; text-align: center; font-size: 9px; letter-spacing: 2px; }

  /* Screen order items */
  .rp-order-row {
    display: flex;
    justify-content: space-between;
    font-size: 13.5px;
    padding: 4px 0;
  }
  .rp-order-row span:first-child { color: var(--ink-soft); }
  .rp-order-row span:last-child { font-weight: 700; }

  /* Responsive */
  @media (max-width: 440px) {
    .rp-root { max-width: 100%; }
    .rp-machine { border-radius: 18px; padding: 10px 10px 18px; }
    .rp-output { width: calc(85% + 2rem); padding: 0 16px; }
    .rp-output-shadow { inset-inline: 16px; }
    .rp-paper { padding: 22px 18px 28px; font-size: 11px; }
  }
`;
