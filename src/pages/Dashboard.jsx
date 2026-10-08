import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Smile,
  Minus,
  Frown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import StatCard from "../components/StatCard";
import TicketTable from "../components/TicketTable";
import { useTickets } from "../context/TicketContext";

export default function Dashboard() {
  const { tickets } = useTickets();

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Open" ||
      ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
  ).length;

  // -----------------------------
  // Today's ticket calculations
  // -----------------------------

  const today = new Date();

  const isToday = (dateString) => {
    if (!dateString) return false;

    const date = new Date(dateString);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const ticketsToday = tickets.filter((ticket) =>
    isToday(ticket.created_at)
  ).length;

  const openTicketsToday = tickets.filter(
    (ticket) =>
      isToday(ticket.created_at) &&
      (ticket.status === "Open" ||
        ticket.status === "In Progress")
  ).length;

  const resolvedTicketsToday = tickets.filter(
    (ticket) =>
      isToday(ticket.created_at) &&
      (ticket.status === "Resolved" ||
        ticket.status === "Closed")
  ).length;

  const needsAttentionToday = tickets.filter(
    (ticket) =>
      isToday(ticket.created_at) &&
      ticket.priority === "High" &&
      ticket.sentiment === "Negative"
  ).length;

  const responseTimes = tickets
    .filter(
      (ticket) =>
        ticket.created_at &&
        ticket.first_response_at
    )
    .map((ticket) => {
      const createdAt = new Date(ticket.created_at);
      const firstResponseAt = new Date(ticket.first_response_at);

      return (firstResponseAt - createdAt) / (1000 * 60 * 60);
    })
    .filter((time) => time >= 0);

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length
      : null;

  const averageResponseTimeDisplay =
    averageResponseTime === null
      ? "N/A"
      : averageResponseTime < 1
      ? `${Math.round(averageResponseTime * 60)} min`
      : `${averageResponseTime.toFixed(1)} hrs`;

  // -----------------------------
  // Sentiment calculations
  // -----------------------------

  const positiveTickets = tickets.filter(
    (ticket) => ticket.sentiment === "Positive"
  ).length;

  const neutralTickets = tickets.filter(
    (ticket) => ticket.sentiment === "Neutral"
  ).length;

  const negativeTickets = tickets.filter(
    (ticket) => ticket.sentiment === "Negative"
  ).length;

  const analyzedTickets =
    positiveTickets + neutralTickets + negativeTickets;

  const negativePercentage =
    analyzedTickets > 0
      ? Math.round((negativeTickets / analyzedTickets) * 100)
      : 0;

  // -----------------------------
  // Needs Attention
  // -----------------------------

  const needsAttentionTickets = tickets.filter(
    (ticket) =>
      ticket.priority === "High" &&
      ticket.sentiment === "Negative"
  ).length;

  // -----------------------------
  // Dashboard statistics
  // -----------------------------

  const stats = [
    {
      title: "Total Tickets",
      value: totalTickets,
      change: `${ticketsToday} received today`,
      icon: Ticket,
      color: "text-blue-600",
      bg: "bg-blue-50",
      positive: true,
    },
    {
      title: "Open Tickets",
      value: openTickets,
      change: `${openTicketsToday} received today`,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      positive: false,
    },
    {
      title: "Resolved Tickets",
      value: resolvedTickets,
      change: `${resolvedTicketsToday} received today`,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      positive: true,
    },
    {
      title: "Avg. Response Time",
      value: averageResponseTimeDisplay,
      change: "Current average",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
      positive: true,
    },
    {
      title: "Needs Attention",
      value: needsAttentionTickets,
      change: `${needsAttentionToday} today`,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      positive: false,
    },
  ];

  const recentTickets = tickets.slice(0, 3).map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    customer: ticket.email,
    priority: ticket.priority,
    status: ticket.status,
  }));

  const sentimentData = [
    {
      name: "Positive",
      value: positiveTickets,
      color: "#10b981",
    },
    {
      name: "Neutral",
      value: neutralTickets,
      color: "#f59e0b",
    },
    {
      name: "Negative",
      value: negativeTickets,
      color: "#ef4444",
    },
  ];

  return (
    <>
      <style>{`
        .dashboard-page {
          color: #0f172a;
        }

        .dashboard-heading {
          position: relative;
        }

        .dashboard-heading h1 {
          letter-spacing: -0.025em;
        }

        .dashboard-stat-card {
          transition:
            transform 0.2s ease,
            filter 0.2s ease;
        }

        .dashboard-stat-card:hover {
          transform: translateY(-3px);
          filter: brightness(1.01);
        }

        .dashboard-stat-card > div {
          border-radius: 16px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow:
            0 2px 5px rgba(15, 23, 42, 0.03),
            0 8px 24px rgba(15, 23, 42, 0.04) !important;
          transition:
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .dashboard-stat-card:hover > div {
          border-color: #cbd5e1 !important;
          box-shadow:
            0 4px 8px rgba(15, 23, 42, 0.04),
            0 14px 30px rgba(15, 23, 42, 0.08) !important;
        }

        .sentiment-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .sentiment-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 4px 8px rgba(15, 23, 42, 0.04),
            0 14px 30px rgba(15, 23, 42, 0.07);
        }

        .sentiment-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          border-radius: 16px 0 0 16px;
        }

        .sentiment-positive {
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #f0fdf4 100%
          );
        }

        .sentiment-positive::after {
          background: #10b981;
        }

        .sentiment-neutral {
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #fffbeb 100%
          );
        }

        .sentiment-neutral::after {
          background: #f59e0b;
        }

        .sentiment-negative {
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #fef2f2 100%
          );
        }

        .sentiment-negative::after {
          background: #ef4444;
        }

        .sentiment-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
        }

        .chart-card {
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow:
            0 2px 5px rgba(15, 23, 42, 0.03),
            0 10px 30px rgba(15, 23, 42, 0.05);
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .chart-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .recent-section {
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 20px;
          box-shadow:
            0 2px 5px rgba(15, 23, 42, 0.03),
            0 10px 30px rgba(15, 23, 42, 0.04);
        }

        .recent-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .recent-section-header h2 {
          letter-spacing: -0.015em;
        }

        .dashboard-subtle-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 14px 0 0;
        }
      `}</style>

      <div className="dashboard-page space-y-6">

        {/* Dashboard Heading */}
        <div className="dashboard-heading">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Overview of your support tickets
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="dashboard-stat-card"
            >
              <StatCard
                {...stat}
              />
            </div>
          ))}
        </section>

        {/* Sentiment Summary */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Positive */}
          <div className="sentiment-card sentiment-positive border border-emerald-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  Positive Tickets
                </h2>

                <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
                  {positiveTickets}
                </p>
              </div>

              <div className="sentiment-icon bg-emerald-100 text-emerald-600">
                <Smile size={21} />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-emerald-600/80">
              Customers with positive sentiment
            </p>
          </div>

          {/* Neutral */}
          <div className="sentiment-card sentiment-neutral border border-amber-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  Neutral Tickets
                </h2>

                <p className="mt-3 text-3xl font-bold tracking-tight text-amber-600">
                  {neutralTickets}
                </p>
              </div>

              <div className="sentiment-icon bg-amber-100 text-amber-600">
                <Minus size={21} />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-amber-600/80">
              Customers with neutral sentiment
            </p>
          </div>

          {/* Negative */}
          <div className="sentiment-card sentiment-negative border border-red-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  Negative Tickets
                </h2>

                <p className="mt-3 text-3xl font-bold tracking-tight text-red-600">
                  {negativeTickets}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {negativePercentage}% of analyzed tickets
                </p>
              </div>

              <div className="sentiment-icon bg-red-100 text-red-600">
                <Frown size={21} />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-red-600/80">
              Customers showing negative sentiment
            </p>
          </div>

        </section>

        {/* Customer Sentiment Distribution */}
        <section className="chart-card p-5">

          <div className="chart-header">
            <div>
              <h2 className="font-semibold text-slate-900">
                Customer Sentiment Distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Sentiment analysis across your support tickets
              </p>
            </div>

            <span className="chart-badge">
              {analyzedTickets} analyzed
            </span>
          </div>

          <div className="dashboard-subtle-divider" />

          {analyzedTickets > 0 ? (
            <div className="h-80 w-full pt-4">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={58}
                    paddingAngle={3}
                    label
                  >
                    {sentimentData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow:
                        "0 8px 24px rgba(15, 23, 42, 0.10)",
                      fontSize: "13px",
                    }}
                  />

                </PieChart>
              </ResponsiveContainer>

            </div>
          ) : (
            <p className="py-14 text-center text-sm text-slate-500">
              No analyzed tickets yet.
            </p>
          )}

          {analyzedTickets > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-5">
              {sentimentData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="text-xs font-medium text-slate-600">
                    {item.name}
                  </span>

                  <span className="text-xs font-bold text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

        </section>

        {/* Recent Tickets */}
        <section className="recent-section">

          <div className="recent-section-header">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Tickets
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest customer support activity
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Latest</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          <TicketTable tickets={recentTickets} />

        </section>

      </div>
    </>
  );
}