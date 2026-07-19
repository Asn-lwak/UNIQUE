const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");

const db = new Database("data.db");


// Create users table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
`).run();


const password = "admin123";

const hashedPassword = bcrypt.hashSync(password, 10);


try {

    db.prepare(`
        INSERT INTO users (email, password, role)
        VALUES (?, ?, ?)
    `).run(
        "admin3@unique.com",
        hashedPassword,
        "admin"
    );

    console.log("✅ Admin account created!");

} catch (error) {

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        console.log("⚠️ Admin already exists!");
    } else {
        console.log(error);
    }

}


db.close();