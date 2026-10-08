import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import {
  Mail,
  MailOpen,
  Star,
  AlertCircle,
  Users,
  Send,
  ShieldAlert,
  Trash2,
  RefreshCw,
  TrendingUp,
  Inbox,
  Sparkles,
    Clock3,
  Search,
  CheckSquare,
  Square,
  Filter,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = {
  darkTeal: "#103F42",
  teal: "#145B5F",
  tealLight: "#DDEBE5",
  cream: "#F7F1E6",
  warmWhite: "#FFFDF8",
  beige: "#E9E0D2",
  peach: "#F4B77A",
  softPeach: "#FCE6CC",
  text: "#173F42",
  muted: "#6C7F7D",
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  description,
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-[22px] border bg-white p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: COLORS.beige,
        boxShadow: "0 12px 30px rgba(16,63,66,0.07)",
      }}
    >
      {/* Decorative circle */}
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-50 blur-2xl transition-transform duration-500 group-hover:scale-125"
        style={{ backgroundColor: iconBg }}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={20} className={iconColor} />
          </div>

          <span
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: COLORS.muted }}
          >
            Gmail
          </span>
        </div>

        <p
          className="mt-5 text-sm font-medium"
          style={{ color: COLORS.muted }}
        >
          {title}
        </p>

        <h3
          className="mt-1 text-3xl font-bold tracking-tight"
          style={{ color: COLORS.darkTeal }}
        >
          {value.toLocaleString()}
        </h3>

        <p
          className="mt-2 text-xs leading-5"
          style={{ color: COLORS.muted }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   CATEGORY BAR
========================================================= */

function CategoryBar({ name, value, total, icon, barColor }) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="group">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>

          <span
            className="text-sm font-semibold"
            style={{ color: COLORS.text }}
          >
            {name}
          </span>
        </div>

        <div className="text-right">
          <span
            className="text-sm font-bold"
            style={{ color: COLORS.darkTeal }}
          >
            {value.toLocaleString()}
          </span>

          <span
            className="ml-2 text-xs"
            style={{ color: COLORS.muted }}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full"
        style={{ backgroundColor: "#EFE9DF" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SENDER ROW
========================================================= */

function SenderRow({ sender, count, index }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#F8F3EA";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          backgroundColor:
            index === 0
              ? COLORS.darkTeal
              : index === 1
              ? COLORS.teal
              : COLORS.tealLight,
          color:
            index <= 1 ? "#FFFFFF" : COLORS.darkTeal,
        }}
      >
        {index + 1}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold"
          style={{ color: COLORS.text }}
        >
          {sender}
        </p>

        <p
          className="mt-0.5 text-xs"
          style={{ color: COLORS.muted }}
        >
          Recent messages
        </p>
      </div>

      <span
        className="rounded-full px-2.5 py-1 text-xs font-bold"
        style={{
          backgroundColor: COLORS.softPeach,
          color: COLORS.darkTeal,
        }}
      >
        {count}
      </span>
    </div>
  );
}

/* =========================================================
   EMAIL ROW
========================================================= */

