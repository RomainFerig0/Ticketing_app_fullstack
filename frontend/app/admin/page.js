"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001";

export default function AdminPage() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState("active");
  const [filterValue, setFilterValue] = useState("");
  const [editingTicket, setEditingTicket] = useState(null);
  const [editedData, setEditedData] = useState({});

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const email = localStorage.getItem("email");
      const id = localStorage.getItem("userId");

      let url = `${API_URL}/api/tickets/tickets/active`;
      if (filterType === "motive" && filterValue) {
        url = `${API_URL}/api/tickets/tickets/motive/${filterValue}`;
      } else if (filterType === "status" && filterValue) {
        url = `${API_URL}/api/tickets/tickets/status/${filterValue}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": email,
          "x-user-id": id,
        },
      });

      setTickets(res.data.tickets || res.data); // adapt to response structure
      setError("");
    } catch (err) {
      console.error(err);
      setTickets([]);
      if (err.response?.status === 404) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors du chargement des tickets.");
      }
    }
  };

  const handleDelete = async (ticketId) => {
    try {
      const token = localStorage.getItem("jwt");
      const email = localStorage.getItem("email");
      const id = localStorage.getItem("userId");

      await axios.delete(`${API_URL}/api/tickets/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": email,
          "x-user-id": id,
        },
      });

      setMessage("✅ Ticket supprimé.");
      fetchTickets(); // refresh
    } catch (err) {
      console.error(err);
      setError("❌ Erreur lors de la suppression.");
    }
  };

  const handleUpdate = async (ticketId) => {
    try {
      await axios.patch(`${API_URL}/api/tickets/tickets/${ticketId}`, editedData, {
        headers: getAuthHeaders(),
      });
      setMessage("Ticket mis à jour.");
      setEditingTicket(null);
      setEditedData({});
      fetchTickets();
    } catch {
      setError("Erreur lors de la mise à jour.");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterType, filterValue]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎟️ Admin Panel - Tickets</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Filtrer par:{" "}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="active">Actifs</option>
            <option value="motive">Motif</option>
            <option value="status">Statut</option>
          </select>
        </label>

        {filterType !== "active" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            {filterType === "motive" && (
              <>
                <option value="">-- Choisissez un motif --</option>
                <option value="software">💻 Logiciel</option>
                <option value="hardware">🖥️ Matériel</option>
                <option value="other">❓ Autre</option>
              </>
            )}

            {filterType === "status" && (
              <>
                <option value="">-- Choisissez un statut --</option>
                <option value="open">🟢 Ouvert</option>
                <option value="pending">🕓 En attente</option>
                <option value="closed">🔒 Fermé</option>
              </>
            )}
          </select>
        )}

      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {tickets.length === 0 && !error ? (
        <p>Aucun ticket à afficher.</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket._id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
            }}
          >
            {editingTicket === ticket._id ? (
            <>
              <input
                type="text"
                placeholder="Titre"
                value={editedData.title || ticket.title}
                onChange={(e) =>
                  setEditedData({ ...editedData, title: e.target.value })
                }
              />
              <select
                value={editedData.status || ticket.status}
                onChange={(e) =>
                  setEditedData({ ...editedData, status: e.target.value })
                }
              >
                <option value="open">Ouvert</option>
                <option value="pending">En attente</option>
                <option value="closed">Fermé</option>
              </select>
              <textarea
                rows={3}
                placeholder="Description"
                value={editedData.description || ticket.description}
                onChange={(e) =>
                  setEditedData({ ...editedData, description: e.target.value })
                }
              />
              <button onClick={() => handleUpdate(ticket._id)}>💾 Sauvegarder</button>
              <button onClick={() => setEditingTicket(null)}>❌ Annuler</button>
            </>
          ) : (
            <>
              <p><strong>Titre:</strong> {ticket.title}</p>
              <p><strong>Motif:</strong> {ticket.motive}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Description:</strong> {ticket.description}</p>
              <button onClick={() => setEditingTicket(ticket._id)}>✏️ Modifier</button>
              <button onClick={() => handleDelete(ticket._id)}>❌ Supprimer</button>
            </>
          )}
            <p><strong>Titre:</strong> {ticket.title}</p>
            <p><strong>Motif:</strong> {ticket.motive}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Description:</strong> {ticket.description}</p>
            <button onClick={() => setEditingTicket(ticket._id)}>✏️ Modifier</button>
            <button onClick={() => handleDelete(ticket._id)} style={{ marginTop: "0.5rem" }}>
              ❌ Supprimer
            </button>
          </div>
        ))
      )}
    </div>
  );
}
