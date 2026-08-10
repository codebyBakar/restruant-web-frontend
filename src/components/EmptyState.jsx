import { WarningCircle, Package, SquaresFour, Tag, Receipt, MagnifyingGlass } from "phosphor-react";

const PRESETS = {
  products: {
    icon: <Package size={42} />,
    emptyTitle: "No products found",
    emptyDesc: "No items have been added yet. Check back soon!",
    errorTitle: "Unable to load products",
    errorDesc: "Something went wrong while loading products. Please try again.",
  },
  categories: {
    icon: <SquaresFour size={42} />,
    emptyTitle: "No categories available",
    emptyDesc: "Categories will appear here once added.",
    errorTitle: "Unable to load categories",
    errorDesc: "Something went wrong while loading categories. Please try again.",
  },
  deals: {
    icon: <Tag size={42} />,
    emptyTitle: "No deals right now",
    emptyDesc: "There are no active deals at the moment. Check back soon!",
    errorTitle: "Unable to load deals",
    errorDesc: "Something went wrong while loading deals. Please try again.",
  },
  tags: {
    icon: <Tag size={42} />,
    emptyTitle: "No tags yet",
    emptyDesc: "Add tags to help filter and organize your menu items.",
    errorTitle: "Unable to load tags",
    errorDesc: "Something went wrong while loading tags. Please try again.",
  },
  orders: {
    icon: <Receipt size={42} />,
    emptyTitle: "No orders found",
    emptyDesc: "There are no orders to show right now.",
    errorTitle: "Unable to load orders",
    errorDesc: "Something went wrong while loading orders. Please try again.",
  },
  search: {
    icon: <MagnifyingGlass size={42} />,
    emptyTitle: "No results found",
    emptyDesc: "Try different keywords or adjust your filters.",
    errorTitle: "Search failed",
    errorDesc: "Something went wrong with your search. Please try again.",
  },
};

export default function EmptyState({
  type = "products",
  icon,
  title,
  subtitle,
  action,
  actionLabel = "Retry",
  onAction,
  hasError = false,
  style,
}) {
  const cfg = PRESETS[type] || PRESETS.products;
  const isError = hasError;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "56px 24px",
        borderRadius: "var(--radius-md)",
        background: isError ? "rgba(194,65,12,0.06)" : "#fff",
        border: `1.5px dashed ${isError ? "rgba(194,65,12,0.35)" : "var(--line)"}`,
        color: "var(--ink-soft)",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, color: isError ? "var(--paprika)" : "var(--ink-soft)" }}>
        {icon || (isError ? <WarningCircle size={42} /> : cfg.icon)}
      </div>
      <h3 style={{ fontSize: 19, color: isError ? "var(--paprika)" : "var(--ink)", marginBottom: 6 }}>
        {title || (isError ? cfg.errorTitle : cfg.emptyTitle)}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 20px" }}>
        {subtitle || (isError ? cfg.errorDesc : cfg.emptyDesc)}
      </p>
      {action || (hasError && onAction ? (
        <button className="btn btn-dark btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null)}
    </div>
  );
}