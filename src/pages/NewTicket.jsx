
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useTickets } from "../context/TicketContext";
const API_URL = import.meta.env.VITE_API_URL;


export default function NewTicket() {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const [isClassifying, setIsClassifying] = useState(false);
  const [sentiment, setSentiment] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const [formData, setFormData] = useState({
    subject: "",
    customer: "",
    email: "",
    message: "",
    priority: "Medium",
    category: "General",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };


 const handleClassify = async () => {
  if (!formData.subject.trim() || !formData.message.trim()) {
    setError("Enter the subject and customer message first.");
    return;
  }

  setIsClassifying(true);
  setError("");

  try {
    const response = await fetch(`${API_URL}/classify-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: formData.subject,
        message: formData.message,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to classify ticket");
    }

    const result = await response.json();

    setFormData((current) => ({
      ...current,
      category: result.category,
      priority: result.priority,
    }));
  } catch (err) {
    console.error("Classification error:", err);
    setError("AI classification failed. Please try again.");
  } finally {
    setIsClassifying(false);
  }
}; 

const handleSentiment = async () => {
  if (!formData.message.trim()) {
    setError("Enter the customer message first.");
    return;
  }

  setIsAnalyzing(true);
  setError("");
  setSentiment("");

  try {
    const response = await fetch(
      `${API_URL}/analyze-sentiment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formData.subject || "Customer issue",
          message: formData.message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Sentiment analysis failed");
    }

    const result = await response.json();
    setSentiment(result.sentiment);
  } catch (err) {
    console.error(err);
    setError("Sentiment analysis failed. Please try again.");
  } finally {
    setIsAnalyzing(false);
  }
};


 const handleSubmit = async (e) => {
  e.preventDefault();

  setSubmitting(true);
  setError("");

  try {
    const newTicket = await createTicket({
  ...formData,
  sentiment: sentiment || "Not analyzed",
});
    navigate(`/tickets/${newTicket.id}`);
  } catch (err) {
    console.error("Error creating ticket:", err);
    setError("Failed to create ticket. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to="/tickets"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Tickets
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create New Ticket
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter the customer's details and support request.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Subject
          </label>
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="Enter ticket subject"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Customer Name
            </label>
            <input
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Customer name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Customer Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="customer@example.com"
            />
          </div>
        </div>
         

          <div className="flex justify-start">
          <button
            type="button"
            onClick={handleClassify}
            disabled={isClassifying || submitting}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClassifying ? "Analyzing..." : "✨ AI Suggest Category & Priority"}
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
         
          <div>
            <label className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option>General</option>
              <option>Order Tracking</option>
              <option>Refund</option>
              <option>Account Access</option>
              <option>Product Issue</option>
              <option>Payment</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div>
  <label className="mb-1 block text-sm font-medium">
    Customer Message
  </label>

  <textarea
    name="message"
    value={formData.message}
    onChange={handleChange}
    required
    rows={6}
    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
    placeholder="Describe the customer's issue..."
  />

  {/* Add Step 3 code here */}
  <div className="mt-3 flex flex-wrap items-center gap-3">
    <button
      type="button"
      onClick={handleSentiment}
      disabled={isAnalyzing || submitting}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
    </button>

    {sentiment && (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
        Sentiment: {sentiment}
      </span>
    )}
  </div>
</div>

         {error && (
            <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-3">
            <Link
                to="/tickets"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
                Cancel
            </Link>

            <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Plus size={16} />
                {submitting ? "Creating..." : "Create Ticket"}
            </button>
            </div>
      </form>
    </div>
  );
}