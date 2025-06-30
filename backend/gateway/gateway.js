const express = require('express');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const secretApiKey = process.env.API_KEY;

app.use(cors());
const {verifyToken} = require('../auth/auth');

port = 3001

function forwardCredentials(req, res, next) {
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-email'] = req.user.email;
    req.headers['x-user-role'] = req.user.role;
    req.headers['x-secret-apikey'] = secretApiKey;
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

app.listen(port, () => {
    console.log(`Gateway listening on http://localhost:${port}`);
});