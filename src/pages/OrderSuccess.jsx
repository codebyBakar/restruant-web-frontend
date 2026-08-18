import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Bank, MapPin, Download } from "phosphor-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { SkeletonDetail } from "../components/Skeleton.jsx";
import { ReceiptPrinter } from "../components/ReceiptPrinter.jsx";
import ImageLightbox from "../components/ImageLightbox.jsx";
import { formatPKR } from "../utils/format.js";
import { logoImage, optimizeImage } from "../utils/cloudinary.js";
import { useCurrency } from "../hooks/useCurrency.js";
import { getCurrency } from "../utils/currency.js";

export default function OrderSuccess() {
  useCurrency();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [token, setToken] = useState("");
  const [payment, setPayment] = useState("");
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [stage, setStage] = useState("processing");

  // Mount: read session, set state (don't clear yet — Strict Mode runs this twice)
  useEffect(() => {
    const stored = sessionStorage.getItem("pendingOrder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.orderNumber && parsed.token) {
          setOrderNumber(parsed.orderNumber);
          setToken(parsed.token);
          setPayment(parsed.payment || "");
        } else {
          navigate("/menu", { replace: true });
        }
      } catch {
        sessionStorage.removeItem("pendingOrder");
        navigate("/menu", { replace: true });
      }
    } else {
      navigate("/menu", { replace: true });
    }
  }, []);

  // Fetch order data
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get(`/orders/track/${orderNumber}?token=${token}`)
      .then(({ data }) => {
        setOrder(data.data);
        // Clear session AFTER successful fetch — order data is now in React state
        // Back button → session empty → redirect to menu
        sessionStorage.removeItem("pendingOrder");
      })
      .catch(() => {
        sessionStorage.removeItem("pendingOrder");
        navigate("/menu", { replace: true });
      })
      .finally(() => setLoading(false));
    api.get("/settings").then(({ data }) => setSettings(data.data)).catch(() => {});
  }, [orderNumber, token]);

  // Stage transitions: processing → printing → complete
  useEffect(() => {
    if (loading || !order) return;
    const t1 = setTimeout(() => setStage("printing"), 1200);
    const t2 = setTimeout(() => setStage("complete"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading, order]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error("Please select a screenshot to upload");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("screenshot", screenshot);
      const { data } = await api.post(`/orders/${orderNumber}/screenshot?token=${token}`, fd);
      setOrder(data.data);
      setUploaded(true);
      toast.success("Payment screenshot uploaded! Waiting for admin verification.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="page-content" style={{ minHeight: "100dvh", background: "var(--cream)", paddingTop: 36 }}>
        <div className="container" style={{ maxWidth: 600, paddingBottom: 60 }}>
          <SkeletonDetail lines={8} />
        </div>
      </div>
    );

  const isOnline = payment === "online" || order?.paymentMethod === "online";
  const logo = logoImage(settings?.logo?.url) || "";
  const siteName = settings?.siteName || "Pratha";
  const tagline = settings?.tagline || "";
  const address = settings?.address || "";
  const phone = settings?.phone || "";
  const currency = getCurrency() || "Rs.";

  const paidStatus = order?.paymentStatus;
  const paymentLabel = isOnline
    ? `ONLINE (${paidStatus === "paid" ? "PAID" : paidStatus === "failed" ? "FAILED" : "PENDING"})`
    : `CASH (${paidStatus === "paid" ? "PAID" : "PENDING"})`;
  const orderTypeLabel = order?.orderType === "delivery" ? "DELIVERY" : "PICKUP";
  const dateTime = order ? new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "";

  return (
    <div className="container" style={{ padding: "120px 20px 80px", maxWidth: 600 }}>
      <ReceiptPrinter.Root stage={stage}>
        {/* ── Machine Body ── */}
        <ReceiptPrinter.Machine>
          <ReceiptPrinter.Header>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              {logo ? (
                <img src={logo} alt={siteName} style={{ height: 50, objectFit: "contain", marginTop: -8 }} />
              ) : (
                <span style={{ color: "var(--cream, #fbf3e6)", fontWeight: 800, fontSize: 15, letterSpacing: "0.04em" }}>{siteName}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link
                to="/track"
                onClick={() => { if (order?.orderNumber) sessionStorage.setItem("pendingOrder", JSON.stringify({ orderNumber: order.orderNumber })); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--cream, #fbf3e6)", textDecoration: "none", padding: "5px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}
              >
                <MapPin size={12} /> Track
              </Link>
              <Link
                to="/menu"
                onClick={() => sessionStorage.removeItem("pendingOrder")}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "5px 10px", borderRadius: 8, background: "var(--paprika, #c2410c)", flexShrink: 0 }}
              >
                Order More
              </Link>
            </div>
          </ReceiptPrinter.Header>

          <ReceiptPrinter.Screen>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Order info row */}
              {order && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Order</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>{order.orderNumber}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--paprika, #c2410c)", marginTop: 2 }}>{formatPKR(order.total)}</div>
                  </div>
                </div>
              )}

              {/* Online payment: view screenshot */}
              {isOnline && (uploaded || order?.paymentScreenshot?.url) && (
                <button
                  type="button"
                  onClick={() => order?.paymentScreenshot?.url && setLightbox(optimizeImage(order.paymentScreenshot.url, { width: 1200 }))}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "10px 16px", borderRadius: 10, border: "1.5px solid var(--line)",
                    background: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <Bank size={16} /> View Payment Screenshot
                </button>
              )}

              <ReceiptPrinter.Status />
            </div>
          </ReceiptPrinter.Screen>
        </ReceiptPrinter.Machine>

        {/* ── Receipt Paper ── */}
        <ReceiptPrinter.Output>
          <ReceiptPrinter.Paper>
            {/* Logo */}
            <div className="rp-logo">
              {logo && <img src={logo} alt={siteName} crossOrigin="anonymous" />}
            </div>
            <div className="rp-site-name">{siteName}</div>
            {tagline && <div className="rp-tagline">{tagline}</div>}
            {address && <div className="rp-center" style={{ marginTop: 4 }}>{address}</div>}
            {phone && <div className="rp-center">{phone}</div>}
            <div className="rp-divider" />

            {/* Order details */}
            <div className="rp-row"><span>Order #</span><b>{order?.orderNumber}</b></div>
            <div className="rp-row"><span>Date</span><span>{dateTime}</span></div>
            <div className="rp-row"><span>Type</span><span>{orderTypeLabel}</span></div>
            {order?.customer?.name && <div className="rp-row"><span>Customer</span><span>{order.customer.name}</span></div>}
            {order?.customer?.phone && <div className="rp-row"><span>Phone</span><span>{order.customer.phone}</span></div>}
            {orderTypeLabel === "DELIVERY" && order?.deliveryAddress && (
              <div className="rp-row" style={{ alignItems: "flex-start" }}>
                <span>Address</span>
                <span style={{ textAlign: "right", maxWidth: "60%" }}>
                  {order.deliveryAddress.line1}
                  {order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ""}
                  {order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ""}
                </span>
              </div>
            )}
            <div className="rp-divider" />

            {/* Items */}
            <div className="rp-col">
              {order?.items?.map((item, i) => (
                <div key={i} className="rp-row" style={{ alignItems: "flex-start" }}>
                  <span>
                    <b>{item.quantity}x</b> {item.name}
                    {item.variantLabel && <div style={{ fontSize: 10, paddingLeft: 12 }}>{item.variantLabel}</div>}
                  </span>
                  <span>{currency} {item.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="rp-divider" />

            {/* Totals */}
            <div className="rp-row"><span>Subtotal</span><span>{currency} {order?.subtotal}</span></div>
            {order?.discount > 0 && (
              <div className="rp-row"><span>Discount {order.dealCode ? `(${order.dealCode})` : ""}</span><span>-{currency} {order.discount}</span></div>
            )}
            {order?.orderType === "delivery" && (
              <div className="rp-row"><span>Delivery Fee</span><span>{order.deliveryFee === 0 ? "FREE" : `${currency} ${order.deliveryFee}`}</span></div>
            )}
            {order?.tax > 0 && <div className="rp-row"><span>Tax</span><span>{currency} {order.tax}</span></div>}
            <div className="rp-divider" />
            <div className="rp-row rp-total"><span>TOTAL</span><b>{currency} {order?.total}</b></div>
            <div className="rp-row"><span>Payment</span><span>{paymentLabel}</span></div>
            <div className="rp-divider" />
            <div className="rp-center" style={{ marginTop: 6 }}>*** THANK YOU ***</div>
            <div className="rp-center" style={{ fontSize: 10, marginTop: 2 }}>Visit again!</div>
            <div className="rp-barcode">{order?.orderNumber?.replace(/\D/g, "") || "1234567890"}</div>
          </ReceiptPrinter.Paper>
        </ReceiptPrinter.Output>
      </ReceiptPrinter.Root>

      {/* ── Online Payment Upload (below printer) ── */}
      {isOnline && !uploaded && !order?.paymentScreenshot?.url && (
        <div style={{ background: "#fef9ef", border: "1px solid #f0dbaa", borderRadius: 18, padding: 22, textAlign: "left", marginTop: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Bank size={20} /> Bank Transfer Details
          </h3>
          {settings && (
            <div style={{ fontSize: 13.5, lineHeight: 2, marginBottom: 18 }}>
              <div><strong>Bank:</strong> {settings.bankName}</div>
              <div><strong>Account Title:</strong> {settings.bankAccountTitle}</div>
              <div><strong>Account No.:</strong> {settings.bankAccountNumber}</div>
              <div><strong>IBAN:</strong> {settings.bankIBAN}</div>
            </div>
          )}
          <div style={{ borderTop: "1px solid #f0dbaa", paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 12 }}>
              Please transfer the total amount and upload the payment screenshot below to confirm your order.
            </p>
            <form onSubmit={handleUpload}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setScreenshot(e.target.files[0])}
                style={{ display: "block", marginBottom: 12, fontSize: 13 }}
              />
              <button type="submit" className="btn btn-primary" disabled={uploading || !screenshot} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {uploading ? "Uploading..." : <><Upload size={18} /> Upload Payment Screenshot</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Download Receipt ── */}
      {stage === "complete" && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button
            type="button"
            onClick={async () => {
              const receiptEl = document.querySelector(".rp-paper");
              if (!receiptEl) return;
              try {
                const html2canvas = (await import("html2canvas")).default;
                const imgs = receiptEl.querySelectorAll("img");
                await Promise.all(
                  Array.from(imgs).map((img) => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve) => {
                      img.onload = resolve;
                      img.onerror = resolve;
                    });
                  })
                );
                const canvas = await html2canvas(receiptEl, {
                  scale: 2,
                  backgroundColor: "#fffef9",
                  useCORS: true,
                  allowTaint: false,
                  logging: false,
                });
                const link = document.createElement("a");
                link.download = `receipt-${order?.orderNumber || "order"}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
              } catch {
                window.print();
              }
            }}
            className="btn btn-outline"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Download size={16} /> Download Receipt
          </button>
        </div>
      )}

      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
