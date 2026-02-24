import { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";

const Ledger = () => {
  const [entityType, setEntityType] = useState("worker");
  const [entities, setEntities] = useState([]);
  const [entityId, setEntityId] = useState("");
  const [ledger, setLedger] = useState([]);

  // Load entities dynamically
  const fetchEntities = async (type) => {
    if (type === "worker")
      setEntities((await axios.get("/workers?limit=100")).data.data);
    else if (type === "distributor")
      setEntities((await axios.get("/distributors?limit=100")).data.data);
    else if (type === "supplier")
      setEntities((await axios.get("/suppliers?limit=100")).data.data);
    else if (type === "partner")
      setEntities((await axios.get("/partners?limit=100")).data.data);
    else setEntities([]);
  };

  useEffect(() => {
    fetchEntities(entityType);
    setEntityId("");
    setLedger([]);
  }, [entityType]);

  const fetchLedger = async () => {
    if (!entityId) return alert("Select entity");

    const res = await axios.get("/transactions/ledger", {
      params: { entity_type: entityType, entity_id: entityId },
    });

    setLedger(res.data);
  };

  return (
    <Layout>
      <div className="space-y-6">

        <h2 className="text-2xl font-bold text-gray-800">
          Ledger Report
        </h2>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-3 gap-4">

          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="worker">Worker</option>
            <option value="distributor">Distributor</option>
            <option value="supplier">Supplier</option>
            <option value="partner">Partner</option>
          </select>

          <select
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="">Select</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchLedger}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
          >
            View Ledger
          </button>

        </div>

        {/* Ledger List */}
        {ledger.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-3">Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{t.transaction_date}</td>
                      <td
                        className={
                          t.type === "income"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {t.type}
                      </td>
                      <td>{t.category}</td>
                      <td>₹ {t.amount}</td>
                      <td className="font-semibold">
                        ₹ {t.running_balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {ledger.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl shadow space-y-2"
                >
                  <div className="flex justify-between">
                    <span>{t.transaction_date}</span>
                    <span
                      className={
                        t.type === "income"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      ₹ {t.amount}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {t.category}
                  </p>

                  <div className="font-semibold">
                    Balance: ₹ {t.running_balance}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </Layout>
  );
};

export default Ledger;