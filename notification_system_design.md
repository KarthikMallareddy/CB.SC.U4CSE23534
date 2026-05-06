# Campus Notification System Design

## Stage 1: REST API Design and Real-time Mechanism

### API Endpoints
1. `GET /api/v1/notifications`
   - Fetch notifications with pagination and filters.
   - Query Params: `page`, `limit`, `type`, `status`.
2. `PATCH /api/v1/notifications/:id/read`
   - Mark a specific notification as read.
3. `POST /api/v1/notifications/read-all`
   - Mark all notifications as read for the user.

### Real-time Mechanism
- **Choice**: Server-Sent Events (SSE).
- **Rationale**: Notifications are unidirectional (Server -> Client). SSE is lighter than WebSockets and handles reconnection automatically.

