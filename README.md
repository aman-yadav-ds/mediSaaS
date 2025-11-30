# Hospital Management SaaS

A comprehensive, cloud-based Hospital Management System designed to streamline operations for healthcare facilities of all sizes. This platform offers a robust suite of tools for patient management, doctor workflows, billing, and pharmacy management, all secured by enterprise-grade data isolation.

## Features

-   **Multi-Tenant Architecture**: Securely hosts multiple hospitals on a single platform with strict data isolation.
-   **Role-Based Access Control**: tailored dashboards for Doctors, Nurses, Receptionists, and Administrators.
-   **Patient Management**: Complete digital health records, including vitals, history, and visits.
-   **Billing & Invoicing**: Integrated billing system supporting multiple payment methods and insurance.
-   **Pharmacy & Prescriptions**: Digital prescription management and inventory tracking (Not implemented yet).
-   **Real-time Updates**: Live dashboard updates for queue management and patient status.

## Technology Stack

-   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), React 19
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/)
-   **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Authentication**: Supabase Auth
-   **State Management**: React Hooks & Context

## Database Schema & Security

This application leverages **Supabase Row Level Security (RLS)** to ensure strict data privacy and multi-tenancy.

### Schema Overview

The core of the multi-tenant architecture is the `hospitals` table. Every other major entity in the system (patients, visits, invoices, etc.) is linked to a specific `hospital_id`.

Key tables include:
-   `hospitals`: Stores tenant (hospital) information.
-   `profiles`: Extends Supabase Auth users, linking them to a specific `hospital_id` and assigning a `role` (owner, doctor, nurse, receptionist).
-   `patients`: Patient records linked to a hospital.
-   `visits`, `prescriptions`, `invoices`: Transactional data, all scoped by `hospital_id`.

### Row Level Security (RLS)

We utilize PostgreSQL's Row Level Security to enforce data isolation at the database layer. This ensures that a user logged into "Hospital A" can **never** access data belonging to "Hospital B", regardless of the API query made.

**How it works:**

1.  **User Authentication**: When a user logs in, Supabase issues a JWT containing their user ID.
2.  **Profile Lookup**: RLS policies first check the `profiles` table to determine which `hospital_id` the authenticated user belongs to.
3.  **Policy Enforcement**: Every table has policies that compare the record's `hospital_id` with the user's `hospital_id`.
    *   *Example Policy Logic*: `SELECT * FROM patients WHERE hospital_id = (SELECT hospital_id FROM profiles WHERE id = auth.uid())`

This approach guarantees that data security is baked into the database engine itself, providing a robust foundation for a SaaS platform.

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/aman-yadav-ds/mediSaaS.git
    ```

2.  **Install dependencies**
    ```bash
    npm install 
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory. You can use `.env.example` as a reference. You will need your Supabase project credentials.
    ```bash
    cp .env.example .env.local
    ```
    *Fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.*

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Creator

**Amandeep Yadav**
