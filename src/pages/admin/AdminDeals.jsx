import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash, X } from "phosphor-react";
import api from "../../api/axios.js";
import EmptyState from "../../components/EmptyState.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";
import { formatPKR } from "../../utils/format.js";
import { getCurrency } from "../../utils/currency.js";
import { useCurrency } from "../../hooks/useCurrency.js";

const PAGE_SIZE = 10;

const emptyForm = {
  title: "", subtitle: "", price: "", isForLife: false,
  startDate: "", endDate: "", isActive: true, items: [],
};

export default function AdminDeals() {
  useCurrency();
  const alert = useAdminAlert();
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([api.get("/deals?all=true"), api.get("/products?limit=100")])
      .then(([d, p]) => { setDeals(d.data.data); setProducts(p.data.data); })
      .catch(() => {
        setError(true);
        toast.error("Failed to load deals");
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [retryKey]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setImageFile(null); setModalOpen(true); };
  const openEdit = (deal) => {
    setEditing(deal);
    setForm({
      title: deal.title, subtitle: deal.subtitle || "", price: deal.price || "",
      isForLife: deal.isForLife || false,
      startDate: deal.startDate?.split("T")[0] || "", endDate: deal.endDate?.split("T")[0] || "",
      isActive: deal.isActive, items: (deal.items || []).map((i) => ({
        product: i.product?._id || i.product,
        productName: i.product?.name || i.productName || "",
        quantity: i.quantity,
      })),
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const addItem = () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;
    if (form.items.some((i) => i.product === selectedProduct)) {
      toast.error("Product already added");
      return;
    }
    setForm((f) => ({
      ...f,
      items: [...f.items, { product: product._id, productName: product.name, quantity: selectedQty }],
    }));
    setSelectedProduct("");
    setSelectedQty(1);
  };

  const removeItem = (productId) => {
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.product !== productId) }));
  };

  const updateItemQty = (productId, qty) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.product === productId ? { ...i, quantity: Math.max(1, qty) } : i)),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast.error("Add at least one product to the deal");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("subtitle", form.subtitle);
      fd.append("price", form.price);
      fd.append("items", JSON.stringify(form.items.map((i) => ({ product: i.product, quantity: i.quantity }))));
      fd.append("isForLife", form.isForLife);
      fd.append("isActive", form.isActive);
      if (!form.isForLife) {
        if (form.startDate) fd.append("startDate", form.startDate);
        if (form.endDate) fd.append("endDate", form.endDate);
      }
      if (imageFile) fd.append("image", imageFile);

      if (editing) { await api.put(`/deals/${editing._id}`, fd); toast.success("Deal updated"); }
      else { await api.post("/deals", fd); toast.success("Deal created"); }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save deal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await alert.confirm({
      title: "Delete Deal",
      message: "Delete this deal?",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.delete(`/deals/${id}`);
      toast.success("Deal deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete deal");
    }
  };

  const pageCount = Math.ceil(deals.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount) || 1;
  const pageItems = deals.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Deals</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={16} /> New Deal</button>
      </div>

      {error ? (
        <EmptyState type="deals" hasError onAction={() => setRetryKey((k) => k + 1)} style={{ marginBottom: 18 }} />
      ) : deals.length === 0 && !loading ? (
        <EmptyState type="deals" subtitle="Create your first deal to feature products at a discount." style={{ marginBottom: 18 }} />
      ) : (
        <>
          <div className="admin-card" style={{ padding: 0, overflow: "auto" }}>
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Price</th><th>Items</th><th>Valid Till</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skel-row-${i}`}>
                      <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "70%" }} /></td>
                      <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "45%" }} /></td>
                      <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                      <td><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>
                      <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                      <td><div className="skeleton" style={{ width: 56, height: 26, borderRadius: 8 }} /></td>
                    </tr>
                  ))
                ) : (
                  pageItems.map((d) => (
                    <tr key={d._id}>
                      <td style={{ fontWeight: 700 }}>{d.title}</td>
                      <td>{d.price ? formatPKR(d.price) : "-"}</td>
                      <td>{d.items?.length || 0} items</td>
                      <td>{d.isForLife ? "Forever" : d.endDate ? new Date(d.endDate).toLocaleDateString() : "-"}</td>
                      <td><span className="admin-badge" style={{ background: d.isActive ? "rgba(75,123,91,0.15)" : "rgba(194,65,12,0.1)", color: d.isActive ? "var(--mint)" : "var(--paprika)" }}>{d.isActive ? "Active" : "Inactive"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="icon-btn" onClick={() => openEdit(d)} aria-label="Edit"><Pencil size={15} /></button>
                          <button className="icon-btn danger" onClick={() => handleDelete(d._id)} aria-label="Delete"><Trash size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
        </>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Deal" : "New Deal"} width={650}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><label className="admin-label">Title</label><input required className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="admin-label">Price ({getCurrency()})</label><input required type="number" min={0} className="admin-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div><label className="admin-label">Subtitle</label><input className="admin-input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>

          <div>
            <label className="admin-label">Items in Deal</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <select className="admin-input" style={{ flex: 1 }} value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({formatPKR(p.discountPrice || p.basePrice)})</option>
                ))}
              </select>
              <input type="number" min={1} className="admin-input" style={{ width: 70 }} value={selectedQty} onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value, 10) || 1))} />
              <button type="button" className="btn btn-outline btn-sm" onClick={addItem} disabled={!selectedProduct}>Add</button>
            </div>
            {form.items.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {form.items.map((item) => (
                  <div key={item.product} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--cream-2)", borderRadius: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{item.productName} × {item.quantity}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" min={1} className="admin-input" style={{ width: 55, padding: "4px 8px" }} value={item.quantity} onChange={(e) => updateItemQty(item.product, parseInt(e.target.value, 10) || 1)} />
                      <button type="button" onClick={() => removeItem(item.product)} aria-label="Remove item" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--paprika)" }}><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: 0 }}>No products added yet.</p>}
          </div>

          <div><label className="admin-label">Banner Image</label><input type="file" accept="image/*" className="admin-input" onChange={(e) => setImageFile(e.target.files[0])} /></div>

          <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><label className="admin-label">Start Date</label><input type="date" className="admin-input" value={form.startDate} disabled={form.isForLife} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="admin-label">End Date</label><input type="date" className="admin-input" value={form.endDate} disabled={form.isForLife} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isForLife} onChange={(e) => setForm({ ...form, isForLife: e.target.checked })} />
            For Life (always active, ignores dates)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
          </label>

          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Deal"}</button>
        </form>
      </AdminModal>
    </div>
  );
}
