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

---

## Stage 2: Persistent Storage Choice and Schema Design

### Database Choice
- **Choice**: PostgreSQL.
- **Rationale**: Relational data, strong consistency, and support for JSONB if needed.

### Schema
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
