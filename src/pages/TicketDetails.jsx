import { useEffect, useMemo, useState } from "react";
import { useTickets } from "../context/TicketContext";
import DOMPurify from "dompurify";
import {
  ArrowLeft,
  Send,
  Sparkles,
  User,
  Bot,
  RotateCcw,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function TicketDetails() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    tickets,
    updateTicket,
    loadMessages,
    loadActivities,
    deleteTicket,
  } = useTickets();

  const ticket = tickets.find((item) => item.id === id);

  const [reply, setReply] = useState(ticket?.reply || "");
  const [originalDraft, setOriginalDraft] = useState(ticket?.reply || "");
  const [status, setStatus] = useState(ticket?.status || "Open");
  const [activities, setActivities] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sanitizedEmailHtml = useMemo(() => {
  const customerMessage = (ticket?.messages || []).find(
    (message) => message.sender === "customer" && message.html_body
  );

  if (!customerMessage?.html_body) return null;

  return DOMPurify.sanitize(customerMessage.html_body, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target"],
  });
}, [ticket?.messages]);

  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(() => {
    const savedSettings = localStorage.getItem("supportAISettings");

    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      return parsedSettings.aiSuggestions ?? true;
    }

    return true;
  });

  const [manualApprovalEnabled, setManualApprovalEnabled] = useState(() => {
    const savedSettings = localStorage.getItem("supportAISettings");

    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      return parsedSettings.manualApproval ?? true;
    }

    return true;
  });

  useEffect(() => {
    const checkSettings = () => {
      const savedSettings = localStorage.getItem("supportAISettings");

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        setAiSuggestionsEnabled(parsedSettings.aiSuggestions ?? true);
        setManualApprovalEnabled(parsedSettings.manualApproval ?? true);
      }
    };

    window.addEventListener("storage", checkSettings);

    return () => {
      window.removeEventListener("storage", checkSettings);
    };
  }, []);

  const generateAIReply = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(
        `${API_URL}/generate-reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: ticket.subject,
            category: ticket.category,
            message: ticket.message,
            ticket_id: ticket.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate AI reply");
      }

      const data = await response.json();
      setReply(data.reply);
    } catch (error) {
      console.error("Error generating AI reply:", error);
      alert("Failed to generate AI reply. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!ticket) return;

    setReply(aiSuggestionsEnabled ? ticket.reply || "" : "");
    setOriginalDraft(aiSuggestionsEnabled ? ticket.reply || "" : "");
    setStatus(ticket.status);

     if (ticket.id && !ticket.id.startsWith("TKT-")) {
      loadMessages(ticket.id).catch((error) => {
        console.error("Error loading messages:", error);
      });

      loadActivities(ticket.id)
        .then((data) => {
          setActivities(data);
        })
        .catch((error) => {
          console.error("Error loading ticket activities:", error);
        });
    }
  }, [id, ticket?.reply, ticket?.status, aiSuggestionsEnabled]);

  useEffect(() => {
    if (!aiSuggestionsEnabled) {
      setReply("");
      setOriginalDraft("");
    }
  }, [aiSuggestionsEnabled]);

  if (!ticket) {
    return (
      <div className="space-y-4">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Tickets
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Ticket not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            No ticket exists with ID {id}.
          </p>
        </div>
      </div>
    );
  }

  const resetReply = () => {
    setReply(originalDraft);
  };

  const sendReply = async () => {
    const trimmedReply = reply.trim();

    if (!trimmedReply) return;

    setIsSending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/tickets/${id}/send-reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: trimmedReply,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send reply");
      }

      await response.json();

      setReply("");
      setSuccessMessage("Reply sent successfully!");

      await loadMessages(id);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error sending reply:", error);
      setErrorMessage(
        error.message || "Failed to send reply. Please try again."
      );

      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const previousStatus = ticket.status;

    setStatus(newStatus);

    try {
      await updateTicket(id, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      setStatus(previousStatus);
      alert("Failed to update ticket status. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
      return;
    }

    const confirmed = window.confirm(
      `Delete ticket "${ticket.subject}"?\n\nThis will permanently delete the ticket and its conversation history. This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTicket(ticket.id);

      navigate("/tickets");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      setErrorMessage(
        error.message || "Failed to delete ticket. Please try again."
      );

      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-lg border border-green-200 bg-white px-5 py-3 shadow-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle size={18} />
          </div>

          <p className="text-sm font-medium text-gray-800">
            {successMessage}
          </p>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed right-5 top-20 z-50 flex items-center gap-3 rounded-lg border border-red-200 bg-white px-5 py-3 shadow-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle size={18} />
          </div>

          <p className="text-sm font-medium text-gray-800">
            {errorMessage}
          </p>
        </div>
      )}

      <Link
        to="/tickets"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} />
        Back to Tickets
      </Link>

      {/* Ticket Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {ticket.id}
          </h1>

          <p className="mt-1 text-slate-600">{ticket.subject}</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          {/* Delete only for Resolved / Closed tickets */}
          {(ticket.status === "Resolved" ||
            ticket.status === "Closed") && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Delete Ticket
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {/* Conversation */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Conversation</h2>

            <div className="space-y-4">
              {(ticket.messages || [
                {
                  sender: "customer",
                  text: ticket.message,
                  time: "Original message",
                },
              ]).map((message, index) => (
                <div key={index} className="flex gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      message.sender === "agent"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {message.sender === "agent" ? (
                      <Bot size={18} />
                    ) : (
                      <User size={18} />
                    )}
                  </div>

                  <div className="flex-1 rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {message.sender === "agent"
                          ? "Support Agent"
                          : ticket.customer}
                      </span>

                      <span className="text-xs text-slate-400">
                        {message.time}
                      </span>
                    </div>

                    {message.sender === "customer" && (
                      <p className="mt-1 text-xs text-slate-500">
                        {ticket.email}
                      </p>
                    )}

                    {message.html_body ? (
                      <div
                        className="email-html-content mt-3 text-sm leading-6"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(message.html_body, {
                            USE_PROFILES: { html: true },
                            ADD_ATTR: ["target"],
                          }),
                        }}
                      />
                    ) : (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {message.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reply */}
          <section className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={19} className="text-violet-600" />

              <h2 className="font-semibold">Reply</h2>

              {manualApprovalEnabled && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Approval Required
                </span>
              )}
            </div>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={7}
              placeholder="Write your reply here..."
              className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-blue-500"
            />

            <div className="mt-4 flex flex-wrap justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetReply}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw size={16} />
                  Reset Draft
                </button>

                {aiSuggestionsEnabled && (
                  <button
                    type="button"
                    onClick={generateAIReply}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={16} />
                    {isGenerating
                      ? "Generating..."
                      : "Generate AI Reply"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={sendReply}
                disabled={
                  !reply.trim() || isGenerating || isSending
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                {isSending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {/* Ticket Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Ticket Information</h2>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Customer</dt>
                <dd className="mt-1 font-medium">
                  {ticket.customer}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 break-all font-medium">
                  {ticket.email}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Category</dt>
                <dd className="mt-1 font-medium">
                  {ticket.category}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Priority</dt>
                <dd
                  className={`mt-1 font-medium ${
                    ticket.priority === "High"
                      ? "text-red-600"
                      : ticket.priority === "Medium"
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {ticket.priority}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Assigned to</dt>
                <dd className="mt-1 font-medium">Agent</dd>
              </div>
            </dl>
          </section>
          

           {/* Activity Timeline */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold">Activity Timeline</h2>
              <p className="mt-1 text-xs text-slate-500">
                History of actions and events for this ticket.
              </p>
            </div>

            {activities.length === 0 ? (
              <p className="text-sm text-slate-500">
                No activity recorded yet.
              </p>
            ) : (
              <div className="relative ml-2 border-l-2 border-slate-200">
                 {activities.map((activity) => {
  const activityStyles = {
    "Ticket Created": {
      icon: "🎫",
      dot: "bg-blue-500",
      iconBg: "bg-blue-100",
    },
    "Agent Replied": {
      icon: "📧",
      dot: "bg-violet-500",
      iconBg: "bg-violet-100",
    },
    "Customer Replied": {
      icon: "👤",
      dot: "bg-green-500",
      iconBg: "bg-green-100",
    },
    "Status Changed": {
      icon: "🔄",
      dot: "bg-orange-500",
      iconBg: "bg-orange-100",
    },
    "AI Reclassified": {
      icon: "🤖",
      dot: "bg-indigo-500",
      iconBg: "bg-indigo-100",
    },
    "AI Reply Generated": {
      icon: "✨",
      dot: "bg-purple-500",
      iconBg: "bg-purple-100",
    },
    "Sentiment Updated": {
      icon: "📊",
      dot: "bg-pink-500",
      iconBg: "bg-pink-100",
    },
  };

  const style = activityStyles[activity.activity_type] || {
    icon: "•",
    dot: "bg-slate-500",
    iconBg: "bg-slate-100",
  };

  return (
    <div
      key={activity.id}
      className="relative pb-6 pl-7 last:pb-0"
    >
      <div
        className={`absolute -left-2.25 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${style.dot}`}
      />

      <div className="flex gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${style.iconBg}`}
        >
          {style.icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {activity.activity_type}
          </p>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            {activity.description}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {new Date(activity.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
})}
              </div>
            )}
          </section>


          {/* AI Analysis */}
          <section className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bot size={19} className="text-violet-600" />
              <h2 className="font-semibold">AI Analysis</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Intent</p>
                <p className="mt-1 font-medium">{ticket.intent}</p>
              </div>

              <div>
                <p className="text-slate-500">Sentiment</p>
                <p className="mt-1 font-medium">
                  {ticket.sentiment}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Confidence</p>
                <p className="mt-1 font-medium">
                  {ticket.confidence}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Related articles</p>
                <p className="mt-1 font-medium text-blue-600">
                  {ticket.article}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}