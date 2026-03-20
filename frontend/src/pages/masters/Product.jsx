import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";
import {
  Plus, Search, Edit3, Trash2,
  Package, ChevronLeft, ChevronRight,
  X, Save, IndianRupee, Tag, Layers
} from "lucide-react";

const Product = () => {

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "",
    selling_price: ""
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // fetch
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get("/products", {
        params: { page, limit, search: debouncedSearch }
      });
      setProducts(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Load failed");
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm({ name: "", category: "", unit: "", selling_price: "" });
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm(p);
    setShowForm(true);
  };

  // ✅ VALIDATION
  const validate = () => {
    let err = {};
    if (!form.name) err.name = "Required";
    if (!form.category) err.category = "Required";
    if (!form.unit) err.unit = "Required";
    if (!form.selling_price) err.selling_price = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ✅ SAVE LOGIC (MAIN PART)
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editingId) {
        const res = await axios.get(`/products/${editingId}`);
        const old = res.data;

        const isOtherChanged =
          old.category !== form.category ||
          old.unit !== form.unit ||
          old.selling_price != form.selling_price;

        if (isOtherChanged) {
          // 🔴 old inactive
          await axios.patch(`/products/status/${editingId}`);

          // 🟢 new product
          await axios.post("/products", form);

          toast.success("New product created, old inactive");
        } else {
          // 🟢 only name update
          await axios.put(`/products/${editingId}`, form);
          toast.success("Product updated");
        }
      } else {
        await axios.post("/products", form);
        toast.success("Product created");
      }

      fetchProducts();
      resetForm();

    } catch {
      toast.error("Save failed");
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);
      toast.success("Deleted");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded">
            {showForm ? "Close" : "Add"}
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white p-6 rounded shadow space-y-4">

            {/* NAME */}
            <div>
              <label>Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            {/* CATEGORY */}
            <div>
              <label>Category *</label>
              <input
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="input"
              />
              {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>

            {/* UNIT */}
            <div>
              <label>Unit *</label>
              <input
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="input"
              />
              {errors.unit && <p className="text-red-500 text-xs">{errors.unit}</p>}
            </div>

            {/* PRICE */}
            <div>
              <label>Price *</label>
              <input
                value={form.selling_price}
                onChange={e => setForm({ ...form, selling_price: e.target.value })}
                className="input"
              />
              {errors.selling_price && <p className="text-red-500 text-xs">{errors.selling_price}</p>}
            </div>

            <button onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded">
              {editingId ? "Update" : "Save"}
            </button>

          </div>
        )}

        {/* SEARCH */}
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
        />

        {/* TABLE */}
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.unit}</td>
                <td>{p.selling_price}</td>
                <td>{p.status}</td>

                <td className="flex gap-2">
                  <button onClick={() => handleEdit(p)}>✏️</button>
                  <button onClick={() => handleDelete(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex gap-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>{page}/{totalPages || 1}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>

      </div>
    </Layout>
  );
};

export default Product;