function EmailRow({ email }) {
  const senderName =
    email.from?.split("<")[0]?.trim() ||
    email.from ||
    "Unknown sender";

  return (
    <div
      className="group flex items-center gap-4 border-b px-5 py-4 transition-all duration-200"
      style={{ borderColor: "#F0EBE2" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#FBF7F0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: email.is_important
            ? COLORS.softPeach
            : email.is_unread
            ? COLORS.tealLight
            : "#F1EEE8",
          color: email.is_important
            ? "#A85F19"
            : email.is_unread
            ? COLORS.teal
            : COLORS.muted,
        }}
      >
        {email.is_important ? (
          <AlertCircle size={18} />
        ) : email.is_unread ? (
          <Mail size={18} />
        ) : (
          <MailOpen size={18} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm ${
              email.is_unread ? "font-bold" : "font-medium"
            }`}
            style={{ color: COLORS.text }}
          >
            {senderName}
          </p>

          {email.is_important && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: COLORS.softPeach,
                color: "#9A5B1B",
              }}
            >
              IMPORTANT
            </span>
          )}
        </div>

        <p
          className="mt-0.5 truncate text-sm font-medium"
          style={{ color: COLORS.text }}
        >
          {email.subject}
        </p>

        <p
          className="mt-1 truncate text-xs"
          style={{ color: COLORS.muted }}
        >
          {email.snippet}
        </p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p
          className="text-xs font-medium"
          style={{ color: COLORS.muted }}
        >
          {email.date
            ? new Date(email.date).toLocaleDateString()
            : "—"}
        </p>

        {email.is_starred && (
          <Star
            size={14}
            fill="currentColor"
            className="ml-auto mt-2"
            style={{ color: "#C78A3A" }}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function EmailMonitor() {
  const [data, setData] = useState(() => {
  try {
    const cachedData = sessionStorage.getItem(
      "emailMonitorData"
    );

    return cachedData
      ? JSON.parse(cachedData)
      : null;
  } catch (error) {
    console.error(
      "Failed to load cached email monitor data:",
      error
    );

    return null;
  }
});

const [loading, setLoading] = useState(() => {
  try {
    return !sessionStorage.getItem(
      "emailMonitorData"
    );
  } catch {
    return true;
  }
});

const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");

  // =========================================================
  // EMAIL EXPLORER
  // =========================================================
const [explorerEmails, setExplorerEmails] = useState(() => {
  try {
    const cachedExplorer = sessionStorage.getItem("emailExplorerData");
    return cachedExplorer ? JSON.parse(cachedExplorer).emails || [] : [];
  } catch {
    return [];
  }
});

const [explorerLoading, setExplorerLoading] = useState(false);
const [explorerError, setExplorerError] = useState("");

const [searchQuery, setSearchQuery] = useState(() => {
  try {
    return sessionStorage.getItem("emailExplorerQuery") || "is:inbox";
  } catch {
    return "is:inbox";
  }
});

const [emailLimit, setEmailLimit] = useState(() => {
  try {
    return Number(
      sessionStorage.getItem("emailExplorerLimit")
    ) || 20;
  } catch {
    return 20;
  }
});
const [selectedEmails, setSelectedEmails] = useState([]);

const [emailActionLoading, setEmailActionLoading] = useState(false);
const [deleteBeforeDate, setDeleteBeforeDate] = useState("");
const [selectedEmail, setSelectedEmail] = useState(null);
const [emailViewerLoading, setEmailViewerLoading] = useState(false);

const [trashSuccess, setTrashSuccess] = useState(null);
const [trashConfirm, setTrashConfirm] = useState(false);
const [deleteBeforeConfirm, setDeleteBeforeConfirm] = useState(false);
const [deleteBeforeFilterName, setDeleteBeforeFilterName] = useState("");



const sanitizedEmailHtml = useMemo(() => {
  if (!selectedEmail?.html_body) return null;

  return DOMPurify.sanitize(selectedEmail.html_body, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target"],
  });
}, [selectedEmail]);


  async function loadMonitorData(showRefresh = false) {
  try {
    if (showRefresh) {
      setRefreshing(true);
    } else if (!data) {
      setLoading(true);
    }

    setError("");

    const response = await fetch(
      `${API_URL}/email-monitor`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load Gmail monitoring data."
      );
    }

    const result = await response.json();

    setData(result);

    sessionStorage.setItem(
      "emailMonitorData",
      JSON.stringify(result)
    );
  } catch (err) {
    console.error(err);

    /*
      Only show the error screen when we don't
      already have cached data.
    */
    if (!data) {
      setError(
        "Unable to connect to Gmail monitoring service."
      );
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}

  async function searchEmails(query = searchQuery,   limit = emailLimit) {
    try {
      setExplorerLoading(true);
      setExplorerError("");

      const response = await fetch(
        `${API_URL}/email-explorer?query=${encodeURIComponent(
          query
        )}&max_results=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to search Gmail.");
      }

      const result = await response.json();

      setExplorerEmails(result.emails || []);
      setSelectedEmails([]);

      sessionStorage.setItem(
        "emailExplorerData",
        JSON.stringify({
          emails: result.emails || [],
        })
      );

      sessionStorage.setItem(
        "emailExplorerQuery",
        query
      );
      sessionStorage.setItem(
      "emailExplorerLimit",
      String(emailLimit)
    );
    } catch (err) {
      console.error(err);
      setExplorerError("Unable to load emails from Gmail.");
    } finally {
      setExplorerLoading(false);
    }
  }

  function toggleEmailSelection(emailId) {
    setSelectedEmails((current) =>
      current.includes(emailId)
        ? current.filter((id) => id !== emailId)
        : [...current, emailId]
    );
  }

  function toggleSelectAll() {
    if (selectedEmails.length === explorerEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(explorerEmails.map((email) => email.id));
    }
  }

  async function markSelectedEmailsRead() {
  if (selectedEmails.length === 0) return;

  try {
    setEmailActionLoading(true);
    setExplorerError("");

    const response = await fetch(`${API_URL}/email-explorer/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_ids: selectedEmails,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark emails as read.");
    }

    setExplorerEmails((current) =>
      current.map((email) =>
        selectedEmails.includes(email.id)
          ? { ...email, is_unread: false }
          : email
      )
    );

    setSelectedEmails([]);
  } catch (err) {
    console.error(err);
    setExplorerError("Unable to mark selected emails as read.");
  } finally {
    setEmailActionLoading(false);
  }
}


async function markSelectedEmailsUnread() {
  if (selectedEmails.length === 0) return;

  try {
    setEmailActionLoading(true);
    setExplorerError("");

    const response = await fetch(`${API_URL}/email-explorer/unread`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_ids: selectedEmails,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark emails as unread.");
    }

    setExplorerEmails((current) =>
      current.map((email) =>
        selectedEmails.includes(email.id)
          ? { ...email, is_unread: true }
          : email
      )
    );

    setSelectedEmails([]);
  } catch (err) {
    console.error(err);
    setExplorerError("Unable to mark selected emails as unread.");
  } finally {
    setEmailActionLoading(false);
  }
}

async function trashSelectedEmails() {
  if (selectedEmails.length === 0) return;

  setTrashConfirm(true);
}


async function confirmTrashSelectedEmails() {
  const selectedCount = selectedEmails.length;

  try {
    setTrashConfirm(false);
    setEmailActionLoading(true);
    setExplorerError("");

    const response = await fetch(
      `${API_URL}/email-explorer/trash`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_ids: selectedEmails,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to move emails to Trash.");
    }

    const selectedIds = [...selectedEmails];

    // Remove trashed emails from current list
    setExplorerEmails((current) =>
      current.filter(
        (email) => !selectedIds.includes(email.id)
      )
    );

    // Update cache
    try {
      const cachedExplorer = sessionStorage.getItem(
        "emailExplorerData"
      );

      if (cachedExplorer) {
        const parsed = JSON.parse(cachedExplorer);

        parsed.emails = (parsed.emails || []).filter(
          (email) => !selectedIds.includes(email.id)
        );

        sessionStorage.setItem(
          "emailExplorerData",
          JSON.stringify(parsed)
        );
      }
    } catch (cacheError) {
      console.error(
        "Failed to update Email Explorer cache:",
        cacheError
      );
    }

    setSelectedEmails([]);

    // Success popup
    setTrashSuccess({
      count: selectedCount,
      message:
        selectedCount === 1
          ? "Email moved to Trash successfully."
          : "Emails moved to Trash successfully.",
    });

    setTimeout(() => {
      setTrashSuccess(null);
    }, 4000);

  } catch (err) {
    console.error(err);

    setExplorerError(
      "Unable to move selected emails to Trash."
    );
  } finally {
    setEmailActionLoading(false);
  }
}


async function openEmail(messageId) {
  try {
    setEmailViewerLoading(true);
    setExplorerError("");

    const response = await fetch(
      `${API_URL}/email-explorer/${messageId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load email.");
    }

    const email = await response.json();

    setSelectedEmail(email);

// Opening an unread email marks it as read.
const openedEmail = explorerEmails.find(
  (item) => item.id === messageId
);

if (openedEmail?.is_unread) {
  const readResponse = await fetch(
    `${API_URL}/email-explorer/read`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_ids: [messageId],
      }),
    }
  );

  if (!readResponse.ok) {
    throw new Error("Failed to mark email as read.");
  }

  setExplorerEmails((current) =>
  current.map((item) =>
    item.id === messageId
      ? { ...item, is_unread: false }
      : item
  )
);

// Update Email Explorer cache
try { 
  const cachedExplorer = sessionStorage.getItem(
    "emailExplorerData"
  );

  if (cachedExplorer) {
    const parsed = JSON.parse(cachedExplorer);

    parsed.emails = (parsed.emails || []).map((item) =>
      item.id === messageId
        ? { ...item, is_unread: false }
        : item
    );

    sessionStorage.setItem(
      "emailExplorerData",
      JSON.stringify(parsed)
    );
  }
} catch (cacheError) {
  console.error(
    "Failed to update Email Explorer cache:",
    cacheError
  );
}
}


  } catch (err) {
    console.error(err);
    setExplorerError("Unable to open this email.");
  } finally {
    setEmailViewerLoading(false);
  }
}


