import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash, X } from "phosphor-react";
import api from "../../api/axios.js";
import EmptyState from "../../components/EmptyState.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import ImageLightbox from "../../components/ImageLightbox.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";
import { optimizeImage } from "../../utils/cloudinary.js";

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
  const [imagePreview, setImagePreview] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [arranging, setArranging] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

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
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", isActive: cat.isActive });
    imageFileRef.current = null;
    setImagePreview(null);
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

  const enterSelectMode = () => {
    setSelected(new Set());
    setSelectMode(true);
  };

  const cancelSelect = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allOnPage = pageItems.length > 0 && pageItems.every((c) => next.has(c._id));
      pageItems.forEach((c) => (allOnPage ? next.delete(c._id) : next.add(c._id)));
      return next;
    });
  };

  const handleDeleteAll = async () => {
    const ok = await alert.confirm({
      title: "Delete All Categories",
      message: `This will permanently delete all ${categories.length} categories. Products will remain but lose their category link. This action cannot be undone.`,
      confirmLabel: "Delete All",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const { data } = await api.delete("/categories/bulk", { data: { all: true } });
      toast.success(`Deleted ${data.deleted} categor${data.deleted === 1 ? "y" : "ies"}`);
      setSelected(new Set());
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete categories");
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    const ok = await alert.confirm({
      title: `Delete ${selected.size} Categories`,
      message: "Delete the selected categories? Products will remain but lose their category link.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const { data } = await api.delete("/categories/bulk", { data: { ids: [...selected] } });
      toast.success(`Deleted ${data.deleted} categor${data.deleted === 1 ? "y" : "ies"}`);
      setSelected(new Set());
      setSelectMode(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete categories");
    }
  };

  const pageCount = Math.ceil(categories.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount) || 1;
  const pageItems = categories.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Categories</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={16} /> New Category</button>
          {selectMode ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--paprika)" }}>{selected.size} selected</span>
              <button
                className="btn btn-sm"
                onClick={handleDeleteSelected}
                disabled={selected.size === 0}
                style={{ background: "#c0392b", color: "#fff" }}
              >
                <Trash size={15} /> Delete Selected{selected.size ? ` (${selected.size})` : ""}
              </button>
              <button className="btn btn-outline btn-sm" onClick={cancelSelect}><X size={15} /> Cancel</button>
            </>
          ) : (
            <>
              <button
                className="btn btn-sm"
                onClick={handleDeleteAll}
                disabled={categories.length === 0}
                style={{ border: "1.5px solid #c0392b", background: "#fff", color: "#c0392b" }}
              >
                <Trash size={15} /> Delete All
              </button>
              <button
                className="btn btn-sm"
                onClick={enterSelectMode}
                disabled={categories.length === 0}
                style={{ background: "#c0392b", color: "#fff" }}
              >
                <Trash size={15} /> Delete Selected
              </button>
            </>
          )}
        </div>
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
            <tr>
              <th>#</th><th>Image</th><th>Name</th><th>Description</th><th>Products</th><th>Status</th>              <th>
                {selectMode ? (
                  <input
                    type="checkbox"
                    checked={pageItems.length > 0 && pageItems.every((c) => selected.has(c._id))}
                    onChange={toggleSelectAll}
                    aria-label="Select all categories on page"
                  />
                ) : (
                  "Actions"
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-row-${i}`}>
                  <td><div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "70%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                  <td><div className="skeleton" style={{ width: 56, height: 26, borderRadius: 8 }} /></td>
                </tr>
              ))
            ) : arranging ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 24, color: "var(--ink-soft)" }}>
                  Reordering categories...
                </td>
              </tr>
            ) : (
              (() => {
                const ordered = [...categories].sort(
                  (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                );
                return pageItems.map((c) => {
                  const pos = ordered.findIndex((x) => x._id === c._id) + 1;
                  return (
                  <tr key={c._id}>
                    <td>
                      <select
                        className="admin-input"
                        style={{ width: 80, margin: "0 auto" }}
                        value={pos}
                        onChange={async (e) => {
                          const num = parseInt(e.target.value, 10);
                          if (isNaN(num) || num < 1) return;
                          setArranging(true);
                          const ordered = [...categories].sort(
                            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                          );
                          const rest = ordered.filter((x) => x._id !== c._id);
                          rest.splice(num - 1, 0, c);
                          try {
                            await api.put("/categories/reorder", { ids: rest.map((x) => x._id) });
                            toast.success("Category order updated");
                            setTimeout(() => {
                              setArranging(false);
                              load();
                            }, 300);
                          } catch {
                            setArranging(false);
                            toast.error("Failed to update order");
                          }
                        }}
                      >
                        {[...Array(categories.length)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </td>
                    <td><div style={{ width: 42, height: 42, borderRadius: 8, background: "var(--cream-2)", overflow: "hidden" }}>{c.image?.url && <img src={optimizeImage(c.image.url, { width: 120 })} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div></td>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td style={{ color: "var(--ink-soft)", maxWidth: 260 }}>{c.description}</td>
                    <td>{productCounts[c._id] ?? 0}</td>
                    <td><span className="admin-badge" style={{ background: c.isActive ? "rgba(75,123,91,0.15)" : "rgba(194,65,12,0.1)", color: c.isActive ? "var(--mint)" : "var(--paprika)" }}>{c.isActive ? "Active" : "Hidden"}</span></td>
                    <td>
                      {selectMode ? (
                        <input
                          type="checkbox"
                          checked={selected.has(c._id)}
                          onChange={() => toggleSelect(c._id)}
                          aria-label={`Select ${c.name}`}
                        />
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="icon-btn" onClick={() => openEdit(c)} aria-label="Edit"><Pencil size={15} /></button>
                          <button className="icon-btn danger" onClick={() => handleDelete(c._id)} aria-label="Delete"><Trash size={15} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                });
              })()
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
            <div>
              <label className="admin-label">Image</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                imageFileRef.current = file;
                setImagePreview(file ? URL.createObjectURL(file) : null);
              }} className="admin-input" />
              {(imagePreview || (editing && editing.image?.url)) && (
                <img
                  src={imagePreview || editing.image.url}
                  alt="Category image preview"
                  onClick={() => setLightbox(imagePreview || editing.image.url)}
                  style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 10, marginTop: 10, border: "1px solid var(--line)", cursor: "zoom-in", background: "var(--cream-2)" }}
                />
              )}
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 8 }}>{saving ? "Saving..." : "Save Category"}</button>
          </div>
        </form>
      </AdminModal>
      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}