import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";
import {
  Plus, Search, Edit3, Trash2,
  Package, ChevronLeft, ChevronRight,
  X, Save, IndianRupee, Tag, Layers
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
    status === 1 || status === "1" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
  }`}>
    <div className={`w-1.5 h-1.5 rounded-full ${status === 1 || status === "1" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
    {status === 1 || status === "1" ? "active" : "inactive"}
  </div>
));

const ActionButtons = React.memo(({ onEdit, onDelete, isMobile = false }) => (
  <div className={`flex items-center gap-2 ${isMobile ? "w-full" : "justify-end"}`}>
    <button
      onClick={onEdit}
      className={`p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all ${isMobile ? "flex-1 bg-indigo-50/50 flex justify-center" : ""}`}
    >
      <Edit3 size={18} />
    </button>
    <button
      onClick={onDelete}
      className={`p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all ${isMobile ? "flex-1 bg-rose-50/50 flex justify-center" : ""}`}
    >
      <Trash2 size={18} />
    </button>
  </div>
));

const validateForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (!form.unit.trim()) errors.unit = "Unit is required.";
  if (!form.price) {
    errors.price = "Price is required.";
  } else if (isNaN(form.price) || Number(form.price) <= 0) {
    errors.price = "Enter a valid price greater than 0.";
  }
  return errors;
};

const EMPTY_FORM = { name: "", category: "", unit: "", price: "" };

const RawMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalMaterial, setOriginalMaterial] = useState(null);
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

  const fetchMaterials = useCallback(async (signal) => {
    setLoading(true);
    try {
      const res = await axios.get("/raw-materials", {
        params: { page, limit, search: debouncedSearch },
        signal,
      });
      setMaterials(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err.name !== "CanceledError") toast.error("Failed to load raw materials");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMaterials(controller.signal);
    return () => controller.abort();
  }, [fetchMaterials]);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
    setOriginalMaterial(null);
    setShowForm(false);
  };

  const handleEdit = (m) => {
    setEditingId(m.id);
    setOriginalMaterial(m);
    setForm({
      name: m.name,
      category: m.category,
      unit: m.unit,
      price: m.price,
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?")) return;
    try {
      await axios.delete(`/raw-materials/${id}`);
      toast.success("Raw material archived successfully!");
      setPage((prev) => (materials.length === 1 && prev > 1 ? prev - 1 : prev));
      triggerRefresh();
    } catch {
      toast.error("Failed to delete raw material");
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
      category: form.category.trim(),
      unit: form.unit.trim(),
      price: form.price,
    };

    try {
      if (editingId) {
        const orig = originalMaterial;
        const nameChanged = payload.name !== orig.name;
        const categoryChanged = payload.category !== orig.category.trim();
        const unitChanged = payload.unit !== orig.unit.trim();
        const priceChanged = String(payload.price) !== String(orig.price);

        const nothingChanged = !nameChanged && !categoryChanged && !unitChanged && !priceChanged;
        const onlyNameChanged = nameChanged && !categoryChanged && !unitChanged && !priceChanged;

        if (nothingChanged) {
          toast("No changes detected.", { icon: "ℹ️" });
          return;
        }

        if (onlyNameChanged) {
          await axios.put(`/raw-materials/${editingId}`, payload);
          toast.success("Raw material name updated successfully!");
        } else {
          await axios.patch(`/raw-materials/status/${editingId}`);
          await axios.post("/raw-materials", payload);
          toast.success("Old entry archived. New raw material created.");
        }
      } else {
        await axios.post("/raw-materials", payload);
        toast.success("Raw material added successfully!");
      }

      resetForm();
      triggerRefresh();
    } catch {
      toast.error("Failed to save raw material");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Raw Material Master</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Manage your raw materials and pricing</p>
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
            <span className="text-sm">{showForm ? "Close" : "Add Raw Material"}</span>
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <InputGroup label="Name" icon={<Tag size={14} />} error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`form-input-custom ${errors.name ? "border-rose-300 focus:border-rose-400" : ""}`}
                    placeholder="Enter name"
                  />
                </InputGroup>

                <InputGroup label="Category" icon={<Layers size={14} />} error={errors.category}>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={`form-input-custom ${errors.category ? "border-rose-300 focus:border-rose-400" : ""}`}
                    placeholder="e.g. Chemical"
                  />
                </InputGroup>

                <InputGroup label="Unit" icon={<Package size={14} />} error={errors.unit}>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className={`form-input-custom ${errors.unit ? "border-rose-300 focus:border-rose-400" : ""}`}
                    placeholder="Litre / KG"
                  />
                </InputGroup>

                <InputGroup label="Price" icon={<IndianRupee size={14} />} error={errors.price}>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={`form-input-custom ${errors.price ? "border-rose-300 focus:border-rose-400" : ""}`}
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
                  <Save size={18} /> {editingId ? "Update Material" : "Save Material"}
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
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5 text-center">Unit</th>
                  <th className="px-6 py-5 text-center">Price</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {materials.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-medium">
                      No raw materials found.
                    </td>
                  </tr>
                ) : (
                  materials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-bold text-slate-800">{m.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold">{m.category}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500">{m.unit}</td>
                      <td className="px-6 py-4 text-center font-black text-slate-900">₹{Number(m.price).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusBadge status={m.status} />
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <ActionButtons
                          onEdit={() => handleEdit(m)}
                          onDelete={() => handleDelete(m.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-4">
            {materials.length === 0 && !loading ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-400 font-medium border border-slate-100">
                No raw materials found.
              </div>
            ) : (
              materials.map((m) => (
                <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base leading-tight">{m.name}</h4>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{m.category}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">•</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{m.unit}</span>
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="py-3 border-y border-slate-50 flex justify-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Price</span>
                      <span className="text-sm font-black text-indigo-600">₹{Number(m.price).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <ActionButtons
                    onEdit={() => handleEdit(m)}
                    onDelete={() => handleDelete(m.id)}
                    isMobile
                  />
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

export default RawMaterial;