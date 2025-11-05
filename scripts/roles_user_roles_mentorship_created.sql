-- 1️⃣ Roles table
CREATE TABLE roles (
  id SMALLSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

-- 2️⃣ UserRoles table
CREATE TABLE user_roles (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  role_id SMALLINT REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- 3️⃣ Mentorship table
CREATE TABLE mentorship (
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  mentor_id  BIGINT REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, mentor_id)
);