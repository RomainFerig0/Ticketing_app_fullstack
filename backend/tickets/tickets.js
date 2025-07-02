const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const ticketSchema = require('../models/tickets');
const mongoose = require('mongoose');
const {checkRole, checkAccess} = require('../auth/auth');


/*
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});*/

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/ProjectDB');
conn.on('connected', () => {
  console.log('MongoDB connection established');
});
conn.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

API_URL = "http://localhost:4002"
port = 4001
const Ticket = conn.model('Ticket', ticketSchema);

async function log_activity({ ticket, user, user_email, event, details }) {
  const response = await fetch(`${API_URL}/logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket, user, user_email, event, details }),

  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Logging failed.");

  }
  return data;

}

app.post("/tickets", checkAccess(), async (req, res) => { // Create a new ticket
  try {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    console.log("créer ticket")
    const ticket = new Ticket(
      {
        title : req.body.title,
        email : userEmail,
        motive : req.body.motive,
        description : req.body.description
      });
    console.log("save ticket")

    await ticket.save();
    console.log("créer log")

    const new_log = await log_activity({
    ticket: ticket._id,
    user: userId,
    user_email: userEmail,
    event : 'Creating a new ticket',
    details : {
      title : req.body.title,
      date : Date.now()
    }
    });
    console.log("créer tsave logicket")

    res.json({ticket, "log": new_log});

  } catch (err) {
    res.status(500).json({ err: "Ticket could not be registered." });

  }
});

app.get("/tickets/user", checkAccess(), checkRole("user"), async (req, res) => { // Get all active tickets for the user currently logged in
  try {
    const userEmail = req.headers['x-user-email'];
    const tickets = await Ticket.find({email : userEmail, status: { $in: ["open", "pending"] }});

    if (tickets.length > 0){
      res.json(tickets);

    } else if (tickets.length === 0){
      res.status(404).json({ message : "There is currently no ticket in this category."});

    }
  } catch (err) {
    res.status(500).json({ err: "Error during the fetching of the tickets." });

  }
});

app.get("/tickets/active", checkAccess(), checkRole("admin"), async (req, res) => { // Get all active tickets
  try {
    const tickets = await Ticket.find({ status: { $in: ["open", "pending"] } });

    if (tickets.length > 0){
      res.json(tickets);

    } else if (tickets.length === 0) {
    res.status(404).json({message : "There is currently no active ticket."})
    }
  } catch (err) {
    res.status(500).json({ err: "Error during ticket research." });

  }
});

app.get("/tickets/:motive", checkAccess(), checkRole("admin"), async (req, res) => { // Get all tickets for a specific motive
  try {
    const tickets = await Ticket.find({motive : req.params.motive});

    if (tickets.length > 0){
      res.json(tickets);

    } else if (tickets.length === 0){
      res.status(404).json({ message : "There is currently no ticket in this category."});

    }
  } catch (err) {
    res.status(500).json({ err: "Error during the fetching of the tickets." });

  }
});

app.get("/tickets/:status", checkAccess(), checkRole("admin"), async (req, res) => { // Get all tickets by status
  try {
    const tickets = await Ticket.find({status : req.params.status});

    if (tickets.length > 0){
      res.json({tickets});

    } else if (tickets.length === 0){
      res.status(404).json({ message : "There is currently no ticket with this status."});

    }
  } catch (err) {
    res.status(500).json({ err: "Error during the fetching of the tickets." });

  }
});

app.delete("/tickets/:id", checkAccess(), checkRole("admin"), async (req, res) => { // Delete a specific ticket
try{
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];

  const ticketId = req.params.id
  const ticket = await Ticket.findByIdAndDelete(ticketId)

  if (ticket) {
    const new_log = await log_activity({
    ticket: ticket._id,
    user: userId,
    user_email: userEmail,
    event : 'Deleting a ticket',
    details : {
      title : ticket.title,
      date : Date.now()
    }
    });

    /*
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: userEmail,
      subject: `${ticket.email} : Ticket Deleted`,
      text: req.body.description,
    });*/

    res.json({"Ticket successfully deleted" : ticket, "log": new_log});

  } else if (!ticket){
    res.status(404).json({message : "Could not find the ticket to delete."})

  }
} catch (err){
  res.status(500).json({err : "Error while deleting the ticket."})

}
});

app.patch("/tickets/:id", checkAccess(), checkRole("admin"), async (req, res) => { // Modify a specific ticket
  try{
    const ticketId = req.params.id;

    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    const updatedData = req.body;
    const ticket = await Ticket.findByIdAndUpdate(ticketId, updatedData, {new: true});

    if (ticket){
      const new_log = await log_activity({
      ticket: ticket._id,
      user: userId,
      user_email: userEmail,
      event : 'Updating a ticket',
      details : {
        title : ticket.title,
        updated_data : updatedData,
        date : Date.now()
      }
      });

      res.json({"Ticket successfully updated" : ticket, "log": new_log});

    } else if (!ticket){
      res.status(404).json({message : "Could not find the ticket to update."});

    }
} catch (err){
  res.status(500).json({error : "Error while updating the ticket."})

}
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Ticket microservice listening on http://localhost:${port}`);
  });
}
