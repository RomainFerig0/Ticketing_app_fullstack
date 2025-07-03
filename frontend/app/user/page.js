"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
const API_URL = "http://localhost:3001";

export default function UserPage() {
  const [form, setForm] = useState({
    title: "",
    motive: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [token, setToken] = useState(null);
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "user") {
        router.push("/unauthorized");
        return;
      }
      setToken({ token, decoded }); // <<<<< set the token here!
      setCheckingAuth(false);
    } catch {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetchUserTickets(token.token, token.decoded.email);
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/tickets/tickets`, form, {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "x-user-id": token.decoded.id,
          "x-user-email": token.decoded.email,
          "Content-Type": "application/json",
        },
      });

      setMessage("🎉 Ticket envoyé avec succès !");
      setForm({ title: "", motive: "", description: "" });
      fetchUserTickets(token.token, token.decoded.email);
    } catch (err) {
      console.error("Erreur lors de la soumission :", err);
      setMessage("❌ Erreur lors de l'envoi du ticket.");
    }
  };

  const fetchUserTickets = async (token, email) => {
    try {
      const res = await axios.get(`${API_URL}/api/tickets/tickets/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": email,
        },
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des tickets :", err);
      setTickets([]);
    }
  };

if (checkingAuth) return <p>Vérification de l'authentification...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {!token ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1 style={styles.title}>🎫 Soumettre un Ticket</h1>
            <p style={styles.subtitle}>Veuillez remplir le formulaire ci-dessous</p>

            {message && (
              <p
                style={{
                  ...styles.message,
                  color: message.includes("🎉") ? "green" : "red",
                }}
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                name="title"
                placeholder="Titre du ticket"
                value={form.title}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <select
                name="motive"
                value={form.motive}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">-- Motif --</option>
                <option value="software">💻 Logiciel</option>
                <option value="hardware">🖥️ Matériel</option>
                <option value="other">❓ Autre</option>
              </select>

              <textarea
                name="description"
                placeholder="Décrivez le problème"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                style={{ ...styles.input, resize: "vertical" }}
              />

              <button type="submit" style={styles.button}>
                🚀 Envoyer
              </button>
            </form>

            <div style={styles.divider}></div>

            <h2 style={styles.subtitle}>📋 Vos tickets en cours</h2>
            {tickets.length === 0 ? (
              <p>Aucun ticket actif pour le moment.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket._id} style={styles.ticket}>
                  <p><strong>Titre:</strong> {ticket.title}</p>
                  <p><strong>Submitted at:</strong> {ticket.submit_time}</p>
                  <p><strong>Statut:</strong> {ticket.status}</p>
                  <p><strong>Motive:</strong> {ticket.motive}</p>
                  <p><strong>Description:</strong> {ticket.description}</p>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "4rem",
    backgroundColor: "#f2f2f2",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "600px",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#555",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "1rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  message: {
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  divider: {
    marginTop: "2rem",
    borderTop: "1px solid #ddd",
    marginBottom: "1rem",
  },
  ticket: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#fafafa",
  },
};