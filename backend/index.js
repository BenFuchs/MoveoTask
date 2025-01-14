const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const port = 8080;
const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlock');  
const { Server } = require('socket.io');
const http = require('http');
dotenv.config();

app.use(express.json());
app.use(cors());

const mongodbURL = process.env.MONGO_URL;

mongoose.connect(mongodbURL)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomUserCount = {}; // Stores the number of users per room

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  let currentRoomId;

  socket.on('joinRoom', (roomId) => {
    if (!roomUserCount[roomId]) {
      roomUserCount[roomId] = 0; 
    }

    let userRole;
    // Check if the user is the first one to join the room
    if (roomUserCount[roomId] === 0) {
      userRole = 'Mentor';
    } else {
      userRole = `Student ${roomUserCount[roomId]}`;
    }

    roomUserCount[roomId]++;

    currentRoomId = roomId;

    console.log(`User ${userRole} attempting to join room: ${roomId}`);
    socket.join(roomId); // Join the room
    console.log(`User ${userRole} joined room: ${roomId}`);
    console.log(`Current members in room ${roomId}:`, Array.from(io.sockets.adapter.rooms.get(roomId) || []));

    socket.emit('newUser', { userRole });
  });

  // Listen for code edits
  socket.on('editCode', ({ roomId, updatedCode }) => {
    socket.to(roomId).emit('codeUpdate', updatedCode); // Emit to all clients in the room except the sender
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    if (currentRoomId) {
      roomUserCount[currentRoomId]--;

      if (roomUserCount[currentRoomId] <= 0) {
        roomUserCount[currentRoomId] = 0;
      }

      console.log('A user disconnected:', socket.id);
      console.log(`Updated user count for room ${currentRoomId}: ${roomUserCount[currentRoomId]}`);
    }
  });
});

// testing endpoint
app.get('/test', (req, res) => {
  res.send('test');
});

// GET endpoint to get all of the codeblocks (use this for selection page)
app.get('/api/codeblocks', async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find();
    if (!codeBlocks || codeBlocks.length === 0) {
      return res.status(404).json({ message: 'No code blocks found' });
    }
    res.status(200).json(codeBlocks);
  } catch (error) {
    console.error('Error fetching code blocks:', error);
    res.status(500).json({ message: 'Error fetching code blocks', error: error.message });
  }
});

// GET endpoint to get specific codeblock (use this for actual task page)
app.get('/api/codeblocks/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const codeBlock = await CodeBlock.findOne({ title });
    if (!codeBlock) {
      return res.status(404).json({ message: "No code block found under that title" });
    }
    res.status(200).json(codeBlock);
  } catch (error) {
    console.error('Error fetching code block:', error);
    res.status(500).json({ message: 'Error fetching code block', error: error.message });
  }
});

// POST endpoint to get solutions from users
app.post('/api/codeblocks/submit', async (req, res) => {
  const { title, userSolution } = req.body;

  try {
    const codeBlock = await CodeBlock.findOne({ title });
    if (!codeBlock) {
      console.log("Error! no codeblock under the title: ", title);
      return res.status(404).json({ message: 'Code block not found' });
    }

    const storedSolution = codeBlock.solution;

    const normalizeSolution = (solution) => {
      return solution.replace(/\s+/g, ' ').trim().toLowerCase();
    };

    const normalizedStoredSolution = normalizeSolution(storedSolution);
    const normalizedUserSolution = normalizeSolution(userSolution);

    if (normalizedStoredSolution === normalizedUserSolution) {
      console.log("success!");
      return res.status(200).json({ message: 'Solution is correct!' });
    } else {
      console.log("fail!");
      return res.status(200).json({ message: 'Incorrect solution. Try again.' });
    }
  } catch (error) {
    console.error('Error checking solution:', error);
    res.status(500).json({ message: 'Error checking solution', error: error.message });
  }
});

server.listen(port, () => {
  console.log('Server is live on port', port);
});
