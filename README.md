# Digi-Class

Digi-Class is a modern, full-stack Virtual Classroom Application built to seamlessly connect teachers and students. It offers an interactive platform with live video conferencing, real-time updates, classroom management, and streamlined assignment handling.

---

## 🚀 Modules Implemented

### 1. Authentication & Security
- **Secure Onboarding:** User sign-up, login, and robust session management using **NextAuth.js**.
- **Email Verification:** Account activation via email implemented using **Nodemailer** (SMTP).
- **Security Recovery:** Robust password reset workflow.
- **Role-Based Access Control:** Distinct experiences and permissions for `TEACHER` and `STUDENT` roles.

### 2. Classroom Management
- **Create & Join:** Teachers can create classrooms with unique access codes that students can use to join.
- **Dashboard Interface:** Dynamic classroom dashboard showcasing class details, subjects, and participant lists.
- **Interactive Modals:** Streamlined UI for creating announcements and assignments without leaving the page.
- **Teacher Settings:** A dedicated settings page allowing teachers to manage classroom configurations and member lists.

### 3. Live Video Conferencing (Virtual Classrooms)
- **Live Sessions:** Integrated real-time video and audio communication.
- **Client-Side Rendering:** Optimized dynamic imports to handle "window is not defined" issues and to ensure a smooth WebRTC experience within Next.js App Router.
- **Full-Screen Responsive UI:** A rich, responsive UI designed to display all participants clearly.

### 4. Database & ORM Setup
- **PostgreSQL & Prisma Engine:** Configured dynamic relationships for Users, Classrooms, Subjects, Assignments, Submissions, and Video Sessions.

---

## 🚧 Modules In Progress / Planned (Roadmap)

### 1. Assignments & Grading Engine
- **File Uploads:** Integrating **Cloudinary** for secure student assignment submissions.
- **Submission Tracking:** Real-time tracking of submission status (`PENDING`, `SUBMITTED`, `EVALUATED`).
- **Grading & Feedback:** Teacher interface for evaluating assignments and providing individual feedback.

### 2. Live Class Enhancements via Socket.io
- **Real-time Chat:** Implementing Socket.io to allow in-class instant messaging alongside video streams.
- **Live Notifications:** System-wide push notifications for new announcements and upcoming deadlines.
- **Automated Attendance:** Tracking student join times during live sessions to automate attendance logs.

### 3. Study Material & Notes Sharing
- **Centralized Repository:** Teachers can upload subject-specific notes.
- **Cloud Storage Analytics:** Tracking user storage usage limit (via the `StorageUsage` schema) to maintain cloud quotas.

### 4. Advanced Analytics & Dashboard
- **Student Performance Tracking:** Visual progress metrics and assignment completion rate graphs.
- **Teacher Summaries:** A high-level overview of class engagement and upcoming schedules.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** PostgreSQL edge compatibility
- **ORM:** Prisma Client
- **Authentication:** NextAuth.js & bcryptjs
- **Media & File Storage:** Cloudinary
- **Real-time Comms:** Socket.io
- **Email Delivery:** Nodemailer
- **Styling:** Tailwind CSS (v4) & Lucide Icons

---

## Getting Started

First, ensure you have your exact `.env` credentials setup (Database URL, NextAuth secret, SMTP configs, Cloudinary URL, etc.).

Then, run the development server:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
