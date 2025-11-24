import Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  const migrations = [
    {
      id: 1,
      name: 'create_initial_tables',
      up: `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          user_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
      `,
    },
  ];

  const getMigrationTableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'
  `);

  const migrationTableExists = getMigrationTableExists.get();

  if (!migrationTableExists) {
    db.exec(`
      CREATE TABLE migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  const getAppliedMigrations = db.prepare('SELECT id FROM migrations');
  const appliedMigrations = getAppliedMigrations.all() as Array<{ id: number }>;
  const appliedIds = new Set(appliedMigrations.map((m) => m.id));

  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      console.log(`Running migration ${migration.id}: ${migration.name}`);
      db.exec(migration.up);
      const insertMigration = db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)');
      insertMigration.run(migration.id, migration.name);
      console.log(`Migration ${migration.id} completed`);
    }
  }
}
