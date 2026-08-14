import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash, Pencil, X } from "phosphor-react";
import api from "../../api/axios.js";
import EmptyState from "../../components/EmptyState.jsx";
import AdminModal from "../../components/admin/AdminModal.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";

const PAGE_SIZE = 10;

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
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

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
      const allOnPage = pageItems.length > 0 && pageItems.every((t) => next.has(t._id));
      pageItems.forEach((t) => (allOnPage ? next.delete(t._id) : next.add(t._id)));
      return next;
    });
  };

  const handleDeleteAll = async () => {
    const ok = await alert.confirm({
      title: "Delete All Tags",
      message: `This will permanently delete all ${tags.length} tags. This action cannot be undone.`,
      confirmLabel: "Delete All",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const { data } = await api.delete("/tags/bulk", { data: { all: true } });
      toast.success(`Deleted ${data.deleted} tags`);
      setSelected(new Set());
      setSelectMode(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tags");
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    const ok = await alert.confirm({
      title: `Delete ${selected.size} Tags`,
      message: "Delete the selected tags permanently? This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const { data } = await api.delete("/tags/bulk", { data: { ids: [...selected] } });
      toast.success(`Deleted ${data.deleted} tags`);
      setSelected(new Set());
      setSelectMode(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tags");
    }
  };

  const pageCount = Math.ceil(tags.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount) || 1;
  const pageItems = tags.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Tags</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={16} /> New Tag</button>
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
                disabled={tags.length === 0}
                style={{ border: "1.5px solid #c0392b", background: "#fff", color: "#c0392b" }}
              >
                <Trash size={15} /> Delete All
              </button>
              <button
                className="btn btn-sm"
                onClick={enterSelectMode}
                disabled={tags.length === 0}
                style={{ background: "#c0392b", color: "#fff" }}
              >
                <Trash size={15} /> Delete Selected
              </button>
            </>
          )}
        </div>
      </div>

      {error ? (
        <EmptyState type="tags" hasError onAction={() => setRetryKey((k) => k + 1)} style={{ marginBottom: 18 }} />
      ) : tags.length === 0 && !loading ? (
        <EmptyState type="tags" subtitle="Add tags to filter and organize your menu items." style={{ marginBottom: 18 }} />
      ) : (
        <>
          <div className="admin-card" style={{ padding: 0, overflow: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Name</th>

                  <th>
                    {selectMode ? (
                      <input
                        type="checkbox"
                        checked={pageItems.length > 0 && pageItems.every((t) => selected.has(t._id))}
                        onChange={toggleSelectAll}
                        aria-label="Select all tags on page"
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
                      <td><div className="skeleton" style={{ width: 14, height: 14, borderRadius: "50%" }} /></td>
                      <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "60%" }} /></td>
                      <td><div className="skeleton" style={{ width: 56, height: 26, borderRadius: 8 }} /></td>
                    </tr>
                  ))
                ) : (
                  pageItems.map((t) => (
                    <tr key={t._id}>
                      <td><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: "50%", background: t.colorHex, verticalAlign: "middle" }} /></td>
                      <td style={{ fontWeight: 700 }}>{t.name}</td>
                      <td>
                        {selectMode ? (
                          <input
                            type="checkbox"
                            checked={selected.has(t._id)}
                            onChange={() => toggleSelect(t._id)}
                            aria-label={`Select ${t.name}`}
                          />
                        ) : (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="icon-btn" onClick={() => openEdit(t)} aria-label="Edit"><Pencil size={15} /></button>
                            <button className="icon-btn danger" onClick={() => handleDelete(t._id)} aria-label="Delete"><Trash size={15} /></button>
                          </div>
                        )}
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
