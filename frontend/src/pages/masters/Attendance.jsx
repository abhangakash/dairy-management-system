import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../api/axios";
import Layout from "../../components/layout/Layout";
import toast from "react-hot-toast";
import {
  Plus, Search, Trash2, ChevronLeft, ChevronRight,
  X, Save, Calendar, User, Monitor, CheckCircle2,
  Clock, XCircle, Users, Filter,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  present: {
    label: "Present",
    short: "P",
    icon: <CheckCircle2 size={14} />,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    activeBg: "bg-emerald-500",
    activeText: "text-white",
    ring: "ring-emerald-400",
    dot: "bg-emerald-500",
  },
  half_day: {
    label: "Half Day",
    short: "H",
    icon: <Clock size={14} />,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    activeBg: "bg-amber-500",
    activeText: "text-white",
    ring: "ring-amber-400",
    dot: "bg-amber-500",
  },
  absent: {
    label: "Absent",
    short: "A",
    icon: <XCircle size={14} />,
    bg: "bg-rose-50",
    text: "text-rose-500",
    border: "border-rose-200",
    activeBg: "bg-rose-500",
    activeText: "text-white",
    ring: "ring-rose-400",
    dot: "bg-rose-500",
  },
};

const STATUS_KEYS = Object.keys(STATUS_CONFIG);

const getTodayDate = () => new Date().toISOString().split("T")[0];

