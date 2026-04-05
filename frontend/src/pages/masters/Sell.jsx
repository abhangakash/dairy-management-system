import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";
import {
  Plus, Search, Trash2, ChevronLeft, ChevronRight,
  X, Save, Store, Calendar, Minus,
  User, Monitor, Package, AlertCircle
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

const getTodayDate = () => new Date().toISOString().split("T")[0];

const EMPTY_ITEM = { product_id: "", selling_unit: 1 };

const validateForm = (form, items) => {
  const errors = {};
  if (!form.distributor_id) errors.distributor_id = "Please select a distributor.";
  if (!form.date) errors.date = "Date is required.";

  const itemErrors = items.map((item) => {
    const e = {};
    if (!item.product_id) e.product_id = "Select a product.";
    if (!item.selling_unit || Number(item.selling_unit) < 1)
      e.selling_unit = "Must be at least 1.";
    return e;
  });

  const hasItemErrors = itemErrors.some((e) => Object.keys(e).length > 0);
  return { errors, itemErrors, hasItemErrors };
};

const Sell = () => {
  const [sells, setSells] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ distributor_id: "", date: getTodayDate() });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [distributorOptions, setDistributorOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
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
        const [distRes, prodRes] = await Promise.all([
          axios.get("/sell/options/distributors"),
          axios.get("/sell/options/products"),
        ]);
        setDistributorOptions(distRes.data || []);
        setProductOptions(prodRes.data || []);
      } catch {
        toast.error("Failed to load options");
      }
    };
    loadOptions();
  }, []);

  const fetchSells = useCallback(async (signal) => {
    setLoading(true);
    try {
      const res = await axios.get("/sell", {
        params: { page, limit, search: debouncedSearch },
        signal,
      });
      setSells(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err.name !== "CanceledError") toast.error("Failed to load sell entries");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSells(controller.signal);
    return () => controller.abort();
  }, [fetchSells]);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const resetForm = () => {
    setForm({ distributor_id: "", date: getTodayDate() });
    setItems([{ ...EMPTY_ITEM }]);
    setErrors({});
    setItemErrors([{}]);
    setShowForm(false);
  };

  // Item row handlers
  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
    setItemErrors((prev) => [...prev, {}]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setItemErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleUnitChange = (index, delta) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = Number(item.selling_unit) + delta;
        if (next < 1) return item;
        return { ...item, selling_unit: next };
      })
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sell entry?")) return;
    try {
      await axios.delete(`/sell/${id}`);
      toast.success("Entry deleted successfully!");
      setPage((prev) => (sells.length === 1 && prev > 1 ? prev - 1 : prev));
      triggerRefresh();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  const handleSave = async () => {
    const { errors: formErrors, itemErrors: iErrors, hasItemErrors } = validateForm(form, items);

    if (Object.keys(formErrors).length > 0 || hasItemErrors) {
      setErrors(formErrors);
      setItemErrors(iErrors);
      return;
    }
    setErrors({});
    setItemErrors(items.map(() => ({})));
    setSubmitting(true);

    try {
      await axios.post("/sell", {
        distributor_id: Number(form.distributor_id),
        date: form.date,
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          selling_unit: Number(item.selling_unit),
        })),
      });
      toast.success(`${items.length} sell ${items.length === 1 ? "entry" : "entries"} saved successfully!`);
      resetForm();
      triggerRefresh();
    } catch {
      toast.error("Failed to save sell entries");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Get selected product ids across all rows (to warn duplicates)
  const selectedProductIds = items.map((i) => i.product_id).filter(Boolean);
  const hasDuplicateProduct = (index) => {
    const id = items[index].product_id;
    if (!id) return false;
    return selectedProductIds.filter((pid) => pid === id).length > 1;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sell</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Record daily sales per distributor</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
              showForm
                ? "bg-white text-slate-600 border border-slate-200"
                : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
            }`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span className="text-sm">{showForm ? "Close" : "Add Sale"}</span>
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">

              {/* Header row: Distributor + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

                <InputGroup label="Date" icon={<Calendar size={14} />} error={errors.date}>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={`form-input-custom ${errors.date ? "border-rose-300 focus:border-rose-400" : ""}`}
                  />
                </InputGroup>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Lines</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Product rows */}
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_180px_40px] gap-3 items-start p-4 bg-slate-50/60 rounded-2xl border border-slate-100"
                  >
                    {/* Product select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                        <Package size={12} /> Product
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, "product_id", e.target.value)}
                        className={`form-input-custom ${
                          itemErrors[index]?.product_id ? "border-rose-300" : hasDuplicateProduct(index) ? "border-amber-300" : ""
                        }`}
                      >
                        <option value="">Select product</option>
                        {productOptions.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {itemErrors[index]?.product_id && (
                        <p className="text-[10px] text-rose-500 font-semibold ml-1">{itemErrors[index].product_id}</p>
                      )}
                      {hasDuplicateProduct(index) && !itemErrors[index]?.product_id && (
                        <div className="flex items-center gap-1 ml-1">
                          <AlertCircle size={10} className="text-amber-500" />
                          <p className="text-[10px] text-amber-500 font-semibold">Duplicate product</p>
                        </div>
                      )}
                    </div>

                    {/* Selling unit stepper */}
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                        Units
                      </label>
                      <div className={`flex items-center bg-white border rounded-[0.875rem] overflow-hidden transition-all ${
                        itemErrors[index]?.selling_unit ? "border-rose-300" : "border-slate-100 focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]"
                      }`}>
                        <button
                          type="button"
                          onClick={() => handleUnitChange(index, -1)}
                          disabled={Number(item.selling_unit) <= 1}
                          className="px-3 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={item.selling_unit}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 1) updateItem(index, "selling_unit", val);
                          }}
                          className="flex-1 text-center bg-transparent outline-none font-black text-slate-800 text-sm py-3"
                          min={1}
                        />
                        <button
                          type="button"
                          onClick={() => handleUnitChange(index, 1)}
                          className="px-3 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {itemErrors[index]?.selling_unit && (
                        <p className="text-[10px] text-rose-500 font-semibold ml-1">{itemErrors[index].selling_unit}</p>
                      )}
                    </div>

                    {/* Remove row button */}
                    <div className="flex items-end pb-0.5 sm:pb-0 sm:mt-6">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add row button */}
              <button
                type="button"
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 font-bold text-sm transition-all"
              >
                <Plus size={16} /> Add Another Product
              </button>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={resetForm} className="w-full sm:w-auto px-8 py-3 text-slate-400 font-bold order-2 sm:order-1">
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-bold order-1 sm:order-2 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Save size={18} />}
                  Save {items.length > 1 ? `${items.length} Entries` : "Entry"}
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
                  <th className="px-6 py-5">Distributor</th>
                  <th className="px-6 py-5">Product</th>
                  <th className="px-6 py-5 text-center">Units Sold</th>
                  <th className="px-6 py-5 text-center">Date</th>
                  <th className="px-6 py-5 text-center">Entered On</th>
                  <th className="px-6 py-5 text-center">By</th>
                  <th className="px-6 py-5 text-center">IP</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {sells.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={9} className="px-8 py-16 text-center text-slate-400 font-medium">
                      No sell entries found.
                    </td>
                  </tr>
                ) : (
                  sells.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-slate-400 text-xs font-bold">{s.id}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold">{s.distributor_name}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{s.product_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-slate-900 text-base">{s.selling_unit}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 text-xs font-medium">{formatDate(s.date)}</td>
                      <td className="px-6 py-4 text-center text-slate-400 text-xs">{formatDateTime(s.en_on)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <User size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{s.en_by || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Monitor size={12} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-medium">{s.ip || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(s.id)}
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
            {sells.length === 0 && !loading ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-400 font-medium border border-slate-100">
                No sell entries found.
              </div>
            ) : (
              sells.map((s) => (
                <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{s.product_name}</h4>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">{s.distributor_name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">#{s.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-50">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Units Sold</span>
                      <span className="text-xl font-black text-indigo-600">{s.selling_unit}</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Date</span>
                      <span className="text-sm font-black text-slate-600">{formatDate(s.date)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
                      <User size={12} className="text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-600 truncate">{s.en_by || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
                      <Monitor size={12} className="text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-400 truncate">{s.ip || "—"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="w-full p-2.5 text-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-xl flex justify-center transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
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
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </Layout>
  );
};

export default Sell;