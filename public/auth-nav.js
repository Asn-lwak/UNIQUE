fetch("/api/current-user")
    .then(response => response.json())
    .then(data => {

        const nav = document.querySelector("nav");

        if (!nav) {
            return;
        }

        if (!data.loggedIn) {

            nav.innerHTML = `
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="contact.html">Contact</a>
                <a href="login.html">Login</a>
                <a href="register.html">Register</a>
            `;

            return;
        }

        const user = data.user;

        nav.innerHTML = `
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
            <a href="profile.html">Profile</a>

            ${
                user.role === "admin"
                    ? `<a href="admin.html">Admin Dashboard</a>`
                    : ""
            }

            <a href="/logout">Logout</a>
        `;

    });