function closeEmailViewer() {
  setSelectedEmail(null);
}



 useEffect(() => {
  if (selectedEmail) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [selectedEmail]);
   useEffect(() => {
  loadMonitorData();
}, []);


useEffect(() => {
  try {
    const savedQuery =
      sessionStorage.getItem("emailExplorerQuery") || "is:inbox";

    setSearchQuery(savedQuery);

    const cachedExplorer =
      sessionStorage.getItem("emailExplorerData");

    if (cachedExplorer) {
      const parsed = JSON.parse(cachedExplorer);
      setExplorerEmails(parsed.emails || []);
    }

    // Refresh Gmail data in the background.
    // The cached data is shown immediately, so changing
    // filters or refreshing the page does not feel stuck.
    searchEmails(savedQuery);
  } catch (error) {
    console.error(
      "Failed to restore Email Explorer data:",
      error
    );
  }
}, []);


useEffect(() => {
  try {
    sessionStorage.setItem(
      "emailExplorerData",
      JSON.stringify({
        emails: explorerEmails,
      })
    );
  } catch (error) {
    console.error("Failed to save Email Explorer cache:", error);
  }
}, [explorerEmails]);

  const categoryTotal = useMemo(() => {
    if (!data?.categories) return 0;

    return Object.values(data.categories).reduce(
      (sum, value) => sum + value,
      0
    );
  }, [data]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className="flex min-h-[calc(100vh-76px)] items-center justify-center"
        style={{ backgroundColor: COLORS.cream }}
      >
        <div className="text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: COLORS.tealLight,
              color: COLORS.teal,
            }}
          >
            <Mail size={25} />
          </div>

          <p
            className="mt-4 text-sm font-semibold"
            style={{ color: COLORS.text }}
          >
            Connecting to Gmail...
          </p>

          <p
            className="mt-1 text-xs"
            style={{ color: COLORS.muted }}
          >
            Loading your email intelligence dashboard
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div
        className="flex min-h-[calc(100vh-76px)] items-center justify-center"
        style={{ backgroundColor: COLORS.cream }}
      >
        <div
          className="rounded-3xl border bg-white p-8 text-center"
          style={{
            borderColor: COLORS.beige,
            boxShadow:
              "0 20px 50px rgba(16,63,66,0.10)",
          }}
        >
          <ShieldAlert
            size={35}
            className="mx-auto"
            style={{ color: "#B64D3C" }}
          />

          <h2
            className="mt-4 text-lg font-bold"
            style={{ color: COLORS.darkTeal }}
          >
            Gmail connection failed
          </h2>

          <p
            className="mt-2 text-sm"
            style={{ color: COLORS.muted }}
          >
            {error}
          </p>

          <button
            onClick={() => loadMonitorData()}
            className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{
              backgroundColor: COLORS.darkTeal,
              boxShadow:
                "0 8px 18px rgba(16,63,66,0.20)",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const categories = data?.categories || {};
  const topSenders = data?.top_senders || [];
  const recentEmails = data?.recent_emails || [];

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div
      className="min-h-full space-y-6 pb-12"
      style={{ backgroundColor: COLORS.cream }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="relative overflow-hidden rounded-[28px] border p-7"
        style={{
          backgroundColor: COLORS.warmWhite,
          borderColor: COLORS.beige,
          boxShadow:
            "0 16px 40px rgba(16,63,66,0.07)",
        }}
      >
        {/* Decorative shapes */}
        <div
          className="absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
          style={{
            backgroundColor: COLORS.tealLight,
            opacity: 0.75,
          }}
        />

        <div
          className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full blur-3xl"
          style={{
            backgroundColor: COLORS.softPeach,
            opacity: 0.55,
          }}
        />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: COLORS.tealLight,
                  color: COLORS.teal,
                }}
              >
                ● Gmail Connected
              </span>

              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: COLORS.softPeach,
                  color: "#9A5B1B",
                }}
              >
                LIVE MONITORING
              </span>
            </div>

            <h1
              className="mt-4 text-3xl font-bold tracking-tight md:text-4xl"
              style={{ color: COLORS.darkTeal }}
            >
              Email Monitoring
            </h1>

            <p
              className="mt-2 max-w-2xl text-sm leading-6"
              style={{ color: COLORS.muted }}
            >
              A complete visual overview of your Gmail
              activity, important emails, customer messages
              and mailbox health.
            </p>
          </div>

          <button
            onClick={() => loadMonitorData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              backgroundColor: COLORS.warmWhite,
              borderColor: COLORS.beige,
              color: COLORS.darkTeal,
              boxShadow:
                "0 5px 15px rgba(16,63,66,0.06)",
            }}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Inbox Emails"
          value={overview.inbox || 0}
          icon={Inbox}
          iconBg={COLORS.tealLight}
          iconColor="text-[#145B5F]"
          description="Total messages in your inbox"
        />

        <StatCard
          title="Unread Emails"
          value={overview.unread || 0}
          icon={Mail}
          iconBg="#E9E3F2"
          iconColor="text-[#67527D]"
          description="Messages waiting for attention"
        />

        <StatCard
          title="Important Emails"
          value={overview.important || 0}
          icon={AlertCircle}
          iconBg={COLORS.softPeach}
          iconColor="text-[#A85F19]"
          description="Marked as important by Gmail"
        />

        <StatCard
          title="Customer Emails"
          value={overview.customer_emails || 0}
          icon={Users}
          iconBg="#E3EDE5"
          iconColor="text-[#3E7055]"
          description="Potential customer/support emails"
        />
      </div>

      {/* =================================================
          CATEGORY + MAILBOX
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* CATEGORY */}
        <div
          className="rounded-3xl border p-6 xl:col-span-2"
          style={{
            backgroundColor: COLORS.warmWhite,
            borderColor: COLORS.beige,
            boxShadow:
              "0 12px 30px rgba(16,63,66,0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                Email Categories
              </h2>

              <p
                className="mt-1 text-xs"
                style={{ color: COLORS.muted }}
              >
                Distribution of messages across Gmail
                categories
              </p>
            </div>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: COLORS.tealLight,
                color: COLORS.teal,
              }}
            >
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="mt-7 space-y-6">
            <CategoryBar
              name="Promotions"
              value={categories.promotions || 0}
              total={categoryTotal}
              icon="🛍️"
              barColor={COLORS.peach}
            />

            <CategoryBar
              name="Updates"
              value={categories.updates || 0}
              total={categoryTotal}
              icon="🔔"
              barColor={COLORS.teal}
            />

            <CategoryBar
              name="Social"
              value={categories.social || 0}
              total={categoryTotal}
              icon="💬"
              barColor="#8C7A9D"
            />

            <CategoryBar
              name="Personal"
              value={categories.personal || 0}
              total={categoryTotal}
              icon="👤"
              barColor="#668E74"
            />

            <CategoryBar
              name="Forums"
              value={categories.forums || 0}
              total={categoryTotal}
              icon="👥"
              barColor="#9B9488"
            />
          </div>
        </div>

        {/* MAILBOX */}
        <div
          className="rounded-3xl border p-6"
          style={{
            backgroundColor: COLORS.warmWhite,
            borderColor: COLORS.beige,
            boxShadow:
              "0 12px 30px rgba(16,63,66,0.05)",
          }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: COLORS.darkTeal }}
            >
              Mailbox Overview
            </h2>

            <p
              className="mt-1 text-xs"
              style={{ color: COLORS.muted }}
            >
              Current Gmail mailbox status
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {/* SENT */}
            <div
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: "#F2F6F4" }}
            >
              <div className="flex items-center gap-3">
                <Send
                  size={17}
                  style={{ color: COLORS.teal }}
                />

                <span
                  className="text-sm font-semibold"
                  style={{ color: COLORS.text }}
                >
                  Sent
                </span>
              </div>

              <span
                className="font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                {(overview.sent || 0).toLocaleString()}
              </span>
            </div>

            {/* STARRED */}
            <div
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: "#FBF3E5" }}
            >
              <div className="flex items-center gap-3">
                <Star
                  size={17}
                  style={{ color: "#C78A3A" }}
                />

                <span
                  className="text-sm font-semibold"
                  style={{ color: COLORS.text }}
                >
                  Starred
                </span>
              </div>

              <span
                className="font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                {(overview.starred || 0).toLocaleString()}
              </span>
            </div>

            {/* SPAM */}
            <div
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: "#F8ECE8" }}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert
                  size={17}
                  style={{ color: "#B64D3C" }}
                />

                <span
                  className="text-sm font-semibold"
                  style={{ color: COLORS.text }}
                >
                  Spam
                </span>
              </div>

              <span
                className="font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                {(overview.spam || 0).toLocaleString()}
              </span>
            </div>

            {/* TRASH */}
            <div
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: "#F1EEE8" }}
            >
              <div className="flex items-center gap-3">
                <Trash2
                  size={17}
                  style={{ color: COLORS.muted }}
                />

                <span
                  className="text-sm font-semibold"
                  style={{ color: COLORS.text }}
                >
                  Trash
                </span>
              </div>

              <span
                className="font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                {(overview.trash || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* AI */}
          <div
            className="mt-6 rounded-2xl p-4"
            style={{
              backgroundColor: COLORS.tealLight,
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles
                size={16}
                style={{ color: COLORS.teal }}
              />

              <span
                className="text-xs font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                AI Email Intelligence
              </span>
            </div>

            <p
              className="mt-2 text-xs leading-5"
              style={{ color: COLORS.teal }}
            >
              Your monitoring center will identify
              important, urgent and customer-related emails
              automatically.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          SENDERS + INSIGHTS
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* TOP SENDERS */}
        <div
          className="rounded-3xl border p-6"
          style={{
            backgroundColor: COLORS.warmWhite,
            borderColor: COLORS.beige,
            boxShadow:
              "0 12px 30px rgba(16,63,66,0.05)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                Top Senders
              </h2>

              <p
                className="mt-1 text-xs"
                style={{ color: COLORS.muted }}
              >
                Most frequent senders in recent emails
              </p>
            </div>

            <Users
              size={20}
              style={{ color: COLORS.muted }}
            />
          </div>

          <div className="mt-5">
            {topSenders.length === 0 ? (
              <p
                className="py-8 text-center text-sm"
                style={{ color: COLORS.muted }}
              >
                No sender data available.
              </p>
            ) : (
              topSenders.slice(0, 5).map((item, index) => (
                <SenderRow
                  key={`${item.sender}-${index}`}
                  sender={item.sender}
                  count={item.count}
                  index={index}
                />
              ))
            )}
          </div>
        </div>

        {/* INSIGHTS */}
        <div
          className="rounded-3xl border p-6"
          style={{
            backgroundColor: COLORS.warmWhite,
            borderColor: COLORS.beige,
            boxShadow:
              "0 12px 30px rgba(16,63,66,0.05)",
          }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: COLORS.darkTeal }}
            >
              Email Insights
            </h2>

            <p
              className="mt-1 text-xs"
              style={{ color: COLORS.muted }}
            >
              Quick signals from your mailbox
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* UNREAD */}
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: "#EDF4F1",
                borderColor: "#DCE9E4",
              }}
            >
              <Mail
                size={19}
                style={{ color: COLORS.teal }}
              />

              <p
                className="mt-3 text-2xl font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                {(overview.unread || 0).toLocaleString()}
              </p>

              <p
                className="mt-1 text-xs font-semibold"
                style={{ color: COLORS.teal }}
              >
                Unread messages
              </p>
            </div>

            {/* IMPORTANT */}
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: "#FCF1E2",
                borderColor: "#F4DFC1",
              }}
            >
              <AlertCircle
                size={19}
                style={{ color: "#B36B25" }}
              />

              <p
                className="mt-3 text-2xl font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                {(overview.important || 0).toLocaleString()}
              </p>

              <p
                className="mt-1 text-xs font-semibold"
                style={{ color: "#9A5B1B" }}
              >
                Important messages
              </p>
            </div>

            {/* CUSTOMER */}
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: "#EDF3EC",
                borderColor: "#DDE8DD",
              }}
            >
              <Users
                size={19}
                style={{ color: "#4C785B" }}
              />

              <p
                className="mt-3 text-2xl font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                {(overview.customer_emails || 0).toLocaleString()}
              </p>

              <p
                className="mt-1 text-xs font-semibold"
                style={{ color: "#4C785B" }}
              >
                Customer-related emails
              </p>
            </div>

            {/* MONITORING */}
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: "#F0ECE7",
                borderColor: COLORS.beige,
              }}
            >
              <Clock3
                size={19}
                style={{ color: COLORS.darkTeal }}
              />

              <p
                className="mt-3 text-2xl font-bold"
                style={{ color: COLORS.darkTeal }}
              >
                5 min
              </p>

              <p
                className="mt-1 text-xs font-semibold"
                style={{ color: COLORS.muted }}
              >
                Gmail monitoring interval
              </p>
            </div>
          </div>
        </div>
      </div>

           {/* =================================================
          EMAIL EXPLORER
      ================================================= */}

      <div
        className="overflow-hidden rounded-3xl border"
        style={{
          backgroundColor: COLORS.warmWhite,
          borderColor: COLORS.beige,
          boxShadow: "0 12px 30px rgba(16,63,66,0.05)",
        }}
      >
        {/* HEADER */}
        <div
          className="border-b px-6 py-5"
          style={{ borderColor: "#F0EBE2" }}
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Search
                  size={19}
                  style={{ color: COLORS.teal }}
                />

                <h2
                  className="text-lg font-bold"
                  style={{ color: COLORS.darkTeal }}
                >
                  Email Explorer
                </h2>
              </div>

              <p
                className="mt-1 text-xs"
                style={{ color: COLORS.muted }}
              >
                Search and explore emails directly from your Gmail account.
              </p>
            </div>

            <div
              className="rounded-xl px-3 py-2 text-xs font-semibold"
              style={{
                backgroundColor: COLORS.tealLight,
                color: COLORS.teal,
              }}
            >
              {explorerEmails.length} emails loaded
            </div>
          </div>

         {/* SEARCH */}
