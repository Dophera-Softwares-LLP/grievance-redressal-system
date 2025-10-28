// setup-db.js
import { query } from "./src/config/db.js";

async function setup() {
  try {
    console.log("🚀 Creating tables...");

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'student',
        roll_number TEXT,
        mentor_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        status TEXT DEFAULT 'open',
        student_id INTEGER REFERENCES users(id) NOT NULL,
        current_assignee_id INTEGER REFERENCES users(id),
        attachment_url TEXT,
        due_at TIMESTAMP,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(current_assignee_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_student  ON tickets(student_id);

      INSERT INTO categories (name) VALUES
        ('Academic'), ('Hostel'), ('Mess'), ('Laundry'),
        ('Harassment'), ('Disciplinary'), ('Transport')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log("✅ Tables created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
}

setup();