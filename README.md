# One Promise Photography Booking System

![One Promise Logo](./wedding-frontend/public/one%20promise%20logo%20white.png)

A comprehensive, internal booking and agreement management system designed for **One Promise Wedding Photography**. This application streamlines the client onboarding process, from order creation to digital agreement signing, automated PDF generation, team assignment with overlap prevention, and location management.

## 🚀 Core Features

### 📅 Order & Event Management

- **Comprehensive Details**: Manage client info, event dates, and dynamic locations.
- **Unified Events Calendar**: A master calendar view that combines automated bookings from orders with manual availability blocks.
- **Manual Event Management**: Admins can manually add or delete events for specific days (e.g., maintenance, holidays, or private bookings).
- **Overlap Prevention**: Intelligent logic that prevents manual bookings on days already occupied by orders or other manual events.
- **Dynamic Pricing Engine**: Full database control over packages, add-ons, and fixed discounts.
- **Location Library (Unified)**: Select from a pre-built library of Sri Lankan venues (Province/District/Venue) or enter locations manually with Google Maps links.
- **Google Calendar Integration**: Automatically syncs events to the admin's calendar with full package details and location maps.

### 🤝 Team Assignment & Intelligence

- **Team Assignment**: Assign photographers, editors, and other roles to specific event dates.
- **Overlap Prevention**: Intelligent logic that prevents double-booking team members on the same day.
- **Auto-Notifications**: Automatically sends email notifications to team members upon assignment.

### 📜 Agreement Workflow & Client Portal

- **Unified Client Portal**: A secure, glassmorphic portal for clients to manage their journey.
- **Progress Tracker**: A 10-step visual milestone bar (from "Agreement & Payment" to "Archive & Complete").
- **Digital Signing**: Secure workflow for clients to review and sign agreements electronically.
- **Smart PDF Generation**: Instantly generates professional PDF agreements with full TOS and pricing breakdowns.
- **Robust Data Validation**: Multi-layered validation using **Zod** (request schemas) and **Mongoose** (model-level constraints) to ensure data integrity.
- **Automated Sanitization**: Model-level `pre('validate')` hooks automatically clean inputs (e.g., phone numbers) to prevent validation failures on legacy or formatted data.
- **Payment Verification System**: Secure end-to-end workflow where clients upload proofs (PNG, JPG, PDF) with immediate success feedback, and administrators verify them via a dedicated dashboard.
- **Enhanced Validation UX**: High-fidelity, submit-triggered validation system across all forms with localized red highlights and specifying-toast notifications for missing mandatory data.

### 📊 Reports & Advanced Analytics (NEW)

- **Financial Performance**: Real-time tracking of revenue, average order value, and discount impact.
- **Operational Insights**: Booking success rates, monthly trends, and package popularity analysis.
- **Resource Utilization**: Data-driven visibility into team member workload and role distribution.
- **Geographic Intel**: Analysis of venue popularity and geographical distribution across Sri Lanka using Recharts-backed data visualization.

### 🎓 Academic Excellence & Standards

- **Modular Stability**: Strict adherence to a feature-based architecture, ensuring isolated module development and easy scalability.
- **Full-Stack Type Safety**: Shared TypeScript interfaces and automated API response types ensuring consistent data flow between the Node.js backend and React frontend.

---

## 🛠 Tech Stack (MERN)

- **Frontend**: [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Email Service**: [Nodemailer](https://nodemailer.com/)
- **PDF Engine**: [@react-pdf/renderer](https://react-pdf.org/)
- **Data Visualization**: [Recharts](https://recharts.org/) for business intelligence dashboards.
- **Components**: [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)

---

## 📂 Project Architecture (Modular Split)

The system has been refactored into a feature-based architecture to support independent development by 4 team members.

### Backend (`wedding-backend/src/modules`)

- **Core**: Auth, Shared models, and Middleware.
- **Booking**: Order creation and Pricing engine.
- **Agreement**: Agreement status and Portal token logic.
- **Team-Location**: Team assignments and Location management.

### Frontend (`wedding-frontend/src/features`)

- **Shared**: Centralized API, Types, Utils, and Global constants.
- **Booking**: `OrdersPage`, `OrderForm`, `PricingPage`.
- **Agreement**: `AgreementsPage`, `ClientPortal`, `ProgressTracker`.
- **Events**: `EventsPage` (Calendar View), `OrderDetailPage`.
- **Reports**: `ReportsPage` (Analytics Dashboard with interactive charts).
- **Team-Location**: `TeamPage`, `LocationPage`, `AssignmentTools`.

---

## 👥 Team Collaboration Split

This project is divided into 4 main modules. Each member is responsible for their designated feature folder in both frontend and backend.

| Member | Responsibility | Core Directory |
| :--- | :--- | :--- |
| **Lead Developer** | **Base System & Booking** | `features/booking`, `modules/booking` |
| **Member 2** | **Agreements & Portal** | `features/agreement`, `modules/agreement` |
| **Member 3** | **Events & Orders** | `features/events`, `modules/core` (Order details) |
| **Member 4** | **Team & Locations** | `features/team-location`, `modules/team-location` |

### 🛠 Workflow for Members

1. **Create a Branch**: `git checkout -b feature/your-name-module`
2. **Work Independently**: Only modify files within your assigned feature/module folders.
3. **Shared Resources**: If you need to change a shared utility or type, coordinate with the Lead Developer.
4. **Pull Request**: Push your branch and create a PR to the `main` branch.
5. **Merge**: Once the PR is merged, the system will integrate your component seamlessly.

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- pnpm installed globally (`npm i -g pnpm`)
- MongoDB (Local or Atlas)
- SMTP Credentials (for Gmail/SES)

### Installation & Development

1. **Clone & Backend Setup**:

   ```bash
   cd wedding-backend
   pnpm install
   # Create a .env file by copying .env.example
   cp .env.example .env
   # Edit .env with your credentials (see below)
   pnpm dev
   ```

2. **Frontend Setup**:

   ```bash
   cd ../wedding-frontend
   pnpm install
   pnpm dev
   ```

### ⚠️ Troubleshooting common issues

If you encounter a `[vite] http proxy error` with `ECONNREFUSED` on the frontend, it almost always means the **backend script has crashed**. Please check your backend terminal for errors.

**Common Backend Crashes:**

- **MongoDB Connection Failure**: If you get a `querySrv ECONNREFUSED` error:
  1. Ensure you have **whitelisted your IP** in the MongoDB Atlas dashboard.
  2. Check if your current network (e.g., library/public Wi-Fi) blocks SRV lookups.
  3. Ensure your `MONGODB_URI` in `.env` is correct.

- **Missing .env**: Make sure you have created the `.env` file in the `wedding-backend` directory and filled it with valid credentials.

### Environment Configuration

#### Backend (`wedding-backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`wedding-frontend/.env`)

Vite uses path aliases for modular imports. The main API endpoints are proxied via `vite.config.ts`.

---

## 📄 License

Private - One Promise Wedding Photography.
