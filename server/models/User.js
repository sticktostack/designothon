const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  organization: { type: String, default: '' },
  role: { type: String, enum: ['mentor', 'judge'], required: true },
  userId: { type: String, default: () => uuidv4() },

  assignedTeamsRound1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  assignedTeamsRound2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  assignedTeamsRound3: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
