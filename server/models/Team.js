const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  leaderName: { type: String, default: '' },
  memberName: { type: String, default: '' },
  problemStatement: { type: String, default: '' },
  isRegistered: { type: Boolean, default: false },

  mentorRound1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  mentorRound2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  judgeRound3: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  scores: {
    round1: {
      c1: { type: Number, default: 0 },
      c2: { type: Number, default: 0 },
      c3: { type: Number, default: 0 },
      c4: { type: Number, default: 0 },
      c5: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      submitted: { type: Boolean, default: false }
    },
    round2: {
      c1: { type: Number, default: 0 },
      c2: { type: Number, default: 0 },
      c3: { type: Number, default: 0 },
      c4: { type: Number, default: 0 },
      c5: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      submitted: { type: Boolean, default: false }
    },
    round3: {
      c1: { type: Number, default: 0 },
      c2: { type: Number, default: 0 },
      c3: { type: Number, default: 0 },
      c4: { type: Number, default: 0 },
      c5: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      submitted: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

// Virtual: grand total
teamSchema.virtual('grandTotal').get(function () {
  return this.scores.round1.total + this.scores.round2.total + this.scores.round3.total;
});

teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Team', teamSchema);
