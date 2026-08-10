import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Storefront, MapPin, Sliders, Bank, UserCircle, Eye, EyeSlash, Clock } from "phosphor-react";
import api from "../../api/axios.js";
import { SkeletonDetail } from "../../components/Skeleton.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { setCurrency } from "../../utils/currency.js";
import { isStoreOpen, STORE_TIMEZONES } from "../../utils/storeStatus.js";

const CURRENCIES = [
  { symbol: "Rs.", label: "PKR — Pakistani Rupee" },
  { symbol: "$", label: "USD — US Dollar" },
  { symbol: "£", label: "GBP — British Pound" },
  { symbol: "€", label: "EUR — Euro" },
  { symbol: "₹", label: "INR — Indian Rupee" },
  { symbol: "AED", label: "AED — UAE Dirham" },
  { symbol: "SAR", label: "SAR — Saudi Riyal" },
];

const TABS = [
  { key: "site", label: "Site Settings", icon: Storefront },
  { key: "contact", label: "Contact & Location", icon: MapPin },
  { key: "storeHours", label: "Store Hours", icon: Clock },
  { key: "ordering", label: "Ordering Configuration", icon: Sliders },
  { key: "bank", label: "Bank Account", icon: Bank },
  { key: "profile", label: "Admin Profile", icon: UserCircle },
];

