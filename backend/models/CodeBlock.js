const mongoose = require('mongoose');

const codeblockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  initialTemplate: { type: String, required: true },
  solution: { type: String, required: true },
});

const codeblockModel = mongoose.model('CodeBlock', codeblockSchema);
module.exports = codeblockModel;
