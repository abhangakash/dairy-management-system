import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";
import {
  Plus, Search, Edit3, Trash2, ChevronLeft, ChevronRight,
  X, Save, Package, Store, IndianRupee
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

const validateForm = (form) => {
  const errors = {};
  if (!form.product_id) errors.product_id = "Product is required.";
  if (!form.distributor_id) errors.distributor_id = "Distributor is required.";
  if (!form.selling_price) {
    errors.selling_price = "Selling price is required.";
  } else if (isNaN(form.selling_price) || Number(form.selling_price) <= 0) {
    errors.selling_price = "Enter a valid price greater than 0.";
  }
  return errors;
};

const EMPTY_FORM = { product_id: "", distributor_id: "", selling_price: "" };

const ProductEntry = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [distributorOptions, setDistributorOptions] = useState([]);
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

  // Load dropdown options once
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [prodRes, distRes] = await Promise.all([
          axios.get("/product-entries/options/products"),
          axios.get("/product-entries/options/distributors"),
        ]);
        setProductOptions(prodRes.data || []);
        setDistributorOptions(distRes.data || []);
      } catch {
        toast.error("Failed to load options");
      }
    };
    loadOptions();
  }, []);

  const fetchEntries = useCallback(async (signal) => {
    setLoading(true);
    try {
      const res = await axios.get("/product-entries", {
        params: { page, limit, search: debouncedSearch },
        signal,
      });
      setEntries(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err.name !== "CanceledError") toast.error("Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEntries(controller.signal);
    return () => controller.abort();
  }, [fetchEntries]);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (entry) => {
    setEditingId(entry.sr_no);
    setForm({
      product_id: String(entry.product_id),
      distributor_id: String(entry.distributor_id),
      selling_price: entry.selling_price,
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (sr_no) => {
    if (!window.confirm("Delete this product entry?")) return;
    try {
      await axios.delete(`/product-entries/${sr_no}`);
      toast.success("Entry deleted successfully!");
      setPage((prev) => (entries.length === 1 && prev > 1 ? prev - 1 : prev));
      triggerRefresh();
    } catch {
      toast.error("Failed to delete entry");
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
      product_id: Number(form.product_id),
      distributor_id: Number(form.distributor_id),
      selling_price: form.selling_price,
    };

    try {
      if (editingId) {
        await axios.put(`/product-entries/${editingId}`, payload);
        toast.success("Entry updated successfully!");
      } else {
        await axios.post("/product-entries", payload);
        toast.success("Entry added successfully!");
      }
      resetForm();
      triggerRefresh();
    } catch {
      toast.error("Failed to save entry");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Product Entry</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Manage product pricing per distributor</p>
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
            <span className="text-sm">{showForm ? "Close" : "Add Entry"}</span>
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                <InputGroup label="Product" icon={<Package size={14} />} error={errors.product_id}>
                  <select
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    className={`form-input-custom ${errors.product_id ? "border-rose-300 focus:border-rose-400" : ""}`}
                  >
                    <option value="">Select product</option>
                    {productOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </InputGroup>

                <InputGroup label="Distributor" icon={<Store size={14} />} error={errors.distributor_id}>
                  <select
                    value={form.distributor_id}
                    onChange={(e) => setForm({ ...form, distributor_id: e.target.value })}
                    className={`form-input-custom ${errors.distributor_id ? "border-rose-300 focus:border-rose-400" : ""}`}
                  >
                    <option value="">Select distributor</option>
                    {distributorOptions.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </InputGroup>

                <InputGroup label="Selling Price" icon={<IndianRupee size={14} />} error={errors.selling_price}>
                  <input
                    type="number"
                    value={form.selling_price}
                    onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                    className={`form-input-custom ${errors.selling_price ? "border-rose-300 focus:border-rose-400" : ""}`}
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
                  <Save size={18} /> {editingId ? "Update Entry" : "Save Entry"}
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
              placeholder="Search by product or distributor..."
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
                  <th className="px-8 py-5">#</th>
                  <th className="px-6 py-5">Product</th>
                  <th className="px-6 py-5">Distributor</th>
                  <th className="px-6 py-5 text-center">Selling Price</th>
                  <th className="px-6 py-5 text-center">Created At</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {entries.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-medium">
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.sr_no} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-slate-400 text-xs font-bold">{e.sr_no}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold">{e.product_name}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{e.distributor_name}</td>
                      <td className="px-6 py-4 text-center font-black text-slate-900">₹{Number(e.selling_price).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-center text-slate-400 text-xs">
                        {new Date(e.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(e)}
                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(e.sr_no)}
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
            {entries.length === 0 && !loading ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-400 font-medium border border-slate-100">
                No entries found.
              </div>
            ) : (
              entries.map((e) => (
                <div key={e.sr_no} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{e.product_name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{e.distributor_name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">#{e.sr_no}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-50">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Selling Price</span>
                      <span className="text-sm font-black text-indigo-600">₹{Number(e.selling_price).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Created</span>
                      <span className="text-sm font-black text-slate-600">
                        {new Date(e.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => handleEdit(e)}
                      className="flex-1 p-2.5 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl flex justify-center transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.sr_no)}
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

export default ProductEntry;