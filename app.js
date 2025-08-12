// Simple static sim judi/gacha — edukasi
// NOTE: This is demo-only. Password is visible di sini (demo: bandar pw = 'bandar123')

(() => {
  // DOM refs
  const playOnce = document.getElementById('playOnce');
  const play10 = document.getElementById('play10');
  const reel = document.getElementById('reel');
  const resultBadge = document.getElementById('resultBadge');
  const balanceEl = document.getElementById('balance');
  const statTotal = document.getElementById('statTotal');
  const statWin = document.getElementById('statWin');
  const statLose = document.getElementById('statLose');
  const statPct = document.getElementById('statPct');
  const message = document.getElementById('message');
  const openAdmin = document.getElementById('openAdmin');
  const adminModal = document.getElementById('adminModal');
  const closeAdmin = document.getElementById('closeAdmin');
  const adminLogin = document.getElementById('adminLogin');
  const adminPass = document.getElementById('adminPass');
  const adminPanel = document.getElementById('adminPanel');
  const winProbRange = document.getElementById('winProb');
  const winProbLabel = document.getElementById('winProbLabel');
  const applyAdmin = document.getElementById('applyAdmin');
  const logoutAdmin = document.getElementById('logoutAdmin');
  const modeLabel = document.getElementById('modeLabel');
  const teaserMode = document.getElementById('teaserMode');
  const teaserRounds = document.getElementById('teaserRounds');
  const teaserProb = document.getElementById('teaserProb');
  const nearMiss = document.getElementById('nearMiss');
  const nearMissLabel = document.getElementById('nearMissLabel');
  const toggleSound = document.getElementById('toggleSound');
  const betEl = document.getElementById('bet');

    // Popup refs (PAKAI HTML YANG SUDAH ADA)
  const popupModal = document.getElementById('popupModal');
  const popupTitle = document.getElementById('popupTitle');
  const popupMessage = document.getElementById('popupMessage');
  const closePopup = document.getElementById('closePopup');

  function showPopup(title, message) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popupModal.classList.remove('hidden');
  }

  function hidePopup() {
    popupModal.classList.add('hidden');
  }

  closePopup.addEventListener('click', hidePopup);
  popupModal.addEventListener('click', (e) => {
    if (e.target === popupModal) hidePopup();
  });

  // state
  const S = {
    balance: 1000,
    bet: 10,
    total: 0,
    wins: 0,
    losses: 0,
    adminPassword: 'bandar123',
    winProb: 10, // percent
    teaser: { mode: 'off', rounds: 5, prob: 70, ctr: 0 },
    nearMiss: 30,
    mode: 'Normal',
    sound: false
  };

  // Helpers
  function updateUI() {
    balanceEl.textContent = S.balance;
    statTotal.textContent = S.total;
    statWin.textContent = S.wins;
    statLose.textContent = S.losses;
    const pct = S.total ? Math.round((S.wins / S.total) * 1000) / 10 : 0;
    statPct.textContent = `${pct}%`;
    modeLabel.textContent = S.teaser.mode === 'off' ? 'Normal' : `Teaser (${S.teaser.mode})`;
    winProbRange.value = S.winProb;
    winProbLabel.textContent = `${S.winProb}%`;
    nearMiss.value = S.nearMiss;
    nearMissLabel.textContent = `${S.nearMiss}%`;
    betEl.textContent = S.bet;
  }

  function randInt(n) { return Math.floor(Math.random() * n); }
  function isNearMiss(intensityPercent) {
    return Math.random() * 100 < intensityPercent;
  }


  function playRound() {
    if (S.balance <= 0) {
      showPopup("Saldo Tidak Cukup", "Kemenangan seorang penjudi, adalah ketika dirinya berhenti.");
      return;
    }
    if (S.balance >= 2000) {
      showPopup("Web Sudah Tidak Berfungsi Lagi", "Jangan mudah tergoda, uangmu itu berharga.");
      return;
    }

    S.balance -= S.bet;
    S.total++;

    const symbols = ['🍒', '🔔', '💎', '⭐', '7️⃣'];
    let reels = [];

    if (Math.random() * 100 < S.winProb) {
      const sym = symbols[randInt(symbols.length)];
      reels = [sym, sym, sym];
      S.wins++;
      S.balance += S.bet * 2;
      showResult('win', reels);
    } else {
      reels = [
        symbols[randInt(symbols.length)],
        symbols[randInt(symbols.length)],
        symbols[randInt(symbols.length)]
      ];
      if (reels[0] === reels[1] || reels[0] === reels[2] || reels[1] === reels[2]) {
        S.losses++;
        showResult('near-miss', reels);
      } else {
        S.losses++;
        showResult('lose', reels);
      }
    }

    updateStats();
  }

  function showResult(kind, reels) {
    reel.textContent = reels.join(' ');
    if (kind === 'win') {
      resultBadge.textContent = 'MENANG!';
      resultBadge.style.background = 'linear-gradient(90deg, #1dd1a1, #10b981)';
    } else if (kind === 'near-miss') {
      resultBadge.textContent = 'NYARIS!';
      resultBadge.style.background = 'linear-gradient(90deg,#ffd400,#ff9f1c)';
    } else {
      resultBadge.textContent = 'KALAH';
      resultBadge.style.background = 'linear-gradient(90deg,#ff5c5c,#d43f3f)';
    }
  }

  function updateStats() {
    updateUI();
  }

  function playMultiple(n = 10) {
    for (let i = 0; i < n; i++) {
      playRound();
    }
  }

  // Admin handlers
  openAdmin.addEventListener('click', () => adminModal.classList.remove('hidden'));
  closeAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));

  adminLogin.addEventListener('click', () => {
    const val = adminPass.value || '';
    if (val === S.adminPassword) {
      adminPanel.classList.remove('hidden');
      adminLogin.style.display = 'none';
      adminPass.style.display = 'none';
      updateUI();
    } else {
      alert('Password salah (demo: bandar123)');
    }
  });

  applyAdmin.addEventListener('click', () => {
    const p = parseInt(winProbRange.value, 10);
    S.winProb = isNaN(p) ? S.winProb : Math.max(0, Math.min(100, p));
    S.teaser.mode = teaserMode.value;
    S.teaser.rounds = parseInt(teaserRounds.value, 10) || 0;
    S.teaser.prob = parseInt(teaserProb.value, 10) || S.winProb;
    S.nearMiss = parseInt(nearMiss.value, 10) || 0;
    S.teaser.ctr = 0;
    updateUI();
    alert('Setting diterapkan.');
  });

  logoutAdmin.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    adminLogin.style.display = 'inline-block';
    adminPass.style.display = 'inline-block';
    adminPass.value = '';
  });

  // Buttons
  playOnce.addEventListener('click', () => {
    playRound();
    playOnce.classList.add('btn-clicked');
    setTimeout(() => playOnce.classList.remove('btn-clicked'), 200);
  });

  play10.addEventListener('click', () => {
    playMultiple(10);
    play10.classList.add('btn-clicked');
    setTimeout(() => play10.classList.remove('btn-clicked'), 200);
  });

  resetStats.addEventListener('click', () => {
    if (!confirm('Reset statistik dan saldo demo?')) return;
    S.balance = 1000; S.total = 0; S.wins = 0; S.losses = 0; S.teaser.ctr = 0;
    updateUI();
    reel.textContent = '—';
    resultBadge.textContent = 'Siap';
    resultBadge.style.background = '';
    message.textContent = 'Reset selesai.';
  });

  toggleSound.addEventListener('click', () => {
    S.sound = !S.sound;
    toggleSound.textContent = S.sound ? '🔊' : '🔈';
  });

  // Sliders
  winProbRange.addEventListener('input', () => winProbLabel.textContent = `${winProbRange.value}%`);
  nearMiss.addEventListener('input', () => nearMissLabel.textContent = `${nearMiss.value}%`);

  // Init
  updateUI();

  // expose for debugging (optional) 
  window.demoSim = {S, playRound, playMultiple, updateUI};
})();
