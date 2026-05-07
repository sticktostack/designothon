const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

async function sendScoringEmail(user) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const scoringLink = `${baseUrl}/scoring.html?userId=${user.userId}&role=${user.role}`;
  const roleLabel = user.role === 'mentor' ? 'Mentor' : 'Judge';
  const roundInfo = user.role === 'mentor'
    ? 'You will be evaluating teams in <strong>Round 1 and Round 2</strong> (25 marks each).'
    : 'You will be evaluating teams in <strong>Round 3</strong> (50 marks total).';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
        .header p { margin: 8px 0 0; opacity: 0.7; font-size: 14px; }
        .badge { display: inline-block; background: #e94560; color: white; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .body { padding: 36px 30px; color: #333; }
        .body h2 { margin-top: 0; color: #1a1a2e; }
        .body p { line-height: 1.7; color: #555; }
        .link-box { background: #f0f4ff; border-left: 4px solid #e94560; border-radius: 8px; padding: 20px; margin: 24px 0; word-break: break-all; font-size: 13px; color: #333; }
        .btn { display: block; width: fit-content; margin: 20px auto; background: #e94560; color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 15px; letter-spacing: 0.5px; }
        .footer { background: #f9f9f9; text-align: center; padding: 20px; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Design O Thon</h1>
          <p>Hackathon Scoring Portal</p>
          <span class="badge">${roleLabel}</span>
        </div>
        <div class="body">
          <h2>Hello, ${user.name}! 👋</h2>
          <p>Welcome to <strong>Design O Thon</strong>! You have been assigned as a <strong>${roleLabel}</strong> from <em>${user.organization || 'your organization'}</em>.</p>
          <p>${roundInfo}</p>
          <p>Use the unique link below to access your scoring panel. <strong>Do not share this link</strong> with anyone — it is personal to you.</p>
          <div class="link-box">
            🔗 ${scoringLink}
          </div>
          <a href="${scoringLink}" class="btn">Open Scoring Panel →</a>
          <p style="font-size:13px; color:#888; text-align:center; margin-top:20px;">If you have any issues, please contact the admin team.</p>
        </div>
        <div class="footer">
          © 2025 Design O Thon · All rights reserved
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();

  // Verify connection before sending
  await transporter.verify();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Design O Thon <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🎨 Design O Thon – Your ${roleLabel} Scoring Access`,
    html
  });

  console.log('Email sent:', info.messageId);
  return info;
}

module.exports = { sendScoringEmail };