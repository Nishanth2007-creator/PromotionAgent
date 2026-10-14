# Quantix Promotion Agent 🚀
### Automated College Event & Hackathon Promotion Engine

Quantix Promotion Agent is a modern web application built for college event organizers and hackathon leads to streamline student outreach, draft tone-calibrated multi-channel messages, and safely manage campaigns with anti-spam compliance and provider-verified delivery tracking.

---

## 🛠️ Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Premium Dark Navy & SaaS theme)
- **Icons**: Lucide React
- **Spreadsheet Parsers**: SheetJS (`xlsx`) & PapaParse (`papaparse`)
- **Database & Auth**: Firebase Authentication & Cloud Firestore (with automatic zero-config local persistence fallback)
- **Server Architecture**: Node.js + Express + TypeScript (`tsx`) for secure Gmail OAuth 2.0 & WhatsApp Cloud API integrations

---

## 🚀 Quick Start Guide (Beginner Friendly)

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) installed on your computer. You can check by opening your terminal and running:
```bash
node -v
npm -v
```

### 2. Start the Application
In your terminal, navigate to the project directory:
```bash
cd "d:\Projects\Promotion Agent"
```

#### Running the Frontend (UI Dashboard):
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

#### Running the Backend Integration Server (Optional / For API features):
In a second terminal window:
```bash
npm run server
```
The server will start on **http://localhost:3001**.

---

## 📁 Key Features Overview

### 1. Event Operations Dashboard
- **5 Core Metrics**:
  - **Total Contacts**: Total registered student leads in your directory.
  - **Campaigns Created**: Total campaigns in draft, review, or completed states.
  - **Messages Sent**: Provider-confirmed message transmissions.
  - **Delivery Failures**: Bounced or invalid addresses flagged by providers.
  - **Registrations Tracked**: Conversions tracked through event registration links.
- **Campus Reach Distribution**: Shows lead percentages across different engineering colleges.

### 2. Contact Management & Importer
- **File Support**: Import Excel (`.xlsx`, `.xls`), CSV, and Google Sheets exported files.
- **Smart Column Detection**: Automatically identifies headers for *Name*, *Email*, *Phone*, *College*, *Department*, and *Graduation Year*.
- **Pre-Import Preview & Validation**: Flags duplicate emails/phone numbers and syntax errors before saving.
- **Zero-Send Guarantee**: Contacts are strictly saved to the directory—no messages are ever sent during file import.
- **Opt-out Management**: Instantly toggle student consent or honor unsubscribe requests.
- **Export**: One-click download of all filtered contacts to CSV.

### 3. AI Message Studio
- **Event Specification**: Enter event name, dates, venue, registration URL, target audience, and highlights.
- **Promotional Flyer Upload**: Upload and preview your event poster (`.png`, `.jpg`, `.webp`).
- **Tone Calibration**:
  - **Professional**: Formal, structured for university faculty and official notices.
  - **Concise**: Quick bullet points for busy developers.
  - **Enthusiastic**: High energy with emojis and sprint excitement for hackathon builders.
- **Live Realistic Previews**:
  - **Email Client Preview**: Renders sender, recipient, subject, flyer attachment, and a clickable registration CTA button.
  - **WhatsApp Mobile Preview**: Renders a realistic smartphone chat screen with formatted bold text (`*text*`), links, and checkmarks.

### 4. Campaigns & Explicit Approval Gate
- **Drafts & Multi-Channel Queueing**: Separate recipient lists for Email and WhatsApp.
- **Audience Calculation**: Accurately computes eligible recipients and automatically suppresses unsubscribed students.
- **Test Mode**: Allows dry-run dispatches to a single test email/phone number without touching the student directory.
- **Explicit Approval Gate**: Requires organizers to verify a 3-point checklist and type `APPROVE` before releasing campaigns.

### 5. Delivery Reports & Provider Verification
- Strictly tracks delivery states **only when acknowledged by upstream providers** (Gmail API or Meta WhatsApp Cloud Webhooks).
- Tracks states: `Pending`, `Dispatched`, `Delivered`, `Read`, `Bounced`, and `Failed`.

---

## 🔐 Connecting Firebase (Optional)
The application works immediately out of the box using local offline-first persistence. To connect your real Firebase project:
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. In **Build**, enable **Authentication** (Email/Password) and **Firestore Database**.
3. Create a web app in your Firebase project and copy the config values.
4. Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
5. Restart `npm run dev`. The dashboard header will display **"Firestore Connected"**.

---

## 🛡️ Integration Architecture (Gmail & WhatsApp)
To protect credentials from security leaks:
- **No secret keys or tokens are ever placed in frontend code.**
- Credentials reside strictly in the server environment:
  - `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Refer to `.env.example` for the full reference schema.
