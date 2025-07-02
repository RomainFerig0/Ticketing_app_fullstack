
//backend/gateway/gateway.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

port = 3001

const {verifyToken, checkAccess} = require('../auth/auth');

function forwardCredentials(req, res, next) {
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-email'] = req.user.email;
    req.headers['x-user-role'] = req.user.role;
    req.headers['x-secret-apikey'] = 'My-Securized-Secret:forrealthistime';
    next();
}

// Proxy each service
app.use('/api/auth', 
    createProxyMiddleware(
        { 
            target: 'http://localhost:4000',
            changeOrigin: true,
            pathRewrite: {'^/api/auth': '',}
        }
    ));

app.use('/api/tickets',
    verifyToken,
    forwardCredentials,
    createProxyMiddleware(
        { 
            target: 'http://localhost:4001', 
            changeOrigin: true, 
            pathRewrite: {'^/api/tickets': ''},
        }
    ));

app.listen(3001, () => {
    console.log(`Gateway listening on http://localhost:3001`);
});