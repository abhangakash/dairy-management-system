import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Product from "./pages/masters/Product";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
            
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Product />
              </ProtectedRoute>
            }
            
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;