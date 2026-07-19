const Database = require("better-sqlite3");

const db = new Database("data.db");

const result = db.prepare(`
    DELETE FROM users
    WHERE email = ?
`).run("user@example.com");

console.log(`Deleted ${result.changes} user(s).`);

db.close();