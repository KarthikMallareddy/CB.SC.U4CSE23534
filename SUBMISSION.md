# Campus Notification Platform - Final Submission

This document consolidates all components required for the evaluation: Architecture, Code, and Evidence of Functionality (Screenshots).

## 1. Architecture Design
The full architectural design, including Stage 1-7 design decisions, schema, and reliability strategies, is documented in `notification_system_design.md`.

### Core Components:
- **Backend (Express/TS)**: Located in `/notification_app_be`. Handles proxying, auth caching, and strict limit validation (5-10).
- **Frontend (Next.js/MUI)**: Located in `/notification_app_fe`. Features a premium Material UI dashboard with real-time viewed status and priority filtering.
- **Middleware (NPM Package)**: Located in `/logging_middleware`. A reusable telemetry layer for the evaluation service.

## 2. Evidence of Functionality
Screenshots are located in the `submission/screenshots/` folder:
- `main_notifications.png`: The main dashboard view.
- `priority_filters.png`: View demonstrating limit and type filtering.
- `api_response.png`: Raw JSON response from the proxy backend.

## 3. How to Run for Evaluation

### Backend
1. `cd notification_app_be`
2. `npm install`
3. `npm run dev` (Runs on port 5000)

### Frontend
1. `cd notification_app_fe`
2. `npm install`
3. `npm run dev` (Runs on port 3000)

---
**Prepared by Antigravity AI**
*Campus Notification Platform - Production Grade Solution*
