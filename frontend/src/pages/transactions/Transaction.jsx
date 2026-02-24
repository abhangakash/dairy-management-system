import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";

const Transaction = () => {
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    payment_source: "business",
    partner_id: "",
    entity_type: "general",
    entity_id: "",
    description: "",
    transaction_date: "",
  });

  const [partners, setPartners] = useState([]);
  const [entities, setEntities] = useState([]);

  // Load partners
  const fetchPartners = async () => {
    const res = await axios.get("/partners?limit=100");
    setPartners(res.data.data);
  };

  // Load dynamic entity list
  const fetchEntities = async (type) => {
    if (type === "worker")
      setEntities((await axios.get("/workers?limit=100")).data.data);
    else if (type === "distributor")
      setEntities((await axios.get("/distributors?limit=100")).data.data);
    else if (type === "supplier")
      setEntities((await axios.get("/suppliers?limit=100")).data.data);
    else
      setEntities([]);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    fetchEntities(form.entity_type);
  }, [form.entity_type]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount) return toast.error("Amount required");
    if (!form.transaction_date) return toast.error("Date required");

    try {
      await axios.post("/transactions", form);
      toast.success("Transaction Recorded");

      setForm({
        type: "expense",
        category: "",
        amount: "",
        payment_source: "business",
        partner_id: "",
        entity_type: "general",
        entity_id: "",
        description: "",
        transaction_date: "",
      });
    } catch {
      toast.error("Error saving transaction");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Transaction Entry
        </h2>

        <div className="bg-white p-6 rounded-xl shadow">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >

            {/* Type */}
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              className="border p-2 rounded-lg"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            {/* Category */}
            <input
              type="text"
              placeholder="Category (salary/raw_material/etc)"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            {/* Amount */}
            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            {/* Date */}
            <input
              type="date"
              value={form.transaction_date}
              onChange={(e) =>
                setForm({ ...form, transaction_date: e.target.value })
              }
              className="border p-2 rounded-lg"
            />

            {/* Payment Source */}
            <select
              value={form.payment_source}
              onChange={(e) =>
                setForm({ ...form, payment_source: e.target.value })
              }
              className="border p-2 rounded-lg"
            >
              <option value="business">Business</option>
              <option value="partner">Partner</option>
            </select>

            {/* Partner Dropdown */}
            {form.payment_source === "partner" && (
              <select
                value={form.partner_id}
                onChange={(e) =>
                  setForm({ ...form, partner_id: e.target.value })
                }
                className="border p-2 rounded-lg"
              >
                <option value="">Select Partner</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Entity Type */}
            <select
              value={form.entity_type}
              onChange={(e) =>
                setForm({ ...form, entity_type: e.target.value })
              }
              className="border p-2 rounded-lg"
            >
              <option value="general">General</option>
              <option value="worker">Worker</option>
              <option value="distributor">Distributor</option>
              <option value="supplier">Supplier</option>
              <option value="partner">Partner</option>
            </select>

            {/* Entity Dropdown */}
            {form.entity_type !== "general" && (
              <select
                value={form.entity_id}
                onChange={(e) =>
                  setForm({ ...form, entity_id: e.target.value })
                }
                className="border p-2 rounded-lg"
              >
                <option value="">Select</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            )}

            {/* Description */}
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border p-2 rounded-lg md:col-span-2 lg:col-span-3"
            />

            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 md:col-span-2 lg:col-span-3"
            >
              Save Transaction
            </button>

          </form>
        </div>

      </div>
    </Layout>
  );
};

export default Transaction;