<div className="mt-5 flex flex-col gap-3 md:flex-row">
  <div className="relative flex-1">
    <Search
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2"
      style={{ color: COLORS.teal }}
    />

    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          searchEmails();
        }
      }}
      placeholder="Search Gmail... e.g. is:unread"
      className="w-full rounded-2xl border py-3.5 pl-11 pr-12 text-sm font-medium outline-none transition-all duration-200 focus:ring-2"
      style={{
        borderColor: COLORS.beige,
        backgroundColor: "#FFFDF8",
        color: COLORS.text,
        boxShadow: "0 5px 16px rgba(16,63,66,0.04)",
      }}
    />

    {/* Search hint */}
    <div
      className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border px-2 py-1 text-[10px] font-bold sm:block"
      style={{
        borderColor: COLORS.beige,
        backgroundColor: COLORS.cream,
        color: COLORS.muted,
      }}
    >
      ENTER
    </div>
  </div>

  <button
    onClick={() => searchEmails()}
    disabled={explorerLoading}
    className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
    style={{
      backgroundColor: COLORS.darkTeal,
      boxShadow: "0 9px 22px rgba(16,63,66,0.18)",
    }}
  >
    <Search
      size={17}
      className={explorerLoading ? "animate-pulse" : ""}
    />

    {explorerLoading ? "Searching..." : "Search"}
  </button>
