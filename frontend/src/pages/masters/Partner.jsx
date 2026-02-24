import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const Partner = () => {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    investment_amount: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/partners?page=${page}&limit=${limit}&search=${search}`
      );
      setPartners(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load partners");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, [page, limit, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Partner name required");

    try {
      if (editingId) {
        await axios.put(`/partners/${editingId}`, form);
        toast.success("Partner updated");
      } else {
        await axios.post("/partners", form);
        toast.success("Partner added");
      }

      setForm({
        name: "",
        mobile: "",
        investment_amount: "",
      });

      setEditingId(null);
      fetchPartners();
    } catch {
      toast.error("Error saving partner");
    }
  };

  const handleEdit = (partner) => {
    setEditingId(partner.id);
    setForm(partner);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this partner?")) return;
    await axios.delete(`/partners/${id}`);
    toast.success("Partner archived");
    fetchPartners();
  };

  const toggleStatus = async (id) => {
    await axios.patch(`/partners/status/${id}`);
    toast.success("Status updated");
    fetchPartners();
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Partner Master
        </h2>

        {/* SEARCH + LIMIT */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Search partner..."
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
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              type="text"
              placeholder="Partner Name"
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
              type="number"
              placeholder="Investment Amount"
              value={form.investment_amount}
              onChange={(e) =>
                setForm({ ...form, investment_amount: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 md:col-span-3"
            >
              {editingId ? "Update Partner" : "Add Partner"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="space-y-4">

          {loading ? (
            <p>Loading...</p>
          ) : partners.length === 0 ? (
            <p className="text-gray-500">No partners found.</p>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="p-3">Name</th>
                      <th>Mobile</th>
                      <th>Investment</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{partner.name}</td>
                        <td>{partner.mobile}</td>
                        <td>₹ {partner.investment_amount}</td>

                        <td>
                          <span
                            className={`px-3 py-1 text-xs font-medium border p-2 rounded-lg ${
                              partner.status === "active"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {partner.status}
                          </span>
                        </td>

                        <td className="text-center space-x-2">
                          <button
                            onClick={() => handleEdit(partner)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 border p-2 rounded-lg"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => toggleStatus(partner.id)}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 border p-2 rounded-lg"
                          >
                            Disable
                          </button>

                          <button
                            onClick={() => handleDelete(partner.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-600 border p-2 rounded-lg"
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
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="bg-white p-4 rounded-xl shadow space-y-2"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{partner.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          partner.status === "active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      {partner.mobile}
                    </p>

                    <p className="font-medium">
                      Investment: ₹ {partner.investment_amount}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEdit(partner)}
                        className="flex-1 bg-blue-500 text-white py-1 rounded text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleStatus(partner.id)}
                        className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm"
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => handleDelete(partner.id)}
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

export default Partner;