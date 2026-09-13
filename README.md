# ABHAYA — Real-Time Mobile-to-Mobile Emergency SOS Platform

ABHAYA is a real-time women's safety & emergency response web application designed for instant mobile-to-mobile SOS dispatch with live GPS location tracking, interactive maps, persistent WebSockets, and multi-channel notifications (Telegram Bot & Twilio SMS).

---

## 🏛️ System Architecture

```text
📱 SENDER PHONE (Phone A / `/sender`)
       │
       ▼ [HTTP POST /alert + Live Browser Geolocation]
💻 FASTAPI BACKEND SERVER (`0.0.0.0:8000`)
       │
       ├───────────────────────────────┬───────────────────────────────┐
       ▼ [WebSocket /ws/security]      ▼ [100% Free Telegram Bot]      ▼ [Twilio SMS Gateway]
📱 RESPONDER (Phone B / `/security-mobile`)  📲 TELEGRAM (@Abhaya_Security_Bot)   💬 OFFICER MOBILE SMS
```

---

## 📂 Project Directory Structure

```text
SIH Abhaya/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── alerts.py            # Emergency SOS dispatch endpoints
│   │   │       ├── analytics.py         # Analytics & statistics endpoints
│   │   │       ├── cameras.py           # Camera & device registry
│   │   │       ├── hotspots.py          # Hotspot location markers
│   │   │       └── stream.py            # Live webcam streaming service
│   │   ├── core/
│   │   │   ├── config.py            # Environment configuration & settings
│   │   │   └── database.py          # SQLite database connection & sessions
│   │   ├── models/                  # SQLAlchemy database ORM models
│   │   ├── services/
│   │   │   ├── telegram_service.py  # 100% Free Telegram Bot alert dispatch
│   │   │   └── twilio_service.py    # Twilio SMS emergency notification service
│   │   └── websockets/
│   │       └── manager.py           # Real-time WebSocket connection manager
│   ├── .env.example                 # Environment variable template (No API Keys)
│   ├── main.py                      # FastAPI application entrypoint
│   ├── requirements.txt             # Python dependencies
│   ├── run.py                       # Server launcher script
│   └── test_realtime_alert_flow.py  # End-to-end automated protocol verification test
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── HotspotMap.tsx       # Leaflet hotspot map component
    │   │   └── LiveGPSMap.tsx       # Live Leaflet map with pulsing GPS marker
    │   ├── pages/
    │   │   ├── SenderSOSView.tsx    # Phone A: Emergency SOS Sender interface
    │   │   └── ReceiverSecurityView.tsx # Phone B: Security Responder Receiver interface
    │   ├── services/
    │   │   ├── api.ts               # Axios HTTP client
    │   │   └── websocket.ts         # Persistent WebSocket client
    │   ├── App.tsx                  # React Router application routes
    │   └── main.tsx                 # React DOM entrypoint
    ├── index.html                   # HTML template
    ├── package.json                 # Frontend dependencies & scripts
    ├── tailwind.config.js           # Tailwind CSS configuration
    └── vite.config.ts               # Vite build configuration
```

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, WebSockets, Pydantic
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet Maps, Lucide Icons
- **Notifications**: Telegram Bot API (100% Free Live Mobile Alerts), Twilio SMS API

---

## ⚙️ Environment Setup (`backend/.env`)

Create a `.env` file inside the `backend/` folder based on `.env.example`:

```env
# Twilio Credentials (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+17372212163

# Target Recipient Phone Numbers
SECURITY_OFFICER_PHONE=+917058943223
USER_EMERGENCY_PHONE=+919373156804

# 100% Free Telegram Bot Alerts
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Database URL
DATABASE_URL=sqlite:///./abhaya.db
```

---

## 🚀 How to Run the Project

### 1. Start the Backend Server (FastAPI)
```powershell
cd backend
.\venv\Scripts\Activate.ps1   # On Windows
python run.py
```
*The FastAPI server will start on `http://0.0.0.0:8000` (accessible across your local network).*

---

### 2. Start the Frontend Server (Vite React)
```powershell
cd frontend
npm install
npm run dev -- --host
```
*The Vite frontend server will start on `http://0.0.0.0:5173` (accessible on mobile phones over Wi-Fi).*

---

### 3. Open Mobile Interfaces on Wi-Fi

- **Sender Mobile App (Phone A)**:  
  `http://<YOUR_COMPUTER_LOCAL_IP>:5173/sender`

- **Security Receiver Screen (Phone B)**:  
  `http://<YOUR_COMPUTER_LOCAL_IP>:5173/security-mobile`

- **Free Telegram Mobile Alerts**:  
  Send `/start` to your Telegram Bot on your phone to receive live emergency notifications.

---

## 🧪 Run Automated Verification Tests

Verify the real-time WebSocket protocol and alert dispatch pipeline:

```powershell
cd backend
python test_realtime_alert_flow.py
```

---

## 🎨 Color Palette & Design System

- **Background**: `#F4EEFF`
- **Containers**: `#DCD6F7`
- **Accents & Borders**: `#A6B1E1`
- **Typography**: `#424874`
