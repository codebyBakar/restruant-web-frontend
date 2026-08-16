import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { m } from "framer-motion";
import { CheckCircle, Upload, Bank } from "phosphor-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { SkeletonDetail } from "../components/Skeleton.jsx";
import ImageLightbox from "../components/ImageLightbox.jsx";
import { formatPKR } from "../utils/format.js";
import { optimizeImage } from "../utils/cloudinary.js";
import { useCurrency } from "../hooks/useCurrency.js";

export default function OrderSuccess() {
  useCurrency();
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const payment = searchParams.get("payment");
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get(`/orders/track/${orderNumber}?token=${token}`)
      .then(({ data }) => setOrder(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get("/settings").then(({ data }) => setSettings(data.data)).catch(() => {});
  }, [orderNumber, token]);

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

  return (
    <div className="container" style={{ padding: "120px 24px", maxWidth: 600, textAlign: "center" }}>
      <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <CheckCircle size={64} color="var(--mint)" style={{ margin: "0 auto 18px" }} />
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>Order Placed!</h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: 26 }}>
          Your order <strong style={{ color: "var(--ink)" }}>{orderNumber}</strong> has been received.
        </p>

        {order && (
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, padding: 22, textAlign: "left", marginBottom: 26 }}>
            <div style={{ marginBottom: 14, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <Bank size={18} /> {isOnline ? "Online Payment (Bank Transfer)" : "Cash Payment"}
            </div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "6px 0" }}>
                <span>{item.quantity}x {item.name}</span>
                <span style={{ fontWeight: 700 }}>{formatPKR(item.lineTotal)}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--line)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
              <strong>Total</strong>
              <strong style={{ color: "var(--paprika)" }}>{formatPKR(order.total)}</strong>
            </div>
          </div>
        )}

        {isOnline && !uploaded && !order?.paymentScreenshot?.url && (
          <div style={{ background: "#fef9ef", border: "1px solid #f0dbaa", borderRadius: 18, padding: 22, textAlign: "left", marginBottom: 26 }}>
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
                  accept="image/*"
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

        {isOnline && (uploaded || order?.paymentScreenshot?.url) && (
          <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 18, padding: 22, marginBottom: 26 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2e7d32", marginBottom: 6 }}>Screenshot Uploaded!</div>
            <p style={{ fontSize: 13, color: "#558b2f" }}>Your payment is pending admin verification. We'll notify you once confirmed.</p>
            {order?.paymentScreenshot?.url && (
              <img
                src={optimizeImage(order.paymentScreenshot.url, { width: 800 })}
                alt="Payment screenshot"
                onClick={() => setLightbox(optimizeImage(order.paymentScreenshot.url, { width: 1200 }))}
                loading="lazy"
                style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, marginTop: 12, cursor: "pointer" }}
              />
            )}
          </div>
        )}

        <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/track" className="btn btn-outline">Track Order</Link>
          <Link
            to="/track?type=orders"
            className="btn btn-outline"
            onClick={() => {
              if (order?.customer?.email) sessionStorage.setItem("pratha_my_orders_email", order.customer.email);
            }}
          >
            My Orders
          </Link>
          <Link to="/menu" className="btn btn-primary">Order More</Link>
        </div>
      </m.div>
    </div>
  );
}