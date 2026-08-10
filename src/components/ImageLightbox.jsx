import { X } from "phosphor-react";

export default function ImageLightbox({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", top: 20, right: 20,
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)", border: "none",
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt="Payment screenshot"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%", maxHeight: "90vh",
          objectFit: "contain", borderRadius: 12,
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          cursor: "default",
        }}
      />
    </div>
  );
}