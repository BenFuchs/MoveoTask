const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const port = 8080;
const mongoose = require('mongoose');
const CodeBlock = require('./models/CodeBlock');  // Import the model
const prettier = require('prettier');
dotenv.config();

app.use(express.json());
app.use(cors());

const mongodbURL = process.env.MONGO_URL;

mongoose.connect(mongodbURL)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/test', (req, res) => {
    res.send('test')
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
app.get('/api/codeblocks/:title', async (req,res)=> {
  const title = req.params.title;
  try {
    const codeBlock = await CodeBlock.findOne({title})
    if (!codeBlock) {
      return res.status(404).json({message: "No code block found under that title"})
    }
    res.status(200).json(codeBlock);
  } catch (error) {
    console.error('Error fetching code block:', error);
    res.status(500).json({ message: 'Error fetching code block', error: error.message });
  }
})
// POST endpoint to get solutions from users
app.post('/api/codeblocks/submit', async (req, res) => {
  const { title, userSolution } = req.body;

  try {
    const codeBlock = await CodeBlock.findOne({ title });
    if (!codeBlock) {
      return res.status(404).json({ message: 'Code block not found' });
    }

    const storedSolution = codeBlock.solution;

    // Debug logs
    // console.log('Raw Stored Solution:', JSON.stringify(storedSolution));
    // console.log('Raw User Solution:', JSON.stringify(userSolution));

    const normalizeSolution = (solution) => {
      return solution.replace(/\s+/g, ' ').trim();  
    };

    const normalizedStoredSolution = normalizeSolution(storedSolution);
    const normalizedUserSolution = normalizeSolution(userSolution);

    if (normalizedStoredSolution === normalizedUserSolution) {
      return res.status(200).json({ message: 'Solution is correct!' });
    } else {
      return res.status(400).json({ message: 'Incorrect solution. Try again.' });
    }
  } catch (error) {
    console.error('Error checking solution:', error);
    res.status(500).json({ message: 'Error checking solution', error: error.message });
  }
});




app.listen(port, () => {
  console.log('Server is live on port', port);
});
