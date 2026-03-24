import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";
import {
  Plus, Search, Edit3, Trash2, ChevronLeft, ChevronRight,
  X, Save, User, Phone, IndianRupee,
  ToggleLeft, ToggleRight
} from "lucide-react";

const InputGroup = React.memo(({ label, icon, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
      {icon} {label}
    </label>
    {children}
    {error && <p className="text-[10px] text-rose-500 font-semibold ml-1">{error}</p>}
  </div>
));

const StatusBadge = React.memo(({ status }) => (
  <div className={`flex items-center justify-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg w-fit ${
    status === "active" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
  }`}>
    <div className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
    {status}
  </div>
));

const validateForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Partner name is required.";
  if (form.mobile && !/^\d{10}$/.test(form.mobile.trim()))
    errors.mobile = "Enter a valid 10-digit mobile number.";
  if (!form.investment_amount) {
    errors.investment_amount = "Investment amount is required.";
  } else if (isNaN(form.investment_amount) || Number(form.investment_amount) <= 0) {
    errors.investment_amount = "Enter a valid amount greater than 0.";
  }
  return errors;
};

const EMPTY_FORM = { name: "", mobile: "", investment_amount: "" };

const Partner = () => {
  const [partners, setPartners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchPartners = useCallback(async (signal) => {
    setLoading(true);
    try {
      const res = await axios.get("/partners", {
        params: { page, limit, search: debouncedSearch },
        signal,
      });
      setPartners(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err.name !== "CanceledError") toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPartners(controller.signal);
    return () => controller.abort();
  }, [fetchPartners]);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (partner) => {
    setEditingId(partner.id);
    setForm({
      name: partner.name,
      mobile: partner.mobile || "",
      investment_amount: partner.investment_amount,
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this partner?")) return;
    try {
      await axios.delete(`/partners/${id}`);
      toast.success("Partner archived successfully!");
      setPage((prev) => (partners.length === 1 && prev > 1 ? prev - 1 : prev));
      triggerRefresh();
    } catch {
      toast.error("Failed to archive partner");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`/partners/status/${id}`);
      toast.success("Status updated!");
      triggerRefresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const handleSave = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const payload = {
      name: form.name.trim(),
      mobile: form.mobile.trim() || null,
      investment_amount: form.investment_amount,
    };

    try {
      if (editingId) {
        await axios.put(`/partners/${editingId}`, payload);
        toast.success("Partner updated successfully!");
      } else {
        await axios.post("/partners", payload);
        toast.success("Partner added successfully!");
      }
      resetForm();
      triggerRefresh();
    } catch {
      toast.error("Failed to save partner");
    }
  };

  // Total investment across current page — useful summary
  const totalInvestment = useMemo(
    () => partners.reduce((sum, p) => sum + Number(p.investment_amount || 0), 0),
    [partners]
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Partner Master</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Manage your business partners and investments</p>
          </div>
          <button
            onClick={() => { editingId ? resetForm() : setShowForm(!showForm); }}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
              showForm
                ? "bg-white text-slate-600 border border-slate-200"
                : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
            }`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span className="text-sm">{showForm ? "Close" : "Add Partner"}</span>
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

                <InputGroup label="Partner Name" icon={<User size={14} />} error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`form-input-custom ${errors.name ? "border-rose-300" : ""}`}
                    placeholder="Enter name"
                  />
                </InputGroup>

                <InputGroup label="Mobile (optional)" icon={<Phone size={14} />} error={errors.mobile}>
                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className={`form-input-custom ${errors.mobile ? "border-rose-300" : ""}`}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </InputGroup>

                <InputGroup label="Investment Amount" icon={<IndianRupee size={14} />} error={errors.investment_amount}>
                  <input
                    type="number"
                    value={form.investment_amount}
                    onChange={(e) => setForm({ ...form, investment_amount: e.target.value })}
                    className={`form-input-custom ${errors.investment_amount ? "border-rose-300" : ""}`}
                    placeholder="0.00"
                  />
                </InputGroup>

              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={resetForm} className="w-full sm:w-auto px-8 py-3 text-slate-400 font-bold order-2 sm:order-1">
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-bold order-1 sm:order-2 hover:bg-indigo-700 transition-colors"
                >
                  <Save size={18} /> {editingId ? "Update Partner" : "Save Partner"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
            className="bg-white border-r-8 border-transparent rounded-2xl py-3.5 px-4 shadow-sm font-bold text-slate-600 text-sm outline-none cursor-pointer"
          >
            {[10, 20, 50].map((v) => <option key={v} value={v}>Show {v}</option>)}
          </select>
        </div>

        {/* SUMMARY BANNER */}
        {partners.length > 0 && (
          <div className="flex items-center gap-3 px-6 py-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <IndianRupee size={16} className="text-indigo-500" />
            <span className="text-sm font-bold text-indigo-700">
              Total Investment (this page):&nbsp;
              ₹{totalInvestment.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {/* DATA CONTAINER */}
        <div className="relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            </div>
          )}

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <tr>
                  <th className="px-8 py-5">Partner</th>
                  <th className="px-6 py-5">Mobile</th>
                  <th className="px-6 py-5 text-center">Investment</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {partners.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-medium">
                      No partners found.
                    </td>
                  </tr>
                ) : (
                  partners.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-bold text-slate-800">{p.name}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {p.mobile || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-slate-900">
                        ₹{Number(p.investment_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusBadge status={p.status || "active"} />
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => toggleStatus(p.id)}
                            title={p.status === "active" ? "Disable" : "Enable"}
                            className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-100 transition-all"
                          >
                            {p.status === "active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {partners.length === 0 && !loading ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-400 font-medium border border-slate-100">
                No partners found.
              </div>
            ) : (
              partners.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{p.name}</h4>
                      {p.mobile && (
                        <span className="text-[10px] font-bold text-slate-400">{p.mobile}</span>
                      )}
                    </div>
                    <StatusBadge status={p.status || "active"} />
                  </div>

                  <div className="flex flex-col items-center gap-0.5 py-3 border-y border-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Investment</span>
                    <span className="text-lg font-black text-indigo-600">
                      ₹{Number(p.investment_amount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex-1 p-2.5 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl flex justify-center transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => toggleStatus(p.id)}
                      className="flex-1 p-2.5 text-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-xl flex justify-center transition-all"
                    >
                      {p.status === "active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex-1 p-2.5 text-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-xl flex justify-center transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest order-2 sm:order-1">
            Total Records: {total}
          </p>
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100 order-1 sm:order-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 disabled:opacity-20 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 text-xs font-bold text-slate-600">Page {page} / {totalPages || 1}</div>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 disabled:opacity-20 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </div>

      <style jsx>{`
        .form-input-custom {
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 0.875rem;
          padding: 0.75rem 1rem;
          outline: none;
          transition: all 0.2s;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .form-input-custom:focus {
          background-color: white;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
        }
      `}</style>
    </Layout>
  );
};

export default Partner;