export default function AdminSettings() {
  const { user, refresh } = useAuth();
  const alert = useAdminAlert();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("site");

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({});

  const [profileForm, setProfileForm] = useState({ email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const load = () => {
    api.get("/settings").then(({ data }) => {
      setSettings(data.data);
      setCurrency(data.data?.currency || "Rs.");
      setForm({
        siteName: data.data.siteName || "",
        tagline: data.data.tagline || "",
        currency: data.data.currency || "Rs.",
        address: data.data.address || "",
        phone: data.data.phone || "",
        email: data.data.email || "",
        openingHours: data.data.openingHours || "",
        deliveryFee: data.data.deliveryFee ?? "",
        freeDeliveryThreshold: data.data.freeDeliveryThreshold ?? "",
        taxPercent: data.data.taxPercent ?? "",
        minOrderAmount: data.data.minOrderAmount ?? "",
        bankName: data.data.bankName || "",
        bankAccountTitle: data.data.bankAccountTitle || "",
        bankAccountNumber: data.data.bankAccountNumber || "",
        bankIBAN: data.data.bankIBAN || "",
        facebook: data.data.socialLinks?.facebook || "",
        instagram: data.data.socialLinks?.instagram || "",
        tiktok: data.data.socialLinks?.tiktok || "",
        storeStatusMode: data.data.storeStatus?.mode || "auto",
        storeStatusManualOpen: data.data.storeStatus?.manualOpen ?? true,
        storeStatusTimezone: data.data.storeStatus?.timezone || "Asia/Karachi",
        storeStatusOpenTime: data.data.storeStatus?.openTime || "11:00",
        storeStatusCloseTime: data.data.storeStatus?.closeTime || "23:00",
        storeStatusClosedMessage: data.data.storeStatus?.closedMessage || "",
      });
    }).catch(() => {
      setError(true);
      toast.error("Failed to load settings");
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setProfileForm((p) => ({ ...p, email: user?.email || "" }));
  }, [user]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const saveSettings = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const fields = ["siteName", "tagline", "currency", "address", "phone", "email", "openingHours", "deliveryFee", "freeDeliveryThreshold", "taxPercent", "minOrderAmount", "bankName", "bankAccountTitle", "bankAccountNumber", "bankIBAN", "facebook", "instagram", "tiktok"];
      fields.forEach((f) => fd.append(f, form[f] ?? ""));
      fd.append("storeStatus", JSON.stringify({
        mode: form.storeStatusMode || "auto",
        manualOpen: !!form.storeStatusManualOpen,
        timezone: form.storeStatusTimezone || "Asia/Karachi",
        openTime: form.storeStatusOpenTime || "11:00",
        closeTime: form.storeStatusCloseTime || "23:00",
        closedMessage: form.storeStatusClosedMessage || "",
      }));
      if (logoFile) fd.append("logo", logoFile);

      const { data } = await api.put("/settings", fd);
      setSettings(data.data);
      setCurrency(data.data.currency || "Rs.");
      if (logoFile) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
      setLogoFile(null);
      toast.success("Settings updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    const ok = await alert.confirm({
      title: "Confirm Profile Change",
      message: profileForm.newPassword
        ? "You are about to change your admin email and/or password. Continue?"
        : "You are about to change your admin email. Continue?",
      confirmLabel: "Confirm",
      tone: "critical",
    });
    if (!ok) return;
    setProfileSaving(true);
    try {
      const payload = { email: profileForm.email };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      const { data } = await api.put("/auth/profile", payload);
      localStorage.setItem("pratha_admin_token", data.token);
      await refresh();
      setProfileForm((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) return <SkeletonDetail lines={14} />;
  if (error || !settings) return <EmptyState type="products" hasError onAction={load} title="Unable to load settings" subtitle="Something went wrong while loading settings. Please try again." />;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Settings</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 11,
              border: `1.5px solid ${tab === key ? "var(--paprika)" : "var(--line)"}`,
              background: tab === key ? "var(--paprika)" : "#fff",
              color: tab === key ? "#fff" : "var(--ink)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>

      {tab === "site" && (
        <div className="admin-card">
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Site Settings</h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 0, marginBottom: 16 }}>Site name, logo and currency appear across the whole website.</p>
          <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><label className="admin-label">Site Name</label><input className="admin-input" value={form.siteName} onChange={(e) => handleChange("siteName", e.target.value)} /></div>
            <div><label className="admin-label">Tagline</label><input className="admin-input" value={form.tagline} onChange={(e) => handleChange("tagline", e.target.value)} /></div>
            <div>
              <label className="admin-label">Currency</label>
              <select className="admin-input" value={form.currency} onChange={(e) => handleChange("currency", e.target.value)}>
                {CURRENCIES.map((c) => <option key={c.symbol} value={c.symbol}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label className="admin-label">Site Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {(logoPreview || settings.logo?.url) && (
                <img src={logoPreview || settings.logo?.url} alt="logo" style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 10, background: "var(--cream-2)", border: "1px solid var(--line)" }} />
              )}
              <div style={{ flex: 1 }}>
                <input type="file" accept="image/*" className="admin-input" onChange={handleLogoChange} />
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 6 }}>Upload a new logo to replace the current one.</div>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving} style={{ marginTop: 18 }}>{saving ? "Saving..." : "Save Site Settings"}</button>
        </div>
      )}

      {tab === "contact" && (
        <div className="admin-card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Contact & Location</h3>
          <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><label className="admin-label">Phone</label><input className="admin-input" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} /></div>
            <div><label className="admin-label">Email</label><input className="admin-input" value={form.email} onChange={(e) => handleChange("email", e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 14 }}><label className="admin-label">Address</label><input className="admin-input" value={form.address} onChange={(e) => handleChange("address", e.target.value)} /></div>
          <div style={{ marginTop: 14 }}><label className="admin-label">Opening Hours</label><input className="admin-input" value={form.openingHours} onChange={(e) => handleChange("openingHours", e.target.value)} /></div>
          <div className="admin-grid-3" style={{ marginTop: 14 }}>
            <div><label className="admin-label">Facebook URL</label><input className="admin-input" value={form.facebook} onChange={(e) => handleChange("facebook", e.target.value)} /></div>
            <div><label className="admin-label">Instagram URL</label><input className="admin-input" value={form.instagram} onChange={(e) => handleChange("instagram", e.target.value)} /></div>
            <div><label className="admin-label">TikTok URL</label><input className="admin-input" value={form.tiktok} onChange={(e) => handleChange("tiktok", e.target.value)} /></div>
          </div>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving} style={{ marginTop: 18 }}>{saving ? "Saving..." : "Save Contact & Location"}</button>
        </div>
      )}

      {tab === "storeHours" && (
        <div className="admin-card">
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Store Hours</h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 0, marginBottom: 16 }}>
            Auto mode disables checkout & shows a "closed" notice outside opening hours (in the selected country's time). Manual mode lets you override the schedule.
          </p>

          {(() => {
            const previewSettings = {
              storeStatus: {
                mode: form.storeStatusMode || "auto",
                manualOpen: !!form.storeStatusManualOpen,
                timezone: form.storeStatusTimezone || "Asia/Karachi",
                openTime: form.storeStatusOpenTime || "11:00",
                closeTime: form.storeStatusCloseTime || "23:00",
              },
            };
            const openNow = isStoreOpen(previewSettings);
            return (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, background: openNow ? "rgba(75,123,91,0.12)" : "#fdecea", color: openNow ? "#2f6b41" : "#c0392b", fontWeight: 800, fontSize: 13, marginBottom: 18 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: openNow ? "var(--mint)" : "#c0392b" }} />
                Currently {openNow ? "OPEN" : "CLOSED"}
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => handleChange("storeStatusMode", "auto")}
              style={{
                padding: "10px 18px", borderRadius: 11, border: `1.5px solid ${form.storeStatusMode === "auto" ? "var(--paprika)" : "var(--line)"}`,
                background: form.storeStatusMode === "auto" ? "var(--paprika)" : "#fff",
                color: form.storeStatusMode === "auto" ? "#fff" : "var(--ink)", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              Auto (by time)
            </button>
            <button
              type="button"
              onClick={() => handleChange("storeStatusMode", "manual")}
              style={{
                padding: "10px 18px", borderRadius: 11, border: `1.5px solid ${form.storeStatusMode === "manual" ? "var(--paprika)" : "var(--line)"}`,
                background: form.storeStatusMode === "manual" ? "var(--paprika)" : "#fff",
                color: form.storeStatusMode === "manual" ? "#fff" : "var(--ink)", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              Manual override
            </button>
          </div>

          {form.storeStatusMode === "auto" ? (
            <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr auto", gap: 14 }}>
              <div>
                <label className="admin-label">Country / Timezone</label>
                <select className="admin-input" value={form.storeStatusTimezone} onChange={(e) => handleChange("storeStatusTimezone", e.target.value)}>
                  {STORE_TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="admin-label">Opens at</label>
                  <input type="time" className="admin-input" value={form.storeStatusOpenTime} onChange={(e) => handleChange("storeStatusOpenTime", e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Closes at</label>
                  <input type="time" className="admin-input" value={form.storeStatusCloseTime} onChange={(e) => handleChange("storeStatusCloseTime", e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="admin-label">Manual status</label>
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => handleChange("storeStatusManualOpen", true)}
                  style={{
                    padding: "11px 24px", borderRadius: 11, border: `1.5px solid ${form.storeStatusManualOpen ? "var(--paprika)" : "var(--line)"}`,
                    background: form.storeStatusManualOpen ? "var(--paprika)" : "#fff",
                    color: form.storeStatusManualOpen ? "#fff" : "var(--ink)", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  }}
                >
                  Open Now
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("storeStatusManualOpen", false)}
                  style={{
                    padding: "11px 24px", borderRadius: 11, border: `1.5px solid ${!form.storeStatusManualOpen ? "#c0392b" : "var(--line)"}`,
                    background: !form.storeStatusManualOpen ? "#c0392b" : "#fff",
                    color: !form.storeStatusManualOpen ? "#fff" : "var(--ink)", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  }}
                >
                  Closed Now
                </button>
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="admin-label">Message shown on banner & cart while closed</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Sorry, we are closed today. Order again tomorrow!"
                  value={form.storeStatusClosedMessage}
                  onChange={(e) => handleChange("storeStatusClosedMessage", e.target.value)}
                />
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 6 }}>
                  This text appears on the homepage banner and in the cart whenever the store is closed.
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={saveSettings} disabled={saving} style={{ marginTop: 20 }}>{saving ? "Saving..." : "Save Store Hours"}</button>
        </div>
      )}

      {tab === "ordering" && (
        <div className="admin-card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Ordering Configuration</h3>
          <div className="admin-grid-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div><label className="admin-label">Delivery Fee ({form.currency})</label><input type="number" className="admin-input" value={form.deliveryFee} onChange={(e) => handleChange("deliveryFee", e.target.value)} /></div>
            <div><label className="admin-label">Free Delivery Above ({form.currency})</label><input type="number" className="admin-input" value={form.freeDeliveryThreshold} onChange={(e) => handleChange("freeDeliveryThreshold", e.target.value)} /></div>
            <div><label className="admin-label">Tax %</label><input type="number" className="admin-input" value={form.taxPercent} onChange={(e) => handleChange("taxPercent", e.target.value)} /></div>
            <div><label className="admin-label">Min Order ({form.currency})</label><input type="number" className="admin-input" value={form.minOrderAmount} onChange={(e) => handleChange("minOrderAmount", e.target.value)} /></div>
          </div>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving} style={{ marginTop: 18 }}>{saving ? "Saving..." : "Save Ordering Configuration"}</button>
        </div>
      )}

      {tab === "bank" && (
        <div className="admin-card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Bank Account (Online Payment)</h3>
          <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><label className="admin-label">Bank Name</label><input className="admin-input" value={form.bankName} onChange={(e) => handleChange("bankName", e.target.value)} /></div>
            <div><label className="admin-label">Account Title</label><input className="admin-input" value={form.bankAccountTitle} onChange={(e) => handleChange("bankAccountTitle", e.target.value)} /></div>
            <div><label className="admin-label">Account Number</label><input className="admin-input" value={form.bankAccountNumber} onChange={(e) => handleChange("bankAccountNumber", e.target.value)} /></div>
            <div><label className="admin-label">IBAN</label><input className="admin-input" value={form.bankIBAN} onChange={(e) => handleChange("bankIBAN", e.target.value)} /></div>
          </div>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving} style={{ marginTop: 18 }}>{saving ? "Saving..." : "Save Bank Account"}</button>
        </div>
      )}

      {tab === "profile" && (
        <div className="admin-card" style={{ maxWidth: 520 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Admin Profile</h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 0, marginBottom: 16 }}>Update your login email or change your password.</p>
          <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label className="admin-label">Email</label><input type="email" required className="admin-input" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} /></div>
            <div>
              <label className="admin-label">Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  autoComplete="current-password"
                  className="admin-input"
                  style={{ paddingRight: 42 }}
                  placeholder="Required only when changing password"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}
                  aria-label={showPasswords.current ? "Hide current password" : "Show current password"}
                >
                  {showPasswords.current ? <EyeSlash size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <label className="admin-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    autoComplete="new-password"
                    className="admin-input"
                    style={{ paddingRight: 42 }}
                    placeholder="Min 8 characters"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm((p) => ({ ...p, newPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => ({ ...s, new: !s.new }))}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}
                    aria-label={showPasswords.new ? "Hide new password" : "Show new password"}
                  >
                    {showPasswords.new ? <EyeSlash size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="admin-label">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    autoComplete="new-password"
                    className="admin-input"
                    style={{ paddingRight: 42 }}
                    placeholder="Repeat new password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", display: "flex" }}
                    aria-label={showPasswords.confirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showPasswords.confirm ? <EyeSlash size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileSaving}>{profileSaving ? "Saving..." : "Save Profile"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
