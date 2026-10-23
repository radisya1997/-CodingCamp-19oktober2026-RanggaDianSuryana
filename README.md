# 🗂️ Personal Dashboard

A clean, minimal personal dashboard built with pure HTML, CSS, and vanilla JavaScript.
No frameworks. No backend. All data stored in the browser's LocalStorage.

## ✨ Features

| Feature | Description |
|---|---|
| **Greeting** | Live clock + date, time-based greeting (morning/afternoon/evening/night) |
| **Focus Timer** | 25-min Pomodoro timer with Start / Pause / Reset and a progress bar |
| **To-Do List** | Add, edit, mark done, delete tasks — persisted in LocalStorage |
| **Quick Links** | Save favourite URLs as clickable chips — persisted in LocalStorage |

## 🏆 Challenges Implemented

1. **Light / Dark mode** — toggle button + auto-detects system preference on first load
2. **Custom name in greeting** — asks for your name on first visit; editable anytime
3. **Change Pomodoro time** — type any duration (1–120 min) and click Apply
4. **Prevent duplicate tasks** — shows a red warning if you try to add the same task twice
5. **Sort tasks** — dropdown to sort by A→Z, Z→A, or Done-last

## 📁 Project Structure

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## 🚀 Running Locally

Just open `index.html` in any modern browser — no build step needed.

## 🌐 Deployment

Published via **GitHub Pages**.  
Live URL: *(add your GitHub Pages URL here after deployment)*

## 🛠️ Tech Stack

- HTML5
- CSS3 (custom properties for theming)
- Vanilla JavaScript (ES6+)
- Browser LocalStorage API
