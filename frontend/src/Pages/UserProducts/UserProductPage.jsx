import React, { useEffect, useState } from "react";
import apiClient from "../../Components/ServiceLayer/AxiosApi/API";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Package,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Components/Store/AuthSlice"; // adjust path if needed

const PRODUCTS_PER_PAGE = 10;

function UserProductPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("user_billing_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // Fetch product data with pagination
  const fetchProducts = async (currentPage) => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `/stocks/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`
      );
      setProducts(res.data.products || res.data);
      setTotalPages(
        Math.ceil((res.data.totalCount || res.data.length) / PRODUCTS_PER_PAGE)
      );
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (product.productStocks <= 0) return;

    const updatedCart = (() => {
      const found = cart.find((p) => p.product_id === product.product_id);
      if (found) {
        return cart.map((p) =>
          p.product_id === product.product_id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      } else {
        return [...cart, { ...product, quantity: 1 }];
      }
    })();

    const updatedProducts = products.map((p) =>
      p.product_id === product.product_id
        ? { ...p, productStocks: p.productStocks - 1 }
        : p
    );

    setProducts(updatedProducts);
    setCart(updatedCart);
    localStorage.setItem("user_billing_cart", JSON.stringify(updatedCart));
  };

  const goToCart = () => {
    localStorage.setItem("user_billing_cart", JSON.stringify(cart));
    navigate("/user/billing-cart");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-amber-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Available Products
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>{user?.firstName || "User"}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button
              onClick={goToCart}
              disabled={cart.length === 0}
              className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg gap-2 shadow"
            >
              <ShoppingCart className="w-5 h-5" />
              View Cart ({cart.reduce((sum, p) => sum + p.quantity, 0)})
            </button>
          </div>
        </div>
      </nav>

      {loading ? (
        <div className="text-center py-12">
          <span className="text-amber-400 font-semibold">
            Loading products...
          </span>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-10 mt-6">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-xl shadow p-5 flex flex-col"
              >
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-full h-36 object-cover rounded mb-4 border"
                />
                <h2 className="font-semibold text-lg text-gray-900">
                  {product.productName}
                </h2>
                <p className="text-gray-600 mb-2 text-sm">
                  {product.productDescription}
                </p>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-600 font-bold text-lg">
                    ₱{Number(product.productPrice).toFixed(2)}
                  </span>
                  <span className="text-xs rounded px-2 bg-gray-100">
                    {product.category}
                  </span>
                </div>

                {/* ✅ Added stock count here */}
                <div className="text-sm text-gray-600 mb-3">
                  Stocks left:{" "}
                  <span
                    className={`font-semibold ${
                      product.productStocks <= 5
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {product.productStocks}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.productStocks === 0}
                  className={`flex items-center justify-center py-2 px-4 rounded-lg mt-auto font-semibold gap-2 transition-all ${
                    product.productStocks === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {product.productStocks === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-8 mb-10">
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ArrowLeft className="w-4 h-4 inline-block" /> Prev
            </button>
            <span className="mx-4 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ArrowRight className="w-4 h-4 inline-block" />
            </button>
          </div>
        </>
      )}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm text-center">
            <h3 className="text-lg font-bold mb-3 text-gray-800">
              Sign In Required
            </h3>
            <p className="text-gray-600 mb-5">
              You need to sign in before you can add items to your cart.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProductPage;