</div>
       {/* EMAIL LIMIT */}
<div className="mt-4 flex items-center justify-between gap-3">
  <div className="flex items-center gap-2">
    <span
      className="text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ color: COLORS.muted }}
    >
      Show
    </span>

    <select
      value={emailLimit}
      onChange={(e) => {
        const newLimit = Number(e.target.value);

        setEmailLimit(newLimit);

        sessionStorage.setItem(
          "emailExplorerLimit",
          String(newLimit)
        );

        searchEmails(searchQuery, newLimit);
      }}
      className="rounded-xl border px-3 py-2 text-xs font-semibold outline-none focus:ring-2"
      style={{
        borderColor: COLORS.beige,
        backgroundColor: "#FFFDF8",
        color: COLORS.text,
      }}
    >
       <option value={5}>5 emails</option>
      <option value={10}>10 emails</option>
      <option value={20}>20 emails</option>
      <option value={50}>50 emails</option>
      <option value={100}>100 emails</option>
    </select>
  </div>

  <span
    className="text-xs font-medium"
    style={{ color: COLORS.muted }}
  >
    Emails per search
  </span>
</div>


        {/* QUICK FILTERS */}
<div className="mt-5">
  <div className="mb-2.5 flex items-center gap-2">
    <Filter
      size={14}
      style={{ color: COLORS.muted }}
    />

    <span
      className="text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ color: COLORS.muted }}
    >
      Quick filters
    </span>
  </div>

  <div className="flex items-center justify-between gap-4">

    {/* LEFT — QUICK FILTER BUTTONS */}
    <div className="flex flex-wrap items-center gap-2">
      {[
        {
          label: "Inbox",
          query: "in:inbox",
          icon: "📥",
        },
        {
          label: "Unread",
          query: "is:unread",
          icon: "●",
        },
        {
          label: "Important",
          query: "is:important",
          icon: "⚡",
        },
        {
          label: "Starred",
          query: "is:starred",
          icon: "★",
        },
        {
          label: "Promotions",
          query: "category:promotions",
          icon: "🏷️",
        },
        {
          label: "Sent",
          query: "in:sent",
          icon: "↗",
        },
      ].map((filter) => {
        const active = searchQuery === filter.query;

        return (
          <button
            key={filter.label}
            onClick={() => {
              setSearchQuery(filter.query);
              searchEmails(filter.query);
            }}
            className="group flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderColor: active
                ? COLORS.teal
                : COLORS.beige,
              backgroundColor: active
                ? COLORS.tealLight
                : COLORS.cream,
              color: active
                ? COLORS.teal
                : COLORS.darkTeal,
              boxShadow: active
                ? "0 5px 14px rgba(20,91,95,0.10)"
                : "none",
            }}
          >
            <span className="text-[11px]">
              {filter.icon}
            </span>

            {filter.label}

            {active && (
              <span
                className="ml-1 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: COLORS.teal,
                }}
              />
            )}
          </button>
        );
      })}
    </div>

    {/* RIGHT — DELETE BEFORE DATE */}
    <div
      className="flex shrink-0 items-center gap-2 rounded-xl border px-2 py-1.5"
      style={{
        borderColor: "#E9D6C8",
        backgroundColor: "#FFF8F2",
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.08em]"
        style={{ color: COLORS.muted }}
      >
        Delete before
      </span>

      <input
        type="date"
        value={deleteBeforeDate}
        onChange={(e) =>
          setDeleteBeforeDate(e.target.value)
        }
        className="rounded-lg border px-2 py-1 text-xs font-semibold outline-none"
        style={{
          borderColor: "#E9D6C8",
          backgroundColor: "#FFFFFF",
          color: COLORS.text,
        }}
      />

      <button
  type="button"
  onClick={() => {
  if (!deleteBeforeDate) {
    setExplorerError("Please select a date first.");
    return;
  }

  const filterName =
    searchQuery === "in:inbox"
      ? "Inbox"
      : searchQuery === "is:unread"
      ? "Unread"
      : searchQuery === "is:important"
      ? "Important"
      : searchQuery === "is:starred"
      ? "Starred"
      : searchQuery === "category:promotions"
      ? "Promotions"
      : searchQuery === "in:sent"
      ? "Sent"
      : "current filter";

  setDeleteBeforeFilterName(filterName);
  setDeleteBeforeConfirm(true);
}}

  
  disabled={!deleteBeforeDate || emailActionLoading}
  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
  style={{
    backgroundColor: "#FDECEC",
    color: "#B42318",
  }}
>
  <Trash2 size={13} />
  Delete
</button>
    </div>

  </div>
</div>
         </div>
        
     {deleteBeforeConfirm && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{
      backgroundColor: "rgba(16, 63, 66, 0.28)",
      backdropFilter: "blur(5px)",
    }}
  >
    <div
      className="w-full max-w-md rounded-2xl border p-5"
      style={{
        backgroundColor: "#FFFDF8",
        borderColor: "#E9D6C8",
        boxShadow: "0 24px 70px rgba(16,63,66,0.20)",
      }}
    >
      {/* ICON */}
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: "#FDECEC",
          color: "#B42318",
        }}
      >
        <Trash2 size={20} />
      </div>

      {/* TITLE */}
      <h3
        className="text-lg font-extrabold"
        style={{ color: COLORS.darkTeal }}
      >
        Move emails to Trash?
      </h3>

      {/* DESCRIPTION */}
      <p
        className="mt-2 text-sm leading-6"
        style={{ color: COLORS.muted }}
      >
        This will move all{" "}
        <span
          className="font-bold"
          style={{ color: COLORS.darkTeal }}
        >
          {deleteBeforeFilterName}
        </span>{" "}
        emails received before{" "}
        <span
          className="font-bold"
          style={{ color: COLORS.darkTeal }}
        >
          {deleteBeforeDate}
        </span>{" "}
        to Gmail Trash.
      </p>

      {/* WARNING */}
      <div
        className="mt-4 rounded-xl border px-3 py-2.5 text-xs leading-5"
        style={{
          borderColor: "#F1D5D1",
          backgroundColor: "#FFF5F4",
          color: "#8F2D24",
        }}
      >
        <span className="font-bold">Important:</span>{" "}
        All matching emails will be affected, not just the
        emails currently visible on this page.
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setDeleteBeforeConfirm(false);
            setDeleteBeforeFilterName("");
          }}
          disabled={emailActionLoading}
          className="rounded-xl border px-4 py-2 text-xs font-bold transition hover:bg-white disabled:opacity-50"
          style={{
            borderColor: COLORS.beige,
            backgroundColor: COLORS.cream,
            color: COLORS.darkTeal,
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={async () => {
            try {
              setEmailActionLoading(true);
              setExplorerError("");

              const response = await fetch(
                `${API_URL}/email-explorer/trash-before`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    query: searchQuery,
                    before_date: deleteBeforeDate,
                  }),
                }
              );

              const result = await response.json();

              if (!response.ok) {
                throw new Error(
                  result.detail || "Failed to delete emails."
                );
              }

              setDeleteBeforeConfirm(false);
              setDeleteBeforeFilterName("");
              setDeleteBeforeDate("");

              await searchEmails(searchQuery);

              setTrashSuccess({
                count: result.deleted,
                message:
                  result.deleted === 1
                    ? "Email moved to Trash successfully."
                    : `${result.deleted} emails moved to Trash successfully.`,
              });

              setTimeout(() => {
                setTrashSuccess(null);
              }, 4000);
            } catch (err) {
              console.error(err);

              setExplorerError(
                err.message ||
                  "Unable to delete emails before the selected date."
              );

              setDeleteBeforeConfirm(false);
            } finally {
              setEmailActionLoading(false);
            }
          }}
          disabled={emailActionLoading}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: "#B42318",
            boxShadow: "0 5px 14px rgba(180,35,24,0.18)",
          }}
        >
          <Trash2 size={13} />

          {emailActionLoading ? "Moving..." : "Move to Trash"}
        </button>
      </div>
    </div>
  </div>
)}

        {/* EXPLORER TOOLBAR */}
