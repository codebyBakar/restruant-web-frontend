import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash, Pencil } from "phosphor-react";
import api from "../../api/axios.js";
import EmptyState from "../../components/EmptyState.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";

const PAGE_SIZE = 12;

export default function AdminTags() {
  const alert = useAdminAlert();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", colorHex: "#c2410c" });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get("/tags").then(({ data }) => setTags(data.data)).catch(() => {
      setError(true);
      toast.error("Failed to load tags");
    }).finally(() => setLoading(false));
  };
  useEffect(load, [retryKey]);

  const openCreate = () => { setEditing(null); setForm({ name: "", colorHex: "#c2410c" }); setModalOpen(true); };
  const openEdit = (tag) => { setEditing(tag); setForm({ name: tag.name, colorHex: tag.colorHex }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/tags/${editing._id}`, form);
        toast.success("Tag updated");
      } else {
        await api.post("/tags", form);
        toast.success("Tag created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await alert.confirm({
      title: "Delete Tag",
      message: "Delete this tag?",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.delete(`/tags/${id}`);
      toast.success("Tag deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tag");
    }
  };

  const pageCount = Math.ceil(tags.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount) || 1;
  const pageItems = tags.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Tags</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={16} /> New Tag</button>
      </div>

      {error ? (
        <EmptyState type="tags" hasError onAction={() => setRetryKey((k) => k + 1)} style={{ marginBottom: 18 }} />
      ) : tags.length === 0 && !loading ? (
        <EmptyState type="tags" subtitle="Add tags to filter and organize your menu items." style={{ marginBottom: 18 }} />
      ) : (
        <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={`skel-tag-${i}`} className="admin-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <span className="skeleton" style={{ width: 14, height: 14, borderRadius: "50%" }} />
              <span className="skeleton" style={{ width: 90, height: 13, borderRadius: 6 }} />
              <span className="skeleton" style={{ width: 26, height: 26, borderRadius: 8 }} />
              <span className="skeleton" style={{ width: 26, height: 26, borderRadius: 8 }} />
            </div>
          ))
        ) : (
          pageItems.map((t) => (
            <div key={t._id} className="admin-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: t.colorHex }} />
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</span>
              <button className="icon-btn" onClick={() => openEdit(t)} aria-label="Edit"><Pencil size={13} /></button>
              <button className="icon-btn danger" onClick={() => handleDelete(t._id)} aria-label="Delete"><Trash size={13} /></button>
            </div>
          ))
        )}
      </div>

      <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
        </>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Tag" : "New Tag"} width={400}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="admin-label">Name</label>
            <input required className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">Color</label>
            <input type="color" className="admin-input" style={{ height: 44, padding: 4 }} value={form.colorHex} onChange={(e) => setForm({ ...form, colorHex: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Tag"}</button>
        </form>
      </AdminModal>
    </div>
  );
}
