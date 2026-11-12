/* ============================================================
   Text to Morse Code Converter — script.js
   Features: Convert, Copy, Clear, Play Audio, Reference Table
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────
// 1. MORSE CODE DICTIONARY (ITU standard)
// ─────────────────────────────────────────────
const MORSE_CODE = {
  // Letters
  A: '.-', B: '-...', C: '-.-.', D: '-..',
  E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  // Numbers
  0: '-----', 1: '.----', 2: '..---', 3: '...--',
  4: '....-', 5: '.....', 6: '-....', 7: '--...',
  8: '---..', 9: '----.',
  // Common punctuation
  '.': '.-.-.-', ',': '--..--', '?': '..--..',
  "'": '.----.', '!': '-.-.--', '/': '-..-.',
  '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};

// Timing constants (milliseconds)
const TIMING = {
  dot: 100,
  dash: 300,
  symbolGap: 100,   // gap between dots/dashes in one character
  charGap: 300,   // gap between characters
  wordGap: 700,   // gap between words
};

// ─────────────────────────────────────────────
// 2. DOM ELEMENT REFERENCES
// ─────────────────────────────────────────────
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const convertBtn = document.getElementById('convertBtn');
const clearBtn = document.getElementById('clearBtn');
const morseOutput = document.getElementById('morseOutput');
const copyBtn = document.getElementById('copyBtn');
const playBtn = document.getElementById('playBtn');
const playBtnText = document.getElementById('playBtnText');
const playIcon = document.getElementById('playIcon');
const stopIcon = document.getElementById('stopIcon');
const errorMsg = document.getElementById('errorMsg');
const toast = document.getElementById('toast');
const tableToggleBtn = document.getElementById('tableToggleBtn');
const referenceTable = document.getElementById('referenceTable');
const morseTableGrid = document.getElementById('morseTableGrid');
const signalStrip = document.getElementById('signalStrip');
const chevron = document.getElementById('chevron');

// ─────────────────────────────────────────────
// 3. STATE
// ─────────────────────────────────────────────
let currentMorseString = '';   // plain morse (e.g. ".- -... -.-.")
let audioContext = null;       // Web Audio API context
let isPlaying = false;
let stopRequested = false;
let toastTimer = null;

// ─────────────────────────────────────────────
// 4. CHARACTER COUNTER
// ─────────────────────────────────────────────
textInput.addEventListener('input', () => {
  charCount.textContent = textInput.value.length;
  // Auto-hide error when user starts typing
  if (textInput.value.trim() !== '') hideError();
});

// ─────────────────────────────────────────────
// 5. CONVERSION LOGIC
// ─────────────────────────────────────────────
function convertToMorse(text) {
  /**
   * Returns an object:
   *  .words  → array of word arrays. Each word-array holds
   *            {char, morse} objects.
   *  .plain  → space-separated string (words split by ' / ')
   */
  const words = text.trim().toUpperCase().split(/\s+/);
  const result = [];
  let plain = '';

  words.forEach((word, wi) => {
    const wordData = [];
    for (const ch of word) {
      const code = MORSE_CODE[ch];
      wordData.push({ char: ch, morse: code || '?' });
    }
    result.push(wordData);
    // Build plain string
    plain += wordData.map(d => d.morse).join(' ');
    if (wi < words.length - 1) plain += ' / '; // word separator
  });

  return { words: result, plain };
}

function renderOutput(convResult) {
  const { words } = convResult;
  morseOutput.innerHTML = '';

  words.forEach((word, wi) => {
    word.forEach((item, ci) => {
      const span = document.createElement('span');
      // Colour each symbol individually
      let coloured = '';
      for (const sym of item.morse) {
        if (sym === '.') coloured += `<span class="morse-dot">·</span>`;
        else if (sym === '-') coloured += `<span class="morse-dash">−</span>`;
        else coloured += sym; // '?' for unknown chars
      }
      span.innerHTML = coloured;
      morseOutput.appendChild(span);

      // Gap between characters in same word
      if (ci < word.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'morse-sep';
        sep.textContent = ' ';
        morseOutput.appendChild(sep);
      }
    });

    // Word separator
    if (wi < words.length - 1) {
      const wsep = document.createElement('span');
      wsep.className = 'morse-sep';
      wsep.textContent = '  /  ';
      morseOutput.appendChild(wsep);
    }
  });

  morseOutput.classList.add('has-content');
}

