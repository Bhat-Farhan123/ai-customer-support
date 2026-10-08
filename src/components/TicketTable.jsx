import { Link } from "react-router-dom";
import { useState } from "react";
import {
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock3,
} from "lucide-react";

function StatusBadge({ status }) {
  const styles = {
    Open: "bg-orange-50 text-orange-700 border-orange-100",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
    Resolved: "bg-green-50 text-green-700 border-green-100",
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.Open
      }`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    High: "bg-red-50 text-red-700 border-red-100",
    Medium: "bg-orange-50 text-orange-700 border-orange-100",
    Low: "bg-green-50 text-green-700 border-green-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[priority] || styles.Low
      }`}
    >
      {priority}
    </span>
  );
}

function SentimentBadge({ sentiment }) {
  const styles = {
    Positive: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Neutral: "bg-amber-50 text-amber-700 border-amber-100",
    Negative: "bg-red-50 text-red-700 border-red-100",
    "Not analyzed": "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[sentiment] || styles["Not analyzed"]
      }`}
    >
      {sentiment || "Not analyzed"}
    </span>
  );
}

function getSLAStatus(ticket) {
  if (ticket.status === "Resolved" || ticket.status === "Closed") {
    return "ok";
  }

  if (!ticket.created_at) {
    return "ok";
  }

  const slaHours = {
    High: 2,
    Medium: 8,
    Low: 24,
  };

  const limit = slaHours[ticket.priority] || 24;

  const createdAt = new Date(ticket.created_at);
  const now = new Date();

  const elapsedHours = (now - createdAt) / (1000 * 60 * 60);
  const remainingHours = limit - elapsedHours;

  if (remainingHours <= 0) {
    return "breached";
  }

  if (remainingHours <= limit * 0.25) {
    return "at-risk";
  }

  return "ok";
}

export default function TicketTable({ tickets = [] }) {
  const [slaFilter, setSlaFilter] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    if (slaFilter === "all") {
      return true;
    }

    return getSLAStatus(ticket) === slaFilter;
  });

  return (
    <div>

      {/* SLA Filter */}
      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Clock3 size={16} />
          </div>

          <div>
            <label
              htmlFor="sla-filter"
              className="block text-xs font-semibold text-slate-500"
            >
              SLA Filter
            </label>

            <select
              id="sla-filter"
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="
                mt-0.5
                cursor-pointer
                bg-transparent
                text-sm
                font-semibold
                text-slate-700
                outline-none
              "
            >
              <option value="all">All SLA</option>
              <option value="ok">SLA OK</option>
              <option value="at-risk">SLA At Risk</option>
              <option value="breached">SLA Breached</option>
            </select>
          </div>
        </div>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
          {filteredTickets.length} tickets
        </span>

      </div>

      {/* Table */}
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_8px_25px_rgba(15,23,42,0.05)]
        "
      >

        <div className="overflow-x-auto">

          <table className="w-full min-w-187.5 text-left text-sm">

            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ticket ID
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subject
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Priority
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sentiment
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.map((ticket) => {

                const needsAttention =
                  ticket.priority === "High" &&
                  ticket.sentiment === "Negative";

                return (
                  <tr
                    key={ticket.id}
                    className={`
                      group
                      border-b
                      border-slate-100
                      transition-colors
                      duration-150
                      last:border-0
                      hover:bg-blue-50/40
                      ${
                        needsAttention
                          ? "bg-red-50/70 hover:bg-red-50"
                          : ""
                      }
                    `}
                  >

                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-600">
                        {ticket.id}
                      </span>
                    </td>

                    <td className="max-w-xs px-4 py-4">
                      <div className="flex flex-col gap-1.5">

                        <span className="truncate font-semibold text-slate-800">
                          {ticket.subject}
                        </span>

                        {needsAttention && (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                            <AlertTriangle size={11} />
                            Needs Attention
                          </span>
                        )}

                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {ticket.customer}
                    </td>

                    <td className="px-4 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    <td className="px-4 py-4">
                      <SentimentBadge sentiment={ticket.sentiment} />
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          px-2.5
                          py-1.5
                          text-xs
                          font-bold
                          text-blue-600
                          transition-all
                          hover:bg-blue-50
                          hover:text-blue-700
                        "
                      >
                        View
                        <ExternalLink
                          size={13}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>

        </div>

        {filteredTickets.length === 0 && (
          <div className="py-12 text-center">
            <ShieldCheck
              size={28}
              className="mx-auto mb-2 text-slate-300"
            />

            <p className="text-sm font-medium text-slate-500">
              No tickets found.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}