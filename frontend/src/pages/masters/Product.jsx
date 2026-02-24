import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "",
    selling_price: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ERP states
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/products?page=${page}&limit=${limit}&search=${search}`
      );
      setProducts(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load products");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) return toast.error("Product name required");

    try {
      if (editingId) {
        await axios.put(`/products/${editingId}`, form);
        toast.success("Product updated");
      } else {
        await axios.post("/products", form);
        toast.success("Product added");
      }

      setForm({
        name: "",
        category: "",
        unit: "",
        selling_price: "",
      });

      setEditingId(null);
      fetchProducts();
    } catch {
      toast.error("Error saving product");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm(product);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this product?")) return;

    await axios.delete(`/products/${id}`);
    toast.success("Product archived");
    fetchProducts();
  };

  const toggleStatus = async (id) => {
    await axios.patch(`/products/status/${id}`);
    toast.success("Status updated");
    fetchProducts();
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Product Master
        </h2>

        {/* SEARCH + LIMIT */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search product..."
            className="border p-2 rounded-lg w-full md:w-1/3"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="border p-2 rounded-lg w-full md:w-40"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-xl shadow">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <input
              type="text"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="text"
              placeholder="Unit"
              value={form.unit}
              onChange={(e) =>
                setForm({ ...form, unit: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="number"
              placeholder="Selling Price"
              value={form.selling_price}
              onChange={(e) =>
                setForm({ ...form, selling_price: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
            >
              {editingId ? "Update" : "Add"}
            </button>
          </form>
        </div>

        {/* TABLE */}
      {/* PRODUCT LIST */}
        <div className="space-y-4">

        {loading ? (
            <p>Loading...</p>
        ) : products.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
        ) : (
            <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                    <th className="p-3">Product</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.unit}</td>
                        <td>₹ {product.selling_price}</td>

                        <td>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.status === "active"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                        >
                            {product.status}
                        </span>
                        </td>

                        <td className="text-center space-x-2">
                        <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => toggleStatus(product.id)}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded"
                        >
                            Disable
                        </button>

                        <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded"
                        >
                            Archive
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden space-y-4">
                {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white p-4 rounded-xl shadow space-y-2"
                >
                    <div className="flex justify-between">
                    <h3 className="font-semibold">{product.name}</h3>
                    <span
                        className={`px-2 py-1 rounded-full text-xs ${
                        product.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                    >
                        {product.status}
                    </span>
                    </div>

                    <p className="text-sm text-gray-500">
                    {product.category} • {product.unit}
                    </p>

                    <p className="font-medium">
                    ₹ {product.selling_price}
                    </p>

                    <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded text-sm"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => toggleStatus(product.id)}
                        className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm"
                    >
                        Toggle
                    </button>

                    <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500 text-white py-1 rounded text-sm"
                    >
                        Archive
                    </button>
                    </div>
                </div>
                ))}
            </div>
            </>
        )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Product;