const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");

const db = new Database("data.db");

const hashedPassword = bcrypt.hashSync("admin123", 10);

db.prepare(`
    UPDATE users
    SET password = ?
    WHERE email = ?
`).run(hashedPassword, "admin@unique.com");

console.log("Admin password converted to bcrypt!");

db.close();