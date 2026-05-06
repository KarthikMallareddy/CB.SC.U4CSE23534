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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

---

## Stage 3: Query Analysis and Performance Optimization

### Analysis
- High volume of `is_read=false` queries.
- Pagination is essential to avoid large payloads.

### Optimization
- Composite index on `(user_id, is_read, created_at DESC)`.
- Use `LIMIT` and `OFFSET` for pagination.

---

## Stage 4: Performance Improvement Strategy (Caching)

### Strategy
- Use **Redis** to cache the count of unread notifications per user.
- Cache the latest 20 notifications for frequent access.
- Invalidate cache on new notification arrival or status change.

---

## Stage 5: Reliability and Redesign (Event-Driven)

### Architecture
- Use a Message Broker (e.g., **RabbitMQ** or **Kafka**).
- Producers: Services (Placement, Exam, Event).
- Consumers: Notification Service.
- **Retry Logic**: Exponential backoff for failed delivery to the notification service.

---

## Stage 6: External Evaluation Service API Contract
