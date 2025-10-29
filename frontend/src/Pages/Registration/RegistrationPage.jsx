import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../Components/ServiceLayer/AxiosApi/api";

function RegistrationPage() {
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: false });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // frontend minimal field validation
    const errs = {};
    ["firstName", "lastName", "username", "password"].forEach((key) => {
      if (!fields[key]) errs[key] = true;
    });
    setFieldErrors(errs);

    if (Object.keys(errs).length) {
      setLoading(false);
      setError("All fields are required.");
      return;
    }
    try {
      await apiClient.post("/users/register", fields);
      navigate("/"); // redirect after success
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-yellow-200/30 to-amber-200/30 blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Sign up to get started</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                  fieldErrors.firstName
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-amber-500"
                }`}
                placeholder="Enter your first name"
                value={fields.firstName}
                onChange={handleChange}
                required
              />
            </div>
            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                  fieldErrors.lastName
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-amber-500"
                }`}
                placeholder="Enter your last name"
                value={fields.lastName}
                onChange={handleChange}
                required
              />
            </div>
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    fieldErrors.username
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-amber-500"
                  }`}
                  placeholder="Choose a username"
                  value={fields.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-amber-500"
                  } transition-all duration-200`}
                  placeholder="Create a password"
                  value={fields.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
            <div className="text-sm text-center mt-4 text-gray-500">
              Already have an account?{" "}
              <span
                className="text-amber-500 hover:underline cursor-pointer"
                onClick={() => navigate("/")}
              >
                Sign in
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;
