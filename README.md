# PrintHub

A full‑stack print management platform for campuses: students upload files, get instant pricing, pay, and track orders; admins manage queues, pricing, and service status.

<p align="center">
	<img alt="React" src="https://img.shields.io/badge/Frontend-React%2018-61dafb?logo=react&logoColor=white">
	<img alt="Vite" src="https://img.shields.io/badge/Build-Vite%206-646cff?logo=vite&logoColor=white">
	<img alt="Tailwind" src="https://img.shields.io/badge/UI-Tailwind%20CSS-38bdf8?logo=tailwindcss&logoColor=white">
	<img alt="Node.js" src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-68a063?logo=node.js&logoColor=white">
	<img alt="MongoDB" src="https://img.shields.io/badge/DB-MongoDB%20%2B%20Mongoose-47a248?logo=mongodb&logoColor=white">
	<img alt="Cloudinary" src="https://img.shields.io/badge/Storage-Cloudinary-3448c5?logo=cloudinary&logoColor=white">
	<img alt="Auth" src="https://img.shields.io/badge/Auth-Google%20OAuth%20%2B%20OTP-4285F4?logo=google&logoColor=white">
	<img alt="Payments" src="https://img.shields.io/badge/Payments-Razorpay-0d1f2d">
  <a href="https://printhub-s7cs.onrender.com"><img alt="Live" src="https://img.shields.io/badge/Live-Render-success?logo=render"></a>
	<a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-ISC-green"></a>
</p>

