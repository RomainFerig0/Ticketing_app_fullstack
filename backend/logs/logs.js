require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const userDB = process.env.MYSQL_USER;
const passwordDB = process.env.MYSQL_MDP;
const dbDatabase = process.env.MYSQL_DB;
const cors = require('cors');
let mysql = require('mysql2');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

let conn;

try{
    console.log("Connecting to the MySQL database...")
    conn = mysql.createConnection({
      host: 'localhost',
      user: userDB,
      password: passwordDB,
      database: dbDatabase
    });
} catch(err){
  res.status(500).json({err : "MySQL connection failed."});
}

conn.connect(function(err) {
  console.log("MySQL connection established.")
  if (err) throw err;

  let sql = `CREATE TABLE IF NOT EXISTS ticket_logs 
  (id INT AUTO_INCREMENT PRIMARY KEY, 
  ticket VARCHAR(32), 
  user VARCHAR(32), 
  user_email VARCHAR(32), 
  event VARCHAR(64), 
  details JSON)`;

  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Database initialized.");
  });
});

port = 4002

app.post("/logs", async (req, res) => { // Log an activity
  try{
    let sql = `INSERT INTO ticket_logs (ticket, user, user_email, event, details)
                VALUES (?, ?, ?, ?, ?)`
    let params = [
      req.body.ticket,
      req.body.user,
      req.body.user_email,
      req.body.event,
      JSON.stringify(req.body.details)
    ];

    const log = {
      ticket : req.body.ticket,
      user : req.body.user,
      user_email : req.body.user_email,
      event : req.body.event,
      details : JSON.stringify(req.body.details)
    }

    conn.query(sql, params);

    res.json({log});
  }catch(err){
    console.error("Error creating log:", err);
    res.status(500).json({err : "Error during log registration."})

  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Log microservice listening on http://localhost:${port}`);
  });
}