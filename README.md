# One Promise Photography Booking System

![One Promise Logo](./wedding-frontend/public/one%20promise%20logo%20Black.png)

A high-fidelity, industrial-grade wedding booking and lifecycle management system custom-engineered for **One Promise Wedding Photography**. This application orchestrates the entire photography production pipeline—from initial inquiry and automated branding to legal agreement compliance, financial tracking, and team deployment.

---

## 🚀 Core Features

### 📅 Advanced Booking & Intelligence

- **Intelligent Order Numbering**: Automatically generates sequential, year-aware IDs (e.g., `OPW-2026-001`) with model-level encapsulation.
- **Dynamic Pricing Engine**: Granular control over packages, professional add-ons, and fixed/percentage-based discounts.
- **Unified Events Calendar**: Combines automated booking dates with manual "Availability Blocks" for the studio.
- **Manual Event Management**: Admins can block specific days (maintenance, private shoots) with real-time overlap prevention logic.

### 📜 Digital Agreement & Portal Workflow

- **Glassmorphic Client Portal**: A secure, visual environment where clients track their media production journey.
- **Branded Digital Signature**: Secure online signing with immediate transition to the financial onboarding phase.
- **Payment Verification Cycle**: Clients upload receipts (via Cloudinary) directly through the portal with real-time status feedback.
- **Smart PDF Generation**: Dynamic rendering of professional legal agreements with integrated TOS and pricing breakdowns.

### 📧 Automated Branding & Communication (NEW)

- **High-Fidelity Email System**: Automatically dispatches designer-grade HTML emails for every major milestone.
- **Lifecycle Triggers**:
  - **Welcome Email**: Sent instantly upon order creation with tracking tokens.
  - **Payment Request**: Automatically sends mock bank details and advance payment instructions (Rs. 25,000/-) after signing.
  - **Milestone Alerts**: 10-step progress updates (e.g., "Media Ingested", "Color Grading") sent automatically as editors advance the project.
  - **Verification Receipts**: Instant branded confirmation for payment approvals or re-upload requests.

### 📊 Real-Time Financial Intelligence

- **Financial Lookup Dashboard**: Admin-only lookup tool to see granular payment breakdowns (Paid, Balance, Overall) for any specific order.
- **Geographic distribution**: View venue density across Sri Lanka's provinces and districts using interactive data visualizations.
- **Operational Analytics**: Recharts-backed visibility into revenue trends, package performance, and discount distribution.

### 🤝 Team Deployment & Conflict Prevention

- **Location-Aware Assignments**: Assign photographers and editors based on venue data.
- **Double-Booking Protection**: Advanced backend validation prevents assigning staff members to overlapping event dates.
- **Staff Notifications**: Automated email alerts to team members specifying event details, dates, and client requirements.

---

## 🛠 Tech Stack (MERN Core)

- **Frontend**: [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Architecture**: [Shadcn/UI](https://ui.shadcn.com/) + [Framer Motion](https://www.framer.com/motion/) + [Radix UI](https://www.radix-ui.com/)
- **Backend**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Storage**: [Cloudinary](https://cloudinary.com/) (Secure Media & Receipt Handling)
- **Communication**: [Nodemailer](https://nodemailer.com/) + Custom HTML Templating Engine
- **Validation**: [Zod](https://zod.dev/) (Runtime schemas) + [React Hook Form](https://react-hook-form.com/)

---

## 📂 Modular Architecture

The system utilizes a **Feature-Based Architecture**, isolating logic into discrete modules to ensure scalability and maintainability.

### Module Split

- **`booking`**: Order orchestration, pricing logic, and sequential ID generation.
- **`agreement`**: Digital signature workflow, token management, and payment verification.
- **`team-location`**: Staff deployment, venue library management, and overlap detection.
- **`reports`**: Financial lookup tools and Recharts-driven business intelligence.

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm i -g pnpm`)
- MongoDB Atlas Account
- Cloudinary Account (for payment proof storage)

### Installation

1. **Backend Configuration**:

   ```bash
   cd wedding-backend
   pnpm install
   cp .env.example .env # Configure variables in .env
   pnpm dev
   ```

2. **Frontend Configuration**:

   ```bash
   cd ../wedding-frontend
   pnpm install
   pnpm dev
   ```

### Environment Configuration (.env)

Required keys for full system functionality:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secure_hex_key
EMAIL_USER=onepromiseweddings.notify@gmail.com
EMAIL_PASS=smtp_app_password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:5173
```

---

## 📄 License

Private Intellectual Property - One Promise Wedding Photography.
Internal use only for University Assessment & Deployment.
