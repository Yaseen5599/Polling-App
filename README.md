# PulsePoll — Simple, Modern Poll Web App

A lightweight, modern, and professional SaaS-style Poll Web Application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Designed for lightning-fast performance, instant shareability, and zero-config deployment on **Vercel**.

---

## ✨ Features

### 1. 🗳️ Create Poll
- Set poll question and optional contextual description.
- Add and remove options dynamically (enforces a minimum of 2 options up to 10).
- Single-choice voter selection logic.
- Scheduled start date & time (with a quick **"Start Now"** button).
- Configurable end date & time with instant duration presets (`+1 Hour`, `+6 Hours`, `+24 Hours`, `+3 Days`, `+7 Days`).
- **Live voter card preview** directly in the creator view before publishing.

### 2. 🔗 Shareable Polls & QR Codes
- Generates clean, unique shareable URLs: `/poll/:id`.
- One-click **Copy Link** button with instant feedback toast.
- Built-in **Mobile QR Code** viewer for quick in-person or mobile device scanning.
- Direct quick-share links to **X (Twitter)** and **WhatsApp**.

### 3. 🎯 Voting & Time Controls
- Clean, responsive single-option selection cards.
- **Dynamic Poll Status Tracking**:
  - 🟢 **Active**: Open for votes, displays time remaining countdown.
  - 🟡 **Scheduled**: Locked until the designated start date/time.
  - ⚪ **Ended**: Voting automatically closed; displays final closure timestamp.
- **Vote Locking & Multi-Tab Synchronization**:
  - Automatically identifies if the voter already cast a vote in this browser.
  - Allows users to review their choice or update their selection.
  - Cross-tab live synchronization via browser `BroadcastChannel` and `Storage` events.
  - Celebration confetti animation upon voting.

### 4. 📊 Live Visual Results
- Real-time vote tallies and total vote counts.
- Dynamic auto-updating percentages (`XX%`).
- Gradient animated progress bars.
- 👑 **Leader Badge** automatically highlighted on winning choices.
- One-click **Copy Summary** button to copy formatted text results to clipboard.

### 5. 🎨 SaaS Design & Aesthetics
- Full **Light Mode** and **Dark Mode** support with smooth theme toggle.
- System color preference detection and local storage persistence.
- Toast notifications with success, error, and informative alert states.
- Clean typography with Google Fonts (*Plus Jakarta Sans*).
- Pre-seeded with 3 realistic sample polls (Active, Scheduled, Ended) so the app is instantly testable.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or yarn

### Installation & Development

```bash
# Clone or navigate to the directory
cd "Polling App 2"

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The output will be placed in the `dist/` directory in under 300ms.

---

## ☁️ Deploying to Vercel

This project includes a pre-configured `vercel.json` file for single-page application (SPA) routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 1: Deploy with Vercel CLI
```bash
npx vercel
```

### Option 2: Deploy via Vercel Dashboard (Git)
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your app will be live with full URL routing support (`/poll/:id`, `/poll/:id/results`, `/create`)!

---

## 📁 Project Architecture

```
├── vercel.json                 # Vercel SPA routing configuration
├── vite.config.ts              # Vite + React + Tailwind v4 setup
├── package.json                # Minimal dependencies
├── src/
│   ├── types/
│   │   └── poll.ts             # Poll, PollOption, PollStatus definitions
│   ├── services/
│   │   └── pollService.ts      # Storage layer, seed polls & BroadcastChannel sync
│   ├── utils/
│   │   └── pollUtils.ts        # Status logic, percentages, and formatting
│   ├── context/
│   │   ├── ThemeContext.tsx    # Light/Dark mode state and persistence
│   │   └── ToastContext.tsx    # Modern toast alerts
│   ├── components/
│   │   ├── Navbar.tsx          # Brand header, navigation & theme toggle
│   │   ├── Footer.tsx          # Vercel badge & demo reset helper
│   │   ├── StatusBadge.tsx     # Scheduled / Active / Ended visual badge
│   │   └── ShareModal.tsx      # Copy link modal with QR code & social sharing
│   ├── pages/
│   │   ├── HomePage.tsx        # Hero section, feature cards & poll list
│   │   ├── CreatePollPage.tsx  # Poll creator form with live preview
│   │   ├── VotePage.tsx        # Voting interface, countdown & status locks
│   │   └── ResultsPage.tsx     # Percentage bars, leader crown & live sync
│   ├── App.tsx                 # BrowserRouter layout & routes
│   ├── main.tsx                # React root mount
│   └── index.css               # Tailwind CSS & theme tokens
```
