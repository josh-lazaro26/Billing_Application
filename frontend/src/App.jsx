import { createBrowserRouter, RouterProvider } from "react-router-dom";

import {
  LoginRoute,
  RegistrationRoute,
  ProductRoute,
  UserProductRoute,
  BillingRoute,
} from "./Routes/AdminRoutes/AdminRoutes";

const routers = createBrowserRouter([
  LoginRoute,
  RegistrationRoute,
  ProductRoute,
  UserProductRoute,
  BillingRoute,
]);

function App() {
  return <RouterProvider router={routers} />;
}

export default App;
