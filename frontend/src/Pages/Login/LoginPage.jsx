import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../Components/Store/AuthSlice"; // adjust the path as needed
import apiClient from "../../Components/ServiceLayer/AxiosApi/api";

function UserLoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/users/login", {
        username: user,
        password,
      });

      const data = res.data;

      // Save to Redux + localStorage
      dispatch(loginSuccess({ token: data.token, user: data.user }));

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/manage/products");
      } else {
        navigate("/user/products");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else if (err.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background decorative gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-yellow-200/40 to-amber-200/40 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-3xl p-8 border border-white/30 transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">Please sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Registration Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link
                  to="/registration"
                  className="text-amber-600 hover:text-amber-700 font-medium underline transition-all"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserLoginPage;