function buildSignalStrip(plain) {
  signalStrip.innerHTML = '';
  // plain looks like: ".- -... / --."
  const tokens = plain.split(' / ');
  tokens.forEach((word, wi) => {
    const chars = word.split(' ');
    chars.forEach((code, ci) => {
      for (const sym of code) {
        const unit = document.createElement('div');
        unit.classList.add('signal-unit');
        unit.classList.add(sym === '.' ? 'dot' : 'dash');
        signalStrip.appendChild(unit);
        // symbol gap (not after last)
        if (ci < chars.length - 1 || sym !== code[code.length - 1]) {
          const g = document.createElement('div');
          g.classList.add('signal-unit', 'gap');
          signalStrip.appendChild(g);
        }
      }
      // character gap
      if (ci < chars.length - 1) {
        const cg = document.createElement('div');
        cg.classList.add('signal-unit', 'gap');
        signalStrip.appendChild(cg);
      }
    });
    // word gap
    if (wi < tokens.length - 1) {
      const wg = document.createElement('div');
      wg.classList.add('signal-unit', 'word-gap');
      signalStrip.appendChild(wg);
    }
  });
  signalStrip.classList.remove('hidden');
}

// ─────────────────────────────────────────────
// 6. BUTTON HANDLERS
// ─────────────────────────────────────────────

// Convert
convertBtn.addEventListener('click', () => {
  const text = textInput.value;

  if (!text.trim()) {
    showError();
    shakeElement(convertBtn);
    return;
  }

  hideError();

  const result = convertToMorse(text);
  currentMorseString = result.plain;

  renderOutput(result);
  buildSignalStrip(result.plain);

  copyBtn.disabled = false;
  playBtn.disabled = false;

  // Scroll output into view on mobile
  morseOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Clear
clearBtn.addEventListener('click', () => {
  // If audio is playing, stop it first
  if (isPlaying) stopAudio();

  textInput.value = '';
  charCount.textContent = '0';
  currentMorseString = '';

  morseOutput.innerHTML = '<span class="output-placeholder">Your Morse code will appear here…</span>';
  morseOutput.classList.remove('has-content');

  signalStrip.innerHTML = '';
  signalStrip.classList.add('hidden');

  copyBtn.disabled = true;
  playBtn.disabled = true;

  hideError();
  textInput.focus();
});

// Copy
copyBtn.addEventListener('click', async () => {
  if (!currentMorseString) return;

  try {
    await navigator.clipboard.writeText(currentMorseString);
    showToast('✅ Copied to clipboard!');
    // Visual feedback on button
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!`;
    setTimeout(() => {
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy`;
    }, 2000);
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = currentMorseString;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✅ Copied to clipboard!');
  }
});

// Play / Stop Audio
playBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopAudio();
  } else {
    playMorseAudio(currentMorseString);
  }
});

// Enter key on textarea = convert
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    convertBtn.click();
  }
});

// ─────────────────────────────────────────────
// 7. WEB AUDIO — MORSE PLAYBACK
// ─────────────────────────────────────────────

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser auto-suspend policy)
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

