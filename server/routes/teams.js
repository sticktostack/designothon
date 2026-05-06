const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Team = require('../models/Team');
const User = require('../models/User');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// GET all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('mentorRound1', 'name email organization')
      .populate('mentorRound2', 'name email organization')
      .populate('judgeRound3', 'name email organization')
      .sort({ teamName: 1 });
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single team
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('mentorRound1', 'name email organization')
      .populate('mentorRound2', 'name email organization')
      .populate('judgeRound3', 'name email organization');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST register a team
router.post('/register/:id', async (req, res) => {
  try {
    const { leaderName, memberName, problemStatement } = req.body;
    if (!leaderName || !memberName || !problemStatement) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { leaderName, memberName, problemStatement, isRegistered: true },
      { new: true }
    );
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: team, message: 'Team registered successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add single team manually
router.post('/add', async (req, res) => {
  try {
    const { teamName, leaderName, memberName, problemStatement } = req.body;
    if (!teamName) return res.status(400).json({ success: false, message: 'Team name is required' });
    const team = new Team({ teamName, leaderName, memberName, problemStatement, isRegistered: !!(leaderName && memberName && problemStatement) });
    await team.save();
    res.json({ success: true, data: team, message: 'Team added!' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Team name already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload CSV to preload teams
router.post('/upload-csv', upload.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      if (row.teamName || row['Team Name'] || row['team_name']) {
        results.push({ teamName: (row.teamName || row['Team Name'] || row['team_name']).trim() });
      }
    })
    .on('end', async () => {
      fs.unlinkSync(req.file.path);
      let added = 0, skipped = 0;
      for (const r of results) {
        try { await Team.create(r); added++; } catch { skipped++; }
      }
      res.json({ success: true, message: `Imported ${added} teams, skipped ${skipped} duplicates.` });
    })
    .on('error', (err) => res.status(500).json({ success: false, message: err.message }));
});

// POST assign a mentor to a team for BOTH Round 1 and Round 2
router.post('/:id/assign-mentor', async (req, res) => {
  try {
    const { mentorId } = req.body;
    if (!mentorId) return res.status(400).json({ success: false, message: 'mentorId is required' });

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') return res.status(404).json({ success: false, message: 'Mentor not found' });

    const prevMentorR1Id = team.mentorRound1 ? String(team.mentorRound1) : null;
    const prevMentorR2Id = team.mentorRound2 ? String(team.mentorRound2) : null;

    // Remove team from previous mentor's R1 list if changing
    if (prevMentorR1Id && prevMentorR1Id !== String(mentorId)) {
      await User.findByIdAndUpdate(prevMentorR1Id, { $pull: { assignedTeamsRound1: team._id } });
    }
    // Remove team from previous mentor's R2 list if changing
    if (prevMentorR2Id && prevMentorR2Id !== String(mentorId)) {
      await User.findByIdAndUpdate(prevMentorR2Id, { $pull: { assignedTeamsRound2: team._id } });
    }

    // Assign same mentor to both rounds
    team.mentorRound1 = mentor._id;
    team.mentorRound2 = mentor._id;
    await team.save();

    // Add team to mentor's R1 list if not already there
    if (!mentor.assignedTeamsRound1.map(String).includes(String(team._id))) {
      mentor.assignedTeamsRound1.push(team._id);
    }
    // Add team to mentor's R2 list if not already there
    if (!mentor.assignedTeamsRound2.map(String).includes(String(team._id))) {
      mentor.assignedTeamsRound2.push(team._id);
    }
    await mentor.save();

    const populated = await Team.findById(team._id)
      .populate('mentorRound1', 'name email organization')
      .populate('mentorRound2', 'name email organization')
      .populate('judgeRound3', 'name email organization');

    res.json({ success: true, message: `Mentor "${mentor.name}" assigned to "${team.teamName}" for Round 1 & 2.`, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST manually assign a judge to a specific team (Round 3)
router.post('/:id/assign-judge', async (req, res) => {
  try {
    const { judgeId } = req.body;
    if (!judgeId) return res.status(400).json({ success: false, message: 'judgeId is required' });

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const judge = await User.findById(judgeId);
    if (!judge || judge.role !== 'judge') return res.status(404).json({ success: false, message: 'Judge not found' });

    if (team.judgeRound3 && String(team.judgeRound3) !== String(judgeId)) {
      await User.findByIdAndUpdate(team.judgeRound3, { $pull: { assignedTeamsRound3: team._id } });
    }
    team.judgeRound3 = judge._id;
    await team.save();
    if (!judge.assignedTeamsRound3.map(String).includes(String(team._id))) {
      judge.assignedTeamsRound3.push(team._id);
      await judge.save();
    }
    const populated = await Team.findById(team._id)
      .populate('mentorRound1', 'name email organization')
      .populate('mentorRound2', 'name email organization')
      .populate('judgeRound3', 'name email organization');

    res.json({ success: true, message: `Judge "${judge.name}" assigned to team "${team.teamName}".`, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST submit scores
router.post('/:id/score', async (req, res) => {
  try {
    const { round, scores } = req.body;
    if (!['round1', 'round2', 'round3'].includes(round)) {
      return res.status(400).json({ success: false, message: 'Invalid round' });
    }
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const maxPerCriteria = round === 'round3' ? 10 : 5;
    const { c1, c2, c3, c4, c5 } = scores;
    for (const val of [c1, c2, c3, c4, c5]) {
      if (val < 0 || val > maxPerCriteria) {
        return res.status(400).json({ success: false, message: `Each score must be between 0 and ${maxPerCriteria}` });
      }
    }
    team.scores[round] = {
      c1: +c1, c2: +c2, c3: +c3, c4: +c4, c5: +c5,
      total: +c1 + +c2 + +c3 + +c4 + +c5,
      submitted: true
    };
    await team.save();
    res.json({ success: true, message: 'Scores submitted!', data: team.scores[round] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
