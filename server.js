const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

app.use(session({
    secret: "unique-secret-key",
    resave: false,
    saveUninitialized: false
}));

const db = new Database("data.db");

const PORT = process.env.PORT || 3000;

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// Allow Express to read form data
app.use(express.urlencoded({ extended: true }));

// Serve files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Register route
app.post("/register", async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUser = db.prepare(`
            INSERT INTO users (email, password, role)
            VALUES (?, ?, ?)
        `);

        insertUser.run(email, hashedPassword, "user");

        console.log("New user registered:", email);

        res.send("Registration successful!");

    } catch (error) {

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            res.send("This email is already registered!");
        } else {
            res.send("Something went wrong!");
        }

    }

});

//Login Route
app.post("/login", async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    const user = db.prepare(`
        SELECT * FROM users
        WHERE email = ?
    `).get(email);

    if (!user) {
        return res.send("User not found!");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatches) {
        return res.send("Incorrect password!");
    }

    req.session.user = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    if (user.role === "admin") {

        res.redirect("/admin.html");

    } else {

        res.redirect("/");

    }

});

function requireAdmin(req, res, next) {

    if (!req.session.user) {
        return res.status(401).send("You must be logged in!");
    }

    if (req.session.user.role !== "admin") {
        return res.status(403).send("Access denied!");
    }

    next();

}

app.get("/admin/users", requireAdmin, (req, res) => {

    const users = db.prepare(`
        SELECT id, email, role
        FROM users
    `).all();

    res.json(users);

});


app.get("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.send("Could not log out.");
        }

        res.redirect("/login.html");

    });

});

app.delete("/admin/delete-user/:id", requireAdmin, (req, res) => {

    const userId = req.params.id;

    const user = db.prepare(`
        SELECT * FROM users
        WHERE id = ?
    `).get(userId);

    if (!user) {
        return res.send("User not found!");
    }

    if (user.role === "admin") {
        return res.send("Admin accounts are protected!");
    }

    db.prepare(`
        DELETE FROM users
        WHERE id = ?
    `).run(userId);

    res.send("User deleted successfully!");

});

app.get("/api/current-user", (req, res) => {

    if (!req.session.user) {
        return res.json({
            loggedIn: false
        });
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });

});

app.post("/contact", (req, res) => {

    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    db.prepare(`
        INSERT INTO messages (name, email, message)
        VALUES (?, ?, ?)
    `).run(
        name,
        email,
        message
    );

    res.send("Message sent successfully!");

});

app.get("/admin/messages", requireAdmin, (req, res) => {

    const messages = db.prepare(`
        SELECT * FROM messages
        ORDER BY created_at DESC
    `).all();

    res.json(messages);

});

app.delete(
    "/admin/delete-message/:id",
    requireAdmin,
    (req, res) => {

        const id = req.params.id;

        db.prepare(`
            DELETE FROM messages
            WHERE id = ?
        `).run(id);

        res.send("Message deleted successfully!");

    }
);

app.listen(PORT, () => {

    console.log(
        `🚀 Server running at http://localhost:${PORT}`
    );

});