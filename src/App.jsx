import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import ProductModal from "./components/ProductModal.jsx";
import DealModal from "./components/DealModal.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ClosedBanner from "./components/ClosedBanner.jsx";
import Home from "./pages/Home.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import RequireCart from "./components/RequireCart.jsx";
import RequireEmail from "./components/RequireEmail.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

const Menu = lazy(() => import("./pages/Menu.jsx"));
const Deals = lazy(() => import("./pages/Deals.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.jsx"));
const MyActivity = lazy(() => import("./pages/MyOrders.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsConditions = lazy(() => import("./pages/TermsConditions.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.jsx"));
const AdminTags = lazy(() => import("./pages/admin/AdminTags.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail.jsx"));
const AdminDeals = lazy(() => import("./pages/admin/AdminDeals.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
      }}
    >
      <div className="skeleton" style={{ width: 220, height: 14, borderRadius: 6 }} />
    </div>
  );
}

function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <ProductModal />
      <DealModal />
      <ClosedBanner />
    </>
  );
}

function RouteFallback({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SiteLayout><RouteFallback><Home /></RouteFallback></SiteLayout>} />
        <Route path="/menu" element={<SiteLayout><RouteFallback><Menu /></RouteFallback></SiteLayout>} />
        <Route path="/deals" element={<SiteLayout><RouteFallback><Deals /></RouteFallback></SiteLayout>} />
        <Route path="/checkout" element={<SiteLayout><RequireCart><RouteFallback><Checkout /></RouteFallback></RequireCart></SiteLayout>} />
        <Route path="/order-success/:orderNumber" element={<SiteLayout><RequireEmail><RouteFallback><OrderSuccess /></RouteFallback></RequireEmail></SiteLayout>} />
        <Route path="/track" element={<SiteLayout><RouteFallback><MyActivity /></RouteFallback></SiteLayout>} />
        <Route path="/about" element={<SiteLayout><RouteFallback><About /></RouteFallback></SiteLayout>} />
        <Route path="/contact" element={<SiteLayout><RouteFallback><Contact /></RouteFallback></SiteLayout>} />
        <Route path="/privacy-policy" element={<SiteLayout><RouteFallback><PrivacyPolicy /></RouteFallback></SiteLayout>} />
        <Route path="/terms-condition" element={<SiteLayout><RouteFallback><TermsConditions /></RouteFallback></SiteLayout>} />

        <Route path="/prathachaiadmin@2026" element={<RouteFallback><AdminLogin /></RouteFallback>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <NotificationProvider>
                <AdminLayout />
              </NotificationProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<RouteFallback><Dashboard /></RouteFallback>} />
          <Route path="products" element={<RouteFallback><AdminProducts /></RouteFallback>} />
          <Route path="categories" element={<RouteFallback><AdminCategories /></RouteFallback>} />
          <Route path="tags" element={<RouteFallback><AdminTags /></RouteFallback>} />
          <Route path="orders" element={<RouteFallback><AdminOrders /></RouteFallback>} />
          <Route path="orders/:id" element={<RouteFallback><AdminOrderDetail /></RouteFallback>} />
          <Route path="deals" element={<RouteFallback><AdminDeals /></RouteFallback>} />
          <Route path="settings" element={<RouteFallback><AdminSettings /></RouteFallback>} />
        </Route>

        <Route path="/404" element={<SiteLayout><RouteFallback><NotFound /></RouteFallback></SiteLayout>} />
        <Route path="*" element={<SiteLayout><RouteFallback><NotFound /></RouteFallback></SiteLayout>} />
      </Routes>
    </>
  );
}