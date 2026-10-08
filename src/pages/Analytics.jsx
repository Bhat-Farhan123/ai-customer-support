import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useTickets } from "../context/TicketContext";

export default function Analytics() {
  const { tickets } = useTickets();

  const totalTickets = tickets.length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
  ).length;

  const analyzedTickets = tickets.filter(
    (ticket) =>
      ticket.sentiment === "Positive" ||
      ticket.sentiment === "Neutral" ||
      ticket.sentiment === "Negative"
  ).length;

  const positiveTickets = tickets.filter(
    (ticket) => ticket.sentiment === "Positive"
  ).length;

  const resolutionRate =
    totalTickets > 0
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;

  const customerSatisfaction =
    analyzedTickets > 0
      ? Math.round((positiveTickets / analyzedTickets) * 100)
      : 0;

  const weeklyData = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      days.push({
        date,
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        received: 0,
        resolved: 0,
      });
    }

    tickets.forEach((ticket) => {
      if (!ticket.created_at) return;

      const ticketDate = new Date(ticket.created_at);

      days.forEach((day) => {
        const sameDay =
          ticketDate.getFullYear() === day.date.getFullYear() &&
          ticketDate.getMonth() === day.date.getMonth() &&
          ticketDate.getDate() === day.date.getDate();

        if (sameDay) {
          day.received += 1;

          if (
            ticket.status === "Resolved" ||
            ticket.status === "Closed"
          ) {
            day.resolved += 1;
          }
        }
      });
    });

    return days;
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>

        <p className="mt-1 text-sm text-slate-500">
          Understand ticket volume and support performance.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Resolution Rate
          </p>

          <p className="mt-3 text-2xl font-bold">
            {resolutionRate}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Resolved + Closed tickets
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Average Resolution
          </p>

          <p className="mt-3 text-2xl font-bold">
            N/A
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Resolution timestamps not available
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Positive Sentiment
          </p>

          <p className="mt-3 text-2xl font-bold">
            {customerSatisfaction}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Of analyzed tickets
          </p>
        </div>
      </div>

      {/* Weekly Ticket Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">
          Weekly Ticket Activity
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Ticket activity from the last 7 days.
        </p>

        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="day" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="received"
                name="Received"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="resolved"
                name="Resolved / Closed"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}