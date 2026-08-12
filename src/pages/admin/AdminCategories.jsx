import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash } from "phosphor-react";
import api from "../../api/axios.js";
import EmptyState from "../../components/EmptyState.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";

const PAGE_SIZE = 10;

const emptyForm = { name: "", description: "", isActive: true };

export default function AdminCategories() {
  const alert = useAdminAlert();
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const imageFileRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([api.get("/categories?all=true"), api.get("/categories/stats/products")])
      .then(([cats, stats]) => {
        setCategories(cats.data.data);
        setProductCounts(Object.fromEntries(stats.data.data.map((s) => [s._id, s.productCount])));
      })
      .catch(() => {
        setError(true);
        toast.error("Failed to load categories");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [retryKey]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    imageFileRef.current = null;
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", isActive: cat.isActive });
    imageFileRef.current = null;
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFileRef.current) fd.append("image", imageFileRef.current);

      if (editing) {
        await api.put(`/categories/${editing._id}`, fd);
        toast.success("Category updated");
      } else {
        await api.post("/categories", fd);
        toast.success("Category created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await alert.confirm({
      title: "Delete Category",
      message: "Delete this category? Products in it will remain but lose their category link.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const pageCount = Math.ceil(categories.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount) || 1;
  const pageItems = categories.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Categories</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={16} /> New Category</button>
      </div>

      {error ? (
        <EmptyState type="categories" hasError onAction={() => setRetryKey((k) => k + 1)} style={{ marginBottom: 18 }} />
      ) : categories.length === 0 && !loading ? (
        <EmptyState type="categories" subtitle="Create your first category to organize your menu." style={{ marginBottom: 18 }} />
      ) : (
        <>
          <div className="admin-card" style={{ padding: 0, overflow: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Description</th><th>Products</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-row-${i}`}>
                  <td><div className="skeleton" style={{ width: 42, height: 42, borderRadius: 8 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "70%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                  <td><div className="skeleton" style={{ width: 56, height: 26, borderRadius: 8 }} /></td>
                </tr>
              ))
            ) : (
              pageItems.map((c) => (
                <tr key={c._id}>
                  <td><div style={{ width: 42, height: 42, borderRadius: 8, background: "var(--cream-2)", overflow: "hidden" }}>{c.image?.url && <img src={c.image.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div></td>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td style={{ color: "var(--ink-soft)", maxWidth: 260 }}>{c.description}</td>
                  <td>{productCounts[c._id] ?? 0}</td>
                  <td><span className="admin-badge" style={{ background: c.isActive ? "rgba(75,123,91,0.15)" : "rgba(194,65,12,0.1)", color: c.isActive ? "var(--mint)" : "var(--paprika)" }}>{c.isActive ? "Active" : "Hidden"}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn" onClick={() => openEdit(c)} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(c._id)} aria-label="Delete"><Trash size={15} /></button>
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

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "New Category"}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="admin-label">Name</label>
            <input required className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">Description</label>
            <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="admin-label">Status</label>
              <select className="admin-input" value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>
            </div>
          </div>
          <div>
            <label className="admin-label">Image</label>
            <input type="file" accept="image/*" onChange={(e) => { imageFileRef.current = e.target.files[0]; }} className="admin-input" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 8 }}>{saving ? "Saving..." : "Save Category"}</button>
        </form>
      </AdminModal>
    </div>
  );
}
