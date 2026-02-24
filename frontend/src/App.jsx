import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Product from "./pages/masters/Product";
import Worker from "./pages/masters/Worker";
import Distributor from "./pages/masters/Distributor";
import Partner from "./pages/masters/Partner";
import Transaction from "./pages/transactions/Transaction";
import TransactionList from "./pages/transactions/TransactionList";
import DailyReport from "./pages/reports/DailyReport";
import MonthlyReport from "./pages/reports/MonthlyReport";
import ProfitLoss from "./pages/reports/ProfitLoss";
import Ledger from "./pages/reports/Ledger";


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
          <Route
            path="/workers"
            element={
              <ProtectedRoute>
                <Worker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributors"
            element={
              <ProtectedRoute>
                <Distributor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partners"
            element={
              <ProtectedRoute>
                <Partner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/list"
            element={
              <ProtectedRoute>
                <TransactionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/daily"
            element={
              <ProtectedRoute>
                <DailyReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/monthly"
            element={
              <ProtectedRoute>
                <MonthlyReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/profit-loss"
            element={
              <ProtectedRoute>
                <ProfitLoss />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/ledger"
            element={
              <ProtectedRoute>
                <Ledger />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;