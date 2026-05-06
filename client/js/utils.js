// API base URL
const API = '/api';

// Show toast notification
function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100px)'; t.style.transition = 'all 0.3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

// API request helper
async function api(method, endpoint, data) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(API + endpoint, opts);
    const json = await res.json();
    return json;
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Open/close modal
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Highlight active nav link
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'registration.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path || a.getAttribute('href') === './' + path) {
      a.classList.add('active');
    }
  });
});

// Format number safely
function num(v) { return isNaN(+v) ? 0 : +v; }
