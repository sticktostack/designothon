const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const { sendScoringEmail } = require('../utils/sendMail');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .populate('assignedTeamsRound1', 'teamName isRegistered scores')
      .populate('assignedTeamsRound2', 'teamName isRegistered scores')
      .populate('assignedTeamsRound3', 'teamName isRegistered scores');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET user by userId (for scoring panel - no login)
router.get('/by-uid/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId })
      .populate('assignedTeamsRound1', 'teamName leaderName memberName problemStatement scores isRegistered')
      .populate('assignedTeamsRound2', 'teamName leaderName memberName problemStatement scores isRegistered')
      .populate('assignedTeamsRound3', 'teamName leaderName memberName problemStatement scores isRegistered');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add mentor or judge
router.post('/add', async (req, res) => {
  try {
    const { name, email, organization, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
    }
    if (!['mentor', 'judge'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be mentor or judge' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'Email already registered' });

    user = new User({ name, email, organization, role });
    await user.save();

    // Send email
    let emailSent = false;
    let emailError = null;
    try {
      await sendScoringEmail(user);
      emailSent = true;
    } catch (e) {
      emailError = e.message;
    }

    res.json({
      success: true,
      data: user,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} added successfully!`,
      emailSent,
      emailError,
      scoringLink: `${process.env.BASE_URL || 'http://localhost:5000'}/scoring.html?userId=${user.userId}&role=${user.role}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats summary
router.get('/stats/summary', async (req, res) => {
  try {
    const [totalTeams, registeredTeams, mentors, judges] = await Promise.all([
      Team.countDocuments(),
      Team.countDocuments({ isRegistered: true }),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'judge' })
    ]);
    const scored1 = await Team.countDocuments({ 'scores.round1.submitted': true });
    const scored2 = await Team.countDocuments({ 'scores.round2.submitted': true });
    const scored3 = await Team.countDocuments({ 'scores.round3.submitted': true });

    res.json({
      success: true,
      data: { totalTeams, registeredTeams, mentors, judges, scored1, scored2, scored3 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
