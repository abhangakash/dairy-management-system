import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const Distributor = () => {
  const [distributors, setDistributors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    shop_name: "",
    mobile: "",
    address: "",
    credit_limit: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/distributors?page=${page}&limit=${limit}&search=${search}`
      );
      setDistributors(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load distributors");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDistributors();
  }, [page, limit, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name required");

    try {
      if (editingId) {
        await axios.put(`/distributors/${editingId}`, form);
        toast.success("Updated successfully");
      } else {
        await axios.post("/distributors", form);
        toast.success("Distributor added");
      }

      setForm({
        name: "",
        shop_name: "",
        mobile: "",
        address: "",
        credit_limit: "",
      });

      setEditingId(null);
      fetchDistributors();
    } catch {
      toast.error("Error saving distributor");
    }
  };

  const handleEdit = (d) => {
    setEditingId(d.id);
    setForm(d);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this distributor?")) return;
    await axios.delete(`/distributors/${id}`);
    toast.success("Archived");
    fetchDistributors();
  };

  const toggleStatus = async (id) => {
    await axios.patch(`/distributors/status/${id}`);
    toast.success("Status updated");
    fetchDistributors();
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Distributor Master
        </h2>

        {/* Search + Limit */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search distributor..."
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

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="text"
              placeholder="Shop Name"
              value={form.shop_name}
              onChange={(e) =>
                setForm({ ...form, shop_name: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="text"
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="number"
              placeholder="Credit Limit"
              value={form.credit_limit}
              onChange={(e) =>
                setForm({ ...form, credit_limit: e.target.value })
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

        {/* List */}
        <div className="space-y-4">

          {loading ? (
            <p>Loading...</p>
          ) : distributors.length === 0 ? (
            <p className="text-gray-500">No distributors found.</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-3">Name</th>
                      <th>Shop</th>
                      <th>Mobile</th>
                      <th>Credit Limit</th>
                      <th>Outstanding</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributors.map((d) => (
                      <tr key={d.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{d.name}</td>
                        <td>{d.shop_name}</td>
                        <td>{d.mobile}</td>
                        <td>₹ {d.credit_limit}</td>
                        <td className="text-red-500 font-medium">
                          ₹ {d.outstanding_balance}
                        </td>
                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              d.status === "active"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="text-center space-x-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="text-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(d.id)}
                            className="text-yellow-600"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="text-red-500"
                          >
                            Archive
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {distributors.map((d) => (
                  <div key={d.id} className="bg-white p-4 rounded-xl shadow space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{d.name}</h3>
                      <span className="text-sm">
                        ₹ {d.outstanding_balance}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      {d.shop_name} • {d.mobile}
                    </p>

                    <p className="text-sm">
                      Credit: ₹ {d.credit_limit}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEdit(d)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(d.id)}
                        className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
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

        {/* Pagination */}
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

export default Distributor;