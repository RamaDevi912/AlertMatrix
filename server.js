// ✅ server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/loginRoute');
const proRoute = require('./routes/profileRoute');
const postRoute = require('./routes/postRoute');
const commentLikeRoute = require('./routes/commentLikeRoute');
const ForgotRoute = require('./routes/ForgotRoute');
const app = express();
const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });
// module.exports.io = io;
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Store io in app context


app.use('/api', authRoutes);
app.use('/api', proRoute);
app.use('/incidents', postRoute);
app.use('/interact', commentLikeRoute);
app.use('/api',ForgotRoute);

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));