// ─── Small helpers ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const StatusToggle = ({ value, onChange, error }) => (
  <div className="flex gap-1.5">
    {STATUS_KEYS.map((key) => {
      const cfg = STATUS_CONFIG[key];
      const active = value === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          title={cfg.label}
          className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-black border transition-all active:scale-95
            ${active
              ? `${cfg.activeBg} ${cfg.activeText} border-transparent shadow-sm`
              : `bg-white ${cfg.text} ${cfg.border} hover:${cfg.bg}`
            }
            ${error ? "border-rose-300" : ""}
          `}
        >
          {cfg.icon}
          <span className="hidden sm:inline">{cfg.label}</span>
          <span className="sm:hidden">{cfg.short}</span>
        </button>
      );
    })}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Attendance = () => {
  // ── Form state
  const [showForm, setShowForm]         = useState(false);
  const [formDate, setFormDate]         = useState(getTodayDate());
  const [workerOptions, setWorkerOptions] = useState([]);
  const [entries, setEntries]           = useState([]); // [{worker_id, name, status}]
  const [entryErrors, setEntryErrors]   = useState([]);
  const [dateError, setDateError]       = useState("");
  const [submitting, setSubmitting]     = useState(false);

  // ── Table state
  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDate, setFilterDate]     = useState("");
  const [page, setPage]                 = useState(1);
  const [limit, setLimit]               = useState(10);
  const [total, setTotal]               = useState(0);
  const [refreshKey, setRefreshKey]     = useState(0);

  // ── Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Load worker options once
  useEffect(() => {
    axios
      .get("/attendance/options/workers")
      .then((res) => setWorkerOptions(res.data || []))
      .catch(() => toast.error("Failed to load workers"));
  }, []);

  // ── Fetch records
  const fetchRecords = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const res = await axios.get("/attendance", {
          params: { page, limit, search: debouncedSearch, date: filterDate },
          signal,
        });
        setRecords(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        if (err.name !== "CanceledError") toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, debouncedSearch, filterDate, refreshKey]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    fetchRecords(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchRecords]);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // ── Open form: pre-populate all workers with "present" default
  const openForm = () => {
    const pre = workerOptions.map((w) => ({
      worker_id: String(w.id),
      name: w.name,
      status: "present",
    }));
    setEntries(pre);
    setEntryErrors(pre.map(() => ""));
    setDateError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEntries([]);
    setEntryErrors([]);
    setDateError("");
  };

  // ── Update a single entry's status
  const updateStatus = (index, status) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status } : e))
    );
  };

  // ── Quick-set all to one status
  const setAllStatus = (status) => {
    setEntries((prev) => prev.map((e) => ({ ...e, status })));
  };

  // ── Validate
  const validate = () => {
    let valid = true;
    const errs = entries.map((e) => {
      if (!e.status || !STATUS_KEYS.includes(e.status)) {
        valid = false;
        return "Select a status";
      }
      return "";
    });
    setEntryErrors(errs);

    if (!formDate) {
      setDateError("Date is required");
      valid = false;
    } else {
      setDateError("");
    }

    if (entries.length === 0) {
      toast.error("No workers to mark attendance for");
      valid = false;
    }

    return valid;
  };

  // ── Submit
  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await axios.post("/attendance", {
        date_on: formDate,
        entries: entries.map(({ worker_id, status }) => ({ worker_id, status })),
      });
      toast.success(`Attendance saved for ${entries.length} worker(s)!`);
      closeForm();
      triggerRefresh();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save attendance";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      await axios.delete(`/attendance/${id}`);
      toast.success("Record deleted!");
      setPage((p) => (records.length === 1 && p > 1 ? p - 1 : p));
      triggerRefresh();
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  // ── Summary counts for form header
  const summaryCounts = useMemo(() => {
    const counts = { present: 0, half_day: 0, absent: 0 };
    entries.forEach((e) => { if (counts[e.status] !== undefined) counts[e.status]++; });
    return counts;
  }, [entries]);

  // ── Date formatter
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const fmtDt = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "—";

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Attendance
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Mark daily attendance for all workers
            </p>
          </div>
          <button
            onClick={showForm ? closeForm : openForm}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg text-sm ${
              showForm
                ? "bg-white text-slate-600 border border-slate-200"
                : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
            }`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Close" : "Mark Attendance"}
          </button>
        </div>

        {/* ── ATTENDANCE FORM */}
        {showForm && (
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-indigo-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">

            {/* Form header */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-slate-100 space-y-5">
              {/* Date picker */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex flex-col gap-1.5 w-full sm:w-64">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                    <Calendar size={13} /> Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => { setFormDate(e.target.value); setDateError(""); }}
                    className={`form-input-att ${dateError ? "border-rose-300 focus:border-rose-400" : ""}`}
                  />
                  {dateError && (
                    <p className="text-[10px] text-rose-500 font-semibold ml-1">{dateError}</p>
                  )}
                </div>

                {/* Summary pills */}
                <div className="flex gap-2 flex-wrap pb-0.5">
                  {STATUS_KEYS.map((key) => {
                    const cfg = STATUS_CONFIG[key];
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.border}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-[11px] font-black ${cfg.text}`}>
                          {cfg.label}: {summaryCounts[key]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bulk action bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
                  Mark All:
                </span>
                {STATUS_KEYS.map((key) => {
                  const cfg = STATUS_CONFIG[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAllStatus(key)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all hover:shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Worker rows */}
            <div className="divide-y divide-slate-50 max-h-[55vh] overflow-y-auto">
              {entries.length === 0 ? (
                <div className="px-8 py-16 text-center text-slate-400">
                  <Users size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-sm">No active workers found.</p>
                  <p className="text-xs mt-1">Add workers to the Workers master first.</p>
                </div>
              ) : (
                entries.map((entry, idx) => (
                  <div
                    key={entry.worker_id}
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[280px_1fr] gap-3 items-center px-5 sm:px-8 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Worker name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <User size={15} className="text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{entry.name}</p>
                        {entryErrors[idx] && (
                          <p className="text-[10px] text-rose-500 font-semibold">{entryErrors[idx]}</p>
                        )}
                      </div>
                    </div>

                    {/* Status toggle */}
                    <StatusToggle
                      value={entry.status}
                      onChange={(s) => updateStatus(idx, s)}
                      error={!!entryErrors[idx]}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Form footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50/40">
              <button
                type="button"
                onClick={closeForm}
                className="w-full sm:w-auto px-8 py-3 text-slate-400 font-bold order-2 sm:order-1"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={submitting || entries.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-3.5 rounded-xl font-bold order-1 sm:order-2 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save {entries.length > 0 ? `${entries.length} Workers` : ""}
              </button>
            </div>
          </div>
        )}

        {/* ── SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by worker name..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-transparent rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </div>

          {/* Date filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setPage(1); setFilterDate(e.target.value); }}
              className="pl-9 pr-4 py-3.5 bg-white border border-transparent rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-slate-600 cursor-pointer"
              title="Filter by date"
            />
          </div>

          {/* Clear date filter */}
          {filterDate && (
            <button
              onClick={() => { setPage(1); setFilterDate(""); }}
              className="flex items-center gap-1.5 px-4 py-3.5 bg-white rounded-2xl shadow-sm text-rose-400 hover:text-rose-600 font-bold text-sm transition-all"
            >
              <X size={15} /> Clear Date
            </button>
          )}

          {/* Rows per page */}
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
            className="bg-white border-r-8 border-transparent rounded-2xl py-3.5 px-4 shadow-sm font-bold text-slate-600 text-sm outline-none cursor-pointer"
          >
            {[10, 20, 50].map((v) => (
              <option key={v} value={v}>Show {v}</option>
            ))}
          </select>
        </div>

        {/* ── DATA CONTAINER */}
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
                  <th className="px-6 py-5">Worker</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-center">Date</th>
                  <th className="px-6 py-5 text-center">Entry On</th>
                  <th className="px-6 py-5 text-center">By</th>
                  <th className="px-6 py-5 text-center">IP</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {records.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-16 text-center text-slate-400 font-medium">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-slate-400 text-xs font-bold">{r.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <User size={13} className="text-indigo-400" />
                          </div>
                          <span className="font-semibold text-slate-700">{r.worker_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 text-xs font-medium">
                        {fmt(r.date_on)}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400 text-xs">
                        {fmtDt(r.entry_on)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <User size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{r.entry_by || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Monitor size={12} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400">{r.entry_ip || "—"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDelete(r.id)}
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
            {records.length === 0 && !loading ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-400 font-medium border border-slate-100">
                No attendance records found.
              </div>
            ) : (
              records.map((r) => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <User size={16} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base leading-tight">{r.worker_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{fmt(r.date_on)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">#{r.id}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-y border-slate-50">
                    <StatusBadge status={r.status} />
                    <div className="flex items-center gap-1 text-slate-400">
                      <Monitor size={12} />
                      <span className="text-[11px]">{r.entry_ip || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-2">
                      <User size={12} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-600">{r.entry_by || "—"}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2.5 text-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── PAGINATION */}
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
            <div className="px-4 text-xs font-bold text-slate-600">
              Page {page} / {totalPages || 1}
            </div>
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
        .form-input-att {
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
        .form-input-att:focus {
          background-color: white;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
        }
      `}</style>
    </Layout>
  );
};

export default Attendance;
