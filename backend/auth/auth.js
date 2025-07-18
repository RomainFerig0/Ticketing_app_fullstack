require('dotenv').config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();
const secretKey = process.env.SECRET_KEY;
const secretApiKey = process.env.API_KEY
const cors = require('cors');
const userSchema = require('../models/users');
const mongoose = require('mongoose');

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

port = 4000

const User = conn.model('User', userSchema);

app.post("/login", async (req, res) => { // Authentification (log-in) route
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email : email, password: password});

    if (user) {
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, secretKey, {expiresIn: "1h",});
        res.json({ token });

    } else if (!user) {
        res.status(401).json({ message: "Invalid credentials : Email or password is incorrect." });

    }
  }catch(err){
    console.error("Error during login :", err);
    res.status(500).json({err : "Error during login. Please try again."})

  }
});

app.post("/register", async (req, res) => { // Register/sign-in route

  try {

    const user = new User({name : req.body.name, email : req.body.email, role : req.body.role, password : req.body.password})
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, secretKey, {expiresIn: "1h",});
    res.json({ token });

  } catch (err) {
    console.error("Error during registration :", err);
    res.status(500).json({ err: "Error during registration. Please try again." });

  }
});

function checkAccess() {
    return (req, res, next) => {
        if (req.headers['x-secret-apikey'] !== secretApiKey){
            return res.status(403).json({message : "Access forbidden. Access this endpoint using a valid URL."})
            }
        next();
    };
}
function checkRole(role) { // Middleware function to check the user's role
    return (req, res, next) => {
        if (req.headers['x-user-role'] !== role) {
            return res.status(403).json({ message: "Access forbidden: you do not have the required authorization(s)." });
            }
        next();
    };
}

function verifyToken(req, res, next) { // Middleware function to check the JWT
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Forbidden." });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized: failed to validate token."});
        }
        req.user = decoded;
        next();
    });
}


const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/google-login", async (req, res) => {
  const { token, admin_secret } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const role = admin_secret === process.env.ADMIN_SECRET ? "admin" : "user";
      user = new User({
        name,
        email,
        password: sub,
        role
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      secretKey,
      { expiresIn: "1h" }
    );

    res.json({ token: jwtToken });
  } catch (err) {
    console.error("Google login failed", err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

module.exports = {checkAccess, checkRole, verifyToken};

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Auth microservice listening on http://localhost:${port}`);
  });
}