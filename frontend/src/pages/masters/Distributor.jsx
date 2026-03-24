import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";
import {
  Plus, Search, Edit3, Trash2, ChevronLeft, ChevronRight,
  X, Save, User, Phone, MapPin, IndianRupee, Store,
  ToggleLeft, ToggleRight, AlertCircle, Navigation
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
  if (!form.name.trim()) errors.name = "Name is required.";
  if (form.mobile && !/^\d{10}$/.test(form.mobile.trim()))
    errors.mobile = "Enter a valid 10-digit mobile number.";
  if (form.credit_limit && (isNaN(form.credit_limit) || Number(form.credit_limit) < 0))
    errors.credit_limit = "Enter a valid credit limit (0 or more).";
  if (form.distance && (isNaN(form.distance) || Number(form.distance) < 0))
    errors.distance = "Enter a valid distance (0 or more).";
  return errors;
};

const EMPTY_FORM = { name: "", shop_name: "", mobile: "", address: "", credit_limit: "", distance: "" };

const Distributor = () => {
  const [distributors, setDistributors] = useState([]);
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

  const fetchDistributors = useCallback(async (signal) => {
    setLoading(true);
    try {
      const res = await axios.get("/distributors", {
        params: { page, limit, search: debouncedSearch },
        signal,
      });
      setDistributors(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err.name !== "CanceledError") toast.error("Failed to load distributors");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDistributors(controller.signal);
    return () => controller.abort();
  }, [fetchDistributors]);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (d) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      shop_name: d.shop_name || "",
      mobile: d.mobile || "",
      address: d.address || "",
      credit_limit: d.credit_limit ?? "",
      distance: d.distance ?? "",
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this distributor?")) return;
    try {
      await axios.delete(`/distributors/${id}`);
      toast.success("Distributor archived successfully!");
      setPage((prev) => (distributors.length === 1 && prev > 1 ? prev - 1 : prev));
      triggerRefresh();
    } catch {
      toast.error("Failed to archive distributor");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`/distributors/status/${id}`);
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
      shop_name: form.shop_name.trim() || null,
      mobile: form.mobile.trim() || null,
      address: form.address.trim() || null,
      credit_limit: form.credit_limit !== "" ? form.credit_limit : null,
      distance: form.distance !== "" ? form.distance : null,
    };

    try {
      if (editingId) {
        await axios.put(`/distributors/${editingId}`, payload);
        toast.success("Distributor updated successfully!");
      } else {
        await axios.post("/distributors", payload);
        toast.success("Distributor added successfully!");
      }
      resetForm();
      triggerRefresh();
    } catch {
      toast.error("Failed to save distributor");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Distributor Master</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Manage your distributors and credit limits</p>
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
            <span className="text-sm">{showForm ? "Close" : "Add Distributor"}</span>
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <InputGroup label="Name" icon={<User size={14} />} error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`form-input-custom ${errors.name ? "border-rose-300" : ""}`}
                    placeholder="Contact person name"
                  />
                </InputGroup>

                <InputGroup label="Shop Name (optional)" icon={<Store size={14} />} error={errors.shop_name}>
                  <input
                    type="text"
                    value={form.shop_name}
                    onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                    className="form-input-custom"
                    placeholder="Business / shop name"
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
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <InputGroup label="Address (optional)" icon={<MapPin size={14} />} error={errors.address}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="form-input-custom"
                    placeholder="Full address"
                  />
                </InputGroup>

                <InputGroup label="Credit Limit (optional)" icon={<IndianRupee size={14} />} error={errors.credit_limit}>
                  <input
                    type="number"
                    value={form.credit_limit}
                    onChange={(e) => setForm({ ...form, credit_limit: e.target.value })}
                    className={`form-input-custom ${errors.credit_limit ? "border-rose-300" : ""}`}
                    placeholder="0.00"
                  />
                </InputGroup>

                <InputGroup label="Distance in KM (optional)" icon={<Navigation size={14} />} error={errors.distance}>
                  <input
                    type="number"
                    value={form.distance}
                    onChange={(e) => setForm({ ...form, distance: e.target.value })}
                    className={`form-input-custom ${errors.distance ? "border-rose-300" : ""}`}
                    placeholder="0.0"
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
                  <Save size={18} /> {editingId ? "Update Distributor" : "Save Distributor"}
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
                  <th className="px-8 py-5">Name</th>
                  <th className="px-6 py-5">Shop</th>
                  <th className="px-6 py-5">Mobile</th>
                  <th className="px-6 py-5 text-center">Distance</th>
                  <th className="px-6 py-5 text-center">Credit Limit</th>
                  <th className="px-6 py-5 text-center">Outstanding</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {distributors.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-16 text-center text-slate-400 font-medium">
                      No distributors found.
                    </td>
                  </tr>
                ) : (
                  distributors.map((d) => {
                    const overLimit = d.credit_limit && Number(d.outstanding_balance) > Number(d.credit_limit);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="font-bold text-slate-800">{d.name}</div>
                          {d.address && <div className="text-[11px] text-slate-400 mt-0.5">{d.address}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {d.shop_name
                            ? <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold">{d.shop_name}</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {d.mobile || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {d.distance != null
                            ? <span className="text-sm font-bold text-slate-700">{d.distance} km</span>
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700">
                          {d.credit_limit != null
                            ? `₹${Number(d.credit_limit).toLocaleString("en-IN")}`
                            : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${overLimit ? "text-rose-600" : "text-slate-700"}`}>
                            ₹{Number(d.outstanding_balance || 0).toLocaleString("en-IN")}
                          </span>
                          {overLimit && (
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <AlertCircle size={11} className="text-rose-500" />
                              <span className="text-[10px] text-rose-500 font-bold">Over limit</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <StatusBadge status={d.status || "active"} />
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(d)}
                              className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => toggleStatus(d.id)}
                              title={d.status === "active" ? "Disable" : "Enable"}
                              className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-100 transition-all"
                            >
                              {d.status === "active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {distributors.length === 0 && !loading ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-400 font-medium border border-slate-100">
                No distributors found.
              </div>
            ) : (
              distributors.map((d) => {
                const overLimit = d.credit_limit && Number(d.outstanding_balance) > Number(d.credit_limit);
                return (
                  <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-base leading-tight">{d.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {d.shop_name && <span className="text-[10px] font-bold text-slate-400 uppercase">{d.shop_name}</span>}
                          {d.shop_name && d.mobile && <span className="text-[10px] font-bold text-slate-400">•</span>}
                          {d.mobile && <span className="text-[10px] font-bold text-slate-400">{d.mobile}</span>}
                        </div>
                        {d.address && <div className="text-[10px] text-slate-400">{d.address}</div>}
                      </div>
                      <StatusBadge status={d.status || "active"} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Distance</span>
                        <span className="text-sm font-black text-slate-700">
                          {d.distance != null ? `${d.distance} km` : "—"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Credit Limit</span>
                        <span className="text-sm font-black text-slate-700">
                          {d.credit_limit != null ? `₹${Number(d.credit_limit).toLocaleString("en-IN")}` : "—"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Outstanding</span>
                        <span className={`text-sm font-black ${overLimit ? "text-rose-600" : "text-slate-700"}`}>
                          ₹{Number(d.outstanding_balance || 0).toLocaleString("en-IN")}
                        </span>
                        {overLimit && <span className="text-[9px] text-rose-500 font-bold">Over limit</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleEdit(d)}
                        className="flex-1 p-2.5 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl flex justify-center transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => toggleStatus(d.id)}
                        className="flex-1 p-2.5 text-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-xl flex justify-center transition-all"
                      >
                        {d.status === "active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="flex-1 p-2.5 text-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-xl flex justify-center transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
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

export default Distributor;