<div
  className="mt-5 flex flex-col gap-3 rounded-2xl border p-3 md:flex-row md:items-center md:justify-between"
  style={{
    borderColor: "#EEE7DC",
    backgroundColor: "#FFFDF8",
    boxShadow: "0 5px 18px rgba(16,63,66,0.04)",
  }}
>
  {/* LEFT SIDE */}
  <div className="flex flex-wrap items-center gap-2">
    <button
      onClick={toggleSelectAll}
      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: COLORS.beige,
        backgroundColor: COLORS.cream,
        color: COLORS.darkTeal,
      }}
    >
      {selectedEmails.length === explorerEmails.length &&
      explorerEmails.length > 0 ? (
        <CheckSquare size={16} style={{ color: COLORS.teal }} />
      ) : (
        <Square size={16} style={{ color: COLORS.muted }} />
      )}

      {selectedEmails.length === explorerEmails.length &&
      explorerEmails.length > 0
        ? "Deselect All"
        : "Select All"}
    </button>

    {selectedEmails.length > 0 && (
      <div
        className="rounded-xl px-3 py-2 text-xs font-bold"
        style={{
          backgroundColor: COLORS.tealLight,
          color: COLORS.teal,
        }}
      >
        {selectedEmails.length} selected
      </div>
    )}
  </div>

  {/* RIGHT SIDE */}
  {selectedEmails.length > 0 && (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={markSelectedEmailsRead}
        disabled={emailActionLoading}
        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
        style={{
          borderColor: COLORS.beige,
          backgroundColor: COLORS.cream,
          color: COLORS.darkTeal,
        }}
      >
        <MailOpen size={15} />
        Mark Read
      </button>

      <button
        onClick={markSelectedEmailsUnread}
        disabled={emailActionLoading}
        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
        style={{
          borderColor: COLORS.beige,
          backgroundColor: COLORS.cream,
          color: COLORS.darkTeal,
        }}
      >
        <Mail size={15} />
        Mark Unread
      </button>

      <button
        onClick={trashSelectedEmails}
        disabled={emailActionLoading}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
        style={{
          backgroundColor: "#B85C38",
          boxShadow: "0 6px 16px rgba(184,92,56,0.16)",
        }}
      >
        <Trash2 size={15} />
        Move to Trash
      </button>
    </div>
  )}
