import { Search, Users } from "lucide-react";
import { useState } from "react";
import { useTickets } from "../context/TicketContext";

export default function Customers() {
  const { tickets } = useTickets();

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = Object.values(
    tickets.reduce((acc, ticket) => {
      const email = ticket.email;

      if (!email) return acc;

      if (!acc[email]) {
        acc[email] = {
          name: ticket.customer || email,
          email: email,
          tickets: 0,
        };
      }

      acc[email].tickets += 1;

      return acc;
    }, {})
  );

  const filtered = customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>

        <p className="mt-1 text-sm text-slate-500">
          View customer profiles and their support history.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <Search size={17} className="text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full text-sm outline-none"
        />
      </div>

      {/* Customer Directory + Customer Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Directory */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Users size={19} className="text-blue-600" />

            <h2 className="font-semibold">
              Customer Directory
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-87.5 text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Tickets</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((customer) => (
                  <tr
                    key={customer.email}
                    className={`border-b border-slate-100 ${
                      selectedCustomer?.email === customer.email
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-4">
                      <button
                        onClick={() =>
                          setSelectedCustomer(customer)
                        }
                        className="text-left font-medium text-blue-600 hover:underline"
                      >
                        {customer.name}
                      </button>

                      <p className="mt-1 text-xs text-slate-500">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      {customer.tickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          {selectedCustomer ? (
            <>
              {/* Customer Information */}
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedCustomer.name}
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedCustomer.email}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCustomer.tickets} support tickets
                </p>
              </div>

              {/* Customer Ticket History */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-162.5 text-left text-sm">
                  <thead className="border-b bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-3">Subject</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Priority</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Sentiment</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tickets
                      .filter(
                        (ticket) =>
                          ticket.email === selectedCustomer.email
                      )
                      .map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="border-b border-slate-100"
                        >
                          <td className="px-3 py-4 font-medium">
                            {ticket.subject}
                          </td>

                          <td className="px-3 py-4">
                            {ticket.category}
                          </td>

                          <td className="px-3 py-4">
                            {ticket.priority}
                          </td>

                          <td className="px-3 py-4">
                            {ticket.status}
                          </td>

                          <td className="px-3 py-4">
                            {ticket.sentiment}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* No Customer Selected */
            <div className="flex h-full min-h-62.5 items-center justify-center text-center">
              <div>
                <Users
                  size={40}
                  className="mx-auto mb-3 text-slate-300"
                />

                <h3 className="font-medium text-slate-700">
                  Select a customer
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select a customer to view their support history.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}