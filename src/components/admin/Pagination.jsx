import { CaretLeft, CaretRight } from "phosphor-react";

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  const go = (p) => {
    if (p >= 1 && p <= pageCount) onChange(p);
  };

  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, start + 4);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="admin-pagination">
      <button type="button" className="admin-page-btn" onClick={() => go(page - 1)} disabled={page === 1}>
        <CaretLeft size={14} />
      </button>
      {start > 1 && <span className="admin-page-ellipsis">…</span>}
      {pages.map((p) => (
        <button key={p} type="button" className={`admin-page-btn${p === page ? " active" : ""}`} onClick={() => go(p)}>
          {p}
        </button>
      ))}
      {end < pageCount && <span className="admin-page-ellipsis">…</span>}
      <button type="button" className="admin-page-btn" onClick={() => go(page + 1)} disabled={page === pageCount}>
        <CaretRight size={14} />
      </button>
    </div>
  );
}
