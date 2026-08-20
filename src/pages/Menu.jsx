import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MagnifyingGlass, FadersHorizontal } from "phosphor-react";
import ProductCard from "../components/ProductCard.jsx";
import { SkeletonGrid } from "../components/Skeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import api from "../api/axios.js";

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";
  const activeVeg = searchParams.get("veg") || "";
  const activeSort = searchParams.get("sort") || "priceLow";

  const PAGE_SIZE = 24;

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.data)).catch(() => {});
    api.get("/tags").then(({ data }) => setTags(data.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(
    async (pageToFetch, append) => {
      const params = new URLSearchParams({ availableOnly: "false", limit: String(PAGE_SIZE), page: String(pageToFetch) });
      if (activeCategory) params.set("category", activeCategory);
      if (activeTag) params.set("tag", activeTag);
      if (activeVeg) params.set("isVeg", activeVeg);
      if (activeSort && activeSort !== "default") params.set("sort", activeSort);
      if (search) params.set("search", search);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts((prev) => (append ? [...prev, ...data.data] : data.data));
      setTotalProducts(data.total);
      setHasMore(pageToFetch < data.pages);
      setPage(pageToFetch);
    },
    [activeCategory, activeTag, activeVeg, activeSort, search]
  );

  useEffect(() => {
    setLoading(true);
    setError(false);
    const timeout = setTimeout(async () => {
      try {
        await fetchProducts(1, false);
      } catch {
        setProducts([]);
        setTotalProducts(0);
        setHasMore(false);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [fetchProducts, retryKey]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchProducts(page + 1, true);
    } catch {
      toast.error("Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const categoryName = useMemo(
    () => categories.find((c) => c._id === activeCategory)?.name,
    [categories, activeCategory]
  );

  return (
    <div className="container menu-page" style={{ padding: "40px 24px 80px" ,
      paddingTop: '130px'
    }}>
      <div style={{ marginBottom: 30 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Our Menu</div>
        <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>{categoryName || "Everything, freshly rolled"}</h1>
      </div>

      {/* Search + filter toggle */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <MagnifyingGlass size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parathas, rolls, drinks..."
            style={{
              width: "100%",
              padding: "13px 16px 13px 44px",
              borderRadius: 999,
              border: "1.5px solid var(--line)",
              fontSize: 14.5,
              background: "#fff",
            }}
          />
        </div>
        <button className="btn btn-outline btn-sm mobile-filter-btn" onClick={() => setShowFilters((v) => !v)} style={{ borderRadius: 999, display: "none" }}>
          <FadersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Category chips */}
      <div className="cat-chip-row" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, marginBottom: 16 }}>
        <button
          onClick={() => updateParam("category", "")}
          className={`chip ${!activeCategory ? "active" : ""}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button key={c._id} onClick={() => updateParam("category", c._id)} className={`chip ${activeCategory === c._id ? "active" : ""}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className={`filter-row ${showFilters ? "open" : ""}`} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 30 }}>
        <select value={activeTag} onChange={(e) => updateParam("tag", e.target.value)} className="select-field">
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <select value={activeVeg} onChange={(e) => updateParam("veg", e.target.value)} className="select-field">
          <option value="">Veg & Non-Veg</option>
          <option value="true">Vegetarian Only</option>
          <option value="false">Non-Vegetarian Only</option>
        </select>
        <select value={activeSort} onChange={(e) => updateParam("sort", e.target.value)} className="select-field">
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="rating">Top Rated</option>
          <option value="default">Sort: Recommended</option>
        </select>
      </div>

      {loading ? (
        <SkeletonGrid count={8} cols="grid-4" />
      ) : error ? (
        <EmptyState type="products" hasError onAction={() => setRetryKey((k) => k + 1)} />
      ) : products.length === 0 ? (
        <EmptyState type="products" subtitle="No dishes found. Try adjusting your filters or search term." />
      ) : (
        <>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
            Showing {products.length} of {totalProducts} items
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 22 }}>
            {products.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <button className="btn btn-outline" onClick={loadMore} disabled={loadingMore} style={{ borderRadius: 999, padding: "12px 28px", fontWeight: 600 }}>
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .chip { flex-shrink: 0; padding: 9px 18px; border-radius: 999px; border: 1.5px solid var(--line); background: #fff; font-size: 13.5px; font-weight: 600; color: var(--ink); }
        .chip.active { background: var(--ink); color: var(--cream); border-color: var(--ink); }
        .select-field { padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--line); background: #fff; font-size: 13.5px; font-weight: 600; color: var(--ink); }
        .cat-chip-row::-webkit-scrollbar { height: 0; }
        @media (max-width: 860px) {
          .menu-page { padding-top: 150px !important; }
        }
        @media (max-width: 700px) {
          .mobile-filter-btn { display: inline-flex !important; }
          .filter-row { display: none !important; }
          .filter-row.open { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
