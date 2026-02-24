import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const Worker = () => {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    role: "",
    salary: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/workers?page=${page}&limit=${limit}&search=${search}`
      );
      setWorkers(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load workers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
  }, [page, limit, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Worker name required");

    try {
      if (editingId) {
        await axios.put(`/workers/${editingId}`, form);
        toast.success("Worker updated");
      } else {
        await axios.post("/workers", form);
        toast.success("Worker added");
      }

      setForm({
        name: "",
        mobile: "",
        role: "",
        salary: "",
      });

      setEditingId(null);
      fetchWorkers();
    } catch {
      toast.error("Error saving worker");
    }
  };

  const handleEdit = (worker) => {
    setEditingId(worker.id);
    setForm(worker);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this worker?")) return;

    await axios.delete(`/workers/${id}`);
    toast.success("Worker archived");
    fetchWorkers();
  };

  const toggleStatus = async (id) => {
    await axios.patch(`/workers/status/${id}`);
    toast.success("Status updated");
    fetchWorkers();
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Worker Master
        </h2>

        {/* SEARCH + LIMIT */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search worker..."
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
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
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
              placeholder="Role"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <input
              type="number"
              placeholder="Salary"
              value={form.salary}
              onChange={(e) =>
                setForm({ ...form, salary: e.target.value })
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

        {/* LIST */}
        <div className="space-y-4">

          {loading ? (
            <p>Loading...</p>
          ) : workers.length === 0 ? (
            <p className="text-gray-500">No workers found.</p>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-3">Name</th>
                      <th>Mobile</th>
                      <th>Role</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr key={worker.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{worker.name}</td>
                        <td>{worker.mobile}</td>
                        <td>{worker.role}</td>
                        <td>₹ {worker.salary}</td>
                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              worker.status === "active"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {worker.status}
                          </span>
                        </td>
                        <td className="text-center space-x-2">
                          <button
                            onClick={() => handleEdit(worker)}
                            className="text-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(worker.id)}
                            className="text-yellow-600"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => handleDelete(worker.id)}
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

              {/* MOBILE CARDS */}
              <div className="md:hidden space-y-4">
                {workers.map((worker) => (
                  <div
                    key={worker.id}
                    className="bg-white p-4 rounded-xl shadow space-y-2"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{worker.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          worker.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {worker.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      {worker.role} • {worker.mobile}
                    </p>

                    <p className="font-medium">
                      ₹ {worker.salary}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEdit(worker)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(worker.id)}
                        className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleDelete(worker.id)}
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

export default Worker;