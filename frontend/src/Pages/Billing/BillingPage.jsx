import React, { useEffect, useState } from "react";
import apiClient from "../../Components/ServiceLayer/AxiosApi/API";
import { useNavigate } from "react-router-dom";
import {
  Printer,
  Trash2,
  ArrowLeft,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

const TAX_RATE = 0.12; // 12% VAT

function BillingPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [localCart, setLocalCart] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Load user and cart from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCart = localStorage.getItem("user_billing_cart");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCart) setLocalCart(JSON.parse(storedCart));
  }, []);

  // Compute totals
  const subtotal = localCart.reduce(
    (sum, i) => sum + i.productPrice * i.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const updateQuantity = (product_id, delta) => {
    const updated = localCart
      .map((item) =>
        item.product_id === product_id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    setLocalCart(updated);
    localStorage.setItem("user_billing_cart", JSON.stringify(updated));
  };

  const removeItem = (product_id) => {
    const updated = localCart.filter((item) => item.product_id !== product_id);
    setLocalCart(updated);
    localStorage.setItem("user_billing_cart", JSON.stringify(updated));
  };

  const handleCheckout = async () => {
    if (localCart.length === 0) return alert("Your cart is empty.");

    setProcessing(true);
    try {
      const cartPayload = localCart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.productPrice,
      }));

      const res = await apiClient.post("/bills/billings", {
        user_id: user?.user_id || null,
        cart: cartPayload,
        subtotal,
        tax,
        total,
      });

      // Use backend billing + items for exact preview
      setReceipt({
        billing: res.data.billing,
        items: res.data.items,
      });

      setLocalCart([]);
      localStorage.removeItem("user_billing_cart");
    } catch (err) {
      console.error(err);
      alert("Failed to complete transaction. Please try again.");
    }
    setProcessing(false);
  };

  const handlePrint = () => window.print();

  // === RECEIPT PREVIEW ===
  if (receipt) {
    const { billing, items } = receipt;

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md mt-8 p-8 print:p-2 print:shadow-none text-gray-800">
        <button
          className="mb-6 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold flex items-center"
          onClick={() => {
            setReceipt(null);
            navigate("/user/products");
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2 inline-block" /> Back to Products
        </button>
        <h2 className="text-2xl font-bold mb-2">Receipt / Invoice</h2>
        <hr className="mb-4" />
        <div className="mb-4">
          <p>
            <strong>Customer:</strong>{" "}
            {billing?.fullName ||
              `${user?.firstName || ""} ${user?.lastName || ""}`}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(billing?.createdAt || Date.now()).toLocaleString()}
          </p>
          <p>
            <strong>Transaction ID:</strong> {billing?.billing_id}
          </p>
        </div>

        <table className="w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="text-left p-2 border-b">Product</th>
              <th className="text-right p-2 border-b">Qty</th>
              <th className="text-right p-2 border-b">Unit Price</th>
              <th className="text-right p-2 border-b">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.item_id}>
                <td className="p-2">{item.productName}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">
                  ₱{Number(item.unit_price).toFixed(2)}
                </td>
                <td className="p-2 text-right">
                  ₱{Number(item.line_total).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-2 text-right">
          <div>
            Subtotal: <strong>₱{Number(billing?.subtotal).toFixed(2)}</strong>
          </div>
          <div>
            Tax (12%): <strong>₱{Number(billing?.tax).toFixed(2)}</strong>
          </div>
          <div className="text-xl mt-2">
            Total: <strong>₱{Number(billing?.total).toFixed(2)}</strong>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="mt-6 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold print:hidden flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </button>
      </div>
    );
  }

  // === CART VIEW ===
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md mt-8 p-8 text-gray-800">
      <button
        className="mb-6 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold flex items-center"
        onClick={() => {
          setReceipt(null);
          navigate("/user/products");
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2 inline-block" /> Back to Products
      </button>
      <h2 className="text-2xl font-bold mb-5">Billing Cart</h2>
      {localCart.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-gray-500 font-semibold">
            Your cart is empty. Select products first!
          </span>
        </div>
      ) : (
        <>
          <table className="w-full mb-6 table-auto">
            <thead>
              <tr>
                <th className="text-left p-2 border-b">Product</th>
                <th className="text-center p-2 border-b">Qty</th>
                <th className="text-right p-2 border-b">Price</th>
                <th className="text-right p-2 border-b">Total</th>
                <th className="p-2 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {localCart.map((item) => (
                <tr key={item.product_id}>
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2 flex items-center gap-2 justify-center">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.product_id, -1)}
                      className="bg-gray-100 text-gray-600 rounded-full p-1"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                    {item.quantity}
                    <button
                      onClick={() => updateQuantity(item.product_id, +1)}
                      className="bg-gray-100 text-gray-600 rounded-full p-1"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-2 text-right">
                    ₱{Number(item.productPrice).toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    ₱{Number(item.productPrice * item.quantity).toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="bg-red-100 text-red-600 rounded-full p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-2 text-right">
            <div>
              Subtotal: <strong>₱{subtotal.toFixed(2)}</strong>
            </div>
            <div>
              Tax (12%): <strong>₱{tax.toFixed(2)}</strong>
            </div>
            <div className="text-xl mt-2">
              Total: <strong>₱{total.toFixed(2)}</strong>
            </div>
          </div>

          <button
            className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-2 justify-center"
            onClick={handleCheckout}
            disabled={processing}
          >
            {processing ? "Processing..." : "Checkout & Generate Receipt"}
          </button>
        </>
      )}
    </div>
  );
}

export default BillingPage;
