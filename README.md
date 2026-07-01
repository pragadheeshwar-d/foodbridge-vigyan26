# FoodBridge — Full-Stack Setup Guide

## Architecture
- **Frontend**: React + Vite + TailwindCSS → `http://localhost:5173`
- **Backend**: Python Flask + MySQL → `http://localhost:5000`
- **Real-time**: Flask-SocketIO (WebSocket)
- **Auth**: JWT (stored in `localStorage`)

---

## 1. Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MySQL server running locally (default port 3306)

---

## 2. MySQL Setup

```sql
CREATE DATABASE foodbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then update `backend/.env`:
```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/foodbridge
```

---

## 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Initialize database (creates tables + admin user)
python init_db.py

# Start the Flask server
python run.py
```

Backend runs at: `http://localhost:5000`  
Admin credentials: `admin@foodbridge.com` / `Admin@1234`

---

## 4. Frontend Setup

```bash
# From project root
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 5. Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SECRET_KEY` | Flask secret key |
| `JWT_SECRET_KEY` | JWT signing key |
| `MAIL_USERNAME` | Gmail address for sending emails |
| `MAIL_PASSWORD` | Gmail App Password |
| `FRONTEND_URL` | Frontend URL for email links |

### `.env` (root)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Flask API base URL (default: `http://localhost:5000`) |
| `VITE_SOCKET_URL` | Socket.IO server URL |

---

## 6. Default Roles & Flow

| Role | Login URL | Redirect |
|---|---|---|
| Admin | `/auth/login/donor` | `/admin` |
| Donor | `/auth/login/donor` | `/donor` |
| Receiver | `/auth/login/receiver` | `/receiver` |

### Full Workflow
1. Register → email verification link sent
2. Click verification link → account activated
3. Admin approves account (status: pending → approved)
4. Donor adds donation → receivers notified via Socket.IO
5. Receiver requests pickup → donor notified
6. Donor approves → QR code generated
7. Receiver shows QR → donor scans to verify
8. Pickup Completed → Certificate generated → Analytics updated

---

## 7. API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login → JWT token |
| POST | `/api/auth/verify-email` | No | Verify email token |
| GET/PUT | `/api/auth/profile` | JWT | Get/update profile |
| POST | `/api/auth/forgot-password` | No | Send reset email |
| POST | `/api/auth/reset-password` | No | Reset password |
| GET | `/api/donations/` | No | List donations |
| GET | `/api/donations/available` | No | Available donations |
| POST | `/api/donations/` | JWT | Create donation |
| PUT | `/api/donations/:id` | JWT | Update donation |
| DELETE | `/api/donations/:id` | JWT | Delete donation |
| GET | `/api/pickups/` | JWT | List pickup requests |
| POST | `/api/pickups/` | JWT | Create pickup request |
| PUT | `/api/pickups/:id` | JWT | Approve/Reject/Complete |
| POST | `/api/pickups/:id/qr` | JWT | Generate QR code |
| POST | `/api/pickups/qr/verify` | JWT | Verify QR token |
| GET | `/api/dashboard/donor` | JWT | Donor stats |
| GET | `/api/dashboard/receiver` | JWT | Receiver stats |
| GET | `/api/dashboard/admin` | JWT | Admin stats |
| GET | `/api/notifications/` | JWT | List notifications |
| PUT | `/api/notifications/read-all` | JWT | Mark all read |
| GET | `/api/chat/conversations` | JWT | Chat partners |
| GET | `/api/chat/messages/:partnerId` | JWT | Messages |
| POST | `/api/chat/messages` | JWT | Send message |
| POST | `/api/services/predict-expiry` | JWT | AI expiry prediction |
| GET | `/api/services/certificates` | JWT | List certificates |
| GET | `/api/services/admin/users` | JWT (admin) | All users |
| PUT | `/api/services/admin/users/:id` | JWT (admin) | Approve/suspend user |
| DELETE | `/api/services/admin/users/:id` | JWT (admin) | Delete user |

---

## 8. Socket.IO Events

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `new_donation` | Donation object | New donation listed |
| `pickup_requested` | `{pickup_request, donation}` | Receiver requested pickup |
| `pickup_status_changed` | `{pickup_request, donation}` | Status updated |
| `notification` | Notification object | Real-time notification push |
| `new_message` | Message object | New chat message |
| `messages_read` | `{message_ids}` | Messages marked read |
| `analytics_updated` | `{}` | Dashboard refresh trigger |

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join` | `{user_id}` | Join user room |
| `send_message` | `{sender_id, receiver_id, message}` | Send chat message |
| `typing` | `{sender_id, receiver_id}` | Typing indicator |
| `stop_typing` | `{sender_id, receiver_id}` | Stop typing indicator |
| `mark_read` | `{message_ids, sender_id}` | Mark messages read |