[Live Demo](https://printhub-s7cs.onrender.com)

## 🚀 Features

- Instant price calculation with configurable rules (B/W, color, paper size, duplex, GST).
- Secure file uploads to Cloudinary with server‑side MIME validation and size limits.
- Student workflow: upload → configure → pay (Razorpay Checkout) → place order → email confirmation.
- Admin dashboard: queue management, status updates, revenue/usage metrics, urgent requests view, and day/hour queue prediction.
- Dynamic pricing management with admin‑only endpoints and versioned updates.
- Service status controls (open/close shop with reason) reflected across the app.
- Authentication: Google OAuth and email OTP flows; JWT‑secured APIs and role checks.
- Email notifications (order confirmation, order ready) via Nodemailer/SMTP.
- Production‑ready Express hardening: Helmet, CORS, compression, and rate limiting.
- SPA build served by the backend in production (single Render service friendly).

## 🧠 Architecture

High‑level overview of how the pieces fit together.

- Technologies

  - Frontend: React 18, Vite, Tailwind CSS, React Router, Redux Toolkit
  - Backend: Node.js, Express, Mongoose
  - Database: MongoDB (Atlas/local)
  - Storage: Cloudinary (raw uploads)
  - Auth: JWT, Google OAuth 2.0, OTP via email
  - Payments: Razorpay Checkout (client) with server persistence of `paymentId`

- Interaction model
  - Client calls REST APIs under `/api/*` for auth, pricing, orders, admin, and service status.
  - Files are uploaded to the backend, validated, then streamed to Cloudinary; the secure URL is stored with the print job.
  - On payment success, the client saves the Razorpay `paymentId` to the order.
  - Admins act on orders and service status via protected endpoints.

```
						 ┌──────────────────┐           ┌────────────────────────┐
						 │   React (Vite)   │  HTTPS    │     Express API        │
						 │  Tailwind, Redux │──────────▶│  Auth / Orders / Admin │
						 └────────┬─────────┘           └───────────┬────────────┘
											│                                  │
											│                                  │ Mongoose
											│                                  ▼
							 Razorpay Checkout                   MongoDB Atlas
											│                                  ▲
											│                                  │
											▼                                  │
								 User Payment                      Email (SMTP)
																										 ▲
																										 │
																										 ▼
																								Cloudinary (files)
```

## 🛠️ Tech Stack

- React 18, Vite, Tailwind CSS, React Router, Redux Toolkit
- Node.js, Express, Mongoose
- MongoDB
- Cloudinary (raw file storage)
- Razorpay Checkout (client integration)
- Passport (Google OAuth 2.0), JWT
- Nodemailer (SMTP)
- Helmet, CORS, Compression, Express‑rate‑limit

## 📦 Installation

Prerequisites:

- Node.js ≥ 18.18 < 21 (per backend `engines`)
- npm
- MongoDB connection string (Atlas/local)
- Cloudinary account (cloud name, API key/secret)
- SMTP credentials (for emails)

Clone the repository:

```powershell
git clone https://github.com/AniketBansod/PrintHub.git
cd PrintHub
```

Install dependencies (root scripts run both apps in dev):

```powershell
npm install
```

Create backend environment file `Backend/.env`:

```env
# App / Server
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Database
MONGO_URI=YOUR_MONGODB_URI

# Auth & Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
ADMIN_KEY=your_admin_registration_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_USER=your_email_account
EMAIL_PASS=your_email_password_or_app_password
```

Run the project in development (concurrently runs backend and client):

```powershell
npm run dev
```

Alternatively, run separately:

```powershell
# Terminal 1
cd Backend; npm run dev

# Terminal 2
cd client; npm run dev
```

## 🧪 Running the Project

- Development

  - Frontend: `cd client; npm run dev` (default at http://localhost:5173)
  - Backend: `cd Backend; npm run dev` (default at http://localhost:5000)

- Production (local)

  - Build SPA and serve from backend:
    ```powershell
    cd Backend; npm install; npm run build; npm start
    ```
  - The Express server serves `client/dist` and APIs from the same port.

- Docker
  - This repository does not ship a Dockerfile. If you prefer containers, add one and deploy as a Docker service on Render. An example is included in the Deployment section.

## 🔍 Usage

- Student

  1.  Open the app, upload a document (PDF/DOC/DOCX/TXT/images)
  2.  Choose options (pages, color, sides, size, copies); price updates instantly
  3.  Pay via Razorpay Checkout; order is queued and a confirmation email is sent
  4.  Track order until marked done; receive a “ready for collection” email

- Admin
  - Review queues, mark orders done/cancelled, view stats, set pricing, toggle service status, and check urgent requests/predictions

## ⚙️ Configuration

All backend variables are defined in `Backend/.env`:

- `PORT`: API port (defaults to 5000)
- `CLIENT_ORIGIN`: Allowed origins for CORS and OAuth redirects (comma‑separated for multiple)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing JWTs
- `SESSION_SECRET`: Session secret used during Google OAuth
- `ADMIN_KEY`: Required to create admin users via `/api/auth/admin-register`
- `CLOUDINARY_*`: Cloudinary credentials for uploads
- `EMAIL_USER`, `EMAIL_PASS`: SMTP credentials for Nodemailer

Client‑side Razorpay publishes its key in the checkout snippet; store your key ID securely and expose only what Razorpay requires on the client.

## 🧵 API Endpoints

Base URL: `/api`

- Auth (`/api/auth`)

  - `POST /send-otp` – Send signup OTP
  - `POST /verify-otp` – Verify OTP
  - `POST /register` – Register user (requires verified email)
  - `POST /login` – Login with email/password
  - `POST /admin-register` – Create admin (requires `ADMIN_KEY`)
  - `POST /request-password-reset` – Send reset OTP
  - `POST /verify-reset-otp` – Verify reset OTP
  - `POST /reset-password` – Reset password
  - `GET /profile` – Current user profile (JWT)
  - `GET /google` → `GET /google/callback` – Google OAuth 2.0

- Pricing (`/api/pricing`)

  - `GET /` – Public pricing for students
  - `GET /admin` – Full pricing (admin)
  - `PUT /` – Update pricing (admin)
  - `POST /calculate` – Calculate job price

- Orders (`/api/orders`)

  - `GET /` – Get current user orders (JWT)
  - `POST /` – Create order (JWT; blocked if service closed)
  - `PUT /:orderId/payment` – Attach `paymentId`, set status to `processing`
  - `PUT /:orderId/status` – Admin updates order status

- Uploads & Jobs

  - `POST /upload` – Upload a file to Cloudinary (multer memory storage)
  - `POST /print` – Upload + create a print job record
  - `GET /cart` – List all print jobs (demo/dev)

- Service Status

  - `GET /service-status` – Public status (open/closed + reason)
  - `GET /admin/service-status` – Admin status
  - `PUT /admin/service-status` – Update status (admin)

- Admin (`/api/admin`)
  - `GET /overview` – Stats: pending, users, revenue, today’s jobs, month revenue
  - `GET /orders` – List orders (summary)
  - `GET /orders/:orderId` – Order details with print jobs
  - `GET /orders/status/:status` – Orders by status (`queue|done|cancelled`)
  - `PUT /orders/:orderId/status` – Update order status and email notification
  - `GET /urgent-requests` – Urgent/express or near‑deadline orders
  - `GET /queue-prediction` – Aggregated hour slots for next 48h
  - `GET /download/:printJobId` – Signed Cloudinary URL redirect

## 📈 Performance / Benchmarks

The backend enables compression and rate limiting by default. Add APM/metrics if you need detailed throughput/latency numbers.

## 🧩 Folder Structure

```
Backend/
	server.js                # Express app, routing, static serving, security
	routes/                  # auth, orders, admin, pricing
	models/                  # User, Order, PrintJob, Pricing, ServiceStatus
	middleware/              # auth (JWT), serviceStatus check
	services/                # emailService (Nodemailer)
	constants/               # pricing defaults, allowed MIME types
	build/client/            # copied SPA build (created at build time)

client/
	src/                     # React app (pages, components, contexts, slices)
	public/                  # Static assets

package.json (root)        # Dev scripts to run client+server concurrently
```

## 🛡️ Security

- JWT auth on protected routes; role checks for admin endpoints
- Google OAuth 2.0 for social login; session used during OAuth flow
- Email OTP for signup and password reset with attempt limits and expiry
- Helmet, CORS (allow‑list via `CLIENT_ORIGIN`), Compression, Rate limiting
- Server‑side file type/size validation before uploading to Cloudinary

Important: The client saves Razorpay `paymentId` via `/api/orders/:orderId/payment`. Add server‑side signature verification (Razorpay webhook or callback verification) before treating a payment as final in production.

## 📦 Deployment

### Render (recommended without Docker)

Monorepo tip: deploy the backend as a Web Service with the `Backend` directory as the root.

- Build Command: `npm install`
- Start Command: `npm start`
- Node Version: 18.x (Render detects from `engines`)
- Environment: add variables from the Configuration section

The backend `postinstall` builds the React client and copies it into `Backend/build/client`, and the server serves the SPA and APIs from a single service.

### Docker on Render (optional)

This repo does not include a Dockerfile. If you prefer Docker, add one similar to:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY client ./client
WORKDIR /app/client
RUN npm ci && npm run build

FROM node:18-alpine
WORKDIR /app
COPY Backend ./Backend
COPY --from=build /app/client/dist ./client/dist
WORKDIR /app/Backend
RUN npm ci --omit=dev
ENV NODE_ENV=production
CMD ["npm", "start"]
```

Then create a Render Web Service from the repo, set Docker build, and add the same env vars.

## 🧠 Future Improvements

- Razorpay signature verification + webhooks for tamper‑proof payments
- End‑to‑end tests (API + UI) and load testing
- Granular roles/permissions and audit logs
- Presigned upload flow with antivirus scanning
- Pagination and advanced filtering in admin lists
- Metrics/observability (req timing, error rates, job durations)
- Multi‑printer routing and device integration
- PWA enhancements (offline queue, installable app)

## 📝 License

Distributed under the ISC License. See `LICENSE` for details.

## 🙌 Acknowledgements

- React, Vite, Tailwind CSS
- Node.js, Express, Mongoose, MongoDB
- Cloudinary, Razorpay, Nodemailer
- Shields.io for badges
