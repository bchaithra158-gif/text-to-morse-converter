# 📡 Text to Morse Code Converter

A modern, fully-featured **Text to Morse Code Converter** web application built with
pure HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔤 Text → Morse | Converts A–Z, 0–9, and common punctuation |
| 🔊 Audio Playback | Real sine-wave beeps via Web Audio API |
| 📋 Copy to Clipboard | One-click copy with visual confirmation |
| 🗑️ Clear All | Resets input, output, and signal strip |
| 📊 Signal Strip | Visual dot/dash timeline below output |
| 📖 Reference Chart | Interactive Morse alphabet (click to hear) |
| 📱 Responsive | Works on mobile, tablet, and desktop |
| ⌨️ Keyboard Shortcut | `Ctrl + Enter` to convert |

---

## 🗂️ Project Structure

```
Text to morse code converter/
├── index.html   ← App structure & layout
├── style.css    ← Dark blue/purple theme, animations
├── script.js    ← Conversion logic, audio, interactions
└── README.md    ← This file
```

---

## 🚀 Getting Started

### Option 1 — VS Code Live Server (recommended)
1. Open the project folder in **VS Code**.
2. Install the **Live Server** extension (if not already installed).
3. Right-click `index.html` → **Open with Live Server**.
4. The app opens at `http://127.0.0.1:5500`.

### Option 2 — Direct browser
1. Double-click `index.html`.
2. The app opens in your default browser.

> **Note:** Audio playback requires a browser that supports the Web Audio API
> (all modern browsers: Chrome, Firefox, Edge, Safari).

---

## 🎮 How to Use

1. **Type** your text in the input box (letters, numbers, punctuation).
2. Click **Convert to Morse** (or press `Ctrl + Enter`).
3. The Morse code appears in the output box with coloured dots (·) and dashes (−).
4. Use the action buttons:
   - **Copy** — copies the raw Morse string to your clipboard.
   - **Play Audio** — plays the code as authentic beep tones; click again to stop.
   - **Clear** — resets everything.
5. Toggle **Morse Code Reference Chart** to see (and hear) every character.

---

## 🔡 Morse Code Dictionary

The app uses the **International Telecommunication Union (ITU)** standard:

| Character | Code | Character | Code |
|:---------:|:----:|:---------:|:----:|
| A | `.-` | N | `-.` |
| B | `-...` | O | `---` |
| C | `-.-.` | P | `.--.` |
| D | `-..` | Q | `--.-` |
| E | `.` | R | `.-.` |
| F | `..-.` | S | `...` |
| G | `--.` | T | `-` |
| H | `....` | U | `..-` |
| I | `..` | V | `...-` |
| J | `.---` | W | `.--` |
| K | `-.-` | X | `-..-` |
| L | `.-..` | Y | `-.--` |
| M | `--` | Z | `--..` |
| 0 | `-----` | 5 | `.....` |
| 1 | `.----` | 6 | `-....` |
| 2 | `..---` | 7 | `--...` |
| 3 | `...--` | 8 | `---..` |
| 4 | `....-` | 9 | `----.` |

Word boundaries are shown as ` / ` in the output.

---

## 🎨 Design

- **Theme:** Dark blue & purple gradient with animated background blobs.
- **Typography:** [Inter](https://fonts.google.com/specimen/Inter) (UI) + [Fira Code](https://fonts.google.com/specimen/Fira+Code) (Morse output).
- **Colour coding:** Dots in purple (`·`), dashes in blue (`−`).
- **Animations:** Smooth hover lifts, pulsing header icon, shake on empty submit.

---

## 🧰 Technical Notes

- **No external libraries** — vanilla JS only.
- **Web Audio API** generates clean 600 Hz sine-wave tones with fade in/out to
  eliminate clicks.
- **ITU timing ratios** used for audio playback:
  - Dot = 100 ms
  - Dash = 300 ms
  - Symbol gap = 100 ms
  - Character gap = 300 ms
  - Word gap = 700 ms
- The **reference chart** cells are clickable — click any character to hear its
  Morse code played immediately.
- Clipboard access uses the modern `navigator.clipboard` API with a fallback for
  older browsers.

---

## 🌐 Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 70+ | ✅ |
| Firefox 65+ | ✅ |
| Edge 79+ | ✅ |
| Safari 14+ | ✅ |
| Opera 60+ | ✅ |

---

## 📄 License

This project is open-source and free to use for personal and educational purposes.

---

*Built with ❤️ using HTML · CSS · JavaScript*

