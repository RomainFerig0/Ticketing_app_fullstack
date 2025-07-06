"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "http://localhost:3001";

export default function AdminPage() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [filterType, setFilterType] = useState("active");
  const [filterValue, setFilterValue] = useState("");
  const [editingTicket, setEditingTicket] = useState(null);
  const [editedData, setEditedData] = useState({});
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
      setToken({ token, decoded }); // <<<<< set the token here!
      setCheckingAuth(false);
    } catch {
      router.push("/");
    }
  }, [router]);

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
      const token = localStorage.getItem("jwt");
      const email = localStorage.getItem("email");
      const id = localStorage.getItem("userId");

      await axios.patch(`${API_URL}/api/tickets/tickets/${ticketId}`, editedData, {headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": email,
          "x-user-id": id,
        },
      }
      );
      setMessage("Ticket mis à jour.");
      setEditingTicket(null);
      setEditedData({});
      fetchTickets();
    } catch(err) {
      console.error(err);
      setError("Erreur lors de la mise à jour");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterType, filterValue]);

  if (checkingAuth) return <p>Vérification de l'authentification...</p>;

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
              {ticket.title}
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
              <select
                value={editedData.priority || ticket.priority}
                onChange={(e) =>
                  setEditedData({ ...editedData, priority: Number(e.target.value)})
                }
              >
                <option value="0">Aucune</option>
                <option value="1">Basse</option>
                <option value="2">Moyenne</option>
                <option value="3">Haute</option>
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
              <p><strong>Enregistré à:</strong> {ticket.submit_time}</p>
              <p><strong>Auteur:</strong> {ticket.email}</p>
              <p><strong>Motif:</strong> {ticket.motive}</p>
              <p><strong>Status:</strong> {ticket.status}</p>
              <p><strong>Priorité:</strong> {ticket.priority}</p>
              <p><strong>Description:</strong> {ticket.description}</p>
              <button onClick={() => setEditingTicket(ticket._id)}>✏️ Modifier</button>
              <button onClick={() => handleDelete(ticket._id)}>❌ Supprimer</button>
            </>
          )}
          </div>
        ))
      )}
    </div>
  );
}
