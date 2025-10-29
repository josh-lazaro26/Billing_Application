import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Components/Store/AuthSlice"; // adjust path
import apiClient from "../../Components/ServiceLayer/AxiosApi/api";
import {
  Pencil,
  Trash2,
  Loader2,
  XCircle,
  PlusCircle,
  Save,
  LogOut,
  Package,
} from "lucide-react";

const emptyProduct = {
  productName: "",
  productDescription: "",
  productImage: "",
  productPrice: "",
  productStocks: "",
  category: "",
};

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [file, setFile] = useState(null);

  // Handles file input and sets base64 string in form state
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, productImage: reader.result }));
      setFile(selectedFile); // not required for backend, just for local preview if wanted
    };
    reader.readAsDataURL(selectedFile); // gets base64 string
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setPageLoading(true);
    try {
      const res = await apiClient.get("/stocks/products");
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
      setPageLoading(false); // Mark page loaded after fetch finishes
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Form values (still using JSON POST)
    const payload = { ...form };
    // Set productImage as base64 string

    try {
      if (editing) {
        await apiClient.put(`/stocks/products/${editing}`, payload);
      } else {
        await apiClient.post("/stocks/products", payload);
      }
      fetchProducts();
      setForm(emptyProduct);
      setFile(null);
      setEditing(null);
      setShowModal(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditing(product.product_id);
    setShowModal(true);
  };

  const handleAdd = () => {
    setForm(emptyProduct);
    setEditing(null);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await apiClient.delete(`/stocks/products/${deleteId}`);
      fetchProducts();
      setDeleteId(null);
      setError("");
    } catch (err) {
      setError("Error deleting product");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
          <div className="mt-6 text-lg text-gray-700 font-semibold">
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-amber-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Product Management
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <strong>{user?.firstName || "Admin"}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Add Button */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700">
              All Products
            </h2>
            <button
              onClick={handleAdd}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5" /> Add Product
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-500" />
                <p className="mt-3 text-gray-500">Loading products...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-100 to-amber-50 text-left text-sm border-b border-gray-300">
                      <th className="p-4 font-semibold text-gray-700">Image</th>
                      <th className="p-4 font-semibold text-gray-700">Name</th>
                      <th className="p-4 font-semibold text-gray-700">
                        Description
                      </th>
                      <th className="p-4 font-semibold text-gray-700">Price</th>
                      <th className="p-4 font-semibold text-gray-700">
                        Stocks
                      </th>
                      <th className="p-4 font-semibold text-gray-700">
                        Category
                      </th>
                      <th className="p-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-10 text-center text-gray-400"
                        >
                          No products available. Click "Add Product" to get
                          started.
                        </td>
                      </tr>
                    )}
                    {products.map((product) => (
                      <tr
                        key={product.product_id}
                        className="border-b border-gray-100 hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="p-4">
                          {product.productImage ? (
                            <img
                              src={product.productImage}
                              alt={product.productName}
                              className="h-16 w-16 object-cover rounded-lg shadow-sm border border-gray-200"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-medium text-gray-800">
                          {product.productName}
                        </td>
                        <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                          {product.productDescription || "—"}
                        </td>
                        <td className="p-4 text-gray-800 font-semibold">
                          ₱{Number(product.productPrice).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.productStocks > 10
                                ? "bg-green-100 text-green-700"
                                : product.productStocks > 0
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.productStocks} left
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {product.category || "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 transition-all shadow-sm hover:shadow-md"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(product.product_id)}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 transition-all shadow-sm hover:shadow-md"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for add/edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 space-y-5 relative animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800">
              {editing ? "Edit Product" : "Add New Product"}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="productDescription"
                value={form.productDescription}
                onChange={handleInput}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Enter product description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded"
              />
              {form.productImage && (
                <img
                  src={form.productImage}
                  alt="Preview"
                  className="mt-2 h-28 w-auto object-cover rounded border"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="productPrice"
                  value={form.productPrice}
                  onChange={handleInput}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stocks
                </label>
                <input
                  type="number"
                  min="0"
                  name="productStocks"
                  value={form.productStocks}
                  onChange={handleInput}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Electronics, Clothing"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {editing ? "Save Changes" : "Add Product"}
            </button>
          </form>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold mb-3 text-gray-800">
              Delete Product?
            </h4>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition-all"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
