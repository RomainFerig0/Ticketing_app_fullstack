const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const logSchema = require('../models/logs');
const mongoose = require('mongoose');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/Project_DB_log');

conn.on('connected', () => {
  console.log('MongoDB connection established');
});
conn.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

port = 4002

const Log = conn.model('Log', logSchema);

app.post("/logs", async (req, res) => { // Log an activity

  try{
    const log = new Log(
      {
        ticket : req.body.ticket, 
        user : req.body.user, 
        user_email : req.body.user_email,
        event : req.body.event,
        details : req.body.details
      })
    await log.save();
    res.json(log)
  }catch(err){
    res.status(500).json({err : "Error during log registration."})
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Log microservice listening on http://localhost:${port}`);
  });
}