// Pastikan semua kode dijalankan setelah halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {

  // === DOM Refs ===
  const playOnce = document.getElementById('playOnce');
  const play10 = document.getElementById('play10');
  const resetStats = document.getElementById('resetStats');
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
  const popupModal = document.getElementById('popupModal');
  const popupTitle = document.getElementById('popupTitle');
  const popupMessage = document.getElementById('popupMessage');
  const closePopup = document.getElementById('closePopup');
  const slotMachineEl = document.getElementById('slotMachine');
  const reelElements = document.querySelectorAll('#slotMachine .reel');

  // === Pengaturan Slot Machine Animasi ===
  const iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"];
  const symbolToIndexMap = { '💎': 0, '7️⃣': 1, '🍒': 2, '⭐': 3, '🔔': 5 };
  const icon_height = 79;
  const num_icons = 9;
  const time_per_icon = 100;
  let currentReelIndexes = [0, 0, 0];

  // === State Aplikasi ===
  const S = {
    balance: 1000,
    bet: 10,
    total: 0,
    wins: 0,
    losses: 0,
    adminPassword: 'bandar123',
    winProb: 10,
    teaser: { mode: 'off', rounds: 5, prob: 70, ctr: 0 },
    nearMiss: 30,
    mode: 'Normal',
    sound: false,
    isSpinning: false
  };

  // === Fungsi Animasi ===
  const roll = (reel, targetIndex, reelIndex) => {
    const initialOffset = 2;
    const currentIndex = currentReelIndexes[reelIndex];
    const delta = (initialOffset * num_icons) + ((targetIndex - currentIndex + num_icons) % num_icons) + (Math.floor(Math.random() * 2) * num_icons);
    return new Promise((resolve) => {
      const style = getComputedStyle(reel);
      const backgroundPositionY = parseFloat(style.backgroundPositionY || 0);
      const targetBackgroundPositionY = backgroundPositionY + delta * icon_height;
      const normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);
      setTimeout(() => {
        reel.style.transition = `background-position-y ${(8 + delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
        reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;
      }, reelIndex * 150);
      setTimeout(() => {
        reel.style.transition = `none`;
        reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
        resolve(targetIndex);
      }, (8 + delta) * time_per_icon + reelIndex * 150);
    });
  };

  const rollAll = (resultSymbols) => {
    S.isSpinning = true;
    slotMachineEl.classList.remove('win');
    const targetIndexes = resultSymbols.map(symbol => symbolToIndexMap[symbol] ?? Math.floor(Math.random() * num_icons));
    const rollPromises = [...reelElements].map((reel, i) => roll(reel, targetIndexes[i], i));
    return Promise.all(rollPromises).then((finalIndexes) => {
      currentReelIndexes = finalIndexes;
      S.isSpinning = false;
    });
  };

  // === Fungsi Logika Inti ===
  async function playRound() {
    if (S.isSpinning) return;
    if (S.balance < S.bet) {
      showPopup("Saldo Tidak Cukup", "Kemenangan seorang penjudi adalah ketika dirinya berhenti.");
      return;
    }
    if (S.balance >= 2000) {
      showPopup("Anda Terlalu Banyak Menang", "Jangan mudah tergoda, sistem ini dirancang agar Anda tidak menang terus. Uang Anda berharga.");
      return;
    }

    S.balance -= S.bet;
    S.total++;

    let currentWinProb = S.winProb;
    if (S.teaser.mode === 'simple' && S.teaser.ctr < S.teaser.rounds) {
      currentWinProb = S.teaser.prob;
      S.teaser.ctr++;
    }

    const symbols = ['🍒', '🔔', '💎', '⭐', '7️⃣'];
    let resultSymbols = [];
    let resultKind = 'lose';

    if (Math.random() * 100 < currentWinProb) {
      const winSymbol = symbols[randInt(symbols.length)];
      resultSymbols = [winSymbol, winSymbol, winSymbol];
      resultKind = 'win';
      S.wins++;
      S.balance += S.bet * 2;
    } else {
      S.losses++;
      if (Math.random() * 100 < S.nearMiss) {
        const sym1 = symbols[randInt(symbols.length)];
        let sym2;
        do { sym2 = symbols[randInt(symbols.length)]; } while (sym1 === sym2);
        resultSymbols = [sym1, sym1, sym2].sort(() => Math.random() - 0.5);
        resultKind = 'near-miss';
      } else {
        resultSymbols = ['x', 'y', 'z'];
        resultKind = 'lose';
      }
    }

    await rollAll(resultSymbols);
    showResultBadge(resultKind);
    updateUI(); // Ganti nama fungsi updateStats menjadi updateUI
  }

  // === Fungsi Helper & UI ===
  function showResultBadge(kind) {
    if (kind === 'win') {
      resultBadge.textContent = 'MENANG!';
      resultBadge.style.background = 'linear-gradient(90deg, #1dd1a1, #10b981)';
      slotMachineEl.classList.add('win');
    } else if (kind === 'near-miss') {
      resultBadge.textContent = 'NYARIS!';
      resultBadge.style.background = 'linear-gradient(90deg,#ffd400,#ff9f1c)';
    } else {
      resultBadge.textContent = 'KALAH';
      resultBadge.style.background = 'linear-gradient(90deg,#ff5c5c,#d43f3f)';
    }
  }

  function playMultiple(n = 10) {
    if (S.isSpinning) return;
    playRound();
    let count = 1;
    const interval = setInterval(() => {
      if (count >= n || S.balance < S.bet) {
        clearInterval(interval);
        return;
      }
      playRound();
      count++;
    }, 2500);
  }

  function updateUI() {
    balanceEl.textContent = S.balance;
    statTotal.textContent = S.total;
    statWin.textContent = S.wins;
    statLose.textContent = S.losses;
    const pct = S.total ? Math.round((S.wins / S.total) * 1000) / 10 : 0;
    statPct.textContent = `${pct}%`;
    const teaserRoundsLeft = S.teaser.rounds - S.teaser.ctr;
    modeLabel.textContent = S.teaser.mode === 'simple' && teaserRoundsLeft > 0 ? `Teaser (${teaserRoundsLeft} left)` : 'Normal';
    winProbRange.value = S.winProb;
    winProbLabel.textContent = `${S.winProb}%`;
    nearMiss.value = S.nearMiss;
    nearMissLabel.textContent = `${S.nearMiss}%`;
    betEl.textContent = S.bet;
  }

  function randInt(n) { return Math.floor(Math.random() * n); }

  function showPopup(title, message) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popupModal.classList.remove('hidden');
  }

  function hidePopup() {
    popupModal.classList.add('hidden');
  }

  // === Event Listeners ===
  closePopup.addEventListener('click', hidePopup);
  popupModal.addEventListener('click', (e) => { if (e.target === popupModal) hidePopup(); });
  openAdmin.addEventListener('click', () => adminModal.classList.remove('hidden'));
  closeAdmin.addEventListener('click', () => adminModal.classList.add('hidden'));
  
  adminLogin.addEventListener('click', () => {
    if (adminPass.value === S.adminPassword) {
      adminPanel.classList.remove('hidden');
      adminLogin.closest('.form-row').style.display = 'none';
      updateUI();
    } else {
      alert('Password salah (demo: bandar123)');
    }
  });

  applyAdmin.addEventListener('click', () => {
    S.winProb = parseInt(winProbRange.value, 10);
    S.teaser.mode = teaserMode.value;
    S.teaser.rounds = parseInt(teaserRounds.value, 10);
    S.teaser.prob = parseInt(teaserProb.value, 10);
    S.nearMiss = parseInt(nearMiss.value, 10);
    S.teaser.ctr = 0;
    updateUI();
    alert('Setting diterapkan.');
    adminModal.classList.add('hidden');
  });

  logoutAdmin.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    adminLogin.closest('.form-row').style.display = 'flex';
    adminPass.value = '';
  });

  playOnce.addEventListener('click', playRound);
  play10.addEventListener('click', () => playMultiple(10));
  
  resetStats.addEventListener('click', () => {
    if (S.isSpinning) return;
    if (!confirm('Reset statistik dan saldo demo?')) return;
    S.balance = 1000; S.total = 0; S.wins = 0; S.losses = 0; S.teaser.ctr = 0;
    currentReelIndexes = [0, 0, 0];
    reelElements.forEach(r => { r.style.backgroundPositionY = '0px'; });
    slotMachineEl.classList.remove('win');
    updateUI();
    resultBadge.textContent = 'Siap';
    resultBadge.style.background = '';
    message.textContent = 'Reset selesai.';
  });

  toggleSound.addEventListener('click', () => {
    S.sound = !S.sound;
    toggleSound.textContent = S.sound ? '🔊' : '🔈';
  });

  winProbRange.addEventListener('input', () => winProbLabel.textContent = `${winProbRange.value}%`);
  nearMiss.addEventListener('input', () => nearMissLabel.textContent = `${nearMiss.value}%`);

  // Init
  updateUI();
});