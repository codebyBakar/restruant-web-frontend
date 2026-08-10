import { Printer, X } from "phosphor-react";
import { getSettings } from "../../utils/settingsStore.js";
import { getCurrency } from "../../utils/currency.js";

export default function ReceiptModal({ order, show, onClose }) {
  if (!order || !show) return null;

  const settings = getSettings() || {};
  const currency = getCurrency() || "Rs.";
  const logo = settings.logo?.url || "";
  const siteName = settings.siteName || "Pratha";
  const address = settings.address || "";
  const phone = settings.phone || "";
  const website = settings.socialLinks?.instagram || "";

  const paidStatus = order.paymentStatus;
  const paymentLabel =
    order.paymentMethod === "online"
      ? `ONLINE (${paidStatus === "paid" ? "PAID" : paidStatus === "failed" ? "FAILED" : "PENDING"})`
      : `CASH (${paidStatus === "paid" ? "PAID" : "PENDING"})`;

  const orderTypeLabel = order.orderType === "delivery" ? "DELIVERY" : "PICKUP";
  const dateTime = new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="receipt-overlay" onClick={onClose}>
        <div className="receipt-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="receipt-sheet__content">
            {logo && (
              <div style={{ textAlign: "center", marginBottom: 6 }}>
                <img src={logo} alt={siteName} style={{ maxWidth: 90, maxHeight: 50, objectFit: "contain" }} />
              </div>
            )}
            <div className="receipt-h1">{siteName}</div>
            {settings.tagline && <div className="receipt-center" style={{ fontSize: 10, letterSpacing: "0.02em" }}>{settings.tagline}</div>}
            {address && <div className="receipt-center" style={{ marginTop: 4 }}>{address}</div>}
            <div className="receipt-center">{phone}</div>
            <div className="receipt-divider" />
            <div className="receipt-row"><span>Order #</span><b>{order.orderNumber}</b></div>
            <div className="receipt-row"><span>Date</span><span>{dateTime}</span></div>
            <div className="receipt-row"><span>Type</span><span>{orderTypeLabel}</span></div>
            <div className="receipt-row"><span>Customer</span><span>{order.customer.name}</span></div>
            <div className="receipt-row"><span>Phone</span><span>{order.customer.phone}</span></div>
            {orderTypeLabel === "DELIVERY" && order.deliveryAddress && (
              <>
                <div className="receipt-row" style={{ alignItems: "flex-start" }}>
                  <span>Address</span>
                  <span style={{ textAlign: "right", maxWidth: "60%" }}>
                    {order.deliveryAddress.line1}
                    {order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ""}
                    {order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ""}
                  </span>
                </div>
              </>
            )}
            <div className="receipt-divider" />
            <div className="receipt-col">
              {order.items.map((item, i) => (
                <div key={i} className="receipt-row" style={{ alignItems: "flex-start" }}>
                  <span>
                    <b>{item.quantity}x</b> {item.name}
                    {item.variantLabel && <div style={{ fontSize: 10, paddingLeft: 12 }}>{item.variantLabel}</div>}
                  </span>
                  <span>{currency} {item.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="receipt-divider" />
            <div className="receipt-row"><span>Subtotal</span><span>{currency} {order.subtotal}</span></div>
            {order.discount > 0 && (
              <div className="receipt-row"><span>Discount {order.dealCode ? `(${order.dealCode})` : ""}</span><span>-{currency} {order.discount}</span></div>
            )}
            {order.orderType === "delivery" && (
              <div className="receipt-row"><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? "FREE" : `${currency} ${order.deliveryFee}`}</span></div>
            )}
            {order.tax > 0 && <div className="receipt-row"><span>Tax</span><span>{currency} {order.tax}</span></div>}
            <div className="receipt-divider" />
            <div className="receipt-row receipt-total"><span>TOTAL</span><b>{currency} {order.total}</b></div>
            <div className="receipt-row"><span>Payment</span><span>{paymentLabel}</span></div>
            <div className="receipt-divider" />
            <div className="receipt-center" style={{ marginTop: 6 }}>*** THANK YOU ***</div>
            <div className="receipt-center" style={{ fontSize: 10, marginTop: 2 }}>Visit again!</div>
            <div className="receipt-barcode">{order.orderNumber.replace(/\D/g, "") || "1234567890"}</div>
          </div>

          <div className="receipt-actions">
            <button className="receipt-btn receipt-btn--ghost" onClick={onClose}>
              <X size={16} /> Close
            </button>
            <button className="receipt-btn receipt-btn--primary" onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .receipt-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(20, 20, 20, 0.6);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .receipt-sheet {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          max-height: calc(100vh - 48px);
        }
        .receipt-sheet__content {
          width: 300px;
          background: #fff; color: #000;
          border: 1px solid #ddd;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
          padding: 22px 18px;
          font-family: "Courier New", Courier, monospace;
          font-size: 12px;
          line-height: 1.55;
          overflow-y: auto;
          max-height: calc(100vh - 160px);
        }
        .receipt-h1 {
          font-size: 20px; font-weight: 800; text-align: center; letter-spacing: 0.06em;
        }
        .receipt-center { text-align: center; font-size: 11px; }
        .receipt-divider {
          border-top: 1.5px dashed #000; margin: 10px 0;
        }
        .receipt-row {
          display: flex; justify-content: space-between; gap: 8; margin: 2px 0;
          align-items: center; font-size: 12px;
        }
        .receipt-col { display: flex; flex-direction: column; }
        .receipt-total { font-size: 15px; margin: 4px 0; }
        .receipt-total b { font-size: 15px; }
        .receipt-barcode {
          margin-top: 10px; text-align: center;
          font-size: 9px; letter-spacing: 2px; color: #000;
          font-family: "Courier New", Courier, monospace;
        }
        .receipt-actions { display: flex; gap: 10px; flex-shrink: 0; }
        .receipt-btn {
          display: inline-flex; align-items: center; gap: 8px;
          border: none; border-radius: 12px; cursor: pointer;
          font-family: inherit; font-size: 14px; font-weight: 700;
          padding: 12px 22px;
        }
        .receipt-btn--ghost { background: #fff; color: var(--ink); border: 1.5px solid var(--line); }
        .receipt-btn--primary { background: var(--paprika); color: #fff; }

        @media print {
          body * { visibility: hidden !important; }
          .receipt-sheet, .receipt-sheet * { visibility: visible !important; }
          .receipt-sheet {
            position: absolute; left: 50%; top: 0;
            transform: translateX(-50%);
            gap: 0;
            max-height: none;
          }
          .receipt-sheet__content {
            max-height: none;
            overflow: visible;
            box-shadow: none; border: none;
          }
          .receipt-actions { display: none !important; }
          .receipt-overlay { background: none !important; padding: 0 !important; display: block !important; }
        }
        @page { margin: 0; }
      `}</style>
    </>
  );
}
