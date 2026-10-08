
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import TicketTable from "../components/TicketTable";
import { useTickets } from "../context/TicketContext";



export default function Tickets() {
 const { tickets } = useTickets();

const [search, setSearch] = useState("");
const [status, setStatus] = useState("All");
const [priority, setPriority] = useState("All");
const [sentiment, setSentiment] = useState("All");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = `${ticket.id} ${ticket.subject} ${ticket.customer}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || ticket.status === status;

      const matchesPriority =
        priority === "All" || ticket.priority === priority;

      const matchesSentiment =
        sentiment === "All" || ticket.sentiment === sentiment;  

      return matchesSearch && matchesStatus && matchesPriority &&   matchesSentiment ;
    });
  }, [tickets, search, status, priority, sentiment]);

  const clearFilters = () => {
    setSearch("");
    setStatus("All");
    setPriority("All");
    setSentiment("All");

  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            All Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter and manage customer support tickets.
          </p>
        </div>

        <Link
          to="/tickets/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={17} />
          New Ticket
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets, customers..."
            className="w-full py-2.5 text-sm outline-none"
          />
        </div>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => {
              console.log("Selected status:", e.target.value);
              setStatus(e.target.value);
            }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Priority filter */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        {/* Sentiment filter */}
        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="All">All Sentiments</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>
      </div>

      {/* Ticket table and empty state */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {filteredTickets.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-slate-500">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </div>
            <TicketTable tickets={filteredTickets} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search size={32} className="mb-3 text-slate-300" />
            <h2 className="text-base font-semibold text-slate-800">
              No tickets found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}