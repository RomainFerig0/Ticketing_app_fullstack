// backend/tickets/routes.js
const express = require("express");
const app = express();
const Ticket = require("../models/tickets");
const { verifyToken, checkRole } = require("../auth/auth");
port = 4001
// 📌 Création d’un ticket (accessible aux utilisateurs connectés)
app.post("/", verifyToken, checkRole("user"), async (req, res) => {
  try {
    console.log("📥 Reçu :", req.body);
    console.log("👤 Utilisateur :", req.user);
    const { title, motive, description } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const newTicket = new Ticket({
      title,
      motive,
      description,
      user: {
        id: userId,
        email: userEmail,
      },
    });

    await newTicket.save();

    res.status(201).json({ message: "🎉 Ticket créé avec succès !" });
  } catch (err) {
    console.error("❌ Erreur lors de la création du ticket :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// 📥 Récupérer tous les tickets (ex : pour les admins ou tests)
app.get("/", verifyToken, async (req, res) => {
  console.log("🔎 Header reçu :", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  const jwt = require("jsonwebtoken");  
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des tickets :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Ticket microservice listening on http://localhost:${port}`);
  });
}

module.exports = app;
