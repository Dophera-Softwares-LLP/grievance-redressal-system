-- 1) ticket_assignments: who currently handles the ticket
CREATE TABLE IF NOT EXISTS ticket_assignments (
  id          BIGSERIAL PRIMARY KEY,
  ticket_id   BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  role_id     SMALLINT NOT NULL REFERENCES roles(id),
  user_id     BIGINT REFERENCES users(id),
  action      TEXT NOT NULL DEFAULT 'assign', -- assign|escalate|transfer|resolve|extend
  note        TEXT,
  due_at      TIMESTAMPTZ,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  is_current  BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2) attachments: many files per ticket
CREATE TABLE IF NOT EXISTS attachments (
  id            BIGSERIAL PRIMARY KEY,
  ticket_id     BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  uploaded_by   BIGINT NOT NULL REFERENCES users(id),
  url           TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'ticket', -- ticket|assignment|resolution
  assignment_id BIGINT REFERENCES ticket_assignments(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
