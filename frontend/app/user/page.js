//app/user/page.js
"use client";

import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001"; // Gateway

export default function UserPage() {
  const [form, setForm] = useState({
    title: "",
    motive: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("jwt");

      // ✅ Log pour vérification
      console.log("📤 Envoi du ticket :", form);
      console.log("🔐 Token :", token);

      const res = await axios.post(`${API_URL}/api/tickets`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // 🔧 obligatoire
        },
      });

      setMessage("🎉 Ticket envoyé !");
      setForm({ title: "", motive: "", description: "" });
    } catch (err) {
      console.error("❌ Erreur lors de l'envoi du ticket :", err);
      setMessage("Erreur lors de l'envoi du ticket.");
    }
  };

  return (
    <div>
      <h1>Bienvenue sur ton espace utilisateur</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Titre"
          value={form.title}
          onChange={handleChange}
          required
        />

        <select
          name="motive"
          value={form.motive}
          onChange={handleChange}
          required
        >
          <option value="">-- Sélectionner un motif --</option>
          <option value="software">Logiciel</option>
          <option value="hardware">Matériel</option>
          <option value="other">Autre</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <button type="submit">Envoyer le ticket</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
