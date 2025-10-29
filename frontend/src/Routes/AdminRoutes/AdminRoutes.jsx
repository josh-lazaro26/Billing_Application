import LoginPage from "../../Pages/Login/LoginPage";
import ProductPage from "../../Pages/Products/ProductPage";
import RegistrationPage from "../../Pages/Registration/RegistrationPage";
import ProtectedRoute from "../../Components/ServiceLayer/ProtectionRoute/ProtectionRoute";
import UserProductPage from "../../Pages/UserProducts/UserProductPage";
import BillingPage from "../../Pages/Billing/BillingPage";

const LoginRoute = {
  path: "/",
  element: <LoginPage />,
};

const RegistrationRoute = {
  path: "/registration",
  element: <RegistrationPage />,
};

const UserProductRoute = {
  path: "/user/products",
  element: <UserProductPage />,
};

const ProductRoute = {
  path: "/manage/products",
  element: (
    <ProtectedRoute>
      <ProductPage />
    </ProtectedRoute>
  ),
};

const BillingRoute = {
  path: "/user/billing-cart",
  element: <BillingPage />,
};

export {
  LoginRoute,
  RegistrationRoute,
  ProductRoute,
  UserProductRoute,
  BillingRoute,
};