async function playMorseAudio(morseString) {
  if (!morseString) return;

  isPlaying = true;
  stopRequested = false;
  setPlayingState(true);

  const ctx = getAudioContext();
  const frequency = 600; // Hz — classic CW tone

  // Parse morse string into a flat list of play events
  // Words are separated by ' / ', chars by ' ', symbols by ''
  const words = morseString.split(' / ');

  for (let wi = 0; wi < words.length; wi++) {
    if (stopRequested) break;
    const chars = words[wi].split(' ');

    for (let ci = 0; ci < chars.length; ci++) {
      if (stopRequested) break;
      const code = chars[ci];

      for (let si = 0; si < code.length; si++) {
        if (stopRequested) break;
        const sym = code[si];
        const duration = sym === '.' ? TIMING.dot : TIMING.dash;

        // Play a beep
        await playBeep(ctx, frequency, duration);

        // Symbol gap (between dots/dashes)
        if (si < code.length - 1 && !stopRequested) {
          await sleep(TIMING.symbolGap);
        }
      }

      // Character gap
      if (ci < chars.length - 1 && !stopRequested) {
        await sleep(TIMING.charGap);
      }
    }

    // Word gap
    if (wi < words.length - 1 && !stopRequested) {
      await sleep(TIMING.wordGap);
    }
  }

  // Done
  isPlaying = false;
  stopRequested = false;
  setPlayingState(false);
}

function playBeep(ctx, frequency, duration) {
  return new Promise(resolve => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Soft fade in/out to avoid clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.005);
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime + duration / 1000 - 0.005);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);

    oscillator.onended = () => {
      gainNode.disconnect();
      resolve();
    };
  });
}

function sleep(ms) {
  return new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    // Allow stopAudio to cancel
    if (stopRequested) { clearTimeout(id); resolve(); }
  });
}

function stopAudio() {
  stopRequested = true;
  isPlaying = false;
  setPlayingState(false);
}

function setPlayingState(playing) {
  if (playing) {
    playBtn.classList.add('playing');
    playIcon.classList.add('hidden');
    stopIcon.classList.remove('hidden');
    playBtnText.textContent = 'Stop';
  } else {
    playBtn.classList.remove('playing');
    playIcon.classList.remove('hidden');
    stopIcon.classList.add('hidden');
    playBtnText.textContent = 'Play Audio';
  }
}

// ─────────────────────────────────────────────
// 8. REFERENCE TABLE
// ─────────────────────────────────────────────
function buildReferenceTable() {
  // Order: A-Z, 0-9, then punctuation
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const digits = '0123456789'.split('');
  const punc = ['.', ',', '?', '!', '/', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '@'];

  const all = [...letters, ...digits, ...punc];

  all.forEach(ch => {
    const code = MORSE_CODE[ch];
    if (!code) return;

    const cell = document.createElement('div');
    cell.className = 'morse-cell';
    cell.title = `${ch} = ${code}`;

    const charEl = document.createElement('div');
    charEl.className = 'cell-char';
    charEl.textContent = ch;

    const codeEl = document.createElement('div');
    codeEl.className = 'cell-code';
    // Replace - with − and . with · for display
    codeEl.textContent = code.replace(/\./g, '·').replace(/-/g, '−');

    cell.appendChild(charEl);
    cell.appendChild(codeEl);

    // Click a cell to hear it
    cell.addEventListener('click', () => {
      if (!isPlaying) playMorseAudio(code);
    });

    morseTableGrid.appendChild(cell);
  });
}

tableToggleBtn.addEventListener('click', () => {
  const isHidden = referenceTable.classList.contains('hidden');
  referenceTable.classList.toggle('hidden');
  chevron.classList.toggle('open', isHidden);
});

// ─────────────────────────────────────────────
// 9. HELPERS — Error, Toast, Shake
// ─────────────────────────────────────────────
function showError() {
  errorMsg.classList.remove('hidden');
}

function hideError() {
  errorMsg.classList.add('hidden');
}

function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.remove('hidden');
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => {
    el.style.animation = '';
  }, { once: true });
}

// Inject shake keyframes
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    20%    { transform:translateX(-6px); }
    40%    { transform:translateX( 6px); }
    60%    { transform:translateX(-4px); }
    80%    { transform:translateX( 4px); }
  }
`;
document.head.appendChild(shakeStyle);

// ─────────────────────────────────────────────
// 10. INITIALISE
// ─────────────────────────────────────────────
buildReferenceTable();
textInput.focus();

