import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth } from "./lib/auth";
import { OrdersProvider } from "./lib/orders";
import Layout from "./components/Layout";
import { Spinner } from "./components/ui";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Abandoned from "./pages/Abandoned";
import Customers from "./pages/Customers";
import Products from "./pages/Products";

function Protected() {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner label="Signing you in…" />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <OrdersProvider>
      <Layout />
    </OrdersProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protected />}>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="abandoned" element={<Abandoned />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
