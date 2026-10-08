import { createContext, useContext, useEffect, useState } from "react";

const TicketContext = createContext(null);

const API_URL = "http://127.0.0.1:8000";

const mapDatabaseTicket = (ticket) => ({
  ...ticket,
  displayId: `TKT-${ticket.id.slice(0, 8).toUpperCase()}`,
  intent: "Not analyzed",
  sentiment: ticket.sentiment || "Not analyzed",
  confidence: "Pending",
  article: "None",
  reply: "",
  messages: [
    {
      sender: "customer",
      text: ticket.message,
      time: ticket.created_at,
    },
  ],
});

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(() => {
      const savedSettings = localStorage.getItem("supportAISettings");

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return parsedSettings.emailNotifications ?? true;
      }

      return true;
    });

  useEffect(() => {
    const checkSettings = () => {
      const savedSettings = localStorage.getItem("supportAISettings");

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        setEmailNotificationsEnabled(
          parsedSettings.emailNotifications ?? true
        );
      }
    };

    const interval = setInterval(checkSettings, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await fetch(`${API_URL}/tickets`);

        if (!response.ok) {
          throw new Error("Failed to load tickets");
        }

        const data = await response.json();
        const databaseTickets = data.map(mapDatabaseTicket);

        setTickets((current) => {
          const ticketMap = new Map();

          [...current, ...databaseTickets].forEach((ticket) => {
            ticketMap.set(ticket.id, ticket);
          });

          const updatedTickets = Array.from(ticketMap.values());

          const newTickets = databaseTickets.filter(
            (newTicket) =>
              !current.some(
                (existingTicket) => existingTicket.id === newTicket.id
              )
          );

          if (
            emailNotificationsEnabled &&
            newTickets.length > 0 &&
            "Notification" in window
          ) {
            newTickets.forEach((ticket) => {
              if (Notification.permission === "granted") {
                new Notification("New Support Ticket", {
                  body: `${ticket.customer || "Customer"}: ${ticket.subject}`,
                });
              }
            });
          }

          return updatedTickets;
        });
      } catch (error) {
        console.error("Error loading tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();

    const interval = setInterval(loadTickets, 10000);

    return () => clearInterval(interval);
  }, [emailNotificationsEnabled]);

  const updateTicket = async (id, updates) => {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error("Failed to update ticket");
    }

    const updatedTicket = await response.json();

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === id
          ? { ...ticket, ...updatedTicket }
          : ticket
      )
    );

    return updatedTicket;
  };

  const deleteTicket = async (id) => {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.detail || "Failed to delete ticket"
      );
    }

    setTickets((currentTickets) =>
      currentTickets.filter((ticket) => ticket.id !== id)
    );

    return true;
  };

  const createTicket = async (ticketData) => {
    const response = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      throw new Error("Failed to create ticket");
    }

    const savedTicket = await response.json();
    const newTicket = mapDatabaseTicket(savedTicket);

    setTickets((currentTickets) => [
      newTicket,
      ...currentTickets,
    ]);

    return newTicket;
  };

  const sendMessage = async (ticketId, content) => {
    const response = await fetch(
      `${API_URL}/tickets/${ticketId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: "agent",
          content,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const savedMessage = await response.json();

    const newMessage = {
      id: savedMessage.id,
      sender: savedMessage.sender,
      text: savedMessage.content,
      time: savedMessage.created_at,
    };

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              messages: [...(ticket.messages || []), newMessage],
            }
          : ticket
      )
    );

    return newMessage;
  };

  const loadMessages = async (ticketId) => {
    const response = await fetch(
      `${API_URL}/tickets/${ticketId}/messages`
    );

    if (!response.ok) {
      throw new Error("Failed to load messages");
    }

    const data = await response.json();

    const databaseMessages = data
      .filter((message) => message.sender !== "ai_suggestion")
      .map((message) => ({
        id: message.id,
        sender: message.sender,
        text: message.content,
        html_body: message.html_body,
        time: message.created_at,
      }));

    const aiSuggestion = data
      .filter((message) => message.sender === "ai_suggestion")
      .at(-1);

    setTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;

        // Preserve the original customer message if it isn't in the database.
        const hasCustomerMessage = databaseMessages.some(
          (message) => message.sender === "customer"
        );

        const originalMessage = hasCustomerMessage
          ? []
          : [
              {
                sender: "customer",
                text: ticket.message,
                time: "Original message",
              },
            ];

        return {
          ...ticket,
          messages: [...originalMessage, ...databaseMessages],
          reply: aiSuggestion?.content || ticket.reply || "",
        };
      })
    );

    return databaseMessages;
  };

  const loadActivities = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/tickets/${id}/activities`
      );

      if (!response.ok) {
        throw new Error("Failed to load ticket activities");
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading ticket activities:", error);
      throw error;
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        updateTicket,
        deleteTicket,
        createTicket,
        sendMessage,
        loadMessages,
        loadActivities,
        loading,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error("useTickets must be used inside TicketProvider");
  }

  return context;
}