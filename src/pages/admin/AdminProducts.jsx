import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash, MagnifyingGlass, Star, Funnel, X } from "phosphor-react";
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
  name: "",
  description: "",
  category: "",
  tags: [],
  basePrice: "",
  discountPrice: "",
  ingredients: "",
  isVeg: true,
  spiceLevel: "none",
  prepTimeMinutes: 20,
  isAvailable: true,
  isFeatured: false,
  variants: [],
};

export default function AdminProducts() {
  useCurrency();
  const alert = useAdminAlert();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({ categories: [], isVeg: "all", sort: "" });
  const [filters, setFilters] = useState({ categories: [], isVeg: "all", sort: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ limit: "100", availableOnly: "false" });
    if (search) params.set("search", search);
    if (filters.categories.length) params.set("category", filters.categories.join(","));
    if (filters.isVeg !== "all") params.set("isVeg", filters.isVeg);
    if (filters.sort) params.set("sort", filters.sort);
    Promise.all([
      api.get(`/products?${params.toString()}`),
      api.get("/categories?all=true"),
      api.get("/tags"),
    ])
      .then(([p, c, t]) => {
        setProducts(p.data.data);
        setCategories(c.data.data);
        setTags(t.data.data);
      })
      .catch(() => {
        setError(true);
        toast.error("Failed to load products");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search, filters]);

  useEffect(() => {
    const pageCount = Math.ceil(products.length / PAGE_SIZE);
    if (page > pageCount) setPage(pageCount || 1);
  }, [products.length]);

  const selectedTagIds = useMemo(() => new Set(form.tags), [form.tags]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFiles([]);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      category: p.category?._id || "",
      tags: p.tags?.map((t) => t._id) || [],
      basePrice: p.basePrice,
      discountPrice: p.discountPrice || "",
      ingredients: (p.ingredients || []).join(", "),
      isVeg: p.isVeg,
      spiceLevel: p.spiceLevel,
      prepTimeMinutes: p.prepTimeMinutes,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      variants: p.variants || [],
    });
    setImageFiles([]);
    setModalOpen(true);
  };

  const toggleTag = (id) => {
    setForm((f) => ({ ...f, tags: f.tags.includes(id) ? f.tags.filter((t) => t !== id) : [...f.tags, id] }));
  };

  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, { label: "", price: "" }] }));
  const updateVariant = (i, key, value) => {
    setForm((f) => {
      const next = [...f.variants];
      next[i] = { ...next[i], [key]: value };
      return { ...f, variants: next };
    });
  };
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("tags", form.tags.join(","));
      fd.append("basePrice", form.basePrice);
      if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
      if (form.ingredients) fd.append("ingredients", form.ingredients);
      fd.append("isVeg", form.isVeg);
      fd.append("spiceLevel", form.spiceLevel);
      fd.append("prepTimeMinutes", form.prepTimeMinutes);
      fd.append("isAvailable", form.isAvailable);
      fd.append("isFeatured", form.isFeatured);
      fd.append("variants", JSON.stringify(form.variants.filter((v) => v.label && v.price)));
      imageFiles.forEach((f) => fd.append("images", f));

      if (editing) {
        await api.put(`/products/${editing._id}`, fd);
        toast.success("Product updated");
      } else {
        await api.post("/products", fd);
        toast.success("Product created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await alert.confirm({
      title: "Delete Product",
      message: "Delete this product permanently? This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const toggleDraftCategory = (id) => {
    setDraftFilters((f) => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter((c) => c !== id) : [...f.categories, id],
    }));
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters({ categories: [], isVeg: "all", sort: "" });
    setFilters({ categories: [], isVeg: "all", sort: "" });
    setFilterOpen(false);
  };

  const activeFilterCount = (filters.categories.length > 0 ? 1 : 0) + (filters.isVeg !== "all" ? 1 : 0) + (filters.sort ? 1 : 0);

  const pageCount = Math.ceil(products.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount) || 1;
  const pageItems = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Products</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={16} /> New Product</button>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", maxWidth: 320, flex: 1, minWidth: 220 }}>
          <MagnifyingGlass size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
          <input className="admin-input" style={{ paddingLeft: 36 }} placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button type="button" className="btn btn-outline btn-sm" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }} onClick={() => { setDraftFilters(filters); setFilterOpen(true); }}>
          <Funnel size={15} /> Filters
          {activeFilterCount > 0 && (
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999,
              fontSize: 11, fontWeight: 800, color: "#fff",
              background: "var(--paprika)",
            }}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {error ? (
        <EmptyState type="products" hasError onAction={load} style={{ marginBottom: 18 }} />
      ) : products.length === 0 && !loading ? (
        <EmptyState type="products" subtitle={search || activeFilterCount > 0 ? "No products match your search or filters. Try adjusting them." : "Start adding items to your menu — they'll show up here."} style={{ marginBottom: 18 }} />
      ) : (
        <>
          <div className="admin-card" style={{ padding: 0, overflow: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Featured</th><th></th></tr>
          </thead>
<tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-row-${i}`}>
                  <td><div className="skeleton" style={{ width: 42, height: 42, borderRadius: 8 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "70%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "60%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} /></td>
                  <td><div className="skeleton" style={{ width: 56, height: 26, borderRadius: 8 }} /></td>
                </tr>
              ))
            ) : (
              pageItems.map((p) => (
                <tr key={p._id}>
                  <td><div style={{ width: 42, height: 42, borderRadius: 8, background: "var(--cream-2)", overflow: "hidden" }}>{p.images?.[0]?.url && <img src={p.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div></td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>{p.category?.name || "-"}</td>
                  <td>{formatPKR(p.discountPrice || p.basePrice)}</td>
                  <td><span className="admin-badge" style={{ background: p.isAvailable ? "rgba(75,120,101,0.18)" : "rgba(194,65,12,0.1)", color: p.isAvailable ? "var(--mint)" : "var(--paprika)" }}>{p.isAvailable ? "Yes" : "No"}</span></td>
                  <td>{p.isFeatured ? <Star size={14} weight="fill" color="#f59e0b" /> : "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="icon-btn" onClick={() => openEdit(p)} aria-label="Edit"><Pencil size={15} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(p._id)} aria-label="Delete"><Trash size={15} /></button>
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

      <AdminModal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter Products" width={480}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="admin-label">Categories</label>
            {categories.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>No categories found.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map((c) => {
                  const selected = draftFilters.categories.includes(c._id);
                  return (
                    <button
                      type="button"
                      key={c._id}
                      onClick={() => toggleDraftCategory(c._id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
                        border: selected ? "1.5px solid var(--mint)" : "1.5px solid var(--line)",
                        background: selected ? "rgba(75,120,101,0.12)" : "#fff",
                        color: selected ? "var(--mint)" : "var(--ink-soft)",
                        cursor: "pointer",
                        transition: "all .15s ease",
                      }}
                    >
                      {selected && <X size={12} weight="bold" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="admin-label">Dietary</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { value: "all", label: "All" },
                { value: "true", label: "Vegetarian" },
                { value: "false", label: "Non-Veg" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setDraftFilters((f) => ({ ...f, isVeg: opt.value }))}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    border: draftFilters.isVeg === opt.value ? "1.5px solid var(--mint)" : "1.5px solid var(--line)",
                    background: draftFilters.isVeg === opt.value ? "rgba(75,120,101,0.12)" : "#fff",
                    color: draftFilters.isVeg === opt.value ? "var(--mint)" : "var(--ink-soft)",
                    cursor: "pointer",
                    transition: "all .15s ease",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="admin-label">Price</label>
            <select
              className="admin-input"
              value={draftFilters.sort}
              onChange={(e) => setDraftFilters((f) => ({ ...f, sort: e.target.value }))}
            >
              <option value="">Default</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-outline" onClick={resetFilters}>Reset</button>
            <button type="button" className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
          </div>
        </div>
      </AdminModal>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "New Product"} width={640}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="admin-label">Name</label>
            <input required className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">Description</label>
            <textarea required rows={3} className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="admin-label">Category</label>
              <select required className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Spice Level</label>
              <select className="admin-input" value={form.spiceLevel} onChange={(e) => setForm({ ...form, spiceLevel: e.target.value })}>
                <option value="none">None</option>
                <option value="mild">Mild</option>
                <option value="medium">Medium</option>
                <option value="hot">Hot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {tags.map((t) => {
                const selected = selectedTagIds.has(t._id);
                return (
                  <button
                    type="button"
                    key={t._id}
                    onClick={() => toggleTag(t._id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 13px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      border: selected ? `1.5px solid ${t.colorHex}` : "1.5px solid var(--line)",
                      background: selected ? "#fff" : "#fff",
                      color: selected ? t.colorHex : "var(--ink-soft)",
                      boxShadow: selected ? "0 2px 6px rgba(0,0,0,.08)" : "none",
                      transition: "all .15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: selected ? t.colorHex : "var(--line)",
                        flexShrink: 0,
                      }}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="admin-label">Ingredients (comma separated)</label>
            <input className="admin-input" placeholder="Paratha, Chicken, Chutney..." value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          </div>

          <div className="admin-grid-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div>
              <label className="admin-label">Base Price ({getCurrency()})</label>
              <input required type="number" className="admin-input" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Discount Price ({getCurrency()}) (opt.)</label>
              <input type="number" className="admin-input" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
            </div>
            <div>
              <label className="admin-label">Prep Time (min)</label>
              <input type="number" className="admin-input" value={form.prepTimeMinutes} onChange={(e) => setForm({ ...form, prepTimeMinutes: e.target.value })} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label className="admin-label" style={{ margin: 0 }}>Size Variants (optional)</label>
              <button type="button" className="btn btn-outline btn-sm" onClick={addVariant}>+ Add Variant</button>
            </div>
            {form.variants.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input className="admin-input" placeholder="Label e.g. Large" value={v.label} onChange={(e) => updateVariant(i, "label", e.target.value)} />
                <input className="admin-input" placeholder="Price ({getCurrency()})" type="number" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} style={{ maxWidth: 120 }} />
                <button type="button" className="icon-btn danger" onClick={() => removeVariant(i)} aria-label="Remove variant"><Trash size={14} /></button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} /> Vegetarian
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <input type="checkbox" checked={!form.isVeg} onChange={(e) => setForm({ ...form, isVeg: !e.target.checked })} /> Non-Veg
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured
            </label>
          </div>

          <div>
            <label className="admin-label">Images {editing && "(uploading new images replaces old ones)"}</label>
            <input type="file" accept="image/*" multiple className="admin-input" onChange={(e) => setImageFiles([...e.target.files])} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 6 }}>{saving ? "Saving..." : "Save Product"}</button>
        </form>
      </AdminModal>
    </div>
  );
}
