import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import api, { endpoints, describeApiError } from "./lib/api";
import { appContext } from "./appContext";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Register from "./components/Register";
import Products from "./components/Products";
import Orders from "./components/Orders";

/**
 * Route shell with page transitions.
 * <AnimatePresence mode="wait"> keeps the outgoing page mounted while it
 * plays its `exit` animation, then lets the incoming page fade/slide in.
 * Keying <Routes> by pathname is what tells Framer Motion a "page" changed.
 */
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<Products />} />
        <Route path="/" element={<Products />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // ---- State: shape identical to the original (new fields are additive) ----
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // NEW: drives the skeleton loaders on the products page
  const [productsLoading, setProductsLoading] = useState(true);

  // Base URL comes from src/lib/api.js: http://localhost:5001 in `vite dev`,
  // the Render backend in a production build, VITE_API_URL as an override.
  const fetchProducts = async (query = searchQuery) => {
    setProductsLoading(true);
    try {
      const trimmed = (query ?? "").trim();
      const result = await api.get(
        trimmed ? endpoints.searchProducts(trimmed) : endpoints.products
      );
      setProducts(result.data);
    } catch (err) {
      console.log(err);
      toast.error(`Couldn't load products. ${describeApiError(err)}`);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch once on mount — the sanctioned "subscribe to an external system"
  // effect pattern (setState runs inside the async callback after the
  // network round-trip), so both rules below are intentionally suppressed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <appContext.Provider
        value={{
          users,
          setUsers,
          user,
          setUser,
          products,
          productsLoading, // NEW → skeleton loaders
          refetchProducts: fetchProducts, // NEW → "Try again" empty state
          searchQuery,
          setSearchQuery,
          searchProducts: fetchProducts,
          cart,
          setCart,
          orders,
          setOrders,
        }}
      >
        {/* min-h-screen flex column: header sticks, footer sits at the bottom */}
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>

        {/* Modern toast notifications (replaces alert()/plain-text errors),
            themed to match the dark glass design */}
        <Toaster
          position="top-center"
          gutter={12}
          toastOptions={{
            duration: 3200,
            style: {
              background: "rgba(9, 13, 26, 0.9)",
              color: "#e2e8f0",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(14px)",
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "14px",
              boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.6)",
            },
            success: {
              iconTheme: { primary: "#22d3ee", secondary: "#090d1a" },
            },
            error: {
              iconTheme: { primary: "#fb7185", secondary: "#090d1a" },
            },
          }}
        />
      </appContext.Provider>
    </BrowserRouter>
  );
}

export default App;
