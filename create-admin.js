const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");

const db = new Database("data.db");

const password = "admin123";

const hashedPassword = bcrypt.hashSync(password, 10);

const result = db.prepare(`
    INSERT INTO users (email, password, role)
    VALUES (?, ?, ?)
`).run(
    "admin3@unique.com",
    hashedPassword,
    "admin"
);

console.log("Admin account created!");

db.close();