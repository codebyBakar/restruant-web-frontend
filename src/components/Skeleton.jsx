function SkeletonCard({ ratio = "4/3" }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__img" style={{ aspectRatio: ratio }} />
      <div className="skeleton-card__body">
        <div className="skeleton" style={{ height: 12, width: "55%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 16, width: "85%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 13, width: "65%", marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 36, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8, cols = "grid-4", ratio = "4/3", style }) {
  return (
    <div className={cols} style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`skel-${i}`} ratio={ratio} />
      ))}
    </div>
  );
}

export function SkeletonCategory({ count = 6 }) {
  return (
    <div className="skeleton-cat-row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skel-cat-${i}`} className="skeleton-cat">
          <div className="skeleton skeleton-cat__img" />
          <div className="skeleton" style={{ height: 12, width: "70%", margin: "12px auto 0" }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skel-list-${i}`} className="skeleton-card" style={{ padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
          <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 14, width: "35%", marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 12, width: "80%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: "60%" }} />
          </div>
          <div className="skeleton" style={{ width: 90, height: 34, borderRadius: 999, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className="admin-grid-4" style={{ marginBottom: 30 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skel-stat-${i}`} className="admin-stat-card">
          <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 24, width: "60%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: "45%" }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail({ lines = 10 }) {
  return (
    <div className="admin-card">
      <div className="skeleton" style={{ height: 26, width: "40%", marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 16, width: "65%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 12, width: "85%", marginBottom: 28 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={`skel-line-${i}`}
          className="skeleton"
          style={{ height: 14, borderRadius: 6, marginBottom: i < lines - 1 ? 16 : 0, width: `${85 - (i % 4) * 12}%` }}
        />
      ))}
    </div>
  );
}