</div>

        {/* ERROR */}
        {explorerError && (
          <div
            className="mx-6 mt-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              backgroundColor: "#F8ECE8",
              borderColor: "#E9C9C2",
              color: "#A64032",
            }}
          >
            {explorerError}
          </div>
        )}

        {/* EMAIL LIST */}
        <div>
          {explorerLoading ? (
            <div className="p-12 text-center">
              <RefreshCw
                size={25}
                className="mx-auto animate-spin"
                style={{ color: COLORS.teal }}
              />

              <p
                className="mt-3 text-sm font-semibold"
                style={{ color: COLORS.text }}
              >
                Searching Gmail...
              </p>
            </div>
          ) : explorerEmails.length === 0 ? (
            <div className="p-12 text-center">
              <MailOpen
                size={32}
                className="mx-auto"
                style={{ color: "#C7C1B7" }}
              />

              <p
                className="mt-3 text-sm font-semibold"
                style={{ color: COLORS.text }}
              >
                No emails found
              </p>

              <p
                className="mt-1 text-xs"
                style={{ color: COLORS.muted }}
              >
                Try another Gmail search query.
              </p>
            </div>
          ) : (
            explorerEmails.map((email) => {
              const senderName =
                email.from?.split("<")[0]?.trim() ||
                email.from ||
                "Unknown sender";

              const selected = selectedEmails.includes(email.id);

              return (
                <div
                  key={email.id}
                   className="group flex cursor-pointer items-center gap-4 border-b px-5 py-4 transition-all duration-200 hover:-translate-y-px hover:bg-[#FBF7F0]"
                   style={{
                      borderColor: "#F0EBE2",
                      backgroundColor: selected
                        ? "#E8F2EE"
                        : email.is_unread
                        ? "#FFFDF9"
                        : "transparent",
                      boxShadow: selected
                        ? "inset 3px 0 0 #145B5F"
                        : "none",
                    }}
                >
                  {/* CHECKBOX */}
                  <button
                    onClick={() => toggleEmailSelection(email.id)}
                    className="shrink-0 rounded-lg p-1 transition-all duration-200 hover:bg-[#E8F2EE]"
                    style={{ color: COLORS.teal }}
                  >
                    {selected ? (
                      <CheckSquare size={19} />
                    ) : (
                      <Square size={19} />
                    )}
                  </button>

                  {/* ICON */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: email.is_important
                        ? COLORS.softPeach
                        : email.is_unread
                        ? COLORS.tealLight
                        : "#F1EEE8",
                      color: email.is_important
                        ? "#A85F19"
                        : email.is_unread
                        ? COLORS.teal
                        : COLORS.muted,
                    }}
                  >
                    {email.is_important ? (
                      <AlertCircle size={18} />
                    ) : email.is_unread ? (
                      <Mail size={18} />
                    ) : (
                      <MailOpen size={18} />
                    )}
                  </div>

                   {/* EMAIL CONTENT */}
                    <div
                      className="min-w-0 flex-1 cursor-pointer py-1"
                      onClick={() => openEmail(email.id)}
                    >
                      {/* SENDER + STATUS */}
                      <div className="flex min-w-0 items-center gap-2">
                        {/* Avatar */}
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{
                            backgroundColor: email.is_important
                              ? COLORS.softPeach
                              : email.is_unread
                              ? COLORS.tealLight
                              : "#F1EEE8",
                            color: email.is_important
                              ? "#A85F19"
                              : email.is_unread
                              ? COLORS.teal
                              : COLORS.muted,
                          }}
                        >
                          {(senderName?.[0] || "?").toUpperCase()}
                        </div>

                        <p
                          className={`min-w-0 truncate text-sm ${
                            email.is_unread ? "font-bold" : "font-medium"
                          }`}
                          style={{ color: COLORS.text }}
                        >
                          {senderName}
                        </p>

                        {/* IMPORTANT */}
                        {email.is_important && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide"
                            style={{
                              backgroundColor: COLORS.softPeach,
                              color: "#9A5B1B",
                            }}
                          >
                            IMPORTANT
                          </span>
                        )}

                        {/* UNREAD */}
                        {email.is_unread && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide"
                            style={{
                              backgroundColor: COLORS.tealLight,
                              color: COLORS.teal,
                            }}
                          >
                            UNREAD
                          </span>
                        )}
                      </div>

                      {/* SUBJECT */}
                      <p
                        className={`mt-2 truncate text-sm ${
                          email.is_unread ? "font-bold" : "font-semibold"
                        }`}
                        style={{
                          color: COLORS.darkTeal,
                        }}
                      >
                        {email.subject || "(No subject)"}
                      </p>

                      {/* PREVIEW */}
                      <p
                        className="mt-1 truncate text-xs leading-5"
                        style={{
                          color: COLORS.muted,
                        }}
                      >
                        {email.snippet || "No preview available"}
                      </p>
                    </div>

                  {/* DATE */}
                  <div className="hidden shrink-0 text-right sm:block">
                    <p
                      className="text-xs font-medium"
                      style={{ color: COLORS.muted }}
                    >
                      {email.date
                        ? new Date(
                            email.date
                          ).toLocaleDateString()
                        : "—"}
                    </p>

                    {email.is_starred && (
                      <Star
                        size={14}
                        fill="currentColor"
                        className="ml-auto mt-2"
                        style={{ color: "#C78A3A" }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* =================================================
    TRASH SUCCESS POPUP
================================================= */}

{trashSuccess && (
  <div className="fixed right-6 top-6 z-100 w-[calc(100%-3rem)] max-w-sm">
    <div
      className="relative overflow-hidden rounded-2xl border p-4"
      style={{
        backgroundColor: COLORS.warmWhite,
        borderColor: "#CFE3D8",
        boxShadow: "0 20px 50px rgba(16,63,66,0.18)",
      }}
    >
      {/* Top accent */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{
          backgroundColor: COLORS.teal,
        }}
      />

      <div className="flex items-start gap-3">
        {/* Success icon */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: COLORS.tealLight,
            color: COLORS.teal,
          }}
        >
          <CheckSquare size={21} />
        </div>

        {/* Message */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p
              className="text-sm font-bold"
              style={{
                color: COLORS.darkTeal,
              }}
            >
              Moved to Trash
            </p>

            <button
              onClick={() => setTrashSuccess(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-[#F1EEE8]"
              style={{
                color: COLORS.muted,
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p
            className="mt-1 text-xs leading-5"
            style={{
              color: COLORS.muted,
            }}
          >
            {trashSuccess.message}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{
                backgroundColor: COLORS.softPeach,
                color: "#9A5B1B",
              }}
            >
              {trashSuccess.count}{" "}
              {trashSuccess.count === 1
                ? "EMAIL"
                : "EMAILS"}
            </span>

            <span
              className="text-[11px]"
              style={{
                color: COLORS.muted,
              }}
            >
              Removed from Explorer
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.75 w-full origin-left"
        style={{
          backgroundColor: COLORS.teal,
          animation: "shrinkToast 4s linear forwards",
        }}
      />
    </div>
  </div>
)}



{/* =================================================
    TRASH CONFIRMATION MODAL
================================================= */}

{trashConfirm && (
  <div
    className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    onClick={() => setTrashConfirm(false)}
  >
    <div
      className="w-full max-w-md overflow-hidden rounded-3xl border"
      style={{
        backgroundColor: COLORS.warmWhite,
        borderColor: COLORS.beige,
        boxShadow: "0 30px 80px rgba(16,63,66,0.22)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* TOP SECTION */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">

          {/* ICON */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "#F8ECE8",
              color: "#A64032",
            }}
          >
            <Trash2 size={22} />
          </div>

          {/* TITLE */}
          <div className="flex-1">
            <h3
              className="text-lg font-bold"
              style={{
                color: COLORS.darkTeal,
              }}
            >
              Move emails to Trash?
            </h3>

            <p
              className="mt-1 text-sm leading-6"
              style={{
                color: COLORS.muted,
              }}
            >
              You're about to move{" "}
              <span
                className="font-bold"
                style={{
                  color: COLORS.darkTeal,
                }}
              >
                {selectedEmails.length}{" "}
                {selectedEmails.length === 1
                  ? "email"
                  : "emails"}
              </span>{" "}
              to Trash.
            </p>
          </div>

          {/* CLOSE */}
          <button
            onClick={() => setTrashConfirm(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[#F1EEE8]"
            style={{
              color: COLORS.muted,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* INFO BOX */}
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            backgroundColor: "#FBF7F0",
            borderColor: COLORS.beige,
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              size={16}
              style={{
                color: "#A85F19",
              }}
            />

            <p
              className="text-xs font-semibold"
              style={{
                color: COLORS.text,
              }}
            >
              You can find these emails in Gmail Trash.
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div
        className="flex items-center justify-end gap-3 border-t px-6 py-4"
        style={{
          borderColor: "#F0EBE2",
          backgroundColor: "#FBF7F0",
        }}
      >
        <button
          onClick={() => setTrashConfirm(false)}
          disabled={emailActionLoading}
          className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-50"
          style={{
            borderColor: COLORS.beige,
            backgroundColor: COLORS.warmWhite,
            color: COLORS.darkTeal,
          }}
        >
          Cancel
        </button>

        <button
          onClick={confirmTrashSelectedEmails}
          disabled={emailActionLoading}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
          style={{
            backgroundColor: "#A64032",
            boxShadow: "0 8px 18px rgba(166,64,50,0.20)",
          }}
        >
          <Trash2 size={16} />

          {emailActionLoading
            ? "Moving..."
            : "Move to Trash"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* =================================================
          FUTURE EMAIL ACTION AREA
      ================================================= */}

   {selectedEmail && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-md"
    onClick={closeEmailViewer}
  >
    <div
      className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border"
      style={{
        backgroundColor: COLORS.warmWhite,
        borderColor: "#E7DED0",
        boxShadow: "0 35px 100px rgba(16,63,66,0.25)",
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* =================================================
          HEADER
      ================================================= */}
      <div
        className="shrink-0 border-b px-7 py-5"
        style={{
          borderColor: "#EEE7DC",
          backgroundColor: "#FFFCF7",
        }}
      >
        <div className="flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            <button
              onClick={closeEmailViewer}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                backgroundColor: COLORS.cream,
                borderColor: COLORS.beige,
                color: COLORS.darkTeal,
              }}
            >
              <X size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <MailOpen
                  size={18}
                  style={{ color: COLORS.teal }}
                />

                <p
                  className="text-sm font-bold"
                  style={{ color: COLORS.darkTeal }}
                >
                  Email Viewer
                </p>
              </div>

              <p
                className="mt-0.5 text-xs"
                style={{ color: COLORS.muted }}
              >
                Full email conversation
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="hidden rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider sm:block"
            style={{
              backgroundColor: COLORS.tealLight,
              color: COLORS.teal,
            }}
          >
            Email
          </div>
        </div>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}
      {emailViewerLoading ? (
        <div className="flex min-h-105 items-center justify-center">
          <div className="text-center">

            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: COLORS.tealLight,
                color: COLORS.teal,
              }}
            >
              <RefreshCw
                size={24}
                className="animate-spin"
              />
            </div>

            <p
              className="mt-4 text-sm font-bold"
              style={{ color: COLORS.darkTeal }}
            >
              Opening email...
            </p>

            <p
              className="mt-1 text-xs"
              style={{ color: COLORS.muted }}
            >
              Loading the complete message
            </p>
          </div>
        </div>
      ) : (

        <div className="min-h-0 flex-1 overflow-hidden">

          {/* =================================================
              EMAIL HEADER / DETAILS
          ================================================= */}
          <div
            className="shrink-0 border-b px-7 py-6"
            style={{
              borderColor: "#EEE7DC",
              backgroundColor: "#FFFFFF",
            }}
          >

            {/* SUBJECT */}
            <h2
              className="max-w-4xl text-xl font-extrabold leading-8 tracking-[-0.02em] sm:text-2xl"
              style={{ color: COLORS.darkTeal }}
            >
              {selectedEmail.subject || "(No subject)"}
            </h2>

            {/* SENDER ROW */}
            <div className="mt-6 flex items-start gap-4">

              {/* AVATAR */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
                style={{
                  backgroundColor: COLORS.tealLight,
                  color: COLORS.teal,
                }}
              >
                {(selectedEmail.from || "U")
                  .replace(/<.*?>/g, "")
                  .trim()
                  .charAt(0)
                  .toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">

                {/* FROM */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className="text-sm font-bold"
                    style={{ color: COLORS.darkTeal }}
                  >
                    {selectedEmail.from || "Unknown sender"}
                  </span>

                  {selectedEmail.is_important && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: COLORS.softPeach,
                        color: "#9A5B1B",
                      }}
                    >
                      Important
                    </span>
                  )}
                </div>

                {/* TO */}
                <p
                  className="mt-1 text-xs"
                  style={{ color: COLORS.muted }}
                >
                  to{" "}
                  <span style={{ color: COLORS.text }}>
                    {selectedEmail.to || "me"}
                  </span>
                </p>

                {/* DATE */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Clock3
                    size={13}
                    style={{ color: COLORS.muted }}
                  />

                  <span
                    className="text-[11px]"
                    style={{ color: COLORS.muted }}
                  >
                    {selectedEmail.date
                      ? new Date(selectedEmail.date).toLocaleString()
                      : "Date unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              EMAIL BODY
          ================================================= */}
          <div className="max-h-[calc(92vh-265px)] overflow-y-auto px-7 py-7">

            <div
              className="mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#EDE4D7",
                boxShadow: "0 8px 30px rgba(16,63,66,0.05)",
              }}
            >

              {/* MESSAGE LABEL */}
              <div className="mb-5 flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COLORS.teal }}
                />

                <span
                  className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
                  style={{ color: COLORS.muted }}
                >
                  Message
                </span>
              </div>

              {/* BODY */}
              {sanitizedEmailHtml ? (
                <div
                  className="email-html-content text-sm leading-7"
                  dangerouslySetInnerHTML={{ __html: sanitizedEmailHtml }}
                />
              ) : (
                <div
                  className="whitespace-pre-wrap warp-break-words text-sm leading-7"
                  style={{ color: COLORS.text }}
                >
                  {selectedEmail.body || "This email has no readable text content."}
                </div>
)}

            </div>
          </div>

        </div>
      )}
    </div>
  </div>
)}

      {/* =================================================
          FUTURE EMAIL ACTION AREA
      ================================================= */}

    </div>
   );

  <style>{`
    @keyframes shrinkToast {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }
  `}</style>
}